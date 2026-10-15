import { INTERVIEW_NOTES } from './interviewNotes';

export const CS_NOTES = [...INTERVIEW_NOTES, {
  "id": "bigdata",
  "title": "빅데이터 · 기업은행 보충",
  "items": [
    {
      "id": "core-bigdata-3v",
      "title": "빅데이터 3V·5V",
      "question": "빅데이터의 3V와 5V는 무엇인가요?",
      "answer": "3V는 규모(Volume), 속도(Velocity), 다양성(Variety)이다. 여기에 신뢰성(Veracity)과 가치(Value)를 더해 5V로 설명한다. 데이터가 많다는 사실보다 믿을 수 있는 데이터에서 유용한 가치를 얻는 것이 중요하다."
    },
    {
      "id": "core-bigdata-types",
      "title": "정형·반정형·비정형",
      "question": "정형·반정형·비정형 데이터는 어떻게 다른가요?",
      "answer": "정형은 테이블처럼 정해진 구조를 따른다. 반정형은 JSON·XML처럼 태그나 키로 구조를 표현한다. 비정형은 문서·음성·이미지처럼 고정된 표 구조로 바로 표현하기 어렵다."
    },
    {
      "id": "core-bigdata-pipeline",
      "title": "데이터 분석 과정",
      "question": "데이터 분석은 어떤 순서로 진행하나요?",
      "answer": "문제 정의 → 데이터 수집 → 정제·전처리 → 탐색·분석 또는 모델링 → 평가·활용 순으로 진행한다. 평가 결과에 따라 앞 단계로 돌아간다. 예를 들어 이상거래 탐지는 탐지 목적과 오탐 비용부터 정한다."
    },
    {
      "id": "core-bigdata-quality",
      "title": "데이터 품질",
      "question": "데이터 품질은 어떤 기준으로 확인하나요?",
      "answer": "정확성, 완전성, 일관성, 적시성, 유효성 등을 확인한다. 거래금액 누락은 완전성, 같은 고객의 생년월일 불일치는 일관성 문제다. 수집량이 많아도 품질이 낮으면 분석 결과를 믿기 어렵다."
    },
    {
      "id": "core-bigdata-missing",
      "title": "결측치·이상치",
      "question": "결측치와 이상치는 어떻게 처리하나요?",
      "answer": "결측치는 값이 없는 상태이고 이상치는 일반적인 분포에서 크게 벗어난 값이다. 원인을 확인한 뒤 삭제·대체·별도 분석 등을 선택한다. 고액 거래나 사기 거래처럼 의미 있는 이상치도 있으므로 무조건 제거하지 않는다."
    },
    {
      "id": "core-bigdata-scale",
      "title": "표준화·정규화",
      "question": "전처리에서 표준화와 정규화는 어떻게 다른가요?",
      "answer": "표준화는 보통 평균을 빼고 표준편차로 나누어 척도를 맞춘다. 최소-최대 정규화는 값을 보통 0~1 범위로 바꾼다. 평균·최솟값 등의 기준은 학습 데이터로 구하고 평가 데이터에도 같은 기준을 적용한다."
    },
    {
      "id": "core-bigdata-etl",
      "title": "ETL·ELT",
      "question": "ETL과 ELT는 무엇이 다른가요?",
      "answer": "ETL은 추출(Extract) → 변환(Transform) → 적재(Load), ELT는 추출 → 적재 → 변환 순서다. ETL은 가공 후 저장하고 ELT는 먼저 저장한 뒤 목적에 맞게 가공한다. 차이는 변환 시점과 수행 위치다."
    },
    {
      "id": "core-bigdata-warehouse",
      "title": "데이터 웨어하우스·레이크·마트",
      "question": "데이터 웨어하우스, 레이크, 마트는 무엇인가요?",
      "answer": "웨어하우스는 분석용으로 통합·정제한 데이터를 저장한다. 레이크는 다양한 형식의 데이터를 원형에 가깝게 보관한다. 마트는 특정 부서나 업무에 필요한 분석용 데이터 집합이다. 레이크도 품질·접근 관리가 필요하다."
    },
    {
      "id": "core-bigdata-olap",
      "title": "OLTP·OLAP",
      "question": "OLTP와 OLAP의 목적은 어떻게 다른가요?",
      "answer": "OLTP는 이체·결제처럼 개별 거래를 빠르고 정확하게 처리한다. OLAP는 많은 데이터를 집계해 추세나 실적을 분석한다. 계좌 잔액 갱신은 OLTP, 월별 지점 실적 비교는 OLAP에 가깝다."
    },
    {
      "id": "core-bigdata-batch",
      "title": "배치·스트리밍",
      "question": "배치 처리와 스트리밍 처리는 어떻게 다른가요?",
      "answer": "배치는 일정량을 모아 한꺼번에 처리하고 스트리밍은 계속 들어오는 데이터를 지속적으로 처리한다. 일별 결산은 배치, 실시간 이상거래 감시는 스트리밍의 예다. 스트리밍도 처리 지연이 전혀 없는 것은 아니다."
    },
    {
      "id": "core-bigdata-distributed",
      "title": "분산 저장·분산 처리",
      "question": "분산 저장과 분산 처리는 무엇인가요?",
      "answer": "분산 저장은 데이터를 여러 서버에 나누어 보관하고, 분산 처리는 작업을 여러 서버가 나누어 수행한다. 큰 데이터를 다룰 수 있지만 서버 장애, 통신 비용, 작업 결과 결합을 고려해야 한다."
    },
    {
      "id": "core-bigdata-replication",
      "title": "파티셔닝·복제",
      "question": "파티셔닝과 복제의 목적은 어떻게 다른가요?",
      "answer": "파티셔닝은 데이터를 나누어 저장해 용량과 처리 부하를 분산한다. 복제는 같은 데이터의 사본을 여러 곳에 두어 장애에 대비한다. 데이터를 나누는 것만으로 사본이 생기는 것은 아니다."
    },
    {
      "id": "core-bigdata-hadoop",
      "title": "Hadoop·HDFS",
      "question": "Hadoop과 HDFS는 어떤 역할을 하나요?",
      "answer": "Hadoop은 대용량 데이터의 분산 저장·처리를 위한 도구 모음이다. HDFS는 파일을 블록으로 나누어 여러 서버에 저장하는 분산 파일 시스템이며, 블록 복제로 장애에 대비한다."
    },
    {
      "id": "core-bigdata-nodes",
      "title": "NameNode·DataNode",
      "question": "HDFS의 NameNode와 DataNode는 무엇을 관리하나요?",
      "answer": "NameNode는 파일 이름·디렉터리·블록 위치 등의 메타데이터를 관리한다. DataNode는 실제 데이터 블록을 저장하고 읽기·쓰기를 수행한다. 파일 위치를 관리하는 역할과 내용 자체를 보관하는 역할을 구분한다."
    },
    {
      "id": "core-bigdata-mapreduce",
      "title": "MapReduce",
      "question": "MapReduce는 데이터를 어떻게 처리하나요?",
      "answer": "Map은 입력을 키·값 형태의 중간 결과로 바꾼다. Shuffle은 같은 키의 데이터를 모으고 Reduce는 이를 집계한다. 단어 세기라면 Map이 (단어, 1)을 만들고 Reduce가 단어별 횟수를 합산한다."
    },
    {
      "id": "core-bigdata-spark",
      "title": "Spark",
      "question": "Spark는 어떤 도구이며 메모리를 어떻게 활용하나요?",
      "answer": "Spark는 대용량 데이터를 분산 처리하는 엔진이다. 반복해서 쓰는 중간 결과를 메모리에 캐시해 재계산이나 디스크 접근을 줄일 수 있다. 모든 데이터가 항상 메모리에만 존재하는 것은 아니며 디스크도 사용한다."
    },
    {
      "id": "core-bigdata-statistics",
      "title": "평균·중앙값·표준편차",
      "question": "평균, 중앙값, 표준편차는 무엇을 나타내나요?",
      "answer": "평균은 합계를 개수로 나눈 값, 중앙값은 정렬했을 때 가운데 값이다. 표준편차는 값이 평균 주변에 얼마나 퍼져 있는지 나타낸다. 일부 초고액 거래가 있으면 평균이 크게 변하므로 중앙값도 함께 살펴본다."
    },
    {
      "id": "core-bigdata-sampling",
      "title": "모집단·표본·표본 편향",
      "question": "모집단과 표본은 무엇이고 표본 편향은 왜 문제인가요?",
      "answer": "모집단은 관심 대상 전체, 표본은 그중 조사한 일부다. 표본이 특정 집단에 치우치면 전체에 대한 결론도 왜곡된다. 모바일 앱 이용자만 조사한 결과를 모든 은행 고객에게 그대로 일반화하면 안 된다."
    },
    {
      "id": "core-bigdata-correlation",
      "title": "상관관계·인과관계",
      "question": "상관관계가 높으면 원인과 결과라고 볼 수 있나요?",
      "answer": "상관관계는 두 변수가 함께 변하는 경향이고 인과관계는 한 변수가 다른 변수에 영향을 주는 관계다. 제3의 요인이나 우연으로도 상관이 생긴다. 상관계수가 0이어도 비선형 관계가 있을 수 있다."
    },
    {
      "id": "core-bigdata-hypothesis",
      "title": "가설검정·p값",
      "question": "가설검정에서 p값은 무엇을 뜻하나요?",
      "answer": "귀무가설과 검정의 가정이 맞을 때, 관측 결과만큼 또는 더 극단적인 결과가 나올 확률이다. p값이 미리 정한 유의수준보다 작으면 귀무가설을 기각한다. 귀무가설이 참일 확률이나 효과의 크기를 뜻하지 않는다."
    },
    {
      "id": "core-bigdata-learning",
      "title": "지도·비지도학습",
      "question": "지도학습과 비지도학습은 어떻게 다른가요?",
      "answer": "지도학습은 입력과 정답의 관계를 학습한다. 비지도학습은 정답 없이 데이터의 구조나 패턴을 찾는다. 연체 여부를 정답으로 학습하는 것은 지도학습, 거래 성향이 비슷한 고객을 묶는 것은 비지도학습의 예다."
    },
    {
      "id": "core-bigdata-tasks",
      "title": "분류·회귀·군집",
      "question": "분류, 회귀, 군집의 결과는 어떻게 다른가요?",
      "answer": "분류는 정상·이상 같은 범주를 예측하고 회귀는 금액 같은 수치를 예측한다. 군집은 정답 범주 없이 비슷한 대상을 묶는다. 로지스틱 회귀는 이름에 회귀가 들어가지만 주로 분류에 사용한다."
    },
    {
      "id": "core-bigdata-trees",
      "title": "의사결정나무·랜덤 포레스트",
      "question": "의사결정나무와 랜덤 포레스트는 무엇인가요?",
      "answer": "의사결정나무는 조건에 따라 데이터를 반복해서 나누어 예측한다. 랜덤 포레스트는 데이터와 특성에 무작위성을 주어 여러 나무를 학습하고 결과를 결합한다. 나무 하나보다 과적합을 줄일 수 있지만 자동으로 없어지는 것은 아니다."
    },
    {
      "id": "core-bigdata-ensemble",
      "title": "배깅·부스팅",
      "question": "배깅과 부스팅은 어떻게 다른가요?",
      "answer": "배깅은 복원 추출한 여러 데이터로 모델들을 학습하고 결과를 결합해 주로 분산을 줄인다. 부스팅은 앞선 모델의 오류를 보완하도록 모델을 순차적으로 더한다. 랜덤 포레스트는 배깅에 특성 선택의 무작위성을 더한 방식이다."
    },
    {
      "id": "core-bigdata-overfit",
      "title": "과적합·과소적합",
      "question": "과적합과 과소적합은 어떻게 구별하나요?",
      "answer": "과적합은 학습 데이터에는 잘 맞지만 새로운 데이터에서는 성능이 떨어지는 상태다. 과소적합은 패턴을 충분히 학습하지 못해 학습·평가 성능이 모두 낮은 상태다. 학습 성능만 보지 말고 검증 성능도 비교해야 한다."
    },
    {
      "id": "core-bigdata-split",
      "title": "학습·검증·테스트 데이터",
      "question": "학습, 검증, 테스트 데이터를 왜 나누나요?",
      "answer": "학습 데이터는 모델 학습, 검증 데이터는 모델 선택·설정 조정, 테스트 데이터는 최종 성능 평가에 쓴다. 테스트 결과를 보며 계속 수정하면 테스트에 맞추게 된다. 시계열 거래 예측은 시간 순서도 고려해 나눈다."
    },
    {
      "id": "core-bigdata-leakage",
      "title": "데이터 누수",
      "question": "데이터 누수는 무엇인가요?",
      "answer": "예측 시점에 알 수 없는 정보나 평가 데이터의 정보가 학습에 들어가는 현상이다. 거래 승인 시점의 사기를 예측하면서 나중에 확정된 사고 처리 결과를 입력에 넣는 것이 예다. 실제 사용 때보다 평가 성능이 부풀려진다."
    },
    {
      "id": "core-bigdata-confusion",
      "title": "혼동행렬·정확도",
      "question": "혼동행렬은 무엇이며 정확도만 보면 왜 위험한가요?",
      "answer": "혼동행렬은 실제값과 예측값을 비교한 TP·TN·FP·FN의 표다. 정확도는 전체 중 맞힌 비율이다. 이상거래가 1%면 모두 정상이라고 해도 정확도는 99%이므로, 드문 이상거래를 찾는 성능을 따로 확인해야 한다."
    },
    {
      "id": "core-bigdata-metrics",
      "title": "정밀도·재현율·F1",
      "question": "정밀도와 재현율은 무엇을 기준으로 계산하나요?",
      "answer": "정밀도는 이상이라고 예측한 것 중 실제 이상인 비율 TP/(TP+FP), 재현율은 실제 이상 중 찾아낸 비율 TP/(TP+FN)이다. F1은 두 지표의 조화평균이다. 오탐 비용과 놓친 이상거래의 비용에 맞춰 함께 판단한다."
    },
    {
      "id": "core-bigdata-imbalance",
      "title": "클래스 불균형",
      "question": "클래스 불균형은 어떻게 다루나요?",
      "answer": "정상 거래가 이상 거래보다 훨씬 많은 것처럼 범주별 수가 크게 다른 상태다. 클래스 가중치, 오버샘플링·언더샘플링 등을 고려한다. 샘플링은 학습 데이터에만 적용하고 평가는 실제 분포를 반영해야 한다."
    },
    {
      "id": "core-bigdata-association",
      "title": "연관규칙·지지도·신뢰도·향상도",
      "question": "연관규칙의 지지도, 신뢰도, 향상도는 무엇인가요?",
      "answer": "A→B에서 지지도는 A와 B가 함께 발생하는 비율, 신뢰도는 A가 발생했을 때 B도 발생하는 비율이다. 향상도는 신뢰도를 B의 발생 비율로 나눈 값이다. 향상도가 1보다 크면 독립일 때보다 함께 나타나는 경향이 강하다."
    },
    {
      "id": "core-bigdata-privacy",
      "title": "데이터 최소화·접근 통제",
      "question": "분석 데이터에 개인정보가 있다면 무엇을 먼저 고려하나요?",
      "answer": "분석 목적에 필요한 항목만 사용하고 식별 가능한 정보의 노출을 줄인다. 접근 권한과 보관 범위를 관리하며 결합 데이터로 개인이 드러날 가능성도 확인한다. 이름만 삭제해도 다른 속성으로 개인을 알아볼 수 있다."
    }
  ]
}];

export const NOTE_SOURCES = [
 {title:'ksundong/backend-interview-question · 원문 및 기여자',url:'https://github.com/ksundong/backend-interview-question'},
 {title:'원문 라이선스 표기 · CC BY-NC-SA',url:'https://github.com/ksundong/backend-interview-question/blob/71f0300c379837e2f5666bbe19630a3d3fbc2bb2/README.md#information'},
 {title:'원문에 함께 명시된 CC BY-NC 2.0 KR',url:'https://creativecommons.org/licenses/by-nc/2.0/kr/'}
];

// Keep historical records without applying completion to different source questions.
export function migrateNotesCompletion(records = {}) { return { ...records }; }
