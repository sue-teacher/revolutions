import { useMemo, useState, useEffect } from 'react'

// 인물-업적 등 짝 맞추기
// question.pairs: [{ left, right }]
// 왼쪽 항목마다 드롭다운으로 오른쪽 값을 고른다.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function MatchQuestion({ question, locked, onReady }) {
  const rightOptions = useMemo(() => shuffle(question.pairs.map((p) => p.right)), [question])
  const [picks, setPicks] = useState(() => question.pairs.map(() => ''))

  useEffect(() => {
    const allFilled = picks.every((p) => p !== '')
    const correct = allFilled && picks.every((val, i) => val === question.pairs[i].right)
    onReady(picks, correct, allFilled)
  }, [picks, question, onReady])

  const setPick = (i, val) => {
    if (locked) return
    setPicks((prev) => prev.map((p, idx) => (idx === i ? val : p)))
  }

  return (
    <div className="match-grid">
      {question.pairs.map((pair, i) => {
        const isCorrect = locked && picks[i] === pair.right
        return (
          <div className="match-row" key={pair.left}>
            <span className="match-left">{pair.left}</span>
            <select
              className="match-select"
              value={picks[i]}
              disabled={locked}
              onChange={(e) => setPick(i, e.target.value)}
              style={
                locked
                  ? { borderColor: isCorrect ? 'var(--good)' : 'var(--bad)' }
                  : undefined
              }
            >
              <option value="">선택하세요</option>
              {rightOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}
