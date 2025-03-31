import React from 'react'
import GitHub from './GitHub'
import SharedStatCard from './SharedStatCard'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/github" element={<GitHub/>} />
        <Route path="/share/:statId" element={<SharedStatCard />} />
      </Routes>
    </Router>
  )
}

export default App