// ── AetherLink Command Center — Social Dashboard ──
// Cross-post overview, social copy generation, scheduling

export async function render(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 class="font-display text-2xl font-bold text-light">Social Distribution</h1>
                    <p class="text-sm text-muted mt-1">Cross-posting, social copy generation, and scheduling</p>
                </div>
                <button class="btn-primary btn-sm" disabled>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"/></svg>
                    <span>Generate Social Copy</span>
                </button>
            </div>

            <!-- Platform Status -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <!-- LinkedIn -->
                <div class="glass rounded-2xl p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center">
                            <svg class="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </div>
                        <div>
                            <h3 class="font-display font-semibold text-sm text-light">LinkedIn</h3>
                            <span class="text-xs text-muted">Not connected</span>
                        </div>
                    </div>
                    <div class="space-y-2 text-xs text-muted">
                        <div class="flex justify-between"><span>Posts shared</span><span class="text-light font-semibold">0</span></div>
                        <div class="flex justify-between"><span>Last post</span><span>&mdash;</span></div>
                    </div>
                    <button class="btn-secondary btn-sm w-full justify-center mt-4" disabled>Connect</button>
                </div>

                <!-- Medium -->
                <div class="glass rounded-2xl p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zm7.42 0c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>
                        </div>
                        <div>
                            <h3 class="font-display font-semibold text-sm text-light">Medium</h3>
                            <span class="text-xs text-muted">Not connected</span>
                        </div>
                    </div>
                    <div class="space-y-2 text-xs text-muted">
                        <div class="flex justify-between"><span>Posts shared</span><span class="text-light font-semibold">0</span></div>
                        <div class="flex justify-between"><span>Last post</span><span>&mdash;</span></div>
                    </div>
                    <button class="btn-secondary btn-sm w-full justify-center mt-4" disabled>Connect</button>
                </div>

                <!-- X / Twitter -->
                <div class="glass rounded-2xl p-6">
                    <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </div>
                        <div>
                            <h3 class="font-display font-semibold text-sm text-light">X (Twitter)</h3>
                            <span class="text-xs text-muted">Not connected</span>
                        </div>
                    </div>
                    <div class="space-y-2 text-xs text-muted">
                        <div class="flex justify-between"><span>Posts shared</span><span class="text-light font-semibold">0</span></div>
                        <div class="flex justify-between"><span>Last post</span><span>&mdash;</span></div>
                    </div>
                    <button class="btn-secondary btn-sm w-full justify-center mt-4" disabled>Connect</button>
                </div>
            </div>

            <!-- Scheduler Placeholder -->
            <div class="glass rounded-2xl p-6">
                <h3 class="font-display font-semibold text-sm text-light mb-4">Post Scheduler</h3>
                <div class="text-center py-12 text-muted/40">
                    <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/></svg>
                    <p class="text-xs font-mono">Visual post scheduler &mdash; coming in v2.2</p>
                </div>
            </div>
        </div>
    `;
}
