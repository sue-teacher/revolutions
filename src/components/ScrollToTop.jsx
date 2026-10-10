import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// 라우트가 바뀔 때마다 화면을 맨 위로 스크롤.
// (모바일에서 "학습하러 가기" 등으로 이동할 때 이전 스크롤 위치가 남아
//  페이지 하단이 먼저 보이는 문제를 방지)
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // 즉시 맨 위로 이동 (부드러운 애니메이션 없이)
    window.scrollTo(0, 0)
    // 일부 모바일 브라우저에서 document 스크롤 컨테이너가 다를 수 있어 보강
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [pathname])

  return null
}
