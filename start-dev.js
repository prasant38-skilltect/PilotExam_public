import { spawn } from 'child_process';

// Start Express API server
console.log('🚀 Starting Express API server...');
const apiServer = spawn('tsx', ['server/index.ts'], {
  env: { ...process.env, NODE_ENV: 'development' },
  stdio: 'pipe'
});

apiServer.stdout.on('data', (data) => {
  process.stdout.write(`[API] ${data}`);
});

apiServer.stderr.on('data', (data) => {
  process.stderr.write(`[API ERROR] ${data}`);
});

// Wait a moment for API server to start, then start Next.js
setTimeout(() => {
  console.log('🔄 Starting Next.js frontend server...');
  const nextServer = spawn('next', ['dev'], {
    env: { ...process.env, PORT: '3000' },
    stdio: 'pipe'
  });

  nextServer.stdout.on('data', (data) => {
    process.stdout.write(`[NEXT] ${data}`);
  });

  nextServer.stderr.on('data', (data) => {
    process.stderr.write(`[NEXT ERROR] ${data}`);
  });

  nextServer.on('close', (code) => {
    console.log(`Next.js server exited with code ${code}`);
    apiServer.kill();
    process.exit(code);
  });

}, 2000);

apiServer.on('close', (code) => {
  console.log(`API server exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  apiServer.kill();
  process.exit(0);
});