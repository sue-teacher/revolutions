// 전체 진행률 바
export default function ProgressBar({ percent = 0 }) {
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-bar-fill" style={{ width: `${percent}%` }}>
        {percent > 10 && <span className="progress-bar-label">{percent}%</span>}
      </div>
    </div>
  )
}
