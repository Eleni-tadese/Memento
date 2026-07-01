import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

const Home = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50" id="home-view">
      <h1 className="text-3xl font-bold text-gray-800">Memento Home</h1>
    </main>
  )
}

const Login = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50" id="login-view">
      <h1 className="text-3xl font-bold text-gray-800">Login</h1>
    </main>
  )
}

const Signup = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50" id="signup-view">
      <h1 className="text-3xl font-bold text-gray-800">Signup</h1>
    </main>
  )
}

const Dashboard = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50" id="dashboard-view">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
    </main>
  )
}

const JoinPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50" id="join-view">
      <h1 className="text-3xl font-bold text-gray-800">Join Page</h1>
    </main>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/join/:token" element={<JoinPage />} />
      </Routes>
    </Router>
  )
}
