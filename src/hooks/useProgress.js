import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'revolution-quest-progress-v2'

// 진도 데이터 구조
// {
//   [stageId]: {
//     bestStars: 0~3,
//     bestScore: number,
//     cleared: boolean,
//     wrong: number[]   // 가장 최근 플레이에서 틀린 문제의 인덱스 목록
//   }
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

  // 스테이지 결과 저장
  // - 별/점수는 더 좋은 기록만 갱신
  // - 틀린 문제 목록(wrong)은 가장 최근 플레이 기준으로 덮어씀
  const saveResult = useCallback((stageId, { stars, score, wrong = [] }) => {
    setProgress((prev) => {
      const current = prev[stageId] || { bestStars: 0, bestScore: 0, cleared: false }
      return {
        ...prev,
        [stageId]: {
          bestStars: Math.max(current.bestStars, stars),
          bestScore: Math.max(current.bestScore, score),
          cleared: true,
          wrong,
        },
      }
    })
  }, [])

  // 복습 모드에서 틀린 문제를 다시 맞히면 해당 인덱스를 wrong 목록에서 제거
  const clearWrongItem = useCallback((stageId, qIndex) => {
    setProgress((prev) => {
      const current = prev[stageId]
      if (!current || !current.wrong) return prev
      return {
        ...prev,
        [stageId]: {
          ...current,
          wrong: current.wrong.filter((i) => i !== qIndex),
        },
      }
    })
  }, [])

  const resetProgress = useCallback(() => setProgress({}), [])

  return { progress, saveResult, clearWrongItem, resetProgress }
}

// 전체 진행 통계 계산 (컴포넌트 밖에서도 사용 가능)
export function summarize(progress, totalStages) {
  const clearedCount = Object.values(progress).filter((p) => p.cleared).length
  const totalStars = Object.values(progress).reduce((sum, p) => sum + (p.bestStars || 0), 0)
  const percent = totalStages ? Math.round((clearedCount / totalStages) * 100) : 0
  return { clearedCount, totalStars, maxStars: totalStages * 3, percent }
}

// 전체 틀린 문제를 [{ stageId, qIndex }] 형태로 모은다
export function collectWrong(progress) {
  const list = []
  Object.entries(progress).forEach(([stageId, p]) => {
    ;(p.wrong || []).forEach((qIndex) => list.push({ stageId, qIndex }))
  })
  return list
}
