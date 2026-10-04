// IBK기업은행 디지털 분야 대비 빅데이터 집중 문제집 80문항 = 빅데이터분석기사 필기 4과목 × 20문항 (4지선다)
// 전공필기/빅데이터분석기사_요약노트_260205 (1).pdf 의 과목별 내용을 따라 새로 만든 문제. 요약노트 문장의 복제가 아니다.
// 과목 안에서는 기본 → 계산·상황 문제 순서로 놓았다.
import { IBK_BIGDATA_A } from './ibkBigdataAQuestions';
import { IBK_BIGDATA_B } from './ibkBigdataBQuestions';

const unit = (name, sub) => ({ name, short: name, sub, count: 0, extra: true, unit: true });

const UNITS = {
  bd1: unit('1과목 빅데이터 분석 기획', '빅데이터 특성 · 수집·저장 기술 · 비식별화·프라이버시 모델 · 분석 과제 발굴 · 분석 방법론·수준 진단'),
  bd2: unit('2과목 빅데이터 탐색', '결측값·이상값 처리 · 변수 선택·차원 축소 · 스케일링·불균형 처리 · 기초 통계량·상관분석 · 확률분포·추정·가설검정'),
  bd3: unit('3과목 빅데이터 모델링', '회귀·로지스틱 회귀 · 의사결정나무·신경망·SVM · 연관·군집분석 · 시계열·베이지안 · 딥러닝·텍스트·앙상블'),
  bd4: unit('4과목 빅데이터 결과 해석', '혼동 행렬·F1·ROC · 회귀 지표·수정 R² · 교차 검증·적합도 검정 · 과대적합·옵티마이저 · ROI·시각화·리모델링'),
};

const ALL = [...IBK_BIGDATA_A, ...IBK_BIGDATA_B];

export const IBK_BIGDATA = {
  title: '빅데이터 집중 문제집',
  lede: '디지털 분야 출제범위의 빅데이터 · 인공지능 모델링을 빅데이터분석기사 필기 4과목 순서로 정리한 80문항입니다. 요약노트의 과목별 내용을 따라 새로 만들었고, 여신 심사·이상거래 탐지·고객 이탈 같은 은행 데이터 분석 상황과 지표 계산 문제를 섞었습니다. 한 문제씩 즉시 채점되며 틀린 문제는 오답노트에 함께 쌓입니다. 위의 회차별 모의고사 문제와는 겹치지 않습니다.',
  sections: UNITS,
  questions: Object.keys(UNITS).flatMap(k => ALL.filter(q => q.sec === k)),
};
