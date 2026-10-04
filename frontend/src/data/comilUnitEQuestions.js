// 컴퓨터일반 단원별 문제집 E: 프로그래밍 언어론·C(pl1) 15문항 + Java·Python·객체지향(pl2) 15문항
// 전공필기/2026_한성e북_기출_컴일.pdf 의 2018·2021년 국가직·지방직 기출에서 반복되는 주제와 문항 형식을 바탕으로
// 새로 만든 문제. 실제 시험 문항과 교재 해설의 복제가 아님.
export const COMIL_UNIT_E = [
/* ===== pl1 프로그래밍 언어론·C 15 ===== */
{id:'pl1-01',sec:'pl1',topic:'컴파일러와 인터프리터',ctx:'ㄱ. 컴파일러는 원시 프로그램 전체를 번역하여 목적 프로그램을 생성한다.\nㄴ. 인터프리터 방식은 일반적으로 컴파일 방식보다 프로그램의 실행 속도가 빠르다.\nㄷ. 인터프리터는 오류가 난 문장에서 바로 멈추므로 대화식 디버깅에 유리하다.\nㄹ. 컴파일된 목적 프로그램은 실행할 때마다 원시 프로그램을 다시 번역해야 한다.',q:'언어 번역 방식에 대한 설명으로 옳은 것만을 모두 고르면?',o:['ㄱ, ㄴ','ㄴ, ㄹ','ㄱ, ㄷ','ㄷ, ㄹ'],a:2,e:'컴파일러는 전체를 한꺼번에 번역해 목적 프로그램을 만들고, 한 번 번역해 두면 재번역 없이 반복 실행할 수 있어 실행 속도가 빠르다(ㄴ·ㄹ은 반대로 서술). 인터프리터는 문장 단위로 해석·실행하므로 느리지만 오류 위치를 바로 확인할 수 있다.'},
{id:'pl1-02',sec:'pl1',topic:'컴파일 단계',q:'컴파일 과정에서 어휘 분석기가 만든 토큰 열을 받아 문법 규칙에 맞는지 검사하고 파스 트리를 만드는 단계는?',o:['의미 분석','구문 분석','코드 최적화','중간 코드 생성'],a:1,e:'컴파일은 어휘 분석(토큰 생성) → 구문 분석(파스 트리 생성) → 의미 분석(형 검사 등) → 중간 코드 생성 → 코드 최적화 → 목적 코드 생성 순으로 진행된다. ①은 파스 트리를 받아 자료형 일치 여부 등을 검사하는 다음 단계다.'},
{id:'pl1-03',sec:'pl1',topic:'로더의 기능',q:'로더(loader)가 수행하는 기능에 해당하지 않는 것은?',o:['할당(allocation)','연결(linking)','재배치(relocation)','번역(translation)'],a:3,e:'로더는 주기억장치 공간을 확보하는 할당, 목적 모듈 간 기호를 이어 주는 연결, 주소를 실제 적재 위치에 맞게 고치는 재배치, 그리고 적재를 수행한다. 원시 프로그램을 기계어로 바꾸는 번역은 컴파일러·어셈블러의 역할이다.'},
{id:'pl1-04',sec:'pl1',topic:'바인딩',q:'바인딩(binding)에 대한 설명으로 옳지 않은 것은?',o:['동적 바인딩은 실행 이전에 속성이 확정되어 실행 중에는 바뀌지 않는다.','C 언어에서 변수의 자료형은 선언에 따라 컴파일 시간에 바인딩된다.','정적 바인딩은 동적 바인딩보다 실행 효율이 높지만 유연성은 낮다.','Python에서 변수의 자료형은 값이 대입되는 실행 시간에 결정된다.'],a:0,e:'실행 이전(번역·링크·적재 시간)에 확정되어 실행 중 바뀌지 않는 것은 정적 바인딩이다. 동적 바인딩은 실행 시간에 속성이 결정되고 바뀔 수 있어 유연하지만 효율이 떨어진다. ②·④는 각각 정적·동적 자료형 바인딩의 대표 예다.'},
{id:'pl1-05',sec:'pl1',topic:'C 자료형과 형 변환',code:`#include <stdio.h>
int main(void) {
    int a = 7, b = 2;
    double x = a / b;
    double y = (double)a / b;
    char c = 'A' + a % b + 2;
    printf("%.1f %.1f %c", x, y, c);
    return 0;
}`,q:'다음 C 프로그램의 출력 결과는?',o:['3.5 3.5 D','3.0 3.0 C','3.0 3.5 D','3.0 3.5 C'],a:2,e:'a / b는 정수끼리의 나눗셈이라 3이 된 뒤 double로 저장되어 3.0이다. (double)a / b는 실수 나눗셈으로 3.5다. a % b는 1이므로 c는 \'A\'에서 3칸 뒤인 \'D\'다. ①은 정수 나눗셈의 버림을 놓친 경우다.'},
{id:'pl1-06',sec:'pl1',topic:'C 증감 연산자와 우선순위',code:`#include <stdio.h>
int main(void) {
    int a = 5, b = 3, c;
    c = a++ + --b * 2;
    printf("%d %d %d", a, b, c);
    return 0;
}`,q:'다음 C 프로그램의 출력 결과는?',o:['6 2 9','6 2 10','6 2 14','6 2 11'],a:0,e:'후위 증가 a++는 식에서 원래 값 5를 쓰고 나중에 6이 된다. 전위 감소 --b는 먼저 2가 된 뒤 쓰이며, 곱셈이 덧셈보다 먼저 계산되어 c = 5 + 2 × 2 = 9다. ②는 a를 먼저 증가시킨 경우, ③은 덧셈을 먼저 한 경우다.'},
{id:'pl1-07',sec:'pl1',topic:'C 비트 연산',code:`#include <stdio.h>
int main(void) {
    int a = 12, b = 10;
    printf("%d %d %d", a & b, a ^ b, a >> 2 | b << 1);
    return 0;
}`,q:'다음 C 프로그램의 출력 결과는?',o:['8 14 23','8 6 22','14 6 23','8 6 23'],a:3,e:'12 = 1100₂, 10 = 1010₂이므로 AND는 1000₂ = 8, XOR은 0110₂ = 6이다. 시프트가 비트 OR보다 우선순위가 높아 (12 >> 2) | (10 << 1) = 3 | 20 = 00011₂ | 10100₂ = 10111₂ = 23이다. ①의 14는 XOR 대신 OR을 계산한 값이다.'},
{id:'pl1-08',sec:'pl1',topic:'C 반복문 · break · continue',code:`#include <stdio.h>
int main(void) {
    int i, s = 0;
    for (i = 1; i <= 10; i++) {
        if (i % 3 == 0) continue;
        if (i > 7) break;
        s += i;
    }
    printf("%d %d", i, s);
    return 0;
}`,q:'다음 C 프로그램의 출력 결과는?',o:['7 19','8 19','8 28','11 37'],a:1,e:'3의 배수는 continue로 건너뛰므로 1 + 2 + 4 + 5 + 7 = 19가 누적된다. i가 8이 되면 break로 반복문을 빠져나오며 이때 증감식은 실행되지 않아 i는 8이다. ③은 continue를 무시한 경우, ④는 break를 무시한 경우다.'},
{id:'pl1-09',sec:'pl1',topic:'정적 스코프와 동적 스코프',code:`int x = 1;
void f(void) { x = x + 2; printf("%d ", x); }
void g(void) { int x = 5; f(); printf("%d ", x); }
int main(void) { g(); printf("%d", x); return 0; }`,q:'다음 C 형식의 프로그램을 정적 스코프(static scope) 규칙과 동적 스코프(dynamic scope) 규칙으로 각각 실행했을 때의 출력 결과를 바르게 짝지은 것은?',o:['정적: 3 5 3, 동적: 7 5 1','정적: 7 7 1, 동적: 3 5 3','정적: 3 5 3, 동적: 7 7 1','정적: 3 5 1, 동적: 7 7 3'],a:2,e:'정적 스코프에서 f의 x는 선언 위치 기준으로 전역 x다. 전역 x가 3이 되어 3, g의 지역 x 5, 전역 x 3이 출력된다. 동적 스코프에서 f의 x는 호출한 g의 지역 x이므로 7이 되어 7, 7이 출력되고 전역 x는 그대로 1이다.'},
{id:'pl1-10',sec:'pl1',topic:'C 매개변수 전달',code:`#include <stdio.h>
void f(int a, int *b) {
    a += 10;
    *b += a;
}
int main(void) {
    int x = 3, y = 4;
    f(x, &y);
    f(y, &x);
    printf("%d %d", x, y);
    return 0;
}`,q:'다음 C 프로그램의 출력 결과는?',o:['30 17','20 17','30 14','13 17'],a:0,e:'a는 값 전달이라 실인수가 바뀌지 않고, b는 주소 전달이라 가리키는 변수가 바뀐다. 첫 호출에서 a = 13, y = 4 + 13 = 17. 둘째 호출에서 a = 17 + 10 = 27, x = 3 + 27 = 30. ④는 a += 10이 x에 반영된다고 본 경우다.'},
{id:'pl1-11',sec:'pl1',topic:'C 포인터와 배열',code:`#include <stdio.h>
int main(void) {
    int a[5] = {2, 4, 6, 8, 10};
    int *p = a, *q = &a[3];
    *p = *q - *(p + 1);
    p += 2;
    *q += *p;
    printf("%d %d %d", a[0], a[3], (int)(q - p));
    return 0;
}`,q:'다음 C 프로그램의 출력 결과는?',o:['4 14 2','2 14 1','4 12 1','4 14 1'],a:3,e:'*p = a[3] - a[1] = 8 - 4 = 4이므로 a[0]은 4가 된다. p += 2로 p는 a[2]를 가리키고, *q += *p는 a[3] = 8 + 6 = 14다. 포인터의 차 q - p는 주소 차가 아니라 원소 개수 차이므로 3 - 2 = 1이다.'},
{id:'pl1-12',sec:'pl1',topic:'C 문자열',code:`#include <stdio.h>
#include <string.h>
int main(void) {
    char s[] = "computer";
    char *p = s + 3;
    int n = 0;
    while (*p) {
        if (*p == 'e' || *p == 'u') n++;
        p++;
    }
    printf("%d %c %d", n, *(s + 2), (int)strlen(s + 5));
    return 0;
}`,q:'다음 C 프로그램의 출력 결과는?',o:['3 m 3','2 m 3','2 p 3','2 m 4'],a:1,e:'p는 s[3]부터 널 문자 전까지 "puter"를 훑으므로 u와 e 두 개가 세어진다(앞쪽 o는 범위 밖이라 ①은 틀리다). *(s + 2)는 s[2]인 m이고, s + 5는 "ter"를 가리켜 길이는 3이다. strlen은 널 문자를 세지 않는다.'},
{id:'pl1-13',sec:'pl1',topic:'C 구조체',code:`#include <stdio.h>
struct S { char name[4]; int score; };
int main(void) {
    struct S a[3] = {{"kim", 70}, {"lee", 90}, {"han", 80}};
    struct S *p = a;
    int best = 0;
    for (int i = 1; i < 3; i++)
        if (p[i].score > p[best].score) best = i;
    struct S t = a[best];
    t.score += 5;
    printf("%s %d %d", t.name, (p + best)->score, t.score);
    return 0;
}`,q:'다음 C 프로그램의 출력 결과는?',o:['lee 90 95','lee 95 95','han 80 85','kim 70 75'],a:0,e:'점수가 가장 큰 원소의 첨자 best는 1이다. 구조체 대입 t = a[best]는 멤버 전체를 복사하므로 t.score를 95로 바꿔도 원본 a[1].score는 90 그대로다. ②는 t가 원본을 가리킨다고 착각한 경우다.'},
{id:'pl1-14',sec:'pl1',topic:'C 재귀 호출',code:`#include <stdio.h>
void f(int n) {
    if (n == 0) return;
    printf("%d", n);
    f(n / 2);
    printf("%d", n % 2);
}
int main(void) {
    f(6);
    return 0;
}`,q:'다음 C 프로그램의 출력 결과는?',o:['631011','136110','631110','631100'],a:2,e:'호출 전 출력은 f(6) → f(3) → f(1) 순으로 6, 3, 1이 찍힌다. f(0)이 바로 반환되면 호출의 역순으로 나머지가 찍혀 1 % 2 = 1, 3 % 2 = 1, 6 % 2 = 0이다. ①은 나머지를 호출 순서대로 출력한 경우다.'},
{id:'pl1-15',sec:'pl1',topic:'C 전역 · 지역 · static 변수',code:`#include <stdio.h>
int n = 1;
int f(void) { static int n = 5; n += 2; return n; }
int g(void) { int n = 5; n += 2; return n; }
int h(void) { n *= 3; return n; }
int main(void) {
    int r = f() + g() + h();
    r += f() + g() + h();
    printf("%d %d", r, n);
    return 0;
}`,q:'다음 C 프로그램의 출력 결과는?',o:['40 9','42 9','42 1','36 3'],a:1,e:'f의 static 변수는 값이 유지되어 7, 9를 반환하고, g의 지역 변수는 매번 초기화되어 7, 7을 반환한다. h는 전역 n을 바꿔 3, 9를 반환한다. r = (7 + 7 + 3) + (9 + 7 + 9) = 42, 전역 n은 9다. ①은 static 변수도 다시 초기화된다고 본 경우다.'},

/* ===== pl2 Java·Python·객체지향 15 ===== */
{id:'pl2-01',sec:'pl2',topic:'객체지향 기본 개념',ctx:'ㄱ. 캡슐화는 데이터와 그 데이터를 다루는 연산을 하나의 단위로 묶는 것이다.\nㄴ. 상속을 이용하면 상위 클래스의 속성과 메서드를 하위 클래스에서 재사용할 수 있다.\nㄷ. 추상화는 객체의 세부 구현을 빠짐없이 외부에 공개하는 것이다.\nㄹ. 클래스는 객체를 실행 시간에 메모리에 할당한 실체(instance)이다.',q:'객체지향 개념에 대한 설명으로 옳은 것만을 모두 고르면?',o:['ㄱ, ㄷ','ㄱ, ㄴ','ㄴ, ㄹ','ㄷ, ㄹ'],a:1,e:'추상화는 불필요한 세부 사항을 감추고 공통적이고 핵심적인 특성만 뽑아내는 것이다. 클래스는 객체를 만들기 위한 틀(설계도)이고, 클래스로부터 메모리에 만들어진 실체가 인스턴스(객체)다.'},
{id:'pl2-02',sec:'pl2',topic:'Java 언어 특징',q:'Java 언어에 대한 설명으로 옳은 것은?',o:['final로 선언한 클래스는 다른 클래스가 상속받아 확장할 수 있다.','한 클래스는 extends로 여러 개의 클래스를 동시에 상속할 수 있다.','추상 클래스는 new 연산자를 사용해 직접 객체를 생성할 수 있다.','한 클래스는 implements로 여러 인터페이스를 구현할 수 있다.'],a:3,e:'Java는 클래스의 다중 상속을 허용하지 않지만 인터페이스는 여러 개를 구현할 수 있다. final 클래스는 상속이 금지되고, 추상 클래스는 직접 인스턴스를 만들 수 없어 하위 클래스가 추상 메서드를 구현해야 한다.'},
{id:'pl2-03',sec:'pl2',topic:'Python 언어 특징',q:'Python 언어에 대한 설명으로 옳지 않은 것은?',o:['튜플(tuple)은 생성한 뒤에도 원소를 자유롭게 수정할 수 있다.','변수의 자료형은 선언 없이 대입되는 값에 따라 결정된다.','코드 블록은 중괄호가 아니라 들여쓰기로 구분한다.','딕셔너리(dict)는 키와 값의 쌍으로 자료를 저장한다.'],a:0,e:'튜플은 불변(immutable) 자료형이라 생성 후 원소를 바꿀 수 없고, 수정 가능한 순서형 자료는 리스트다. Python은 동적 타이핑 언어이며 인터프리터 방식으로 실행되고, 들여쓰기가 문법의 일부다.'},
{id:'pl2-04',sec:'pl2',topic:'웹 언어 기초',q:'웹 관련 언어에 대한 설명으로 옳지 않은 것은?',o:['HTML은 태그를 사용해 웹 문서의 구조를 기술하는 마크업 언어다.','CSS는 웹 문서의 글꼴·색상·배치 등 표현 방식을 지정하는 언어다.','JavaScript는 서버에서만 실행되며 웹 브라우저에서는 동작하지 않는다.','XML은 사용자가 태그를 직접 정의할 수 있는 확장형 마크업 언어다.'],a:2,e:'JavaScript는 웹 브라우저에서 실행되는 대표적인 클라이언트 측 스크립트 언어로, 문서 객체 모델(DOM)을 조작해 동적인 화면을 만든다. Node.js 같은 환경에서는 서버에서도 실행할 수 있다.'},
{id:'pl2-05',sec:'pl2',topic:'Java static 멤버',code:`class Cnt {
    static int total = 0;
    int id;
    Cnt() { id = ++total; }
}
public class Main {
    public static void main(String[] args) {
        Cnt a = new Cnt(), b = new Cnt();
        Cnt c = a;
        c.id += 5;
        new Cnt();
        System.out.print(a.id + " " + b.id + " " + Cnt.total);
    }
}`,q:'다음 Java 프로그램의 출력 결과는?',o:['1 2 3','6 2 2','6 7 3','6 2 3'],a:3,e:'static 변수 total은 모든 객체가 공유하므로 생성자가 세 번 호출되어 3이 된다. c = a는 객체를 복사하지 않고 같은 객체를 참조하므로 c.id += 5는 a.id를 1에서 6으로 바꾼다. ②는 변수에 담지 않은 마지막 new Cnt()를 세지 않은 경우, ①은 c를 a와 별개의 객체로 본 경우다.'},
{id:'pl2-06',sec:'pl2',topic:'Java 문자열',code:`public class Main {
    public static void main(String[] args) {
        String a = "java";
        String b = "java";
        String c = new String("java");
        a.concat("!");
        System.out.print((a == b) + " " + (a == c) + " "
            + a.equals(c) + " " + a.length());
    }
}`,q:'다음 Java 프로그램의 출력 결과는?',o:['true false true 4','true true true 4','true false true 5','false false true 4'],a:0,e:'같은 문자열 리터럴은 상수 풀의 한 객체를 공유하므로 a == b는 true, new로 만든 c는 별도 객체라 a == c는 false다. equals는 내용을 비교해 true다. String은 불변이라 concat의 결과를 대입하지 않으면 a는 그대로 "java"(길이 4)다.'},
{id:'pl2-07',sec:'pl2',topic:'Java 생성자 호출 순서',code:`class A {
    A() { System.out.print("1"); }
    A(int n) { System.out.print("2"); }
}
class B extends A {
    B() { this(0); System.out.print("3"); }
    B(int n) { super(n); System.out.print("4"); }
}
class C extends B {
    C() { System.out.print("5"); }
}
public class Main {
    public static void main(String[] args) {
        new C();
        new B(7);
    }
}`,q:'다음 Java 프로그램의 출력 결과는?',o:['342524','243524','245324','143524'],a:1,e:'C()는 첫 줄에 super()가 자동 삽입되어 B()를 부르고, B()는 this(0)으로 B(int)를, B(int)는 super(n)으로 A(int)를 부른다. 따라서 2 → 4 → 3 → 5가 출력된다. new B(7)은 A(int)와 B(int)만 거쳐 2, 4를 출력한다. ④는 A의 기본 생성자가 불린다고 본 경우다.'},
{id:'pl2-08',sec:'pl2',topic:'Python 리스트 참조와 복사',code:`a = [1, 2, 3]
b = a
c = a[:]
b.append(4)
c[0] = 9
print(a, len(c), a[-2:])`,q:'다음 Python 프로그램의 출력 결과는?',o:['[1, 2, 3] 3 [2, 3]','[9, 2, 3, 4] 4 [3, 4]','[1, 2, 3, 4] 3 [3, 4]','[1, 2, 3, 4] 4 [3, 4]'],a:2,e:'b = a는 같은 리스트를 가리키므로 b.append(4)는 a에도 반영된다. a[:]는 새 리스트를 만드는 복사라서 c는 append 이전의 원소 3개만 가지며 c[0] = 9도 a에 영향을 주지 않는다. a[-2:]는 뒤에서 두 원소 [3, 4]다.'},
{id:'pl2-09',sec:'pl2',topic:'Python range와 리스트 컴프리헨션',code:`a = [x * x for x in range(1, 8, 2) if x % 3 != 0]
b = list(range(10, 0, -3))
print(a, b[1:3], sum(b))`,q:'다음 Python 프로그램의 출력 결과는?',o:['[1, 25, 49] [7, 4] 22','[1, 9, 25, 49] [7, 4] 22','[1, 25, 49] [7, 4, 1] 22','[1, 25, 49] [10, 7] 21'],a:0,e:'range(1, 8, 2)는 1, 3, 5, 7이고 3의 배수를 뺀 1, 5, 7의 제곱이 a다. range(10, 0, -3)은 끝값 0을 포함하지 않는 10, 7, 4, 1이며 합은 22다. b[1:3]은 인덱스 1, 2의 [7, 4]로 끝 인덱스 3은 포함하지 않는다.'},
{id:'pl2-10',sec:'pl2',topic:'Python 딕셔너리',code:`d = {}
for w in "banana":
    d[w] = d.get(w, 0) + 1
keys = sorted(d, key=lambda k: d[k])
print(keys[-1], d['n'], len(d))`,q:'다음 Python 프로그램의 출력 결과는?',o:['n 2 3','a 3 6','b 2 3','a 2 3'],a:3,e:'get(w, 0)은 키가 없으면 0을 돌려주므로 글자별 빈도 b:1, a:3, n:2가 만들어진다. 값 기준 오름차순으로 키를 정렬하면 b, n, a이고 마지막은 a다. 딕셔너리의 길이는 글자 수 6이 아니라 서로 다른 키의 수 3이다.'},
{id:'pl2-11',sec:'pl2',topic:'Java 필드 은닉과 오버라이딩',code:`class P {
    int v = 10;
    int get() { return v; }
}
class Q extends P {
    int v = 20;
    int get() { return v + 1; }
}
public class Main {
    public static void main(String[] args) {
        P a = new Q();
        System.out.print(a.v + " " + a.get() + " " + ((Q) a).v);
    }
}`,q:'다음 Java 프로그램의 출력 결과는?',o:['20 21 20','10 21 20','10 11 20','10 21 10'],a:1,e:'필드는 참조 변수의 선언 타입으로 정해지므로 a.v는 P의 10이고, Q로 형 변환하면 Q의 20이다. 메서드는 실제 객체 기준으로 동적 바인딩되어 Q의 get()이 Q의 v를 써서 21을 반환한다. ①은 필드도 동적 바인딩된다고 본 경우다.'},
{id:'pl2-12',sec:'pl2',topic:'Java 메서드 오버로딩',code:`public class Main {
    static String f(int a)    { return "I"; }
    static String f(double a) { return "D"; }
    static String f(char a)   { return "C"; }
    static String f(Object a) { return "O"; }
    public static void main(String[] args) {
        System.out.print(f(3) + f('a') + f(3.0f) + f(5L) + f("x"));
    }
}`,q:'다음 Java 프로그램의 출력 결과는?',o:['ICDIO','IIDDO','ICDDO','ICDOO'],a:2,e:'오버로딩은 인수의 타입으로 호출할 메서드를 컴파일 시간에 고른다. 3은 int, \'a\'는 char로 정확히 일치한다. float과 long은 일치하는 메서드가 없어 자동 형 확장으로 double 버전이 선택되며, 박싱(Object)보다 기본형 확장이 우선한다. 문자열은 Object 버전이다.'},
{id:'pl2-13',sec:'pl2',topic:'Java 예외 처리',code:`public class Main {
    static int f(int[] a, int i) {
        try { return a[i] / (i - 1); }
        catch (ArithmeticException e) { System.out.print("A"); return -1; }
        catch (Exception e) { System.out.print("E"); return -2; }
        finally { System.out.print("F"); }
    }
    public static void main(String[] args) {
        int[] a = {4, 6, 8};
        System.out.print(f(a, 1) + f(a, 3) + f(a, 2));
    }
}`,q:'다음 Java 프로그램의 출력 결과는?',o:['AFEFF5','AEFFF5','AFEF5','AFAFF6'],a:0,e:'f(a, 1)은 0으로 나누어 ArithmeticException이 발생해 A, finally의 F를 출력하고 -1을 반환한다. f(a, 3)은 배열 범위를 벗어나 Exception 블록에서 E, F를 출력하고 -2를 반환한다. f(a, 2)는 예외 없이 8을 반환하지만 finally는 항상 실행되어 F가 출력된다. 합은 -1 - 2 + 8 = 5다.'},
{id:'pl2-14',sec:'pl2',topic:'Python 함수와 변수 범위',code:`x = 10
def f(a, b=2, *c):
    x = a + b
    return x + sum(c)
def g():
    global x
    x += 5
    return x
print(f(1), f(1, 3, 5, 7), g() + x)`,q:'다음 Python 프로그램의 출력 결과는?',o:['3 16 25','3 4 30','12 16 30','3 16 30'],a:3,e:'f 안의 x는 지역 변수라 전역 x에 영향을 주지 않는다. f(1) = 1 + 2 = 3, f(1, 3, 5, 7)은 b = 3, c = (5, 7)이므로 4 + 12 = 16이다. g는 global 선언으로 전역 x를 15로 바꾸고, 그 뒤에 평가되는 x도 15여서 30이다. ①은 x를 바뀌기 전 값 10으로 더한 경우다.'},
{id:'pl2-15',sec:'pl2',topic:'Python 클래스 변수와 인스턴스 변수',code:`class A:
    n = 0
    def __init__(self, v):
        self.v = v
        A.n += 1
    def add(self, o):
        return A(self.v + o.v)

p = A(3)
q = A(4)
r = p.add(q)
p.n = 10
print(r.v, A.n, q.n, p.n)`,q:'다음 Python 프로그램의 출력 결과는?',o:['7 2 2 10','7 3 10 10','7 3 3 10','7 10 10 10'],a:2,e:'add가 새 객체를 만들면서 __init__이 한 번 더 실행되므로 클래스 변수 A.n은 3이다. p.n = 10은 클래스 변수를 바꾸는 것이 아니라 p에만 인스턴스 변수 n을 새로 만든다. 따라서 q.n은 여전히 클래스 변수 3을 읽고, p.n만 10이다.'},
];
