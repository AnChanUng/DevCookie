package com.csstudy.backend;

import com.csstudy.backend.service.JavaRunner;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

// 코딩 문제 채점기: 정상 코드는 실행되고, 파일 · 프로세스 · 환경변수 · 리플렉션은 실행 전에 막히는지 본다
class JavaRunnerTest {

    private final JavaRunner runner = new JavaRunner();

    private JavaRunner.Result run(String solution) {
        String main = """
                import java.util.*;
                import java.util.function.*;
                public class Main {
                    public static void main(String[] args) {
                        Supplier<Object> s = () -> new Solution().solution(new int[]{3, 1, 2});
                        System.out.println("@@" + Arrays.deepToString(new Object[]{s.get()}));
                    }
                }
                """;
        return runner.run(Map.of("Solution.java", solution, "Main.java", main), "Main");
    }

    @Test
    void ordinarySolutionRuns() {
        JavaRunner.Result r = run("""
                import java.util.*;
                import java.util.stream.*;
                class Solution {
                    record P(int a) {}
                    public int solution(int[] arr) {
                        List<Integer> list = Arrays.stream(arr).boxed().sorted().collect(Collectors.toList());
                        Map<String, Integer> m = new HashMap<>();
                        m.put("k" + list.get(0), new P(list.get(2)).a());
                        switch ("x") { case "x" -> m.merge("k1", 1, Integer::sum); default -> {} }
                        return m.get("k1");
                    }
                }
                """);
        assertEquals("ok", r.status(), r.message() + r.stderr() + r.errors());
        assertEquals("@@[4]", r.stdout().trim());
    }

    @Test
    void compileErrorsAreReported() {
        JavaRunner.Result r = run("class Solution { public int solution(int[] a) { return a.length } }");
        assertEquals("compile_error", r.status());
        assertFalse(r.errors().isEmpty());
        assertEquals("Solution.java", r.errors().get(0).file());
    }

    @Test
    void dangerousApisAreBlocked() {
        String[] bodies = {
                "try { Runtime.getRuntime().exec(\"ls\"); } catch (Exception e) {} return 0;",
                "return System.getenv(\"DATABASE_URL\").length();",
                "return System.getProperty(\"user.home\").length();",
                "try { new java.io.PrintStream(\"x.txt\").println(1); } catch (Exception e) {} return 0;",
                "try { return java.nio.file.Files.readString(java.nio.file.Path.of(\"/proc/1/environ\")).length(); } catch (Exception e) { return 0; }",
                "try { return Class.forName(\"java.lang.Runtime\").hashCode(); } catch (Exception e) { return 0; }",
                "new Thread(() -> {}).start(); return 0;",
                "java.util.function.Function<String, String> f = System::getenv; return 0;",
                "try { return java.lang.invoke.MethodHandles.lookup().findClass(\"java.lang.Runtime\").hashCode(); } catch (Exception e) { return 0; }",
                "\\u0052untime.getRuntime(); return 0;",
        };
        for (String body : bodies) {
            JavaRunner.Result r = run("class Solution { public int solution(int[] a) { " + body + " } }");
            assertEquals("blocked", r.status(), body + " → " + r.status() + " " + r.stdout() + r.errors());
        }
    }

    @Test
    void infiniteLoopTimesOut() {
        JavaRunner.Result r = run("class Solution { public int solution(int[] a) { while (true) { } } }");
        assertEquals("timeout", r.status());
    }

    @Test
    void runtimeExceptionIsReported() {
        JavaRunner.Result r = run("class Solution { public int solution(int[] a) { return a[5]; } }");
        assertEquals("runtime_error", r.status());
        assertTrue(r.stderr().contains("ArrayIndexOutOfBounds"));
    }
}
