import { useState } from 'react';
import { Link } from 'react-router-dom';

const isVisibleBank = to => typeof to === 'string' && !/^\/(ssafy(?:\/|$)|exam\/ssafy)/.test(to);

// 가장 최근에 풀다 만 문제(문제은행마다 한 건씩 저장됨) 가운데 제일 나중 것
function latestUnfinished() {
  let best = null;
  try {
    for (const key of Object.keys(localStorage)) {
      if (!key.startsWith('exam-resume:')) continue;
      try {
        const r = JSON.parse(localStorage.getItem(key));
        if (isVisibleBank(r?.to) && Array.isArray(r.ids) && (!best || (r.at || 0) > (best.at || 0))) best = r;
      } catch { /* 깨진 항목은 건너뛴다 */ }
    }
  } catch { /* storage unavailable */ }
  return best;
}

function lastBank() {
  try {
    const r = JSON.parse(localStorage.getItem('exam:last'));
    return isVisibleBank(r?.to) && r?.name ? r : null;
  } catch {
    return null;
  }
}

// 첫 화면에서 하던 공부로 바로 돌아간다. 풀다 만 문제가 있으면 그 문제로,
// 없으면 마지막으로 연 문제집으로 이어 준다. 둘 다 없으면 아무것도 그리지 않는다
export default function ContinueCard() {
  const [item] = useState(() => {
    const quiz = latestUnfinished();
    if (quiz) {
      return {
        to: `${quiz.to}?resume=1`, kind: '풀던 문제 이어서 하기', name: quiz.name,
        detail: `${quiz.label || '문제 풀이'} · ${Object.keys(quiz.answers || {}).length} / ${quiz.ids.length} 답변`,
      };
    }
    const bank = lastBank();
    return bank ? { to: bank.to, kind: '최근에 본 문제집', name: bank.name, detail: '이어서 풀러 가기' } : null;
  });
  if (!item) return null;

  return (
    <Link to={item.to} className="home-continue">
      <span className="home-continue-text">
        <small>{item.kind}</small>
        <b>{item.name}</b>
        <span>{item.detail}</span>
      </span>
      <span className="home-continue-go">이어서 →</span>
    </Link>
  );
}
