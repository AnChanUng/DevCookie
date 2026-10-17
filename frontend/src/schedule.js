// 필기 시험 일정. 첫 화면에서 직접 고칠 수 있고 이 브라우저에 저장한다.
// to는 그 시험의 문제은행 주소(없으면 연결 안 함)
// 기존에 등록된 모든 일정을 초기화한다. 이후 새로 추가한 일정은 유지한다.
const KEY = 'study:exams:v2';

export function loadExams() {
  try { localStorage.removeItem('study:exams'); } catch { /* storage unavailable */ }
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved.filter(e => e && typeof e.name === 'string' && typeof e.date === 'string');
  } catch { /* 저장된 값이 깨졌으면 빈 일정으로 */ }
  return [];
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
