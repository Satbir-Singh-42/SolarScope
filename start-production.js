#!/usr/bin/env node

// Production startup script for Render deployment
// Simplified version that directly runs the built server

import { config } from 'dotenv';

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Log storage mode
if (process.env.DATABASE_URL) {
  console.log('Using database storage (persistent data)');
} else {
  console.log('Using memory storage (session-only data)');
}

// Set production defaults
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
const port = process.env.PORT || 10000;

console.log('Starting SolarScope AI in production mode...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Port:', port);
console.log('Database URL configured:', !!process.env.DATABASE_URL);
console.log('Google AI API configured:', !!process.env.GOOGLE_API_KEY);

// Import and start the production server
try {
  const { startProductionServer } = await import('./dist/index.js');
  await startProductionServer();
  console.log('✅ Production server started successfully');
} catch (error) {
  console.error('❌ Failed to start production server:', error);
  process.exit(1);
}