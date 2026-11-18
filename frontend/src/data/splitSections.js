// 복기 문제집과 공개 예상문제집이 함께 쓰는 영역 정의. 복기 문항 파일을 공개 번들에 끌어들이지 않으려고 따로 둔다.

export const KORAIL_SECTIONS = {
  sw:  {name:'소프트웨어공학', short:'SW', sub:'애자일 · 결합도 · UML · GoF · 임계경로 · 테스트', count:9},
  db:  {name:'데이터베이스', short:'DB', sub:'관계대수 · SQL · 조인 · 정규화 · ACID · 인덱스', count:9},
  os:  {name:'운영체제·컴퓨터구조', short:'OS/CA', sub:'SJF · 페이지 교체 · 단편화 · 쉘 · 파이프라인 · AMAT · 2의 보수 · I/O', count:10},
  net: {name:'네트워크', short:'NW', sub:'OSI 계층 · TCP · CSMA/CA · OSPF · 서브넷 · IPv6 애니캐스트', count:6},
  sec: {name:'정보보호', short:'보안', sub:'포렌식 · 블록 암호 운영 모드 · AES · 스니핑 · SQL 인젝션 · 리눅스 권한', count:6},
};

export const EX_SECTIONS = {
  db:  {name:'데이터베이스', short:'DB', sub:'카디널리티 · 파티셔닝 · 무결성 · TCL · 물리 설계 · 이상 현상 · B-트리 · 회복', count:8},
  sw:  {name:'소프트웨어공학', short:'SW', sub:'간트차트 · 유지보수 · 칸반 · UML · 요구사항 명세 · GoF · 테스트 · 재공학', count:8},
  os:  {name:'운영체제', short:'OS', sub:'모니터 · 최적적합 · 경쟁 조건 · 상태 전이 · 스레드 · HRN · 클럭 · SSTF · 교착상태', count:9},
  sec: {name:'정보보호', short:'보안', sub:'ISMS-P · 눈사태 효과 · 무결성 · 로그 · XSS · 시큐어 코딩 · SQL 인젝션', count:7},
  net: {name:'네트워크', short:'NW', sub:'노드 · 데이터링크 · 캡슐화 · 데이터그램 · 흐름 제어 · 서브넷 · IPsec · SSL VPN', count:8},
};

export const KWATER_SECTIONS = {
  pl:   {name:'프로그래밍', short:'PL', sub:'C · Python · Java 실행 결과', count:6},
  ds:   {name:'자료구조', short:'DS', sub:'트리 차수 · 후위식 변환 · 레드-블랙 트리', count:3},
  net:  {name:'네트워크', short:'NW', sub:'패킷 교환 · ARQ · OSPF', count:3},
  os:   {name:'운영체제', short:'OS', sub:'SJF · 워킹셋 · 임계구역 · C-SCAN · LRU · TLB · exec', count:8},
  arch: {name:'컴퓨터구조', short:'CA', sub:'GPU · 불 대수 · RAID · 주소지정 · 논리회로 · RISC · 지역성 · DMA · 슈퍼스칼라 · 마이크로프로그램', count:10},
};

export const KDN_SECTIONS = {
  sw:  {name:'소프트웨어공학', short:'SW', sub:'XP · LOC · 결합도/응집도 · SOLID · 디자인 패턴 · 오버로딩 · 형상관리', count:7},
  pl:  {name:'프로그래밍·자료구조', short:'PL/DS', sub:'포인터 · 트리 순회 · 스택/큐 · 그래프 간선 · 레지스터', count:5},
  os:  {name:'운영체제', short:'OS', sub:'은행가 알고리즘 · LFU · 페이징/세그먼테이션 · HRN · PC 레지스터', count:5},
  db:  {name:'데이터베이스', short:'DB', sub:'조인 차수·카디널리티 · COUNT · SQL 순서 · 함수 종속 · 정규화 · 무결성 · 설계 단계 · 회복 · ACID · 투명성 · 뷰 · DML', count:17},
  net: {name:'네트워크', short:'NW', sub:'서브넷 · 해밍코드 · CSMA/CA · OSPF · 지연시간 · 혼잡제어 · IPv6 · HDLC · 전송계층 · RTS/CTS · ARP · SDN · 토폴로지', count:16},
};

export const KICOX_SECTIONS = {
  db: {name:'데이터베이스', short:'DB', sub:'인덱스 선택도 · 비트맵 인덱스 · 관계대수 · 권한 · 저장 구조 · 회복 · 2PL · ACID · NoSQL · 분산 투명성 · 이상 현상 · 기본키', count:14},
  ds: {name:'자료구조·알고리즘', short:'DS', sub:'재귀 · 트리 순회 · BST · AVL/Red-Black · 그래프 · 위상 정렬 · DP · 정렬 성질 · 시간복잡도', count:12},
  se: {name:'소프트웨어공학', short:'SW', sub:'형상 관리 · Scrum · 디자인 패턴 · 코드 스멜 · V-모델 · 테스트 커버리지', count:6},
  ai: {name:'AI·보안', short:'AI/보안', sub:'Adam · 역전파 · 활성화 함수 · Self-Attention · K-means · 웹 공격 · 대칭키 암호', count:7},
};
