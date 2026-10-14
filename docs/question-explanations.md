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
- `npx eslint src scripts`

전체 `npm run lint`에는 기존 `public/arcade/breakout/game.js:21`의 미사용 변수 오류 1건이 남아 있다. 브라우저 접근 권한이 거부되어 클릭·모바일 화면 검증은 수행하지 못했다. SSR 검증은 브라우저 상호작용 검증을 대신하지 않는다.
