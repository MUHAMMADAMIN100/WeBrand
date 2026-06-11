import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import Login from './pages/Login'
import VacanciesPage from './pages/VacanciesPage'
import ProjectsPage from './pages/ProjectsPage'
import NewsPage from './pages/NewsPage'
import LeadsPage from './pages/LeadsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/vacancies" element={<VacanciesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/leads" element={<LeadsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/vacancies" replace />} />
      <Route path="*" element={<Navigate to="/vacancies" replace />} />
    </Routes>
  )
}
