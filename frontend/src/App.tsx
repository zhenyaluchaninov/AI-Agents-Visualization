import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Screen1 from './pages/Screen1/Screen1';
import Screen2 from './pages/Screen2/Screen2';
import Screen3 from './pages/Screen3/Screen3';
import Team from './pages/Team';
import Discussion from './pages/Discussion';
import Insights from './pages/Insights';
import Scenarios from './pages/Scenarios';

export default function App() {
  const [debugOpen, setDebugOpen] = useState(true);
  const [screen3DevControls, setScreen3DevControls] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (screen: 'screen1' | 'screen2' | 'screen3') => {
    const path = screen === 'screen1' ? '/' : screen === 'screen2' ? '/screen2' : '/screen3';
    navigate(path);
  };
  const buttonStyle = (active: boolean) => ({
    background: 'none',
    border: 'none',
    color: active ? '#111' : '#333',
    textAlign: 'left' as const,
    cursor: 'pointer',
    padding: 0,
    fontWeight: active ? 700 : 500
  });

  const debugNav = (
    <div
      style={{
        position: 'fixed', left: 10, top: 10, zIndex: 99999,
        width: 220, borderRadius: 10,
        background: 'rgba(255,255,255,0.9)', boxShadow: '0 6px 22px rgba(0,0,0,.12)',
        border: '1px solid rgba(0,0,0,.08)', overflow: 'hidden',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial',
        fontSize: 12, color: '#333', userSelect: 'none'
      }}
    >
      <div
        onClick={() => setDebugOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 10px', fontWeight: 700, cursor: 'pointer',
          background: 'linear-gradient(135deg,#eef1ff,#f6f7ff)',
          borderBottom: '1px solid rgba(0,0,0,.06)'
        }}
      >
        <span>Screens (debug)</span>
        <span style={{ opacity: .6 }}>{debugOpen ? '▾' : '▸'}</span>
      </div>
      {debugOpen && (
        <div style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <button onClick={() => goTo('screen1')} style={buttonStyle(location.pathname === '/')}>Screen_1</button>
            <button onClick={() => goTo('screen2')} style={buttonStyle(location.pathname === '/screen2')}>Screen_2</button>
            <button onClick={() => goTo('screen3')} style={buttonStyle(location.pathname === '/screen3')}>Screen_3</button>
          </div>
          <div style={{ height: 1, background: 'rgba(0,0,0,.06)', margin: '6px 0' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={screen3DevControls} onChange={(e) => setScreen3DevControls(e.target.checked)} />
            <span>Screen3: Dev Controls</span>
          </label>
        </div>
      )}
    </div>
  );

  return (
    <>
      {debugNav}
      <Routes>
        <Route path="/" element={<Screen1 />} />
        <Route path="/screen2" element={<Screen2 />} />
        <Route path="/screen3" element={<Screen3 devControlsEnabled={screen3DevControls} />} />
        <Route path="/team" element={<Team />} />
        <Route path="/discussion" element={<Discussion />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
