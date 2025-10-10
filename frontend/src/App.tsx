import { Routes, Route, NavLink } from 'react-router-dom';
import Profile from './pages/Profile';
import Problem from './pages/Problem';
import Loading from './pages/Loading';
import Team from './pages/Team';
import Result from './pages/Result';

export default function App() {
  const linkStyle: React.CSSProperties = { marginRight: 12, textDecoration: 'none' };

  return (
    <div>
      <nav style={{ padding: 16 }}>
        <NavLink to="/" style={linkStyle}>Profile</NavLink>
        <NavLink to="/problem" style={linkStyle}>Problem</NavLink>
        <NavLink to="/loading" style={linkStyle}>Loading</NavLink>
        <NavLink to="/team" style={linkStyle}>Team</NavLink>
        <NavLink to="/result" style={linkStyle}>Result</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Profile />} />
        <Route path="/problem" element={<Problem />} />
        <Route path="/loading" element={<Loading />} />
        <Route path="/team" element={<Team />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </div>
  );
}
