import { TOPICS } from '../data/topicBank';
import { CompanyExam } from './ExamCompanyPage';

const BACK = { to: '/exam', label: '← 기업별 기출문제' };

// 주제별 통합 문제집. 기업별 문제를 과목으로 다시 묶어 같은 풀이 화면으로 푼다
export default function TopicPage() {
  return <CompanyExam company={TOPICS} back={BACK} />;
}
