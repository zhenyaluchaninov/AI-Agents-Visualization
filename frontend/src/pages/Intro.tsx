import { useNavigate } from 'react-router-dom';

export default function Intro() {
  const navigate = useNavigate();

  return (
    <main style={{ padding: '3rem', textAlign: 'center' }}>
      <h1>Introduction &amp; Setup</h1>
      <p>Get ready to explore how AI agents collaborate.</p>
      <button type="button" onClick={() => navigate('/team')} style={{ marginTop: '2rem' }}>
        Continue
      </button>
    </main>
  );
}
