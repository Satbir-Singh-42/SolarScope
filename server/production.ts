import { createServer } from './index.js';
import { registerRoutes } from './routes.js';
import { serveStatic } from './vite.js';

export async function startProductionServer() {
  const app = createServer();
  
  // Register API routes first
  const server = await registerRoutes(app);
  
  // Setup static file serving for production
  serveStatic(app);
  
  const port = process.env.PORT || 10000;
  const host = '0.0.0.0';
  
  server.listen(port, host, () => {
    console.log(`🚀 SolarScope AI server running on port ${port}`);
    console.log(`🌐 Health check available at: http://${host}:${port}/api/health`);
  });
  
  return server;
}