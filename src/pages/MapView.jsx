import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { revolutions } from '../data/revolutions.js'
import { useProgressContext } from '../ProgressContext.jsx'

// 간략화한 세계 지도 위에 각 혁명/통일 지역을 핀으로 표시.
// 지리적으로 정밀한 지도가 아니라, 중2가 "어디서 일어났는지" 직관적으로
// 파악하도록 대륙 블록 + 위치 핀으로 구성한 학습용 지도.

// viewBox 0 0 100 60 기준 좌표(%)
const REGION_POS = {
  usa: { x: 20, y: 20 },
  haiti: { x: 27, y: 31 },
  latin: { x: 31, y: 46 },
  britain: { x: 47, y: 15 },
  france: { x: 49, y: 20 },
  italy: { x: 52, y: 25 },
  germany: { x: 51.5, y: 17 },
}

// 대륙 블록(단순 도형)
const LAND = [
  { d: 'M8,10 L30,8 L34,22 L26,34 L14,32 L6,20 Z', name: '북아메리카' },
  { d: 'M26,36 L36,38 L34,54 L27,56 L24,46 Z', name: '남아메리카' },
  { d: 'M44,10 L58,9 L60,24 L50,30 L44,22 Z', name: '유럽' },
  { d: 'M48,30 L62,30 L64,48 L52,52 L47,40 Z', name: '아프리카' },
  { d: 'M60,9 L92,10 L94,30 L66,30 L60,22 Z', name: '아시아' },
]

export default function MapView() {
  const navigate = useNavigate()
  const { progress } = useProgressContext()
  const [hover, setHover] = useState(null)

  return (
    <div className="map-page">
      <div className="page-top">
        <Link to="/" className="back-link">← 지도(홈)</Link>
      </div>

      <h2>🌍 혁명 지도</h2>
      <p style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: 0 }}>
        핀을 눌러 각 사건이 일어난 곳으로 떠나 보세요.
      </p>

      <div className="map-legend">
        <span className="map-legend-item">
          <span className="map-legend-dot" style={{ background: 'var(--good)' }} /> 클리어함
        </span>
        <span className="map-legend-item">
          <span className="map-legend-dot" style={{ background: 'var(--accent)' }} /> 아직 안 함
        </span>
      </div>

      <div className="map-wrap">
        <svg viewBox="0 0 100 60" width="100%" role="img" aria-label="혁명 세계 지도">
          <rect x="0" y="0" width="100" height="60" fill="#15306b" rx="2" />
          {LAND.map((land) => (
            <path key={land.name} d={land.d} fill="#2f6f4f" stroke="#2a5a42" strokeWidth="0.4" />
          ))}

          {revolutions.map((rev) => {
            const pos = REGION_POS[rev.region]
            if (!pos) return null
            const cleared = progress[rev.id]?.cleared
            return (
              <g
                key={rev.id}
                className="map-region"
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => navigate(`/stage/${rev.id}`)}
                onMouseEnter={() => setHover(rev)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(rev)}
                tabIndex={0}
                role="button"
                aria-label={`${rev.title} (${rev.year}년)`}
              >
                <circle
                  r="2.6"
                  fill={cleared ? 'var(--good)' : 'var(--accent)'}
                  stroke="#0f1535"
                  strokeWidth="0.5"
                />
                <text x="0" y="0.9" textAnchor="middle" fontSize="2.6">
                  {cleared ? '✓' : '!'}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <div className="map-tooltip">
        {hover ? (
          <span>
            {hover.emoji} <strong>{hover.title}</strong> · {hover.year}년 — {hover.summary}
          </span>
        ) : (
          '지역 핀 위에 마우스를 올리거나 눌러 보세요.'
        )}
      </div>
    </div>
  )
}
