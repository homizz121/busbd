const app = require('./app');
const { PORT } = require('./config/env');

const server = app.listen(PORT, () => {
  console.log(`🚌 BusBD API server running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
