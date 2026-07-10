import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import Toast from './components/Toast'

import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import JoinPage from './pages/JoinPage'
import MemoriesPage from './pages/MemoriesPage'
import UploadMemory from './pages/UploadMemory'
import EditMemory from './pages/EditMemory'
import MemoryDetail from './pages/MemoryDetail'
import Profile from './pages/Profile'
import Timeline from './pages/Timeline'
import Letters from './pages/Letters'

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <ToastProvider>
            <Toast />
            <Routes>
              {/* Guest Only Routes — logged-in users are redirected to /dashboard */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>

              {/* Public Route (open to everyone, no redirect) */}
              <Route path="/join/:token" element={<JoinPage />} />

              {/* Authenticated Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/memories" element={<MemoriesPage />} />
                <Route path="/memories/new" element={<UploadMemory />} />
                <Route path="/memories/:id/edit" element={<EditMemory />} />
                <Route path="/memories/:id" element={<MemoryDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/letters" element={<Letters />} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}
