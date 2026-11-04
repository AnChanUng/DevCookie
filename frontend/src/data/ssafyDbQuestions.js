// 자체 제작 예상문제. SQL: MySQL 8.4 / InnoDB 기준.
export const SSAFY_DB_QUESTIONS = [
  {
    "id": "sadb01",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "생명주기",
    "q": "서블릿의 init, service, destroy 호출 시점을 설명하시오.",
    "ans": "init은 인스턴스 초기화 시 한 번, service는 요청 처리 시, destroy는 서비스에서 제거할 때 호출한다. HttpServlet의 service는 doGet·doPost 등으로 분기한다.",
    "pts": [
      "init은 인스턴스 초기화 시 한 번, service는 요청 처리 시, destroy는 서비스에서 제거할 때 호출한다",
      "HttpServlet의 service는 doGet·doPost 등으로 분기한다."
    ],
    "a": 0,
    "e": "init은 인스턴스 초기화 시 한 번, service는 요청 처리 시, destroy는 서비스에서 제거할 때 호출한다. HttpServlet의 service는 doGet·doPost 등으로 분기한다."
  },
  {
    "id": "sadb02",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "동시성",
    "q": "서블릿 인스턴스 필드에 현재 사용자를 저장하면 왜 위험한가?",
    "ans": "여러 요청 스레드가 같은 인스턴스 필드를 공유해 값이 덮어써질 수 있다. 요청별 데이터는 지역 변수나 request 속성에 둔다. 컨테이너가 자동으로 스레드 안전성을 보장하지 않는다.",
    "pts": [
      "여러 요청 스레드가 같은 인스턴스 필드를 공유해 값이 덮어써질 수 있다",
      "요청별 데이터는 지역 변수나 request 속성에 둔다",
      "컨테이너가 자동으로 스레드 안전성을 보장하지 않는다."
    ],
    "a": 0,
    "e": "여러 요청 스레드가 같은 인스턴스 필드를 공유해 값이 덮어써질 수 있다. 요청별 데이터는 지역 변수나 request 속성에 둔다. 컨테이너가 자동으로 스레드 안전성을 보장하지 않는다."
  },
  {
    "id": "sadb03",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "URL 매핑",
    "q": "/shop/item, /shop/*, *.do, / 매핑이 있을 때 /shop/a.do는 어디에 매핑되는가?",
    "ans": "/shop/*이다. 정확 일치 → 가장 긴 경로 일치 → 확장자 일치 → 기본 매핑 순이다.",
    "pts": [
      "/shop/*이다",
      "정확 일치 → 가장 긴 경로 일치 → 확장자 일치 → 기본 매핑 순이다."
    ],
    "a": 0,
    "e": "/shop/*이다. 정확 일치 → 가장 긴 경로 일치 → 확장자 일치 → 기본 매핑 순이다."
  },
  {
    "id": "sadb04",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "Filter",
    "q": "chain.doFilter를 생략하면 어떻게 되는가?",
    "ans": "후속 필터와 대상 자원으로 진행하지 않는다. 인증 실패 시 응답을 종료할 수 있다. 호출 전후에 공통 처리를 둘 수 있다.",
    "pts": [
      "후속 필터와 대상 자원으로 진행하지 않는다",
      "인증 실패 시 응답을 종료할 수 있다",
      "호출 전후에 공통 처리를 둘 수 있다."
    ],
    "a": 0,
    "e": "후속 필터와 대상 자원으로 진행하지 않는다. 인증 실패 시 응답을 종료할 수 있다. 호출 전후에 공통 처리를 둘 수 있다."
  },
  {
    "id": "sadb05",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "DispatcherType",
    "q": "기본 필터가 내부 forward에도 실행되는가?",
    "ans": "기본 dispatcher는 REQUEST이다. forward에도 적용하려면 FORWARD를 지정한다. 최초 요청과 내부 이동 모두 처리하려면 REQUEST와 FORWARD를 함께 지정한다.",
    "pts": [
      "기본 dispatcher는 REQUEST이다",
      "forward에도 적용하려면 FORWARD를 지정한다",
      "최초 요청과 내부 이동 모두 처리하려면 REQUEST와 FORWARD를 함께 지정한다."
    ],
    "a": 0,
    "e": "기본 dispatcher는 REQUEST이다. forward에도 적용하려면 FORWARD를 지정한다. 최초 요청과 내부 이동 모두 처리하려면 REQUEST와 FORWARD를 함께 지정한다."
  },
  {
    "id": "sadb06",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "Front Controller",
    "q": "Front Controller 패턴의 목적은?",
    "ans": "공통 진입점에서 요청을 받아 처리기로 분배하고 공통 처리 및 화면 이동 정책을 일관되게 관리한다. 비즈니스 로직 전체를 한 클래스에 넣는다는 뜻은 아니다.",
    "pts": [
      "공통 진입점에서 요청을 받아 처리기로 분배하고 공통 처리 및 화면 이동 정책을 일관되게 관리한다",
      "비즈니스 로직 전체를 한 클래스에 넣는다는 뜻은 아니다."
    ],
    "a": 0,
    "e": "공통 진입점에서 요청을 받아 처리기로 분배하고 공통 처리 및 화면 이동 정책을 일관되게 관리한다. 비즈니스 로직 전체를 한 클래스에 넣는다는 뜻은 아니다."
  },
  {
    "id": "sadb07",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "에러 페이지",
    "q": "web.xml에서 404를 /error.jsp로 처리하도록 설정하시오.",
    "ans": "<error-page><error-code>404</error-code><location>/error.jsp</location></error-page>를 사용한다. 예외 타입은 error-code 대신 exception-type으로 매핑한다.",
    "pts": [
      "<error-page><error-code>404</error-code><location>/error.jsp</location></error-page>를 사용한다",
      "예외 타입은 error-code 대신 exception-type으로 매핑한다."
    ],
    "a": 0,
    "e": "<error-page><error-code>404</error-code><location>/error.jsp</location></error-page>를 사용한다. 예외 타입은 error-code 대신 exception-type으로 매핑한다."
  },
  {
    "id": "sadb08",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "JSP 변환",
    "q": "선언문, 스크립틀릿, 표현식은 서블릿의 어디로 변환되는가?",
    "ans": "선언문 <%! %>는 클래스 멤버, 스크립틀릿 <% %>는 _jspService 내부 코드, 표현식 <%= %>는 출력 코드가 된다. 선언문 필드는 요청 간 공유될 수 있다.",
    "pts": [
      "선언문 <%! %>는 클래스 멤버, 스크립틀릿 <% %>는 _jspService 내부 코드, 표현식 <%= %>는 출력 코드가 된다",
      "선언문 필드는 요청 간 공유될 수 있다."
    ],
    "a": 0,
    "e": "선언문 <%! %>는 클래스 멤버, 스크립틀릿 <% %>는 _jspService 내부 코드, 표현식 <%= %>는 출력 코드가 된다. 선언문 필드는 요청 간 공유될 수 있다."
  },
  {
    "id": "sadb09",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "include",
    "q": "include 지시자와 jsp:include를 비교하시오.",
    "ans": "include 지시자는 번역 시 소스를 합치고 jsp:include는 요청 처리 시 대상의 실행 결과를 포함한다.",
    "pts": [
      "include 지시자는 번역 시 소스를 합치고 jsp:include는 요청 처리 시 대상의 실행 결과를 포함한다."
    ],
    "a": 0,
    "e": "include 지시자는 번역 시 소스를 합치고 jsp:include는 요청 처리 시 대상의 실행 결과를 포함한다."
  },
  {
    "id": "sadb10",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "Scope",
    "q": "범위 없는 JSP EL 속성의 탐색 우선순위는?",
    "ans": "page → request → session → application이다. requestScope.name처럼 범위를 지정하면 해당 범위에서 찾는다.",
    "pts": [
      "page → request → session → application이다",
      "requestScope.name처럼 범위를 지정하면 해당 범위에서 찾는다."
    ],
    "a": 0,
    "e": "page → request → session → application이다. requestScope.name처럼 범위를 지정하면 해당 범위에서 찾는다."
  },
  {
    "id": "sadb11",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "JSTL",
    "q": "단일 조건과 다중 분기에는 어떤 JSTL core 태그를 쓰는가?",
    "ans": "단일 조건은 c:if, 다중 분기는 c:choose 안의 c:when과 c:otherwise를 쓴다. 처음 참인 when 하나가 실행된다.",
    "pts": [
      "단일 조건은 c:if, 다중 분기는 c:choose 안의 c:when과 c:otherwise를 쓴다",
      "처음 참인 when 하나가 실행된다."
    ],
    "a": 0,
    "e": "단일 조건은 c:if, 다중 분기는 c:choose 안의 c:when과 c:otherwise를 쓴다. 처음 참인 when 하나가 실행된다."
  },
  {
    "id": "sadb12",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "세션",
    "q": "JSESSIONID와 invalidate의 역할은?",
    "ans": "JSESSIONID는 서버 세션 식별자이다. invalidate는 서버 세션을 무효화하고 속성을 제거한다. 쿠키에 사용자 데이터 전체를 저장하는 것은 아니며 invalidate가 브라우저 쿠키 문자열을 즉시 삭제한다는 뜻도 아니다.",
    "pts": [
      "JSESSIONID는 서버 세션 식별자이다",
      "invalidate는 서버 세션을 무효화하고 속성을 제거한다",
      "쿠키에 사용자 데이터 전체를 저장하는 것은 아니며 invalidate가 브라우저 쿠키 문자열을 즉시 삭제한다는 뜻도 아니다."
    ],
    "a": 0,
    "e": "JSESSIONID는 서버 세션 식별자이다. invalidate는 서버 세션을 무효화하고 속성을 제거한다. 쿠키에 사용자 데이터 전체를 저장하는 것은 아니며 invalidate가 브라우저 쿠키 문자열을 즉시 삭제한다는 뜻도 아니다."
  },
  {
    "id": "sadb13",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "PK",
    "q": "복합 기본키의 NULL·중복 제약은?",
    "ans": "구성 열 모두 NULL을 허용하지 않고 값의 조합이 유일해야 한다. 각 열이 개별적으로 유일할 필요는 없다.",
    "pts": [
      "구성 열 모두 NULL을 허용하지 않고 값의 조합이 유일해야 한다",
      "각 열이 개별적으로 유일할 필요는 없다."
    ],
    "a": 0,
    "e": "구성 열 모두 NULL을 허용하지 않고 값의 조합이 유일해야 한다. 각 열이 개별적으로 유일할 필요는 없다."
  },
  {
    "id": "sadb14",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "FK",
    "q": "MySQL 8.4에서 orders의 fk_customer 외래키를 삭제하시오.",
    "ans": "ALTER TABLE orders DROP FOREIGN KEY fk_customer; 제약만 삭제하며 행이나 참조 테이블을 삭제하지 않는다.",
    "pts": [
      "ALTER TABLE orders DROP FOREIGN KEY fk_customer; 제약만 삭제하며 행이나 참조 테이블을 삭제하지 않는다."
    ],
    "a": 0,
    "e": "ALTER TABLE orders DROP FOREIGN KEY fk_customer; 제약만 삭제하며 행이나 참조 테이블을 삭제하지 않는다."
  },
  {
    "id": "sadb15",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "삭제 비교",
    "q": "MySQL InnoDB에서 DELETE, TRUNCATE, DROP을 비교하시오.",
    "ans": "DELETE는 WHERE로 일부 행 삭제가 가능하고 명시적 트랜잭션에서 커밋 전 롤백 가능하다. TRUNCATE는 전체 행을 비우고 구조를 유지하며 암시적 커밋으로 일반 롤백 불가이다. DROP은 구조와 데이터를 제거하며 일반 테이블 DDL은 암시적 커밋을 일으킨다.",
    "pts": [
      "DELETE는 WHERE로 일부 행 삭제가 가능하고 명시적 트랜잭션에서 커밋 전 롤백 가능하다",
      "TRUNCATE는 전체 행을 비우고 구조를 유지하며 암시적 커밋으로 일반 롤백 불가이다",
      "DROP은 구조와 데이터를 제거하며 일반 테이블 DDL은 암시적 커밋을 일으킨다."
    ],
    "a": 0,
    "e": "DELETE는 WHERE로 일부 행 삭제가 가능하고 명시적 트랜잭션에서 커밋 전 롤백 가능하다. TRUNCATE는 전체 행을 비우고 구조를 유지하며 암시적 커밋으로 일반 롤백 불가이다. DROP은 구조와 데이터를 제거하며 일반 테이블 DDL은 암시적 커밋을 일으킨다."
  },
  {
    "id": "sadb16",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "NULL",
    "q": "NULL = NULL과 NULL IS NULL의 결과 및 WHERE의 선택 규칙은?",
    "ans": "각각 UNKNOWN과 TRUE이다. WHERE는 TRUE인 행만 선택한다. NULL은 IS NULL 또는 IS NOT NULL로 검사한다.",
    "pts": [
      "각각 UNKNOWN과 TRUE이다",
      "WHERE는 TRUE인 행만 선택한다",
      "NULL은 IS NULL 또는 IS NOT NULL로 검사한다."
    ],
    "a": 0,
    "e": "각각 UNKNOWN과 TRUE이다. WHERE는 TRUE인 행만 선택한다. NULL은 IS NULL 또는 IS NOT NULL로 검사한다."
  },
  {
    "id": "sadb17",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "삼치 논리",
    "q": "TRUE AND UNKNOWN, FALSE AND UNKNOWN, TRUE OR UNKNOWN, NOT UNKNOWN의 결과는?",
    "ans": "순서대로 UNKNOWN, FALSE, TRUE, UNKNOWN이다. UNKNOWN을 모든 상황에서 FALSE처럼 계산하면 안 된다.",
    "pts": [
      "순서대로 UNKNOWN, FALSE, TRUE, UNKNOWN이다",
      "UNKNOWN을 모든 상황에서 FALSE처럼 계산하면 안 된다."
    ],
    "a": 0,
    "e": "순서대로 UNKNOWN, FALSE, TRUE, UNKNOWN이다. UNKNOWN을 모든 상황에서 FALSE처럼 계산하면 안 된다."
  },
  {
    "id": "sadb18",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "페이징",
    "q": "MySQL users를 id순으로 10개씩 조회할 때 3페이지 쿼리는?",
    "ans": "SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20; 건너뛸 행 수는 (페이지-1)×크기이다. 유일한 정렬 기준으로 순서를 안정화한다.",
    "pts": [
      "SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20; 건너뛸 행 수는 (페이지-1)×크기이다",
      "유일한 정렬 기준으로 순서를 안정화한다."
    ],
    "a": 0,
    "e": "SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20; 건너뛸 행 수는 (페이지-1)×크기이다. 유일한 정렬 기준으로 순서를 안정화한다."
  },
  {
    "id": "sadb19",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "문자열 결합",
    "q": "MySQL CONCAT('A', NULL, 'B')의 결과와 NULL을 빈 문자열로 대체하는 방법은?",
    "ans": "결과는 NULL이다. CONCAT('A', COALESCE(NULL, ''), 'B')는 AB이다. 문자열 결합 문법과 NULL 처리는 DB 제품마다 다르다.",
    "pts": [
      "결과는 NULL이다",
      "CONCAT('A', COALESCE(NULL, ''), 'B')는 AB이다",
      "문자열 결합 문법과 NULL 처리는 DB 제품마다 다르다."
    ],
    "a": 0,
    "e": "결과는 NULL이다. CONCAT('A', COALESCE(NULL, ''), 'B')는 AB이다. 문자열 결합 문법과 NULL 처리는 DB 제품마다 다르다."
  },
  {
    "id": "sadb20",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "저장점",
    "q": "BEGIN 후 A 삽입, SAVEPOINT s, B 삽입, ROLLBACK TO SAVEPOINT s, COMMIT 하면 무엇이 남는가?",
    "ans": "InnoDB의 정상 DML만 수행했다면 A만 남는다. 저장점 이후 B만 취소하며 부분 롤백은 트랜잭션을 종료하지 않는다.",
    "pts": [
      "InnoDB의 정상 DML만 수행했다면 A만 남는다",
      "저장점 이후 B만 취소하며 부분 롤백은 트랜잭션을 종료하지 않는다."
    ],
    "a": 0,
    "e": "InnoDB의 정상 DML만 수행했다면 A만 남는다. 저장점 이후 B만 취소하며 부분 롤백은 트랜잭션을 종료하지 않는다."
  },
  {
    "id": "sadb21",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "서브쿼리",
    "q": "스칼라 서브쿼리가 2행을 반환하면? 다중 행 비교 연산자는?",
    "ans": "스칼라 서브쿼리는 한 열·최대 한 행이어야 하므로 오류다. 0행이면 NULL이다. 다중 행 비교는 IN, ANY, ALL 등을 사용한다.",
    "pts": [
      "스칼라 서브쿼리는 한 열·최대 한 행이어야 하므로 오류다",
      "0행이면 NULL이다",
      "다중 행 비교는 IN, ANY, ALL 등을 사용한다."
    ],
    "a": 0,
    "e": "스칼라 서브쿼리는 한 열·최대 한 행이어야 하므로 오류다. 0행이면 NULL이다. 다중 행 비교는 IN, ANY, ALL 등을 사용한다."
  },
  {
    "id": "sadb22",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "EXISTS",
    "q": "customers(id), orders(customer_id)에서 주문이 있는 고객을 EXISTS로 구하시오.",
    "ans": "SELECT c.* FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id); 외부 고객의 id를 참조하는 상호 연관 서브쿼리이며 일치하는 행의 존재를 검사한다.",
    "pts": [
      "SELECT c.* FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id); 외부 고객의 id를 참조하는 상호 연관 서브쿼리이며 일치하는 행의 존재를 검사한다."
    ],
    "a": 0,
    "e": "SELECT c.* FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id); 외부 고객의 id를 참조하는 상호 연관 서브쿼리이며 일치하는 행의 존재를 검사한다."
  },
  {
    "id": "sadb23",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "차집합",
    "q": "MySQL 8.4에서 a(id)에만 있는 값을 중복 없이 구하는 집합 연산은?",
    "ans": "SELECT id FROM a EXCEPT SELECT id FROM b; 기본은 중복을 제거한다. 대응 열 수와 타입 호환성이 필요하다. 구버전 지원 여부와 Oracle MINUS 문법을 혼동하지 않는다.",
    "pts": [
      "SELECT id FROM a EXCEPT SELECT id FROM b; 기본은 중복을 제거한다",
      "대응 열 수와 타입 호환성이 필요하다",
      "구버전 지원 여부와 Oracle MINUS 문법을 혼동하지 않는다."
    ],
    "a": 0,
    "e": "SELECT id FROM a EXCEPT SELECT id FROM b; 기본은 중복을 제거한다. 대응 열 수와 타입 호환성이 필요하다. 구버전 지원 여부와 Oracle MINUS 문법을 혼동하지 않는다."
  },
  {
    "id": "sadb24",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "View",
    "q": "일반 뷰는 데이터를 따로 저장하는가? GROUP BY·SUM 뷰를 MySQL에서 갱신할 수 있는가?",
    "ans": "일반 뷰는 저장된 조회 정의에 기반한다. GROUP BY·집계 함수가 있는 MySQL 뷰는 갱신할 수 없다. 단순 뷰도 갱신 가능 조건을 만족해야 한다.",
    "pts": [
      "일반 뷰는 저장된 조회 정의에 기반한다",
      "GROUP BY·집계 함수가 있는 MySQL 뷰는 갱신할 수 없다",
      "단순 뷰도 갱신 가능 조건을 만족해야 한다."
    ],
    "a": 0,
    "e": "일반 뷰는 저장된 조회 정의에 기반한다. GROUP BY·집계 함수가 있는 MySQL 뷰는 갱신할 수 없다. 단순 뷰도 갱신 가능 조건을 만족해야 한다."
  },
  {
    "id": "sadb25",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "정규화",
    "q": "1NF, 2NF, 3NF, BCNF의 핵심 조건을 설명하시오.",
    "ans": "1NF는 값의 원자성이다. 2NF는 1NF를 만족하고 비주요 속성의 후보키 일부에 대한 부분 종속을 제거한다. 3NF는 비자명 종속 X→A마다 X가 슈퍼키이거나 A가 주요 속성이다. BCNF는 모든 비자명 종속의 결정자가 슈퍼키이다.",
    "pts": [
      "1NF는 값의 원자성이다",
      "2NF는 1NF를 만족하고 비주요 속성의 후보키 일부에 대한 부분 종속을 제거한다",
      "3NF는 비자명 종속 X→A마다 X가 슈퍼키이거나 A가 주요 속성이다"
    ],
    "a": 0,
    "e": "1NF는 값의 원자성이다. 2NF는 1NF를 만족하고 비주요 속성의 후보키 일부에 대한 부분 종속을 제거한다. 3NF는 비자명 종속 X→A마다 X가 슈퍼키이거나 A가 주요 속성이다. BCNF는 모든 비자명 종속의 결정자가 슈퍼키이다."
  },
  {
    "id": "sadb26",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "정규화 사례",
    "q": "수강(학생ID, 과목ID, 학생명, 성적)의 키가 (학생ID, 과목ID)이고 학생ID→학생명일 때 어떤 정규형 위반인가?",
    "ans": "1NF를 만족한다면 학생명이 키 일부에 종속되어 2NF 위반이다. 학생(학생ID, 학생명)과 수강(학생ID, 과목ID, 성적)으로 분해해 중복과 갱신 이상을 줄인다.",
    "pts": [
      "1NF를 만족한다면 학생명이 키 일부에 종속되어 2NF 위반이다",
      "학생(학생ID, 학생명)과 수강(학생ID, 과목ID, 성적)으로 분해해 중복과 갱신 이상을 줄인다."
    ],
    "a": 0,
    "e": "1NF를 만족한다면 학생명이 키 일부에 종속되어 2NF 위반이다. 학생(학생ID, 학생명)과 수강(학생ID, 과목ID, 성적)으로 분해해 중복과 갱신 이상을 줄인다."
  },
  {
    "id": "sadb27",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "전체 스캔",
    "q": "인덱스가 있어도 Full Table Scan을 선택하는 이유는?",
    "ans": "테이블이 작거나 대부분의 행이 필요하면 전체 행 확인이 인덱스 탐색과 반복 행 조회보다 저렴할 수 있다. 선택도와 실행계획을 확인해야 한다.",
    "pts": [
      "테이블이 작거나 대부분의 행이 필요하면 전체 행 확인이 인덱스 탐색과 반복 행 조회보다 저렴할 수 있다",
      "선택도와 실행계획을 확인해야 한다."
    ],
    "a": 0,
    "e": "테이블이 작거나 대부분의 행이 필요하면 전체 행 확인이 인덱스 탐색과 반복 행 조회보다 저렴할 수 있다. 선택도와 실행계획을 확인해야 한다."
  },
  {
    "id": "sadb28",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "인덱스",
    "q": "InnoDB의 클러스터드·보조 인덱스 리프 구조는?",
    "ans": "클러스터드 인덱스 리프는 행 데이터를 저장하고 보통 PK가 키이다. 보조 인덱스 리프는 보조 키와 PK 값을 저장한다. 필요한 열을 보조 인덱스만으로 얻지 못하면 PK로 추가 조회한다.",
    "pts": [
      "클러스터드 인덱스 리프는 행 데이터를 저장하고 보통 PK가 키이다",
      "보조 인덱스 리프는 보조 키와 PK 값을 저장한다",
      "필요한 열을 보조 인덱스만으로 얻지 못하면 PK로 추가 조회한다."
    ],
    "a": 0,
    "e": "클러스터드 인덱스 리프는 행 데이터를 저장하고 보통 PK가 키이다. 보조 인덱스 리프는 보조 키와 PK 값을 저장한다. 필요한 열을 보조 인덱스만으로 얻지 못하면 PK로 추가 조회한다."
  },
  {
    "id": "sadb29",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "forward 비교",
    "q": "forward와 sendRedirect를 왕복 횟수·URL·request 속성 공유로 비교하시오. 단일 이동을 가정한다.",
    "ans": "forward는 최초 요청 내 내부 이동이므로 요청·응답 1회, URL 유지, request 속성 공유이다. redirect는 브라우저의 새 요청이 필요하므로 총 2회, URL 변경, 기존 request 속성 미공유이다.",
    "pts": [
      "forward는 최초 요청 내 내부 이동이므로 요청·응답 1회, URL 유지, request 속성 공유이다",
      "redirect는 브라우저의 새 요청이 필요하므로 총 2회, URL 변경, 기존 request 속성 미공유이다."
    ],
    "a": 0,
    "e": "forward는 최초 요청 내 내부 이동이므로 요청·응답 1회, URL 유지, request 속성 공유이다. redirect는 브라우저의 새 요청이 필요하므로 총 2회, URL 변경, 기존 request 속성 미공유이다."
  },
  {
    "id": "sadb30",
    "set": "db",
    "sec": "essay",
    "kind": "essay",
    "topic": "WHERE와 HAVING",
    "q": "조건 적용 시점과 집계 함수 사용 차이를 설명하고 부서 평균 급여 300 이상을 구하시오.",
    "ans": "WHERE는 그룹화 전 행을 필터링하며 같은 쿼리 블록의 집계 결과를 조건으로 사용할 수 없다. HAVING은 그룹화 후 그룹을 필터링하며 집계 함수 사용이 가능하다. SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id HAVING AVG(salary)>=300;",
    "pts": [
      "WHERE는 그룹화 전 행을 필터링하며 같은 쿼리 블록의 집계 결과를 조건으로 사용할 수 없다",
      "HAVING은 그룹화 후 그룹을 필터링하며 집계 함수 사용이 가능하다",
      "SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id HAVING AVG(salary)>=300;"
    ],
    "a": 0,
    "e": "WHERE는 그룹화 전 행을 필터링하며 같은 쿼리 블록의 집계 결과를 조건으로 사용할 수 없다. HAVING은 그룹화 후 그룹을 필터링하며 집계 함수 사용이 가능하다. SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id HAVING AVG(salary)>=300;"
  }
];
