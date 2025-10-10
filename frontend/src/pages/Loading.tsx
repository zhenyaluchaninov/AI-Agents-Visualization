import { Link } from 'react-router-dom';

export default function Loading() {
  return (
    <main style={{ padding: '48px', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 16 }}>Creating thinking copies...</h1>
      <p>Spinning up context, drafting briefs, syncing voices...</p>
      <div style={{ marginTop: 24 }}>
        <Link to="/team">Continue -></Link>
      </div>
    </main>
  );
}
