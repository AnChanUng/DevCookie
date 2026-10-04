// 컴퓨터일반 단원별 문제집 210문항 = 14단원 × 15문항 (4지선다)
// 전공필기/2026_한성e북_기출_컴일.pdf (2014~2025 기출)를 연도별로 읽어 단원마다 반복 출제 주제와 문제 유형을 따라 새로 만든 문제.
// 실제 시험 문항과 교재 해설의 복제가 아니다. 단원 안에서는 기본 → 심화 순서로 놓았다.
import { COMIL_UNIT_A } from './comilUnitAQuestions';
import { COMIL_UNIT_B } from './comilUnitBQuestions';
import { COMIL_UNIT_C } from './comilUnitCQuestions';
import { COMIL_UNIT_D } from './comilUnitDQuestions';
import { COMIL_UNIT_E } from './comilUnitEQuestions';

const unit = (name, sub) => ({ name, short: name, sub, count: 0, extra: true, unit: true });

// 모의고사 영역(COMIL_SECTIONS)과 키가 겹치지 않게 단원 키는 'u-'로 시작한다
const UNITS = {
  ca1: unit('1. 자료 표현·논리회로', '진법 · 보수 · 부동소수점 · 오류 검출 코드 · 불 대수 · 카르노 맵 · 조합회로 · 플립플롭'),
  ca2: unit('2. 컴퓨터 구조', '레지스터 · 마이크로 연산 · 주소 지정 · 파이프라인 · 인터럽트 · 캐시 · 버스 · RAID · 병렬 처리'),
  os1: unit('3. 운영체제 ① 프로세스 관리', '운영체제 유형 · 프로세스 상태·PCB · 스레드 · CPU 스케줄링 계산 · 세마포어·모니터 · 교착상태'),
  os2: unit('4. 운영체제 ② 기억장치·파일', '배치 전략 · 주소 변환 · 가상 메모리 · 페이지 교체 계산 · 디스크 스케줄링 · 파일 할당·유닉스 권한'),
  db:  unit('5. 데이터베이스', '스키마 3계층 · 무결성 · 후보키 · 관계대수 · SQL 결과 · 정규화 · 병행 제어 · 회복 · 분산 DB'),
  ds:  unit('6. 자료구조', '배열·연결 리스트 · 스택·큐·데크 · 수식 표기 · 트리 · 이진 탐색 트리 · 힙 · B-트리 · 해싱'),
  al:  unit('7. 알고리즘', '시간 복잡도 · 정렬 단계별 결과 · 이진 탐색 · 재귀 · DFS · 위상 정렬 · 프림 · 다익스트라 · 설계 기법'),
  nw1: unit('8. 데이터통신', '전송 매체 · 변조 · 다중화 · 나이퀴스트 · 샤논 · CRC · 해밍 · ARQ · CSMA/CD · 무선랜'),
  nw2: unit('9. 인터넷·TCP/IP', 'OSI 계층 · 포트 번호 · TCP/UDP · DHCP · 라우팅 · IPv6 · 서브넷팅 · CIDR · 혼잡 제어'),
  sec: unit('10. 정보보호', '보안 3요소 · 접근 통제 · 전자서명 · PKI · DES/AES · RSA 계산 · 공격 기법 · IDS · IPSec'),
  se:  unit('11. 소프트웨어공학', '생명주기 모형·스크럼·XP · DFD · 응집도·결합도 · UML · 디자인 패턴 · 테스트 · PERT·CPM · CMMI'),
  pl1: unit('12. 프로그래밍 언어론·C', '언어 번역 · 컴파일 단계 · 바인딩·스코프 · 매개변수 전달 · C 실행 결과(포인터 · 문자열 · 구조체 · 재귀)'),
  pl2: unit('13. Java·Python·객체지향', '객체지향 개념 · Java 실행 결과(생성자 순서 · 오버라이딩 · static · 예외) · Python 실행 결과 · 웹 언어'),
  nt:  unit('14. 신기술·IT 일반', '클라우드 · 인공지능 · 빅데이터 · IoT · 블록체인 · 멀티미디어 계산 · 스프레드시트 함수'),
};

const ALL = [...COMIL_UNIT_A, ...COMIL_UNIT_B, ...COMIL_UNIT_C, ...COMIL_UNIT_D, ...COMIL_UNIT_E];
const order = Object.keys(UNITS);

export const COMIL_UNITS = {
  title: '단원별 문제집',
  lede: '컴퓨터일반 기출문제집(2014~2025)을 14개 단원으로 나누어 단원마다 15문제씩 새로 만든 210문항입니다. 단원 안에서는 기본 개념부터 계산·코드 문제 순서로 나오고, 한 문제씩 즉시 채점되며 틀린 문제는 오답노트에 함께 쌓입니다. 위의 모의고사 문제와는 겹치지 않습니다.',
  sections: Object.fromEntries(order.map(k => [`u-${k}`, UNITS[k]])),
  questions: order.flatMap(k => ALL.filter(q => q.sec === k)).map(q => ({ ...q, sec: `u-${q.sec}` })),
};
