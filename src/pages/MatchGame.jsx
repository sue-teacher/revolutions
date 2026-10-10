import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { revolutions } from '../data/revolutions.js'

// 혁명 매칭 게임
// 왼쪽: 혁명의 핵심 설명글 카드 / 오른쪽: 혁명 명칭 버튼
// 설명을 고른 뒤 명칭을 누르면 연결. 맞으면 초록으로 고정, 틀리면 흔들리며 해제.
// 여러 혁명을 섞어 두고 헷갈리지 않게 연결하는지 복습한다.

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// 게임용 쌍 데이터 생성: { id, title, emoji, color, clue }
function buildPairs() {
  return revolutions.map((r) => ({
    id: r.id,
    title: r.title,
    emoji: r.emoji,
    color: r.color,
    clue: r.matchClue || r.summary,
  }))
}

export default function MatchGame() {
  // 새 게임 시작마다 바뀌는 시드
  const [round, setRound] = useState(0)

  const pairs = useMemo(() => buildPairs(), [])
  const clues = useMemo(() => shuffle(pairs), [pairs, round]) // 왼쪽(설명) 순서
  const names = useMemo(() => shuffle(pairs), [pairs, round]) // 오른쪽(명칭) 순서

  const [selectedClue, setSelectedClue] = useState(null) // 선택된 설명 id
  const [matched, setMatched] = useState(() => new Set()) // 맞춘 id 집합
  const [mistakes, setMistakes] = useState(0)
  const [shakeName, setShakeName] = useState(null) // 틀렸을 때 흔들 명칭 id
  const [wrongPulse, setWrongPulse] = useState(false)

  const total = pairs.length
  const done = matched.size === total

  const pickClue = (id) => {
    if (matched.has(id)) return
    setSelectedClue((cur) => (cur === id ? null : id))
  }

  const pickName = (id) => {
    if (matched.has(id)) return
    if (selectedClue == null) {
      // 설명을 먼저 고르도록 안내 (명칭만 눌렀을 땐 무시)
      return
    }
    if (selectedClue === id) {
      // 정답!
      setMatched((prev) => new Set(prev).add(id))
      setSelectedClue(null)
    } else {
      // 오답
      setMistakes((m) => m + 1)
      setShakeName(id)
      setWrongPulse(true)
      setTimeout(() => {
        setShakeName(null)
        setWrongPulse(false)
      }, 500)
      setSelectedClue(null)
    }
  }

  const restart = () => {
    setMatched(new Set())
    setSelectedClue(null)
    setMistakes(0)
    setShakeName(null)
    setRound((r) => r + 1)
  }

  const rating =
    mistakes === 0 ? '완벽해요! 혁명을 완전히 꿰뚫었네요! 🏅'
      : mistakes <= 2 ? '훌륭해요! 거의 다 외웠어요!'
      : mistakes <= 5 ? '좋아요! 조금만 더 복습해 봐요.'
      : '헷갈리는 혁명이 있네요. 다시 도전!'

  return (
    <div className="match-game">
      <div className="page-top">
        <Link to="/" className="back-link">← 홈</Link>
      </div>

      <h2 style={{ textAlign: 'center', marginBottom: 4 }}>🧩 혁명 매칭 게임</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: 0 }}>
        왼쪽 설명을 고른 뒤, 알맞은 혁명 이름을 눌러 연결하세요.
      </p>

      <div className="mg-status">
        <span className="mg-chip">맞춤 {matched.size}/{total}</span>
        <span className={`mg-chip ${wrongPulse ? 'pulse-bad' : ''}`}>틀린 횟수 {mistakes}</span>
      </div>

      {done ? (
        <div className="result" style={{ paddingTop: 10 }}>
          <div className="result-emoji">{mistakes === 0 ? '🏆' : '🎉'}</div>
          <h3>모두 연결했어요!</h3>
          <p className="result-score">틀린 횟수 {mistakes}번</p>
          <p>{rating}</p>
          <div className="result-actions">
            <button className="btn btn-primary" onClick={restart}>🔁 다시 하기</button>
            <Link to="/" className="btn">🗺️ 홈으로</Link>
          </div>
        </div>
      ) : (
        <div className="mg-board">
          {/* 왼쪽: 설명글 */}
          <div className="mg-col">
            <h3 className="mg-col-title">설명</h3>
            {clues.map((c) => {
              const isMatched = matched.has(c.id)
              const isSelected = selectedClue === c.id
              return (
                <button
                  key={c.id}
                  className={`mg-clue ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}`}
                  style={isMatched ? { borderColor: c.color } : undefined}
                  disabled={isMatched}
                  onClick={() => pickClue(c.id)}
                >
                  {isMatched && <span className="mg-clue-tag">{c.emoji} {c.title}</span>}
                  <span className="mg-clue-text">{c.clue}</span>
                </button>
              )
            })}
          </div>

          {/* 오른쪽: 혁명 명칭 */}
          <div className="mg-col">
            <h3 className="mg-col-title">혁명 이름</h3>
            {names.map((n) => {
              const isMatched = matched.has(n.id)
              return (
                <button
                  key={n.id}
                  className={`mg-name ${isMatched ? 'matched' : ''} ${shakeName === n.id ? 'shake' : ''}`}
                  style={isMatched ? { background: n.color, borderColor: n.color, color: '#fff' } : undefined}
                  disabled={isMatched}
                  onClick={() => pickName(n.id)}
                >
                  {n.emoji} {n.title}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {!done && selectedClue == null && (
        <p className="mg-hint">👆 먼저 왼쪽 설명을 하나 고르세요.</p>
      )}
      {!done && selectedClue != null && (
        <p className="mg-hint">👉 이제 오른쪽에서 알맞은 혁명 이름을 누르세요.</p>
      )}
    </div>
  )
}
