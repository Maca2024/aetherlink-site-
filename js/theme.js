/* ── AetherLink Theme Toggle ── */
(function() {
    const STORAGE_KEY = 'aetherlink-theme';

    function getPreferred() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
        return 'dark';
    }

    function apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(STORAGE_KEY, theme);
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }
    }

    // Apply immediately to prevent flash
    apply(getPreferred());

    // Toggle on click
    document.addEventListener('DOMContentLoaded', function() {
        var btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.addEventListener('click', function() {
                var current = document.documentElement.getAttribute('data-theme') || 'dark';
                apply(current === 'dark' ? 'light' : 'dark');
            });
        }
    });
})();
