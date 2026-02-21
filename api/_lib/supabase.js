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

/** Verify admin: accepts user JWT or service role key */
export async function verifyAdmin(req) {
  const token = getTokenFromReq(req);
  if (!token) return null;

  // Allow service role key as auth (for GitHub Actions / cron)
  if (SUPABASE_SERVICE_KEY && token === SUPABASE_SERVICE_KEY) {
    return { id: 'service-role', email: 'system@aetherlink.ai', role: 'service_role' };
  }

  // Otherwise verify as user JWT
  const supabase = getAuthClientFromReq(req);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
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
