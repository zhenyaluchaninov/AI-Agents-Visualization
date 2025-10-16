import { useNavigate } from 'react-router-dom';

export default function Insights() {
  const navigate = useNavigate();

  return (
    <main style={{ padding: '3rem', textAlign: 'center' }}>
      <h1>Insights</h1>
      <p>Review key takeaways and synthesized perspectives from the discussion.</p>
      <button type="button" onClick={() => navigate('/scenarios')} style={{ marginTop: '2rem' }}>
        Continue
      </button>
    </main>
  );
}
