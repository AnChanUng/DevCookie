import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import QuestionPage from './pages/QuestionPage';
import StatsPage from './pages/StatsPage';
import InterviewPracticePage from './pages/InterviewPracticePage';
import MajorPage from './pages/MajorPage';
import MajorExamPage from './pages/MajorExamPage';
import ExamListPage from './pages/ExamListPage';
import ExamCompanyPage from './pages/ExamCompanyPage';
import './App.css';
import './exam.css';

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
