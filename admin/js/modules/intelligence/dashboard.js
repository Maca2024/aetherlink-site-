// ── AetherLink Command Center — Intelligence Dashboard ──
// Research input, trend analysis, competitive intelligence

import { apiPost } from '../../api.js';
import { toast, escapeHtml } from '../../utils.js';

export async function render(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div>
                <h1 class="font-display text-2xl font-bold text-light">Intelligence Hub</h1>
                <p class="text-sm text-muted mt-1">AI-powered research, trend analysis, and competitive intelligence</p>
            </div>

            <!-- Research Tool -->
            <div class="glass rounded-2xl p-6">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-9 h-9 rounded-lg bg-accent-violet/10 flex items-center justify-center">
                        <svg class="w-5 h-5 text-accent-violet" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                    <h2 class="font-display font-semibold text-light">Quick Research</h2>
                </div>
                <div class="flex gap-3 mb-4">
                    <input type="text" id="intel-topic" class="input flex-1" placeholder="Enter a research topic, keyword, or question...">
                    <button id="btn-intel-research" class="btn-primary btn-violet btn-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <span>Run Research</span>
                    </button>
                </div>
                <div id="intel-loading" class="hidden flex items-center gap-3 py-6 justify-center">
                    <div class="spinner"></div>
                    <span class="text-sm text-muted">Researching...</span>
                </div>
                <div id="intel-result" class="hidden research-result"></div>
            </div>

            <!-- Trend Cards Placeholder -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="glass rounded-2xl p-6">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                            <svg class="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>
                        </div>
                        <h3 class="font-display font-semibold text-sm text-light">Trending Topics</h3>
                    </div>
                    <p class="text-xs text-muted mb-3">Auto-detected trending AI topics relevant to your niche.</p>
                    <div class="text-center py-6 text-muted/40">
                        <p class="text-xs font-mono">Coming in v2.1</p>
                    </div>
                </div>

                <div class="glass rounded-2xl p-6">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 rounded-lg bg-accent-emerald/10 flex items-center justify-center">
                            <svg class="w-4 h-4 text-accent-emerald" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>
                        </div>
                        <h3 class="font-display font-semibold text-sm text-light">Competitive Watch</h3>
                    </div>
                    <p class="text-xs text-muted mb-3">Track competitor content and identify opportunities.</p>
                    <div class="text-center py-6 text-muted/40">
                        <p class="text-xs font-mono">Coming in v2.1</p>
                    </div>
                </div>

                <div class="glass rounded-2xl p-6">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="w-8 h-8 rounded-lg bg-accent-violet/10 flex items-center justify-center">
                            <svg class="w-4 h-4 text-accent-violet" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z"/></svg>
                        </div>
                        <h3 class="font-display font-semibold text-sm text-light">Content Gaps</h3>
                    </div>
                    <p class="text-xs text-muted mb-3">AI-identified content gaps in your topic coverage.</p>
                    <div class="text-center py-6 text-muted/40">
                        <p class="text-xs font-mono">Coming in v2.1</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Attach research listener
    const btn = container.querySelector('#btn-intel-research');
    const input = container.querySelector('#intel-topic');

    btn?.addEventListener('click', () => runResearch(container));
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') runResearch(container);
    });
}

async function runResearch(container) {
    const topic = container.querySelector('#intel-topic').value.trim();
    if (!topic) { toast('Enter a research topic', 'error'); return; }

    const btn = container.querySelector('#btn-intel-research');
    const loadingEl = container.querySelector('#intel-loading');
    const resultEl = container.querySelector('#intel-result');

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div><span>Researching...</span>';
    loadingEl.classList.remove('hidden');
    resultEl.classList.add('hidden');

    try {
        const data = await apiPost('/api/blog/research', { topic, category: 'aethermind' });
        const research = data.research || data;
        resultEl.textContent = typeof research === 'string' ? research : JSON.stringify(research, null, 2);
        resultEl.classList.remove('hidden');
        toast('Research complete!', 'success');
    } catch (err) {
        toast(`Research failed: ${err.message}`, 'error');
    } finally {
        loadingEl.classList.add('hidden');
        btn.disabled = false;
        btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg><span>Run Research</span>';
    }
}
