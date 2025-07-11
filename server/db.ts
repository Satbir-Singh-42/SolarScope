import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Initialize database if DATABASE_URL is provided
let db: any = null;
let pool: any = null;

async function initializeDatabase() {
  if (process.env.DATABASE_URL) {
    try {
      neonConfig.webSocketConstructor = ws;
      pool = new Pool({ connectionString: process.env.DATABASE_URL });
      db = drizzle({ client: pool, schema });
      
      // Test the connection
      await pool.query('SELECT 1');
      console.log('Database connected successfully');
      return true;
    } catch (error) {
      console.warn('Database connection failed, falling back to memory storage:', error);
      db = null;
      pool = null;
      return false;
    }
  } else {
    console.log('No DATABASE_URL found, using memory storage');
    return false;
  }
}

// Initialize database connection but don't block the app if it fails
initializeDatabase().catch(console.error);

export { pool, db, initializeDatabase };