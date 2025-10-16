import { useNavigate } from 'react-router-dom';

export default function Discussion() {
  const navigate = useNavigate();

  return (
    <main style={{ padding: '3rem', textAlign: 'center' }}>
      <h1>Discussion Network</h1>
      <p>Observe how the assembled agents debate and exchange information.</p>
      <button type="button" onClick={() => navigate('/insights')} style={{ marginTop: '2rem' }}>
        Continue
      </button>
    </main>
  );
}
