# 전공노트 내용 점검 · 2026-10-15

사용자가 정규화 등 부정확하거나 부족한 설명의 정정·보충을 요청했다. 전체 18과목 169개 문답(원문 137, 빅데이터 32)을 읽어 점검하고 125개를 보완했다. 이 중 원문의 빈 답변 31개를 모두 작성했다. 질문을 삭제하지 않고 ID·원문 링크·학습 기록을 유지한다. 보완은 새 학습 답변이며 원문 저자의 답변으로 표시하지 않는다.

| 과목 | 검토 | 보완 | 유지 |
| --- | ---: | ---: | ---: |
| 네트워크 | 12 | 12 | 0 |
| 운영체제 | 11 | 9 | 2 |
| 데이터베이스 | 14 | 14 | 0 |
| 자료구조/알고리즘 | 11 | 9 | 2 |
| 보안 | 8 | 8 | 0 |
| 컴파일러 | 1 | 1 | 0 |
| Java | 25 | 22 | 3 |
| Spring | 18 | 16 | 2 |
| JPA | 4 | 4 | 0 |
| nodeJS | 2 | 2 | 0 |
| Python | 13 | 12 | 1 |
| 트러블 슈팅 | 1 | 1 | 0 |
| 디자인 패턴 | 6 | 4 | 2 |
| 테스트 | 3 | 3 | 0 |
| 인프라/클라우드 | 4 | 4 | 0 |
| 컨테이너 | 2 | 2 | 0 |
| DevOps | 2 | 1 | 1 |
| 빅데이터 | 32 | 1 | 31 |
| 합계 | 169 | 125 | 44 |

## 보완 기준

- 핵심 정의부터 설명하고 전제·예시를 보충한다. 제품·버전에 따라 다른 동작을 보편 법칙처럼 쓰지 않는다.
- 정규화: 함수 종속, 후보키, 1NF·2NF·3NF·BCNF, 수강/학생/학과 분해, 이상 현상, 무손실 조인을 설명한다. BCNF와 4NF를 혼동하지 않는다.
- 네트워크: SYN 플래그와 순서 번호, TLS 서명과 암호화, HTTP 멱등성, origin과 domain을 구분한다.
- OS: CPU 캐시 전체 초기화 단정, 비동기=병렬, 싱글톤=스레드 안전, 가상 메모리=스왑 등의 오해를 제거한다.
- DB: 격리 수준은 표준과 구현을 구분하고 Serializable=전체 테이블 락을 정정한다. JOIN의 실제 결과와 ON/WHERE 차이를 설명한다. CAP는 분할 상황을 명시한다.
- Java: static과 GC, 기본형 크기와 boolean, equals/hashCode, volatile의 한계, 예외 롤백, assert의 비활성화 등을 정정한다.
- Spring/JPA: Servlet 인스턴스 재사용, 스코프·생명주기, 필터 예외 처리 범위, 전파가 Spring 설정이라는 점, N+1 해결의 주의점을 보완한다.
- Python/nodeJS: 빈 답변을 채우고 GIL 빌드 차이, 이름 바인딩, 얕은 복사와 단순 참조 대입, 네트워크 I/O와 작업 풀을 구분한다.
- 운영/테스트: 캐시 장애 시 무조건 DB 우회라는 위험한 단정, 장애 허용과 배포 전략 혼동, delivery와 deployment 혼동을 정정한다. 경험 질문은 예시임을 밝힌다.
- 빅데이터 32개는 기본기용 범위와 설명을 유지하며 중앙값의 짝수 표본 조건만 보충한다.

유지한 원문 13개는 캐시 지역성·프로세스 용어, 스택/큐·BST 최악, 컬렉션·제네릭·결합도, IoC/DI·Bean 정의, 데코레이터, 브릿지·전략 패턴, DevOps다. 기본 설명으로 사용할 수 있어 불필요하게 전부 다시 쓰지 않았다.

## 확인에 사용한 1차 자료

아래 자료는 개념·버전별 차이 확인용이다. 문서를 통째로 번역·복사하지 않았으며 예시는 이 프로젝트용으로 작성했다.

- 정규화: [Database System Concepts, Ch.7 관계형 설계](https://www.db-book.com/slides-dir/PDF-dir/ch7.pdf).
- 격리 수준: [PostgreSQL 18](https://www.postgresql.org/docs/18/transaction-iso.html).
- TLS: [RFC 8446 TLS 1.3](https://www.rfc-editor.org/info/rfc8446/). 역사적인 RSA 키 전송과 TLS 1.3의 차이를 확인.
- OAuth: [RFC 6749](https://www.rfc-editor.org/info/rfc6749/).
- Java 타입: [JLS 21 Ch.4](https://docs.oracle.com/javase/specs/jls/se21/html/jls-4.html).
- Spring: [Bean scopes](https://docs.spring.io/spring-framework/reference/core/beans/factory-scopes.html), [DispatcherServlet](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-servlet.html), [트랜잭션 전파](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html), [@Transactional](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html).
- Python: [데이터 모델](https://docs.python.org/3/reference/datamodel.html), [클래스·이름 바인딩](https://docs.python.org/3/tutorial/classes.html), [실행 모델](https://docs.python.org/3/reference/executionmodel.html), [코루틴](https://docs.python.org/3/library/asyncio-task.html), [free threading](https://docs.python.org/3/howto/free-threading-python.html).
- Node.js: [이벤트 루프와 작업 풀](https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop).
- JavaScript: [MDN 얕은 복사](https://developer.mozilla.org/en-US/docs/Glossary/Shallow_copy).
- 보안: [OWASP 비밀번호 저장](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [CSRF 방어](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).
- Redis: [영속화](https://redis.io/docs/latest/management/persistence/), [실행 모델과 지연](https://redis.io/docs/latest/operate/oss_and_stack/management/optimization/latency/).
- 검색: [Elastic 전문 검색](https://www.elastic.co/docs/solutions/search/full-text/how-full-text-works).
- 컨테이너: [Docker 컨테이너 개념](https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/).

## 구현과 검증

원문 vendor 파일과 생성된 interviewNotes.js는 변경하지 않는다. noteRevisions.js를 CS_NOTES를 만들 때 적용하므로 재수입으로 보완을 잃지 않는다. 답변의 answer와 answerMarkdown을 함께 교체해 검색·표시가 다른 설명을 사용하지 않도록 한다.

check:revised-notes는 전체 렌더링, 알려지지 않은 ID, 빈 답변 잔존, 출처·수정 표시, 원문 불변성, 모든 완료 키 유지, 표·코드 블록을 검증한다. check:notes는 실제 페이지 컴포넌트의 접기/펼치기·필터·계정 전환·저장/재시도 회귀를 검증한다. check:imported-notes로 원문 보존과 HTML 정제를 검증한다. 자동 테스트는 기술 설명의 정확성 자체를 증명하지 않으며 위 수동 점검을 보완한다. 브라우저 접근 제한으로 시각 검증은 수행하지 않았다.
