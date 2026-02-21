// ── AetherLink Command Center — Stat Card Component ──
// Reusable KPI stat card with optional sparkline

import { formatNumber } from '../utils.js';

const COLOR_MAP = {
    cyan: { bg: 'rgba(0,212,255,0.1)', text: '#00d4ff' },
    violet: { bg: 'rgba(139,92,246,0.1)', text: '#8b5cf6' },
    emerald: { bg: 'rgba(0,223,162,0.1)', text: '#00dfa2' },
    muted: { bg: 'rgba(255,255,255,0.05)', text: '#6b7394' },
    red: { bg: 'rgba(239,68,68,0.1)', text: '#ef4444' },
};

/**
 * Render a stat card
 * @param {object} opts
 * @param {string} opts.title
 * @param {string|number} opts.value
 * @param {string} opts.icon - SVG string
 * @param {'cyan'|'violet'|'emerald'|'muted'|'red'} opts.color
 * @param {string} [opts.trend] - e.g. "+12%" or "-3%"
 * @param {number[]} [opts.sparkline] - array of values for sparkline
 * @returns {string} HTML
 */
export function renderStatCard({ title, value, icon, color = 'cyan', trend, sparkline }) {
    const c = COLOR_MAP[color] || COLOR_MAP.cyan;
    const formattedValue = typeof value === 'number' ? formatNumber(value) : (value ?? '--');
    const trendUp = trend && !trend.startsWith('-');
    const trendColor = trend ? (trendUp ? '#00dfa2' : '#ef4444') : '';
    const trendArrow = trend ? (trendUp
        ? '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/></svg>'
        : '<svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25"/></svg>'
    ) : '';

    let sparklineSvg = '';
    if (sparkline && sparkline.length > 1) {
        const max = Math.max(...sparkline);
        const min = Math.min(...sparkline);
        const range = max - min || 1;
        const w = 80;
        const h = 24;
        const points = sparkline.map((v, i) => {
            const x = (i / (sparkline.length - 1)) * w;
            const y = h - ((v - min) / range) * h;
            return `${x},${y}`;
        }).join(' ');
        sparklineSvg = `
            <svg width="${w}" height="${h}" class="ml-auto opacity-60">
                <polyline points="${points}" fill="none" stroke="${c.text}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
    }

    return `
        <div class="stat-card">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: ${c.bg}">
                        <span style="color: ${c.text}">${icon || ''}</span>
                    </div>
                    <span class="text-xs text-muted font-medium">${title}</span>
                </div>
                ${trend ? `
                    <div class="flex items-center gap-1 text-xs font-semibold" style="color: ${trendColor}">
                        ${trendArrow}
                        <span>${trend}</span>
                    </div>
                ` : ''}
            </div>
            <div class="flex items-end justify-between">
                <div class="text-2xl font-display font-bold" style="color: ${typeof value === 'number' && color !== 'muted' ? c.text : '#e4e8f1'}">${formattedValue}</div>
                ${sparklineSvg}
            </div>
        </div>
    `;
}
