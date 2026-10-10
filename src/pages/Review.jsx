import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { revolutions, getRevolutionById } from '../data/revolutions.js'
import { summarize, collectWrong } from '../hooks/useProgress.js'
import { useProgressContext } from '../ProgressContext.jsx'
import McqQuestion from '../components/questions/McqQuestion.jsx'
import OrderQuestion from '../components/questions/OrderQuestion.jsx'
import MatchQuestion from '../components/questions/MatchQuestion.jsx'

const TYPE_LABEL = {
  mcq: '사지선다',
  ox: 'O / X',
  order: '순서 맞추기',
  match: '짝 맞추기',
}

export default function Review() {
  const { progress, clearWrongItem } = useProgressContext()
  const stats = summarize(progress, revolutions.length)

  // 복습 시작 시점의 틀린 문제 목록을 고정(스냅샷). 맞히면 하나씩 비워진다.
  const [queue] = useState(() => collectWrong(progress))
  const [pos, setPos] = useState(0)

  const [locked, setLocked] = useState(false)
  const [selected, setSelected] = useState(null)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [subAnswer, setSubAnswer] = useState({ correct: false, ready: false })
  const [solvedCount, setSolvedCount] = useState(0)

  const handleSubReady = useCallback((_v, correct, ready = true) => {
    setSubAnswer({ correct, ready })
  }, [])

  // 진도 100% 미만이면 접근 차단
  if (stats.percent < 100) return <Navigate to="/" replace />

  const current = queue[pos]
  const rev = current ? getRevolutionById(current.stageId) : null
  const q = rev ? rev.quiz[current.qIndex] : null
  const isLast = pos >= queue.length - 1

  // 틀린 문제가 애초에 없거나 모두 복습 완료한 경우
  const allDone = queue.length === 0 || pos >= queue.length

  const commit = (isCorrect) => {
    setLocked(true)
    setLastCorrect(isCorrect)
    if (isCorrect) {
      setSolvedCount((c) => c + 1)
      clearWrongItem(current.stageId, current.qIndex)
    }
  }

  const handleSelect = (choiceIndex, isCorrect) => {
    if (locked) return
    setSelected(choiceIndex)
    commit(isCorrect)
  }

  const handleSubmit = () => {
    if (locked) return
    commit(subAnswer.correct)
  }

  const handleNext = () => {
    setPos((p) => p + 1)
    setLocked(false)
    setSelected(null)
    setSubAnswer({ correct: false, ready: false })
  }

  const needsSubmit = q && (q.type === 'order' || q.type === 'match')

  return (
    <div className="review">
      <div className="page-top">
        <Link to="/" className="back-link">← 홈</Link>
      </div>

      <h2 style={{ textAlign: 'center' }}>🔁 틀린 문제 다시보기</h2>

      {allDone ? (
        <div className="result" style={{ paddingTop: 10 }}>
          <div className="result-emoji">{queue.length === 0 ? '🎊' : '✅'}</div>
          <p className="result-score">
            {queue.length === 0
              ? '틀린 문제가 없어요! 완벽합니다.'
              : `복습 완료! ${solvedCount}문제를 다시 맞혔어요.`}
          </p>
          <div className="result-actions">
            <Link to="/" className="btn btn-primary">🗺️ 홈으로</Link>
          </div>
        </div>
      ) : (
        <>
          <div className="quiz-top">
            <span className="quiz-progress-text">
              {pos + 1} / {queue.length} 문제
            </span>
            <span className="quiz-score">{rev.emoji} {rev.title}</span>
          </div>

          <div className="question-card card">
            <span className="question-type-tag">{TYPE_LABEL[q.type] || q.type}</span>
            <h2 className="question-text">{q.q}</h2>

            {(q.type === 'mcq' || q.type === 'ox') && (
              <McqQuestion question={q} locked={locked} selected={selected} onSelect={handleSelect} />
            )}
            {q.type === 'order' && (
              <OrderQuestion key={`${current.stageId}-${current.qIndex}`} question={q} locked={locked} onReady={handleSubReady} />
            )}
            {q.type === 'match' && (
              <MatchQuestion key={`${current.stageId}-${current.qIndex}`} question={q} locked={locked} onReady={handleSubReady} />
            )}

            {locked && (
              <div className={`feedback ${lastCorrect ? 'good' : 'bad'}`}>
                <p className="feedback-head">{lastCorrect ? '🎉 이제 맞혔어요!' : '❌ 다시 복습해요'}</p>
                <p className="feedback-text">{q.explain}</p>
              </div>
            )}
          </div>

          <div className="quiz-actions">
            {!locked && needsSubmit && (
              <button className="btn btn-primary" disabled={!subAnswer.ready} onClick={handleSubmit}>
                제출하기
              </button>
            )}
            {locked && (
              <button className="btn btn-primary" onClick={handleNext}>
                {isLast ? '복습 마치기 →' : '다음 문제 →'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
