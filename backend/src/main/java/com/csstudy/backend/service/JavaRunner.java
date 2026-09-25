package com.csstudy.backend.service;

import org.springframework.stereotype.Service;

import javax.tools.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.Semaphore;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

// 코딩 문제(COS Pro 등) 채점용 자바 실행기. 받은 소스를 컴파일하고, 바이트코드 검사(BytecodeGuard)를 통과하면
// 별도 JVM에서 Main을 실행해 출력을 돌려준다. 실행 JVM은 환경변수를 비우고 메모리 · 시간 · 출력 크기를 제한한다.
@Service
public class JavaRunner {

    public static final int RUN_SECONDS = 10;
    private static final int OUTPUT_LIMIT = 64 * 1024;
    // 무료 서버 한 대에서 도는 만큼 한 번에 하나씩만 실행한다
    private final Semaphore slot = new Semaphore(1);

    public record Diagnostic(String file, long line, String message) {}

    public record Result(String status, String message, List<Diagnostic> errors,
                         String stdout, String stderr, Integer exitCode, long millis) {
        static Result of(String status, String message) {
            return new Result(status, message, List.of(), "", "", null, 0);
        }
    }

    public Result run(Map<String, String> sources, String mainClass) {
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) return Result.of("unavailable", "이 서버에는 자바 컴파일러가 없습니다.");
        try {
            if (!slot.tryAcquire(20, TimeUnit.SECONDS)) {
                return Result.of("busy", "다른 채점이 진행 중입니다. 잠시 후 다시 시도해 주세요.");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return Result.of("busy", "채점이 중단되었습니다.");
        }
        Path dir = null;
        try {
            dir = Files.createTempDirectory("javarun");
            Path src = Files.createDirectory(dir.resolve("src"));
            Path out = Files.createDirectory(dir.resolve("out"));
            List<Path> files = new ArrayList<>();
            for (Map.Entry<String, String> e : sources.entrySet()) {
                Path f = src.resolve(e.getKey());
                Files.writeString(f, e.getValue(), StandardCharsets.UTF_8);
                files.add(f);
            }

            DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
            try (StandardJavaFileManager fm = compiler.getStandardFileManager(diagnostics, Locale.KOREAN, StandardCharsets.UTF_8)) {
                List<String> options = List.of("-d", out.toString(), "-encoding", "UTF-8", "-proc:none",
                        "-nowarn", "-Xlint:none", "-g:none", "-implicit:none");
                boolean ok = compiler.getTask(null, fm, diagnostics, options, null, fm.getJavaFileObjectsFromPaths(files)).call();
                if (!ok) {
                    List<Diagnostic> errors = diagnostics.getDiagnostics().stream()
                            .filter(d -> d.getKind() == javax.tools.Diagnostic.Kind.ERROR)
                            .limit(20)
                            .map(d -> new Diagnostic(d.getSource() == null ? "" : Path.of(d.getSource().toUri()).getFileName().toString(),
                                    d.getLineNumber(), d.getMessage(Locale.KOREAN)))
                            .toList();
                    return new Result("compile_error", "컴파일 오류가 있습니다.", errors, "", "", null, 0);
                }
            }

            List<Path> classes;
            try (Stream<Path> s = Files.walk(out)) {
                classes = s.filter(p -> p.toString().endsWith(".class")).toList();
            }
            Set<String> own = new HashSet<>();
            for (Path c : classes) {
                String rel = out.relativize(c).toString().replace('\\', '/');
                own.add(rel.substring(0, rel.length() - ".class".length()));
            }
            for (Path c : classes) {
                try (InputStream in = Files.newInputStream(c)) {
                    String reason = BytecodeGuard.check(in, own);
                    if (reason != null) return Result.of("blocked", reason);
                }
            }

            return execute(out, dir, mainClass);
        } catch (IOException e) {
            return Result.of("error", "실행 준비 중 오류가 났습니다.");
        } finally {
            slot.release();
            if (dir != null) deleteQuietly(dir);
        }
    }

    private Result execute(Path classpath, Path workDir, String mainClass) throws IOException {
        String java = Path.of(System.getProperty("java.home"), "bin", "java").toString();
        ProcessBuilder pb = new ProcessBuilder(java,
                "-Xmx64m", "-Xss16m", "-XX:MaxMetaspaceSize=64m", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1",
                "-XX:-UsePerfData", "-Xshare:auto", "-Djava.awt.headless=true",
                "-Dfile.encoding=UTF-8", "-Dsun.stdout.encoding=UTF-8", "-Dsun.stderr.encoding=UTF-8",
                "-cp", classpath.toString(), mainClass);
        pb.directory(workDir.toFile());
        pb.environment().clear();
        // Windows(로컬 개발)에서는 이 값이 없으면 JVM이 뜨지 않는다. 배포 서버(Linux)에는 없는 값이다
        String systemRoot = System.getenv("SystemRoot");
        if (systemRoot != null) pb.environment().put("SystemRoot", systemRoot);
        pb.redirectInput(ProcessBuilder.Redirect.from(emptyFile(workDir)));
        long started = System.currentTimeMillis();
        Process p = pb.start();
        Capture stdout = new Capture(p.getInputStream());
        Capture stderr = new Capture(p.getErrorStream());
        stdout.start();
        stderr.start();
        boolean finished;
        try {
            finished = p.waitFor(RUN_SECONDS, TimeUnit.SECONDS);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            finished = false;
        }
        if (!finished) p.destroyForcibly();
        try {
            stdout.join(2000);
            stderr.join(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        long millis = System.currentTimeMillis() - started;
        if (!finished) {
            return new Result("timeout", RUN_SECONDS + "초 안에 끝나지 않았습니다. 무한 반복이 없는지 확인하세요.",
                    List.of(), stdout.text(), stderr.text(), null, millis);
        }
        int code = p.exitValue();
        return new Result(code == 0 ? "ok" : "runtime_error", code == 0 ? "" : "실행 중 오류로 종료되었습니다.",
                List.of(), stdout.text(), stderr.text(), code, millis);
    }

    private static java.io.File emptyFile(Path dir) throws IOException {
        Path f = dir.resolve("stdin.txt");
        Files.writeString(f, "");
        return f.toFile();
    }

    private static void deleteQuietly(Path dir) {
        try (Stream<Path> s = Files.walk(dir)) {
            s.sorted(Comparator.reverseOrder()).forEach(p -> {
                try { Files.deleteIfExists(p); } catch (IOException ignored) { }
            });
        } catch (IOException ignored) {
        }
    }

    // 출력은 앞부분만 모은다. 넘치는 부분은 읽어서 버려 프로세스가 막히지 않게 한다
    private static final class Capture extends Thread {
        private final InputStream in;
        private final ByteArrayOutputStream buf = new ByteArrayOutputStream();
        private boolean cut;

        Capture(InputStream in) {
            this.in = in;
            setDaemon(true);
        }

        @Override
        public void run() {
            byte[] chunk = new byte[8192];
            try {
                int n;
                while ((n = in.read(chunk)) != -1) {
                    synchronized (buf) {
                        int room = OUTPUT_LIMIT - buf.size();
                        if (room > 0) buf.write(chunk, 0, Math.min(n, room));
                        if (n > room) cut = true;
                    }
                }
            } catch (IOException ignored) {
            }
        }

        String text() {
            synchronized (buf) {
                String s = buf.toString(StandardCharsets.UTF_8);
                return cut ? s + "\n... (출력이 너무 길어 뒷부분을 잘랐습니다)" : s;
            }
        }
    }
}
