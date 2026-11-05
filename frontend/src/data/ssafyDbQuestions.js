// 자체 제작 예상문제. SQL: MySQL 8.4 / InnoDB 기준.
export const SSAFY_DB_QUESTIONS = [
  {
    "id": "sadb01",
    "set": "db",
    "sec": "obj",
    "topic": "생명주기",
    "q": "서블릿 생명주기에 대한 설명으로 옳은 것은?",
    "a": 0,
    "e": "init은 인스턴스 초기화 시 한 번, service는 요청 처리 시, destroy는 서비스에서 제거할 때 호출한다. HttpServlet의 service는 doGet·doPost 등으로 분기한다.",
    "o": [
      "init은 인스턴스 초기화 때, service는 요청 처리 때 호출된다.",
      "init은 요청마다 호출된다.",
      "destroy는 응답마다 호출된다.",
      "doGet이 init보다 먼저 호출된다."
    ]
  },
  {
    "id": "sadb02",
    "set": "db",
    "sec": "obj",
    "topic": "동시성",
    "q": "서블릿 인스턴스 필드에 현재 사용자를 저장할 때의 문제는?",
    "a": 3,
    "e": "여러 요청 스레드가 같은 인스턴스 필드를 공유해 값이 덮어써질 수 있다. 요청별 데이터는 지역 변수나 request 속성에 둔다. 컨테이너가 자동으로 스레드 안전성을 보장하지 않는다.",
    "o": [
      "서블릿은 요청마다 반드시 새 인스턴스를 생성하므로 안전하다.",
      "컨테이너가 모든 인스턴스 필드를 자동 동기화한다.",
      "인스턴스 필드는 각 스레드의 스택에 따로 저장된다.",
      "여러 요청 스레드가 필드를 공유해 다른 사용자 값으로 덮어쓸 수 있다."
    ]
  },
  {
    "id": "sadb03",
    "set": "db",
    "sec": "obj",
    "topic": "URL 매핑",
    "q": "/shop/item, /shop/*, *.do, / 매핑 중 /shop/a.do 요청에 선택되는 것은?",
    "a": 2,
    "e": "/shop/*이다. 정확 일치 → 가장 긴 경로 일치 → 확장자 일치 → 기본 매핑 순이다.",
    "o": [
      "/shop/item",
      "/",
      "/shop/*",
      "*.do"
    ]
  },
  {
    "id": "sadb04",
    "set": "db",
    "sec": "obj",
    "topic": "Filter",
    "q": "필터에서 chain.doFilter(request, response)를 호출하지 않을 때 옳은 것은?",
    "a": 1,
    "e": "후속 필터와 대상 자원으로 진행하지 않는다. 인증 실패 시 응답을 종료할 수 있다. 호출 전후에 공통 처리를 둘 수 있다.",
    "o": [
      "항상 컴파일 오류가 발생한다.",
      "후속 필터와 대상 자원으로 처리가 진행되지 않는다.",
      "대상 서블릿이 자동으로 먼저 실행된다.",
      "다음 필터만 건너뛰고 대상은 반드시 실행된다."
    ]
  },
  {
    "id": "sadb05",
    "set": "db",
    "sec": "obj",
    "topic": "DispatcherType",
    "q": "최초 요청과 내부 forward 모두에 필터를 적용하는 DispatcherType 조합은?",
    "a": 0,
    "e": "기본 dispatcher는 REQUEST이다. forward에도 적용하려면 FORWARD를 지정한다. 최초 요청과 내부 이동 모두 처리하려면 REQUEST와 FORWARD를 함께 지정한다.",
    "o": [
      "REQUEST, FORWARD",
      "REQUEST, INCLUDE",
      "FORWARD, ERROR",
      "INCLUDE, ASYNC"
    ]
  },
  {
    "id": "sadb06",
    "set": "db",
    "sec": "obj",
    "topic": "Front Controller",
    "q": "Front Controller 패턴의 역할로 옳은 것은?",
    "a": 3,
    "e": "공통 진입점에서 요청을 받아 처리기로 분배하고 공통 처리 및 화면 이동 정책을 일관되게 관리한다. 비즈니스 로직 전체를 한 클래스에 넣는다는 뜻은 아니다.",
    "o": [
      "모든 비즈니스 로직을 반드시 단일 클래스에 작성한다.",
      "브라우저가 DB에 직접 요청하도록 한다.",
      "URL마다 별도 웹 서버를 실행한다.",
      "공통 진입점에서 요청을 받아 적절한 처리기로 분배한다."
    ]
  },
  {
    "id": "sadb07",
    "set": "db",
    "sec": "obj",
    "topic": "에러 페이지",
    "q": "web.xml에서 404 오류를 /error.jsp로 매핑하는 설정은?",
    "a": 2,
    "e": "<error-page><error-code>404</error-code><location>/error.jsp</location></error-page>를 사용한다. 예외 타입은 error-code 대신 exception-type으로 매핑한다.",
    "o": [
      "<error-page><status>404</status><url>/error.jsp</url></error-page>",
      "<servlet-mapping><error-code>404</error-code><location>/error.jsp</location></servlet-mapping>",
      "<error-page><error-code>404</error-code><location>/error.jsp</location></error-page>",
      "<error-page><exception-type>404</exception-type><location>/error.jsp</location></error-page>"
    ]
  },
  {
    "id": "sadb08",
    "set": "db",
    "sec": "obj",
    "topic": "JSP 변환",
    "q": "JSP 선언문 <%! int count = 0; %>의 변환 결과로 옳은 것은?",
    "a": 1,
    "e": "선언문 <%! %>는 클래스 멤버, 스크립틀릿 <% %>는 _jspService 내부 코드, 표현식 <%= %>는 출력 코드가 된다. 선언문 필드는 요청 간 공유될 수 있다.",
    "o": [
      "HTML 주석으로 변환되어 실행되지 않는다.",
      "변환된 서블릿의 멤버 필드가 되어 요청 간 공유될 수 있다.",
      "_jspService의 지역 변수로만 변환된다.",
      "항상 session 속성으로 변환된다."
    ]
  },
  {
    "id": "sadb09",
    "set": "db",
    "sec": "obj",
    "topic": "include",
    "q": "include 지시자와 jsp:include의 차이로 옳은 것은?",
    "a": 0,
    "e": "include 지시자는 번역 시 소스를 합치고 jsp:include는 요청 처리 시 대상의 실행 결과를 포함한다.",
    "o": [
      "지시자는 번역 시 소스를 합치고 jsp:include는 요청 처리 시 실행 결과를 포함한다.",
      "두 방식 모두 브라우저에서만 실행된다.",
      "지시자는 새 HTTP 요청을 보내고 jsp:include는 URL을 변경한다.",
      "지시자는 실행 결과만 포함하고 jsp:include는 번역 시 소스를 합친다."
    ]
  },
  {
    "id": "sadb10",
    "set": "db",
    "sec": "obj",
    "topic": "Scope",
    "q": "범위를 명시하지 않은 JSP EL 속성의 탐색 순서는?",
    "a": 3,
    "e": "page → request → session → application이다. requestScope.name처럼 범위를 지정하면 해당 범위에서 찾는다.",
    "o": [
      "application → session → request → page",
      "request → page → application → session",
      "session → request → page → application",
      "page → request → session → application"
    ]
  },
  {
    "id": "sadb11",
    "set": "db",
    "sec": "obj",
    "topic": "JSTL",
    "q": "JSTL c:choose에 대한 설명으로 옳은 것은?",
    "a": 2,
    "e": "단일 조건은 c:if, 다중 분기는 c:choose 안의 c:when과 c:otherwise를 쓴다. 처음 참인 when 하나가 실행된다.",
    "o": [
      "c:otherwise는 조건이 참이어도 항상 실행된다.",
      "c:if에는 반드시 c:else를 작성해야 한다.",
      "처음 참인 c:when 하나를 실행하며 없으면 c:otherwise를 실행한다.",
      "참인 모든 c:when을 반드시 실행한다."
    ]
  },
  {
    "id": "sadb12",
    "set": "db",
    "sec": "obj",
    "topic": "세션",
    "q": "JSESSIONID와 session.invalidate()의 설명으로 옳은 것은?",
    "a": 1,
    "e": "JSESSIONID는 서버 세션 식별자이다. invalidate는 서버 세션을 무효화하고 속성을 제거한다. 쿠키에 사용자 데이터 전체를 저장하는 것은 아니며 invalidate가 브라우저 쿠키 문자열을 즉시 삭제한다는 뜻도 아니다.",
    "o": [
      "invalidate 이후에도 기존 세션 객체에 자유롭게 속성을 추가할 수 있다.",
      "JSESSIONID는 세션 식별자이며 invalidate는 서버 세션과 그 속성을 무효화한다.",
      "JSESSIONID에는 사용자 속성 전체가 저장된다.",
      "invalidate는 서버 세션을 유지하고 쿠키만 삭제한다."
    ]
  },
  {
    "id": "sadb13",
    "set": "db",
    "sec": "obj",
    "topic": "PK",
    "q": "복합 기본키 (student_id, course_id)에 대한 설명으로 옳은 것은?",
    "a": 0,
    "e": "구성 열 모두 NULL을 허용하지 않고 값의 조합이 유일해야 한다. 각 열이 개별적으로 유일할 필요는 없다.",
    "o": [
      "두 열 모두 NULL을 허용하지 않으며 두 값의 조합이 유일해야 한다.",
      "student_id 하나만으로 반드시 유일해야 한다.",
      "course_id는 NULL을 허용한다.",
      "복합 기본키는 세 열 이상일 때만 가능하다."
    ]
  },
  {
    "id": "sadb14",
    "set": "db",
    "sec": "obj",
    "topic": "FK",
    "q": "MySQL 8.4에서 orders의 fk_customer 외래키 제약을 삭제하는 SQL은?",
    "a": 3,
    "e": "ALTER TABLE orders DROP FOREIGN KEY fk_customer; 제약만 삭제하며 행이나 참조 테이블을 삭제하지 않는다.",
    "o": [
      "DELETE FOREIGN KEY fk_customer FROM orders;",
      "DROP TABLE fk_customer;",
      "ALTER TABLE orders DROP PRIMARY KEY fk_customer;",
      "ALTER TABLE orders DROP FOREIGN KEY fk_customer;"
    ]
  },
  {
    "id": "sadb15",
    "set": "db",
    "sec": "obj",
    "topic": "삭제 비교",
    "q": "MySQL 8.4 InnoDB의 일반 테이블에서 DELETE, TRUNCATE, DROP의 설명으로 옳은 것은?",
    "a": 2,
    "e": "DELETE는 WHERE로 일부 행 삭제가 가능하고 명시적 트랜잭션에서 커밋 전 롤백 가능하다. TRUNCATE는 전체 행을 비우고 구조를 유지하며 암시적 커밋으로 일반 롤백 불가이다. DROP은 구조와 데이터를 제거하며 일반 테이블 DDL은 암시적 커밋을 일으킨다.",
    "o": [
      "DROP은 데이터만 지우고 구조를 남긴다.",
      "TRUNCATE는 명시적 트랜잭션에서 항상 일반 ROLLBACK으로 복구된다.",
      "DELETE는 WHERE가 가능하고 TRUNCATE는 구조를 남기며 DROP은 구조도 삭제한다.",
      "TRUNCATE는 WHERE로 선택한 행만 삭제한다."
    ]
  },
  {
    "id": "sadb16",
    "set": "db",
    "sec": "obj",
    "topic": "NULL",
    "q": "SQL에서 NULL = NULL, NULL IS NULL의 결과는 순서대로 무엇인가?",
    "a": 1,
    "e": "각각 UNKNOWN과 TRUE이다. WHERE는 TRUE인 행만 선택한다. NULL은 IS NULL 또는 IS NOT NULL로 검사한다.",
    "o": [
      "TRUE, UNKNOWN",
      "UNKNOWN, TRUE",
      "TRUE, TRUE",
      "FALSE, FALSE"
    ]
  },
  {
    "id": "sadb17",
    "set": "db",
    "sec": "obj",
    "topic": "삼치 논리",
    "q": "TRUE AND UNKNOWN, FALSE AND UNKNOWN, TRUE OR UNKNOWN, NOT UNKNOWN의 결과는?",
    "a": 0,
    "e": "순서대로 UNKNOWN, FALSE, TRUE, UNKNOWN이다. UNKNOWN을 모든 상황에서 FALSE처럼 계산하면 안 된다.",
    "o": [
      "UNKNOWN, FALSE, TRUE, UNKNOWN",
      "TRUE, FALSE, TRUE, FALSE",
      "UNKNOWN, UNKNOWN, UNKNOWN, TRUE",
      "FALSE, FALSE, UNKNOWN, TRUE"
    ]
  },
  {
    "id": "sadb18",
    "set": "db",
    "sec": "obj",
    "topic": "페이징",
    "q": "MySQL에서 users를 id 오름차순으로 10개씩 조회할 때 3페이지의 SQL은?",
    "a": 3,
    "e": "SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20; 건너뛸 행 수는 (페이지-1)×크기이다. 유일한 정렬 기준으로 순서를 안정화한다.",
    "o": [
      "SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 30;",
      "SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 10;",
      "SELECT * FROM users ORDER BY id LIMIT 3 OFFSET 10;",
      "SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 20;"
    ]
  },
  {
    "id": "sadb19",
    "set": "db",
    "sec": "obj",
    "topic": "문자열 결합",
    "q": "MySQL CONCAT('A', NULL, 'B')의 결과는?",
    "a": 2,
    "e": "결과는 NULL이다. CONCAT('A', COALESCE(NULL, ''), 'B')는 AB이다. 문자열 결합 문법과 NULL 처리는 DB 제품마다 다르다.",
    "o": [
      "ANULLB",
      "빈 문자열",
      "NULL",
      "AB"
    ]
  },
  {
    "id": "sadb20",
    "set": "db",
    "sec": "obj",
    "topic": "저장점",
    "q": "InnoDB에서 BEGIN → A 삽입 → SAVEPOINT s → B 삽입 → ROLLBACK TO SAVEPOINT s → COMMIT을 실행했다. 정상 DML만 수행했다면 남는 것은?",
    "a": 1,
    "e": "InnoDB의 정상 DML만 수행했다면 A만 남는다. 저장점 이후 B만 취소하며 부분 롤백은 트랜잭션을 종료하지 않는다.",
    "o": [
      "둘 다 취소된다.",
      "A만 남는다.",
      "A와 B 모두 남는다.",
      "B만 남는다."
    ]
  },
  {
    "id": "sadb21",
    "set": "db",
    "sec": "obj",
    "topic": "서브쿼리",
    "q": "한 열을 반환하는 스칼라 서브쿼리가 두 행을 반환할 때 옳은 것은?",
    "a": 0,
    "e": "스칼라 서브쿼리는 한 열·최대 한 행이어야 하므로 오류다. 0행이면 NULL이다. 다중 행 비교는 IN, ANY, ALL 등을 사용한다.",
    "o": [
      "오류가 발생한다.",
      "첫 행을 자동 선택한다.",
      "두 행을 문자열로 합친다.",
      "자동으로 IN 조건으로 바뀐다."
    ]
  },
  {
    "id": "sadb22",
    "set": "db",
    "sec": "obj",
    "topic": "EXISTS",
    "q": "customers(id), orders(customer_id)에서 주문이 있는 고객을 찾는 쿼리는?",
    "a": 3,
    "e": "SELECT c.* FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id); 외부 고객의 id를 참조하는 상호 연관 서브쿼리이며 일치하는 행의 존재를 검사한다.",
    "o": [
      "SELECT c.* FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id);",
      "SELECT c.* FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE 1=0);",
      "SELECT c.* FROM customers c WHERE c.id = NULL;",
      "SELECT c.* FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id=c.id);"
    ]
  },
  {
    "id": "sadb23",
    "set": "db",
    "sec": "obj",
    "topic": "차집합",
    "q": "MySQL 8.4에서 a(id)에 있고 b(id)에는 없는 값을 중복 없이 반환하는 집합 연산은?",
    "a": 2,
    "e": "SELECT id FROM a EXCEPT SELECT id FROM b; 기본은 중복을 제거한다. 대응 열 수와 타입 호환성이 필요하다. 구버전 지원 여부와 Oracle MINUS 문법을 혼동하지 않는다.",
    "o": [
      "SELECT id FROM a INTERSECT SELECT id FROM b;",
      "SELECT id FROM b EXCEPT SELECT id FROM a;",
      "SELECT id FROM a EXCEPT SELECT id FROM b;",
      "SELECT id FROM a UNION SELECT id FROM b;"
    ]
  },
  {
    "id": "sadb24",
    "set": "db",
    "sec": "obj",
    "topic": "View",
    "q": "MySQL 뷰에 대한 설명으로 옳은 것은?",
    "a": 1,
    "e": "일반 뷰는 저장된 조회 정의에 기반한다. GROUP BY·집계 함수가 있는 MySQL 뷰는 갱신할 수 없다. 단순 뷰도 갱신 가능 조건을 만족해야 한다.",
    "o": [
      "뷰를 생성하면 원본 테이블은 자동 삭제된다.",
      "GROUP BY와 SUM을 포함한 뷰는 일반적인 UPDATE 대상이 될 수 없다.",
      "일반 뷰는 항상 원본 데이터를 별도 복제 저장한다.",
      "모든 뷰는 조건 없이 INSERT가 가능하다."
    ]
  },
  {
    "id": "sadb25",
    "set": "db",
    "sec": "obj",
    "topic": "정규화",
    "q": "BCNF의 조건으로 옳은 것은?",
    "a": 0,
    "e": "1NF는 값의 원자성이다. 2NF는 1NF를 만족하고 비주요 속성의 후보키 일부에 대한 부분 종속을 제거한다. 3NF는 비자명 종속 X→A마다 X가 슈퍼키이거나 A가 주요 속성이다. BCNF는 모든 비자명 종속의 결정자가 슈퍼키이다.",
    "o": [
      "모든 비자명 함수 종속의 결정자가 슈퍼키이다.",
      "모든 테이블은 단일 열로만 구성된다.",
      "모든 속성은 외래키여야 한다.",
      "모든 후보키는 반드시 한 열이다."
    ]
  },
  {
    "id": "sadb26",
    "set": "db",
    "sec": "obj",
    "topic": "정규화 사례",
    "q": "수강(학생ID, 과목ID, 학생명, 성적)의 키가 (학생ID, 과목ID)이고 학생ID→학생명이다. 1NF를 만족한다면 2NF를 위반하는 이유는?",
    "a": 3,
    "e": "1NF를 만족한다면 학생명이 키 일부에 종속되어 2NF 위반이다. 학생(학생ID, 학생명)과 수강(학생ID, 과목ID, 성적)으로 분해해 중복과 갱신 이상을 줄인다.",
    "o": [
      "기본키가 복합키라는 사실만으로 위반하기 때문이다.",
      "성적이 숫자형이기 때문이다.",
      "학생ID가 NULL을 허용하지 않기 때문이다.",
      "비주요 속성 학생명이 후보키 일부에 부분 함수 종속되기 때문이다."
    ]
  },
  {
    "id": "sadb27",
    "set": "db",
    "sec": "obj",
    "topic": "전체 스캔",
    "q": "인덱스가 있어도 Full Table Scan이 유리할 수 있는 상황은?",
    "a": 2,
    "e": "테이블이 작거나 대부분의 행이 필요하면 전체 행 확인이 인덱스 탐색과 반복 행 조회보다 저렴할 수 있다. 선택도와 실행계획을 확인해야 한다.",
    "o": [
      "조회할 행이 단 한 건이고 유일 인덱스로 찾을 수 있는 모든 상황",
      "WHERE가 있으면 항상 전체 스캔만 가능하다.",
      "테이블이 작거나 조회 대상이 대부분의 행인 경우",
      "인덱스가 존재하는 모든 상황"
    ]
  },
  {
    "id": "sadb28",
    "set": "db",
    "sec": "obj",
    "topic": "인덱스",
    "q": "InnoDB 보조 인덱스의 리프에 저장되는 정보로 옳은 것은?",
    "a": 1,
    "e": "클러스터드 인덱스 리프는 행 데이터를 저장하고 보통 PK가 키이다. 보조 인덱스 리프는 보조 키와 PK 값을 저장한다. 필요한 열을 보조 인덱스만으로 얻지 못하면 PK로 추가 조회한다.",
    "o": [
      "다른 테이블의 외래키 목록만",
      "보조 인덱스 키와 해당 행의 기본키 값",
      "항상 테이블의 모든 열 데이터",
      "행의 메모리 주소만"
    ]
  },
  {
    "id": "sadb29",
    "set": "db",
    "sec": "obj",
    "topic": "forward 비교",
    "q": "단일 이동을 가정할 때 forward와 sendRedirect 비교로 옳은 것은?",
    "a": 0,
    "e": "forward는 최초 요청 내 내부 이동이므로 요청·응답 1회, URL 유지, request 속성 공유이다. redirect는 브라우저의 새 요청이 필요하므로 총 2회, URL 변경, 기존 request 속성 미공유이다.",
    "o": [
      "forward는 왕복 1회·URL 유지·request 공유, redirect는 총 2회·URL 변경·request 미공유이다.",
      "둘 다 왕복 1회이며 request를 공유한다.",
      "forward는 URL이 변경되고 redirect는 유지된다.",
      "redirect는 기존 request 속성을 새 요청에 자동 복사한다."
    ]
  },
  {
    "id": "sadb30",
    "set": "db",
    "sec": "obj",
    "topic": "WHERE와 HAVING",
    "q": "부서별 평균 급여가 300 이상인 그룹만 조회하는 SQL은?",
    "a": 3,
    "e": "WHERE는 그룹화 전 행을 필터링하며 같은 쿼리 블록의 집계 결과를 조건으로 사용할 수 없다. HAVING은 그룹화 후 그룹을 필터링하며 집계 함수 사용이 가능하다. SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id HAVING AVG(salary)>=300;",
    "o": [
      "SELECT dept_id, AVG(salary) FROM employees WHERE AVG(salary)>=300 GROUP BY dept_id;",
      "SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id WHERE AVG(salary)>=300;",
      "SELECT dept_id, AVG(salary) FROM employees WHERE salary>=300 GROUP BY dept_id;",
      "SELECT dept_id, AVG(salary) FROM employees GROUP BY dept_id HAVING AVG(salary)>=300;"
    ]
  }
];
