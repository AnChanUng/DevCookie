import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { hardcodedQuestions } from '../hardcodedData';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats')
      .then(statsRes => {
        setStats(statsRes.data);
      })
      .catch(() => {
        setStats({ totalQuestions: hardcodedQuestions.length, studiedQuestions: 0 });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (!value.trim()) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(() => {
      api.get(`/questions/search?q=${encodeURIComponent(value.trim())}`)
        .then(res => setSearchResults(res.data))
        .catch(() => {
          const q = value.trim().toLowerCase();
          const results = hardcodedQuestions.filter(
            item => item.title.toLowerCase().includes(q) || item.tags.toLowerCase().includes(q)
          );
          setSearchResults(results);
        });
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="hero">
        <h1>CS 면접 준비</h1>
        <p>카테고리별 학습으로 기술 면접을 완벽하게 대비하세요</p>
      </div>

      {stats && (
        <div className="stats-summary">
          <div className="stats-summary-card">
            <div className="stats-summary-value">{stats.totalQuestions || 0}</div>
            <div className="stats-summary-label">전체 질문</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-value">{stats.studiedQuestions || 0}</div>
            <div className="stats-summary-label">학습 완료</div>
          </div>
          <div className="stats-summary-card">
            <div className="stats-summary-value" style={{ color: stats.studiedQuestions && stats.totalQuestions ? undefined : 'var(--text-quaternary)' }}>
              {stats.totalQuestions
                ? Math.round((stats.studiedQuestions / stats.totalQuestions) * 100)
                : 0}%
            </div>
            <div className="stats-summary-label">진행률</div>
          </div>
        </div>
      )}

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
              <p>HF · 코스콤 · 기업은행 전공필기 모의고사</p>
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
