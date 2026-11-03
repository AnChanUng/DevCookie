// Preparation hints describe what to verify, not claimed personal experience.
export const PORTFOLIO_GROUPS = [
  {
    "id": "rag-stack",
    "title": "StarRoad · RAG 구성",
    "questions": [
      {
        "id": "pf-rag-stack-1",
        "depth": 1,
        "question": "StarRoad의 RAG 챗봇에서 본인이 담당한 부분과 질문부터 답변까지의 흐름을 설명해 주세요.",
        "hint": "직접 구현한 범위를 먼저 말하고, 문서 준비 → 검색 → LLM 호출 순서로 설명하세요."
      },
      {
        "id": "pf-rag-stack-2",
        "depth": 2,
        "question": "RAG 구현에 어떤 라이브러리, 임베딩 모델, VectorDB를 사용했고 왜 선택했나요?",
        "hint": "삼일PwC에서 받았던 유형입니다. 실제 사용한 이름과 선택 이유를 확인해 답하세요. 자료에서 확인되지 않은 제품명을 추측하지 마세요."
      },
      {
        "id": "pf-rag-stack-3",
        "depth": 3,
        "question": "정책 데이터가 바뀌면 검색 데이터와 답변을 어떻게 갱신하고 검증하겠습니까?",
        "hint": "실제로 구현한 부분과 앞으로 개선할 부분을 구분하고, 갱신·재임베딩·변경 후 검증 순서로 생각해 보세요."
      }
    ]
  },
  {
    "id": "rag-quality",
    "title": "StarRoad · 검색 품질",
    "questions": [
      {
        "id": "pf-rag-quality-1",
        "depth": 1,
        "question": "RAG를 적용하기 전 어떤 잘못된 답변이 나왔고, 왜 문제가 됐나요?",
        "hint": "지원 금액·신청 기간 사례와 금융 정보가 사용자 판단에 미치는 영향을 연결하세요."
      },
      {
        "id": "pf-rag-quality-2",
        "depth": 2,
        "question": "Chunk Size와 Overlap을 바꿨을 때 검색 결과가 어떻게 달라졌나요?",
        "hint": "조정 전후의 문서 분할 사례와 검색 근거가 달라진 이유를 설명하세요. 실제 크기와 단위는 확인한 값만 말하세요."
      },
      {
        "id": "pf-rag-quality-3",
        "depth": 3,
        "question": "유사도 0.82에서 0.91로 개선됐다는 결과를 어떻게 측정했나요?",
        "hint": "평가 질문, 비교 조건, 집계 방법을 확인하세요. 유사도 점수와 정답률을 구분하고, 임계값 미달 질문도 함께 설명하세요."
      }
    ]
  },
  {
    "id": "log-ai",
    "title": "LLM 로그 분석",
    "questions": [
      {
        "id": "pf-log-ai-2",
        "depth": 2,
        "question": "로그를 그대로 전달했나요? 길이와 민감정보는 어떻게 처리했나요?",
        "hint": "실제 전처리·분할·마스킹 여부를 확인하세요. 구현하지 않았다면 당시 한계와 개선 방법을 나눠 답하세요."
      },
      {
        "id": "pf-log-ai-3",
        "depth": 3,
        "question": "LLM이 제시한 원인이 맞는지, 유지보수 시간 50% 단축은 어떻게 검증했나요?",
        "hint": "실제 장애 원인과 비교한 방법, 측정 구간과 표본을 설명하세요. LLM의 추정과 확정된 원인을 구분하세요."
      }
    ]
  },
  {
    "id": "environment",
    "title": "고객사 환경 재현",
    "questions": [
      {
        "id": "pf-environment-2",
        "depth": 2,
        "question": "Docker로 구성한 환경과 서버에 직접 설치한 환경은 어떻게 구분했나요?",
        "hint": "카카오 회고의 피드백처럼 용어보다 선택 이유를 말하세요. Docker가 모든 운영체제를 재현한다고 설명하지 말고 실제 지원 범위를 확인하세요."
      },
      {
        "id": "pf-environment-3",
        "depth": 3,
        "question": "구축된 환경이 고객사와 충분히 같다는 것을 어떻게 확인했나요?",
        "hint": "OS·DB 버전과 설정, 재현 시나리오, 기존 테스트 환경과 충돌하지 않는 방법을 실제 사례로 설명하세요."
      }
    ]
  },
  {
    "id": "encryption",
    "title": "Tibero 자동 암호화",
    "questions": [
      {
        "id": "pf-encryption-1",
        "depth": 1,
        "question": "Tibero 자동 암호화가 해결한 기존 문제는 무엇인가요?",
        "hint": "실행 명령의 비밀번호 노출과 계정별 수동 작업을 설명하고, 자동화한 범위를 말하세요."
      },
      {
        "id": "pf-encryption-2",
        "depth": 2,
        "question": "암호화된 접속 정보를 실제 DB 연결에서 어떻게 사용하나요?",
        "hint": "삼일PwC에서 복호화 질문도 받았습니다. 암호화와 해시를 구분하고, 실제 복호화 위치와 키 관리 방식을 확인하세요. 비밀 값은 말하지 않아도 됩니다."
      },
      {
        "id": "pf-encryption-3",
        "depth": 3,
        "question": "암호화 결과와 계정·DB 버전별 동작이 올바른지 어떻게 테스트했나요?",
        "hint": "정합성 검증, 실패 처리, 환경 변수 누락 사례를 설명하세요. 본인이 한 조치와 제조사가 한 조치를 구분하세요."
      }
    ]
  },
  {
    "id": "batch",
    "title": "배치 동시 처리",
    "questions": [
      {
        "id": "pf-batch-1",
        "depth": 1,
        "question": "배치 실행에서 어떤 현상을 보고 DB 세션 병목이라고 판단했나요?",
        "hint": "부하테스트 조건, 관찰한 대기와 확인 도구를 설명하세요. 단순히 느려졌다는 설명에서 한 단계 더 구체화하세요."
      },
      {
        "id": "pf-batch-2",
        "depth": 2,
        "question": "최대 세션을 50에서 150으로 조정한 기준은 무엇인가요?",
        "hint": "2GB 적재 조건에서 동시 실행 수와 처리시간을 비교한 방법, 메모리·CPU 영향 등을 실제 확인 범위로 설명하세요."
      },
      {
        "id": "pf-batch-3",
        "depth": 3,
        "question": "세마포어는 무엇이며, DB 설정 변경 뒤에도 남은 병목을 어떻게 확인했나요?",
        "hint": "삼일PwC에서 받은 개념 질문과 연결하세요. 공유 자원 접근 제어라는 역할, 확인한 OS 한도와 변경 후 검증 정도로 답하세요."
      }
    ]
  },
  {
    "id": "sql-security",
    "title": "SQL Injection 개선",
    "questions": [
      {
        "id": "pf-sql-security-1",
        "depth": 1,
        "question": "기존 쿼리에서 SQL Injection이 가능했던 이유는 무엇인가요?",
        "hint": "사용자 입력을 문자열 SQL에 합치는 구조와 위험을 간단한 예로 설명하세요."
      },
      {
        "id": "pf-sql-security-2",
        "depth": 2,
        "question": "파라미터 바인딩으로 바꾸면 왜 입력이 SQL 구문으로 해석되지 않나요?",
        "hint": "SQL 구조와 값의 분리라는 핵심을 설명하세요. 실제 사용한 DB API나 드라이버도 확인해 두세요."
      },
      {
        "id": "pf-sql-security-3",
        "depth": 3,
        "question": "전체 쿼리를 바꾼 뒤 기능과 보안을 어떻게 검증했나요?",
        "hint": "일반 입력·특수문자·공격 형태 입력, 기존 조회 결과와 오류 처리의 비교를 실제 수행한 범위로 말하세요."
      }
    ]
  },
  {
    "id": "platform",
    "title": "자율주행 플랫폼 운영",
    "questions": [
      {
        "id": "pf-platform-1",
        "depth": 1,
        "question": "도로 이벤트가 검지된 뒤 미들웨어까지 전달되는 흐름과 본인의 역할을 설명해 주세요.",
        "hint": "검지 결과 저장 → 조회 → TCP 전송의 실제 경로와 담당 모듈을 중심으로 설명하세요."
      },
      {
        "id": "pf-platform-2",
        "depth": 2,
        "question": "TCP 연결이 끊기거나 전송 도중 실패하면 어떻게 처리했나요?",
        "hint": "실제 구현한 재접속·재시도·성공 확인 여부를 확인하세요. 중복·누락 처리는 구현 경험과 개선 제안을 구분하세요."
      },
      {
        "id": "pf-platform-3",
        "depth": 3,
        "question": "장비 장애 알림과 로그 삭제가 정상 동작하는지 어떻게 확인했나요?",
        "hint": "장비 다운 판단 기준, 알림 중복, 70% 임계치의 의미, 삭제 대상과 보존 기준을 실제 설정에 맞게 설명하세요."
      }
    ]
  },
  {
    "id": "ownership",
    "title": "업무 연결·협업",
    "questions": [
      {
        "id": "pf-ownership-2",
        "depth": 2,
        "question": "개선 과정에서 현업이나 다른 업체와 의견이 달랐을 때 어떻게 조율했나요?",
        "hint": "실제 한 사례로 상대의 요구, 공유한 근거, 합의한 조치를 설명하세요. 없는 갈등 사례는 만들지 마세요."
      },
      {
        "id": "pf-ownership-3",
        "depth": 3,
        "question": "안진에서 새로운 데이터 처리·AI 서비스 과제를 맡으면 어떻게 시작하겠습니까?",
        "hint": "삼일PwC의 기획부터 개발까지 설명하는 유형을 응용했습니다. 요구 파악 → 데이터·보안 확인 → 작은 검증 → 테스트·배포·운영 순서로 본인의 접근을 말하세요."
      }
    ]
  }
];
