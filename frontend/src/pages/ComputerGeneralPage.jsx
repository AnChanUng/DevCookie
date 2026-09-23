import { COMIL } from '../data/examQuestions';
import { CompanyExam } from './ExamCompanyPage';

const BACK = { to: '/exam', label: '← 기업별 기출문제' };

// 컴퓨터일반 문제은행. 회사별 기출문제와 같은 풀이 화면(모의고사 · 영역별 연습 · 오답 · 북마크)을 쓴다
export default function ComputerGeneralPage() {
  return <CompanyExam company={COMIL} back={BACK} />;
}
