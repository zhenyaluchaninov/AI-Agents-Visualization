import { Routes, Route, Navigate } from 'react-router-dom';
import Intro from './pages/Intro';
import Team from './pages/Team';
import Discussion from './pages/Discussion';
import Insights from './pages/Insights';
import Scenarios from './pages/Scenarios';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/team" element={<Team />} />
      <Route path="/discussion" element={<Discussion />} />
      <Route path="/insights" element={<Insights />} />
      <Route path="/scenarios" element={<Scenarios />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
