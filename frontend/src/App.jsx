import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import './App.css';
import './exam.css';

const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const QuestionPage = lazy(() => import('./pages/QuestionPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const InterviewPracticePage = lazy(() => import('./pages/InterviewPracticePage'));
const MajorPage = lazy(() => import('./pages/MajorPage'));
const MajorExamPage = lazy(() => import('./pages/MajorExamPage'));
const ExamListPage = lazy(() => import('./pages/ExamListPage'));
const ExamCompanyPage = lazy(() => import('./pages/ExamCompanyPage'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="category/:slug" element={<CategoryPage />} />
            <Route path="question/:id" element={<QuestionPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="interview" element={<InterviewPracticePage />} />
            <Route path="major" element={<MajorPage />} />
            <Route path="major-exam" element={<MajorExamPage />} />
            <Route path="exam" element={<ExamListPage />} />
            <Route path="exam/:company" element={<ExamCompanyPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
