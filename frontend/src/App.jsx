import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import './App.css';
import './exam.css';

const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const QuestionPage = lazy(() => import('./pages/QuestionPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const InterviewPracticePage = lazy(() => import('./pages/InterviewPracticePage'));
const CsNotesPage = lazy(() => import('./pages/CsNotesPage'));
const MajorPage = lazy(() => import('./pages/MajorPage'));
const MajorExamPage = lazy(() => import('./pages/MajorExamPage'));
const ExamListPage = lazy(() => import('./pages/ExamListPage'));
const ExamCompanyPage = lazy(() => import('./pages/ExamCompanyPage'));
const ComputerGeneralPage = lazy(() => import('./pages/ComputerGeneralPage'));
const TopicPage = lazy(() => import('./pages/TopicPage'));
const AlgoPage = lazy(() => import('./pages/AlgoPage'));
const DuelPage = lazy(() => import('./pages/DuelPage'));
const CalcPage = lazy(() => import('./pages/CalcPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const NcsPage = lazy(() => import('./pages/NcsPage'));
const WeakPage = lazy(() => import('./pages/WeakPage'));
const SsafyPage = lazy(() => import('./pages/SsafyPage'));
const AptitudePage = lazy(() => import('./pages/AptitudePage'));
const CosProPage = lazy(() => import('./pages/CosProPage'));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="question/:id" element={<QuestionPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="interview" element={<InterviewPracticePage />} />
          <Route path="notes" element={<CsNotesPage />} />
          <Route path="major" element={<MajorPage />} />
          <Route path="major/:company" element={<ExamCompanyPage />} />
          <Route path="major-exam" element={<MajorExamPage />} />
          <Route path="exam" element={<ExamListPage />} />
          <Route path="exam/category/:category" element={<ExamListPage />} />
          <Route path="exam/:company" element={<ExamCompanyPage />} />
          <Route path="ssafy" element={<SsafyPage />} />
          <Route path="ssafy/:company" element={<ExamCompanyPage />} />
          <Route path="aptitude" element={<AptitudePage />} />
          <Route path="aptitude/:company" element={<ExamCompanyPage />} />
          <Route path="aptitude/daou/cospro" element={<CosProPage />} />
          <Route path="aptitude/daou/cospro/:pid" element={<CosProPage />} />
          <Route path="computer-general" element={<ComputerGeneralPage />} />
          <Route path="topics" element={<TopicPage />} />
          <Route path="algo" element={<AlgoPage />} />
          <Route path="calc" element={<CalcPage />} />
          <Route path="duel" element={<DuelPage />} />
          <Route path="duel/:code" element={<DuelPage />} />
          <Route path="ncs" element={<NcsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="weak" element={<WeakPage />} />
          <Route path="admin/cu" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
