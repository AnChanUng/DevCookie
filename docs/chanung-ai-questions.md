# AI 엔지니어 기초·실무 질문
사용자가 제공한 면접 자료의 질문 38개를 짧은 말하기 답변으로 정리하고 기존 청킹·VectorDB·유사도 임계값·평가셋 5개를 합쳐 43문답으로 구성했습니다. 일반 ETL·클라우드·시큐어 코딩·테스트·배포 정의 문항은 제거했습니다.

주제: 기초 개념, 검색·평가, LLM·프롬프트, AI 시스템 설계, AI 배포·운영, 상황별 대응, 직무 이해. 기본 답변 숨김·개별 펼치기·학습 완료 계정 저장을 유지하며 서버 채점 기준도 동기화합니다. 이전과 같은 의미인 문항은 ID를 유지했습니다.

가져온 설명 중 임베딩을 단순 테이블로 한정하거나 모든 LLM을 디코더 전용으로 단정하는 설명을 수정했습니다. RAG·구조화 출력·낮은 온도가 사실성을 보장하지 않음을 구분하고, 도구 실행은 애플리케이션이 검증하며, AI/ML 직무 범위는 회사마다 다름을 명시했습니다. 모델·도구 선택은 고정 정답이 아닌 조건에 따른 선택으로 설명합니다.

공식 참고:
- [토크나이저](https://huggingface.co/docs/transformers/main/main_classes/tokenizer)
- [생성 설정](https://github.com/huggingface/transformers/blob/main/docs/source/en/llm_tutorial.md)
- [도구 호출](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview)
- [환각 줄이기](https://platform.claude.com/docs/en/test-and-evaluate/strengthen-guardrails/reduce-hallucinations)

검증: check:chanung, check:interview-audio, check:chanung-completion.
