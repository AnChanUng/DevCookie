// 자료구조 유형 검사. 쿠키 연구소(/cookie/) 별관이며 사이트 메뉴에는 없다.
// 세 축(질서/자유 · 혼자/연결 · 최근 우선/계획 우선)을 질문 4개씩으로 재서 여덟 유형 중 하나를 고른다.
// 결과마다 그 자료구조를 면접에서 설명하는 법을 붙였다. 답변은 localStorage(dslab:*)에만 남는다.
(() => {
  'use strict';

  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('dslab:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('dslab:' + k, JSON.stringify(v)); } catch { /* 저장 못 해도 검사는 된다 */ } },
  };

  /* ================= 축과 질문 ================= */
  const AXES = [
    { a: 'O', b: 'F', aName: '질서', bName: '자유', aDesc: '정해진 순서대로 하나씩', bDesc: '원하는 걸 바로 꺼내 쓰기' },
    { a: 'S', b: 'C', aName: '독립', bName: '연결', aDesc: '혼자서도 완결되는', bDesc: '관계 속에서 빛나는' },
    { a: 'L', b: 'P', aName: '최근 우선', bName: '계획 우선', aDesc: '방금 들어온 것부터', bDesc: '먼저 온 것 · 중요한 것부터' },
  ];

  const QUESTIONS = [
    { axis: 0, scene: '📓', q: '새 학기, 전공 노트를 처음 펼쳤다.', a: '목차부터 만들고 1장부터 순서대로 채운다', b: '생각나는 대로 쓰고 나중에 Ctrl+F로 찾는다' },
    { axis: 1, scene: '🐞', q: '처음 보는 에러가 30분째 안 풀린다.', a: '오늘 밤을 새서라도 혼자 끝을 본다', b: '스터디 단톡방에 스크린샷부터 올린다' },
    { axis: 2, scene: '📝', q: '할 일이 잔뜩 쌓였다. 뭐부터 하지?', a: '방금 떠오른 것부터 해치운다. 식기 전에', b: '먼저 받은 일, 아니면 제일 중요한 일부터' },
    { axis: 0, scene: '📺', q: '친구가 재밌다는 드라마를 추천했다.', a: '당연히 1화부터 정주행', b: '"7화부터 재밌어" 하면 7화부터 본다' },
    { axis: 1, scene: '👥', q: '팀 프로젝트에서 내가 편한 역할은?', a: '내 파트를 완벽하게. 남의 파트는 믿고 맡긴다', b: '파트 사이를 잇고 전체 흐름을 챙기는 사람' },
    { axis: 2, scene: '💬', q: '카톡 안 읽은 채팅방이 12개다.', a: '맨 위, 가장 최근에 온 것부터 답한다', b: '제일 오래 기다린 사람부터 답한다' },
    { axis: 0, scene: '💻', q: '코딩테스트가 시작됐다. 문제는 5개.', a: '1번부터 차례대로 푼다', b: '전부 훑어보고 쉬운 것부터 골라 푼다' },
    { axis: 1, scene: '📍', q: '공부가 제일 잘 되는 장소는?', a: '독서실 1인석. 아무도 말 안 거는 곳', b: '카페나 스터디룸. 적당히 사람 소리가 나는 곳' },
    { axis: 2, scene: '📖', q: '내일이 시험이다. 오늘 밤 복습 전략은?', a: '제일 최근에 배운 것부터 거꾸로 훑는다', b: '범위 처음부터 차근차근 다시 본다' },
    { axis: 0, scene: '✈️', q: '3박 4일 여행 계획을 세운다.', a: '시간 단위 동선표를 만든다', b: '숙소만 잡고 도착해서 끌리는 데로 간다' },
    { axis: 1, scene: '🔖', q: '엄청 좋은 공부 자료를 발견했다.', a: '내 노션에 조용히 저장한다', b: '아는 사람들한테 바로 공유한다' },
    { axis: 2, scene: '🛒', q: '마음에 드는 키보드를 발견했다.', a: '꽂혔을 때 바로 결제', b: '장바구니에 넣고 일주일은 비교한다' },
  ];

  /* ================= 여덟 유형 ================= */
  const TYPES = {
    OSL: {
      id: 'stack', emoji: '📚', name: '스택', en: 'Stack', color: '#ff9f7a',
      tag: '가장 최근의 나에게 충실한, 되돌리기의 달인',
      desc: '당신은 지금 눈앞에 있는 일에 가장 먼저 반응합니다. 새로운 일이 오면 하던 걸 잠시 쌓아 두고 그것부터 처리하고, 끝나면 정확히 하던 곳으로 돌아옵니다. Ctrl+Z를 누구보다 사랑하며, 괄호 짝이 안 맞는 걸 보면 잠을 못 잡니다. 입구와 출구가 하나라 겉으론 단순해 보이지만, 모든 함수 호출은 당신 위에서 이루어진다는 걸 아는 사람은 압니다.',
      quotes: ['잠깐, 이것만 먼저 하고.', '아까 거 어디까지 했더라? 아 맞다.', '마지막에 넣은 게 제일 먼저 생각나.'],
      stats: [['정리력', 70, 'O(1)'], ['인싸력', 30, 'O(n)'], ['순발력', 95, 'O(1)'], ['멘탈', 55, '오버플로 주의']],
      pro: '몰입이 빠르고, 중간에 끼어든 일도 처리한 뒤 원래 하던 일로 정확히 돌아옵니다.',
      con: '일이 너무 쌓이면 맨 아래 있는 일은 영영 못 꺼냅니다. 한계를 넘으면 StackOverflowError.',
      best: ['OSP', '스택 두 개면 큐가 되고, 큐 두 개면 스택이 됩니다. 서로를 완성하는 사이.'],
      worst: ['FCL', 'DFS 할 때만 연락 옵니다. 그리고 재귀가 깊어지면 같이 터집니다.'],
      say: '스택은 나중에 들어온 데이터가 먼저 나가는 LIFO 구조입니다. 한쪽 끝(top)에서만 push와 pop이 일어나서 두 연산 모두 O(1)입니다. 함수 호출 스택, 괄호 짝 검사, 되돌리기 기능, DFS, 후위 표기식 계산에 씁니다.',
      bigO: [['push / pop', 'O(1)'], ['top 조회', 'O(1)'], ['임의 원소 탐색', 'O(n)']],
      use: '실제로 쓰는 곳: 브라우저 뒤로 가기, 에디터 실행 취소, JVM 스레드마다 있는 콜 스택',
      trap: '"재귀를 스택으로 바꿀 수 있나요?" 네. 재귀는 콜 스택을 암묵적으로 쓰는 것이라, 명시적 스택으로 옮기면 깊이 제한(StackOverflow)을 피할 수 있습니다.',
    },
    OSP: {
      id: 'queue', emoji: '🚶', name: '큐', en: 'Queue', color: '#6ee7b7',
      tag: '줄은 서라고 있는 것, 공정함의 수호자',
      desc: '당신에게 세상의 규칙은 간단합니다. 먼저 온 사람이 먼저. 새치기를 보면 속으로 경고를 세 번 날리고, 약속 시간엔 늘 5분 먼저 도착합니다. 누구에게나 공평하기 때문에 사람들은 당신을 믿고 일을 맡깁니다. BFS처럼 가까운 것부터 차근차근 넓혀 가는 스타일이라 결국 가장 짧은 길을 찾아냅니다.',
      quotes: ['순서대로 합시다, 순서대로.', '아까 먼저 물어본 분 거부터 할게요.', '제 앞에 세 명 있네요. 기다리죠 뭐.'],
      stats: [['정리력', 90, 'O(1)'], ['인싸력', 45, 'O(n)'], ['순발력', 40, 'FIFO'], ['멘탈', 85, '안정적']],
      pro: '공정하고 예측 가능합니다. 당신에게 맡긴 일은 언젠가 반드시 처리됩니다.',
      con: '급한 일도 줄을 서야 합니다. 앞에서 한 명이 막히면 전체가 멈춥니다(Head-of-line blocking).',
      best: ['OSL', '서로 두 개씩만 있으면 상대가 될 수 있는, 거울 같은 사이.'],
      worst: ['FCP', '"우선순위 높은 사람 먼저요~" 하고 들어오는 힙이 도저히 이해가 안 됩니다.'],
      say: '큐는 먼저 들어온 데이터가 먼저 나가는 FIFO 구조입니다. 뒤(rear)에 넣고 앞(front)에서 빼며 두 연산 모두 O(1)입니다. 배열로 만들면 앞칸이 낭비되기 때문에 원형 큐나 연결 리스트로 구현합니다. BFS, 작업 대기열, 프린터 스풀러, 메시지 큐에 씁니다.',
      bigO: [['enqueue / dequeue', 'O(1)'], ['front 조회', 'O(1)'], ['임의 원소 탐색', 'O(n)']],
      use: '실제로 쓰는 곳: 운영체제 준비 큐, Kafka · RabbitMQ 같은 메시지 큐, 콜센터 대기 순번',
      trap: '"배열로 큐를 만들면 뭐가 문제죠?" dequeue 후 앞쪽 공간이 버려집니다. 인덱스를 나머지 연산으로 돌리는 원형 큐로 해결하고, 가득 참과 빔을 구분하려고 한 칸을 비워 두거나 개수를 따로 셉니다.',
    },
    OCL: {
      id: 'linked', emoji: '🔗', name: '연결 리스트', en: 'Linked List', color: '#7cb7ff',
      tag: '다음 사람만 알면 충분한, 유연한 연결고리',
      desc: '당신은 큰 그림보다 바로 옆 사람과의 연결을 소중히 여깁니다. 전체 순서는 몰라도 "내 다음은 누구"만 확실히 알고, 그걸로 충분하다고 믿습니다. 계획이 바뀌어 중간에 누가 끼어들어도 손만 바꿔 잡으면 되니 변화에 강합니다. 다만 "열 번째 사람 누구야?"라는 질문엔 처음부터 세어 가야 해서 조금 느립니다.',
      quotes: ['그건 제 다음 사람한테 물어보세요.', '중간에 끼워 넣는 거? 쉽죠.', '처음부터 차근차근 따라가 볼게요.'],
      stats: [['정리력', 50, 'O(n)'], ['인싸력', 75, '포인터'], ['순발력', 80, 'O(1) 삽입'], ['멘탈', 60, 'null 주의']],
      pro: '변화에 유연합니다. 중간에 사람이 들어오고 나가도 주변 두 명만 손을 바꿔 잡으면 됩니다.',
      con: '한 명이라도 연락이 끊기면(null) 그 뒤로는 아무도 찾을 수 없습니다. 메모리 여기저기 흩어져 있어 캐시와도 서먹합니다.',
      best: ['FCL', '인접 리스트로 그래프의 인간관계를 뒤에서 다 받쳐 주는 숨은 실세.'],
      worst: ['FSP', '"5번째 칸 줘" 하면 바로 주는 배열 앞에서 늘 작아집니다.'],
      say: '연결 리스트는 각 노드가 데이터와 다음 노드의 주소를 갖고 이어진 구조입니다. 위치를 알고 있으면 삽입과 삭제가 포인터만 바꾸면 되므로 O(1)이지만, k번째 원소에 접근하려면 처음부터 따라가야 해서 O(n)입니다. 메모리가 연속적이지 않아 배열보다 캐시 효율이 떨어집니다.',
      bigO: [['맨 앞 삽입 · 삭제', 'O(1)'], ['위치를 알 때 삽입 · 삭제', 'O(1)'], ['k번째 접근 · 탐색', 'O(n)']],
      use: '실제로 쓰는 곳: LRU 캐시(해시맵 + 이중 연결 리스트), 자바 LinkedList, 해시 충돌 체이닝, 운영체제 free list',
      trap: '"ArrayList와 LinkedList 중 뭘 쓰나요?" 대부분 ArrayList입니다. 중간 삽입이 이론상 O(1)이어도 그 위치까지 가는 데 O(n)이 들고, 캐시 지역성 때문에 실측은 배열이 더 빠른 경우가 많습니다.',
    },
    OCP: {
      id: 'tree', emoji: '🌳', name: '트리', en: 'Tree', color: '#a3e635',
      tag: '위아래가 분명한 조직의 설계자',
      desc: '당신은 세상을 계층으로 이해합니다. 폴더 안에 폴더, 목차 안에 소제목, 조직도의 팀과 파트. 무엇이든 분류하고 구조를 세우면 마음이 편해지고, 그 구조 덕분에 수많은 것들 속에서도 절반씩 좁혀 가며 금세 답을 찾습니다. 사이클이 있는 관계는 질색입니다. 모든 길은 뿌리로 통해야 합니다.',
      quotes: ['일단 카테고리부터 나눠 봅시다.', '이건 저 폴더 밑으로 가야죠.', '큰 거부터 작은 거 순으로 정리하면 돼요.'],
      stats: [['정리력', 98, 'O(log n)'], ['인싸력', 60, '부모-자식'], ['순발력', 55, 'O(log n)'], ['멘탈', 70, '균형 잡으면 최강']],
      pro: '어떤 혼돈도 구조로 바꿔 놓습니다. 균형만 잘 잡으면 무엇이든 log n 번 안에 찾아냅니다.',
      con: '한쪽으로 쏠리면 그냥 긴 줄(연결 리스트)이 되어 버립니다. 그래서 가끔 스스로를 회전시켜 균형을 잡아야 합니다.',
      best: ['FCP', '완전 이진 트리 동문. 힙은 트리의 가장 부지런한 후배입니다.'],
      worst: ['FSL', '순서 없이 아무 데나 넣는데 더 빨리 찾는 해시맵이 얄밉습니다.'],
      say: '트리는 사이클 없이 계층을 이루는 비선형 구조입니다. 이진 탐색 트리는 왼쪽은 작은 값, 오른쪽은 큰 값으로 두어 평균 O(log n)에 탐색하지만, 한쪽으로 치우치면 O(n)까지 나빠집니다. 그래서 AVL이나 레드-블랙 트리처럼 회전으로 균형을 유지해 최악에도 O(log n)을 보장합니다.',
      bigO: [['균형 트리 탐색 · 삽입 · 삭제', 'O(log n)'], ['치우친 BST 최악', 'O(n)'], ['전체 순회', 'O(n)']],
      use: '실제로 쓰는 곳: 파일 시스템, DOM, 자바 TreeMap(레드-블랙 트리), DB 인덱스(B+트리), 트라이 자동 완성',
      trap: '"DB 인덱스는 왜 이진 트리가 아니라 B+트리인가요?" 디스크는 한 번에 블록 단위로 읽으므로, 노드 하나에 키를 많이 담아 높이를 낮추면 디스크 접근 횟수가 줄어듭니다. 리프끼리 연결되어 있어 범위 검색에도 유리합니다.',
    },
    FSL: {
      id: 'hash', emoji: '🗝️', name: '해시맵', en: 'HashMap', color: '#ffcb47',
      tag: '찾는 데 1초, 순서는 묻지 마세요',
      desc: '당신에게 중요한 건 순서가 아니라 속도입니다. 필요한 걸 떠올리는 순간 바로 꺼내는 능력이 있고, 그 비결은 나만 아는 분류법입니다. 책상은 어지러워 보여도 "그거 어딨어?" 하면 정확히 집어냅니다. 가끔 두 개가 같은 서랍에 들어가 헷갈리긴 하지만, 그럴 땐 옆에 줄줄이 달아 두면 그만입니다.',
      quotes: ['아 그거? 잠깐만. 여기.', '순서가 뭐가 중요해, 찾으면 되지.', '내 방은 내가 제일 잘 알아.'],
      stats: [['정리력', 40, '순서 없음'], ['인싸력', 50, 'key-value'], ['순발력', 99, 'O(1)'], ['멘탈', 65, '충돌 주의']],
      pro: '압도적으로 빠릅니다. 어떤 질문이든 평균 O(1)에 답합니다.',
      con: '"순서대로 보여 주세요"라는 요청에 약합니다. 짐이 너무 많아지면 이사(리해싱) 한 번에 크게 흔들립니다.',
      best: ['FSP', '사실 해시맵의 집은 배열입니다. 배열 없이는 존재할 수 없는 사이.'],
      worst: ['OCP', '만날 때마다 "좀 정렬 좀 하고 살아"라고 잔소리하는 트리.'],
      say: '해시맵은 키를 해시 함수에 넣어 나온 값으로 배열의 버킷 위치를 정하고 그 자리에 값을 저장합니다. 평균 O(1)에 삽입 · 조회 · 삭제가 됩니다. 서로 다른 키가 같은 버킷에 오는 충돌은 체이닝(리스트로 잇기)이나 개방 주소법(빈칸 찾아가기)으로 처리하고, 원소 수가 로드 팩터를 넘으면 배열을 키워 다시 배치합니다.',
      bigO: [['평균 삽입 · 조회 · 삭제', 'O(1)'], ['충돌이 몰린 최악', 'O(n)'], ['자바 8+ 버킷 트리화 후 최악', 'O(log n)']],
      use: '실제로 쓰는 곳: 캐시, 중복 제거, 두 수의 합 같은 코테 단골, DB 해시 조인, 파이썬 dict · 자바 HashMap',
      trap: '"equals를 재정의하면 hashCode도 재정의해야 하는 이유는?" 같은 객체는 같은 해시값을 가져야 같은 버킷을 찾기 때문입니다. hashCode가 다르면 equals가 true여도 HashMap이 다른 버킷을 뒤져 못 찾습니다.',
    },
    FSP: {
      id: 'array', emoji: '🧱', name: '배열', en: 'Array', color: '#c4b5fd',
      tag: '번호만 부르면 바로 나오는, 반듯한 모범생',
      desc: '당신의 삶은 번호가 매겨져 있습니다. 서랍 1번에는 양말, 2번에는 속옷. 위치가 정해져 있으니 몇 번째든 바로 꺼냅니다. 옆자리끼리 붙어 있는 걸 좋아해서 한번 흐름을 타면 누구보다 빠르게 쭉 훑어 나갑니다. 다만 중간에 뭔가를 끼워 넣으려면 뒤에 있는 걸 전부 한 칸씩 밀어야 해서, 갑작스러운 일정 변경은 반기지 않습니다.',
      quotes: ['그거 3번째 칸에 있어.', '자리 미리 정해 두면 편하잖아.', '중간에 끼워 달라고? 음… 다 밀어야 하는데.'],
      stats: [['정리력', 92, '연속 메모리'], ['인싸력', 35, '독립적'], ['순발력', 85, 'O(1) 접근'], ['멘탈', 75, '크기 고정']],
      pro: '빠르고 예측 가능합니다. 캐시와 궁합이 좋아서 실제 속도는 이론보다 더 빠릅니다.',
      con: '처음 정한 크기를 바꾸기 어렵습니다. 중간 삽입·삭제 요청이 오면 모두를 한 칸씩 움직여야 합니다.',
      best: ['FSL', '해시맵에게 집을 내어 준 든든한 기반. 둘이 합치면 O(1) 듀오.'],
      worst: ['OCL', '"중간에 넣는 건 원래 쉬운 거 아니야?"라는 연결 리스트의 말에 상처받습니다.'],
      say: '배열은 같은 타입의 원소를 메모리에 연속으로 저장하는 구조입니다. 시작 주소 + 인덱스 × 원소 크기로 위치를 바로 계산하므로 인덱스 접근이 O(1)이지만, 중간 삽입 · 삭제는 뒤 원소를 옮겨야 해서 O(n)입니다. 연속 메모리라 캐시 적중률이 높습니다. 동적 배열은 가득 차면 보통 1.5~2배로 키워 복사하므로 끝에 추가하는 비용이 분할 상환 O(1)입니다.',
      bigO: [['인덱스 접근', 'O(1)'], ['끝에 추가 (동적 배열)', 'O(1)*'], ['중간 삽입 · 삭제', 'O(n)']],
      use: '실제로 쓰는 곳: 거의 모든 곳. ArrayList, 이미지 픽셀, 힙과 해시맵의 내부 저장소, DP 테이블',
      trap: '"분할 상환(amortized) O(1)이 뭔가요?" 가끔 배열을 2배로 키우며 O(n) 복사가 일어나지만, n번 추가하는 동안 복사 총량이 2n 정도라 한 번당 평균은 O(1)이라는 뜻입니다.',
    },
    FCL: {
      id: 'graph', emoji: '🕸️', name: '그래프', en: 'Graph', color: '#f472b6',
      tag: '모든 사람이 다 아는 사람, 관계의 허브',
      desc: '당신은 연결 그 자체입니다. 위아래도 순서도 없이, 누구와도 선을 이을 수 있습니다. "그 사람 알아?" 하면 "친구의 친구"로라도 반드시 닿아 있고, 새로운 모임에 가면 30분 만에 인맥 지도를 완성합니다. 목적지까지 가는 길이 여러 개라는 걸 알기 때문에 막혀도 돌아갈 줄 압니다. 가끔 같은 곳을 빙빙 도는 사이클에 빠지는 게 흠.',
      quotes: ['아 그분? 제 친구의 동아리 선배예요.', '거기 가는 길 세 개 있는데 알려 줄까?', '다 연결되어 있어요, 결국.'],
      stats: [['정리력', 35, 'V + E'], ['인싸력', 100, '차수 ∞'], ['순발력', 70, 'BFS'], ['멘탈', 50, '사이클 주의']],
      pro: '어떤 문제든 관계로 바꿔 생각합니다. 최단 경로, 추천, 영향력 분석 모두 당신의 무대입니다.',
      con: '방문했던 곳을 체크하지 않으면 같은 자리를 무한히 돕니다. 관계가 많아질수록 메모리가 폭발합니다.',
      best: ['OCL', '당신의 넓은 인맥을 인접 리스트로 조용히 정리해 주는 비서.'],
      worst: ['OCP', '"사이클 있는 관계는 인정 못 해"라는 트리의 원칙주의가 답답합니다.'],
      say: '그래프는 정점과 그 사이를 잇는 간선으로 이루어진 구조로, 방향과 가중치 유무로 나뉩니다. 인접 행렬은 두 정점의 연결 확인이 O(1)이지만 공간이 O(V²)이고, 인접 리스트는 공간이 O(V+E)라 간선이 적은 희소 그래프에 유리합니다. BFS · DFS로 탐색하고, 다익스트라로 최단 경로를, 위상 정렬로 작업 순서를 구합니다.',
      bigO: [['BFS · DFS (인접 리스트)', 'O(V+E)'], ['다익스트라 (힙 사용)', 'O(E log V)'], ['인접 행렬 공간', 'O(V²)']],
      use: '실제로 쓰는 곳: 지도 길 찾기, SNS 친구 추천, 패키지 의존성 해결, 네트워크 라우팅',
      trap: '"다익스트라는 왜 음수 가중치에서 안 되나요?" 한 번 확정한 최단 거리가 나중에 음수 간선으로 더 줄어들 수 있기 때문입니다. 이때는 벨만-포드를 씁니다.',
    },
    FCP: {
      id: 'heap', emoji: '⛰️', name: '힙', en: 'Heap', color: '#fb923c',
      tag: '언제나 가장 중요한 것을 맨 위에 두는 전략가',
      desc: '당신은 우선순위의 화신입니다. 할 일이 백 개여도 지금 가장 중요한 하나가 무엇인지 늘 알고 있습니다. 나머지를 완벽하게 정렬하진 않지만, 필요한 건 딱 "지금 1순위"뿐이라는 걸 압니다. 새 일이 들어오면 제자리를 찾을 때까지 위로 올려 보내고, 1순위를 끝내면 다음 후보를 금세 끌어올립니다. 주변에선 당신을 "일머리 좋은 사람"이라고 부릅니다.',
      quotes: ['그건 급한 거 아니니까 나중에.', '지금 제일 중요한 게 뭐야?', '전부 정렬할 필요 없어. 맨 위만 알면 돼.'],
      stats: [['정리력', 75, '반정렬'], ['인싸력', 55, '부모 ≥ 자식'], ['순발력', 80, 'O(1) 최댓값'], ['멘탈', 88, 'O(log n) 회복']],
      pro: '무엇이 가장 중요한지 한눈에 압니다. 새 일을 받아도, 급한 일을 끝내도 log n 만에 다시 정리합니다.',
      con: '"세 번째로 중요한 게 뭐야?"라는 질문에는 약합니다. 1순위 말고는 순서를 보장하지 않거든요.',
      best: ['OCP', '같은 완전 이진 트리 출신. 트리가 가르친 구조를 가장 실용적으로 써먹는 후배.'],
      worst: ['OSP', '"새치기하지 마세요!"라는 큐의 눈초리가 늘 따갑습니다.'],
      say: '힙은 부모가 자식보다 항상 크거나(최대 힙) 작은(최소 힙) 완전 이진 트리입니다. 루트가 최댓값이라 조회는 O(1), 삽입과 삭제는 트리 높이만큼 위아래로 자리를 바꾸므로 O(log n)입니다. 완전 이진 트리라서 배열로 구현하며, i번 노드의 자식은 2i+1과 2i+2입니다. 우선순위 큐, 힙 정렬, 다익스트라, 상위 K개 구하기에 씁니다.',
      bigO: [['최댓값(최솟값) 조회', 'O(1)'], ['삽입 · 삭제', 'O(log n)'], ['배열로 힙 만들기', 'O(n)']],
      use: '실제로 쓰는 곳: 자바 PriorityQueue, 운영체제 우선순위 스케줄링, 다익스트라, 실시간 순위 Top-K',
      trap: '"힙 만들기는 왜 O(n log n)이 아니라 O(n)인가요?" 아래에서부터 heapify하면 대부분의 노드가 리프 근처에 있어 조금만 내려가면 되기 때문입니다. 높이별 비용을 합하면 O(n)으로 수렴합니다.',
    },
  };
  const BY_ID = Object.fromEntries(Object.entries(TYPES).map(([k, v]) => [v.id, k]));

  /* ================= 화면 전환 ================= */
  const SCREENS = ['intro', 'quiz', 'loading', 'result', 'all'];
  let prevScreen = 'intro';
  function show(id) {
    const cur = SCREENS.find(s => !$('#' + s).hidden);
    if (cur && cur !== 'all') prevScreen = cur;
    SCREENS.forEach(s => { $('#' + s).hidden = s !== id; });
    scrollTo({ top: 0, behavior: 'smooth' });
  }
  function setAccent(color) { document.documentElement.style.setProperty('--accent', color || '#e0a867'); }
  let toastTimer;
  function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200); }

  /* ================= 검사 ================= */
  let answers = [];
  let qi = 0;
  function start() { answers = []; qi = 0; setAccent(); show('quiz'); renderQ(); }
  function renderQ() {
    const q = QUESTIONS[qi];
    $('#bar').style.width = (qi / QUESTIONS.length * 100) + '%';
    $('#qno').textContent = `${qi + 1} / ${QUESTIONS.length}`;
    $('#back').style.visibility = qi ? 'visible' : 'hidden';
    const card = $('#qcard');
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    $('#qscene').textContent = q.scene;
    $('#qtext').textContent = q.q;
    // 어느 쪽이 A인지 티 나지 않게 보기 순서를 섞는다 (질문마다 고정)
    const flip = [0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1][qi] === 1;
    const opts = [['a', q.a], ['b', q.b]];
    if (flip) opts.reverse();
    $('#answers').innerHTML = opts.map(([k, t]) => `<button data-k="${k}" class="${answers[qi] === k ? 'pick' : ''}">${esc(t)}</button>`).join('');
  }
  $('#answers').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    answers[qi] = b.dataset.k;
    b.classList.add('pick');
    setTimeout(() => {
      if (qi < QUESTIONS.length - 1) { qi++; renderQ(); }
      else { $('#bar').style.width = '100%'; analyze(); }
    }, 220);
  });
  $('#back').addEventListener('click', () => { if (qi > 0) { qi--; renderQ(); } });
  document.addEventListener('keydown', e => {
    if ($('#quiz').hidden) return;
    const btns = [...document.querySelectorAll('#answers button')];
    if (e.key === '1') btns[0]?.click();
    if (e.key === '2') btns[1]?.click();
    if (e.key === 'Backspace') $('#back').click();
  });

  // 축마다 A 선택 수를 센다. 2:2 동점이면 그 축의 마지막 질문 답을 따른다
  function score(ans) {
    const code = AXES.map((ax, i) => {
      const idx = QUESTIONS.map((q, j) => j).filter(j => QUESTIONS[j].axis === i);
      const a = idx.filter(j => ans[j] === 'a').length;
      const b = idx.length - a;
      if (a !== b) return a > b ? ax.a : ax.b;
      return ans[idx[idx.length - 1]] === 'a' ? ax.a : ax.b;
    }).join('');
    const pct = AXES.map((ax, i) => {
      const idx = QUESTIONS.map((q, j) => j).filter(j => QUESTIONS[j].axis === i);
      return Math.round(idx.filter(j => ans[j] === 'a').length / idx.length * 100);
    });
    return { code, pct };
  }

  async function analyze() {
    show('loading');
    const { code, pct } = score(answers);
    const t = TYPES[code];
    const lines = [
      '$ javac Personality.java',
      '<span class="ok">✔ 컴파일 성공 (경고 3개: 너무 성실함)</span>',
      '$ java Personality --analyze',
      '답변 12개를 힙에 넣는 중…',
      '성격 그래프에서 사이클 탐지 중…',
      `시간복잡도 측정 중… 당신은 대략 ${t.bigO[0][1]}`,
      '가장 닮은 자료구조를 이진 탐색 중…',
      `<span class="ok">✔ 결과: ${t.name} (${t.en})</span>`,
    ];
    const logs = $('#logs');
    logs.innerHTML = '';
    for (const l of lines) { logs.innerHTML += l + '\n'; await sleep(260 + Math.random() * 200); }
    await sleep(350);
    const hist = store.get('history', []);
    hist.push({ code, at: Date.now() });
    store.set('history', hist.slice(-20));
    store.set('last', { code, pct });
    renderResult(code, pct, true);
    history.replaceState(null, '', '#r=' + t.id + '&p=' + pct.join('-'));
  }

  /* ================= 결과 ================= */
  let current = null;
  function mateBtn(el, [k, why]) {
    const m = TYPES[k];
    el.innerHTML = `<span class="e">${m.emoji}</span><span><b style="color:${m.color}">${m.name}</b><small>${esc(why)}</small></span>`;
    el.onclick = () => { renderResult(k, null, false); history.replaceState(null, '', '#r=' + m.id); };
  }
  function renderResult(code, pct, mine) {
    const t = TYPES[code];
    current = { code, pct, mine };
    setAccent(t.color);
    const last = store.get('last', null);
    const isMine = mine || (last && last.code === code && !pct);
    $('#rKicker').textContent = mine || isMine ? '당신의 자료구조는' : '다른 유형 구경 중';
    $('#rEmoji').textContent = t.emoji;
    $('#rName').textContent = `${t.name}`;
    $('#rTag').textContent = t.tag;
    const p = pct || (isMine && last ? last.pct : null);
    $('#rAxes').innerHTML = AXES.map((ax, i) => {
      const isA = code[i] === ax.a;
      const val = p ? (isA ? p[i] : 100 - p[i]) : null;
      return `<span><b>${isA ? ax.aName : ax.bName}</b>${val != null ? ` ${val}%` : ''}</span>`;
    }).join('');
    $('#rDesc').textContent = t.desc;
    $('#rQuotes').innerHTML = t.quotes.map(q => `<li>${esc(q)}</li>`).join('');
    $('#rStats').innerHTML = t.stats.map(([k, v, o]) => `<div class="stat"><span>${k}</span><div class="track"><i data-w="${v}"></i></div><code>${esc(o)}</code></div>`).join('');
    requestAnimationFrame(() => requestAnimationFrame(() => document.querySelectorAll('#rStats i').forEach(i => { i.style.width = i.dataset.w + '%'; })));
    $('#rPro').textContent = t.pro;
    $('#rCon').textContent = t.con;
    mateBtn($('#rBest'), t.best);
    mateBtn($('#rWorst'), t.worst);
    $('#rSay').textContent = t.say;
    $('#rBigO').innerHTML = '<tr><th>연산</th><th style="text-align:right">시간</th></tr>' + t.bigO.map(([a, b]) => `<tr><td>${esc(a)}</td><td>${esc(b)}</td></tr>`).join('');
    $('#rUse').textContent = t.use;
    $('#rTrap').textContent = t.trap;
    $('#saveCard').hidden = !(mine || isMine);
    show('result');
  }

  /* ================= 결과 카드 저장 ================= */
  function wrap(ctx, text, maxW) {
    const lines = []; let line = '';
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > maxW && line) { lines.push(line); line = ch.trim() ? ch : ''; }
      else line += ch;
    }
    if (line) lines.push(line);
    return lines;
  }
  async function saveCard() {
    const { code } = current;
    const t = TYPES[code];
    const last = store.get('last', null);
    const pct = current.pct || last?.pct;
    try { await document.fonts.ready; } catch { /* 기본 글꼴로 그린다 */ }
    const W = 1080, H = 1350;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const x = cv.getContext('2d');
    const F = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
    x.fillStyle = '#17110d'; x.fillRect(0, 0, W, H);
    const g = x.createRadialGradient(W / 2, 260, 40, W / 2, 260, 700);
    g.addColorStop(0, t.color + '55'); g.addColorStop(1, 'transparent');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.textAlign = 'center';
    x.fillStyle = t.color; x.font = `700 34px ${F}`;
    x.fillText('나는 어떤 자료구조일까?', W / 2, 120);
    x.font = `220px ${F}`; x.fillText(t.emoji, W / 2, 390);
    x.fillStyle = '#f4e9dd'; x.font = `900 110px ${F}`;
    x.fillText(t.name, W / 2, 540);
    x.fillStyle = t.color; x.font = `600 36px ${F}`;
    x.fillText(t.en, W / 2, 596);
    x.fillStyle = '#c9b6a3'; x.font = `600 40px ${F}`;
    wrap(x, t.tag, 880).forEach((l, i) => x.fillText(l, W / 2, 680 + i * 54));
    // 축 칩
    const chips = AXES.map((ax, i) => (code[i] === ax.a ? ax.aName : ax.bName) + (pct ? ` ${code[i] === ax.a ? pct[i] : 100 - pct[i]}%` : ''));
    x.font = `700 32px ${F}`;
    const cw = chips.map(c => x.measureText(c).width + 56);
    let cx = (W - cw.reduce((a, b) => a + b, 0) - 20 * (chips.length - 1)) / 2;
    chips.forEach((c, i) => {
      x.fillStyle = '#2a1f18';
      x.beginPath(); x.roundRect ? x.roundRect(cx, 780, cw[i], 64, 32) : x.rect(cx, 780, cw[i], 64); x.fill();
      x.fillStyle = '#f4e9dd'; x.fillText(c, cx + cw[i] / 2, 824);
      cx += cw[i] + 20;
    });
    // 한마디
    x.fillStyle = '#2a1f18';
    x.beginPath(); x.roundRect ? x.roundRect(90, 900, W - 180, 170, 28) : x.rect(90, 900, W - 180, 170); x.fill();
    x.fillStyle = '#f4e9dd'; x.font = `600 38px ${F}`;
    wrap(x, `"${t.quotes[0]}"`, W - 260).slice(0, 2).forEach((l, i) => x.fillText(l, W / 2, 980 + i * 50));
    x.font = `500 30px ${F}`; x.fillStyle = '#8d7a68';
    x.fillText(`찰떡궁합 ${TYPES[t.best[0]].emoji} ${TYPES[t.best[0]].name}   ·   상극 ${TYPES[t.worst[0]].emoji} ${TYPES[t.worst[0]].name}`, W / 2, 1160);
    x.fillStyle = t.color; x.font = `700 28px ${F}`;
    x.fillText('🍪 쿠키 연구소 별관 · 자료구조 유형 검사', W / 2, 1270);
    const a = document.createElement('a');
    a.href = cv.toDataURL('image/png');
    a.download = `자료구조유형_${t.name}.png`;
    a.click();
    toast('결과 카드를 저장했어요');
  }

  /* ================= 전체 유형 ================= */
  function renderAll() {
    const last = store.get('last', null);
    $('#legend').innerHTML = AXES.map(ax => `<div><b>${ax.aName}</b> ${ax.aDesc} ↔ <b>${ax.bName}</b> ${ax.bDesc}</div>`).join('');
    $('#types').innerHTML = Object.entries(TYPES).map(([k, t]) => `<button data-k="${k}" style="--c:${t.color}" class="${last?.code === k ? 'mine' : ''}"><span class="e">${t.emoji}</span><b>${t.name}${last?.code === k ? ' · 나' : ''}</b><small>${esc(t.tag)}</small></button>`).join('');
    setAccent();
    show('all');
  }
  $('#types').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    renderResult(b.dataset.k, null, false);
    history.replaceState(null, '', '#r=' + TYPES[b.dataset.k].id);
  });

  /* ================= 버튼 ================= */
  $('#start').addEventListener('click', start);
  $('#retry').addEventListener('click', start);
  $('#showAll').addEventListener('click', renderAll);
  $('#showAll2').addEventListener('click', renderAll);
  $('#allBack').addEventListener('click', () => {
    if (prevScreen === 'result' && current) renderResult(current.code, current.pct, current.mine);
    else { setAccent(); show('intro'); }
  });
  $('#saveCard').addEventListener('click', saveCard);
  $('#copyLink').addEventListener('click', async () => {
    const url = location.href;
    try { await navigator.clipboard.writeText(url); toast('링크를 복사했어요. 친구 결과랑 궁합을 맞춰 보세요'); }
    catch { toast(url); }
  });

  /* ================= 시작 ================= */
  const last = store.get('last', null);
  if (last) $('#introMeta').textContent = `지난번 결과: ${TYPES[last.code].emoji} ${TYPES[last.code].name} · 다시 해도 같을까요?`;
  const m = location.hash.match(/r=(\w+)(?:&p=(\d+)-(\d+)-(\d+))?/);
  if (m && BY_ID[m[1]]) {
    const code = BY_ID[m[1]];
    const shared = m[2] ? [+m[2], +m[3], +m[4]] : null;
    const own = last && last.code === code;
    renderResult(code, shared, false);
    if (!own) {
      $('#rKicker').textContent = '친구의 자료구조는';
      $('#saveCard').hidden = true;
      $('#retry').textContent = '나도 검사하기';
    }
  }
})();
