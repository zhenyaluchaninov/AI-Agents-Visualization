import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Screen1 from './pages/Screen1/Screen1';
import Screen2 from './pages/Screen2/Screen2';
import Team from './pages/Team';
import Discussion from './pages/Discussion';
import Insights from './pages/Insights';
import Scenarios from './pages/Scenarios';

export default function App() {
  // TEMPORARY DEBUG NAV — remove later
  const [debugScreen, setDebugScreen] = useState<null | 'screen1' | 'screen2'>(null);

  const debugNav = (
    <div
      style={{
        position: 'fixed', left: 10, top: 10, zIndex: 99999,
        display: 'flex', flexDirection: 'column', gap: 6,
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial',
        fontSize: 12, color: '#555', userSelect: 'none'
      }}
    >
      <span style={{ opacity: 0.6 }}>Screens (debug)</span>
      <button
        onClick={() => setDebugScreen('screen1')}
        style={{ background: 'none', border: 'none', color: '#333', textAlign: 'left', cursor: 'pointer', padding: 0 }}
      >
        Screen_1
      </button>
      <button
        onClick={() => setDebugScreen('screen2')}
        style={{ background: 'none', border: 'none', color: '#333', textAlign: 'left', cursor: 'pointer', padding: 0 }}
      >
        Screen_2
      </button>
    </div>
  );

  // When a debug screen is selected, render it directly and bypass router
  if (debugScreen === 'screen1') {
    return (
      <>
        {debugNav}
        <Screen1 />
      </>
    );
  }
  if (debugScreen === 'screen2') {
    return (
      <>
        {debugNav}
        <Screen2 />
      </>
    );
  }

  // Default: normal routing
  return (
    <>
      {debugNav}
      <Routes>
        <Route path="/" element={<Screen1 />} />
        <Route path="/team" element={<Team />} />
        <Route path="/discussion" element={<Discussion />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/scenarios" element={<Scenarios />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
