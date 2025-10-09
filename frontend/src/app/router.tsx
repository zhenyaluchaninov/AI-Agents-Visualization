import { createBrowserRouter } from 'react-router-dom';
import Profile from '../pages/Profile';
import Problem from '../pages/Problem';
import Loading from '../pages/Loading';
import Team from '../pages/Team';
import Result from '../pages/Result';

export const router = createBrowserRouter([
  { path: '/', element: <Profile /> },
  { path: '/problem', element: <Problem /> },
  { path: '/loading', element: <Loading /> },
  { path: '/team', element: <Team /> },
  { path: '/result', element: <Result /> },
]);
