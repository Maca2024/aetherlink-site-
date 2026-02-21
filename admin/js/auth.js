// ── AetherLink Command Center — Authentication ──
// Supabase auth wrapper

import { toast } from './utils.js';
import { store } from './app.js';

const SUPABASE_URL = 'https://qwqcstsafgiexhdzbpim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3cWNzdHNhZmdpZXhoZHpicGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NzgwODMsImV4cCI6MjA4NzI1NDA4M30.PXZmTQNOMPcsUV6of26z32TFm2gQUook8SgJFnlqOWU';

let supabaseClient = null;

/**
 * Get the Supabase client (singleton)
 */
export function getSupabase() {
    if (!supabaseClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return supabaseClient;
}

/**
 * Initialize auth — check for existing session, set up auth state listener
 * @param {Function} onAuth - callback when auth state resolves
 */
export async function initAuth(onAuth) {
    const sb = getSupabase();

    // Check for existing session
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        store.session = session;
        store.user = session.user;
    }

    // Listen for auth changes
    sb.auth.onAuthStateChange((event, session) => {
        store.session = session;
        store.user = session ? session.user : null;

        if (event === 'SIGNED_OUT') {
            store.posts = [];
            store.currentPost = null;
            if (onAuth) onAuth('logout');
        } else if (event === 'SIGNED_IN') {
            if (onAuth) onAuth('login');
        }
    });

    return !!session;
}

/**
 * Handle login with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<boolean>} success
 */
export async function handleLogin(email, password) {
    const sb = getSupabase();

    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;

    store.session = data.session;
    store.user = data.user;
    toast('Welcome back!', 'success');
    return true;
}

/**
 * Handle logout
 */
export async function handleLogout() {
    const sb = getSupabase();
    await sb.auth.signOut();
    store.session = null;
    store.user = null;
    store.posts = [];
    store.currentPost = null;
    toast('Signed out', 'info');
}

/**
 * Get the current session
 * @returns {object|null}
 */
export function getSession() {
    return store.session;
}

/**
 * Get authorization headers for API calls
 * @returns {object}
 */
export function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.session?.access_token || ''}`,
    };
}
