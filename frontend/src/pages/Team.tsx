import { Link } from 'react-router-dom';

export default function Team() {
  return (
    <main style={{ padding: '48px', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 16 }}>Your specialized copies</h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
        A grid of 10 specialists derived from your profile (Economist, Engineer, etc.).
      </p>
      <div style={{ marginTop: 24 }}>
        <Link to="/result">Next -></Link>
      </div>
    </main>
  );
}
