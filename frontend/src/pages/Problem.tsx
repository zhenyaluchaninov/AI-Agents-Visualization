import { Link } from 'react-router-dom';

export default function Problem() {
  return (
    <main style={{ padding: '48px', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 16 }}>Pick a problem</h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
        This screen shows 2-3 narrative problem cards (hospital, transit, etc.). Pick one to continue.
      </p>
      <div style={{ marginTop: 24 }}>
        <Link to="/loading">Next -></Link>
      </div>
    </main>
  );
}
