export const CHANUNG_CATEGORIES = ['기술', '인성', '자소서꼬리질문'];

export const CHANUNG_QUESTIONS = [
  {
    "id": "cu-pipeline",
    "category": "기술",
    "question": "RAG는 어떻게 동작하나요?",
    "answer": "데이터를 청크 단위로 나누고 임베딩해서 VectorDB에 저장합니다. 사용자가 질문하면 관련 문서를 검색하고, 유사도 임계값을 통과하면 해당 문서를 LLM에 전달해 답변하도록 구현했습니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-search-quality",
    "category": "기술",
    "question": "검색품질을 어떻게 개선했나요?",
    "answer": "Chunk Size와 Overlap을 적절하게 조정해서 답변의 정확도를 올렸습니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-rag-test",
    "category": "기술",
    "question": "RAG 검색 성능은 어떻게 테스트했나요?",
    "answer": "관련 답변과 무관한 답변을 구분할 수 있도록 평가셋을 만들었습니다. LLM의 답변이 실제 금융상품과 정책 데이터에 맞는지 확인하고, 데이터에 없는 질문에는 환각상태가 일어나지 않고 답변을 제한하는지 확인했습니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-threshold-standard",
    "category": "기술",
    "question": "유사도 임계값을 정하는 기준은 무엇인가요?",
    "answer": "관련 질문과 무관한 질문으로 평가셋을 만들고, 유사도 임계값을 높이거나 낮추며 답변 결과를 비교했습니다. 관련 질문에는 적절히 답하고 무관한 질문에는 답변을 제한하는 동작이 가장 안정적인 0.85를 기준으로 설정했습니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-threshold",
    "category": "기술",
    "question": "유사도 임계값을 높이면 어떤 문제가 발생하나요?",
    "answer": "임계값이 높으면 관련 있는 질문도 기준을 통과하지 못해 답변이 제한될 수 있습니다. 반대로 낮으면 관련 없는 문서가 검색되어 잘못된 답변을 생성할 가능성이 높아집니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-answer-quality",
    "category": "기술",
    "question": "LLM이 정확하게 답변하는 기준은 무엇인가요?",
    "answer": "금융상품과 정책에 대한 질문 평가셋을 만들고, LLM의 답변이 실제 정책과 상품 데이터에 맞는지 확인했습니다. 또한 데이터에 없는 질문에도 임의로 답변하는지 확인하면서 답변 품질을 검증했습니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-rag",
    "category": "기술",
    "question": "RAG가 뭐예요?",
    "answer": "RAG(Retrieval-Augmented Generation): 검색 증강 생성\n: LLM이 외부 데이터에서 관련 정보를 검색한 뒤 그 정보를 참고해 답변하도록 하는 기술",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-chunk-size-concept",
    "category": "기술",
    "question": "Chunk Size가 뭐예요?",
    "answer": "Chunk size: 문서를 나누는 단위의 크기",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-chunk-overlap-concept",
    "category": "기술",
    "question": "Chunk Overlap이 뭐예요?",
    "answer": "Chunk Overlap: 인접한 청크 사이에 중복으로 포함하는 내용의 크기",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-llm-concept",
    "category": "기술",
    "question": "LLM이 뭐예요?",
    "answer": "**LLM**(Large Language Model)은 대규모 언어 모델입니다. 많은 텍스트를 학습해 질문에 답하거나 글을 요약·생성하는 모델입니다. 자연스러운 답변을 만들 수 있지만 항상 사실에 맞는 것은 아닙니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-embedding-concept",
    "category": "기술",
    "question": "임베딩이 뭐예요?",
    "answer": "**임베딩**(Embedding)은 텍스트의 의미적 특징을 숫자로 이루어진 벡터로 표현하는 것입니다. 질문과 문서를 벡터로 바꾸면 서로 얼마나 관련 있는지 비교해 검색에 활용할 수 있습니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-vectordb-concept",
    "category": "기술",
    "question": "VectorDB가 뭐예요?",
    "answer": "**VectorDB**는 임베딩 벡터를 저장하고 비슷한 벡터를 검색하는 데이터베이스입니다. RAG에서는 사용자의 질문과 관련된 문서를 찾는 데 활용합니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-threshold-concept",
    "category": "기술",
    "question": "유사도 임계값이 뭐예요?",
    "answer": "**유사도 임계값**은 검색 결과를 답변에 사용할지 판단하는 기준값입니다. 높은 값일수록 더 유사한 점수를 기준으로 할 때, 점수가 임계값 이상이면 근거로 사용하고 미만이면 답변을 제한할 수 있습니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-evaluation-concept",
    "category": "기술",
    "question": "평가셋이 뭐예요?",
    "answer": "**평가셋**은 시스템이 잘 동작하는지 확인하기 위해 준비한 질문과 기대 결과의 모음입니다. RAG에서는 관련 질문뿐 아니라 무관한 질문도 넣어, 적절한 문서를 찾는지와 답변을 제한해야 할 때 제한하는지 확인합니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-intro",
    "category": "인성",
    "question": "자기소개",
    "answer": "안녕하십니까. 현업의 문제를 파악해 AI로 해결하는 지원자 안찬웅입니다.\n\n데이터스트림즈에서 LLM을 활용해 로그 분석 프로그램과 고객사 환경 재현 시스템을 개발했습니다. 그 결과 유지보수 시간을 50% 단축했습니다.\n\n또한 국민은행 영업점에서 다양한 연령대의 고객들과 소통하며, 모바일뱅킹 앱 이용에 어려움을 겪는 고객들이 AI 챗봇을 활용해 스스로 문제를 해결할 수 있도록 도왔습니다. 그 결과 영업점 혼잡도를 20% 개선했습니다.\n\n이러한 AI 활용 역량과 소통 역량을 바탕으로 딜로이트 안진에서도 업무 효율성을 높이는 데 기여하겠습니다.",
    "original": true
  },
  {
    "id": "cu-motivation",
    "category": "인성",
    "question": "왜 딜로이트 안진회계법인인가요?",
    "answer": "딜로이트 안진회계법인에서 LLM을 활용한 데이터 처리 프로그램을 개발하고 싶어 지원했습니다.\n\n저는 실무에서 대규모 데이터를 추출·변환·적재하는 솔루션을 개발해 왔습니다. 또한 현재는 삼성청년SW·AI아카데미(SSAFY)에서 AI를 공부하고 직접 서비스에 적용하고 있습니다.\n\n이러한 데이터 처리 경험과 AI 개발 경험을 바탕으로 안진의 업무 효율을 높이는 데 기여하고 싶습니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-low-gpa",
    "category": "인성",
    "question": "학점이 낮은 이유",
    "answer": "네, 학점이 낮은 것은 사실입니다.\n\n군 복무 전에는 동아리와 학생회 활동을 하면서 학비를 벌기 위해 아르바이트도 병행했습니다. 그러다 보니 학업에 충분히 집중하지 못했던 부분이 있습니다.\n\n다만 이러한 경험을 통해 다양한 사람들과 소통하고 협업하는 방법을 배웠습니다.\n\n이후 부족한 전공 역량을 보완하기 위해 연구실 활동과 인턴십을 경험했고, 현재는 삼성청년SW·AI아카데미에서 AI와 개발 역량을 키우고 있습니다.\n\n학점은 아쉽지만, 당시 쌓은 소통 경험과 이후의 실무 경험이 개발자로 성장하는 데 도움이 됐다고 생각합니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-last",
    "category": "인성",
    "question": "마지막 할말",
    "answer": "회계법인에는 축적된 데이터와 전문성을 바탕으로 AI를 활용해 개선할 수 있는 업무가 많다고 생각합니다. 실무에서 쌓은 대규모 데이터 처리 경험과 AI 역량을 바탕으로 안진의 다양한 문제를 해결하고 싶습니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-ask-company",
    "category": "인성",
    "question": "안진회계법인에 궁금한것은?",
    "answer": "이번 IT AI 엔지니어 직무를 준비하면서, LLM을 활용한 데이터 처리 프로그램을 개발하는 것뿐 아니라 실제 현업에서 안정적으로 활용되도록 운영하는 과정도 중요하다고 생각했습니다.\n\n입사 전에 준비하는 데 참고하고 싶은데, 신입이 초기에 현업의 업무를 이해하고 AI 개발 과제에 참여하기 위해 우선적으로 익히면 좋을 지식이나 업무가 무엇인지 여쭙고 싶습니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-resignation",
    "category": "인성",
    "question": "퇴사사유",
    "answer": "AI를 잘 다루기 위해서는 AI 기술 자체를 이해할 필요가 있다고 생각해, 관련 역량을 키우고자 퇴사했습니다.\n실무에서 ChatGPT와 Claude Code 등 다양한 AI 도구를 사용하면서 단순히 활용하는 것을 넘어 직접 AI 서비스를 개발하는 역량을 키우고 싶었습니다.\n그래서 SSAFY에 참여해 AI를 체계적으로 학습하고, RAG 기반 챗봇도 개발했습니다.\n이러한 경험을 바탕으로 딜로이트 안진에서 LLM을 활용한 프로그램을 개발하고 운영하며 장기적으로 성장하고 싶습니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-generative-ai-concept",
    "category": "기술",
    "question": "생성형 AI가 뭐예요?",
    "answer": "**생성형 AI**는 학습한 패턴을 바탕으로 글·이미지·음성 같은 새로운 결과물을 생성하는 AI입니다. LLM은 언어를 다루는 생성형 AI에 활용됩니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-hallucination-concept",
    "category": "기술",
    "question": "환각(Hallucination)이 뭐예요?",
    "answer": "**환각**은 AI가 사실과 다르거나 근거가 없는 내용을 사실처럼 생성하는 현상입니다. 금융 상담에서 존재하지 않는 지원 금액이나 신청 기간을 답하는 것이 예입니다. RAG로 근거를 제공해 줄일 수 있지만 완전히 없어지는 것은 아닙니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-prompt-concept",
    "category": "기술",
    "question": "프롬프트가 뭐예요?",
    "answer": "**프롬프트**는 모델에 전달하는 질문·지시·참고 정보입니다. RAG에서는 검색한 문서와 사용자 질문, 답변 기준 등을 전달해 근거를 참고한 답변을 유도합니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-inference-concept",
    "category": "기술",
    "question": "학습과 추론은 어떻게 달라요?",
    "answer": "**학습**은 데이터를 이용해 모델의 파라미터를 조정하는 과정이고, **추론**은 학습된 모델이 입력을 받아 결과를 생성하는 과정입니다. 일반적인 RAG에서 문서를 검색해 프롬프트로 전달하는 것은 모델을 다시 학습시키는 것과 다릅니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-etl-concept",
    "category": "기술",
    "question": "ETL이 뭐예요?",
    "answer": "**ETL**은 Extract·Transform·Load의 약자로, 데이터를 추출하고 목적에 맞게 변환한 뒤 대상 시스템에 적재하는 과정입니다. 형식 변환, 정제, 데이터 검증 등이 포함될 수 있습니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-cloud-concept",
    "category": "기술",
    "question": "클라우드가 뭐예요?",
    "answer": "**클라우드**는 네트워크를 통해 서버·저장소·데이터베이스 같은 IT 자원을 제공받아 사용하는 방식입니다. AWS·GCP·Azure 등이 서비스를 제공합니다. AI 서비스를 운영할 때도 접근 권한과 비용, 장애 대응을 함께 관리해야 합니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-secure-coding-concept",
    "category": "기술",
    "question": "시큐어 코딩이 뭐예요?",
    "answer": "**시큐어 코딩**은 보안 취약점을 줄이도록 코드를 설계하고 구현하는 것입니다. 입력값 검증, 파라미터화된 SQL 사용, 비밀정보 보호, 필요한 권한만 부여하는 방식 등이 포함됩니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-testing-concept",
    "category": "기술",
    "question": "테스트와 검증은 왜 필요한가요?",
    "answer": "**테스트**는 프로그램이 의도한 동작을 하는지 확인하는 과정입니다. AI 시스템에서는 API나 오류 처리뿐 아니라 답변의 정확성과 근거도 검증해야 합니다. 평가셋을 이용해 변경 전후 결과를 비교할 수 있습니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-deployment-concept",
    "category": "기술",
    "question": "배포와 운영은 어떻게 달라요?",
    "answer": "**배포**는 개발한 프로그램을 사용 가능한 환경에 반영하는 과정입니다. **운영**은 배포한 서비스의 상태를 관찰하고 장애·보안·성능 문제를 관리하며 안정적으로 유지하는 과정입니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-log-program",
    "category": "자소서꼬리질문",
    "question": "LLM을 활용한 로그 분석 프로그램은 무엇인가요?",
    "answer": "솔루션에서 발생한 로그를 LLM에 전달해, 오류의 원인을 분석하고 핵심 내용을 요약해서 제공하는 프로그램입니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-environment-system",
    "category": "자소서꼬리질문",
    "question": "고객사 환경 재현 시스템은 무엇인가요?",
    "answer": "고객사마다 운영체제와 DB 종류가 달라 동일한 환경에서 문제를 재현하기 어려웠습니다. 이를 해결하기 위해 고객사의 환경 정보를 입력하면, Linux 서버와 Docker를 활용해 해당 환경을 자동으로 구축하는 프로그램입니다.",
    "original": true,
    "note": ""
  }
];
