// ── AetherLink Command Center — API Helpers ──
// HTTP request wrappers with auth

import { getAuthHeaders } from './auth.js';

const API_BASE = '';

/**
 * GET request with auth
 * @param {string} path
 * @returns {Promise<any>}
 */
export async function apiGet(path) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Request failed (${res.status})`);
    }
    return res.json();
}

/**
 * POST request with auth
 * @param {string} path
 * @param {any} data
 * @returns {Promise<any>}
 */
export async function apiPost(path, data) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Request failed (${res.status})`);
    }
    return res.json();
}

/**
 * PUT request with auth
 * @param {string} path
 * @param {any} data
 * @returns {Promise<any>}
 */
export async function apiPut(path, data) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Request failed (${res.status})`);
    }
    return res.json();
}

/**
 * DELETE request with auth
 * @param {string} path
 * @returns {Promise<any>}
 */
export async function apiDelete(path) {
    const res = await fetch(`${API_BASE}${path}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Request failed (${res.status})`);
    }
    return res.json();
}

/**
 * Fetch raw text (for preview HTML)
 * @param {string} path
 * @returns {Promise<string>}
 */
export async function apiFetchText(path) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return res.text();
}
