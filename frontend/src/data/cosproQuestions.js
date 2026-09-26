// COS Pro 1급 유형 코딩 문제 (Java). 다우기술 인적성 화면 아래에서 연다.
// mock: 프로그래머스 "COS Pro 1급 Python 모의고사" 10문제의 문제 개념을 자바로 옮겨 새로 쓴 것(지문과 코드는 새로 작성).
// extra: 같은 세 유형(빈칸 채우기 · 한 줄 바꾸기 · 함수 작성)으로 새로 만든 예제 문제 3개.
// 채점은 서버(/code/java)에서 제출 코드(Solution.java)와 tests로 만든 Main.java를 함께 컴파일해 실행한다.
// tests의 args는 solution(...)에 그대로 들어가는 자바 식, expect는 기대값 자바 식이다. sample이면 예제로 보여 준다.

export const COSPRO_PARTS = {
  blank: { no: 1, name: '빈칸 채우기', desc: '완성된 흐름에서 비어 있는 식 · 문장 · 선언을 채웁니다. ___ 부분만 고치면 됩니다.' },
  line:  { no: 2, name: '한 줄 바꾸기', desc: '코드에 틀린 줄이 딱 하나 있습니다. 그 한 줄만 고쳐 올바르게 동작하게 합니다.' },
  func:  { no: 3, name: '함수 작성', desc: 'solution 함수를 처음부터 작성합니다.' },
};

export const COSPRO_GROUPS = {
  mock:  { name: 'COS Pro 1급 모의고사 (Java)', desc: '프로그래머스 COS Pro 1급 Python 모의고사 10문제를 자바로 옮겼습니다. 실제 시험처럼 빈칸 4 · 한 줄 3 · 함수 3 구성입니다.' },
  extra: { name: '추가 예제', desc: '같은 세 유형으로 새로 만든 연습 문제입니다.' },
  bit:   { name: '비트마스킹', desc: '정수 하나의 비트로 집합을 나타내는 문제입니다. 부분집합 순회 · 권한 플래그 · 비트 DP를 세 유형으로 풀어 봅니다.' },
};

export const COSPRO_PROBLEMS = [
/* ================= 모의고사: 빈칸 채우기 ================= */
{
  id: 'cp01', group: 'mock', part: 'blank', title: '스택 두 개로 큐 만들기', topic: '스택 · 큐',
  statement: `스택 두 개(stack1, stack2)로 큐를 흉내 내려고 합니다. 큐에서 값을 하나 꺼내는(dequeue) 동작은 다음과 같습니다.

1. stack2가 비어 있으면, stack1이 빌 때까지 stack1의 맨 위 값을 꺼내 stack2에 차례로 쌓습니다.
2. stack2의 맨 위 값을 꺼내 돌려줍니다.

두 스택의 현재 상태가 배열로 주어집니다. 배열의 마지막 원소가 스택의 맨 위입니다.
위 방법으로 값을 하나 꺼냈을 때 나오는 값을 return 하도록 빈칸을 채워 주세요.`,
  constraints: ['두 배열의 길이 합은 1 이상 100 이하입니다.', '두 스택이 동시에 비어 있는 경우는 없습니다.'],
  starter: `import java.util.*;

class Solution {
    // 스택의 맨 위(리스트의 마지막) 값을 꺼내 돌려준다
    int popTop(ArrayList<Integer> stack) {
        return stack.remove(stack.size() - 1);
    }

    // from 스택이 빌 때까지 하나씩 꺼내 to 스택에 쌓는다
    void moveAll(ArrayList<Integer> from, ArrayList<Integer> to) {
        while (!___________) {
            int item = ___________;
            to.add(item);
        }
    }

    boolean isEmpty(ArrayList<Integer> stack) {
        return stack.size() == 0;
    }

    public int solution(int[] s1, int[] s2) {
        ArrayList<Integer> stack1 = new ArrayList<>();
        ArrayList<Integer> stack2 = new ArrayList<>();
        for (int x : s1) stack1.add(x);
        for (int x : s2) stack2.add(x);

        if (___________)
            ___________;
        int answer = ___________;
        return answer;
    }
}`,
  answer: `import java.util.*;

class Solution {
    int popTop(ArrayList<Integer> stack) {
        return stack.remove(stack.size() - 1);
    }

    void moveAll(ArrayList<Integer> from, ArrayList<Integer> to) {
        while (!isEmpty(from)) {
            int item = popTop(from);
            to.add(item);
        }
    }

    boolean isEmpty(ArrayList<Integer> stack) {
        return stack.size() == 0;
    }

    public int solution(int[] s1, int[] s2) {
        ArrayList<Integer> stack1 = new ArrayList<>();
        ArrayList<Integer> stack2 = new ArrayList<>();
        for (int x : s1) stack1.add(x);
        for (int x : s2) stack2.add(x);

        if (isEmpty(stack2))
            moveAll(stack1, stack2);
        int answer = popTop(stack2);
        return answer;
    }
}`,
  explain: 'stack2가 비었을 때만 stack1을 통째로 옮기면 순서가 뒤집혀, stack1에 가장 먼저 들어간 값이 stack2의 맨 위로 올라옵니다. 이미 만들어 둔 함수(isEmpty, popTop, moveAll)를 알맞은 인자로 부르는 것이 핵심입니다.',
  tests: [
    { input: 's1 = [1, 2], s2 = [3, 4]', args: 'new int[]{1, 2}, new int[]{3, 4}', expect: '4', sample: true },
    { input: 's1 = [1, 2, 3], s2 = []', args: 'new int[]{1, 2, 3}, new int[]{}', expect: '1', sample: true },
    { input: 's1 = [5], s2 = []', args: 'new int[]{5}, new int[]{}', expect: '5', sample: true },
    { args: 'new int[]{7, 8}, new int[]{9}', expect: '9' },
    { args: 'new int[]{}, new int[]{2, 6}', expect: '6' },
  ],
},
{
  id: 'cp02', group: 'mock', part: 'blank', title: '지그재그 구간', topic: '배열 · DP',
  statement: `수열에서 이웃한 두 수의 차이가 증가 → 감소 → 증가 → … 또는 감소 → 증가 → 감소 → … 처럼 번갈아 나타나는 연속 구간을 지그재그 구간이라고 합니다. 지그재그 구간은 길이가 3 이상이어야 합니다.

예를 들어 [2, 5, 7, 3, 4, 6, 1, 8, 9]에서 [5, 7, 3, 4]는 증가 · 감소 · 증가가 번갈아 나오는 길이 4의 지그재그 구간이며, 이보다 긴 지그재그 구간은 없습니다.

수열 S가 주어질 때 가장 긴 지그재그 구간의 길이를 return 하도록 빈칸을 채워 주세요. 지그재그 구간이 없으면 0을 return 합니다.
풀이는 다음 순서로 진행합니다.

1. makeCheck: 각 칸이 바로 앞 칸보다 커졌는지(INC) 작아졌는지(DEC) 표시합니다. 첫 칸은 -1입니다.
2. makeDp: 각 칸에서 끝나는 가장 긴 지그재그 구간의 길이를 구합니다.
3. getLongest: 그중 가장 긴 길이를 구하되, 3보다 짧으면 0을 돌려줍니다.`,
  constraints: ['S의 길이는 3 이상 100 이하입니다.', 'S의 원소는 1 이상 100 이하의 서로 다른 자연수입니다.'],
  starter: `class Solution {
    final int INC = 0;
    final int DEC = 1;

    int[] makeCheck(int[] S) {
        int[] check = new int[S.length];
        check[0] = -1;
        for (int i = 1; i < S.length; i++)
            check[i] = S[i] > S[i - 1] ? INC : DEC;
        return check;
    }

    int[] makeDp(int[] check) {
        int[] dp = new int[check.length];
        dp[0] = 1;
        dp[1] = 2;
        for (int i = 2; i < check.length; i++)
            dp[i] = check[i] != check[i - 1] ? dp[i - 1] + 1 : 2;
        return dp;
    }

    int getLongest(int[] dp) {
        int best = 0;
        for (int v : dp) best = Math.max(best, v);
        return best < 3 ? 0 : best;
    }

    public int solution(int[] S) {
        int[] check = ___________;
        int[] dp = ___________;
        int answer = ___________;
        return answer;
    }
}`,
  answer: `class Solution {
    final int INC = 0;
    final int DEC = 1;

    int[] makeCheck(int[] S) {
        int[] check = new int[S.length];
        check[0] = -1;
        for (int i = 1; i < S.length; i++)
            check[i] = S[i] > S[i - 1] ? INC : DEC;
        return check;
    }

    int[] makeDp(int[] check) {
        int[] dp = new int[check.length];
        dp[0] = 1;
        dp[1] = 2;
        for (int i = 2; i < check.length; i++)
            dp[i] = check[i] != check[i - 1] ? dp[i - 1] + 1 : 2;
        return dp;
    }

    int getLongest(int[] dp) {
        int best = 0;
        for (int v : dp) best = Math.max(best, v);
        return best < 3 ? 0 : best;
    }

    public int solution(int[] S) {
        int[] check = makeCheck(S);
        int[] dp = makeDp(check);
        int answer = getLongest(dp);
        return answer;
    }
}`,
  explain: '세 함수의 입력과 출력이 이어지도록 순서대로 부르면 됩니다. makeCheck는 원래 수열을, makeDp는 증감 표시 배열을, getLongest는 dp 배열을 받습니다. 방향이 바뀌면 길이를 1 늘리고, 같은 방향이 이어지면 마지막 두 칸(길이 2)부터 다시 셉니다.',
  tests: [
    { input: 'S = [2, 5, 7, 3, 4, 6, 1, 8, 9]', args: 'new int[]{2, 5, 7, 3, 4, 6, 1, 8, 9}', expect: '4', sample: true },
    { input: 'S = [4, 3, 2, 1, 10, 6, 9, 7, 8]', args: 'new int[]{4, 3, 2, 1, 10, 6, 9, 7, 8}', expect: '7', sample: true },
    { input: 'S = [1, 2, 3, 4, 5]', args: 'new int[]{1, 2, 3, 4, 5}', expect: '0', sample: true },
    { args: 'new int[]{1, 3, 2}', expect: '3' },
    { args: 'new int[]{5, 1, 4, 2, 3, 9}', expect: '5' },
  ],
},
{
  id: 'cp03', group: 'mock', part: 'blank', title: 'UP & DOWN 게임', topic: '범위 좁히기',
  statement: `출제자는 1 이상 K 이하의 수 하나를 정하고, 참가자는 수를 말해 맞힙니다. 출제자는 정답이 말한 수보다 크면 "UP", 작으면 "DOWN", 같으면 "RIGHT"라고 답합니다.

참가자가 말한 수 numbers와 출제자의 답 upDown이 순서대로 주어질 때, 지금까지의 대화로 보아 정답이 될 수 있는 수의 개수를 return 하도록 빈칸을 채워 주세요. 이미 "RIGHT"가 나왔다면 1을 return 합니다.`,
  constraints: ['K는 1 이상 10,000 이하입니다.', 'numbers와 upDown의 길이는 1 이상 10 이하로 같습니다.', 'upDown의 원소는 "UP", "DOWN", "RIGHT" 중 하나이며 대화는 모순 없이 진행됩니다.'],
  starter: `class Solution {
    public int solution(int K, int[] numbers, String[] upDown) {
        int left = 1;
        int right = K;
        for (int i = 0; i < numbers.length; i++) {
            int num = numbers[i];
            if (upDown[i].equals("UP"))
                left = ___________;
            else if (upDown[i].equals("DOWN"))
                right = ___________;
            else if (upDown[i].equals("RIGHT"))
                return 1;
        }
        return ___________;
    }
}`,
  answer: `class Solution {
    public int solution(int K, int[] numbers, String[] upDown) {
        int left = 1;
        int right = K;
        for (int i = 0; i < numbers.length; i++) {
            int num = numbers[i];
            if (upDown[i].equals("UP"))
                left = Math.max(left, num + 1);
            else if (upDown[i].equals("DOWN"))
                right = Math.min(right, num - 1);
            else if (upDown[i].equals("RIGHT"))
                return 1;
        }
        return right - left + 1;
    }
}`,
  explain: '"UP"이면 정답은 말한 수보다 크므로 아래쪽 끝이 num + 1로, "DOWN"이면 위쪽 끝이 num - 1로 좁혀집니다. 남은 범위 [left, right]에 들어 있는 수의 개수는 right - left + 1입니다. 대화가 모순 없이 진행되므로 num + 1, num - 1만 써도 통과합니다.',
  tests: [
    { input: 'K = 10, numbers = [4, 9, 6], upDown = ["UP", "DOWN", "UP"]', args: '10, new int[]{4, 9, 6}, new String[]{"UP", "DOWN", "UP"}', expect: '2', sample: true },
    { input: 'K = 100, numbers = [97, 98], upDown = ["UP", "RIGHT"]', args: '100, new int[]{97, 98}, new String[]{"UP", "RIGHT"}', expect: '1', sample: true },
    { input: 'K = 50, numbers = [25, 12, 18], upDown = ["DOWN", "UP", "UP"]', args: '50, new int[]{25, 12, 18}, new String[]{"DOWN", "UP", "UP"}', expect: '6', sample: true },
    { args: '5, new int[]{3}, new String[]{"DOWN"}', expect: '2' },
    { args: '1000, new int[]{500}, new String[]{"UP"}', expect: '500' },
  ],
},
{
  id: 'cp04', group: 'mock', part: 'blank', title: '아르바이트와 판매사원 급여', topic: '상속 · 오버라이딩',
  statement: `아르바이트(PartTimeJob)와 판매사원(SalesJob)의 급여를 계산하려 합니다. 두 직업은 모두 Job을 상속받고, 급여 계산 방법만 다릅니다.

• 아르바이트: 일한 시간 × 시급. 일한 시간이 40시간 이상이면 시급 8시간분을 보너스로 더 받습니다.
• 판매사원: 판매 실적 × 건당 수당. 실적이 20건을 넘으면 3배, 10건을 넘으면 2배를 받습니다.

아르바이트 목록 partTimeJobs([일한 시간, 시급])와 판매사원 목록 salesJobs([판매 실적, 건당 수당])가 주어질 때, 모든 사람의 급여 합을 return 하도록 빈칸을 채워 주세요.
solution 함수는 각 객체를 Job 타입 변수에 담아 getSalary()를 부릅니다.`,
  constraints: ['일한 시간은 1 이상 100 이하, 시급은 1,000 이상 20,000 이하입니다.', '판매 실적은 1 이상 30 이하, 건당 수당은 1,000 이상 20,000 이하입니다.', '두 배열의 길이는 1 이상 10 이하입니다.'],
  starter: `class Job {
    int salary;

    Job() {
        salary = 0;
    }

    int getSalary() {
        return salary;
    }
}

class PartTimeJob ___________ {
    int workHour, payPerHour;

    PartTimeJob(int workHour, int payPerHour) {
        super();
        this.workHour = workHour;
        this.payPerHour = payPerHour;
    }

    ___________ {
        salary = workHour * payPerHour;
        if (workHour >= 40)
            salary += payPerHour * 8;
        return salary;
    }
}

class SalesJob ___________ {
    int salesResult, payPerSale;

    SalesJob(int salesResult, int payPerSale) {
        super();
        this.salesResult = salesResult;
        this.payPerSale = payPerSale;
    }

    ___________ {
        if (salesResult > 20)
            salary = salesResult * payPerSale * 3;
        else if (salesResult > 10)
            salary = salesResult * payPerSale * 2;
        else
            salary = salesResult * payPerSale;
        return salary;
    }
}

class Solution {
    public int solution(int[][] partTimeJobs, int[][] salesJobs) {
        int answer = 0;
        for (int[] p : partTimeJobs) {
            Job job = new PartTimeJob(p[0], p[1]);
            answer += job.getSalary();
        }
        for (int[] s : salesJobs) {
            Job job = new SalesJob(s[0], s[1]);
            answer += job.getSalary();
        }
        return answer;
    }
}`,
  answer: `class Job {
    int salary;

    Job() {
        salary = 0;
    }

    int getSalary() {
        return salary;
    }
}

class PartTimeJob extends Job {
    int workHour, payPerHour;

    PartTimeJob(int workHour, int payPerHour) {
        super();
        this.workHour = workHour;
        this.payPerHour = payPerHour;
    }

    @Override
    int getSalary() {
        salary = workHour * payPerHour;
        if (workHour >= 40)
            salary += payPerHour * 8;
        return salary;
    }
}

class SalesJob extends Job {
    int salesResult, payPerSale;

    SalesJob(int salesResult, int payPerSale) {
        super();
        this.salesResult = salesResult;
        this.payPerSale = payPerSale;
    }

    @Override
    int getSalary() {
        if (salesResult > 20)
            salary = salesResult * payPerSale * 3;
        else if (salesResult > 10)
            salary = salesResult * payPerSale * 2;
        else
            salary = salesResult * payPerSale;
        return salary;
    }
}

class Solution {
    public int solution(int[][] partTimeJobs, int[][] salesJobs) {
        int answer = 0;
        for (int[] p : partTimeJobs) {
            Job job = new PartTimeJob(p[0], p[1]);
            answer += job.getSalary();
        }
        for (int[] s : salesJobs) {
            Job job = new SalesJob(s[0], s[1]);
            answer += job.getSalary();
        }
        return answer;
    }
}`,
  explain: 'super()를 부르고 Job 타입 변수에 담으려면 두 클래스가 extends Job 으로 Job을 상속해야 합니다. 급여 계산 블록은 Job의 getSalary()를 다시 정의(오버라이딩)하는 메서드여야 job.getSalary()를 부를 때 각 직업의 계산이 실행됩니다. 이름을 다르게 지으면 Job의 getSalary()가 불려 0이 나옵니다.',
  tests: [
    { input: 'partTimeJobs = [[10, 5000], [43, 6800], [5, 12800]], salesJobs = [[3, 18000], [12, 8500]]', args: 'new int[][]{{10, 5000}, {43, 6800}, {5, 12800}}, new int[][]{{3, 18000}, {12, 8500}}', expect: '718800', sample: true },
    { input: 'partTimeJobs = [[40, 10000]], salesJobs = [[21, 1000]]', args: 'new int[][]{{40, 10000}}, new int[][]{{21, 1000}}', expect: '543000', sample: true },
    { input: 'partTimeJobs = [[1, 1000]], salesJobs = [[10, 1000], [11, 1000]]', args: 'new int[][]{{1, 1000}}, new int[][]{{10, 1000}, {11, 1000}}', expect: '33000', sample: true },
    { args: 'new int[][]{{39, 2000}, {100, 20000}}, new int[][]{{20, 5000}, {30, 20000}}', expect: '4238000' },
    { args: 'new int[][]{{50, 1500}}, new int[][]{{1, 1000}}', expect: '88000' },
  ],
},
/* ================= 모의고사: 한 줄 바꾸기 ================= */
{
  id: 'cp05', group: 'mock', part: 'line', title: '종이 한 번 접기', topic: '2차원 배열 · 완전탐색',
  statement: `가로 · 세로 4칸짜리 정사각형 종이의 칸마다 자연수가 적혀 있습니다. 이 종이를 칸 사이의 가로선 또는 세로선 하나를 따라 한 번 접습니다.

접으면 접는 선을 기준으로 대칭인 칸끼리 정확히 포개집니다. 같은 행(또는 같은 열)에서 두 칸 사이의 거리가 홀수일 때만 두 칸 사이에 접는 선이 놓일 수 있어 정확히 포개집니다.

포개지는 두 칸에 적힌 수의 합 가운데 가장 큰 값을 return 하려고 합니다. 아래 코드는 한 줄이 틀려 올바른 답을 내지 못합니다. 한 줄만 고쳐 주세요.`,
  constraints: ['grid는 4 × 4 크기입니다.', '각 칸의 수는 1 이상 100 이하의 자연수입니다.'],
  starter: `class Solution {
    public int solution(int[][] grid) {
        int answer = 0;
        for (int i = 0; i < 4; i++)
            for (int j = 0; j < 4; j++)
                for (int k = j + 1; k < 4; k += 2)
                    answer = Math.max(answer, Math.max(grid[i][j] + grid[j][k], grid[j][k] + grid[k][i]));
        return answer;
    }
}`,
  answer: `class Solution {
    public int solution(int[][] grid) {
        int answer = 0;
        for (int i = 0; i < 4; i++)
            for (int j = 0; j < 4; j++)
                for (int k = j + 1; k < 4; k += 2)
                    answer = Math.max(answer, Math.max(grid[i][j] + grid[i][k], grid[j][i] + grid[k][i]));
        return answer;
    }
}`,
  explain: 'k는 j에서 홀수만큼 떨어진 칸입니다. i행 안에서 포개지는 두 칸은 grid[i][j]와 grid[i][k], i열 안에서 포개지는 두 칸은 grid[j][i]와 grid[k][i]입니다. 틀린 줄은 행과 열 인덱스를 섞어 썼습니다.',
  tests: [
    { input: 'grid = [[1, 4, 16, 1], [20, 5, 15, 8], [6, 13, 36, 14], [20, 7, 19, 15]]', args: 'new int[][]{{1, 4, 16, 1}, {20, 5, 15, 8}, {6, 13, 36, 14}, {20, 7, 19, 15}}', expect: '55', sample: true },
    { input: 'grid = [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]', args: 'new int[][]{{1, 1, 1, 1}, {1, 1, 1, 1}, {1, 1, 1, 1}, {1, 1, 1, 1}}', expect: '2', sample: true },
    { input: 'grid = [[50, 2, 3, 60], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]]', args: 'new int[][]{{50, 2, 3, 60}, {4, 5, 6, 7}, {8, 9, 10, 11}, {12, 13, 14, 15}}', expect: '110', sample: true },
    { args: 'new int[][]{{9, 1, 1, 1}, {1, 1, 1, 1}, {1, 1, 1, 1}, {80, 1, 1, 1}}', expect: '89' },
    { args: 'new int[][]{{5, 90, 1, 2}, {3, 4, 5, 6}, {7, 8, 9, 10}, {11, 12, 13, 100}}', expect: '113' },
  ],
},
{
  id: 'cp06', group: 'mock', part: 'line', title: '보드게임 동전 모으기', topic: 'DP',
  statement: `4 × 4 보드의 왼쪽 위 칸에서 말을 출발시켜 오른쪽 아래 칸까지 옮깁니다. 말은 한 번에 오른쪽 또는 아래쪽으로 한 칸씩만 움직이고, 지나가는 칸(출발 칸과 도착 칸 포함)의 동전을 모두 줍습니다.

각 칸의 동전 수 board가 주어질 때, 주울 수 있는 동전의 최댓값을 return 하려고 합니다. 아래 코드는 한 줄이 틀렸습니다. 한 줄만 고쳐 주세요.`,
  constraints: ['board는 4 × 4 크기입니다.', '각 칸의 동전 수는 1 이상 9 이하입니다.'],
  starter: `class Solution {
    public int solution(int[][] board) {
        int[][] coins = new int[4][4];
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                if (i == 0 && j == 0)
                    coins[i][j] = board[i][j];
                else if (i == 0)
                    coins[i][j] = board[i][j] + coins[i][j - 1];
                else if (j == 0)
                    coins[i][j] = board[i][j] + coins[i - 1][j];
                else
                    coins[i][j] = board[i][j] + Math.max(coins[i][j], coins[i - 1][j - 1]);
            }
        }
        return coins[3][3];
    }
}`,
  answer: `class Solution {
    public int solution(int[][] board) {
        int[][] coins = new int[4][4];
        for (int i = 0; i < 4; i++) {
            for (int j = 0; j < 4; j++) {
                if (i == 0 && j == 0)
                    coins[i][j] = board[i][j];
                else if (i == 0)
                    coins[i][j] = board[i][j] + coins[i][j - 1];
                else if (j == 0)
                    coins[i][j] = board[i][j] + coins[i - 1][j];
                else
                    coins[i][j] = board[i][j] + Math.max(coins[i - 1][j], coins[i][j - 1]);
            }
        }
        return coins[3][3];
    }
}`,
  explain: 'coins[i][j]는 (i, j)까지 오면서 모은 최대 동전 수입니다. 이 칸에는 위 칸(i - 1, j)이나 왼쪽 칸(i, j - 1)에서만 들어올 수 있으므로 둘 중 큰 값에 현재 칸 동전을 더합니다. 틀린 줄은 아직 계산하지 않은 자기 칸과 갈 수 없는 대각선 칸을 비교했습니다.',
  tests: [
    { input: 'board = [[6, 7, 1, 2], [3, 5, 3, 9], [6, 4, 5, 2], [7, 3, 2, 6]]', args: 'new int[][]{{6, 7, 1, 2}, {3, 5, 3, 9}, {6, 4, 5, 2}, {7, 3, 2, 6}}', expect: '38', sample: true },
    { input: 'board = [[1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 1, 1]]', args: 'new int[][]{{1, 1, 1, 1}, {1, 1, 1, 1}, {1, 1, 1, 1}, {1, 1, 1, 1}}', expect: '7', sample: true },
    { input: 'board = [[1, 9, 9, 9], [1, 1, 1, 9], [9, 1, 1, 9], [9, 9, 1, 1]]', args: 'new int[][]{{1, 9, 9, 9}, {1, 1, 1, 9}, {9, 1, 1, 9}, {9, 9, 1, 1}}', expect: '47', sample: true },
    { args: 'new int[][]{{9, 1, 1, 1}, {9, 1, 1, 1}, {9, 1, 1, 1}, {9, 9, 9, 9}}', expect: '63' },
    { args: 'new int[][]{{5, 3, 2, 8}, {1, 9, 4, 2}, {7, 2, 6, 3}, {4, 8, 1, 5}}', expect: '35' },
  ],
},
{
  id: 'cp07', group: 'mock', part: 'line', title: '카드 섞기', topic: '배열 · 시뮬레이션',
  statement: `1번부터 n번까지 카드가 쌓여 있고, 맨 아래가 1번입니다(배열의 0번 칸이 맨 아래). 카드는 다음 방법으로 섞습니다.

1. 카드 더미를 아래쪽 절반(A)과 위쪽 절반(B)으로 정확히 나눕니다.
2. 아래에서부터 A의 카드, B의 카드를 한 장씩 번갈아 쌓아 새 더미를 만듭니다. (맨 아래는 A의 맨 아래 카드입니다.)

이 섞기를 mix번 반복했을 때 아래에서 k번째에 있는 카드 번호를 return 하려고 합니다. 아래 코드는 한 줄이 틀렸습니다. 한 줄만 고쳐 주세요.`,
  constraints: ['n은 6 이상 50 이하의 짝수입니다.', 'mix는 0 이상 10 이하입니다.', 'k는 1 이상 n 이하입니다.'],
  starter: `class Solution {
    public int solution(int n, int mix, int k) {
        int[] card = new int[n];
        for (int i = 0; i < n; i++)
            card[i] = i + 1;
        while (mix > 0) {
            mix--;
            int[] cardA = new int[n / 2];
            int[] cardB = new int[n / 2];
            for (int i = 0; i < n; i++) {
                if (i < n / 2)
                    cardA[i] = card[i];
                else
                    cardB[i] = card[i];
            }
            for (int i = 0; i < n; i++) {
                if (i % 2 == 0)
                    card[i] = cardA[i / 2];
                else
                    card[i] = cardB[i / 2];
            }
        }
        return card[k - 1];
    }
}`,
  answer: `class Solution {
    public int solution(int n, int mix, int k) {
        int[] card = new int[n];
        for (int i = 0; i < n; i++)
            card[i] = i + 1;
        while (mix > 0) {
            mix--;
            int[] cardA = new int[n / 2];
            int[] cardB = new int[n / 2];
            for (int i = 0; i < n; i++) {
                if (i < n / 2)
                    cardA[i] = card[i];
                else
                    cardB[i - n / 2] = card[i];
            }
            for (int i = 0; i < n; i++) {
                if (i % 2 == 0)
                    card[i] = cardA[i / 2];
                else
                    card[i] = cardB[i / 2];
            }
        }
        return card[k - 1];
    }
}`,
  explain: '위쪽 절반은 card의 n / 2번 칸부터 시작하지만 cardB는 0번 칸부터 채워야 합니다. 그래서 cardB[i - n / 2]에 넣어야 합니다. 틀린 줄은 cardB[i]에 넣어 배열 범위를 벗어납니다(ArrayIndexOutOfBoundsException).',
  tests: [
    { input: 'n = 6, mix = 3, k = 3', args: '6, 3, 3', expect: '5', sample: true },
    { input: 'n = 10, mix = 1, k = 2', args: '10, 1, 2', expect: '6', sample: true },
    { input: 'n = 10, mix = 2, k = 5', args: '10, 2, 5', expect: '2', sample: true },
    { args: '20, 0, 7', expect: '7' },
    { args: '50, 10, 50', expect: '50' },
  ],
},
/* ================= 모의고사: 함수 작성 ================= */
{
  id: 'cp08', group: 'mock', part: 'func', title: '꽃 피우기', topic: 'BFS',
  statement: `정사각형 모양 정원의 칸마다 꽃이 한 송이씩 있고, 피었으면 1, 아직 안 피었으면 0입니다. 핀 꽃은 하루가 지나면 위 · 아래 · 왼쪽 · 오른쪽으로 이웃한 꽃을 피웁니다.

정원 상태 garden이 주어질 때 모든 꽃이 피기까지 며칠이 걸리는지 return 하는 solution 함수를 작성해 주세요. 이미 모두 피어 있으면 0입니다.`,
  constraints: ['정원 한 변의 길이는 2 이상 100 이하입니다.', '원소는 0 또는 1이며, 적어도 한 송이는 피어 있습니다.'],
  starter: `class Solution {
    public int solution(int[][] garden) {
        int answer = 0;
        return answer;
    }
}`,
  answer: `import java.util.*;

class Solution {
    public int solution(int[][] garden) {
        int n = garden.length;
        int[][] day = new int[n][n];
        ArrayDeque<int[]> queue = new ArrayDeque<>();
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                day[i][j] = -1;
                if (garden[i][j] == 1) {
                    day[i][j] = 0;
                    queue.add(new int[]{i, j});
                }
            }
        }
        int[] dr = {1, -1, 0, 0};
        int[] dc = {0, 0, 1, -1};
        int answer = 0;
        while (!queue.isEmpty()) {
            int[] cur = queue.poll();
            answer = Math.max(answer, day[cur[0]][cur[1]]);
            for (int d = 0; d < 4; d++) {
                int r = cur[0] + dr[d];
                int c = cur[1] + dc[d];
                if (r < 0 || c < 0 || r >= n || c >= n || day[r][c] != -1) continue;
                day[r][c] = day[cur[0]][cur[1]] + 1;
                queue.add(new int[]{r, c});
            }
        }
        return answer;
    }
}`,
  explain: '이미 핀 꽃을 모두 큐에 넣고 동시에 출발하는 BFS(다중 시작점 BFS)입니다. 각 칸이 처음 방문될 때의 날짜가 그 꽃이 피는 날이고, 그중 가장 늦은 날이 답입니다. 날마다 정원 전체를 다시 훑어도 되지만 한 변이 100이면 느려질 수 있습니다.',
  tests: [
    { input: 'garden = [[0, 0, 0], [0, 1, 0], [0, 0, 0]]', args: 'new int[][]{{0, 0, 0}, {0, 1, 0}, {0, 0, 0}}', expect: '2', sample: true },
    { input: 'garden = [[1, 1], [1, 1]]', args: 'new int[][]{{1, 1}, {1, 1}}', expect: '0', sample: true },
    { input: 'garden = [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]', args: 'new int[][]{{1, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}, {0, 0, 0, 0}}', expect: '6', sample: true },
    { args: 'new int[][]{{0, 0, 0, 0, 1}, {0, 0, 0, 0, 0}, {0, 0, 0, 0, 0}, {0, 0, 0, 0, 0}, {1, 0, 0, 0, 0}}', expect: '4' },
    { args: 'new int[][]{{1, 0}, {0, 0}}', expect: '2' },
  ],
},
{
  id: 'cp09', group: 'mock', part: 'func', title: '숫자 K개 뽑기', topic: '정렬 · 슬라이딩 윈도',
  statement: `자연수가 담긴 배열 arr에서 수 K개를 고르려고 합니다. 고른 수 중 가장 큰 수와 가장 작은 수의 차이가 가장 작아지도록 고를 때, 그 차이를 return 하는 solution 함수를 작성해 주세요.

예를 들어 arr = [9, 11, 9, 6, 4, 19], K = 4이면 [9, 11, 9, 6]을 골라 차이 11 - 6 = 5를 만들 수 있고, 이보다 작게 만들 수는 없습니다.`,
  constraints: ['arr의 길이는 5 이상 1,000 이하입니다.', 'arr의 원소는 1 이상 10,000 이하의 자연수입니다.', 'K는 4 이상 50 이하이며 arr의 길이 이하입니다.'],
  starter: `class Solution {
    public int solution(int[] arr, int K) {
        int answer = 0;
        return answer;
    }
}`,
  answer: `import java.util.*;

class Solution {
    public int solution(int[] arr, int K) {
        int[] sorted = arr.clone();
        Arrays.sort(sorted);
        int answer = Integer.MAX_VALUE;
        for (int i = 0; i + K - 1 < sorted.length; i++)
            answer = Math.min(answer, sorted[i + K - 1] - sorted[i]);
        return answer;
    }
}`,
  explain: '정렬하면 차이가 가장 작은 K개는 반드시 이웃한 K개 구간 안에 있습니다. 정렬 뒤 길이 K인 구간을 한 칸씩 밀며 (끝 - 시작)의 최솟값을 구합니다. 시간 복잡도는 정렬이 좌우하는 O(n log n)입니다.',
  tests: [
    { input: 'arr = [9, 11, 9, 6, 4, 19], K = 4', args: 'new int[]{9, 11, 9, 6, 4, 19}, 4', expect: '5', sample: true },
    { input: 'arr = [1, 2, 3, 4, 5], K = 4', args: 'new int[]{1, 2, 3, 4, 5}, 4', expect: '3', sample: true },
    { input: 'arr = [10, 20, 30, 40, 50, 60, 11, 12, 13, 14], K = 4', args: 'new int[]{10, 20, 30, 40, 50, 60, 11, 12, 13, 14}, 4', expect: '3', sample: true },
    { args: 'new int[]{7, 7, 7, 7, 7}, 5', expect: '0' },
    { args: 'new int[]{100, 1, 50, 52, 49, 51, 300}, 4', expect: '3' },
  ],
},
{
  id: 'cp10', group: 'mock', part: 'func', title: '메모장 줄 수', topic: '문자열 · 구현',
  statement: `한 줄에 K칸까지 쓸 수 있는 메모장에 영어 단어들을 순서대로 적습니다. 같은 줄의 단어 사이에는 빈칸을 하나씩 둡니다. 다음 단어를 지금 줄에 통째로 쓸 수 없으면 남은 칸은 비워 두고 다음 줄 처음부터 씁니다.

K와 단어 목록 words가 주어질 때 모든 단어를 쓰는 데 필요한 줄 수를 return 하는 solution 함수를 작성해 주세요.

예를 들어 K = 10, words = ["nice", "happy", "hello", "world", "hi"]이면 "nice happy"(10칸), "hello", "world hi" 세 줄이 필요합니다.`,
  constraints: ['K는 5 이상 30 이하입니다.', 'words의 길이는 1 이상 100 이하입니다.', '단어는 영어 소문자로만 이루어져 있고 길이는 K 이하입니다.'],
  starter: `class Solution {
    public int solution(int K, String[] words) {
        int answer = 0;
        return answer;
    }
}`,
  answer: `class Solution {
    public int solution(int K, String[] words) {
        int lines = 1;
        int used = 0;
        for (String w : words) {
            if (used == 0)
                used = w.length();
            else if (used + 1 + w.length() <= K)
                used += 1 + w.length();
            else {
                lines++;
                used = w.length();
            }
        }
        return lines;
    }
}`,
  explain: '지금 줄에 쓴 칸 수(used)를 들고 다니며, 빈칸 하나와 다음 단어가 K 안에 들어가면 같은 줄에, 아니면 새 줄에 씁니다. 줄의 첫 단어 앞에는 빈칸이 없다는 점을 따로 처리해야 합니다.',
  tests: [
    { input: 'K = 10, words = ["nice", "happy", "hello", "world", "hi"]', args: '10, new String[]{"nice", "happy", "hello", "world", "hi"}', expect: '3', sample: true },
    { input: 'K = 5, words = ["abcde"]', args: '5, new String[]{"abcde"}', expect: '1', sample: true },
    { input: 'K = 12, words = ["a", "bb", "ccc", "dddd", "eeeee"]', args: '12, new String[]{"a", "bb", "ccc", "dddd", "eeeee"}', expect: '2', sample: true },
    { args: '5, new String[]{"ab", "cd", "ef", "gh"}', expect: '2' },
    { args: '20, new String[]{"programmers", "cos", "pro", "java", "level", "one"}', expect: '2' },
  ],
},
/* ================= 추가 예제 ================= */
{
  id: 'cx01', group: 'extra', part: 'blank', title: '할인 쿠폰 고르기', topic: '추상 클래스 · 다형성',
  statement: `상품 가격 price와 쿠폰 목록이 주어집니다. 쿠폰은 두 종류입니다.

• "FIXED": 정해진 금액(value)을 깎아 줍니다.
• "RATE": 가격의 value%를 깎아 줍니다. (소수점 아래는 버립니다.)

쿠폰은 한 장만 쓸 수 있고 결제 금액은 0원보다 작아지지 않습니다. 가장 적게 낼 수 있는 금액을 return 하도록 빈칸을 채워 주세요. 두 쿠폰 클래스는 추상 클래스 Coupon을 상속합니다.`,
  constraints: ['price는 1 이상 1,000,000 이하입니다.', 'types와 values의 길이는 1 이상 10 이하로 같습니다.', 'RATE의 value는 1 이상 100 이하입니다.'],
  starter: `abstract class Coupon {
    abstract int discount(int price);
}

class FixedCoupon ___________ {
    int amount;

    FixedCoupon(int amount) {
        this.amount = amount;
    }

    ___________ {
        return amount;
    }
}

class RateCoupon extends Coupon {
    int percent;

    RateCoupon(int percent) {
        this.percent = percent;
    }

    @Override
    int discount(int price) {
        return price * percent / 100;
    }
}

class Solution {
    public int solution(int price, String[] types, int[] values) {
        int answer = price;
        for (int i = 0; i < types.length; i++) {
            Coupon coupon;
            if (types[i].equals("FIXED"))
                coupon = new FixedCoupon(values[i]);
            else
                coupon = new RateCoupon(values[i]);
            int pay = ___________;
            answer = Math.min(answer, pay);
        }
        return answer;
    }
}`,
  answer: `abstract class Coupon {
    abstract int discount(int price);
}

class FixedCoupon extends Coupon {
    int amount;

    FixedCoupon(int amount) {
        this.amount = amount;
    }

    @Override
    int discount(int price) {
        return amount;
    }
}

class RateCoupon extends Coupon {
    int percent;

    RateCoupon(int percent) {
        this.percent = percent;
    }

    @Override
    int discount(int price) {
        return price * percent / 100;
    }
}

class Solution {
    public int solution(int price, String[] types, int[] values) {
        int answer = price;
        for (int i = 0; i < types.length; i++) {
            Coupon coupon;
            if (types[i].equals("FIXED"))
                coupon = new FixedCoupon(values[i]);
            else
                coupon = new RateCoupon(values[i]);
            int pay = Math.max(0, price - coupon.discount(price));
            answer = Math.min(answer, pay);
        }
        return answer;
    }
}`,
  explain: 'FixedCoupon도 Coupon을 상속해야 Coupon 변수에 담을 수 있고, 추상 메서드 discount(int price)를 반드시 구현해야 컴파일됩니다. 결제 금액은 가격에서 할인액을 뺀 값이되, 할인액이 더 크면 0원입니다.',
  tests: [
    { input: 'price = 30000, types = ["FIXED", "RATE"], values = [5000, 20]', args: '30000, new String[]{"FIXED", "RATE"}, new int[]{5000, 20}', expect: '24000', sample: true },
    { input: 'price = 10000, types = ["FIXED"], values = [15000]', args: '10000, new String[]{"FIXED"}, new int[]{15000}', expect: '0', sample: true },
    { input: 'price = 48000, types = ["RATE", "RATE", "FIXED"], values = [10, 15, 7000]', args: '48000, new String[]{"RATE", "RATE", "FIXED"}, new int[]{10, 15, 7000}', expect: '40800', sample: true },
    { args: '9999, new String[]{"RATE"}, new int[]{33}', expect: '6700' },
    { args: '20000, new String[]{"FIXED", "RATE", "FIXED"}, new int[]{3000, 10, 1000}', expect: '17000' },
  ],
},
{
  id: 'cx02', group: 'extra', part: 'line', title: '연속 구간 최대 합', topic: 'DP (카데인)',
  statement: `정수 배열 arr에서 한 개 이상의 연속한 원소를 골라 합을 구할 때, 가장 큰 합을 return 하려고 합니다.

예를 들어 [-2, 1, -3, 4, -1, 2, 1, -5, 4]에서는 [4, -1, 2, 1]의 합 6이 가장 큽니다.
아래 코드는 한 줄이 틀렸습니다. 한 줄만 고쳐 주세요.`,
  constraints: ['arr의 길이는 1 이상 100,000 이하입니다.', 'arr의 원소는 -10,000 이상 10,000 이하입니다.'],
  starter: `class Solution {
    public int solution(int[] arr) {
        int current = arr[0];
        int best = arr[0];
        for (int i = 1; i < arr.length; i++) {
            current = Math.max(current, current + arr[i]);
            best = Math.max(best, current);
        }
        return best;
    }
}`,
  answer: `class Solution {
    public int solution(int[] arr) {
        int current = arr[0];
        int best = arr[0];
        for (int i = 1; i < arr.length; i++) {
            current = Math.max(arr[i], current + arr[i]);
            best = Math.max(best, current);
        }
        return best;
    }
}`,
  explain: 'current는 i번 원소에서 끝나는 연속 구간의 최대 합입니다. 앞 구간에 이어 붙이거나(current + arr[i]) arr[i]부터 새로 시작하는 것 중 큰 쪽을 고릅니다. 틀린 줄은 i번 원소를 건너뛸 수 있게 되어 연속 조건이 깨집니다.',
  tests: [
    { input: 'arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', args: 'new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4}', expect: '6', sample: true },
    { input: 'arr = [1, 2, 3]', args: 'new int[]{1, 2, 3}', expect: '6', sample: true },
    { input: 'arr = [-3, -1, -2]', args: 'new int[]{-3, -1, -2}', expect: '-1', sample: true },
    { args: 'new int[]{5, -9, 6, -2, 3}', expect: '7' },
    { args: 'new int[]{2, -1, 2, -1, 2}', expect: '4' },
  ],
},
{
  id: 'cx03', group: 'extra', part: 'func', title: '최대 동시 접속자', topic: '정렬 · 투 포인터',
  statement: `사내 그룹웨어의 접속 기록 sessions가 [접속 시각, 종료 시각] 쌍으로 주어집니다. 시각은 0시 0분부터 흐른 분 단위이고, 종료 시각에는 이미 접속이 끊긴 상태입니다. 그래서 한 사람의 종료 시각과 다른 사람의 접속 시각이 같으면 두 사람은 동시에 접속한 것이 아닙니다.

동시에 접속해 있던 사람 수의 최댓값을 return 하는 solution 함수를 작성해 주세요.`,
  constraints: ['sessions의 길이는 1 이상 100,000 이하입니다.', '0 ≤ 접속 시각 < 종료 시각 ≤ 1,440 입니다.'],
  starter: `class Solution {
    public int solution(int[][] sessions) {
        int answer = 0;
        return answer;
    }
}`,
  answer: `import java.util.*;

class Solution {
    public int solution(int[][] sessions) {
        int n = sessions.length;
        int[] starts = new int[n];
        int[] ends = new int[n];
        for (int i = 0; i < n; i++) {
            starts[i] = sessions[i][0];
            ends[i] = sessions[i][1];
        }
        Arrays.sort(starts);
        Arrays.sort(ends);
        int answer = 0, now = 0, e = 0;
        for (int s = 0; s < n; s++) {
            while (e < n && ends[e] <= starts[s]) {
                e++;
                now--;
            }
            now++;
            answer = Math.max(answer, now);
        }
        return answer;
    }
}`,
  explain: '접속 시각과 종료 시각을 따로 정렬한 뒤 접속을 하나씩 처리합니다. 그 전에 이미 끝난(종료 시각 ≤ 접속 시각) 세션을 빼 주면 현재 접속자 수를 구할 수 있습니다. 같은 시각이면 종료를 먼저 처리해야 조건에 맞습니다. 시각이 1,440까지라 분마다 세어도 되지만, 기록이 많으면 정렬 방식이 빠릅니다.',
  tests: [
    { input: 'sessions = [[1, 5], [2, 6], [4, 8], [7, 9]]', args: 'new int[][]{{1, 5}, {2, 6}, {4, 8}, {7, 9}}', expect: '3', sample: true },
    { input: 'sessions = [[0, 10]]', args: 'new int[][]{{0, 10}}', expect: '1', sample: true },
    { input: 'sessions = [[1, 3], [3, 5], [5, 7]]', args: 'new int[][]{{1, 3}, {3, 5}, {5, 7}}', expect: '1', sample: true },
    { args: 'new int[][]{{0, 100}, {10, 20}, {15, 25}, {18, 19}, {30, 40}}', expect: '4' },
    { args: 'new int[][]{{5, 6}, {5, 6}, {5, 6}, {6, 7}}', expect: '3' },
  ],
},

/* ================= 비트마스킹 ================= */
{
  id: 'cb01', group: 'bit', part: 'blank', title: '예산 딱 맞추기', topic: '비트마스크 · 부분집합',
  statement: `팀 회식 메뉴 가격이 배열 prices로 주어집니다. 메뉴를 한 개 이상 골라 가격 합이 정확히 budget이 되는 방법의 수를 return 하려고 합니다. 가격이 같아도 서로 다른 메뉴는 따로 셉니다.

메뉴가 n개일 때 1부터 2ⁿ - 1까지의 정수 mask 하나가 메뉴 선택 하나를 뜻합니다. mask의 i번째 비트가 1이면 i번 메뉴를 고른 것입니다. 예를 들어 n = 4일 때 mask = 5(이진수 0101)는 0번과 2번 메뉴를 고른 것입니다.
빈칸을 채워 주세요.`,
  constraints: ['prices의 길이는 1 이상 20 이하입니다.', 'prices의 원소와 budget은 1 이상 1,000 이하의 자연수입니다.'],
  starter: `class Solution {
    public int solution(int[] prices, int budget) {
        int n = prices.length;
        int answer = 0;
        // 공집합(mask = 0)은 세지 않는다
        for (int mask = 1; mask < ___________; mask++) {
            int sum = 0;
            for (int i = 0; i < n; i++) {
                if (___________)
                    sum += prices[i];
            }
            if (sum == budget)
                ___________;
        }
        return answer;
    }
}`,
  answer: `class Solution {
    public int solution(int[] prices, int budget) {
        int n = prices.length;
        int answer = 0;
        for (int mask = 1; mask < (1 << n); mask++) {
            int sum = 0;
            for (int i = 0; i < n; i++) {
                if ((mask & (1 << i)) != 0)
                    sum += prices[i];
            }
            if (sum == budget)
                answer++;
        }
        return answer;
    }
}`,
  explain: '원소가 n개인 집합의 부분집합은 2ⁿ개이고, 1 << n이 바로 2ⁿ입니다. i번 비트가 켜져 있는지는 mask & (1 << i)가 0이 아닌지로 확인합니다(((mask >> i) & 1) == 1로 써도 같습니다). 자바에서 & 는 == 보다 우선순위가 낮으므로 괄호를 꼭 씌워야 합니다. n이 20이면 약 100만 × 20번이라 충분히 빠릅니다.',
  tests: [
    { input: 'prices = [1, 2, 3, 4], budget = 5', args: 'new int[]{1, 2, 3, 4}, 5', expect: '2', sample: true },
    { input: 'prices = [3, 3, 3], budget = 6', args: 'new int[]{3, 3, 3}, 6', expect: '3', sample: true },
    { input: 'prices = [7, 1, 2, 3], budget = 100', args: 'new int[]{7, 1, 2, 3}, 100', expect: '0', sample: true },
    { args: 'new int[]{1, 1, 1, 1}, 2', expect: '6' },
    { args: 'new int[]{2, 4, 6, 8, 10}, 12', expect: '3' },
  ],
},
{
  id: 'cb02', group: 'bit', part: 'line', title: '그룹웨어 권한 검사', topic: '비트 플래그',
  statement: `그룹웨어는 사용자 권한을 정수 하나에 비트로 저장합니다. 0번 비트는 READ, 1번 비트는 WRITE, 2번 비트는 DELETE, 3번 비트는 SHARE 권한입니다. 예를 들어 권한 값 5(이진수 0101)는 READ와 DELETE를 가진 사용자입니다.

사용자들의 권한 값 perms와 어떤 작업에 필요한 권한 이름 목록 required가 주어질 때, 필요한 권한을 하나도 빠짐없이 모두 가진 사용자 수를 return 하려고 합니다. required가 비어 있으면 모든 사용자가 작업할 수 있습니다.
아래 코드는 한 줄이 틀렸습니다. 한 줄만 고쳐 주세요.`,
  constraints: ['perms의 길이는 1 이상 1,000 이하이고, 원소는 0 이상 15 이하입니다.', 'required의 원소는 "READ", "WRITE", "DELETE", "SHARE" 중 하나이며 중복되지 않습니다.'],
  starter: `class Solution {
    static final String[] NAMES = {"READ", "WRITE", "DELETE", "SHARE"};

    int bitOf(String name) {
        for (int i = 0; i < NAMES.length; i++)
            if (NAMES[i].equals(name))
                return 1 << i;
        return 0;
    }

    public int solution(int[] perms, String[] required) {
        int need = 0;
        for (String r : required)
            need |= bitOf(r);

        int answer = 0;
        for (int p : perms) {
            if ((p & need) != 0)
                answer++;
        }
        return answer;
    }
}`,
  answer: `class Solution {
    static final String[] NAMES = {"READ", "WRITE", "DELETE", "SHARE"};

    int bitOf(String name) {
        for (int i = 0; i < NAMES.length; i++)
            if (NAMES[i].equals(name))
                return 1 << i;
        return 0;
    }

    public int solution(int[] perms, String[] required) {
        int need = 0;
        for (String r : required)
            need |= bitOf(r);

        int answer = 0;
        for (int p : perms) {
            if ((p & need) == need)
                answer++;
        }
        return answer;
    }
}`,
  explain: '(p & need) != 0은 필요한 권한 중 "하나라도" 가졌는지를 봅니다. "모두" 가졌는지는 p & need가 need 그대로 남는지, 즉 (p & need) == need로 확인해야 합니다. (need & ~p) == 0으로 써도 같습니다. 필요한 권한이 없으면 need = 0이라 모든 사용자가 조건을 만족합니다.',
  tests: [
    { input: 'perms = [7, 5, 3, 15], required = ["READ", "DELETE"]', args: 'new int[]{7, 5, 3, 15}, new String[]{"READ", "DELETE"}', expect: '3', sample: true },
    { input: 'perms = [8, 12, 14, 6], required = ["DELETE", "SHARE"]', args: 'new int[]{8, 12, 14, 6}, new String[]{"DELETE", "SHARE"}', expect: '2', sample: true },
    { input: 'perms = [0, 1, 2], required = []', args: 'new int[]{0, 1, 2}, new String[]{}', expect: '3', sample: true },
    { args: 'new int[]{1, 2, 4, 8}, new String[]{"READ", "WRITE"}', expect: '0' },
    { args: 'new int[]{15, 13, 11}, new String[]{"SHARE", "READ", "WRITE"}', expect: '2' },
  ],
},
{
  id: 'cb03', group: 'bit', part: 'func', title: '업무 배정 최소 비용', topic: '비트마스크 DP',
  statement: `n명의 직원에게 n개의 업무를 한 사람당 정확히 하나씩 맡기려고 합니다. cost[i][j]는 i번 직원이 j번 업무를 맡을 때 드는 비용입니다.

모든 업무를 배정했을 때 드는 비용 합의 최솟값을 return 하는 solution 함수를 작성해 주세요.`,
  constraints: ['n은 1 이상 12 이하입니다.', 'cost는 n × n 배열이고, 원소는 0 이상 1,000 이하입니다.', '배정 순서를 모두 따지면 n = 12에서 12! ≈ 4억 8천만 가지라 시간이 부족할 수 있습니다.'],
  starter: `class Solution {
    public int solution(int[][] cost) {
        int answer = 0;
        return answer;
    }
}`,
  answer: `import java.util.*;

class Solution {
    public int solution(int[][] cost) {
        int n = cost.length;
        // dp[mask] = mask에 든 업무들을 0번 직원부터 차례로 배정했을 때의 최소 비용
        int[] dp = new int[1 << n];
        Arrays.fill(dp, Integer.MAX_VALUE);
        dp[0] = 0;
        for (int mask = 0; mask < (1 << n); mask++) {
            if (dp[mask] == Integer.MAX_VALUE) continue;
            int worker = Integer.bitCount(mask);   // 다음에 업무를 받을 직원
            if (worker == n) continue;
            for (int job = 0; job < n; job++) {
                if ((mask & (1 << job)) != 0) continue;
                int next = mask | (1 << job);
                dp[next] = Math.min(dp[next], dp[mask] + cost[worker][job]);
            }
        }
        return dp[(1 << n) - 1];
    }
}`,
  explain: '이미 배정한 업무의 집합을 비트마스크 mask로 두면, 켜진 비트 수(Integer.bitCount)가 곧 지금까지 업무를 받은 직원 수라 다음 직원 번호가 저절로 정해집니다. dp[mask]에서 아직 꺼진 업무 job을 골라 dp[mask | (1 << job)]을 갱신하면 상태 2ⁿ개 × 전이 n번, n = 12에서 약 5만 번으로 끝납니다.',
  tests: [
    { input: 'cost = [[9, 2, 7, 8], [6, 4, 3, 7], [5, 8, 1, 8], [7, 6, 9, 4]]', args: 'new int[][]{{9, 2, 7, 8}, {6, 4, 3, 7}, {5, 8, 1, 8}, {7, 6, 9, 4}}', expect: '13', sample: true },
    { input: 'cost = [[5]]', args: 'new int[][]{{5}}', expect: '5', sample: true },
    { input: 'cost = [[1, 2], [3, 4]]', args: 'new int[][]{{1, 2}, {3, 4}}', expect: '5', sample: true },
    { args: 'new int[][]{{10, 1, 1}, {1, 10, 1}, {1, 1, 10}}', expect: '3' },
    { args: 'new int[][]{{4, 1, 3}, {2, 0, 5}, {3, 2, 2}}', expect: '5' },
  ],
},
];

// 채점용 Main.java. 테스트마다 "@@CASE 번호 PASS|FAIL|ERROR 기대값 @@GOT 실제값" 한 줄을 찍는다
export function buildHarness(problem, onlySamples = false) {
  const lines = problem.tests
    .map((t, i) => ({ t, no: i + 1 }))
    .filter(({ t }) => !onlySamples || t.sample)
    .map(({ t, no }) => `        check(${no}, ${t.expect}, () -> new Solution().solution(${t.args}));`);
  return `import java.util.*;
import java.util.function.*;

public class Main {
    static String show(Object o) {
        String s = Arrays.deepToString(new Object[]{o});
        return s.substring(1, s.length() - 1).replace('\\n', ' ');
    }

    static void check(int no, Object expected, Supplier<Object> run) {
        String e = show(expected);
        try {
            String g = show(run.get());
            System.out.println("@@CASE " + no + (e.equals(g) ? " PASS " : " FAIL ") + e + " @@GOT " + g);
        } catch (Throwable t) {
            System.out.println("@@CASE " + no + " ERROR " + e + " @@GOT " + t);
        }
    }

    public static void main(String[] args) {
${lines.join('\n')}
    }
}
`;
}
