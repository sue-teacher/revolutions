import { Link, useNavigate } from 'react-router-dom'
import { revolutions } from '../data/revolutions.js'
import { summarize, collectWrong } from '../hooks/useProgress.js'
import { useProgressContext } from '../ProgressContext.jsx'
import Stars from '../components/Stars.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import RevolutionMap from '../components/RevolutionMap.jsx'

export default function Home() {
  const navigate = useNavigate()
  const { progress, resetProgress } = useProgressContext()
  const stats = summarize(progress, revolutions.length)
  const wrongCount = collectWrong(progress).length
  const reviewUnlocked = stats.percent >= 100

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="home-title">
          <span className="home-title-emoji">🗺️</span> 표선 혁명 탐험대
        </h1>
        <p className="home-subtitle">역사1 · 국민 국가의 형성 복습 게임</p>
      </header>

      {/* 통계(클리어 스테이지·모은 별)를 지도 위에 배치 */}
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
        </div>
        <ProgressBar percent={stats.percent} />
      </section>

      {/* OSM 지도를 홈 메인에 바로 노출 */}
      <section className="home-map-section">
        <RevolutionMap progress={progress} />
        <p className="home-map-hint">🧭 지도의 핀을 눌러 각 사건이 일어난 곳으로 떠나 보세요.</p>
      </section>

      {/* 탭: 스테이지 / 틀린 문제 다시보기 / 혁명 매칭 게임 */}
      <nav className="home-tabs">
        <span className="home-tab active">📚 스테이지</span>
        <button
          className={`home-tab ${reviewUnlocked ? 'unlocked' : 'locked'}`}
          disabled={!reviewUnlocked}
          onClick={() => reviewUnlocked && navigate('/review')}
          title={reviewUnlocked ? '틀린 문제를 다시 풀어요' : '모든 스테이지를 클리어하면 열려요'}
        >
          🔁 틀린 문제 다시보기
          {reviewUnlocked
            ? wrongCount > 0 ? ` (${wrongCount})` : ' ✓'
            : ' 🔒'}
        </button>
        <button
          className="home-tab game"
          onClick={() => navigate('/match-game')}
          title="설명과 혁명 이름을 연결하는 복습 게임"
        >
          🧩 혁명 매칭 게임
        </button>
      </nav>

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
