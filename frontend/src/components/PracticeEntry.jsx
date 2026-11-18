import { Navigate, useLocation } from 'react-router-dom';
export default function PracticeEntry({ suffix = '' }) {
  const { search, hash } = useLocation();
  const destination = suffix === '/companies' && (new URLSearchParams(search).has('version') || new URLSearchParams(search).has('view') || hash) ? '' : suffix;
  return <Navigate to={`/p/7b92e1c4-a6d8-4f03-9c51-26de8a740bf9${destination}${search}${hash}`} replace />;
}
