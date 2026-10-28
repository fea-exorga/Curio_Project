import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { validateRuntimeConfig } from './config/security.js';

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    validateRuntimeConfig();
    await connectDB();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Curio API running on http://localhost:${PORT}`);
      console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('[Curio] Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      console.log('[Curio] SIGTERM received, gracefully shutting down...');
      server.close(() => {
        console.log('[Curio] Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('[Curio] Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
