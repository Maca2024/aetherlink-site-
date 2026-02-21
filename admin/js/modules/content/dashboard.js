// ── AetherLink Command Center — Content Dashboard (Blog Posts) ──
// Lists posts, filter, stats, CRUD actions

import { store, navigate } from '../../app.js';
import { apiGet } from '../../api.js';
import { toast, escapeHtml, formatDate } from '../../utils.js';
import { renderStatCard } from '../../components/stat-card.js';

let currentFilter = 'all';

/**
 * Render the content dashboard
 * @param {HTMLElement} container
 */
export async function render(container) {
    container.innerHTML = getShellHTML();
    attachListeners(container);
    await loadPosts(container);
}

function getShellHTML() {
    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 class="font-display text-2xl font-bold text-light">Blog Posts</h1>
                    <p class="text-sm text-muted mt-1">Manage your multilingual content</p>
                </div>
                <div class="flex gap-3">
                    <a href="#/content/generator" class="btn-primary btn-violet btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        <span>AI Generate</span>
                    </a>
                    <button id="btn-new-post" class="btn-primary btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                        <span>New Post</span>
                    </button>
                </div>
            </div>

            <!-- Stats Row -->
            <div id="content-stats" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                ${renderStatCard({ title: 'Total Posts', value: '--', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>', color: 'cyan' })}
                ${renderStatCard({ title: 'Published', value: '--', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', color: 'emerald' })}
                ${renderStatCard({ title: 'Drafts', value: '--', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>', color: 'muted' })}
                ${renderStatCard({ title: 'AI Generated', value: '--', icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>', color: 'violet' })}
            </div>

            <!-- Filter Bar -->
            <div class="flex flex-wrap gap-2">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="published">Published</button>
                <button class="filter-btn" data-filter="draft">Drafts</button>
                <button class="filter-btn" data-filter="review">Review</button>
                <button class="filter-btn" data-filter="archived">Archived</button>
            </div>

            <!-- Posts Table -->
            <div class="glass rounded-2xl overflow-hidden">
                <!-- Table Header -->
                <div class="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs text-muted font-display font-medium uppercase tracking-wider border-b border-white/5">
                    <div class="col-span-5">Title</div>
                    <div class="col-span-2">Status</div>
                    <div class="col-span-2">Category</div>
                    <div class="col-span-2">Date</div>
                    <div class="col-span-1 text-right">Actions</div>
                </div>

                <!-- Table Body -->
                <div id="posts-list">
                    <div id="posts-loading" class="flex items-center justify-center py-16">
                        <div class="spinner spinner-lg"></div>
                    </div>
                </div>

                <!-- Empty state -->
                <div id="posts-empty" class="hidden empty-state">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
                    <h3 class="font-display font-semibold text-light text-lg mb-1">No posts yet</h3>
                    <p class="text-sm mb-4">Create your first blog post or generate one with AI</p>
                    <button id="btn-empty-create" class="btn-primary btn-sm mx-auto">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                        <span>Create Post</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function attachListeners(container) {
    // New post button
    container.querySelector('#btn-new-post')?.addEventListener('click', () => {
        navigate('content', 'editor/new');
    });

    container.querySelector('#btn-empty-create')?.addEventListener('click', () => {
        navigate('content', 'editor/new');
    });

    // Filter buttons
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderPosts(container);
        });
    });
}

async function loadPosts(container) {
    const loadingEl = container.querySelector('#posts-loading');
    const emptyEl = container.querySelector('#posts-empty');

    try {
        const data = await apiGet('/api/blog/posts');
        store.posts = Array.isArray(data) ? data : (data.posts || []);
        updateStats(container);
        renderPosts(container);
    } catch (err) {
        toast(`Failed to load posts: ${err.message}`, 'error');
        store.posts = [];
        renderPosts(container);
    } finally {
        if (loadingEl) loadingEl.classList.add('hidden');
    }
}

function updateStats(container) {
    const posts = store.posts;
    const total = posts.length;
    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;
    const ai = posts.filter(p => p.generation_topic || p.research_data).length;

    const statsEl = container.querySelector('#content-stats');
    if (statsEl) {
        statsEl.innerHTML = `
            ${renderStatCard({ title: 'Total Posts', value: total, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>', color: 'cyan' })}
            ${renderStatCard({ title: 'Published', value: published, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>', color: 'emerald' })}
            ${renderStatCard({ title: 'Drafts', value: drafts, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>', color: 'muted' })}
            ${renderStatCard({ title: 'AI Generated', value: ai, icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>', color: 'violet' })}
        `;
    }
}

function renderPosts(container) {
    const listEl = container.querySelector('#posts-list');
    const emptyEl = container.querySelector('#posts-empty');
    const loadingEl = container.querySelector('#posts-loading');

    if (loadingEl) loadingEl.classList.add('hidden');

    let filtered = store.posts || [];
    if (currentFilter !== 'all') {
        filtered = filtered.filter(p => p.status === currentFilter);
    }

    if (filtered.length === 0) {
        if (listEl) listEl.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
    }

    if (emptyEl) emptyEl.classList.add('hidden');

    const catLabels = { aetherbot: 'AetherBot', aethermind: 'AetherMIND', aetherdev: 'AetherDEV' };

    if (listEl) {
        listEl.innerHTML = filtered.map(post => {
            const date = formatDate(post.published_at || post.created_at);
            const statusClass = `badge-${post.status}`;
            const catClass = `cat-${post.category}`;
            const catLabel = catLabels[post.category] || post.category;
            const aiIcon = (post.generation_topic || post.research_data)
                ? '<svg class="w-3.5 h-3.5 text-accent-violet inline ml-1.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>'
                : '';

            return `
                <div class="post-row grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-6 py-4 items-center cursor-pointer" data-post-id="${post.id}">
                    <div class="md:col-span-5">
                        <div class="font-display font-semibold text-sm text-light truncate">${escapeHtml(post.title_nl || 'Untitled')}${aiIcon}</div>
                        <div class="text-xs text-muted truncate mt-0.5 md:hidden">${date}</div>
                    </div>
                    <div class="md:col-span-2">
                        <span class="badge ${statusClass}">${post.status}</span>
                    </div>
                    <div class="md:col-span-2">
                        <span class="cat-badge ${catClass}">${catLabel}</span>
                    </div>
                    <div class="md:col-span-2 text-sm text-muted hidden md:block">${date}</div>
                    <div class="md:col-span-1 text-right">
                        <button class="btn-edit-post text-muted hover:text-accent-cyan transition-colors p-1" title="Edit" data-id="${post.id}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Attach row click handlers
        listEl.querySelectorAll('.post-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.btn-edit-post')) return;
                const id = row.dataset.postId;
                if (id) window.location.hash = `#/content/editor/${id}`;
            });
        });

        listEl.querySelectorAll('.btn-edit-post').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (id) window.location.hash = `#/content/editor/${id}`;
            });
        });
    }
}
