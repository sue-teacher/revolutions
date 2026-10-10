import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Stage from './pages/Stage.jsx'
import Quiz from './pages/Quiz.jsx'
import Result from './pages/Result.jsx'
import MapView from './pages/MapView.jsx'

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stage/:id" element={<Stage />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/result/:id" element={<Result />} />
        <Route path="/map" element={<MapView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
