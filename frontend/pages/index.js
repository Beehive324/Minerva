import React from 'react';

export default function Home() {
  const handleClick = async () => {
    const res = await fetch('http://localhost:8000/trigger', { method: 'POST' });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 100 }}>
      <h1>Next.js + FastAPI Example</h1>
      <button onClick={handleClick} style={{ padding: '10px 20px', fontSize: 18 }}>
        Trigger Backend
      </button>
    </div>
  );
}
