// ── AetherLink Command Center — AI Generator ──
// Research with Perplexity, generate articles with Claude

import { store } from '../../app.js';
import { apiPost } from '../../api.js';
import { toast, escapeHtml } from '../../utils.js';

let researchData = null;

/**
 * Render the AI generator screen
 * @param {HTMLElement} container
 */
export async function render(container) {
    researchData = null;
    container.innerHTML = getHTML();
    attachListeners(container);
}

function getHTML() {
    return `
        <div class="max-w-3xl mx-auto space-y-6">
            <!-- Header -->
            <div class="text-center mb-10">
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-accent-violet/20 to-accent-cyan/10 border border-accent-violet/20 flex items-center justify-center">
                    <svg class="w-8 h-8 text-accent-violet" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>
                </div>
                <h1 class="font-display text-2xl font-bold text-light mb-2">AI Article Generator</h1>
                <p class="text-muted text-sm max-w-lg mx-auto">Research any topic with Perplexity AI and generate a professional multilingual article with Claude.</p>
            </div>

            <!-- Step 1: Topic -->
            <div class="glass rounded-2xl p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-7 h-7 rounded-full bg-accent-cyan/15 flex items-center justify-center text-accent-cyan font-display font-bold text-xs">1</div>
                    <h2 class="font-display font-semibold text-light text-sm">Define Topic</h2>
                </div>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-muted font-medium mb-2">Topic / Title Idea</label>
                        <input type="text" id="gen-topic" class="input input-lg" placeholder="e.g., How MCP Servers Transform Enterprise AI Integration">
                    </div>
                    <div>
                        <label class="block text-xs text-muted font-medium mb-2">Category</label>
                        <select id="gen-category" class="input">
                            <option value="aetherbot">AetherBot</option>
                            <option value="aethermind">AetherMIND</option>
                            <option value="aetherdev">AetherDEV</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Step 2: Research -->
            <div class="glass rounded-2xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-7 h-7 rounded-full bg-accent-violet/15 flex items-center justify-center text-accent-violet font-display font-bold text-xs">2</div>
                        <h2 class="font-display font-semibold text-light text-sm">AI Research</h2>
                    </div>
                    <button id="btn-research" class="btn-primary btn-violet btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <span>Research Topic</span>
                    </button>
                </div>
                <p class="text-muted text-xs mb-2">Perplexity AI will research the latest information about your topic.</p>
                <div id="research-output" class="hidden">
                    <div id="research-loading" class="hidden flex items-center gap-3 py-8 justify-center">
                        <div class="spinner"></div>
                        <span class="text-sm text-muted">Researching topic...</span>
                    </div>
                    <div id="research-result" class="research-result hidden"></div>
                </div>
            </div>

            <!-- Step 3: Generate -->
            <div class="glass rounded-2xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-7 h-7 rounded-full bg-accent-emerald/15 flex items-center justify-center text-accent-emerald font-display font-bold text-xs">3</div>
                        <h2 class="font-display font-semibold text-light text-sm">Generate Article</h2>
                    </div>
                    <button id="btn-generate" class="btn-primary btn-sm" disabled>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        <span>Generate Article</span>
                    </button>
                </div>
                <p class="text-muted text-xs mb-4">Claude will write a professional article in NL, EN, and FI based on the research.</p>
                <div id="generate-progress" class="hidden space-y-3">
                    <div class="progress-bar">
                        <div id="gen-progress-fill" class="progress-fill" style="width: 0%"></div>
                    </div>
                    <div id="gen-progress-text" class="text-xs text-muted text-center">Initializing...</div>
                </div>
            </div>
        </div>
    `;
}

function attachListeners(container) {
    container.querySelector('#btn-research')?.addEventListener('click', () => handleResearch(container));
    container.querySelector('#btn-generate')?.addEventListener('click', () => handleGenerate(container));
}

async function handleResearch(container) {
    const topic = container.querySelector('#gen-topic').value.trim();
    if (!topic) { toast('Please enter a topic first', 'error'); return; }

    const btn = container.querySelector('#btn-research');
    const outputEl = container.querySelector('#research-output');
    const loadingEl = container.querySelector('#research-loading');
    const resultEl = container.querySelector('#research-result');

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div><span>Researching...</span>';
    outputEl.classList.remove('hidden');
    loadingEl.classList.remove('hidden');
    resultEl.classList.add('hidden');

    try {
        const data = await apiPost('/api/blog/research', {
            topic,
            category: container.querySelector('#gen-category').value,
        });

        researchData = data.research || data;
        resultEl.textContent = typeof researchData === 'string'
            ? researchData
            : JSON.stringify(researchData, null, 2);
        resultEl.classList.remove('hidden');

        // Enable generate button
        container.querySelector('#btn-generate').disabled = false;
        toast('Research complete!', 'success');
    } catch (err) {
        toast(`Research failed: ${err.message}`, 'error');
    } finally {
        loadingEl.classList.add('hidden');
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg><span>Research Topic</span>';
    }
}

async function handleGenerate(container) {
    const topic = container.querySelector('#gen-topic').value.trim();
    if (!topic) { toast('Please enter a topic first', 'error'); return; }

    const btn = container.querySelector('#btn-generate');
    const progressEl = container.querySelector('#generate-progress');
    const fillEl = container.querySelector('#gen-progress-fill');
    const textEl = container.querySelector('#gen-progress-text');

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div><span>Generating...</span>';
    progressEl.classList.remove('hidden');

    // Simulated progress stages
    const stages = [
        { pct: 15, text: 'Analyzing research data...' },
        { pct: 30, text: 'Writing Dutch version...' },
        { pct: 50, text: 'Writing English version...' },
        { pct: 70, text: 'Writing Finnish version...' },
        { pct: 85, text: 'Generating SEO metadata...' },
        { pct: 95, text: 'Finalizing article...' },
    ];

    let stageIndex = 0;
    const progressInterval = setInterval(() => {
        if (stageIndex < stages.length) {
            fillEl.style.width = stages[stageIndex].pct + '%';
            textEl.textContent = stages[stageIndex].text;
            stageIndex++;
        }
    }, 2500);

    try {
        const data = await apiPost('/api/blog/generate', {
            topic,
            category: container.querySelector('#gen-category').value,
            research: researchData,
        });

        clearInterval(progressInterval);
        fillEl.style.width = '100%';
        textEl.textContent = 'Article generated!';

        const post = data.post || data;
        const qualityScore = data.quality_score || post.quality_score;
        const autoPublishable = data.auto_publishable;

        if (qualityScore != null) {
            const scoreMsg = autoPublishable
                ? `Quality: ${qualityScore}/100 — Auto-publishable!`
                : `Quality: ${qualityScore}/100 — Needs review (< 85)`;
            toast(scoreMsg, qualityScore >= 85 ? 'success' : 'info');
        } else {
            toast('Article generated successfully!', 'success');
        }

        // Save the generated article
        let savedPost = post;
        if (!post.id) {
            try {
                savedPost = await apiPost('/api/blog/posts', post);
            } catch (saveErr) {
                toast(`Generated but failed to save: ${saveErr.message}`, 'error');
            }
        }

        // Navigate to editor
        setTimeout(() => {
            const id = savedPost.id || post.id;
            if (id) {
                window.location.hash = `#/content/editor/${id}`;
            } else {
                // Load content directly into editor
                store.currentPost = post;
                window.location.hash = '#/content/editor/new';
            }
        }, 1000);
    } catch (err) {
        clearInterval(progressInterval);
        toast(`Generation failed: ${err.message}`, 'error');
        fillEl.style.width = '0%';
        textEl.textContent = 'Generation failed';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg><span>Generate Article</span>';
    }
}
