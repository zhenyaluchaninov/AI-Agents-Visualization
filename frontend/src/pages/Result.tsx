import { Link } from 'react-router-dom';

export default function Result() {
  return (
    <main style={{ padding: '48px', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 16 }}>Shared view & next steps</h1>
      <p style={{ maxWidth: 720, lineHeight: 1.6 }}>
        Here we show a narrative summary, two expert voices, one dissent, and a short action
        list.
      </p>
      <div style={{ marginTop: 24 }}>
        <Link to="/">Back to start</Link>
      </div>
    </main>
  );
}
