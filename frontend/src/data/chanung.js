export const CHANUNG_CATEGORIES = ['기술', '인성'];

export const CHANUNG_QUESTIONS = [
  {
    "id": "cu-pipeline",
    "category": "기술",
    "question": "RAG는 어떻게 동작하나요?",
    "answer": "금융상품과 정책 데이터를 청크 단위로 나누고 임베딩해서 VectorDB에 저장했습니다. 용자가 질문하면 관련 문서를 검색하고, 유사도 임계값을 통과하면 해당 문서를 LLM에 전달해 답변하도록 구현했습니다.",
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
    "answer": "금융상품과 정책에 관련된 질문과 무관한 질문으로 평가셋을 만들었습니다. 관련 질문에서는 적절한 문서가 검색되는지 확인하고, 무관한 질문에서는 답변이 제한되는지 확인했습니다.",
    "original": true,
    "note": ""
  },
  {
    "id": "cu-threshold-standard",
    "category": "기술",
    "question": "유사도 임계값을 정하는 기준은 무엇인가요?",
    "answer": "관련 질문과 무관한 질문으로 평가셋을 만들어 임계값에 따른 답변 결과를 비교했습니다. 임계값을 0.85로 설정했을 때 관련 질문에는 적절히 답하고 무관한 질문은 제한하는 결과가 나와, 해당 값을 기준으로 설정했습니다.",
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
    "id": "cu-similarity-concept",
    "category": "기술",
    "question": "유사도가 뭐예요?",
    "answer": "**유사도**는 질문과 문서가 얼마나 비슷한지를 나타내는 값입니다. 임베딩 벡터를 비교해 관련 문서를 찾는 데 활용하지만, 유사도가 높다고 답변이 반드시 정확한 것은 아닙니다.",
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
    "answer": "안녕하십니까. 현업의 문제를 파악해 기술로 해결하는 지원자 안찬웅입니다.\n\n데이터스트림즈에서 AI 기반 로그 수집·분석 서비스와 고객사 환경 재현 시스템을 개발해 유지보수 시간을 50% 단축했습니다.\n\n또한 국민은행 인턴십에서 다양한 연령대의 고객들과 소통하며, AI 서비스 이용에 어려움을 겪는 고객들이 챗봇과 검색 기능을 활용해 스스로 문제를 해결할 수 있도록 도왔습니다.\n\n이러한 AI 활용 역량과 소통 역량을 바탕으로 딜로이트 안진에서도 업무 효율성을 높이는데 기여하겠습니다.",
    "original": true
  },
  {
    "id": "cu-motivation",
    "category": "인성",
    "question": "지원동기 (왜 안진인가?)",
    "answer": "저는 딜로이트 안진이 AI Agent를 비롯한 다양한 AI 기술을 적극적으로 도입하고 있다는 점에 관심을 갖고, 제가 쌓아온 데이터와 AI 개발 경험으로 기여하고 싶어 지원했습니다.\n\n딜로이트 안진은 국내 회계법인 중 최초로 회계 전담 데이터 분석 조직을 신설했고, 최근에는 RAG 기반 AI Assistant를 도입하며 업무에 AI 활용을 확대하고 있는 것으로 알고있습니다.\n\n저는 실무에서 데이터를 추출·변환·적재하는 ETL 솔루션을 개발하며 다양한 데이터와 서버 환경을 다뤘습니다. 그리고 현재는 삼성청년SW·AI아카데미에서 AI를 학습하고 직접 서비스에 적용하고 있습니다.\n\n이러한 데이터 처리와 AI 개발 경험을 바탕으로 딜로이트 안진의 업무 효율성을 높이는 데 기여하겠습니다.",
    "original": true
  },
  {
    "id": "cu-last",
    "category": "인성",
    "question": "마지막 할말",
    "answer": "오늘 면접 기회를 주셔서 감사합니다. 저는 현업의 문제를 이해하고 기술로 해결하는 개발자가 되고 싶습니다. ETL 서버 개발과 유지보수 경험, 그리고 RAG 챗봇을 개발하며 배운 점을 딜로이트의 업무에 연결하고 싶습니다.\n\n입사하게 된다면 먼저 업무와 시스템을 충분히 익히고, 맡은 기능의 개발부터 테스트와 운영까지 책임감 있게 수행하겠습니다. 부족한 부분은 꾸준히 배우면서 팀에 도움이 되는 개발자가 되겠습니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-ask-company",
    "category": "인성",
    "question": "회사에 궁금한것",
    "answer": "입사 후 초기에 맡게 될 업무와, 팀에서 현재 가장 우선적으로 개선하고 있는 AI 활용 과제가 무엇인지 궁금합니다.\n\n또한 AI 기능을 실제 업무에 적용할 때 현업과 어떤 방식으로 품질을 검증하고 피드백을 반영하는지도 여쭙고 싶습니다. 제가 가진 데이터 처리와 서버 운영 경험을 어느 부분에 연결할 수 있을지 이해하고 싶습니다.",
    "original": false,
    "note": ""
  },
  {
    "id": "cu-resignation",
    "category": "인성",
    "question": "퇴사사유",
    "answer": "이전 회사에서는 ETL 서버 개발과 유지보수를 통해 데이터 처리와 운영 경험을 쌓았습니다. 퇴사한 직접적인 이유는 [실제 퇴사 사유]입니다.\n\n현재는 SSAFY에서 AI를 학습하고 직접 서비스에 적용하고 있습니다. 앞으로는 기존 서버 개발 경험과 AI 개발 경험을 함께 활용해, 업무에 필요한 AI 시스템을 만들고 운영하는 개발자로 성장하고 싶습니다.",
    "original": false,
    "note": "실제 퇴사 이유는 전달받지 않아 대괄호로 남겼습니다. 본인의 사유로 바꿔 연습하세요."
  }
];
