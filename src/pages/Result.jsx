import { useEffect, useRef } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getRevolutionById } from '../data/revolutions.js'
import { useProgressContext } from '../ProgressContext.jsx'
import Stars from '../components/Stars.jsx'

export default function Result() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const rev = getRevolutionById(id)
  const { saveResult } = useProgressContext()
  const saved = useRef(false)

  // 결과 저장 (최초 1회)
  useEffect(() => {
    if (rev && state && !saved.current) {
      saved.current = true
      saveResult(rev.id, { stars: state.stars, score: state.score })
    }
  }, [rev, state, saveResult])

  if (!rev) return <Navigate to="/" replace />
  // 퀴즈를 거치지 않고 직접 들어온 경우
  if (!state) return <Navigate to={`/stage/${id}`} replace />

  const { score, correctCount, total, stars } = state

  const message =
    stars === 3 ? '완벽해요! 역사 박사님! 🏅'
      : stars === 2 ? '잘했어요! 조금만 더!'
      : stars === 1 ? '좋은 시작이에요!'
      : '다시 복습해 볼까요?'

  const emoji = stars === 3 ? '🏆' : stars === 2 ? '🎉' : stars === 1 ? '👍' : '📚'

  return (
    <div className="result">
      <div className="result-emoji">{emoji}</div>
      <h2>{rev.title} 복습 완료!</h2>
      <div className="result-stars">
        <Stars count={stars} />
      </div>
      <p className="result-score">
        점수 ⭐ {score} · 정답 {correctCount}/{total}
      </p>
      <p>{message}</p>

      <div className="result-actions">
        <button className="btn btn-primary" onClick={() => navigate(`/quiz/${rev.id}`)}>
          🔁 다시 풀기
        </button>
        <button className="btn btn-map" onClick={() => navigate(`/stage/${rev.id}`)}>
          📖 다시 학습
        </button>
        <Link to="/" className="btn">🗺️ 지도로</Link>
      </div>
    </div>
  )
}
