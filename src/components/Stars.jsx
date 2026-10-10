// 별점 표시 (0~3)
export default function Stars({ count = 0, size = 'md' }) {
  const cls = size === 'sm' ? 'stars stars-sm' : 'stars'
  return (
    <span className={cls} aria-label={`별 ${count}개`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={i < count ? 'star on' : 'star'}>
          ★
        </span>
      ))}
    </span>
  )
}
