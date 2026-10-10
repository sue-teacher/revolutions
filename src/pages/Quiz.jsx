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
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrong, setWrong] = useState([]) // 틀린 문제의 인덱스 목록

  // 문제별 채점 기록. answers[i] = { answered, correct, selected }
  // selected: mcq/ox의 선택지 인덱스(되돌아보기에서 하이라이트 복원용)
  const [answers, setAnswers] = useState(() => questions.map(() => null))

  // 현재 선택형 임시 선택값(아직 채점 전)
  const [selected, setSelected] = useState(null)
  // order/match 자식이 올려주는 현재 상태
  const [subAnswer, setSubAnswer] = useState({ correct: false, ready: false })

  const handleSubReady = useCallback((_value, correct, ready = true) => {
    setSubAnswer({ correct, ready })
  }, [])

  if (!rev) return <Navigate to="/" replace />

  const q = questions[index]
  const record = answers[index]
  const answered = !!record?.answered
  const isLast = index === questions.length - 1
  const allAnswered = answers.every((a) => a?.answered)

  // 채점 (각 문제 최초 1회만 점수/콤보/오답 반영)
  const commitResult = (isCorrect, selectedIndex = null) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = { answered: true, correct: isCorrect, selected: selectedIndex }
      return next
    })

    if (isCorrect) {
      const newCombo = combo + 1
      const bonus = (newCombo - 1) * 20
      setScore((s) => s + BASE_POINT + bonus)
      setCombo(newCombo)
      setCorrectCount((c) => c + 1)
    } else {
      setCombo(0)
      setWrong((w) => (w.includes(index) ? w : [...w, index]))
    }
  }

  const handleSelect = (choiceIndex, isCorrect) => {
    if (answered) return
    setSelected(choiceIndex)
    commitResult(isCorrect, choiceIndex)
  }

  const handleSubmit = () => {
    if (answered) return
    commitResult(subAnswer.correct)
  }

  const goTo = (targetIndex) => {
    setIndex(targetIndex)
    setSelected(null)
    setSubAnswer({ correct: false, ready: false })
  }

  const handlePrev = () => {
    if (index > 0) goTo(index - 1)
  }

  const handleNext = () => {
    if (!isLast) {
      goTo(index + 1)
      return
    }
    // 마지막 문제 + 모두 채점 완료 → 결과로
    const total = questions.length
    const ratio = correctCount / total
    const stars = ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0
    navigate(`/result/${rev.id}`, {
      state: { score, correctCount, total, stars, wrong },
      replace: true,
    })
  }

  const needsSubmit = q.type === 'order' || q.type === 'match'
  // 선택형은 되돌아보기 시 이전 선택을 복원해 하이라이트, 그 외엔 임시 선택값 사용
  const shownSelected = answered ? record.selected : selected
  // order/match는 재방문 시 섞인 배열을 복원할 수 없어 읽기 전용 요약으로 보여준다
  const reviewingInteractive = answered && needsSubmit

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
          <McqQuestion
            question={q}
            locked={answered}
            selected={shownSelected}
            onSelect={handleSelect}
          />
        )}

        {/* order/match: 처음 풀 땐 인터랙티브, 되돌아보기 땐 읽기전용 요약 */}
        {q.type === 'order' && !reviewingInteractive && (
          <OrderQuestion key={index} question={q} locked={answered} onReady={handleSubReady} />
        )}
        {q.type === 'match' && !reviewingInteractive && (
          <MatchQuestion key={index} question={q} locked={answered} onReady={handleSubReady} />
        )}
        {reviewingInteractive && (
          <div className="review-answer-box">
            {q.type === 'order' ? (
              <ol className="review-order">
                {q.items.map((it) => <li key={it}>{it}</li>)}
              </ol>
            ) : (
              <ul className="review-match">
                {q.pairs.map((p) => <li key={p.left}><strong>{p.left}</strong> — {p.right}</li>)}
              </ul>
            )}
            <p className="review-answer-note">정답 배열이에요. (되돌아보기는 읽기 전용입니다)</p>
          </div>
        )}

        {answered && (
          <div className={`feedback ${record.correct ? 'good' : 'bad'}`}>
            <p className="feedback-head">{record.correct ? '🎉 정답!' : '❌ 아쉬워요'}</p>
            <p className="feedback-text">{q.explain}</p>
          </div>
        )}
      </div>

      <div className="quiz-actions quiz-nav">
        <button
          className="btn btn-ghost"
          disabled={index === 0}
          onClick={handlePrev}
        >
          ← 이전 문제
        </button>

        <div className="quiz-nav-right">
          {!answered && needsSubmit && (
            <button className="btn btn-primary" disabled={!subAnswer.ready} onClick={handleSubmit}>
              제출하기
            </button>
          )}
          {answered && !isLast && (
            <button className="btn btn-primary" onClick={handleNext}>
              다음 문제 →
            </button>
          )}
          {answered && isLast && allAnswered && (
            <button className="btn btn-primary" onClick={handleNext}>
              결과 보기 →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
