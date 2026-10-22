import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

// Theory PDFs are available to every visitor without a membership lookup.
const NOTES = [
  { file: 'ipe-written-summary.pdf', title: '정보처리기사 필기', desc: '필기 핵심 요약노트 · 전 과목 정리 · 18쪽' },
  { file: 'ipe-written-review.pdf', title: '정보처리기사 필기 (복습용)', desc: '필기 핵심 요약노트 · 복습용 · 17쪽' },
  { file: 'ipe-silgi-theory.pdf', title: '정보처리기사 실기', desc: '실기 이론편 요약노트 · 서술형 대비'},
  { file: 'sqld-concepts.pdf', title: 'SQLD', desc: '2024 개념 정리 노트 · 데이터 모델링 · SQL 기본 및 활용 · 22쪽'},
  { file: 'bigdata-analyst-summary.pdf', title: '빅데이터분석기사', desc: '2026.02.05 개정판 요약노트 · 필기 전 과목 · 69쪽'},
  { file: 'adsp-summary.pdf', title: 'ADsP', desc: '데이터분석 준전문가 요약노트 · 데이터 이해 · 분석 기획 · 분석 · 23쪽'},
];

export default function MajorPage() {
  const [open, setOpen] = useState(null);
  const [pdf, setPdf] = useState({ file: null, url: null, error: false });
  const [downloadError, setDownloadError] = useState('');
  const current = pdf.file === open ? pdf : { url: null, error: false };
  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    let url;
    api.get(`/theory/notes/${open}`, { responseType: 'blob', signal: controller.signal, timeout: 90000 })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        url = URL.createObjectURL(data);
        setPdf({ file: open, url, error: false });
      }).catch(() => { if (!controller.signal.aborted) setPdf({ file: open, url: null, error: true }); });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [open]);
  const download = async n => {
    setDownloadError('');
    try {
      const { data } = await api.get(`/theory/notes/${n.file}`, { responseType: 'blob', timeout: 90000 });
      const url = URL.createObjectURL(data), link = document.createElement('a');
      link.href = url; link.download = `${n.title} 요약노트.pdf`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { setDownloadError('자료를 받지 못했습니다. 서버 연결을 확인한 뒤 다시 시도해 주세요.'); }
  };

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
            <button type="button" className="note-dl" onClick={() => download(n)}>
              ⬇ 저장
            </button>
          </div>
        ))}
      </div>
      {downloadError && <p role="alert">{downloadError}</p>}

      <div className="section-title">문제로 확인하기</div>
      <div className="exam-sections">
        <Link to="/major/spring" className="exam-section duel-room">
          <span className="t">Spring · JPA</span>
          <span className="d">스프링 코어 · 웹 MVC · JPA · 부트</span>
          <span className="d">60문제 · 60분 · 4지선다</span>
        </Link>
      </div>

      {note && (
        <div className="note-viewer">
          <div className="note-viewer-bar">
            <strong>{note.title}</strong>
            <span className="spacer" />
            <button className="exam-btn" onClick={() => download(note)}>⬇ 다운로드</button>
          </div>
          {current.url ? <iframe title={note.title} src={`${current.url}#navpanes=0&view=FitH`} className="note-frame" />
            : <p role={current.error ? 'alert' : 'status'}>{current.error ? '자료를 불러오지 못했습니다. 서버 연결을 확인한 뒤 다시 시도해 주세요.' : '자료를 불러오는 중…'}</p>}
          <p className="note-hint">화면에서 바로 읽거나 다운로드해 보관할 수 있습니다. 일부 모바일 브라우저에서는 PDF가 표시되지 않을 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}
