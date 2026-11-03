import { Navigate, useLocation } from 'react-router-dom';
export default function PracticeEntry({ suffix = '' }) {
  const { search, hash } = useLocation();
  return <Navigate to={`/p/7b92e1c4-a6d8-4f03-9c51-26de8a740bf9${suffix}${search}${hash}`} replace />;
}
