import { Link, Navigate, useParams, useNavigate } from 'react-router-dom'
import { getRevolutionById } from '../data/revolutions.js'

export default function Stage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const rev = getRevolutionById(id)

  if (!rev) return <Navigate to="/" replace />

  return (
    <div className="stage">
      <div className="page-top">
        <Link to="/" className="back-link">← 지도</Link>
      </div>

      <div className="stage-hero" style={{ background: rev.color }}>
        <div className="stage-hero-emoji">{rev.emoji}</div>
        <h2>{rev.title}</h2>
        <p>{rev.summary}</p>
      </div>

      {rev.sections.map((s) => (
        <div key={s.label} className="section-block card">
          <span className="section-label">{s.label}</span>
          <p className="section-text">{s.text}</p>
        </div>
      ))}

      <h3 className="block-title">👤 핵심 인물</h3>
      <div className="figures">
        {rev.figures.map((f) => (
          <div key={f.name} className="figure-card">
            <div className="figure-avatar">👤</div>
            <div>
              <p className="figure-name">{f.name}</p>
              <p className="figure-role">{f.role}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="block-title">🕑 연표</h3>
      <ul className="timeline card">
        {rev.timeline.map((t) => (
          <li key={t.year + t.event}>
            <span className="timeline-year">{t.year}</span>
            <span className="timeline-event">{t.event}</span>
          </li>
        ))}
      </ul>

      <div className="stage-cta">
        <button className="btn btn-primary" onClick={() => navigate(`/quiz/${rev.id}`)}>
          🎯 복습 퀴즈 시작!
        </button>
      </div>
    </div>
  )
}
