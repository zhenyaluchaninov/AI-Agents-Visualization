import { Routes, Route, Navigate } from 'react-router-dom';
import Screen1 from './pages/Screen1/Screen1';
import Team from './pages/Team';
import Discussion from './pages/Discussion';
import Insights from './pages/Insights';
import Scenarios from './pages/Scenarios';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Screen1 />} />
      <Route path="/team" element={<Team />} />
      <Route path="/discussion" element={<Discussion />} />
      <Route path="/insights" element={<Insights />} />
      <Route path="/scenarios" element={<Scenarios />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
