import { useState } from 'react';
import { Link } from 'react-router-dom';

// 전공필기/ 폴더의 이론노트 PDF. public/notes/ 에 URL에 안전한 이름으로 복사해 둔다
const NOTES = [
  { file: 'ipe-pilgi-summary.pdf', title: '정보처리기사 필기', desc: '필기 전 과목 핵심 요약노트 · 18쪽'},
  { file: 'ipe-silgi-theory.pdf', title: '정보처리기사 실기', desc: '실기 이론편 요약노트 · 서술형 대비'},
  { file: 'sqld-concepts.pdf', title: 'SQLD', desc: '2024 개념 정리 노트 · 데이터 모델링 · SQL 기본 및 활용 · 22쪽'},
  { file: 'bigdata-analyst-summary.pdf', title: '빅데이터분석기사', desc: '2026.02.05 개정판 요약노트 · 필기 전 과목 · 69쪽'},
];

export default function MajorPage() {
  const [open, setOpen] = useState(null);

  const note = NOTES.find(n => n.file === open);

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>📝 필기이론</h1>
        <p>정보처리기사 · SQLD · 빅데이터분석기사 요약노트 PDF · 화면에서 바로 읽는 열람 전용</p>
      </div>

      <div className="section-title">이론노트</div>
      <div className="notes-grid">
        {NOTES.map(n => (
          <button
            key={n.file}
            type="button"
            className={`note-card ${open === n.file ? 'on' : ''}`}
            onClick={() => { setOpen(open === n.file ? null : n.file); }}
          >
            <span className="note-icon">📄</span>
            <span className="note-body">
              <span className="note-title">{n.title}</span>
              <span className="note-desc">{n.desc}</span>
            </span>
            <span className="note-tag">{open === n.file ? '닫기' : '보기'}</span>
          </button>
        ))}
      </div>

      {note && (
        <div className="note-viewer">
          <div className="note-viewer-bar">
            <strong>{note.title}</strong>
            <span className="spacer" />
            <span className="note-tag">열람 전용</span>
          </div>
          {/* toolbar=0: 브라우저 PDF 뷰어의 다운로드·인쇄 버튼을 숨긴다 */}
          <iframe title={note.title} src={`/notes/${note.file}#toolbar=0&navpanes=0&view=FitH`} className="note-frame" />
          <p className="note-hint">화면에서 바로 읽는 열람 전용 자료입니다. 일부 모바일 브라우저에서는 PDF가 표시되지 않을 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}
