/**
 * AETHER-ASSIST v2.1 — Premium AI Chat Widget
 * Features: ElevenLabs TTS, markdown + autolinks, suggested questions,
 *           page context, session persistence, clear chat
 * Vanilla JS — no dependencies
 */
(function () {
  'use strict';

  // ─── Config ───
  const API_URL = '/api/chat';
  const TTS_URL = '/api/tts';
  const STORAGE_KEY = 'aether-assist-session';
  const SESSION_TTL = 30 * 60 * 1000;

  // ─── i18n ───
  const i18n = {
    nl: {
      welcome: 'Hoi! Ik ben **AETHER**, de AI-assistent van AetherLink. Stel me een vraag over onze AI-diensten, of vertel me waar ik je mee kan helpen.',
      placeholder: 'Stel je vraag...',
      poweredBy: 'Powered by AetherLink.ai',
      clearChat: 'Nieuw gesprek',
      errorGeneric: 'Sorry, er ging iets mis. Probeer het opnieuw of neem contact op via info@aetherlink.ai.',
      suggestions: {
        index: [
          'Wat doet AetherLink precies?',
          'Welke AI-diensten bieden jullie?',
          'Vertel me over jullie team',
          'Ik wil een kennismakingsgesprek',
        ],
        aetherbot: [
          'Wat kost een chatbot?',
          'Hoe snel is AetherBot live?',
          'Welke integraties zijn mogelijk?',
          'Is het AVG-compliant?',
        ],
        aethermind: [
          'Wat is een AI Readiness Scan?',
          'Bieden jullie AI-training aan?',
          'Hoe werkt AI verandermanagement?',
          'Plan een vrijblijvend gesprek',
        ],
        aetherdev: [
          'Wat is agentic AI?',
          'Kunnen jullie een RAG-systeem bouwen?',
          'Welke technologieen gebruiken jullie?',
          'Hoe ziet het ontwikkelproces eruit?',
        ],
      },
    },
    en: {
      welcome: "Hi! I'm **AETHER**, the AI assistant of AetherLink. Ask me anything about our AI services, or tell me how I can help.",
      placeholder: 'Ask your question...',
      poweredBy: 'Powered by AetherLink.ai',
      clearChat: 'New chat',
      errorGeneric: 'Sorry, something went wrong. Please try again or contact us at info@aetherlink.ai.',
      suggestions: {
        index: [
          'What does AetherLink do?',
          'What AI services do you offer?',
          'Tell me about your team',
          'I want a free consultation',
        ],
        aetherbot: [
          'How much does a chatbot cost?',
          'How fast can AetherBot go live?',
          'What integrations are available?',
          'Is it GDPR-compliant?',
        ],
        aethermind: [
          'What is an AI Readiness Scan?',
          'Do you offer AI training?',
          'How does AI change management work?',
          'Schedule a free consultation',
        ],
        aetherdev: [
          'What is agentic AI?',
          'Can you build a RAG system?',
          'What technologies do you use?',
          'What does the dev process look like?',
        ],
      },
    },
    fi: {
      welcome: 'Hei! Olen **AETHER**, AetherLinkin tekoalyavustaja. Kysy minulta mitaa tahansa tekoalypalveluistamme tai kerro, miten voin auttaa.',
      placeholder: 'Kysy kysymyksesi...',
      poweredBy: 'Powered by AetherLink.ai',
      clearChat: 'Uusi keskustelu',
      errorGeneric: 'Anteeksi, jokin meni pieleen. Yrita uudelleen tai ota yhteytta: info@aetherlink.ai.',
      suggestions: {
        index: [
          'Mita AetherLink tekee?',
          'Mitka tekoalypalvelut tarjoatte?',
          'Kerro tiimistanne',
          'Haluan ilmaisen konsultaation',
        ],
        aetherbot: [
          'Mita chatbot maksaa?',
          'Kuinka nopeasti AetherBot toimii?',
          'Mitka integraatiot ovat mahdollisia?',
          'Onko se GDPR-yhteensopiva?',
        ],
        aethermind: [
          'Mika on AI Readiness Scan?',
          'Tarjoatteko tekoalykoulutusta?',
          'Miten tekoalyn muutoshallinta toimii?',
          'Varaa ilmainen konsultaatio',
        ],
        aetherdev: [
          'Mika on agentic AI?',
          'Voitteko rakentaa RAG-jarjestelman?',
          'Mitka teknologioita kaytattte?',
          'Milta kehitysprosessi nayttaa?',
        ],
      },
    },
  };

  // ─── Detect Context ───
  const lang = document.documentElement.lang || 'nl';
  const t = i18n[lang] || i18n.nl;

  function detectPageType() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('aetherbot')) return 'aetherbot';
    if (path.includes('aethermind')) return 'aethermind';
    if (path.includes('aetherdev')) return 'aetherdev';
    return 'index';
  }
  const pageType = detectPageType();
  const suggestions = t.suggestions[pageType] || t.suggestions.index;

  // ─── State ───
  let isOpen = false;
  let isLoading = false;
  let messages = [];
  let suggestionsShown = true;
  let currentAudio = null;
  let ttsPlayingIdx = -1;
  let ttsLoadingIdx = -1;

  // ─── Session Persistence ───
  function saveSession() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ messages, ts: Date.now(), page: pageType })
      );
    } catch {}
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (Date.now() - data.ts > SESSION_TTL) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  function initMessages() {
    const session = loadSession();
    if (session && session.messages && session.messages.length > 1) {
      messages = session.messages;
      suggestionsShown = false;
    } else {
      messages = [{ role: 'assistant', content: t.welcome }];
      suggestionsShown = true;
    }
  }
  initMessages();

  // ─── Markdown Renderer ───
  function renderMarkdown(text) {
    let html = escapeHtml(text);

    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* (not inside bold)
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    // Markdown links: [text](url)
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" class="aether-link">$1</a>'
    );
    // Autolink plain URLs (not already inside href="...")
    html = html.replace(
      /(?<!href=&quot;|href=")(https?:\/\/[^\s<,)]+)/g,
      '<a href="$1" target="_blank" rel="noopener" class="aether-link">$1</a>'
    );
    // Email links
    html = html.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1" class="aether-link">$1</a>'
    );
    // Inline code: `code`
    html = html.replace(/`([^`]+)`/g, '<code class="aether-code">$1</code>');

    // Unordered lists: lines starting with - or *
    html = html.replace(/^(?:- |\* )(.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="aether-list">$1</ul>');

    // Paragraphs: double newlines
    html = html.replace(/\n\n/g, '</p><p>');
    // Single newlines
    html = html.replace(/\n/g, '<br>');

    return '<p>' + html + '</p>';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ─── TTS ───
  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio = null;
    }
    ttsPlayingIdx = -1;
    ttsLoadingIdx = -1;
  }

  async function playTTS(msgIdx) {
    const msg = messages[msgIdx];
    if (!msg || msg.role !== 'assistant' || !msg.content) return;

    // Toggle off if already playing this message
    if (ttsPlayingIdx === msgIdx) {
      stopAudio();
      renderMessages();
      return;
    }

    // Stop any current playback
    stopAudio();

    ttsLoadingIdx = msgIdx;
    renderMessages();

    try {
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content }),
      });

      if (!response.ok) {
        ttsLoadingIdx = -1;
        renderMessages();
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(url);
        ttsPlayingIdx = -1;
        currentAudio = null;
        renderMessages();
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        ttsPlayingIdx = -1;
        ttsLoadingIdx = -1;
        currentAudio = null;
        renderMessages();
      });

      currentAudio = audio;
      ttsLoadingIdx = -1;
      ttsPlayingIdx = msgIdx;
      renderMessages();
      await audio.play();
    } catch {
      ttsLoadingIdx = -1;
      ttsPlayingIdx = -1;
      currentAudio = null;
      renderMessages();
    }
  }

  // ─── SVG Icons ───
  const ICON_SPEAKER = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
  const ICON_STOP = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>';
  const ICON_LOADING = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="aether-tts-spin"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>';

  // ─── Inject Styles ───
  const style = document.createElement('style');
  style.textContent = `
    /* ═══════ AETHER-ASSIST v2.1 Widget Styles ═══════ */

    /* Chat FAB Button */
    .aether-assist-btn {
      position: fixed; bottom: 24px; right: 24px; z-index: 99999;
      width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer;
      background: linear-gradient(135deg, #00d4ff 0%, #8b5cf6 50%, #00dfa2 100%);
      box-shadow: 0 4px 24px rgba(0,212,255,0.3), 0 0 40px rgba(139,92,246,0.15);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      animation: aether-pulse 3s ease-in-out infinite;
    }
    .aether-assist-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 32px rgba(0,212,255,0.45), 0 0 60px rgba(139,92,246,0.25);
    }
    .aether-assist-btn.open { animation: none; transform: scale(1); }
    .aether-assist-btn svg { width: 28px; height: 28px; fill: white; transition: transform 0.3s ease; }
    .aether-assist-btn.open svg { transform: rotate(90deg); }

    @keyframes aether-pulse {
      0%, 100% { box-shadow: 0 4px 24px rgba(0,212,255,0.3), 0 0 40px rgba(139,92,246,0.15); }
      50% { box-shadow: 0 4px 32px rgba(0,212,255,0.5), 0 0 60px rgba(139,92,246,0.3); }
    }

    /* Chat Panel */
    .aether-assist-panel {
      position: fixed; bottom: 96px; right: 24px; z-index: 99998;
      width: 420px; max-width: calc(100vw - 32px); height: 580px; max-height: calc(100vh - 140px);
      border-radius: 20px; overflow: hidden;
      background: rgba(10, 13, 26, 0.94);
      backdrop-filter: blur(40px) saturate(1.2); -webkit-backdrop-filter: blur(40px) saturate(1.2);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(0,212,255,0.08),
                  inset 0 1px 0 rgba(255,255,255,0.05);
      display: flex; flex-direction: column;
      opacity: 0; transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .aether-assist-panel.open {
      opacity: 1; transform: translateY(0) scale(1); pointer-events: all;
    }

    /* Header */
    .aether-assist-header {
      padding: 14px 16px; display: flex; align-items: center; gap: 12px;
      background: linear-gradient(135deg, rgba(0,212,255,0.06), rgba(139,92,246,0.06));
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .aether-assist-avatar {
      width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
      background: linear-gradient(135deg, #00d4ff, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; color: white; font-weight: 700;
      font-family: 'Syne', sans-serif;
      box-shadow: 0 2px 12px rgba(0,212,255,0.3);
    }
    .aether-assist-header-info { flex: 1; min-width: 0; }
    .aether-assist-header-info h3 {
      margin: 0; font-family: 'Syne', sans-serif; font-size: 14px;
      font-weight: 700; color: #e4e8f1; letter-spacing: 0.5px;
    }
    .aether-assist-header-info p {
      margin: 2px 0 0; font-size: 11px; color: #6b7394;
    }
    .aether-assist-status {
      width: 8px; height: 8px; border-radius: 50%; background: #00dfa2;
      flex-shrink: 0;
      box-shadow: 0 0 8px rgba(0,223,162,0.5);
      animation: aether-status-pulse 2s ease-in-out infinite;
    }
    .aether-assist-clear {
      background: none; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px;
      color: #6b7394; font-size: 11px; padding: 4px 10px; cursor: pointer;
      font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; flex-shrink: 0;
    }
    .aether-assist-clear:hover { color: #e4e8f1; border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
    @keyframes aether-status-pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
    }

    /* Messages */
    .aether-assist-messages {
      flex: 1; overflow-y: auto; padding: 16px 14px 8px;
      scroll-behavior: smooth;
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
    }
    .aether-assist-messages::-webkit-scrollbar { width: 4px; }
    .aether-assist-messages::-webkit-scrollbar-track { background: transparent; }
    .aether-assist-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .aether-msg {
      max-width: 88%; margin-bottom: 10px; animation: aether-msg-in 0.3s ease;
    }
    .aether-msg-user { margin-left: auto; }
    .aether-msg-assistant { margin-right: auto; }

    .aether-msg-bubble {
      padding: 10px 14px; font-size: 13.5px; line-height: 1.6;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      word-wrap: break-word;
    }
    .aether-msg-bubble p { margin: 0 0 8px; }
    .aether-msg-bubble p:last-child { margin-bottom: 0; }

    .aether-msg-user .aether-msg-bubble {
      background: linear-gradient(135deg, rgba(0,212,255,0.18), rgba(139,92,246,0.12));
      border: 1px solid rgba(0,212,255,0.15);
      border-radius: 16px 16px 4px 16px; color: #e4e8f1;
    }
    .aether-msg-assistant .aether-msg-bubble {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px 16px 16px 4px; color: #c8cee0;
    }

    /* Markdown elements */
    .aether-msg-bubble strong { color: #e4e8f1; font-weight: 600; }
    .aether-msg-bubble em { font-style: italic; }
    .aether-link {
      color: #00d4ff; text-decoration: none; border-bottom: 1px solid rgba(0,212,255,0.3);
      transition: all 0.2s; cursor: pointer;
    }
    .aether-link:hover { border-color: #00d4ff; color: #4de5ff; }
    .aether-code {
      background: rgba(0,212,255,0.08); padding: 1px 6px; border-radius: 4px;
      font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #00d4ff;
    }
    .aether-list {
      margin: 6px 0; padding-left: 18px; list-style: none;
    }
    .aether-list li {
      position: relative; padding-left: 2px; margin-bottom: 4px;
    }
    .aether-list li::before {
      content: ''; position: absolute; left: -14px; top: 8px;
      width: 5px; height: 5px; border-radius: 50%;
      background: linear-gradient(135deg, #00d4ff, #8b5cf6);
    }

    @keyframes aether-msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* TTS Button */
    .aether-msg-actions {
      display: flex; gap: 4px; margin-top: 6px;
    }
    .aether-tts-btn {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; padding: 4px 10px; cursor: pointer;
      color: #6b7394; font-size: 11px; display: flex; align-items: center; gap: 5px;
      font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s;
      line-height: 1;
    }
    .aether-tts-btn:hover { color: #00d4ff; border-color: rgba(0,212,255,0.25); background: rgba(0,212,255,0.06); }
    .aether-tts-btn.playing { color: #00dfa2; border-color: rgba(0,223,162,0.3); background: rgba(0,223,162,0.06); }
    .aether-tts-btn.loading { color: #8b5cf6; border-color: rgba(139,92,246,0.25); }
    .aether-tts-btn svg { flex-shrink: 0; }

    @keyframes aether-tts-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .aether-tts-spin { animation: aether-tts-spin 1s linear infinite; }

    /* Suggested Questions */
    .aether-suggestions {
      display: flex; flex-wrap: wrap; gap: 6px; padding: 0 14px 12px;
      animation: aether-msg-in 0.4s ease 0.2s both;
    }
    .aether-suggest-chip {
      background: rgba(0,212,255,0.06); border: 1px solid rgba(0,212,255,0.15);
      border-radius: 20px; padding: 6px 14px; font-size: 12px;
      color: #8ba4c8; cursor: pointer; transition: all 0.2s;
      font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap;
    }
    .aether-suggest-chip:hover {
      background: rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.3);
      color: #00d4ff; transform: translateY(-1px);
    }

    /* Typing indicator */
    .aether-typing { display: flex; gap: 4px; padding: 12px 16px; }
    .aether-typing span {
      width: 6px; height: 6px; border-radius: 50%; background: #6b7394;
      animation: aether-bounce 1.4s ease-in-out infinite;
    }
    .aether-typing span:nth-child(2) { animation-delay: 0.16s; }
    .aether-typing span:nth-child(3) { animation-delay: 0.32s; }
    @keyframes aether-bounce {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-6px); opacity: 1; }
    }

    /* Input Area */
    .aether-assist-input {
      padding: 12px 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
      background: rgba(5,6,15,0.5);
    }
    .aether-assist-input-row {
      display: flex; gap: 8px; align-items: flex-end;
    }
    .aether-assist-textarea {
      flex: 1; resize: none; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; padding: 10px 14px; font-size: 13.5px;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: rgba(255,255,255,0.04); color: #e4e8f1;
      outline: none; max-height: 100px; min-height: 40px;
      transition: border-color 0.2s;
      scrollbar-width: none;
    }
    .aether-assist-textarea::-webkit-scrollbar { display: none; }
    .aether-assist-textarea:focus { border-color: rgba(0,212,255,0.3); }
    .aether-assist-textarea::placeholder { color: #4a5068; }

    .aether-assist-send {
      width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #00d4ff, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,212,255,0.2);
    }
    .aether-assist-send:hover { transform: scale(1.05); box-shadow: 0 2px 16px rgba(0,212,255,0.35); }
    .aether-assist-send:disabled { opacity: 0.3; cursor: not-allowed; transform: none; box-shadow: none; }
    .aether-assist-send svg { width: 18px; height: 18px; fill: white; }

    .aether-assist-footer {
      text-align: center; padding: 6px 0 8px; font-size: 10px; color: #3d4460;
      font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: 0.3px;
    }

    /* Light mode */
    [data-theme="light"] .aether-assist-panel {
      background: rgba(245, 243, 248, 0.96);
      border-color: rgba(0,0,0,0.08);
      box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 0 40px rgba(0,212,255,0.04);
    }
    [data-theme="light"] .aether-assist-header {
      background: linear-gradient(135deg, rgba(0,212,255,0.05), rgba(139,92,246,0.05));
      border-bottom-color: rgba(0,0,0,0.06);
    }
    [data-theme="light"] .aether-assist-header-info h3 { color: #1a1f35; }
    [data-theme="light"] .aether-assist-header-info p { color: #6b7394; }
    [data-theme="light"] .aether-assist-clear { color: #6b7394; border-color: rgba(0,0,0,0.1); }
    [data-theme="light"] .aether-assist-clear:hover { color: #1a1f35; background: rgba(0,0,0,0.03); }
    [data-theme="light"] .aether-msg-user .aether-msg-bubble {
      background: linear-gradient(135deg, rgba(0,212,255,0.12), rgba(139,92,246,0.08));
      border-color: rgba(0,212,255,0.12); color: #1a1f35;
    }
    [data-theme="light"] .aether-msg-assistant .aether-msg-bubble {
      background: rgba(255,255,255,0.8); border-color: rgba(0,0,0,0.06); color: #2a2f45;
    }
    [data-theme="light"] .aether-msg-bubble strong { color: #1a1f35; }
    [data-theme="light"] .aether-suggest-chip {
      background: rgba(0,212,255,0.04); border-color: rgba(0,0,0,0.1); color: #4a5068;
    }
    [data-theme="light"] .aether-suggest-chip:hover {
      background: rgba(0,212,255,0.08); border-color: rgba(0,212,255,0.25); color: #0090b0;
    }
    [data-theme="light"] .aether-tts-btn { color: #6b7394; border-color: rgba(0,0,0,0.1); }
    [data-theme="light"] .aether-tts-btn:hover { color: #0077cc; background: rgba(0,119,204,0.04); }
    [data-theme="light"] .aether-assist-input { background: rgba(255,255,255,0.5); border-top-color: rgba(0,0,0,0.06); }
    [data-theme="light"] .aether-assist-textarea {
      background: rgba(255,255,255,0.7); border-color: rgba(0,0,0,0.1); color: #1a1f35;
    }
    [data-theme="light"] .aether-assist-textarea::placeholder { color: #8b91a8; }
    [data-theme="light"] .aether-assist-footer { color: #a0a5b8; }
    [data-theme="light"] .aether-link { color: #0077cc; border-color: rgba(0,119,204,0.3); }
    [data-theme="light"] .aether-link:hover { color: #005fa3; }
    [data-theme="light"] .aether-code { background: rgba(0,119,204,0.06); color: #0077cc; }

    /* Mobile */
    @media (max-width: 480px) {
      .aether-assist-panel {
        width: calc(100vw - 16px); right: 8px; bottom: 88px;
        height: calc(100vh - 120px); max-height: none;
        border-radius: 16px;
      }
      .aether-assist-btn { width: 54px; height: 54px; bottom: 20px; right: 16px; }
      .aether-suggest-chip { font-size: 11px; padding: 5px 11px; }
    }
  `;
  document.head.appendChild(style);

  // ─── Create DOM ───
  const btn = document.createElement('button');
  btn.className = 'aether-assist-btn';
  btn.setAttribute('aria-label', 'Chat met AETHER');
  btn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>';

  const panel = document.createElement('div');
  panel.className = 'aether-assist-panel';
  panel.innerHTML = `
    <div class="aether-assist-header">
      <div class="aether-assist-avatar">A</div>
      <div class="aether-assist-header-info">
        <h3>AETHER</h3>
        <p>AI Assistant &bull; AetherLink.ai</p>
      </div>
      <div class="aether-assist-status"></div>
      <button class="aether-assist-clear" id="aether-clear" title="${t.clearChat}">${t.clearChat}</button>
    </div>
    <div class="aether-assist-messages" id="aether-messages"></div>
    <div class="aether-assist-input">
      <div class="aether-assist-input-row">
        <textarea class="aether-assist-textarea" id="aether-input"
          placeholder="${t.placeholder}" rows="1"></textarea>
        <button class="aether-assist-send" id="aether-send" disabled>
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div class="aether-assist-footer">${t.poweredBy}</div>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const messagesEl = document.getElementById('aether-messages');
  const inputEl = document.getElementById('aether-input');
  const sendBtn = document.getElementById('aether-send');
  const clearBtn = document.getElementById('aether-clear');

  // ─── Render ───
  function renderMessages() {
    messagesEl.innerHTML = '';

    messages.forEach((msg, idx) => {
      const div = document.createElement('div');
      div.className = `aether-msg aether-msg-${msg.role}`;

      if (msg.role === 'assistant') {
        const bubbleHtml = renderMarkdown(msg.content);

        // Build TTS button for completed assistant messages (not empty, not loading chat)
        let actionsHtml = '';
        if (msg.content && msg.content.length > 5 && !isLoading) {
          const isPlaying = ttsPlayingIdx === idx;
          const isTtsLoading = ttsLoadingIdx === idx;
          const btnClass = isPlaying ? 'playing' : isTtsLoading ? 'loading' : '';
          const icon = isTtsLoading ? ICON_LOADING : isPlaying ? ICON_STOP : ICON_SPEAKER;
          const label = isPlaying ? 'Stop' : isTtsLoading ? '...' : (lang === 'fi' ? 'Kuuntele' : lang === 'en' ? 'Listen' : 'Luister');

          actionsHtml = `<div class="aether-msg-actions"><button class="aether-tts-btn ${btnClass}" data-tts-idx="${idx}">${icon}<span>${label}</span></button></div>`;
        }

        div.innerHTML = `<div class="aether-msg-bubble">${bubbleHtml}</div>${actionsHtml}`;
      } else {
        div.innerHTML = `<div class="aether-msg-bubble">${escapeHtml(msg.content)}</div>`;
      }
      messagesEl.appendChild(div);
    });

    // Suggestions
    if (suggestionsShown && messages.length === 1 && messages[0].role === 'assistant') {
      const suggestionsDiv = document.createElement('div');
      suggestionsDiv.className = 'aether-suggestions';
      suggestions.forEach((q) => {
        const chip = document.createElement('button');
        chip.className = 'aether-suggest-chip';
        chip.textContent = q;
        chip.addEventListener('click', () => {
          inputEl.value = q;
          suggestionsShown = false;
          sendMessage();
        });
        suggestionsDiv.appendChild(chip);
      });
      messagesEl.appendChild(suggestionsDiv);
    }

    if (isLoading) {
      const typing = document.createElement('div');
      typing.className = 'aether-msg aether-msg-assistant';
      typing.innerHTML = '<div class="aether-msg-bubble"><div class="aether-typing"><span></span><span></span><span></span></div></div>';
      messagesEl.appendChild(typing);
    }

    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ─── TTS Click Delegation ───
  messagesEl.addEventListener('click', (e) => {
    const ttsBtn = e.target.closest('.aether-tts-btn');
    if (!ttsBtn) return;
    const idx = parseInt(ttsBtn.dataset.ttsIdx, 10);
    if (!isNaN(idx)) playTTS(idx);
  });

  // ─── Auto-resize textarea ───
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    sendBtn.disabled = !inputEl.value.trim() || isLoading;
  });

  // ─── Toggle Panel ───
  btn.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    btn.classList.toggle('open', isOpen);
    btn.innerHTML = isOpen
      ? '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>';
    if (isOpen) setTimeout(() => inputEl.focus(), 300);
  });

  // ─── Clear Chat ───
  clearBtn.addEventListener('click', () => {
    stopAudio();
    messages = [{ role: 'assistant', content: t.welcome }];
    suggestionsShown = true;
    isLoading = false;
    saveSession();
    renderMessages();
  });

  // ─── Send Message ───
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    messages.push({ role: 'user', content: text });
    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    isLoading = true;
    suggestionsShown = false;
    renderMessages();

    try {
      const apiMessages = messages
        .filter((m, i) => !(i === 0 && m.role === 'assistant'))
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          pageContext: pageType,
          lang: lang,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      messages.push({ role: 'assistant', content: '' });
      isLoading = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantContent += parsed.text;
                messages[messages.length - 1].content = assistantContent;
                renderMessages();
              }
            } catch {}
          }
        }
      }

      if (!assistantContent) {
        messages[messages.length - 1].content = t.errorGeneric;
      }
    } catch (error) {
      isLoading = false;
      const errorMsg = error.message.includes('veel berichten') || error.message.includes('Too many') || error.message.includes('Liian monta')
        ? error.message
        : t.errorGeneric;
      messages.push({ role: 'assistant', content: errorMsg });
    }

    isLoading = false;
    saveSession();
    renderMessages();
    sendBtn.disabled = false;
  }

  // ─── Event Listeners ───
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ─── Initial Render ───
  renderMessages();
})();
