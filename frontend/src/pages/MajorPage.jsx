import { useState } from 'react';
import { Link } from 'react-router-dom';

// 전공필기/ 폴더의 이론노트 PDF. public/notes/ 에 URL에 안전한 이름으로 복사해 둔다
const NOTES = [
  { file: 'ipe-silgi-theory.pdf', title: '정보처리기사 실기', desc: '실기 이론편 요약노트 · 서술형 대비'},
  { file: 'sqld-concepts.pdf', title: 'SQLD', desc: '2024 개념 정리 노트 · 데이터 모델링 · SQL 기본 및 활용 · 22쪽'},
  { file: 'bigdata-analyst-summary.pdf', title: '빅데이터분석기사', desc: '2026.02.05 개정판 요약노트 · 필기 전 과목 · 69쪽'},
  { file: 'adsp-summary.pdf', title: 'ADsP', desc: '데이터분석 준전문가 요약노트 · 데이터 이해 · 분석 기획 · 분석 · 23쪽'},
];

export default function MajorPage() {
  const [open, setOpen] = useState(null);

  const note = NOTES.find(n => n.file === open);

  return (
    <div className="fade-in">
      <div className="page-header">
        <Link to="/" className="back-link">← 홈으로</Link>
        <h1>📝 필기이론</h1>
        <p>정보처리기사 · SQLD · 빅데이터분석기사 · ADsP 요약노트 PDF · 화면에서 바로 읽거나 내려받기</p>
      </div>

      <div className="section-title">이론노트</div>
      <div className="notes-grid">
        {NOTES.map(n => (
          <div key={n.file} className={`note-card ${open === n.file ? 'on' : ''}`}>
            <button
              type="button"
              className="note-open"
              onClick={() => { setOpen(open === n.file ? null : n.file); }}
            >
              <span className="note-icon">📄</span>
              <span className="note-body">
                <span className="note-title">{n.title}</span>
                <span className="note-desc">{n.desc}</span>
              </span>
              <span className="note-tag">{open === n.file ? '닫기' : '보기'}</span>
            </button>
            {/* download 속성: 뷰어로 열지 않고 제목 그대로 저장한다 */}
            <a className="note-dl" href={`/notes/${n.file}`} download={`${n.title} 요약노트.pdf`}>
              ⬇ 저장
            </a>
          </div>
        ))}
      </div>

      {note && (
        <div className="note-viewer">
          <div className="note-viewer-bar">
            <strong>{note.title}</strong>
            <span className="spacer" />
            <a className="exam-btn" href={`/notes/${note.file}`} download={`${note.title} 요약노트.pdf`}>⬇ 다운로드</a>
          </div>
          <iframe title={note.title} src={`/notes/${note.file}#navpanes=0&view=FitH`} className="note-frame" />
          <p className="note-hint">화면에서 바로 읽거나 다운로드해 보관할 수 있습니다. 일부 모바일 브라우저에서는 PDF가 표시되지 않을 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}
