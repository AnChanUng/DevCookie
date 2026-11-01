# /chanung 음성 연습

## 사용 순서
1. HTTPS 페이지에서 질문 선택 → 녹음 시작 → 마이크 허용 → 녹음 종료.
2. 오디오 플레이어로 다시 듣기. 필요하면 파일 다운로드.
3. 로그인 후 ‘녹음 내용 인식’. 음성은 브라우저에서 16kHz 모노 WAV로 변환되고 서버를 통해 Gemini로 전송된다.
4. 인식된 문장을 확인·수정하고 ‘확인한 답변으로 채점’.
5. 핵심 내용 40, 정확성 30, 구성 20, 명료성 10점과 개선 예시 확인.

녹음과 인식문·점수는 페이지 세션의 메모리에만 보관한다. 질문 이동 시 완료된 녹음은 남지만 페이지 이탈·새로고침·계정 전환 시 사라진다. 진행 중인 녹음은 문항 이동 시 취소하고 마이크를 해제한다. 기존 ‘내 연습 답변’ 텍스트 저장과는 별개다.

## 서버 설정
- 기존 Render 백엔드 환경변수 `GEMINI_API_KEY` 사용. 프런트엔드에 키를 넣지 않는다.
- 선택 환경변수 `INTERVIEW_GEMINI_MODEL`, 기본 `gemini-2.5-flash`. 계정에서 해당 모델의 음성 입력 및 구조화 출력을 사용할 수 있어야 한다.
- `GET /api/v1/interview-ai/status`: 키 설정 여부와 최대 녹음 길이. 공급자 인증·할당량까지 검증하는 API는 아니다.
- `POST /api/v1/interview-ai/transcribe`: 인증된 사용자, multipart audio, 1초~180초 PCM WAV.
- `POST /api/v1/interview-ai/grade`: 인증된 사용자, questionId와 transcript. 기준 답변은 서버의 interview-bank.json에서 조회한다.
- 키 미설정 503, 인증 누락 401, 요청 제한 429, 음성 없음 422, 공급자 실패 502를 표시한다. 실패 시 임의 점수나 대체 키워드 점수를 생성하지 않는다.
- 서버가 음성·인식문·응답을 DB나 애플리케이션 로그에 저장하지 않는다. 외부 공급자의 데이터 처리는 해당 API 계정의 약관·설정에 따른다.
- 인식과 채점 합계 계정당 시간당 60회, 최소 간격 3초, 서버 동시 처리 2개. 한 인스턴스의 메모리 제한이며 재시작 시 초기화된다.

## 평가 한계
전사는 음성만 보고 수행한다. 질문·모범답변으로 인식 내용을 채워 넣지 않는다. 채점은 사용자가 확인한 텍스트와 서버 기준 답변을 비교한다. 의미가 같으면 표현이 달라도 인정하도록 안내하며, 개인 경험의 진위를 확인하거나 음색·억양·발음·성격·합격 가능성을 평가하지 않는다. AI 점수는 반복 호출 시 달라질 수 있는 연습용 피드백이다.

## 검증
- `npm run check:interview-audio`: 녹음 생명주기·늦은 권한 응답·오류·재생·WAV 변환·인식 및 채점 흐름·문제은행 동기화.
- `npm run check:chanung`: 기존 답변 기능 회귀 검증.
- `InterviewAiTest`: 공급자 모의 응답, 오디오 입력 제한, 서버 점수 합산·범위, 미설정·오류·요청 제한.
- 실제 마이크 입력, 모바일 브라우저 코덱, 실제 Gemini 인증 및 응답 품질은 배포 환경에서 별도 확인이 필요하다.

질문 변경 시 frontend/src/data/chanung.js의 id/category/question/answer를 backend/src/main/resources/interview-bank.json에 반영해야 한다. 불일치는 check:interview-audio에서 실패한다.

공식 참고: [Gemini 음성 이해](https://ai.google.dev/gemini-api/docs/audio), [구조화 출력](https://ai.google.dev/gemini-api/docs/structured-output).
