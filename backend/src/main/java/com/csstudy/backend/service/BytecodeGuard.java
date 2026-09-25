package com.csstudy.backend.service;

import java.io.DataInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

// 채점용으로 받은 코드가 컴파일된 뒤, 실행하기 전에 .class 파일의 상수 풀을 읽어 쓰는 클래스와 멤버를 검사한다.
// 소스 문자열이 아니라 바이트코드를 보므로 유니코드 이스케이프나 완전한 이름으로 돌려 쓰는 우회가 통하지 않는다.
// 코딩테스트 풀이에 필요한 것(문자열, 수학, 컬렉션, 스트림, 표준 입출력)만 허용하고
// 파일 · 네트워크 · 프로세스 · 스레드 · 리플렉션 · 환경변수 · 시스템 속성은 모두 막는다.
public final class BytecodeGuard {

    private BytecodeGuard() {}

    private static final Set<String> JAVA_LANG = Set.of(
            "Object", "String", "StringBuilder", "StringBuffer", "Math", "StrictMath",
            "Integer", "Long", "Short", "Byte", "Double", "Float", "Character", "Boolean", "Number", "Void",
            "Comparable", "CharSequence", "Iterable", "AutoCloseable", "Cloneable", "Appendable", "Readable",
            "Enum", "Record", "System", "Throwable", "Override", "FunctionalInterface", "SafeVarargs",
            "SuppressWarnings", "Deprecated", "Character$UnicodeScript");

    private static final Set<String> SPECIAL = Set.of(
            "java/lang/invoke/LambdaMetafactory", "java/lang/invoke/StringConcatFactory",
            "java/lang/invoke/MethodHandles", "java/lang/invoke/MethodHandles$Lookup", "java/lang/runtime/ObjectMethods",
            "java/lang/runtime/SwitchBootstraps");

    private static final Set<String> JAVA_IO = Set.of(
            "PrintStream", "PrintWriter", "BufferedReader", "BufferedWriter", "InputStreamReader",
            "OutputStreamWriter", "InputStream", "OutputStream", "Reader", "Writer", "StringReader",
            "StringWriter", "IOException", "UncheckedIOException", "EOFException", "Serializable",
            "Closeable", "Flushable");

    private static final List<String> JAVA_UTIL_BLOCKED = List.of(
            "java/util/concurrent/", "java/util/logging/", "java/util/prefs/", "java/util/jar/",
            "java/util/zip/", "java/util/spi/", "java/util/ServiceLoader", "java/util/Timer",
            "java/util/ResourceBundle", "java/util/Properties");

    // 람다 · 문자열 연결 · 레코드 · switch가 컴파일되며 쓰는 부트스트랩 메서드. 이 밖의 java.lang.invoke 호출은 막는다
    private static final Set<String> BOOTSTRAPS = Set.of(
            "metafactory", "altMetafactory", "makeConcatWithConstants", "makeConcat", "bootstrap", "typeSwitch", "enumSwitch");

    // System에서 쓸 수 있는 멤버. getenv · getProperty · exit · load 같은 것은 모두 막는다
    private static final Set<String> SYSTEM_MEMBERS = Set.of(
            "out", "err", "in", "arraycopy", "currentTimeMillis", "nanoTime", "lineSeparator", "identityHashCode");

    // 생성자에 파일 이름(String)을 받으면 파일을 만드는 클래스들
    private static final Set<String> FILE_CONSTRUCTORS = Set.of(
            "java/io/PrintStream", "java/io/PrintWriter", "java/util/Formatter");

    /** 문제가 없으면 null, 막아야 하면 사람이 읽을 이유를 돌려준다. own은 제출 코드가 만든 클래스 이름들이다. */
    public static String check(InputStream classFile, Set<String> own) throws IOException {
        DataInputStream in = new DataInputStream(classFile);
        if (in.readInt() != 0xCAFEBABE) return "올바른 클래스 파일이 아닙니다.";
        in.readUnsignedShort();
        in.readUnsignedShort();
        int count = in.readUnsignedShort();
        String[] utf8 = new String[count];
        int[] classNameIndex = new int[count];
        int[][] memberRef = new int[count][];   // {classIndex, nameAndTypeIndex}
        int[][] nameAndType = new int[count][]; // {nameIndex, descriptorIndex}
        for (int i = 1; i < count; i++) {
            int tag = in.readUnsignedByte();
            switch (tag) {
                case 1 -> utf8[i] = in.readUTF();
                case 3, 4 -> in.readInt();
                case 5, 6 -> { in.readLong(); i++; }
                case 7 -> classNameIndex[i] = in.readUnsignedShort();
                case 8, 16, 19, 20 -> in.readUnsignedShort();
                case 9, 10, 11 -> memberRef[i] = new int[]{in.readUnsignedShort(), in.readUnsignedShort()};
                case 12 -> nameAndType[i] = new int[]{in.readUnsignedShort(), in.readUnsignedShort()};
                case 15 -> { in.readUnsignedByte(); in.readUnsignedShort(); }
                case 17, 18 -> in.readInt();
                default -> { return "알 수 없는 상수 풀 형식입니다."; }
            }
        }
        for (int i = 1; i < count; i++) {
            if (classNameIndex[i] != 0) {
                String name = utf8[classNameIndex[i]];
                if (!allowedClass(name, own)) return "사용할 수 없는 클래스입니다: " + name.replace('/', '.');
            }
        }
        for (int i = 1; i < count; i++) {
            if (memberRef[i] == null) continue;
            String owner = utf8[classNameIndex[memberRef[i][0]]];
            int[] nt = nameAndType[memberRef[i][1]];
            String member = utf8[nt[0]];
            String descriptor = utf8[nt[1]];
            if (owner.equals("java/lang/System") && !SYSTEM_MEMBERS.contains(member)) {
                return "사용할 수 없는 기능입니다: System." + member;
            }
            if ((owner.startsWith("java/lang/invoke/") || owner.startsWith("java/lang/runtime/")) && !BOOTSTRAPS.contains(member)) {
                return "사용할 수 없는 기능입니다: " + owner.replace('/', '.') + "." + member;
            }
            if (FILE_CONSTRUCTORS.contains(owner) && member.equals("<init>")
                    && (descriptor.startsWith("(Ljava/lang/String;") || descriptor.contains("Ljava/io/File;"))) {
                return "파일을 여는 생성자는 사용할 수 없습니다: " + owner.replace('/', '.');
            }
        }
        return null;
    }

    static boolean allowedClass(String name, Set<String> own) {
        if (name.startsWith("[")) {
            String element = name.replaceFirst("^\\[+", "");
            if (!element.startsWith("L")) return true; // 기본형 배열
            return allowedClass(element.substring(1, element.length() - 1), own);
        }
        if (own.contains(name)) return true;
        if (SPECIAL.contains(name)) return true;
        if (name.startsWith("java/lang/")) {
            String simple = name.substring("java/lang/".length());
            if (simple.contains("/")) return false;
            return JAVA_LANG.contains(simple) || simple.endsWith("Exception") || simple.endsWith("Error");
        }
        if (name.startsWith("java/util/")) return JAVA_UTIL_BLOCKED.stream().noneMatch(name::startsWith);
        if (name.startsWith("java/math/")) return true;
        if (name.startsWith("java/io/")) return JAVA_IO.contains(name.substring("java/io/".length()));
        return false;
    }
}
