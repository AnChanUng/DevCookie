// 기본기 자가 점검용 자체 작성 문답. 새 항목 ID는 기존 심화 묶음의 완료 상태와 구분한다.
export const CS_NOTES = [
  {
    "id": "architecture",
    "title": "컴퓨터구조",
    "items": [
      {
        "id": "basic-architecture-01",
        "title": "32비트·64비트",
        "question": "32비트와 64비트의 기본 차이는 무엇인가요?",
        "answer": "CPU가 다루는 레지스터 폭과 주소 처리 능력 등이 다릅니다. 32비트 주소는 바이트 주소 기준으로 4GiB 공간을 표현합니다."
      },
      {
        "id": "basic-architecture-02",
        "title": "레지스터·PC",
        "question": "레지스터와 프로그램 카운터는 무엇인가요?",
        "answer": "레지스터는 CPU 내부의 작은 저장 공간입니다. PC는 실행할 명령어의 위치를 추적하는 레지스터입니다."
      },
      {
        "id": "basic-architecture-03",
        "title": "캐시 메모리",
        "question": "캐시 메모리를 사용하는 이유는 무엇인가요?",
        "answer": "CPU와 주기억장치의 속도 차이를 줄이기 위해 자주 쓸 데이터를 더 가까운 빠른 저장 공간에 보관합니다."
      }
    ]
  },
  {
    "id": "structures",
    "title": "자료구조",
    "items": [
      {
        "id": "basic-structures-01",
        "title": "배열",
        "question": "배열은 어떤 자료구조인가요?",
        "answer": "원소를 연속된 공간에 배치하고 인덱스로 접근하는 구조입니다. 임의 위치 조회는 빠르지만 중간 삽입·삭제에는 원소 이동이 필요할 수 있습니다."
      },
      {
        "id": "basic-structures-02",
        "title": "연결 리스트",
        "question": "연결 리스트는 배열과 무엇이 다른가요?",
        "answer": "각 노드가 데이터와 다음 노드의 연결 정보를 가집니다. 임의 위치를 찾으려면 순회해야 하지만 위치를 이미 알면 연결을 바꾸어 삽입·삭제할 수 있습니다."
      },
      {
        "id": "basic-structures-03",
        "title": "스택",
        "question": "스택의 LIFO는 무슨 뜻인가요?",
        "answer": "나중에 넣은 원소가 먼저 나오는 규칙입니다. 함수 호출이나 실행 취소 기록에 활용합니다."
      },
      {
        "id": "basic-structures-04",
        "title": "큐",
        "question": "큐의 FIFO는 무슨 뜻인가요?",
        "answer": "먼저 넣은 원소가 먼저 나오는 규칙입니다. 작업 대기열과 BFS 탐색에 활용합니다."
      },
      {
        "id": "basic-structures-05",
        "title": "해시 테이블",
        "question": "해시 테이블과 해시 충돌은 무엇인가요?",
        "answer": "키를 해시값으로 변환해 저장 위치를 정하는 구조입니다. 서로 다른 키가 같은 위치에 대응하는 것이 충돌이며, 체이닝이나 다른 빈 위치 탐색 등으로 처리합니다."
      },
      {
        "id": "basic-structures-06",
        "title": "트리·이진 탐색 트리",
        "question": "트리와 이진 탐색 트리의 특징은 무엇인가요?",
        "answer": "트리는 사이클 없이 노드를 계층으로 연결한 구조입니다. 이진 탐색 트리는 각 노드의 왼쪽에는 작은 키, 오른쪽에는 큰 키가 오도록 정리합니다."
      },
      {
        "id": "basic-structures-07",
        "title": "힙",
        "question": "힙은 어떤 값을 빠르게 꺼내기 위한 구조인가요?",
        "answer": "최솟값 또는 최댓값을 빠르게 얻기 위한 완전 이진 트리 기반 구조입니다. 부모와 자식의 대소 관계를 유지하며 전체가 정렬되어 있는 것은 아닙니다."
      },
      {
        "id": "basic-structures-08",
        "title": "그래프",
        "question": "그래프는 무엇으로 구성되나요?",
        "answer": "대상을 나타내는 정점과 관계를 나타내는 간선으로 구성됩니다. 간선은 방향이나 가중치를 가질 수 있습니다."
      }
    ]
  },
  {
    "id": "algorithms",
    "title": "알고리즘",
    "items": [
      {
        "id": "basic-algorithms-01",
        "title": "시간 복잡도",
        "question": "시간 복잡도와 Big-O는 무엇인가요?",
        "answer": "입력 크기에 따라 연산량이 얼마나 증가하는지 나타냅니다. Big-O는 증가율의 상한을 표현하며 상수 배수와 낮은 차수는 보통 생략합니다."
      },
      {
        "id": "basic-algorithms-02",
        "title": "공간 복잡도",
        "question": "공간 복잡도는 무엇을 나타내나요?",
        "answer": "입력 크기에 따라 필요한 메모리량이 얼마나 증가하는지 나타냅니다. 재귀 호출에 사용되는 스택도 포함해서 생각해야 합니다."
      },
      {
        "id": "basic-algorithms-03",
        "title": "재귀",
        "question": "재귀 함수에는 왜 종료 조건이 필요한가요?",
        "answer": "함수가 자기 자신을 호출하기 때문입니다. 종료 조건에 도달하도록 문제를 줄이지 않으면 호출이 계속되어 스택을 소진할 수 있습니다."
      },
      {
        "id": "basic-algorithms-04",
        "title": "의사코드",
        "question": "의사코드란 무엇인가요?",
        "answer": "특정 언어의 문법보다 알고리즘의 절차와 조건을 쉽게 전달하는 데 집중한 표현입니다."
      },
      {
        "id": "basic-algorithms-05",
        "title": "이진 탐색",
        "question": "이진 탐색의 전제 조건은 무엇인가요?",
        "answer": "탐색 기준에 따라 범위를 반씩 제외할 수 있어야 합니다. 정렬된 배열의 원소 탐색이 대표적이며 시간 복잡도는 O(log n)입니다."
      },
      {
        "id": "basic-algorithms-06",
        "title": "BFS·DFS",
        "question": "BFS와 DFS는 탐색 순서가 어떻게 다른가요?",
        "answer": "BFS는 가까운 단계부터 큐를 사용해 넓게 탐색합니다. DFS는 스택이나 재귀를 사용해 한 경로를 깊게 탐색합니다."
      },
      {
        "id": "basic-algorithms-07",
        "title": "정렬",
        "question": "버블·퀵·병합 정렬의 기본 방식은 무엇인가요?",
        "answer": "버블은 이웃한 값을 비교해 교환하고, 퀵은 피벗을 기준으로 나눕니다. 병합은 나눈 구간을 정렬한 뒤 합칩니다. 퀵은 평균 O(n log n), 최악 O(n²)이고 병합은 O(n log n)입니다."
      }
    ]
  },
  {
    "id": "language",
    "title": "Java",
    "items": [
      {
        "id": "basic-language-01",
        "title": "Collection·Map",
        "question": "Collection과 Map은 어떤 관계인가요?",
        "answer": "Collection은 여러 원소를 다루는 인터페이스로 List와 Set 등이 상속합니다. Map은 키와 값을 연결하는 별도의 인터페이스이며 Collection을 상속하지 않습니다."
      },
      {
        "id": "basic-language-02",
        "title": "List",
        "question": "List의 순서와 중복은 어떻게 처리되나요?",
        "answer": "원소의 위치와 순서를 유지하며 같은 값을 여러 번 담을 수 있습니다."
      },
      {
        "id": "basic-language-03",
        "title": "ArrayList",
        "question": "ArrayList는 어떻게 데이터를 저장하나요?",
        "answer": "내부 배열로 저장하는 크기 조절 가능한 List입니다. 인덱스 조회는 O(1)이고 중간 삽입·삭제에는 원소 이동이 필요합니다."
      },
      {
        "id": "basic-language-04",
        "title": "LinkedList",
        "question": "Java LinkedList는 어떤 방식으로 구현되나요?",
        "answer": "이전 노드와 다음 노드를 연결하는 이중 연결 리스트입니다. List와 Deque를 구현하며 인덱스 조회는 순회가 필요합니다."
      },
      {
        "id": "basic-language-05",
        "title": "Map",
        "question": "Map에서 키와 값은 각각 중복될 수 있나요?",
        "answer": "키는 중복되지 않으며 동일한 키로 저장하면 해당 매핑이 갱신됩니다. 값은 여러 키에 중복해서 저장할 수 있습니다."
      },
      {
        "id": "basic-language-06",
        "title": "HashMap",
        "question": "HashMap은 순서를 보장하나요?",
        "answer": "키의 해시를 이용해 저장하고 삽입 순서나 정렬 순서를 보장하지 않습니다. 키 조회는 일반적으로 평균 O(1)입니다."
      },
      {
        "id": "basic-language-07",
        "title": "TreeMap",
        "question": "TreeMap은 어떤 순서를 유지하나요?",
        "answer": "키의 자연 순서 또는 Comparator가 정한 순서로 정렬합니다. 균형 트리를 사용하며 주요 조회·삽입·삭제 연산은 O(log n)입니다."
      },
      {
        "id": "basic-language-08",
        "title": "LinkedHashMap",
        "question": "LinkedHashMap은 HashMap에 무엇을 더한 구조인가요?",
        "answer": "해시 기반 조회에 연결 순서 관리를 더한 구조입니다. 기본적으로 삽입 순서를 유지하고 설정에 따라 접근 순서를 유지할 수 있습니다. 키 조회는 일반적으로 평균 O(1)입니다."
      },
      {
        "id": "basic-language-09",
        "title": "Set",
        "question": "Set의 핵심 특징은 무엇인가요?",
        "answer": "같은 원소를 중복해서 담지 않는 집합입니다. 순서 보장 여부는 구현체에 따라 다릅니다."
      },
      {
        "id": "basic-language-10",
        "title": "HashSet",
        "question": "HashSet은 중복을 어떻게 판단하나요?",
        "answer": "해시 기반으로 원소를 관리하고 hashCode와 equals의 규약을 이용해 동일한 원소인지 판단합니다. 순서는 보장하지 않습니다."
      },
      {
        "id": "basic-language-11",
        "title": "TreeSet",
        "question": "TreeSet은 HashSet과 무엇이 다른가요?",
        "answer": "원소를 정렬된 순서로 유지합니다. 자연 순서 또는 Comparator의 비교 결과가 0인 원소를 같은 원소로 취급합니다."
      },
      {
        "id": "basic-language-12",
        "title": "LinkedHashSet",
        "question": "LinkedHashSet은 어떤 순서를 보장하나요?",
        "answer": "원소의 중복을 막으면서 삽입 순서를 유지합니다."
      },
      {
        "id": "basic-language-13",
        "title": "배열·ArrayList",
        "question": "Java 배열과 ArrayList의 차이는 무엇인가요?",
        "answer": "배열은 생성 후 길이가 고정되고 기본형도 직접 담습니다. ArrayList는 크기를 조절하며 객체 참조를 담으므로 기본형 값은 래퍼 타입으로 박싱됩니다."
      },
      {
        "id": "basic-language-14",
        "title": "Wrapper·박싱",
        "question": "Wrapper 클래스와 오토박싱은 무엇인가요?",
        "answer": "Integer처럼 기본형 값을 객체로 표현하는 타입이 래퍼 클래스입니다. 기본형과 래퍼 타입 사이의 자동 변환을 박싱·언박싱이라고 합니다."
      },
      {
        "id": "basic-language-15",
        "title": "Stack·Queue·Deque",
        "question": "Java에서 스택과 큐는 무엇으로 구현할 수 있나요?",
        "answer": "Deque를 구현하는 ArrayDeque로 스택과 큐를 만들 수 있습니다. Queue는 인터페이스이며 LinkedList 같은 구현체도 있습니다. Stack은 기존 레거시 클래스입니다."
      },
      {
        "id": "basic-language-16",
        "title": "Stream API",
        "question": "Stream의 중간 연산과 최종 연산은 무엇이 다른가요?",
        "answer": "filter나 map은 스트림을 반환하는 중간 연산입니다. collect나 count 같은 최종 연산이 실행되어야 일반적으로 중간 연산의 처리가 시작됩니다."
      },
      {
        "id": "basic-language-17",
        "title": "JVM",
        "question": "JVM의 역할은 무엇인가요?",
        "answer": "Java 바이트코드를 실행하는 가상 머신입니다. 클래스 로딩, 실행, 메모리 관리 등을 담당해 같은 바이트코드를 여러 환경에서 실행할 기반을 제공합니다."
      },
      {
        "id": "basic-language-18",
        "title": "GC",
        "question": "GC는 무엇을 자동으로 처리하나요?",
        "answer": "더 이상 도달할 수 없는 객체가 차지한 메모리를 회수합니다. 프로그램이 참조를 계속 보관하면 불필요한 객체라도 수거되지 않을 수 있습니다."
      }
    ]
  },
  {
    "id": "design",
    "title": "객체지향·소프트웨어공학",
    "items": [
      {
        "id": "basic-design-01",
        "title": "OOP",
        "question": "객체지향 프로그래밍이란 무엇인가요?",
        "answer": "상태와 동작을 가진 객체들의 협력으로 프로그램을 구성하는 방식입니다. 객체의 책임과 외부에 공개할 동작을 나누어 설계합니다."
      },
      {
        "id": "basic-design-02",
        "title": "클래스·인스턴스",
        "question": "클래스와 인스턴스는 무엇이 다른가요?",
        "answer": "클래스는 객체의 구조와 동작을 정의한 타입이고 인스턴스는 그 정의를 바탕으로 실제 생성된 객체입니다."
      },
      {
        "id": "basic-design-03",
        "title": "추상화",
        "question": "추상화란 무엇인가요?",
        "answer": "목적에 필요한 공통 특징을 골라 표현하고 불필요한 세부 사항은 감추는 것입니다."
      },
      {
        "id": "basic-design-04",
        "title": "캡슐화·정보 은닉",
        "question": "캡슐화와 정보 은닉은 무엇인가요?",
        "answer": "캡슐화는 관련 데이터와 동작을 하나의 단위로 묶는 것입니다. 정보 은닉은 내부 구현을 숨기고 정해진 인터페이스로 접근하게 하는 것입니다."
      },
      {
        "id": "basic-design-05",
        "title": "상속",
        "question": "상속은 어떤 관계를 표현하나요?",
        "answer": "기존 타입을 확장해 속성과 동작을 이어받는 관계입니다. 하위 타입이 상위 타입으로 사용되어도 약속된 동작을 지켜야 합니다."
      },
      {
        "id": "basic-design-06",
        "title": "다형성",
        "question": "다형성이란 무엇인가요?",
        "answer": "같은 인터페이스로 호출해도 실제 객체의 타입에 따라 다른 동작을 실행할 수 있는 성질입니다."
      },
      {
        "id": "basic-design-07",
        "title": "오버로딩·오버라이딩",
        "question": "오버로딩과 오버라이딩은 무엇이 다른가요?",
        "answer": "오버로딩은 같은 이름으로 매개변수 목록이 다른 메서드를 정의하는 것입니다. 오버라이딩은 상속받은 메서드의 동작을 하위 타입에서 재정의하는 것입니다."
      },
      {
        "id": "basic-design-08",
        "title": "SRP",
        "question": "단일 책임 원칙은 무엇인가요?",
        "answer": "한 모듈은 하나의 책임에 집중해야 한다는 원칙입니다. 서로 다른 이유로 변경될 기능을 한곳에 섞지 않도록 합니다."
      },
      {
        "id": "basic-design-09",
        "title": "OCP",
        "question": "개방 폐쇄 원칙은 무엇인가요?",
        "answer": "기능 확장에는 열려 있고 기존 코드의 수정에는 닫혀 있도록 설계하는 원칙입니다. 추상화와 구성 등을 통해 구현을 교체할 수 있게 합니다."
      },
      {
        "id": "basic-design-10",
        "title": "LSP",
        "question": "리스코프 치환 원칙은 무엇인가요?",
        "answer": "상위 타입을 사용하던 곳에 하위 타입을 넣어도 프로그램의 기대와 계약이 깨지지 않아야 한다는 원칙입니다."
      },
      {
        "id": "basic-design-11",
        "title": "ISP",
        "question": "인터페이스 분리 원칙은 무엇인가요?",
        "answer": "사용하지 않는 기능에 의존하도록 강요하지 않도록, 필요한 역할별로 인터페이스를 나누는 원칙입니다."
      },
      {
        "id": "basic-design-12",
        "title": "DIP",
        "question": "의존성 역전 원칙은 무엇인가요?",
        "answer": "고수준 정책과 저수준 구현이 구체적인 구현 대신 추상화에 의존하도록 하는 원칙입니다."
      },
      {
        "id": "basic-design-13",
        "title": "AOP",
        "question": "관점지향 프로그래밍이란 무엇인가요?",
        "answer": "로깅처럼 여러 기능에 반복되는 공통 관심사를 핵심 업무 로직과 분리해 적용하는 방식입니다. 특정 프레임워크에만 한정된 개념은 아닙니다."
      },
      {
        "id": "basic-design-14",
        "title": "FP·순수 함수",
        "question": "함수형 프로그래밍에서 순수 함수란 무엇인가요?",
        "answer": "동일한 입력에 동일한 출력을 내고 외부 상태를 바꾸지 않는 함수입니다. 함수형 방식은 함수의 조합과 부수 효과의 분리를 중시합니다."
      },
      {
        "id": "basic-design-15",
        "title": "MVC",
        "question": "MVC에서 각 요소는 무엇을 담당하나요?",
        "answer": "Model은 데이터와 업무 규칙, View는 화면 표현을 담당합니다. Controller는 입력을 받아 적절한 처리를 연결합니다."
      },
      {
        "id": "basic-design-16",
        "title": "DTO",
        "question": "DTO의 역할은 무엇인가요?",
        "answer": "계층이나 시스템 사이에서 데이터를 전달하는 객체입니다. 전송에 필요한 데이터를 묶어 표현합니다."
      },
      {
        "id": "basic-design-17",
        "title": "DAO",
        "question": "DAO의 역할은 무엇인가요?",
        "answer": "데이터 저장소에 접근하는 로직을 분리하는 객체입니다. 조회·저장 등의 작업을 다른 코드에서 분리합니다."
      },
      {
        "id": "basic-design-18",
        "title": "VO",
        "question": "VO의 특징은 무엇인가요?",
        "answer": "고유 식별자보다 값 자체로 의미와 동등성을 판단하는 객체입니다. 보통 불변으로 설계합니다."
      },
      {
        "id": "basic-design-19",
        "title": "싱글톤",
        "question": "싱글톤 패턴이란 무엇인가요?",
        "answer": "특정 클래스의 인스턴스를 하나로 제한하고 접근 지점을 제공하는 패턴입니다. 공유되는 가변 상태가 있으면 동시 접근을 주의해야 합니다."
      },
      {
        "id": "basic-design-20",
        "title": "Jenkins·CI",
        "question": "Jenkins는 무엇을 위한 도구인가요?",
        "answer": "빌드, 테스트, 배포 등의 자동화 작업을 실행하는 서버입니다. 변경 코드를 자주 통합하고 검사하는 CI 파이프라인 등에 사용합니다."
      },
      {
        "id": "basic-design-21",
        "title": "개발 방법론",
        "question": "폭포수와 애자일의 기본 차이는 무엇인가요?",
        "answer": "폭포수는 분석·설계·구현 등의 단계를 순차적으로 진행하는 방식입니다. 애자일은 짧은 주기로 결과를 확인하고 피드백에 따라 개선하는 방식을 중시합니다."
      }
    ]
  },
  {
    "id": "os",
    "title": "운영체제",
    "items": [
      {
        "id": "basic-os-01",
        "title": "프로세스·스레드",
        "question": "프로세스와 스레드는 무엇이 다른가요?",
        "answer": "프로세스는 독립된 주소 공간과 자원을 가진 실행 단위입니다. 스레드는 프로세스 안의 실행 흐름이며 다른 스레드와 여러 자원을 공유합니다."
      },
      {
        "id": "basic-os-02",
        "title": "프로세스 메모리",
        "question": "코드·데이터·힙·스택 영역은 무엇을 담나요?",
        "answer": "코드는 실행 명령, 데이터 영역은 전역·정적 변수 등을 담습니다. 힙은 동적으로 할당한 데이터, 스택은 함수 호출과 지역 변수 등에 사용합니다."
      },
      {
        "id": "basic-os-03",
        "title": "PCB",
        "question": "PCB에는 어떤 정보가 저장되나요?",
        "answer": "운영체제가 프로세스를 관리하는 데 필요한 식별자, 상태, 레지스터 문맥, 스케줄링 정보 등을 저장합니다."
      },
      {
        "id": "basic-os-04",
        "title": "멀티스레딩",
        "question": "스레드가 공유하는 것과 따로 갖는 것은 무엇인가요?",
        "answer": "같은 프로세스의 코드·힙·전역 데이터 등을 공유합니다. 각 스레드는 스택과 실행 위치·레지스터 문맥을 따로 가집니다."
      },
      {
        "id": "basic-os-05",
        "title": "멀티프로세스·멀티스레드",
        "question": "두 방식의 기본 장단점은 무엇인가요?",
        "answer": "프로세스 분리는 장애와 주소 공간 격리에 유리하지만 통신 비용이 듭니다. 스레드는 자원 공유가 쉽지만 공유 상태의 동기화가 필요합니다."
      },
      {
        "id": "basic-os-06",
        "title": "멀티프로세싱·멀티태스킹",
        "question": "멀티프로세싱과 멀티태스킹은 무엇인가요?",
        "answer": "멀티프로세싱은 여러 처리 장치를 이용해 작업을 수행하는 것입니다. 멀티태스킹은 여러 작업이 함께 진행되도록 실행 기회를 나누는 것입니다."
      },
      {
        "id": "basic-os-07",
        "title": "멀티프로그래밍",
        "question": "멀티프로그래밍을 하는 이유는 무엇인가요?",
        "answer": "여러 프로그램을 메모리에 두어 한 작업이 입출력을 기다리는 동안 다른 작업에 CPU를 사용할 기회를 줍니다."
      },
      {
        "id": "basic-os-08",
        "title": "경쟁 상태",
        "question": "경쟁 상태는 언제 발생하나요?",
        "answer": "공유 데이터에 접근하는 실행 순서에 따라 결과가 달라질 때 발생합니다. 읽기와 갱신을 함께 보호해야 하는 경우가 대표적입니다."
      },
      {
        "id": "basic-os-09",
        "title": "임계 구역",
        "question": "임계 구역이란 무엇인가요?",
        "answer": "공유 자원에 접근해 동시 실행을 제어해야 하는 코드 구간입니다. 임계 구역 문제의 대표 조건은 상호 배제, 진행, 한정 대기입니다."
      },
      {
        "id": "basic-os-10",
        "title": "뮤텍스",
        "question": "뮤텍스는 무엇을 보장하기 위한 도구인가요?",
        "answer": "한 번에 하나의 실행 흐름만 보호된 구간에 들어가도록 하는 상호 배제 도구입니다. 일반적으로 잠금을 획득한 소유자가 해제합니다."
      },
      {
        "id": "basic-os-11",
        "title": "세마포어",
        "question": "세마포어는 뮤텍스와 무엇이 다른가요?",
        "answer": "사용 가능한 자원의 수나 실행 허용 횟수를 카운터로 관리합니다. 여러 실행 흐름의 진입을 허용할 수 있고, 일반적으로 뮤텍스와 같은 소유권 제약이 없습니다."
      },
      {
        "id": "basic-os-12",
        "title": "모니터",
        "question": "모니터란 무엇인가요?",
        "answer": "공유 데이터에 대한 상호 배제와 조건에 따른 대기·알림을 함께 제공하는 동기화 추상화입니다."
      },
      {
        "id": "basic-os-13",
        "title": "Busy Waiting",
        "question": "Busy Waiting은 무엇이 문제인가요?",
        "answer": "조건이 바뀌었는지 반복해서 검사하며 기다리는 방식입니다. 대기하는 동안에도 CPU를 사용합니다."
      },
      {
        "id": "basic-os-14",
        "title": "교착상태",
        "question": "교착상태란 무엇인가요?",
        "answer": "여러 실행 흐름이 서로 가진 자원을 기다리면서 아무도 진행하지 못하는 상태입니다."
      },
      {
        "id": "basic-os-15",
        "title": "교착상태 조건",
        "question": "교착상태의 네 가지 필요조건은 무엇인가요?",
        "answer": "상호 배제, 점유 대기, 비선점, 순환 대기입니다. 하나라도 성립하지 않게 만들면 해당 조건에 기반한 교착상태를 예방할 수 있습니다."
      },
      {
        "id": "basic-os-16",
        "title": "교착상태 대응",
        "question": "예방·회피·탐지 후 회복은 무엇이 다른가요?",
        "answer": "예방은 발생 조건을 끊고, 회피는 자원 할당 시 안전한 상태를 유지합니다. 탐지 후 회복은 발생 여부를 검사한 뒤 작업 종료나 자원 회수 등으로 해결합니다."
      },
      {
        "id": "basic-os-17",
        "title": "문맥 전환",
        "question": "문맥 전환이란 무엇인가요?",
        "answer": "현재 실행 상태를 저장하고 다른 실행 흐름의 상태를 복원해 CPU 실행 대상을 바꾸는 작업입니다. 전환 자체에도 비용이 듭니다."
      },
      {
        "id": "basic-os-18",
        "title": "인터럽트",
        "question": "인터럽트란 무엇인가요?",
        "answer": "장치의 입출력 완료나 타이머 만료 같은 사건을 CPU에 알려 필요한 처리를 수행하게 하는 신호입니다."
      },
      {
        "id": "basic-os-19",
        "title": "스케줄링 큐",
        "question": "Ready Queue와 Device Queue는 무엇이 다른가요?",
        "answer": "Ready Queue는 실행 준비가 되어 CPU를 기다리는 작업을, Device Queue는 특정 장치의 입출력 처리를 기다리는 작업을 관리합니다."
      },
      {
        "id": "basic-os-20",
        "title": "장기·중기·단기 스케줄러",
        "question": "세 종류의 스케줄러는 무엇을 결정하나요?",
        "answer": "장기는 시스템에 받아들일 작업, 단기는 다음 CPU 실행 대상을 고릅니다. 중기는 메모리 부담 등을 조절하기 위해 작업을 일시 중단하거나 다시 들입니다."
      },
      {
        "id": "basic-os-21",
        "title": "선점·비선점",
        "question": "선점형 스케줄링이란 무엇인가요?",
        "answer": "실행 중인 작업이 스스로 CPU를 반납하기 전에도 운영체제가 실행 대상을 바꿀 수 있는 방식입니다. 비선점형은 종료나 대기 등으로 반납할 때 전환합니다."
      },
      {
        "id": "basic-os-22",
        "title": "FCFS",
        "question": "FCFS는 어떤 순서로 실행하나요?",
        "answer": "먼저 도착한 작업부터 실행합니다. 긴 작업이 앞에 있으면 뒤의 짧은 작업이 오래 기다릴 수 있습니다."
      },
      {
        "id": "basic-os-23",
        "title": "SJF·SRTF",
        "question": "SJF와 SRTF는 무엇이 다른가요?",
        "answer": "SJF는 예상 실행 시간이 짧은 작업을 우선하는 비선점 방식입니다. SRTF는 남은 시간이 더 짧은 작업이 나타나면 선점하는 방식입니다."
      },
      {
        "id": "basic-os-24",
        "title": "우선순위·Aging",
        "question": "우선순위 스케줄링에서 Aging은 왜 사용하나요?",
        "answer": "낮은 우선순위 작업이 계속 밀리는 기아 현상을 줄이기 위해 대기 시간이 길어질수록 우선순위를 높입니다."
      },
      {
        "id": "basic-os-25",
        "title": "라운드 로빈",
        "question": "라운드 로빈과 타임 퀀텀은 무엇인가요?",
        "answer": "작업마다 정해진 시간인 타임 퀀텀만큼 실행 기회를 번갈아 줍니다. 퀀텀이 너무 작으면 문맥 전환 비용이 증가합니다."
      },
      {
        "id": "basic-os-26",
        "title": "동기·비동기",
        "question": "동기와 비동기의 구분 기준은 무엇인가요?",
        "answer": "요청한 작업의 완료를 어떻게 확인하고 이후 처리를 이어가는지의 차이입니다. 비동기는 완료 알림이나 콜백 등으로 나중에 결과를 처리할 수 있습니다."
      },
      {
        "id": "basic-os-27",
        "title": "블로킹·논블로킹",
        "question": "블로킹과 논블로킹은 무엇이 다른가요?",
        "answer": "블로킹 호출은 진행할 수 있을 때까지 호출자를 기다리게 합니다. 논블로킹 호출은 즉시 결과나 현재 불가 상태를 반환합니다. 동기·비동기와는 다른 구분입니다."
      },
      {
        "id": "basic-os-28",
        "title": "내부·외부 단편화",
        "question": "내부 단편화와 외부 단편화는 무엇인가요?",
        "answer": "내부 단편화는 할당받은 공간 안에 남는 낭비입니다. 외부 단편화는 빈 공간이 흩어져 필요한 연속 공간을 확보하지 못하는 문제입니다."
      },
      {
        "id": "basic-os-29",
        "title": "First·Best·Worst Fit",
        "question": "세 가지 메모리 배치 방식의 기준은 무엇인가요?",
        "answer": "First Fit은 처음 찾은 충분한 공간, Best Fit은 들어갈 수 있는 가장 작은 공간, Worst Fit은 가장 큰 공간을 고릅니다. 항상 한 방식이 가장 효율적인 것은 아닙니다."
      },
      {
        "id": "basic-os-30",
        "title": "가상 메모리",
        "question": "가상 메모리란 무엇인가요?",
        "answer": "프로세스에 독립된 주소 공간을 제공하고 가상 주소를 실제 저장 위치에 대응시키는 방식입니다. 필요한 부분만 메모리에 두는 데도 활용합니다."
      },
      {
        "id": "basic-os-31",
        "title": "페이징",
        "question": "페이지와 프레임은 무엇인가요?",
        "answer": "가상 메모리를 나눈 고정 크기 단위가 페이지, 물리 메모리의 대응 단위가 프레임입니다. 페이지 테이블로 둘의 대응 관계를 관리합니다."
      },
      {
        "id": "basic-os-32",
        "title": "페이지 폴트",
        "question": "페이지 폴트는 언제 발생하나요?",
        "answer": "접근한 페이지를 현재 메모리 매핑으로 처리할 수 없을 때 발생하는 예외입니다. 유효하지만 메모리에 없는 페이지라면 운영체제가 적재하고 실행을 이어갑니다."
      },
      {
        "id": "basic-os-33",
        "title": "세그멘테이션",
        "question": "세그멘테이션은 페이징과 무엇이 다른가요?",
        "answer": "코드나 데이터 등 논리적 구간을 가변 크기로 나눠 관리합니다. 고정 크기로 나누는 페이징과 달리 외부 단편화가 발생할 수 있습니다."
      },
      {
        "id": "basic-os-34",
        "title": "FIFO·OPT",
        "question": "FIFO와 OPT 페이지 교체의 기준은 무엇인가요?",
        "answer": "FIFO는 가장 먼저 들어온 페이지를, OPT는 앞으로 가장 늦게 사용할 페이지를 내보냅니다. OPT는 미래를 알아야 하므로 실제 구현보다는 비교 기준으로 사용합니다."
      },
      {
        "id": "basic-os-35",
        "title": "LRU·LFU·MFU",
        "question": "LRU, LFU, MFU는 무엇을 기준으로 교체하나요?",
        "answer": "LRU는 가장 오랫동안 사용하지 않은 페이지, LFU는 사용 횟수가 가장 적은 페이지, MFU는 가장 많은 페이지를 선택합니다. 최근성과 빈도는 다른 기준입니다."
      }
    ]
  },
  {
    "id": "network",
    "title": "네트워크",
    "items": [
      {
        "id": "basic-network-01",
        "title": "OSI 7계층",
        "question": "OSI 7계층은 무엇이며 왜 나누나요?",
        "answer": "물리, 데이터 링크, 네트워크, 전송, 세션, 표현, 응용 계층으로 나눕니다. 통신 기능의 책임을 분리해 이해와 문제 진단을 쉽게 합니다."
      },
      {
        "id": "basic-network-02",
        "title": "TCP/IP 계층",
        "question": "TCP/IP 4계층은 무엇인가요?",
        "answer": "네트워크 접근, 인터넷, 전송, 응용 계층으로 구분합니다. IP는 인터넷 계층, TCP와 UDP는 전송 계층의 대표 프로토콜입니다."
      },
      {
        "id": "basic-network-03",
        "title": "IP·포트",
        "question": "IP 주소와 포트는 무엇을 구분하나요?",
        "answer": "IP 주소는 네트워크에서 통신할 인터페이스를 식별하는 데 쓰입니다. 포트는 해당 호스트의 통신 끝점을 구분합니다."
      },
      {
        "id": "basic-network-04",
        "title": "DNS",
        "question": "DNS의 역할은 무엇인가요?",
        "answer": "도메인 이름에 대응하는 IP 주소 등 여러 종류의 레코드를 조회하는 시스템입니다."
      },
      {
        "id": "basic-network-05",
        "title": "패킷·라우터",
        "question": "패킷과 라우터는 무엇인가요?",
        "answer": "패킷은 네트워크로 전달하는 데이터 단위입니다. 라우터는 목적지 주소와 경로 정보를 이용해 패킷을 다음 네트워크로 전달합니다."
      },
      {
        "id": "basic-network-06",
        "title": "TCP·UDP",
        "question": "TCP와 UDP의 기본 차이는 무엇인가요?",
        "answer": "TCP는 연결을 맺고 신뢰성 있는 순서대로의 바이트 스트림을 제공합니다. UDP는 연결 설정 없이 데이터그램을 보내며 전달·순서·재전송을 자체적으로 보장하지 않습니다."
      },
      {
        "id": "basic-network-07",
        "title": "3-way handshake",
        "question": "TCP는 어떻게 연결을 맺나요?",
        "answer": "SYN, SYN과 ACK, ACK 교환으로 양쪽의 연결 의사와 초기 순서 번호를 확인합니다."
      },
      {
        "id": "basic-network-08",
        "title": "TCP 연결 종료",
        "question": "TCP 연결 종료에 FIN과 ACK가 필요한 이유는 무엇인가요?",
        "answer": "각 방향의 전송 종료를 별도로 알리고 확인하기 때문입니다. 흔히 네 단계로 설명하지만 FIN과 ACK가 합쳐져 전송될 수도 있습니다."
      },
      {
        "id": "basic-network-09",
        "title": "흐름 제어·오류 제어",
        "question": "TCP의 흐름 제어와 오류 제어는 무엇인가요?",
        "answer": "흐름 제어는 수신자가 처리할 수 있는 양에 맞춰 전송을 조절합니다. 오류 제어는 순서 번호, 확인 응답, 재전송 등을 이용해 손실 등에 대응합니다."
      }
    ]
  },
  {
    "id": "web",
    "title": "웹 기초",
    "items": [
      {
        "id": "basic-web-01",
        "title": "HTTP·HTTPS",
        "question": "HTTP와 HTTPS의 차이는 무엇인가요?",
        "answer": "HTTP는 요청과 응답의 의미를 정하는 프로토콜입니다. HTTPS는 TLS로 통신을 보호해 기밀성·무결성과 서버 신원 확인을 제공합니다."
      },
      {
        "id": "basic-web-02",
        "title": "TLS·인증서",
        "question": "TLS에서 인증서는 무엇을 확인하는 데 쓰이나요?",
        "answer": "공개키가 누구에게 속하는지 확인하는 데 사용합니다. 클라이언트는 신뢰 체인, 유효 기간, 호스트 이름 등을 검증합니다."
      },
      {
        "id": "basic-web-03",
        "title": "대칭키·공개키",
        "question": "대칭키와 공개키 암호 방식은 무엇이 다른가요?",
        "answer": "대칭키 방식은 같은 비밀키를 사용합니다. 공개키 방식은 공개키와 개인키의 쌍을 사용하며 암호화·서명 등 목적에 따라 역할이 달라집니다."
      },
      {
        "id": "basic-web-04",
        "title": "HTTP 메서드",
        "question": "GET·POST·PUT·DELETE의 기본 의미는 무엇인가요?",
        "answer": "GET은 조회, POST는 대상 자원에 대한 처리 요청, PUT은 대상 자원의 생성 또는 전체 대체, DELETE는 대상 자원의 삭제를 요청합니다."
      },
      {
        "id": "basic-web-05",
        "title": "REST",
        "question": "REST API에서 자원은 어떻게 표현하나요?",
        "answer": "자원을 URI로 식별하고 HTTP 메서드 등의 일관된 인터페이스로 다룹니다. JSON을 사용한다는 이유만으로 REST가 되는 것은 아닙니다."
      },
      {
        "id": "basic-web-06",
        "title": "AJAX",
        "question": "AJAX를 사용하면 무엇이 가능한가요?",
        "answer": "페이지 전체를 새로 불러오지 않고 서버와 데이터를 교환해 필요한 화면 부분을 갱신할 수 있습니다. XMLHttpRequest나 fetch 등을 사용할 수 있습니다."
      },
      {
        "id": "basic-web-07",
        "title": "동일 출처 정책",
        "question": "같은 출처를 판단하는 기준은 무엇인가요?",
        "answer": "스킴, 호스트, 포트가 같아야 같은 출처입니다. 브라우저는 다른 출처의 데이터 접근을 제한합니다."
      },
      {
        "id": "basic-web-08",
        "title": "CORS",
        "question": "CORS는 무엇을 허용하는 규칙인가요?",
        "answer": "서버의 응답 헤더를 바탕으로 브라우저가 다른 출처의 응답을 스크립트에 공개해도 되는지 판단하는 체계입니다. 서버 간 호출에 적용되는 인증 기능은 아닙니다."
      },
      {
        "id": "basic-web-09",
        "title": "Preflight",
        "question": "CORS 사전 요청은 어떤 메서드를 사용하나요?",
        "answer": "OPTIONS를 사용해 실제 요청의 메서드와 헤더 등을 서버가 허용하는지 먼저 확인합니다. 모든 교차 출처 요청에 발생하는 것은 아닙니다."
      },
      {
        "id": "basic-web-10",
        "title": "멀티파트 업로드",
        "question": "multipart/form-data는 무엇인가요?",
        "answer": "요청 본문을 boundary로 나눈 여러 부분에 필드와 파일 등을 담는 형식입니다. 각 부분은 자체 헤더와 데이터를 가질 수 있습니다."
      }
    ]
  },
  {
    "id": "database",
    "title": "데이터베이스",
    "items": [
      {
        "id": "basic-database-01",
        "title": "관계형 DB",
        "question": "관계형 데이터베이스는 데이터를 어떻게 표현하나요?",
        "answer": "행과 열로 이루어진 관계, 즉 테이블로 표현합니다. 키와 제약 조건을 이용해 데이터의 연결과 무결성을 관리합니다."
      },
      {
        "id": "basic-database-02",
        "title": "기본키·외래키",
        "question": "기본키와 외래키는 무엇이 다른가요?",
        "answer": "기본키는 테이블의 행을 유일하게 식별하며 NULL을 허용하지 않습니다. 외래키는 다른 키를 참조해 관계의 일관성을 유지하는 제약입니다."
      },
      {
        "id": "basic-database-03",
        "title": "정규화",
        "question": "정규화가 필요한 이유는 무엇인가요?",
        "answer": "데이터의 종속 관계를 기준으로 테이블을 나누어 중복과 삽입·수정·삭제 이상을 줄이기 위해서입니다."
      },
      {
        "id": "basic-database-04",
        "title": "1NF·2NF·3NF",
        "question": "1·2·3정규형의 핵심 조건은 무엇인가요?",
        "answer": "1정규형은 속성값의 원자성, 2정규형은 후보키 일부에 대한 비주요 속성의 부분 종속 제거가 핵심입니다. 3정규형은 비키 속성을 거치는 불필요한 종속을 제거하는 것으로 이해할 수 있습니다."
      },
      {
        "id": "basic-database-05",
        "title": "인덱스",
        "question": "인덱스는 왜 조회를 빠르게 하나요?",
        "answer": "값을 찾는 데 사용할 별도 탐색 구조를 유지해 확인할 데이터 범위를 줄입니다. 저장 공간이 필요하고 데이터 변경 때 인덱스 갱신 비용이 추가됩니다."
      },
      {
        "id": "basic-database-06",
        "title": "쿼리 성능",
        "question": "느린 쿼리에서 먼저 확인할 것은 무엇인가요?",
        "answer": "실행 계획으로 얼마나 많은 행을 읽는지, 인덱스를 사용하는지 등을 확인합니다. 불필요한 열·행 조회와 적절하지 않은 조건·조인도 점검합니다."
      },
      {
        "id": "basic-database-07",
        "title": "JOIN",
        "question": "INNER JOIN과 LEFT JOIN의 차이는 무엇인가요?",
        "answer": "INNER JOIN은 조건이 맞는 조합을 반환합니다. LEFT JOIN은 왼쪽 행을 모두 유지하고 오른쪽에 일치하는 행이 없으면 해당 열을 NULL로 채웁니다."
      },
      {
        "id": "basic-database-08",
        "title": "트랜잭션·ACID",
        "question": "트랜잭션과 ACID는 무엇인가요?",
        "answer": "함께 성공하거나 실패해야 하는 작업 단위가 트랜잭션입니다. ACID는 원자성, 일관성, 격리성, 지속성을 뜻합니다."
      }
    ]
  }
];

export const NOTE_SOURCES = [
  {
    "title": "기술면접 준비하기 · 기본 키워드 범위 참고",
    "url": "https://velog.io/@hygoogi/기술면접-준비하기",
    "kind": "scope"
  }
];

// Retain completion for concepts already covered by the old grouped cards.
const LEGACY_TITLES = {
  "architecture-02": [
    "32비트·64비트"
  ],
  "architecture-01": [
    "레지스터·PC"
  ],
  "architecture-04": [
    "캐시 메모리"
  ],
  "structures-01": [
    "배열",
    "연결 리스트"
  ],
  "structures-02": [
    "스택",
    "큐"
  ],
  "structures-03": [
    "해시 테이블"
  ],
  "structures-04": [
    "트리·이진 탐색 트리"
  ],
  "structures-06": [
    "힙"
  ],
  "structures-07": [
    "그래프"
  ],
  "algorithms-01": [
    "시간 복잡도",
    "공간 복잡도"
  ],
  "algorithms-02": [
    "이진 탐색"
  ],
  "algorithms-03": [
    "정렬"
  ],
  "algorithms-05": [
    "BFS·DFS"
  ],
  "algorithms-08": [
    "재귀"
  ],
  "language-02": [
    "JVM"
  ],
  "language-08": [
    "GC"
  ],
  "language-06": [
    "Collection·Map",
    "List",
    "ArrayList",
    "LinkedList",
    "Map",
    "HashMap",
    "TreeMap",
    "LinkedHashMap",
    "Set",
    "HashSet",
    "TreeSet",
    "LinkedHashSet",
    "Stack·Queue·Deque"
  ],
  "language-05": [
    "Wrapper·박싱"
  ],
  "language-07": [
    "상속",
    "오버로딩·오버라이딩"
  ],
  "design-01": [
    "OOP",
    "클래스·인스턴스",
    "추상화",
    "캡슐화·정보 은닉",
    "다형성"
  ],
  "design-02": [
    "SRP",
    "OCP",
    "LSP",
    "ISP",
    "DIP"
  ],
  "design-04": [
    "싱글톤"
  ],
  "design-05": [
    "MVC",
    "DTO",
    "DAO",
    "VO"
  ],
  "design-06": [
    "FP·순수 함수"
  ],
  "design-07": [
    "Jenkins·CI",
    "개발 방법론"
  ],
  "os-01": [
    "프로세스·스레드",
    "멀티스레딩",
    "프로세스 메모리"
  ],
  "os-02": [
    "PCB",
    "문맥 전환"
  ],
  "os-03": [
    "멀티프로세싱·멀티태스킹",
    "멀티프로그래밍"
  ],
  "os-06": [
    "경쟁 상태",
    "임계 구역"
  ],
  "os-07": [
    "뮤텍스",
    "세마포어",
    "모니터"
  ],
  "os-08": [
    "교착상태",
    "교착상태 조건",
    "교착상태 대응"
  ],
  "os-04": [
    "선점·비선점",
    "FCFS",
    "SJF·SRTF",
    "우선순위·Aging",
    "라운드 로빈"
  ],
  "os-09": [
    "동기·비동기",
    "블로킹·논블로킹"
  ],
  "os-10": [
    "가상 메모리",
    "페이징",
    "페이지 폴트"
  ],
  "os-11": [
    "내부·외부 단편화",
    "세그멘테이션"
  ],
  "os-12": [
    "FIFO·OPT",
    "LRU·LFU·MFU"
  ],
  "network-01": [
    "OSI 7계층",
    "TCP/IP 계층"
  ],
  "network-06": [
    "DNS"
  ],
  "network-07": [
    "TCP·UDP"
  ],
  "network-08": [
    "3-way handshake",
    "TCP 연결 종료"
  ],
  "web-04": [
    "HTTP·HTTPS",
    "TLS·인증서"
  ],
  "web-05": [
    "대칭키·공개키"
  ],
  "web-01": [
    "HTTP 메서드"
  ],
  "web-11": [
    "REST",
    "AJAX",
    "멀티파트 업로드"
  ],
  "web-08": [
    "동일 출처 정책",
    "CORS",
    "Preflight"
  ],
  "database-01": [
    "관계형 DB",
    "기본키·외래키"
  ],
  "database-02": [
    "정규화",
    "1NF·2NF·3NF"
  ],
  "database-08": [
    "인덱스"
  ],
  "database-10": [
    "쿼리 성능"
  ],
  "database-05": [
    "JOIN"
  ],
  "database-11": [
    "트랜잭션·ACID"
  ]
};
export function migrateNotesCompletion(records = {}) {
  const next = { ...records };
  for (const section of CS_NOTES) for (const entry of section.items) {
    if (next[entry.id]) continue;
    const previous = Object.entries(LEGACY_TITLES).find(([, titles]) => titles.includes(entry.title));
    if (previous && records[previous[0]]) next[entry.id] = records[previous[0]];
  }
  return next;
}
