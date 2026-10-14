# 문항별 해설과 펄어비스 예상문제

기존 이론 링크 대상 638문항(내용이 같은 1쌍을 제외하면 637개)에 문항별 풀이를 추가했다. 시험·연습·오답 검토·유사 문제 화면에서 파일이나 이론 페이지를 열지 않고 읽는다. 유사 문제의 기존 선택 로직은 유지한다.

`questionExplanations.json`은 `explanationKey(q)`로 생성한 내용 식별자와 해설의 매핑이다. ID나 주제 표기가 바뀌는 주제별 복사본에서도 같은 해설을 찾는다. 질문·조건·코드·보기·정답이 바뀌면 키도 함께 갱신해야 한다. 질문 변경 시 예전 풀이를 잘못 붙이지 않도록 자동 검사가 누락을 검출한다. 새 문제는 `explanation` 필드에 직접 작성할 수도 있다.

펄어비스는 `/exam/pearl`, 기업별 문제집의 IT·게임 기업 분류에 있다. 제공된 준비 범위를 바탕으로 새로 작성한 50문항이며 공식 기출·시험 구성으로 주장하지 않는다. 웹·DB·OS·자료구조·C# 각각 객관식 8개와 서술형 2개다. 70분은 학습용 설정이다. 서술형은 기존 자가채점 기능을 사용한다.

내용 확인에 참고한 1차 문서:
- HTTP 메서드·멱등성·상태 코드: https://www.rfc-editor.org/rfc/rfc9110.html
- C# 비동기 실행: https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/
- 격리 수준과 DBMS별 차이: https://www.postgresql.org/docs/current/transaction-iso.html

검증:
- `cd frontend && npm run check:questions`
- `npm run check:explanations` — 해설 누락, 주제별 복사, 변경 문항의 오연결 방지, 50문항 구성, 실제 해설 컴포넌트 SSR 및 HTML 이스케이프
- `npm run build`
- `npm run check:exam-flow` — React 컴포넌트 상호작용: 전체 50문항 풀이, 이어풀기, 오답 재시도, 모의고사 기록 시점, 시간 만료, 북마크, 분류 경로, 결과 카드 150개 상태, 유사 문제 전환
- `npm run check:pearl-answers` — SQLite로 SQL 결과·재고 감소·ON/WHERE/NULL 차이 검산, 스택·이진 탐색 경계 검산
- `npm run lint`

전체 린트도 통과한다. 기존 breakout 게임의 사용하지 않는 콜백 매개변수만 제거했다. 컴포넌트 상호작용 테스트는 메모리 저장소와 모의 네트워크를 사용하며 실제 계정·서버에 요청하지 않는다.

사용자의 재허용 후에도 브라우저 도구의 저장된 차단 설정이 접근을 거부했다. 따라서 실제 브라우저 클릭·모바일 레이아웃·콘솔 검증은 미실시이며, React/SSR 테스트가 이를 완전히 대신하지는 않는다. 이 환경에는 .NET SDK가 없어 C# 예제의 컴파일·실행 검증은 수행하지 못했고 코드를 검토했다. 빌드의 기존 대형 번들 경고는 남아 있다.
