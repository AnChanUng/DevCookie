import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../contexts/useAuth';

// 학습 완료 수는 계정마다 다르므로 계정별로 캐시한다
const statsCacheKey = (userId) => `home-stats:${userId ?? 'guest'}`;

function readCachedStats(userId) {
  try {
    const raw = localStorage.getItem(statsCacheKey(userId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Home() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [loaded, setLoaded] = useState({ userId, stats: readCachedStats(userId) });
  if (loaded.userId !== userId) setLoaded({ userId, stats: readCachedStats(userId) });
  const stats = loaded.stats;
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    // 백엔드(Render)가 잠들어 있으면 응답이 늦으므로 화면은 먼저 그리고 통계만 나중에 채운다
    api.get('/stats', { timeout: 60000 })
      .then(statsRes => {
        setLoaded(prev => (prev.userId === userId ? { userId, stats: statsRes.data } : prev));
        try {
          localStorage.setItem(statsCacheKey(userId), JSON.stringify(statsRes.data));
        } catch {
          /* storage unavailable */
        }
      })
      .catch(async () => {
        const { hardcodedQuestions } = await import('../hardcodedData');
        const fallback = { totalQuestions: hardcodedQuestions.length, studiedQuestions: 0 };
        setLoaded(prev => (prev.userId === userId && !prev.stats ? { userId, stats: fallback } : prev));
      });
  }, [userId]);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(() => {
      api.get(`/questions/search?q=${encodeURIComponent(value.trim())}`)
        .then(res => setSearchResults(res.data))
        .catch(async () => {
          const { hardcodedQuestions } = await import('../hardcodedData');
          const q = value.trim().toLowerCase();
          const results = hardcodedQuestions.filter(
            item => item.title.toLowerCase().includes(q) || item.tags.toLowerCase().includes(q)
          );
          setSearchResults(results);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fade-in">
      <div className="hero">
        <h1>CS 면접 준비</h1>
        <p>카테고리별 학습으로 기술 면접을 완벽하게 대비하세요</p>
      </div>

      <div className="stats-summary">
          <div className="stats-summary-card">
            <div className="stats-summary-value">{stats ? stats.totalQuestions || 0 : '–'}</div>
            <div className="stats-summary-label">전체 질문</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-value">{stats ? stats.studiedQuestions || 0 : '–'}</div>
            <div className="stats-summary-label">학습 완료</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-value" style={{ color: stats?.studiedQuestions && stats?.totalQuestions ? undefined : 'var(--text-quaternary)' }}>
              {stats?.totalQuestions
                ? Math.round((stats.studiedQuestions / stats.totalQuestions) * 100)
                : 0}%
            </div>
            <div className="stats-summary-label">진행률</div>
          </div>
        </div>

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder="질문 검색..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {searchResults !== null ? (
        <>
          <div className="section-title">
            검색 결과 ({searchResults.length}건)
          </div>
          {searchResults.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📭</div>
              검색 결과가 없습니다
            </div>
          ) : (
            <div className="question-list">
              {searchResults.map((q, idx) => (
                <Link to={`/question/${q.id}`} key={q.id} className="question-item">
                  <div className="question-number">{idx + 1}</div>
                  <div className="question-item-body">
                    <h3>{q.title}</h3>
                    <div className="question-meta">
                      <span className={`badge badge-${q.difficulty.toLowerCase()}`}>
                        {q.difficulty}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                        {q.categoryName}
                      </span>
                    </div>
                  </div>
                  <span className="question-item-arrow">›</span>
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="section-title">학습 메뉴</div>
          <div className="categories-grid">
            <Link to="/exam" className="category-card major-exam-card">
              <div className="category-icon">📚</div>
              <h3>1. 기출문제</h3>
              <p>HF · IBK · 저축은행중앙회 · 코레일 · 도로공사 · 수자원공사 · 한전KDN 모의고사</p>
            </Link>
            <Link to="/major" className="category-card major-exam-card">
              <div className="category-icon">📝</div>
              <h3>2. 전공필기</h3>
              <p>데이터베이스 · 자료구조 · 운영체제 · 네트워크 · 도커 등</p>
            </Link>
            <Link to="/interview" className="category-card interview-card">
              <div className="category-icon">🎤</div>
              <h3>공통면접질문</h3>
              <p>카메라와 마이크로 실전 면접 연습</p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
