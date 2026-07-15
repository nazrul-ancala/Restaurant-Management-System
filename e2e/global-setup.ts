async function globalSetup() {
  const backendUrl = process.env.E2E_BACKEND_URL || 'http://localhost:4000/health';
  try {
    const res = await fetch(backendUrl);
    if (!res.ok) throw new Error(`status ${res.status}`);
  } catch (err) {
    throw new Error(
      `Backend not reachable at ${backendUrl}. Start Postgres + backend before running e2e tests ` +
      `(docker-compose up -d postgres && cd backend && npm run dev). Original error: ${err}`
    );
  }
}

export default globalSetup;
