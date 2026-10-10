import { Link, useNavigate } from 'react-router-dom'
import { revolutions } from '../data/revolutions.js'
import { summarize, collectWrong } from '../hooks/useProgress.js'
import { useProgressContext } from '../ProgressContext.jsx'
import Stars from '../components/Stars.jsx'
import RevolutionMap from '../components/RevolutionMap.jsx'

// 원형 진행률 게이지 (SVG)
function ProgressRing({ percent }) {
  const r = 34
  const c = 2 * Math.PI * r
  const offset = c - (percent / 100) * c
  return (
    <div className="ring-gauge" role="img" aria-label={`전체 진행률 ${percent}%`}>
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle cx="40" cy="40" r={r} className="ring-track" />
        <circle
          cx="40" cy="40" r={r}
          className="ring-fill"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
        />
      </svg>
      <span className="ring-label">{percent}%</span>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { progress, resetProgress } = useProgressContext()
  const stats = summarize(progress, revolutions.length)
  const wrongCount = collectWrong(progress).length
  const reviewUnlocked = stats.percent >= 100

  return (
    <div className="home">
      {/* 상단 네비게이션 */}
      <nav className="topbar" aria-label="주요 메뉴">
        <div className="topbar-brand">
          <span className="topbar-logo" aria-hidden="true">🗺️</span>
          <span className="topbar-name">지수쌤과 혁명 탐험대</span>
        </div>
        <div className="topbar-actions">
          <button
            className={`chip-btn ${reviewUnlocked ? '' : 'is-locked'}`}
            disabled={!reviewUnlocked}
            onClick={() => reviewUnlocked && navigate('/review')}
            aria-label={
              reviewUnlocked
                ? `틀린 문제 다시 풀기${wrongCount > 0 ? `, ${wrongCount}문제` : ', 완료'}`
                : '틀린 문제 다시 풀기, 모든 스테이지를 클리어하면 열려요'
            }
            title={reviewUnlocked ? '틀린 문제를 다시 풀어요' : '모든 스테이지를 클리어하면 열려요'}
          >
            <span aria-hidden="true">🔁</span> 틀린 문제{' '}
            <span className="chip-count">{reviewUnlocked ? (wrongCount > 0 ? `${wrongCount}` : '✓') : '🔒'}</span>
          </button>
          <button className="chip-btn chip-game" onClick={() => navigate('/match-game')} aria-label="혁명 매칭 게임 하러 가기">
            <span aria-hidden="true">🧩</span> 매칭 게임
          </button>
        </div>
      </nav>

      {/* 히어로: 소개 + 진행 현황 / 지도 */}
      <section className="hero">
        <div className="hero-left">
          <span className="hero-eyebrow">역사1 · 국민 국가의 형성</span>
          <h1 className="hero-title">세계를 바꾼<br /><span className="hero-title-accent">7개의 혁명</span>을 탐험하자</h1>
          <p className="hero-desc">지도를 따라 떠나 요약을 읽고 퀴즈로 복습하는 역사 모험 게임</p>

          <div className="hero-stats">
            <ProgressRing percent={stats.percent} />
            <div className="hero-stat-list">
              <div className="hero-stat">
                <span className="hero-stat-value">{stats.clearedCount}<span className="hero-stat-unit">/{revolutions.length}</span></span>
                <span className="hero-stat-label">클리어한 혁명</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">⭐ {stats.totalStars}<span className="hero-stat-unit">/{stats.maxStars}</span></span>
                <span className="hero-stat-label">모은 별</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="map-frame">
            <RevolutionMap progress={progress} />
          </div>
          <p className="home-map-hint"><span aria-hidden="true">🧭</span> 지도의 핀을 눌러 바로 떠날 수 있어요</p>
        </div>
      </section>

      {/* 탐험 경로 */}
      <section className="journey" aria-labelledby="journey-heading">
        <h2 className="section-heading" id="journey-heading"><span aria-hidden="true">🚩</span> 탐험 경로</h2>
        <ol className="journey-path">
          {revolutions.map((rev, idx) => {
            const p = progress[rev.id]
            const cleared = p?.cleared
            return (
              <li key={rev.id} className={`journey-item ${cleared ? 'cleared' : ''}`}>
                <div className="journey-rail">
                  <span
                    className="journey-dot"
                    style={{ '--accent': rev.color }}
                    aria-label={cleared ? `${idx + 1}번째, 클리어함` : `${idx + 1}번째`}
                  >
                    {cleared ? '✓' : idx + 1}
                  </span>
                </div>
                <Link
                  to={`/stage/${rev.id}`}
                  className="journey-card"
                  style={{ '--accent': rev.color }}
                >
                  <div className="journey-banner" style={{ '--accent': rev.color }}>
                    <span className="journey-emoji" aria-hidden="true">{rev.emoji}</span>
                    <span className="journey-year">{rev.year}년</span>
                  </div>
                  <div className="journey-body">
                    <h3 className="journey-title">{rev.title}</h3>
                    <p className="journey-summary">{rev.summary}</p>
                    <div className="journey-foot">
                      <Stars count={p?.bestStars || 0} size="sm" />
                      <span className="journey-go">{cleared ? '다시 복습 →' : '학습하러 가기 →'}</span>
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      </section>

      <footer className="home-footer">
        <button className="btn btn-ghost" onClick={() => {
          if (window.confirm('모든 진행 기록을 초기화할까요?')) resetProgress()
        }}>
          기록 초기화
        </button>
      </footer>
    </div>
  )
}
