import { NCS } from '../data/examQuestions';
import { CompanyExam } from './ExamCompanyPage';

const BACK = { to: '/', label: '← 홈으로' };

// NCS 직업기초능력 문제은행. 회사별 기출문제와 같은 풀이 화면을 쓴다
export default function NcsPage() {
  return <CompanyExam company={NCS} back={BACK} />;
}
