import { Link, useNavigate } from 'react-router-dom'
import { revolutions } from '../data/revolutions.js'
import { summarize } from '../hooks/useProgress.js'
import { useProgressContext } from '../ProgressContext.jsx'
import Stars from '../components/Stars.jsx'
import ProgressBar from '../components/ProgressBar.jsx'

export default function Home() {
  const navigate = useNavigate()
  const { progress, resetProgress } = useProgressContext()
  const stats = summarize(progress, revolutions.length)

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">
          <span className="home-title-emoji">🗺️</span> 혁명 탐험대
        </h1>
        <p className="home-subtitle">역사1 · 국민 국가의 형성 복습 게임</p>
      </header>

      <section className="home-stats card">
        <div className="home-stats-row">
          <div className="stat-box">
            <span className="stat-value">{stats.clearedCount}/{revolutions.length}</span>
            <span className="stat-label">클리어 스테이지</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">⭐ {stats.totalStars}/{stats.maxStars}</span>
            <span className="stat-label">모은 별</span>
          </div>
          <button className="btn btn-map" onClick={() => navigate('/map')}>
            🌍 지도 보기
          </button>
        </div>
        <ProgressBar percent={stats.percent} />
      </section>

      <section className="stage-map">
        {revolutions.map((rev, idx) => {
          const p = progress[rev.id]
          const cleared = p?.cleared
          return (
            <Link
              to={`/stage/${rev.id}`}
              key={rev.id}
              className={`stage-node ${cleared ? 'cleared' : ''}`}
              style={{ '--accent': rev.color }}
            >
              <div className="stage-node-number">{idx + 1}</div>
              <div className="stage-node-emoji">{rev.emoji}</div>
              <div className="stage-node-body">
                <h3 className="stage-node-title">{rev.title}</h3>
                <p className="stage-node-summary">{rev.summary}</p>
                <div className="stage-node-foot">
                  <Stars count={p?.bestStars || 0} size="sm" />
                  <span className="stage-node-year">{rev.year}년</span>
                </div>
              </div>
              {cleared && <span className="stage-node-badge">클리어!</span>}
            </Link>
          )
        })}
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
