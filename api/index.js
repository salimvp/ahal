/**
 * Single Vercel Serverless Function entry point for all API routes.
 * This keeps us under Vercel Hobby plan's 12-function limit.
 */
import 'dotenv/config';
import { handleApiRequest } from './_lib/router.js';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    await handleApiRequest(req, res);
  } catch (err) {
    console.error('API error:', err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }
}
