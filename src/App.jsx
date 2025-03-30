import React from 'react'
import GitHub from './GitHub'
import SharedStatCard from './SharedStatCard'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GitHub />} />
        <Route path="/share/:statId" element={<SharedStatCard />} />
      </Routes>
    </Router>
  )
}

export default App