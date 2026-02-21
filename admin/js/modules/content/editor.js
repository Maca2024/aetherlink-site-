// ── AetherLink Command Center — Post Editor ──
// Full post editor with multilingual tabs, metadata, keywords, feedback

import { store, navigate } from '../../app.js';
import { apiGet, apiPost, apiPut, apiDelete, apiFetchText } from '../../api.js';
import { toast, escapeHtml, escapeAttr, slugify, countWords, formatDateLong } from '../../utils.js';
import { getAuthHeaders } from '../../auth.js';

let editorLang = 'nl';
let keywords = [];
let feedbackComments = [];

/**
 * Render the editor
 * @param {HTMLElement} container
 * @param {string} postId - post ID or "new"
 */
export async function render(container, postId) {
    editorLang = 'nl';
    keywords = [];
    feedbackComments = [];

    container.innerHTML = getEditorHTML();
    attachListeners(container);

    if (postId && postId !== 'new') {
        await loadPost(postId);
    } else {
        initNewPost();
    }
}

function getEditorHTML() {
    return `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <a href="#/content" class="text-muted hover:text-light transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
                    </a>
                    <h1 class="font-display text-xl font-bold text-light">Post Editor</h1>
                    <span id="editor-autosave" class="text-xs text-muted hidden">Saved</span>
                </div>
                <div class="flex items-center gap-3">
                    <button id="btn-save-draft" class="btn-secondary btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                        <span>Save Draft</span>
                    </button>
                    <button id="btn-preview" class="btn-secondary btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        <span class="hidden sm:inline">Preview</span>
                    </button>
                    <button id="btn-publish" class="btn-primary btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        <span>Publish</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <!-- Main editor area -->
                <div class="lg:col-span-3 space-y-6">
                    <!-- Category & Status -->
                    <div class="glass rounded-2xl p-6 space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs text-muted font-medium mb-2">Category</label>
                                <select id="editor-category" class="input">
                                    <option value="aetherbot">AetherBot</option>
                                    <option value="aethermind">AetherMIND</option>
                                    <option value="aetherdev">AetherDEV</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs text-muted font-medium mb-2">Status</label>
                                <select id="editor-status" class="input">
                                    <option value="draft">Draft</option>
                                    <option value="review">In Review</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Language Tabs -->
                    <div class="glass rounded-2xl overflow-hidden">
                        <div class="flex items-center gap-1 px-4 pt-4 pb-0">
                            <button class="tab-btn active" data-lang="nl">&#x1F1F3;&#x1F1F1; NL</button>
                            <button class="tab-btn" data-lang="en">&#x1F1EC;&#x1F1E7; EN</button>
                            <button class="tab-btn" data-lang="fi">&#x1F1EB;&#x1F1EE; FI</button>
                        </div>

                        ${['nl', 'en', 'fi'].map((lang, i) => `
                            <div id="tab-${lang}" class="p-6 space-y-4 ${i > 0 ? 'hidden' : ''}">
                                <div>
                                    <label class="block text-xs text-muted font-medium mb-2">Title (${lang.toUpperCase()})</label>
                                    <input type="text" id="editor-title-${lang}" class="input input-lg font-display font-bold" placeholder="Article title in ${lang === 'nl' ? 'Dutch' : lang === 'en' ? 'English' : 'Finnish'}">
                                </div>
                                <div>
                                    <label class="block text-xs text-muted font-medium mb-2">Slug (${lang.toUpperCase()})</label>
                                    <input type="text" id="editor-slug-${lang}" class="input font-mono text-sm" placeholder="article-slug-${lang}">
                                </div>
                                <div>
                                    <label class="block text-xs text-muted font-medium mb-2">Description / SEO (${lang.toUpperCase()})</label>
                                    <textarea id="editor-desc-${lang}" class="input" rows="3" placeholder="Brief description for SEO and social sharing..."></textarea>
                                </div>
                                <div>
                                    <label class="block text-xs text-muted font-medium mb-2">Content HTML (${lang.toUpperCase()})</label>
                                    <textarea id="editor-content-${lang}" class="input textarea-content" placeholder="<h2>Introduction</h2>&#10;<p>Your article content...</p>"></textarea>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <!-- Cross-Post Section -->
                    <div class="glass rounded-2xl p-6">
                        <h3 class="font-display font-semibold text-sm text-light mb-4">Cross-Post Distribution</h3>
                        <div class="flex flex-col sm:flex-row gap-6">
                            <label class="checkbox-wrap">
                                <input type="checkbox" id="crosspost-linkedin">
                                <div class="flex items-center gap-2">
                                    <svg class="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                    <span class="text-sm text-light">Post to LinkedIn</span>
                                </div>
                            </label>
                            <label class="checkbox-wrap">
                                <input type="checkbox" id="crosspost-medium">
                                <div class="flex items-center gap-2">
                                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
                                    <span class="text-sm text-light">Post to Medium</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="space-y-6">
                    <!-- Author & Meta -->
                    <div class="glass rounded-2xl p-5 space-y-4">
                        <h3 class="font-display font-semibold text-sm text-light">Post Metadata</h3>
                        <div>
                            <label class="block text-xs text-muted font-medium mb-2">Author</label>
                            <input type="text" id="editor-author" class="input" value="Marco" placeholder="Author name">
                        </div>
                        <div>
                            <label class="block text-xs text-muted font-medium mb-2">Author Title</label>
                            <input type="text" id="editor-author-title" class="input" value="CTO & AI Lead Architect" placeholder="Author title">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs text-muted font-medium mb-2">Read Time</label>
                                <div id="editor-readtime" class="input bg-white/[0.02] text-muted text-sm cursor-default">0 min</div>
                            </div>
                            <div>
                                <label class="block text-xs text-muted font-medium mb-2">Words</label>
                                <div id="editor-wordcount" class="input bg-white/[0.02] text-muted text-sm cursor-default">0</div>
                            </div>
                        </div>
                    </div>

                    <!-- SEO Keywords -->
                    <div class="glass rounded-2xl p-5 space-y-4">
                        <h3 class="font-display font-semibold text-sm text-light">SEO Keywords</h3>
                        <div class="flex gap-2">
                            <input type="text" id="keyword-input" class="input flex-1" placeholder="Add keyword">
                            <button id="btn-add-keyword" class="btn-secondary btn-sm px-3">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                            </button>
                        </div>
                        <div id="keywords-list" class="flex flex-wrap gap-2"></div>
                    </div>

                    <!-- Quality & Feedback -->
                    <div class="glass rounded-2xl p-5 space-y-4">
                        <h3 class="font-display font-semibold text-sm text-light">Quality & Feedback</h3>
                        <div>
                            <label class="block text-xs text-muted font-medium mb-2">Quality Score (auto)</label>
                            <div id="editor-quality-score" class="input bg-white/[0.02] text-muted text-sm cursor-default">&mdash;</div>
                        </div>
                        <div>
                            <label class="block text-xs text-muted font-medium mb-2">Feedback Score (0-100)</label>
                            <input type="range" id="editor-feedback-score" min="0" max="100" value="0" class="w-full accent-accent-violet">
                            <div class="flex justify-between text-xs text-muted mt-1">
                                <span>0</span>
                                <span id="feedback-score-val" class="text-light font-semibold">0</span>
                                <span>100</span>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs text-muted font-medium mb-2">Learning Notes</label>
                            <textarea id="editor-learning-notes" class="input text-sm" rows="3" placeholder="What should future articles learn from this one?"></textarea>
                        </div>
                        <div>
                            <label class="block text-xs text-muted font-medium mb-2">Add Comment</label>
                            <div class="flex gap-2">
                                <input type="text" id="feedback-comment-input" class="input flex-1 text-sm" placeholder="Feedback comment...">
                                <button id="btn-add-comment" class="btn-secondary btn-sm px-3">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                                </button>
                            </div>
                            <div id="feedback-comments-list" class="mt-2 space-y-1 text-xs text-muted max-h-32 overflow-y-auto"></div>
                        </div>
                    </div>

                    <!-- Danger Zone -->
                    <div class="glass rounded-2xl p-5 space-y-4 border-red-500/10">
                        <h3 class="font-display font-semibold text-sm text-red-400">Danger Zone</h3>
                        <button id="btn-delete" class="btn-secondary btn-danger btn-sm w-full justify-center" style="display:none">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            <span>Delete Post</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Preview Modal -->
        <div id="modal-preview" class="modal-overlay">
            <div class="modal-content">
                <div class="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-surface">
                    <div class="flex items-center gap-4">
                        <h2 class="font-display font-semibold text-light text-sm">Preview</h2>
                        <div class="flex gap-1">
                            <button class="tab-btn active" data-preview-lang="nl">NL</button>
                            <button class="tab-btn" data-preview-lang="en">EN</button>
                            <button class="tab-btn" data-preview-lang="fi">FI</button>
                        </div>
                    </div>
                    <button id="btn-close-preview" class="text-muted hover:text-light transition-colors p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                </div>
                <div id="preview-body" class="p-6">
                    <div id="preview-loading" class="flex items-center justify-center py-16">
                        <div class="spinner spinner-lg"></div>
                    </div>
                    <div id="preview-content" class="hidden"></div>
                </div>
            </div>
        </div>
    `;
}

function attachListeners(container) {
    // Language tabs
    container.querySelectorAll('.tab-btn[data-lang]').forEach(btn => {
        btn.addEventListener('click', () => switchLang(container, btn.dataset.lang));
    });

    // Auto-slug on title input
    ['nl', 'en', 'fi'].forEach(lang => {
        const titleInput = container.querySelector(`#editor-title-${lang}`);
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                const slugInput = container.querySelector(`#editor-slug-${lang}`);
                if (slugInput) slugInput.value = slugify(titleInput.value);
            });
        }
        // Word count on content change
        const contentInput = container.querySelector(`#editor-content-${lang}`);
        if (contentInput) {
            contentInput.addEventListener('input', () => updateWordCount(container));
        }
    });

    // Keywords
    const keywordInput = container.querySelector('#keyword-input');
    container.querySelector('#btn-add-keyword')?.addEventListener('click', () => addKeyword(container));
    keywordInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addKeyword(container); }
    });

    // Feedback comments
    const commentInput = container.querySelector('#feedback-comment-input');
    container.querySelector('#btn-add-comment')?.addEventListener('click', () => addFeedbackComment(container));
    commentInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); addFeedbackComment(container); }
    });

    // Feedback score slider
    container.querySelector('#editor-feedback-score')?.addEventListener('input', (e) => {
        const val = container.querySelector('#feedback-score-val');
        if (val) val.textContent = e.target.value;
    });

    // Save / Publish / Delete
    container.querySelector('#btn-save-draft')?.addEventListener('click', () => handleSaveDraft(container));
    container.querySelector('#btn-publish')?.addEventListener('click', () => handlePublish(container));
    container.querySelector('#btn-delete')?.addEventListener('click', () => handleDeletePost(container));

    // Preview
    container.querySelector('#btn-preview')?.addEventListener('click', () => openPreview(container));
    container.querySelector('#btn-close-preview')?.addEventListener('click', () => closePreview(container));
    container.querySelectorAll('[data-preview-lang]').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('[data-preview-lang]').forEach(b => b.classList.toggle('active', b.dataset.previewLang === btn.dataset.previewLang));
            loadPreview(container, btn.dataset.previewLang);
        });
    });
}

// ── Data Operations ──

function initNewPost() {
    store.currentPost = {
        id: null,
        title_nl: '', title_en: '', title_fi: '',
        slug_nl: '', slug_en: '', slug_fi: '',
        description_nl: '', description_en: '', description_fi: '',
        content_nl: '', content_en: '', content_fi: '',
        category: 'aethermind',
        status: 'draft',
        author: 'Marco',
        author_title: 'CTO & AI Lead Architect',
        seo_keywords: [],
        word_count: 0,
        read_time: 0,
    };
    keywords = [];
    feedbackComments = [];
    populateEditor();
}

async function loadPost(id) {
    try {
        let post = (store.posts || []).find(p => p.id === id);
        if (!post) {
            const data = await apiGet('/api/blog/posts');
            store.posts = Array.isArray(data) ? data : (data.posts || []);
            post = store.posts.find(p => p.id === id);
        }
        if (!post) {
            toast('Post not found', 'error');
            window.location.hash = '#/content';
            return;
        }
        store.currentPost = { ...post };
        keywords = Array.isArray(post.seo_keywords) ? [...post.seo_keywords] : [];
        feedbackComments = Array.isArray(post.feedback_comments) ? [...post.feedback_comments] : [];
        populateEditor();
    } catch (err) {
        toast(`Failed to load post: ${err.message}`, 'error');
        window.location.hash = '#/content';
    }
}

function populateEditor() {
    const p = store.currentPost;
    if (!p) return;

    const $ = (id) => document.getElementById(id);

    $('editor-category').value = p.category || 'aethermind';
    $('editor-status').value = p.status || 'draft';
    $('editor-author').value = p.author || 'Marco';
    $('editor-author-title').value = p.author_title || 'CTO & AI Lead Architect';

    ['nl', 'en', 'fi'].forEach(lang => {
        $(`editor-title-${lang}`).value = p[`title_${lang}`] || '';
        $(`editor-slug-${lang}`).value = p[`slug_${lang}`] || '';
        $(`editor-desc-${lang}`).value = p[`description_${lang}`] || '';
        $(`editor-content-${lang}`).value = p[`content_${lang}`] || '';
    });

    renderKeywords();
    updateWordCount();
    switchLang(document, 'nl');

    // Quality & Feedback
    $('editor-quality-score').textContent = p.quality_score != null ? `${p.quality_score}/100` : '\u2014';
    const fbScore = p.feedback_score || 0;
    $('editor-feedback-score').value = fbScore;
    $('feedback-score-val').textContent = fbScore;
    $('editor-learning-notes').value = p.learning_notes || '';
    renderFeedbackComments();

    // Show/hide delete
    const deleteBtn = $('btn-delete');
    if (deleteBtn) deleteBtn.style.display = p.id ? 'flex' : 'none';
}

function collectEditorData() {
    const $ = (id) => document.getElementById(id);
    const p = store.currentPost || {};
    const words = countWords($(`editor-content-${editorLang}`)?.value || '');

    return {
        id: p.id || undefined,
        title_nl: $('editor-title-nl').value.trim(),
        title_en: $('editor-title-en').value.trim(),
        title_fi: $('editor-title-fi').value.trim(),
        slug_nl: $('editor-slug-nl').value.trim(),
        slug_en: $('editor-slug-en').value.trim(),
        slug_fi: $('editor-slug-fi').value.trim(),
        description_nl: $('editor-desc-nl').value.trim(),
        description_en: $('editor-desc-en').value.trim(),
        description_fi: $('editor-desc-fi').value.trim(),
        content_nl: $('editor-content-nl').value,
        content_en: $('editor-content-en').value,
        content_fi: $('editor-content-fi').value,
        category: $('editor-category').value,
        status: $('editor-status').value,
        author: $('editor-author').value.trim(),
        author_title: $('editor-author-title').value.trim(),
        seo_keywords: keywords,
        word_count: words,
        read_time: Math.max(1, Math.ceil(words / 200)),
        feedback_score: parseInt($('editor-feedback-score').value) || null,
        learning_notes: $('editor-learning-notes').value.trim() || null,
        feedback_comments: feedbackComments || [],
    };
}

// ── Save / Publish / Delete ──

async function handleSaveDraft(container) {
    const btn = container.querySelector('#btn-save-draft');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div><span>Saving...</span>';

    try {
        const data = collectEditorData();
        if (!data.title_nl) { toast('Title (NL) is required', 'error'); return; }

        if (!data.slug_nl) data.slug_nl = slugify(data.title_nl);
        if (!data.slug_en) data.slug_en = slugify(data.title_en || data.title_nl);
        if (!data.slug_fi) data.slug_fi = slugify(data.title_fi || data.title_nl);

        let savedPost;
        if (data.id) {
            savedPost = await apiPut(`/api/blog/posts?id=${data.id}`, data);
        } else {
            savedPost = await apiPost('/api/blog/posts', data);
        }
        savedPost = savedPost.post || savedPost;

        if (savedPost.id && !store.currentPost.id) {
            store.currentPost.id = savedPost.id;
            window.location.hash = `#/content/editor/${savedPost.id}`;
        }

        store.currentPost = { ...store.currentPost, ...data, id: store.currentPost.id || savedPost.id };
        toast('Draft saved successfully', 'success');

        const autosaveEl = container.querySelector('#editor-autosave');
        if (autosaveEl) {
            autosaveEl.classList.remove('hidden');
            autosaveEl.textContent = 'Saved';
            setTimeout(() => autosaveEl.classList.add('hidden'), 3000);
        }
    } catch (err) {
        toast(`Save failed: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
}

async function handlePublish(container) {
    const btn = container.querySelector('#btn-publish');
    const originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div><span>Publishing...</span>';

    try {
        const data = collectEditorData();
        data.status = 'published';
        data.published_at = store.currentPost?.published_at || new Date().toISOString();

        if (!data.title_nl) { toast('Title (NL) is required', 'error'); return; }
        if (!data.slug_nl) data.slug_nl = slugify(data.title_nl);
        if (!data.slug_en) data.slug_en = slugify(data.title_en || data.title_nl);
        if (!data.slug_fi) data.slug_fi = slugify(data.title_fi || data.title_nl);

        if (data.id) {
            await apiPut(`/api/blog/posts?id=${data.id}`, data);
        } else {
            const saved = await apiPost('/api/blog/posts', data);
            data.id = (saved.post || saved).id;
            store.currentPost.id = data.id;
        }

        // Publish notification (IndexNow etc.)
        try {
            await apiPost(`/api/blog/publish?id=${store.currentPost.id || data.id}`, {});
        } catch (e) {
            console.warn('Publish notification failed:', e);
        }

        // Cross-posting
        const linkedIn = container.querySelector('#crosspost-linkedin')?.checked;
        const medium = container.querySelector('#crosspost-medium')?.checked;
        if (linkedIn || medium) {
            try {
                await apiPost('/api/blog/cross-post', {
                    id: store.currentPost.id,
                    linkedin: linkedIn,
                    medium: medium,
                });
                toast('Published and cross-posted!', 'success');
            } catch (cpErr) {
                toast('Published, but cross-posting failed: ' + cpErr.message, 'error');
            }
        } else {
            toast('Published successfully!', 'success');
        }

        const statusEl = container.querySelector('#editor-status');
        if (statusEl) statusEl.value = 'published';
        store.currentPost.status = 'published';
    } catch (err) {
        toast(`Publish failed: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
    }
}

async function handleDeletePost(container) {
    if (!store.currentPost?.id) return;
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

    const btn = container.querySelector('#btn-delete');
    btn.disabled = true;

    try {
        await apiDelete(`/api/blog/posts?id=${store.currentPost.id}`);
        toast('Post deleted', 'info');
        window.location.hash = '#/content';
    } catch (err) {
        toast(`Delete failed: ${err.message}`, 'error');
    } finally {
        btn.disabled = false;
    }
}

// ── Editor Helpers ──

function switchLang(container, lang) {
    editorLang = lang;
    ['nl', 'en', 'fi'].forEach(l => {
        const tab = document.getElementById(`tab-${l}`);
        if (tab) tab.classList.toggle('hidden', l !== lang);
    });
    document.querySelectorAll('.tab-btn[data-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    updateWordCount();
}

function updateWordCount() {
    const content = document.getElementById(`editor-content-${editorLang}`)?.value || '';
    const words = countWords(content);
    const readTime = Math.max(1, Math.ceil(words / 200));
    const wordEl = document.getElementById('editor-wordcount');
    const readEl = document.getElementById('editor-readtime');
    if (wordEl) wordEl.textContent = words.toLocaleString();
    if (readEl) readEl.textContent = `${readTime} min`;
}

// ── Keywords ──

function addKeyword(container) {
    const input = container.querySelector('#keyword-input');
    const keyword = input.value.trim().toLowerCase();
    if (keyword && !keywords.includes(keyword)) {
        keywords.push(keyword);
        renderKeywords();
    }
    input.value = '';
    input.focus();
}

function removeKeyword(index) {
    keywords.splice(index, 1);
    renderKeywords();
}

function renderKeywords() {
    const container = document.getElementById('keywords-list');
    if (!container) return;
    container.innerHTML = keywords.map((kw, i) =>
        `<span class="keyword-tag">${escapeHtml(kw)}<button class="btn-remove-kw" data-index="${i}">&times;</button></span>`
    ).join('');
    container.querySelectorAll('.btn-remove-kw').forEach(btn => {
        btn.addEventListener('click', () => removeKeyword(parseInt(btn.dataset.index)));
    });
}

// ── Feedback Comments ──

function addFeedbackComment(container) {
    const input = container.querySelector('#feedback-comment-input');
    const text = input.value.trim();
    if (text) {
        feedbackComments.push({
            text,
            date: new Date().toISOString().split('T')[0],
            author: 'admin',
        });
        renderFeedbackComments();
    }
    input.value = '';
    input.focus();
}

function removeFeedbackComment(index) {
    feedbackComments.splice(index, 1);
    renderFeedbackComments();
}

function renderFeedbackComments() {
    const container = document.getElementById('feedback-comments-list');
    if (!container) return;
    if (!feedbackComments?.length) {
        container.innerHTML = '<p class="text-muted italic">No comments yet</p>';
        return;
    }
    container.innerHTML = feedbackComments.map((c, i) =>
        `<div class="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
            <span class="flex-1">${escapeHtml(typeof c === 'string' ? c : c.text)} <span class="text-muted/60">${c.date || ''}</span></span>
            <button class="btn-remove-comment text-red-400/60 hover:text-red-400 shrink-0" data-index="${i}">&times;</button>
        </div>`
    ).join('');
    container.querySelectorAll('.btn-remove-comment').forEach(btn => {
        btn.addEventListener('click', () => removeFeedbackComment(parseInt(btn.dataset.index)));
    });
}

// ── Preview ──

function openPreview(container) {
    container.querySelector('#modal-preview')?.classList.add('open');
    loadPreview(container, 'nl');
}

function closePreview(container) {
    container.querySelector('#modal-preview')?.classList.remove('open');
}

async function loadPreview(container, lang) {
    const loadingEl = container.querySelector('#preview-loading');
    const contentEl = container.querySelector('#preview-content');

    if (loadingEl) loadingEl.classList.remove('hidden');
    if (contentEl) contentEl.classList.add('hidden');

    const slug = document.getElementById(`editor-slug-${lang}`)?.value;
    if (slug && store.currentPost?.id) {
        try {
            const html = await apiFetchText(`/api/blog/render?lang=${lang}&slug=${slug}`);
            if (html) {
                contentEl.innerHTML = `<iframe class="preview-frame" srcdoc="${escapeAttr(html)}"></iframe>`;
                loadingEl.classList.add('hidden');
                contentEl.classList.remove('hidden');
                return;
            }
        } catch (e) {
            // Fall through to local preview
        }
    }

    // Local preview fallback
    const title = document.getElementById(`editor-title-${lang}`)?.value || 'Untitled';
    const desc = document.getElementById(`editor-desc-${lang}`)?.value || '';
    const content = document.getElementById(`editor-content-${lang}`)?.value || '<p>No content yet.</p>';
    const author = document.getElementById('editor-author')?.value || 'Marco';

    const previewHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Plus Jakarta Sans',sans-serif;background:#05060f;color:#e4e8f1;padding:40px 24px;max-width:800px;margin:0 auto;line-height:1.8}
h1{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;margin-bottom:12px;background:linear-gradient(135deg,#00d4ff,#8b5cf6);-webkit-background-clip:text;background-clip:text;color:transparent}
.meta{color:#6b7394;font-size:.85rem;margin-bottom:32px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,.06)}
.desc{color:#a0a7c0;font-size:1.05rem;margin-bottom:32px;font-style:italic}
h2{font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:700;color:#00d4ff;margin:32px 0 16px}
h3{font-family:'Syne',sans-serif;font-size:1.15rem;font-weight:600;color:#e4e8f1;margin:24px 0 12px}
p{margin-bottom:16px;color:#c8cee0}ul,ol{margin:16px 0;padding-left:24px;color:#c8cee0}li{margin-bottom:8px}
strong{color:#e4e8f1}blockquote{border-left:3px solid #8b5cf6;padding:12px 20px;margin:24px 0;background:rgba(139,92,246,.06);border-radius:0 8px 8px 0;color:#a0a7c0}
code{background:rgba(0,212,255,.08);padding:2px 6px;border-radius:4px;font-size:.9em;color:#00d4ff}
pre{background:rgba(255,255,255,.03);padding:16px;border-radius:8px;overflow-x:auto;margin:16px 0;border:1px solid rgba(255,255,255,.06)}pre code{background:none;padding:0}
a{color:#00d4ff;text-decoration:none}a:hover{text-decoration:underline}img{max-width:100%;border-radius:12px;margin:16px 0}
table{width:100%;border-collapse:collapse;margin:16px 0}th,td{padding:10px 14px;border:1px solid rgba(255,255,255,.06);text-align:left}
th{background:rgba(255,255,255,.03);font-family:'Syne',sans-serif;font-weight:600}
</style></head><body>
<h1>${escapeHtml(title)}</h1>
<div class="meta">By ${escapeHtml(author)} &middot; ${formatDateLong(new Date())}</div>
${desc ? `<p class="desc">${escapeHtml(desc)}</p>` : ''}
${content}
</body></html>`;

    if (contentEl) {
        contentEl.innerHTML = `<iframe class="preview-frame" srcdoc="${escapeAttr(previewHtml)}"></iframe>`;
    }
    if (loadingEl) loadingEl.classList.add('hidden');
    if (contentEl) contentEl.classList.remove('hidden');
}
