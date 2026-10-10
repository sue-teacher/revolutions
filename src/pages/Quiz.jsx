import { useCallback, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { getRevolutionById } from '../data/revolutions.js'
import McqQuestion from '../components/questions/McqQuestion.jsx'
import OrderQuestion from '../components/questions/OrderQuestion.jsx'
import MatchQuestion from '../components/questions/MatchQuestion.jsx'

const TYPE_LABEL = {
  mcq: '사지선다',
  ox: 'O / X',
  order: '순서 맞추기',
  match: '짝 맞추기',
}

const BASE_POINT = 100

export default function Quiz() {
  const { id } = useParams()
  const navigate = useNavigate()
  const rev = getRevolutionById(id)

  const questions = useMemo(() => rev?.quiz ?? [], [rev])

  const [index, setIndex] = useState(0)
  const [locked, setLocked] = useState(false)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  // 선택형(mcq/ox) 상태
  const [selected, setSelected] = useState(null)
  const [lastCorrect, setLastCorrect] = useState(false)

  // order/match 는 자식이 현재 상태/정답여부를 올려준다
  const [subAnswer, setSubAnswer] = useState({ correct: false, ready: false })

  // order/match 자식에서 상태 보고 받기
  const handleSubReady = useCallback((_value, correct, ready = true) => {
    setSubAnswer({ correct, ready })
  }, [])

  if (!rev) return <Navigate to="/" replace />

  const q = questions[index]
  const isLast = index === questions.length - 1

  const commitResult = (isCorrect) => {
    setLocked(true)
    if (isCorrect) {
      const newCombo = combo + 1
      // 콤보 보너스: 연속 정답일수록 추가 점수
      const bonus = (newCombo - 1) * 20
      setScore((s) => s + BASE_POINT + bonus)
      setCombo(newCombo)
      setCorrectCount((c) => c + 1)
    } else {
      setCombo(0)
    }
  }

  // 선택형 즉시 채점
  const handleSelect = (choiceIndex, isCorrect) => {
    if (locked) return
    setSelected(choiceIndex)
    setLastCorrect(isCorrect)
    commitResult(isCorrect)
  }

  // 제출 버튼(order/match)
  const handleSubmit = () => {
    if (locked) return
    setLastCorrect(subAnswer.correct)
    commitResult(subAnswer.correct)
  }

  const handleNext = () => {
    if (isLast) {
      const total = questions.length
      const ratio = correctCount / total
      const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0
      navigate(`/result/${rev.id}`, {
        state: { score, correctCount, total, stars },
        replace: true,
      })
      return
    }
    setIndex((i) => i + 1)
    setLocked(false)
    setSelected(null)
    setSubAnswer({ correct: false, ready: false })
  }

  const needsSubmit = q.type === 'order' || q.type === 'match'

  return (
    <div className="quiz">
      <div className="page-top">
        <Link to={`/stage/${rev.id}`} className="back-link">← 학습으로</Link>
      </div>

      <div className="quiz-top">
        <span className="quiz-progress-text">
          {index + 1} / {questions.length} 문제
        </span>
        {combo >= 2 && <span className="combo-badge">🔥 {combo} 콤보!</span>}
        <span className="quiz-score">⭐ {score}</span>
      </div>

      <div className="question-card card">
        <span className="question-type-tag">{TYPE_LABEL[q.type] || q.type}</span>
        <h2 className="question-text">{q.q}</h2>

        {(q.type === 'mcq' || q.type === 'ox') && (
          <McqQuestion question={q} locked={locked} selected={selected} onSelect={handleSelect} />
        )}
        {q.type === 'order' && (
          <OrderQuestion question={q} locked={locked} onReady={handleSubReady} />
        )}
        {q.type === 'match' && (
          <MatchQuestion question={q} locked={locked} onReady={handleSubReady} />
        )}

        {locked && (
          <div className={`feedback ${lastCorrect ? 'good' : 'bad'}`}>
            <p className="feedback-head">{lastCorrect ? '🎉 정답!' : '❌ 아쉬워요'}</p>
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
            {isLast ? '결과 보기 →' : '다음 문제 →'}
          </button>
        )}
      </div>
    </div>
  )
}
