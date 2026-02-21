// Supabase client for Vercel serverless functions (Node.js runtime)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://qwqcstsafgiexhdzbpim.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

/** Public client — respects RLS (reads published posts only) */
export function getPublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/** Admin client — bypasses RLS via service role key */
export function getAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY);
}

/** Extract and verify JWT from Authorization header */
export function getTokenFromReq(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

/** Create authenticated client from request JWT */
export function getAuthClientFromReq(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
}

/** CORS headers */
export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/** Handle CORS preflight */
export function handleCors(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    res.end();
    return true;
  }
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  return false;
}
