// ── AetherLink Command Center — CRM Dashboard ──
// Contacts list, activity feed, relationship management

export async function render(container) {
    container.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 class="font-display text-2xl font-bold text-light">Community CRM</h1>
                    <p class="text-sm text-muted mt-1">Contacts, relationships, and engagement tracking</p>
                </div>
                <button id="btn-add-contact" class="btn-primary btn-sm" disabled>
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/></svg>
                    <span>Add Contact</span>
                </button>
            </div>

            <!-- Filter Tabs -->
            <div class="flex flex-wrap gap-2">
                <button class="filter-btn active" data-filter="all">All</button>
                <button class="filter-btn" data-filter="lead">Leads</button>
                <button class="filter-btn" data-filter="client">Clients</button>
                <button class="filter-btn" data-filter="partner">Partners</button>
                <button class="filter-btn" data-filter="subscriber">Subscribers</button>
            </div>

            <!-- Contacts List -->
            <div class="glass rounded-2xl overflow-hidden">
                <!-- Table Header -->
                <div class="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-xs text-muted font-display font-medium uppercase tracking-wider border-b border-white/5">
                    <div class="col-span-4">Contact</div>
                    <div class="col-span-2">Type</div>
                    <div class="col-span-3">Email</div>
                    <div class="col-span-2">Last Active</div>
                    <div class="col-span-1 text-right">Actions</div>
                </div>

                <!-- Empty State -->
                <div class="empty-state">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
                    <h3 class="font-display font-semibold text-light text-lg mb-1">No contacts yet</h3>
                    <p class="text-sm mb-4">Start building your community by adding contacts or importing from a CSV.</p>
                    <div class="flex items-center justify-center gap-3">
                        <button class="btn-primary btn-sm" disabled>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"/></svg>
                            <span>Add Contact</span>
                        </button>
                        <button class="btn-secondary btn-sm" disabled>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
                            <span>Import CSV</span>
                        </button>
                    </div>
                    <div class="mt-4 inline-flex items-center gap-2 text-xs text-muted/50 font-mono">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Full CRM coming in v2.2
                    </div>
                </div>
            </div>
        </div>
    `;
}
