import { useNavigate } from 'react-router-dom';

export default function Team() {
  const navigate = useNavigate();

  return (
    <main style={{ padding: '3rem', textAlign: 'center' }}>
      <h1>Team Assembly</h1>
      <p>Select the right mix of AI agents to tackle the challenge.</p>
      <button type="button" onClick={() => navigate('/discussion')} style={{ marginTop: '2rem' }}>
        Continue
      </button>
    </main>
  );
}
