const CASES = [
  {
    id: 'bug-c-bound', sec: 'c', title: '배열 밖으로 나간 합계', difficulty: '입문',
    prompt: '길이가 3인 배열의 합만 구해야 합니다. 배열의 유효 범위를 벗어나는 원인 줄을 찾으세요.',
    code: 'int values[] = {10, 20, 30};\nint total = 0;\nfor (int i = 0; i <= 3; i++) {\n    total += values[i];\n}',
    bugLine: 3, replacement: 'for (int i = 0; i < 3; i++) {',
    reasons: ['합계는 반드시 double로 선언해야 한다.', '인덱스 3까지 반복하지만 마지막 유효 인덱스는 2다.', '배열은 반복문에서 읽을 수 없다.', 'i++는 i를 증가시키지 않는다.'], a: 1,
    hint: '길이가 N인 배열의 마지막 인덱스는 무엇일까요?',
    e: 'values[3]은 배열 범위 밖입니다. C에서 이런 접근은 정의되지 않은 동작을 일으킵니다. 반복 조건을 i < 3으로 바꿔 인덱스 0, 1, 2만 읽습니다.',
  },
  {
    id: 'bug-c-scanf', sec: 'c', title: '입력값은 어디로?', difficulty: '입문',
    prompt: 'stdio.h를 포함한 main 함수 일부입니다. 정수 7을 입력받아 출력하려는데 잘못된 곳을 찾으세요.',
    code: 'int value = 0;\nscanf("%d", value);\nprintf("%d\\n", value);',
    bugLine: 2, replacement: 'scanf("%d", &value);',
    reasons: ['printf에는 항상 변수의 주소를 넘겨야 한다.', '%d는 정수를 입력받을 수 없다.', 'scanf의 %d에는 저장할 int 변수의 주소가 필요하다.', 'value의 초깃값은 반드시 7이어야 한다.'], a: 2,
    hint: '입력 함수가 호출한 쪽의 변수 내용을 바꾸려면 무엇을 받아야 할까요?',
    e: 'scanf의 %d는 int *를 요구합니다. value 자체를 전달하면 함수가 올바른 저장 위치를 받지 못하므로 정의되지 않은 동작이 발생합니다. &value로 주소를 넘겨야 합니다.',
  },
  {
    id: 'bug-c-division', sec: 'c', title: '평균에서 사라진 소수점', difficulty: '입문',
    prompt: '평균이 2.5여야 하는데 2.0이 됩니다. 소수 부분이 사라지는 줄을 찾으세요.',
    code: 'int total = 5;\nint count = 2;\ndouble average = total / count;\nprintf("%.1f\\n", average);',
    bugLine: 3, replacement: 'double average = (double) total / count;',
    reasons: ['두 int의 나눗셈이 먼저 수행되어 소수 부분이 버려진다.', 'double은 소수 부분을 저장하지 못한다.', 'printf의 %.1f는 항상 정수로 반올림한다.', 'count가 0이어서 나눗셈에 실패한다.'], a: 0,
    hint: '대입받는 변수의 자료형과 나눗셈 피연산자의 자료형을 구분해 보세요.',
    e: '5 / 2는 정수 나눗셈이어서 먼저 2가 되고, 그 뒤 double로 변환되어 2.0이 됩니다. 나눗셈 전에 한쪽을 double로 변환해야 2.5를 얻습니다.',
  },
  {
    id: 'bug-c-leak', sec: 'c', title: '반환 뒤에 남은 메모리', difficulty: '중급',
    prompt: 'stdlib.h를 포함했고 할당 실패도 처리했습니다. load를 반복 호출하면 메모리가 누수됩니다. 메모리 해제 없이 함수를 빠져나가는 줄을 찾으세요.',
    code: 'int load(void) {\n    int *value = malloc(sizeof *value);\n    if (value == NULL) return -1;\n    *value = 42;\n    return *value;\n}',
    bugLine: 5, replacement: '    int result = *value;\n    free(value);\n    return result;',
    reasons: ['malloc으로 받은 메모리는 함수가 끝나면 자동으로 해제된다.', 'sizeof *value는 포인터를 역참조해 항상 오류를 낸다.', '정수를 반환하면 동적 할당 메모리의 소유권이 호출자에게 이전된다.', '값만 반환하고 할당한 블록을 해제하지 않아 그 주소를 잃는다.'], a: 3,
    hint: '반환하는 것은 주소가 아니라 정수 값입니다. 할당한 블록은 누가 해제하나요?',
    e: '지역 포인터 value가 사라져도 malloc으로 할당한 블록은 남습니다. 정수 값을 먼저 복사하고 free(value)로 해제한 뒤 복사한 값을 반환합니다. 해제 후 *value를 읽으면 안 됩니다.',
  },
  {
    id: 'bug-c-loop', sec: 'c', title: '줄어들지 않는 카운트', difficulty: '입문',
    prompt: '3, 2, 1을 출력하고 끝나야 합니다. 반복문이 끝나지 않는 원인 줄을 찾으세요.',
    code: 'int n = 3;\nwhile (n > 0);\n{\n    printf("%d\\n", n);\n    n--;\n}',
    bugLine: 2, replacement: 'while (n > 0)',
    reasons: ['n--는 n을 증가시킨다.', 'while 뒤 세미콜론이 빈 반복문 본문이 되어 n이 바뀌지 않는다.', '중괄호는 while문에 사용할 수 없다.', 'n의 초깃값이 양수이면 while을 사용할 수 없다.'], a: 1,
    hint: '세미콜론 하나도 문장이 될 수 있습니다. 실제 반복 본문이 어디인가요?',
    e: 'while (n > 0);의 세미콜론은 빈 문장입니다. n은 계속 3이므로 아래 블록까지 도달하지 않습니다. 세미콜론을 제거해 중괄호 안에서 n을 감소시킵니다.',
  },
  {
    id: 'bug-java-equals', sec: 'java', title: '같은 글자, 다른 판정', difficulty: '입문',
    prompt: '문자열 내용이 같으므로 true를 출력해야 합니다. 내용 비교를 하지 않는 줄을 찾으세요.',
    code: 'String left = new String("CS");\nString right = new String("CS");\nboolean same = left == right;\nSystem.out.println(same);',
    bugLine: 3, replacement: 'boolean same = left.equals(right);',
    reasons: ['new String은 항상 null을 만든다.', 'boolean에는 문자열 비교 결과를 저장할 수 없다.', '==는 문자열의 내용 대신 참조가 같은지 비교한다.', 'equals는 문자열에 사용할 수 없다.'], a: 2,
    hint: '같은 내용인 두 객체와 같은 객체를 가리키는 두 참조는 다릅니다.',
    e: 'new String으로 만든 두 객체는 서로 다른 참조입니다. ==는 참조를 비교하므로 false입니다. 이 코드에서 left는 null이 아니므로 left.equals(right)로 내용을 비교하면 됩니다.',
  },
  {
    id: 'bug-java-bound', sec: 'java', title: '마지막 한 번의 예외', difficulty: '입문',
    prompt: '배열 원소 세 개를 출력해야 합니다. ArrayIndexOutOfBoundsException을 일으키는 반복 조건을 찾으세요.',
    code: 'int[] values = {2, 4, 6};\nfor (int i = 0; i <= values.length; i++) {\n    System.out.println(values[i]);\n}',
    bugLine: 2, replacement: 'for (int i = 0; i < values.length; i++) {',
    reasons: ['length와 같은 인덱스까지 접근하므로 배열 범위를 벗어난다.', 'Java 배열의 첫 인덱스는 1이다.', 'println은 반복문에서 사용할 수 없다.', '배열의 length는 마지막 인덱스와 항상 같다.'], a: 0,
    hint: 'length는 원소의 개수입니다. 마지막 원소의 인덱스와 같을까요?',
    e: '길이가 3인 배열에서 유효한 인덱스는 0~2입니다. i == values.length인 반복까지 실행하면 values[3]에서 예외가 발생합니다. i < values.length로 제한합니다.',
  },
  {
    id: 'bug-java-overflow', sec: 'java', title: 'long인데 왜 음수지?', difficulty: '중급',
    prompt: '총액은 3,000,000,000이어야 합니다. int 범위를 넘는 곱셈이 발생하는 줄을 찾으세요.',
    code: 'int count = 100_000;\nint price = 30_000;\nlong total = count * price;\nSystem.out.println(total);',
    bugLine: 3, replacement: 'long total = (long) count * price;',
    reasons: ['long은 int보다 표현 범위가 작다.', '밑줄이 포함된 정수 리터럴은 음수가 된다.', 'println이 큰 양수를 음수로 바꾼다.', 'int끼리 먼저 곱해 오버플로가 발생한 뒤 long으로 변환된다.'], a: 3,
    hint: '큰 자료형에 대입하는 시점보다 곱셈이 먼저 실행됩니다.',
    e: '두 피연산자가 int이므로 곱셈도 int로 수행됩니다. 30억은 int 최댓값 2,147,483,647을 넘어 오버플로합니다. 곱셈 전에 한쪽을 long으로 바꿉니다. (long) (count * price)는 너무 늦습니다.',
  },
  {
    id: 'bug-java-null', sec: 'java', title: '이름이 없는 자리', difficulty: '입문',
    prompt: '등록되지 않은 이름의 길이는 0으로 처리해야 합니다. null을 확인하지 않고 사용하는 줄을 찾으세요.',
    code: 'String[] names = new String[2];\nint length = names[0].length();\nSystem.out.println(length);',
    bugLine: 2, replacement: 'int length = names[0] == null ? 0 : names[0].length();',
    reasons: ['String 배열에는 문자열을 저장할 수 없다.', '참조형 배열의 초깃값 null에 메서드를 호출한다.', '배열의 길이가 2이면 인덱스 0이 존재하지 않는다.', 'length()는 항상 음수를 반환한다.'], a: 1,
    hint: '배열을 만든 것과 각 원소에 문자열을 넣은 것은 다른 작업입니다.',
    e: 'new String[2]는 각 원소를 null로 초기화합니다. names[0].length()는 NullPointerException을 일으킵니다. 요구사항에 따라 null이면 0, 문자열이 있으면 그 길이를 사용합니다.',
  },
  {
    id: 'bug-java-race', sec: 'java', title: '함께 올렸는데 사라진 횟수', difficulty: '중급',
    prompt: '두 스레드가 같은 Counter의 increment를 각각 5,000번 호출합니다. 둘 다 join한 뒤에도 count가 10,000보다 작을 수 있습니다. 상호 배제가 빠진 메서드를 찾으세요.',
    code: 'class Counter {\n    int count = 0;\n    void increment() { count++; }\n}',
    bugLine: 3, replacement: '    synchronized void increment() { count++; }',
    reasons: ['같은 객체의 count++가 읽기·증가·쓰기로 나뉘어 갱신이 유실될 수 있다.', 'int 변수는 두 스레드가 접근할 수 없다.', 'join을 호출하면 count가 자동으로 0이 된다.', 'volatile만 붙이면 count++ 전체가 원자적 연산이 된다.'], a: 0,
    hint: 'count++는 한 줄이지만 하나의 원자적 동작은 아닙니다.',
    e: '두 스레드가 같은 값을 읽고 각각 증가한 값을 쓰면 한 번의 갱신이 사라질 수 있습니다. 같은 Counter 객체의 synchronized 메서드로 접근을 직렬화합니다. 모든 증가를 이 메서드로 하고 join 후 읽는 상황입니다. volatile만으로 복합 연산을 보호할 수는 없습니다.',
  },
  {
    id: 'bug-python-default', sec: 'python', title: '처음 온 손님에게 이전 주문이', difficulty: '중급',
    prompt: '호출마다 새 장바구니를 만들어야 합니다. 두 번째 호출 결과가 ["B"] 대신 ["A", "B"]가 되는 원인 줄을 찾으세요.',
    code: 'def add_item(item, cart=[]):\n    cart.append(item)\n    return cart\n\nadd_item("A")\nprint(add_item("B"))',
    bugLine: 1, replacement: 'def add_item(item, cart=None):\n    if cart is None:\n        cart = []',
    reasons: ['append는 항상 원소를 두 번 추가한다.', 'return은 리스트를 자동으로 전역 변수로 만든다.', '기본 인자의 리스트가 함수 정의 시 한 번 만들어져 호출 간 공유된다.', '함수에는 리스트를 인자로 전달할 수 없다.'], a: 2,
    hint: '기본 인자 표현식이 평가되는 시점은 호출할 때마다가 아닙니다.',
    e: '가변 기본 인자 []는 함수 정의 때 한 번 생성됩니다. 기본 인자를 생략한 호출들이 같은 리스트를 수정합니다. None을 기본값으로 두고 함수 내부에서 새 리스트를 만들면 호출마다 독립됩니다.',
  },
  {
    id: 'bug-python-board', sec: 'python', title: '한 칸을 칠했는데 세 줄이', difficulty: '중급',
    prompt: '첫 행 첫 칸만 1이어야 하는데 모든 행의 첫 칸이 1이 됩니다. 행들이 공유되는 원인 줄을 찾으세요.',
    code: 'board = [[0] * 3] * 3\nboard[0][0] = 1\nprint(board)',
    bugLine: 1, replacement: 'board = [[0] * 3 for _ in range(3)]',
    reasons: ['리스트의 곱셈은 모든 원소를 1로 바꾼다.', 'board[0][0]은 모든 행을 선택하는 문법이다.', 'print가 리스트를 수정한다.', '바깥 리스트의 곱셈은 같은 내부 리스트의 참조를 반복한다.'], a: 3,
    hint: '행이 세 개 보이지만 실제 내부 리스트도 세 개 만들어졌을까요?',
    e: '[[0] * 3] * 3은 하나의 내부 리스트를 세 번 참조합니다. 그래서 한 행을 수정하면 다른 행에서도 같은 변화가 보입니다. 리스트 컴프리헨션으로 행마다 새 리스트를 생성합니다.',
  },
  {
    id: 'bug-python-remove', sec: 'python', title: '지웠는데 남아 있는 짝수', difficulty: '중급',
    prompt: '모든 짝수를 지워 [5]를 만들어야 합니다. 반복 중 원본이 줄어 원소를 건너뛰게 하는 반복 대상 줄을 찾으세요.',
    code: 'numbers = [2, 4, 6, 5]\nfor value in numbers:\n    if value % 2 == 0:\n        numbers.remove(value)\nprint(numbers)',
    bugLine: 2, replacement: 'for value in numbers[:]:',
    reasons: ['순회 중 같은 리스트에서 원소를 삭제하면 뒤 원소가 당겨져 건너뛸 수 있다.', 'remove는 항상 마지막 원소를 삭제한다.', '% 2는 홀수 판별에 사용할 수 없다.', 'for 반복문은 리스트를 순회하지 못한다.'], a: 0,
    hint: '2를 지운 직후 4의 인덱스와 반복자의 다음 위치를 비교해 보세요.',
    e: '2를 삭제하면 4가 인덱스 0으로 당겨지지만 반복은 다음 인덱스로 진행해 4를 건너뜁니다. numbers[:]로 만든 복사본을 순회하면서 원본에서 삭제합니다. 새 리스트를 만드는 필터 방식도 가능합니다.',
  },
  {
    id: 'bug-python-identity', sec: 'python', title: '똑같은 목록인데 False', difficulty: '입문',
    prompt: '두 리스트의 내용이 같은지 검사해서 True를 출력해야 합니다. 잘못된 비교 연산을 찾으세요.',
    code: 'left = [1, 2, 3]\nright = [1, 2, 3]\nsame = left is right\nprint(same)',
    bugLine: 3, replacement: 'same = left == right',
    reasons: ['리스트는 비교할 수 없다.', 'is는 값의 동등성이 아니라 객체의 동일성을 검사한다.', '==는 항상 두 객체를 합친다.', 'print는 True를 출력할 수 없다.'], a: 1,
    hint: '내용이 같은 것과 메모리의 같은 객체인 것은 다릅니다.',
    e: '각 리스트 리터럴은 별도의 객체를 만듭니다. is는 같은 객체인지 비교하므로 False입니다. ==는 리스트의 원소들을 비교하므로 이 요구사항에 맞는 True를 얻습니다.',
  },
  {
    id: 'bug-python-range', sec: 'python', title: '합계에서 빠진 마지막 숫자', difficulty: '입문',
    prompt: '1부터 5까지 더해 15를 출력해야 합니다. 마지막 숫자가 빠지는 반복 범위를 찾으세요.',
    code: 'total = 0\nfor value in range(1, 5):\n    total += value\nprint(total)',
    bugLine: 2, replacement: 'for value in range(1, 6):',
    reasons: ['range의 시작값은 항상 0이어야 한다.', '+=는 기존 total을 무시한다.', 'range의 두 번째 인자는 포함되지 않는 끝값이다.', 'print는 정수를 출력하지 못한다.'], a: 2,
    hint: 'range(start, stop)에서 stop 자체도 생성될까요?',
    e: 'range(1, 5)는 1, 2, 3, 4를 만듭니다. 끝값은 포함하지 않으므로 합계가 10입니다. 5까지 포함하려면 끝값을 6으로 지정합니다.',
  },
];

export const BUG_HUNT = {
  key: 'bug-hunt', name: '코드 범인 찾기',
  sections: { c: { name: 'C' }, java: { name: 'Java' }, python: { name: 'Python' } },
  questions: CASES.map(q => {
    const lines = q.code.split('\n');
    const otherLines = lines.map((_, i) => i + 1).filter(n => n !== q.bugLine && lines[n - 1].trim());
    return { ...q, q: `${q.prompt}\n버그의 원인이 되는 줄과 이유로 알맞은 것은?`,
      o: q.reasons.map((reason, i) => `${i === q.a ? q.bugLine : otherLines[i % otherLines.length]}행 · ${reason}`),
      fixedCode: lines.flatMap((line, i) => i + 1 === q.bugLine ? q.replacement.split('\n') : [line]).join('\n'),
    };
  }),
};

export function drawBugCases(questions, stats, { language = 'all', wrongOnly = false } = {}) {
  const pool = questions.filter(q => (language === 'all' || q.sec === language) && (!wrongOnly || stats[q.id]?.last === 'w'));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  if (!wrongOnly) pool.sort((a, b) => Number(Boolean(stats[a.id])) - Number(Boolean(stats[b.id])));
  return pool.slice(0, 5).map(q => q.id);
}

export function gradeBugCase(question, line, reason) {
  const lineCorrect = line === question.bugLine, reasonCorrect = reason === question.a;
  return { line, reason, lineCorrect, reasonCorrect, correct: lineCorrect && reasonCorrect, points: (Number(lineCorrect) + Number(reasonCorrect)) * 10 };
}
