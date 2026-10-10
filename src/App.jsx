import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Stage from './pages/Stage.jsx'
import Quiz from './pages/Quiz.jsx'
import Result from './pages/Result.jsx'
import Review from './pages/Review.jsx'
import MatchGame from './pages/MatchGame.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <ScrollToTop />
      <a className="skip-link" href="#main">본문으로 건너뛰기</a>
      <main id="main">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stage/:id" element={<Stage />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/review" element={<Review />} />
        <Route path="/match-game" element={<MatchGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </main>
    </div>
  )
}
