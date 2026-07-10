import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { UserProvider } from '@/contexts/UserContext'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { TaskProvider } from '@/contexts/TaskContext'
import AppLayout from '@/components/layout/AppLayout'
import GlobalLoader from '@/components/ui/GlobalLoader'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import ProjectDetails from '@/pages/ProjectDetails'
import Members from '@/pages/Members'
import UserManagement from '@/pages/UserManagement'
import Settings from '@/pages/Settings'
import NotFound from '@/pages/NotFound'
import { hasPermission } from '@/utils/permissions'

function ProtectedRoute({ children, permission }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface-subtle">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (permission && !hasPermission(user.role, permission)) return <Navigate to="/dashboard" replace />

  return children
}

function AppProviders({ children }) {
  return (
    <UserProvider>
      <ProjectProvider>
        <TaskProvider>
          {children}
        </TaskProvider>
      </ProjectProvider>
    </UserProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalLoader />
      <NotificationProvider>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<PublicRoute />} />

            {/* Protected — wrapped in providers + app shell */}
            <Route element={
              <ProtectedRoute>
                <AppProviders>
                  <AppLayout />
                </AppProviders>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects"  element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetails />} />
              <Route path="/members"   element={<Members />} />
              <Route path="/users"     element={
                <ProtectedRoute permission="user:manage">
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="/settings"  element={<Settings />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  )
}

function PublicRoute() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return <Login />
}
