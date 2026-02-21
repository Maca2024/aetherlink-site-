// ── AetherLink Command Center — Main Application ──
// Router, state store, module loader

import { initAuth, handleLogin as authLogin, handleLogout as authLogout } from './auth.js';
import { toast } from './utils.js';
import { renderSidebar, initSidebar, setActiveRoute } from './components/sidebar.js';

// ══════════════════════════════════════════════════
// Reactive State Store
// ══════════════════════════════════════════════════

const _state = {
    user: null,
    session: null,
    posts: [],
    currentPost: null,
    currentRoute: '',
    loading: false,
};

export const store = new Proxy(_state, {
    set(target, prop, value) {
        target[prop] = value;
        // Dispatch state change event for any listeners
        window.dispatchEvent(new CustomEvent('store:change', { detail: { prop, value } }));
        return true;
    },
});

// ══════════════════════════════════════════════════
// Route Configuration
// ══════════════════════════════════════════════════

const routes = {
    '/content':                 () => import('./modules/content/dashboard.js'),
    '/content/generator':       () => import('./modules/content/generator.js'),
    '/content/calendar':        () => renderPlaceholder('Content Calendar', 'Editorial calendar and publishing schedule', 'calendar'),
    '/content/editor/:id':      () => import('./modules/content/editor.js'),
    '/seo':                     () => import('./modules/seo/dashboard.js'),
    '/seo/keywords':            () => renderPlaceholder('Keyword Tracker', 'Track keyword rankings and discover new opportunities', 'keywords'),
    '/seo/health':              () => renderPlaceholder('SEO Health Check', 'Automated site health auditing and fix recommendations', 'health'),
    '/intelligence':            () => import('./modules/intelligence/dashboard.js'),
    '/intelligence/competitive':() => renderPlaceholder('Competitive Analysis', 'Monitor competitor content strategies', 'competitive'),
    '/intelligence/gaps':       () => renderPlaceholder('Gap Analysis', 'Identify content gaps and missed opportunities', 'gaps'),
    '/crm':                     () => import('./modules/crm/dashboard.js'),
    '/crm/activity':            () => renderPlaceholder('Activity Feed', 'Real-time engagement and interaction feed', 'activity'),
    '/social':                  () => import('./modules/social/dashboard.js'),
    '/social/scheduler':        () => renderPlaceholder('Post Scheduler', 'Schedule social posts across platforms', 'scheduler'),
    '/kpi':                     () => import('./modules/kpi/dashboard.js'),
    '/kpi/traffic':             () => renderPlaceholder('Traffic Analytics', 'Detailed traffic sources and user behavior', 'traffic'),
    '/settings':                () => renderPlaceholder('Settings', 'API keys, integrations, and preferences', 'settings'),
};

// ══════════════════════════════════════════════════
// Router
// ══════════════════════════════════════════════════

/**
 * Navigate to a route
 * @param {string} section
 * @param {string} [param]
 */
export function navigate(section, param) {
    if (section === 'login') {
        window.location.hash = '';
        showLoginScreen();
        return;
    }
    const hash = param ? `#/${section}/${param}` : `#/${section}`;
    window.location.hash = hash;
}

async function handleRoute() {
    const hash = window.location.hash || '';

    // Not logged in
    if (!store.session) {
        if (hash && hash !== '#' && hash !== '#/') {
            // Store intended route for redirect after login
            sessionStorage.setItem('redirect_after_login', hash);
        }
        showLoginScreen();
        return;
    }

    // Logged in but no hash -> default to content
    if (!hash || hash === '#' || hash === '#/') {
        window.location.hash = '#/content';
        return;
    }

    const path = hash.slice(1); // remove #
    store.currentRoute = path;

    // Show dashboard layout
    showDashboardLayout();
    setActiveRoute(hash);

    const contentEl = document.getElementById('main-content');
    if (!contentEl) return;

    // Show loading
    contentEl.innerHTML = '<div class="flex items-center justify-center py-24"><div class="spinner spinner-lg"></div></div>';

    // Match route
    let matched = false;
    for (const [pattern, loader] of Object.entries(routes)) {
        const match = matchRoute(pattern, path);
        if (match) {
            matched = true;
            try {
                const moduleOrHtml = await loader();
                if (typeof moduleOrHtml === 'string') {
                    // Placeholder HTML
                    contentEl.innerHTML = moduleOrHtml;
                } else if (moduleOrHtml.render) {
                    // Module with render function
                    await moduleOrHtml.render(contentEl, match.params?.id);
                }
            } catch (err) {
                console.error('Route load error:', err);
                contentEl.innerHTML = `
                    <div class="text-center py-24">
                        <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
                            <svg class="w-8 h-8 text-red-400" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                        </div>
                        <h2 class="font-display text-xl font-bold text-light mb-2">Module Load Error</h2>
                        <p class="text-muted text-sm">${err.message}</p>
                    </div>
                `;
            }
            break;
        }
    }

    if (!matched) {
        contentEl.innerHTML = `
            <div class="text-center py-24">
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <svg class="w-8 h-8 text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/></svg>
                </div>
                <h2 class="font-display text-xl font-bold text-light mb-2">Page Not Found</h2>
                <p class="text-muted text-sm mb-4">The route <code class="text-accent-cyan font-mono text-xs">${path}</code> does not exist.</p>
                <a href="#/content" class="btn-primary btn-sm">Go to Dashboard</a>
            </div>
        `;
    }

    // Apply fade-in animation to content
    contentEl.style.animation = 'none';
    contentEl.offsetHeight;
    contentEl.style.animation = 'fadeIn 0.3s ease';
}

/**
 * Match a route pattern against a path
 * @param {string} pattern e.g. "/content/editor/:id"
 * @param {string} path e.g. "/content/editor/abc123"
 * @returns {object|null}
 */
function matchRoute(pattern, path) {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
            params[patternParts[i].slice(1)] = pathParts[i];
        } else if (patternParts[i] !== pathParts[i]) {
            return null;
        }
    }

    return { params };
}

// ══════════════════════════════════════════════════
// Screen Management
// ══════════════════════════════════════════════════

function showLoginScreen() {
    const app = document.getElementById('app');
    if (!app) return;

    // Only re-render if not already showing login
    if (app.dataset.screen === 'login') return;
    app.dataset.screen = 'login';

    app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-6">
            <div class="glass rounded-2xl p-8 md:p-10 w-full max-w-md relative">
                <div class="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-b bg-gradient-to-r from-transparent via-accent-cyan to-transparent opacity-60"></div>

                <div class="text-center mb-8">
                    <img src="../images/logo-white.png" alt="AetherLink" class="h-10 mx-auto mb-4">
                    <h1 class="font-display text-xl font-bold text-light">Command Center</h1>
                    <p class="text-muted text-sm mt-1">Admin Dashboard</p>
                </div>

                <form id="login-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-muted mb-2">Email</label>
                        <input type="email" id="login-email" class="input" placeholder="admin@aetherlink.ai" required autocomplete="email">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-muted mb-2">Password</label>
                        <input type="password" id="login-password" class="input" placeholder="Enter password" required autocomplete="current-password">
                    </div>
                    <div id="login-error" class="hidden text-red-400 text-sm text-center py-2"></div>
                    <button type="submit" id="login-btn" class="btn-primary w-full justify-center text-center">
                        <span>Sign In</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-muted/50 text-xs">Secured by Supabase Auth</p>
                </div>
            </div>
        </div>
    `;

    // Attach login handler
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        const btn = document.getElementById('login-btn');

        errorEl.classList.add('hidden');
        btn.disabled = true;
        btn.innerHTML = '<div class="spinner mx-auto"></div>';

        try {
            await authLogin(email, password);
            // Redirect to stored route or default
            const redirect = sessionStorage.getItem('redirect_after_login');
            sessionStorage.removeItem('redirect_after_login');
            if (redirect) {
                window.location.hash = redirect;
            } else {
                window.location.hash = '#/content';
            }
        } catch (err) {
            errorEl.textContent = err.message || 'Login failed. Please check your credentials.';
            errorEl.classList.remove('hidden');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span>Sign In</span><svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>';
        }
    });
}

function showDashboardLayout() {
    const app = document.getElementById('app');
    if (!app) return;

    // Only re-render layout if switching from login
    if (app.dataset.screen === 'dashboard') return;
    app.dataset.screen = 'dashboard';

    app.innerHTML = `
        ${renderSidebar()}

        <!-- Main Content Area -->
        <div class="lg:ml-64 min-h-screen flex flex-col">
            <!-- Top Bar -->
            <header class="sticky top-0 z-20 glass border-b border-white/[0.04]">
                <div class="px-4 md:px-8 h-16 flex items-center justify-between">
                    <div class="flex items-center gap-4 pl-12 lg:pl-0">
                        <h2 id="topbar-title" class="font-display font-semibold text-sm text-muted">Dashboard</h2>
                    </div>
                    <div class="flex items-center gap-4">
                        <span id="user-email" class="text-xs text-muted hidden md:inline truncate max-w-[200px]">${store.user?.email || ''}</span>
                        <button id="btn-topbar-logout" class="btn-secondary btn-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"/></svg>
                            <span class="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Content -->
            <main id="main-content" class="flex-1 px-4 md:px-8 py-8">
            </main>
        </div>
    `;

    initSidebar();

    // Top bar logout
    document.getElementById('btn-topbar-logout')?.addEventListener('click', async () => {
        await authLogout();
        navigate('login');
    });
}

// ══════════════════════════════════════════════════
// Placeholder Renderer
// ══════════════════════════════════════════════════

function renderPlaceholder(title, description, icon) {
    return `
        <div class="space-y-6">
            <div>
                <h1 class="font-display text-2xl font-bold text-light">${title}</h1>
                <p class="text-sm text-muted mt-1">${description}</p>
            </div>
            <div class="glass rounded-2xl p-8">
                <div class="text-center py-16">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-violet/5 border border-accent-violet/10 flex items-center justify-center">
                        <svg class="w-8 h-8 text-accent-violet/40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.42 15.17l-5.1-3.14a1 1 0 01-.09-1.69l9.02-5.55a1 1 0 011.48.87V17.9a1 1 0 01-1.48.87L11.42 15.17z"/></svg>
                    </div>
                    <h3 class="font-display font-semibold text-light text-lg mb-2">${title}</h3>
                    <p class="text-muted text-sm max-w-md mx-auto mb-4">${description}</p>
                    <div class="inline-flex items-center gap-2 text-xs text-muted/50 font-mono">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Coming soon
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ══════════════════════════════════════════════════
// Initialization
// ══════════════════════════════════════════════════

async function init() {
    const hasSession = await initAuth((event) => {
        if (event === 'logout') {
            navigate('login');
        } else if (event === 'login') {
            handleRoute();
        }
    });

    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);

    // Initial route
    handleRoute();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
