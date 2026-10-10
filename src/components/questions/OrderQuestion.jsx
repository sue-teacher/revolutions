import { useMemo, useState, useEffect } from 'react'

// 연표/사건 순서 맞추기
// question.items 가 정답 순서. 셔플해서 보여주고 위/아래로 이동해 맞춘다.
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  // 혹시 원래 순서와 동일하면 한 번 더 섞기 (너무 쉬워지는 것 방지)
  if (a.length > 1 && a.every((v, idx) => v === arr[idx])) {
    ;[a[0], a[1]] = [a[1], a[0]]
  }
  return a
}

export default function OrderQuestion({ question, locked, onReady }) {
  const initial = useMemo(() => shuffle(question.items), [question])
  const [order, setOrder] = useState(initial)

  // 현재 배열이 정답과 일치하는지 상위로 전달
  useEffect(() => {
    const correct = order.every((v, i) => v === question.items[i])
    onReady(order, correct)
  }, [order, question, onReady])

  const move = (index, dir) => {
    if (locked) return
    const target = index + dir
    if (target < 0 || target >= order.length) return
    const next = [...order]
    ;[next[index], next[target]] = [next[target], next[index]]
    setOrder(next)
  }

  return (
    <div className="order-list">
      {order.map((item, i) => {
        const correctHere = locked && item === question.items[i]
        const wrongHere = locked && item !== question.items[i]
        return (
          <div
            key={item}
            className="order-item"
            style={
              correctHere
                ? { outline: '2px solid var(--good)' }
                : wrongHere
                ? { outline: '2px solid var(--bad)' }
                : undefined
            }
          >
            <span className="timeline-year">{i + 1}</span>
            <span className="order-item-text">{item}</span>
            <span className="order-controls">
              <button className="order-btn" disabled={locked || i === 0} onClick={() => move(i, -1)}>
                ▲
              </button>
              <button
                className="order-btn"
                disabled={locked || i === order.length - 1}
                onClick={() => move(i, 1)}
              >
                ▼
              </button>
            </span>
          </div>
        )
      })}
    </div>
  )
}
