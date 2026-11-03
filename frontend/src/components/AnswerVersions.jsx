import { useState } from 'react';
import { Link } from 'react-router-dom';
import { account } from '../sync';

export default function AnswerVersions({ snapshot }) {
  const [error, setError] = useState('');
  const questions = [...snapshot.questions, ...snapshot.portfolioGroups.flatMap(g => g.questions)];
  function download(includeDrafts) {
    setError('');
    try {
      const user = account();
      const owner = user ? `user:${user.id || user.nickname}` : 'guest';
      const key = `chanung:practice:v1:${owner}`;
      const result = includeDrafts ? {
        ...snapshot,
        personalPractice: {
          exportedAt: new Date().toISOString(),
          latestDrafts: JSON.parse(localStorage.getItem(key) || '{}'),
          versionDrafts: JSON.parse(localStorage.getItem(`${key}:version:${snapshot.id}`) || '{}'),
        },
      } : snapshot;
      const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${snapshot.id}${includeDrafts ? '_my-practice' : ''}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setError('내려받지 못했습니다. 브라우저 저장 공간과 다운로드 설정을 확인해 주세요.'); }
  }
  return <section className="notes-detail-card" aria-label="답변 버전 관리">
    <h2>답변 버전 관리</h2>
    <p>이전에 저장한 질문과 답변을 확인하고, 그 버전으로 돌아가 연습할 수 있습니다.</p>
    <p><Link to="/chanung">최신 답변으로 연습하기</Link></p>
    <article>
      <h3>{snapshot.id}</h3>
      <p>{snapshot.savedOn} 저장 · {snapshot.description}</p>
      <p>질문·답변 {snapshot.questions.length}개 · 포트폴리오 꼬리질문 {questions.length - snapshot.questions.length}개 · 면접 순서 포함</p>
      <p>불러오면 이 저장본으로 연습합니다. 최신 답변을 덮어쓰지 않으며, 새로고침해도 선택한 버전이 유지됩니다.</p>
      <div className="chanung-actions">
        <Link className="exam-btn sm" to={`/chanung?version=${snapshot.id}`}>이 버전 불러오기</Link>
        <button className="exam-btn sm" onClick={() => download(false)}>저장본 내려받기</button>
        <button className="exam-btn sm" onClick={() => download(true)}>내 연습 답변도 함께 내려받기</button>
      </div>
      <p className="audio-hint">저장본에는 사이트에 등록된 답변과 준비 포인트가 포함됩니다. 개인 입력 답변은 현재 브라우저·계정에서 내려받으며, 녹음은 포함되지 않습니다.</p>
      {error && <p role="alert">{error}</p>}
      <details><summary>저장된 질문·답변 미리보기 ({questions.length}개)</summary>
        {questions.map(q => <details key={q.id}><summary>{q.question}</summary><p style={{ whiteSpace: 'pre-wrap' }}>{q.answer || q.hint}</p></details>)}
      </details>
    </article>
  </section>;
}
