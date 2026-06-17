import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import Login from './pages/Login'
import VacanciesPage from './pages/VacanciesPage'
import ApplicationsPage from './pages/ApplicationsPage'
import ProjectsPage from './pages/ProjectsPage'
import ReelsPage from './pages/ReelsPage'
import PartnersPage from './pages/PartnersPage'
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
        <Route path="/vacancies/applications" element={<ApplicationsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/reels" element={<ReelsPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/leads" element={<LeadsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/vacancies" replace />} />
      <Route path="*" element={<Navigate to="/vacancies" replace />} />
    </Routes>
  )
}
