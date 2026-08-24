import dotenv from 'dotenv';
import { createApp } from './app.js';
import { db } from './src/models/db.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;
const app = createApp();

// Start database and server
async function startServer() {
  try {
    await db.init();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 Node.js Express REST API Server is running!`);
      console.log(`📡 Local URL: http://localhost:${PORT}`);
      console.log(`🔗 API Base:  http://localhost:${PORT}/api`);
      console.log(`📖 OpenAPI:   http://localhost:${PORT}/api/docs/openapi.json`);
      console.log(`📬 Postman:   http://localhost:${PORT}/api/docs/postman.json`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start backend server:', error);
    process.exit(1);
  }
}

startServer();
