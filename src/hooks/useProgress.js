import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'revolution-quest-progress-v1'

// 진도 데이터 구조
// {
//   [stageId]: { bestStars: 0~3, bestScore: number, cleared: boolean }
// }

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(loadProgress)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    } catch {
      // 저장 실패는 무시 (사생활 보호 모드 등)
    }
  }, [progress])

  // 스테이지 결과 저장: 더 좋은 기록만 갱신
  const saveResult = useCallback((stageId, { stars, score }) => {
    setProgress((prev) => {
      const current = prev[stageId] || { bestStars: 0, bestScore: 0, cleared: false }
      return {
        ...prev,
        [stageId]: {
          bestStars: Math.max(current.bestStars, stars),
          bestScore: Math.max(current.bestScore, score),
          cleared: true,
        },
      }
    })
  }, [])

  const resetProgress = useCallback(() => setProgress({}), [])

  return { progress, saveResult, resetProgress }
}

// 전체 진행 통계 계산 (컴포넌트 밖에서도 사용 가능)
export function summarize(progress, totalStages) {
  const clearedCount = Object.values(progress).filter((p) => p.cleared).length
  const totalStars = Object.values(progress).reduce((sum, p) => sum + (p.bestStars || 0), 0)
  const percent = totalStages ? Math.round((clearedCount / totalStages) * 100) : 0
  return { clearedCount, totalStars, maxStars: totalStages * 3, percent }
}
