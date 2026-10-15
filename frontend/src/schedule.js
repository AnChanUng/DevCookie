// 필기 시험 일정. 첫 화면에서 직접 고칠 수 있고 이 브라우저에 저장한다.
// to는 그 시험의 문제은행 주소(없으면 연결 안 함)
const KEY = 'study:exams';

// 아직 한 번도 고치지 않은 사람에게 보여 줄 기본 일정
const DEFAULTS = [
  { name: '기업은행', date: '2026-10-17', to: '/exam/ibk' },
  { name: '코스콤', date: '2026-10-24', to: '/exam/koscom' },
  { name: '현대오토에버', date: '2026-10-25' },
];

export function loadExams() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved.filter(e => e && typeof e.name === 'string' && typeof e.date === 'string');
  } catch { /* 저장된 값이 깨졌으면 기본 일정으로 */ }
  return DEFAULTS;
}

export function saveExams(exams) {
  try { localStorage.setItem(KEY, JSON.stringify(exams)); } catch { /* storage unavailable */ }
}

// 오늘부터 그날까지 남은 날 수. 지났으면 음수, 날짜가 비어 있으면 null
export function daysLeft(date, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const day = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== date) return null;
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).map(p => [p.type, p.value]));
  const today = Date.parse(`${parts.year}-${parts.month}-${parts.day}T00:00:00Z`);
  return Math.round((day - today) / 86400000);
}

// 이 주소의 문제은행에 걸린, 아직 지나지 않은 가장 가까운 시험
export function examFor(path) {
  return loadExams()
    .map(e => ({ ...e, left: daysLeft(e.date) }))
    .filter(e => e.to === path && e.left !== null && e.left >= 0)
    .sort((a, b) => a.left - b.left)[0] || null;
}
