import React from 'react';
import { Link } from 'react-router-dom';

export default function Profile() {
  return (
    <main style={{ padding: '48px', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ marginBottom: 16 }}>Enter your name</h1>
      <input placeholder="enter your name" style={{ padding: 8, fontSize: 16 }} />
      <div style={{ marginTop: 24 }}>
        <Link to="/problem">Next →</Link>
      </div>
    </main>
  );
}
