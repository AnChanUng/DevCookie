import { useState } from 'react';
import { Link } from 'react-router-dom';
import { theoryFor } from '../theory';

// 이론 글은 마크다운 원문이라, 그대로 보여 줄 때 거슬리는 코드 울타리와 제목 기호만 걷어 낸다
const plain = (md) => (md || '').replace(/\r/g, '').replace(/^```.*$/gm, '').replace(/^#{1,6}\s*/gm, '■ ').replace(/\*\*(.+?)\*\*/g, '$1').replace(/\n{3,}/g, '\n\n').trim();

// 해설 아래에서 그 주제의 이론 글로 이어 준다. 풀이 화면을 떠나지 않게 새 탭으로 열고,
// 상세 설명은 그 자리에서 펼쳐 볼 수 있다. 맞는 글이 없는 주제에는 아무것도 그리지 않는다
export default function TheoryLink({ q }) {
  const theory = theoryFor(q);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(null);
  if (!theory) return null;

  const toggle = () => {
    setOpen(o => !o);
    if (body === null) {
      import('../hardcodedData')
        .then(m => setBody(plain(m.hardcodedQuestions.find(x => x.id === theory.id)?.answer) || '이론 글을 찾지 못했습니다.'))
        .catch(() => setBody('이론 글을 불러오지 못했습니다.'));
    }
  };

  return (
    <div className="exam-theory">
      <div className="exam-theory-bar">
        <Link className="exam-btn sm" to={`/question/${theory.id}`} target="_blank" rel="noreferrer">📖 이론 보기 · {theory.title} ↗</Link>
        <button type="button" className="exam-btn sm ghost" onClick={toggle}>{open ? '상세 설명 접기' : '상세 설명 펼치기'}</button>
      </div>
      {open && <div className="exam-theory-body">{body ?? '불러오는 중…'}</div>}
    </div>
  );
}
