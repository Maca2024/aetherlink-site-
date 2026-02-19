/**
 * AETHER-ASSIST v3.0 — Premium AI Chat Widget
 * Features: ElevenLabs TTS, voice input (STT), streaming without flicker,
 *           markdown + autolinks, suggested questions, page context, session persistence
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
      listening: 'Luisteren...',
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
      listening: 'Listening...',
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
      listening: 'Kuuntelee...',
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
  let isStreaming = false;
  let messages = [];
  let suggestionsShown = true;
  let currentAudio = null;
  let ttsPlayingIdx = -1;
  let ttsLoadingIdx = -1;
  let isListening = false;
  let recognition = null;

  // Streaming render optimization
  let streamRAF = null;
  let streamDirty = false;
  let streamBubbleEl = null;

  // ─── Self-Learning Loop ───
  const LEARNING_KEY = 'aether-learning-v1';
  const MAX_LEARNINGS = 20;

  function getLearnings() {
    try {
      const raw = localStorage.getItem(LEARNING_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }

  function saveLearning(userMsg, assistantMsg) {
    if (!userMsg || !assistantMsg || userMsg.length < 5) return;
    try {
      const learnings = getLearnings();
      // Extract topic from user message (first 80 chars)
      const topic = userMsg.slice(0, 80);
      // Extract insight: what the user was interested in
      const insight = extractInsight(userMsg, assistantMsg);
      learnings.push({ topic, insight, ts: Date.now() });
      // Keep only recent learnings
      const trimmed = learnings.slice(-MAX_LEARNINGS);
      localStorage.setItem(LEARNING_KEY, JSON.stringify(trimmed));
    } catch {}
  }

  function extractInsight(userMsg, assistantMsg) {
    const msg = userMsg.toLowerCase();
    if (msg.includes('prijs') || msg.includes('kost') || msg.includes('price') || msg.includes('cost') || msg.includes('euro') || msg.includes('€'))
      return 'Geinteresseerd in prijzen/kosten';
    if (msg.includes('bot') || msg.includes('chatbot'))
      return 'Geinteresseerd in AetherBot chatbot platform';
    if (msg.includes('consult') || msg.includes('train') || msg.includes('workshop') || msg.includes('mind'))
      return 'Geinteresseerd in AetherMIND consultancy/training';
    if (msg.includes('dev') || msg.includes('bouw') || msg.includes('build') || msg.includes('custom') || msg.includes('maatwerk'))
      return 'Geinteresseerd in AetherDEV maatwerk ontwikkeling';
    if (msg.includes('team') || msg.includes('wie') || msg.includes('who'))
      return 'Vroeg over het team/wie erachter zit';
    if (msg.includes('technolog') || msg.includes('stack') || msg.includes('claude') || msg.includes('ai'))
      return 'Geinteresseerd in technologie/AI architectuur';
    if (msg.includes('contact') || msg.includes('afspraak') || msg.includes('bel') || msg.includes('call') || msg.includes('meeting'))
      return 'Wil contact opnemen/afspraak maken';
    if (msg.includes('integra') || msg.includes('wordpress') || msg.includes('shopify'))
      return 'Geinteresseerd in integraties';
    if (msg.includes('eu ai') || msg.includes('avg') || msg.includes('gdpr') || msg.includes('complian'))
      return 'Vraagt naar compliance/AVG/EU AI Act';
    // Default: use truncated message as insight
    return 'Vroeg: ' + userMsg.slice(0, 60);
  }

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
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" class="aether-link">$1</a>'
    );
    html = html.replace(
      /(?<!href=&quot;|href=")(https?:\/\/[^\s<,)]+)/g,
      '<a href="$1" target="_blank" rel="noopener" class="aether-link">$1</a>'
    );
    html = html.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      '<a href="mailto:$1" class="aether-link">$1</a>'
    );
    html = html.replace(/`([^`]+)`/g, '<code class="aether-code">$1</code>');
    html = html.replace(/^(?:- |\* )(.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul class="aether-list">$1</ul>');
    // ## Headings
    html = html.replace(/^## (.+)$/gm, '<strong class="aether-heading">$1</strong>');
    html = html.replace(/\n\n/g, '</p><p>');
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
    if (ttsPlayingIdx === msgIdx) {
      stopAudio();
      updateTTSButtons();
      return;
    }
    stopAudio();
    ttsLoadingIdx = msgIdx;
    updateTTSButtons();

    try {
      const response = await fetch(TTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: msg.content }),
      });
      if (!response.ok) {
        ttsLoadingIdx = -1;
        updateTTSButtons();
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(url);
        ttsPlayingIdx = -1;
        currentAudio = null;
        updateTTSButtons();
      });
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        ttsPlayingIdx = -1;
        ttsLoadingIdx = -1;
        currentAudio = null;
        updateTTSButtons();
      });
      currentAudio = audio;
      ttsLoadingIdx = -1;
      ttsPlayingIdx = msgIdx;
      updateTTSButtons();
      await audio.play();
    } catch {
      ttsLoadingIdx = -1;
      ttsPlayingIdx = -1;
      currentAudio = null;
      updateTTSButtons();
    }
  }

  // Update only TTS button states — no full re-render
  function updateTTSButtons() {
    document.querySelectorAll('.aether-tts-btn').forEach((btn) => {
      const idx = parseInt(btn.dataset.ttsIdx, 10);
      const isPlaying = ttsPlayingIdx === idx;
      const isTtsLoading = ttsLoadingIdx === idx;
      btn.className = 'aether-tts-btn' + (isPlaying ? ' playing' : isTtsLoading ? ' loading' : '');
      const iconEl = btn.querySelector('.aether-tts-icon');
      const labelEl = btn.querySelector('span');
      if (iconEl) iconEl.innerHTML = isTtsLoading ? ICON_LOADING : isPlaying ? ICON_STOP : ICON_SPEAKER;
      if (labelEl) labelEl.textContent = isPlaying ? 'Stop' : isTtsLoading ? '...' : (lang === 'fi' ? 'Kuuntele' : lang === 'en' ? 'Listen' : 'Luister');
    });
  }

  // ─── Voice Input (STT) ───
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const hasSTT = !!SpeechRecognition;

  function initRecognition() {
    if (!hasSTT) return;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = lang === 'fi' ? 'fi-FI' : lang === 'en' ? 'en-US' : 'nl-NL';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      inputEl.value = transcript;
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
      sendBtn.disabled = !transcript.trim();

      // Auto-send on final result
      if (event.results[event.results.length - 1].isFinal) {
        stopListening();
        if (transcript.trim()) {
          setTimeout(() => sendMessage(), 150);
        }
      }
    };

    recognition.onerror = () => stopListening();
    recognition.onend = () => stopListening();
  }

  function startListening() {
    if (!recognition || isListening || isStreaming) return;
    isListening = true;
    inputEl.placeholder = t.listening;
    updateMicButton();
    try {
      recognition.start();
    } catch {
      stopListening();
    }
  }

  function stopListening() {
    if (!isListening) return;
    isListening = false;
    inputEl.placeholder = t.placeholder;
    updateMicButton();
    try { recognition.stop(); } catch {}
  }

  function updateMicButton() {
    const micBtn = document.getElementById('aether-mic');
    if (!micBtn) return;
    micBtn.classList.toggle('active', isListening);
  }

  // ─── SVG Icons ───
  const ICON_SPEAKER = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
  const ICON_STOP = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>';
  const ICON_LOADING = '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="aether-tts-spin"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>';

  // ─── Inject Styles ───
  const style = document.createElement('style');
  style.textContent = `
    /* ═══════ AETHER-ASSIST v3.0 Widget Styles ═══════ */

    /* ── Walking Robot FAB ── */
    .aether-assist-btn {
      position: fixed; bottom: 12px; z-index: 99999;
      width: 68px; height: 90px; border: none; cursor: pointer;
      background: none;
      display: flex; align-items: flex-start; justify-content: center;
      perspective: 200px;
      -webkit-tap-highlight-color: transparent;
      /* position controlled by JS — right: auto, left via transform */
      right: auto; left: 0;
      transition: none;
    }
    .aether-assist-btn.walking {
      animation: aether-bob 0.5s ease-in-out infinite;
    }
    .aether-assist-btn.open { animation: none; }

    @keyframes aether-bob {
      0%, 100% { padding-top: 0; }
      50% { padding-top: 3px; }
    }

    /* Robot container */
    .aether-robo {
      position: relative; width: 58px; height: 80px;
      transform-style: preserve-3d;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .aether-assist-btn:hover .aether-robo {
      transform: rotateY(-12deg) rotateX(8deg) scale(1.08);
    }
    .aether-assist-btn.open .aether-robo {
      transform: rotateY(180deg);
    }
    /* Flip robot body when walking left */
    .aether-assist-btn.facing-left .aether-robo {
      transform: scaleX(-1);
    }
    .aether-assist-btn.facing-left:hover .aether-robo {
      transform: scaleX(-1) rotateY(-12deg) rotateX(8deg) scale(1.08);
    }
    .aether-assist-btn.open.facing-left .aether-robo {
      transform: rotateY(180deg);
    }

    /* Shadow on ground */
    .aether-robo::after {
      content: ''; position: absolute; bottom: 2px; left: 50%; transform: translateX(-50%);
      width: 40px; height: 8px; border-radius: 50%;
      background: radial-gradient(ellipse, rgba(0,212,255,0.25) 0%, transparent 70%);
    }
    .aether-assist-btn.walking .aether-robo::after {
      animation: aether-shadow 0.5s ease-in-out infinite;
    }
    @keyframes aether-shadow {
      0%, 100% { width: 40px; opacity: 0.5; }
      50% { width: 34px; opacity: 0.3; }
    }

    /* ── Legs ── */
    .aether-robo-legs {
      position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 10px;
      backface-visibility: hidden;
    }
    .aether-robo-leg {
      width: 8px; height: 16px; border-radius: 0 0 4px 4px;
      background: linear-gradient(to bottom, #161d3a, #0e1225);
      border: 1px solid rgba(0,212,255,0.15);
      border-top: none;
      transform-origin: top center;
    }
    /* Walking animation on legs */
    .aether-assist-btn.walking .aether-robo-leg.left {
      animation: aether-leg-l 0.5s ease-in-out infinite;
    }
    .aether-assist-btn.walking .aether-robo-leg.right {
      animation: aether-leg-r 0.5s ease-in-out infinite;
    }
    @keyframes aether-leg-l {
      0%, 100% { transform: rotate(-18deg); }
      50% { transform: rotate(18deg); }
    }
    @keyframes aether-leg-r {
      0%, 100% { transform: rotate(18deg); }
      50% { transform: rotate(-18deg); }
    }
    /* When stopped (not walking, not open) - legs neutral */
    .aether-assist-btn:not(.walking):not(.open) .aether-robo-leg {
      animation: none; transform: rotate(0);
    }
    /* Feet */
    .aether-robo-leg::after {
      content: ''; position: absolute; bottom: -3px; left: -2px;
      width: 12px; height: 4px; border-radius: 3px;
      background: #0e1225;
      border: 1px solid rgba(0,212,255,0.12);
    }

    /* Head */
    .aether-robo-head {
      position: absolute; top: 12px; left: 3px;
      width: 52px; height: 42px;
      border-radius: 16px 16px 12px 12px;
      background: linear-gradient(170deg, #1a2040 0%, #0e1225 50%, #161d3a 100%);
      border: 1.5px solid rgba(0,212,255,0.25);
      box-shadow:
        0 6px 20px rgba(0,0,0,0.5),
        0 0 20px rgba(0,212,255,0.1),
        inset 0 1px 0 rgba(255,255,255,0.08),
        inset 0 -4px 12px rgba(0,0,0,0.3);
      backface-visibility: hidden;
    }

    /* Close X (backface of robot head) */
    .aether-robo-close {
      position: absolute; top: 12px; left: 3px;
      width: 52px; height: 42px;
      border-radius: 16px 16px 12px 12px;
      background: linear-gradient(170deg, #2a1030 0%, #1a0820 50%, #2d1540 100%);
      border: 1.5px solid rgba(139,92,246,0.3);
      box-shadow: 0 6px 20px rgba(0,0,0,0.5), 0 0 15px rgba(139,92,246,0.1);
      backface-visibility: hidden;
      transform: rotateY(180deg);
      display: flex; align-items: center; justify-content: center;
    }
    .aether-robo-close svg { width: 20px; height: 20px; }

    /* Eyes */
    .aether-robo-eyes {
      position: absolute; top: 20px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 12px;
      backface-visibility: hidden;
    }
    .aether-robo-eye {
      width: 10px; height: 10px; border-radius: 3px;
      background: #00d4ff;
      box-shadow: 0 0 8px rgba(0,212,255,0.8), 0 0 20px rgba(0,212,255,0.3), inset 0 0 3px rgba(255,255,255,0.5);
      animation: aether-blink 4s ease-in-out infinite;
    }
    .aether-robo-eye:nth-child(2) { animation-delay: 0.1s; }
    @keyframes aether-blink {
      0%, 42%, 46%, 100% { height: 10px; opacity: 1; }
      44% { height: 2px; opacity: 0.8; }
    }

    /* Mouth / grille */
    .aether-robo-mouth {
      position: absolute; top: 36px; left: 50%; transform: translateX(-50%);
      width: 18px; height: 5px; border-radius: 2px;
      background: rgba(0,212,255,0.12);
      border: 1px solid rgba(0,212,255,0.2);
      display: flex; gap: 2px; align-items: center; justify-content: center; padding: 0 2px;
      backface-visibility: hidden;
    }
    .aether-robo-mouth span {
      width: 2px; height: 3px; border-radius: 1px;
      background: rgba(0,212,255,0.5);
    }
    .aether-assist-btn:hover .aether-robo-mouth {
      background: rgba(0,212,255,0.2);
      box-shadow: 0 0 6px rgba(0,212,255,0.15);
    }

    /* Antenna */
    .aether-robo-antenna {
      position: absolute; top: 0; left: 50%; transform: translateX(-50%);
      width: 2px; height: 12px;
      background: linear-gradient(to top, rgba(0,212,255,0.3), rgba(139,92,246,0.6));
      border-radius: 2px;
      backface-visibility: hidden;
    }
    .aether-robo-antenna::after {
      content: ''; position: absolute; top: -4px; left: 50%; transform: translateX(-50%);
      width: 8px; height: 8px; border-radius: 50%;
      background: radial-gradient(circle, #8b5cf6 30%, #6d3bef 100%);
      box-shadow: 0 0 8px rgba(139,92,246,0.6), 0 0 20px rgba(139,92,246,0.2);
      animation: aether-antenna-glow 2s ease-in-out infinite alternate;
    }
    @keyframes aether-antenna-glow {
      from { box-shadow: 0 0 8px rgba(139,92,246,0.6), 0 0 20px rgba(139,92,246,0.2); }
      to { box-shadow: 0 0 12px rgba(0,212,255,0.8), 0 0 30px rgba(0,212,255,0.3); background: radial-gradient(circle, #00d4ff 30%, #0099cc 100%); }
    }

    /* Ear accents */
    .aether-robo-ear {
      position: absolute; top: 24px; width: 5px; height: 12px;
      border-radius: 3px;
      background: linear-gradient(to bottom, rgba(0,212,255,0.3), rgba(139,92,246,0.3));
      backface-visibility: hidden;
    }
    .aether-robo-ear.left { left: 0; border-radius: 3px 0 0 3px; }
    .aether-robo-ear.right { right: 0; border-radius: 0 3px 3px 0; }

    /* Visor shine */
    .aether-robo-head::before {
      content: ''; position: absolute; top: 3px; left: 8px; right: 8px; height: 8px;
      border-radius: 8px 8px 0 0;
      background: linear-gradient(to bottom, rgba(255,255,255,0.08), transparent);
    }

    /* Light mode adjustments */
    [data-theme="light"] .aether-robo-head {
      background: linear-gradient(170deg, #2a2f52 0%, #1a1f3a 50%, #252b50 100%);
      border-color: rgba(0,212,255,0.35);
      box-shadow: 0 6px 24px rgba(0,0,0,0.25), 0 0 20px rgba(0,212,255,0.15),
                  inset 0 1px 0 rgba(255,255,255,0.12);
    }
    [data-theme="light"] .aether-robo::after {
      background: radial-gradient(ellipse, rgba(0,0,0,0.12) 0%, transparent 70%);
    }
    [data-theme="light"] .aether-robo-close {
      background: linear-gradient(170deg, #352040 0%, #251030 50%, #3d1850 100%);
    }
    [data-theme="light"] .aether-robo-leg {
      background: linear-gradient(to bottom, #252b50, #1a1f3a);
      border-color: rgba(0,212,255,0.25);
    }
    [data-theme="light"] .aether-robo-leg::after {
      background: #1a1f3a;
      border-color: rgba(0,212,255,0.2);
    }

    .aether-assist-panel {
      position: fixed; bottom: 96px; right: auto; left: auto; z-index: 99998;
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
      padding: 12px 16px; display: flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, rgba(0,212,255,0.06), rgba(139,92,246,0.06));
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .aether-assist-logo {
      width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
      object-fit: contain;
    }
    .aether-assist-header-info { flex: 1; min-width: 0; }
    .aether-assist-header-info h3 {
      margin: 0; font-family: 'Syne', sans-serif; font-size: 14px;
      font-weight: 700; color: #e4e8f1; letter-spacing: 0.5px;
      display: flex; align-items: center; gap: 8px;
    }
    .aether-assist-header-info p {
      margin: 2px 0 0; font-size: 11px; color: #6b7394;
    }
    .aether-assist-status {
      width: 7px; height: 7px; border-radius: 50%; background: #00dfa2;
      display: inline-block; flex-shrink: 0;
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
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
    }
    .aether-assist-messages::-webkit-scrollbar { width: 4px; }
    .aether-assist-messages::-webkit-scrollbar-track { background: transparent; }
    .aether-assist-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .aether-msg { max-width: 88%; margin-bottom: 10px; }
    .aether-msg.aether-msg-enter {
      animation: aether-msg-in 0.3s ease forwards;
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

    .aether-msg-bubble strong { color: #e4e8f1; font-weight: 600; }
    .aether-msg-bubble em { font-style: italic; }
    .aether-heading { display: block; font-size: 14px; margin-bottom: 4px; color: #e4e8f1; }
    .aether-link {
      color: #00d4ff; text-decoration: none; border-bottom: 1px solid rgba(0,212,255,0.3);
      transition: all 0.2s; cursor: pointer;
    }
    .aether-link:hover { border-color: #00d4ff; color: #4de5ff; }
    .aether-code {
      background: rgba(0,212,255,0.08); padding: 1px 6px; border-radius: 4px;
      font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #00d4ff;
    }
    .aether-list { margin: 6px 0; padding-left: 18px; list-style: none; }
    .aether-list li { position: relative; padding-left: 2px; margin-bottom: 4px; }
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
    .aether-msg-actions { display: flex; gap: 4px; margin-top: 6px; }
    .aether-tts-btn {
      background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px; padding: 4px 10px; cursor: pointer;
      color: #6b7394; font-size: 11px; display: flex; align-items: center; gap: 5px;
      font-family: 'Plus Jakarta Sans', sans-serif; transition: all 0.2s; line-height: 1;
    }
    .aether-tts-btn:hover { color: #00d4ff; border-color: rgba(0,212,255,0.25); background: rgba(0,212,255,0.06); }
    .aether-tts-btn.playing { color: #00dfa2; border-color: rgba(0,223,162,0.3); background: rgba(0,223,162,0.06); }
    .aether-tts-btn.loading { color: #8b5cf6; border-color: rgba(139,92,246,0.25); }
    .aether-tts-btn svg { flex-shrink: 0; }

    @keyframes aether-tts-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .aether-tts-spin { animation: aether-tts-spin 1s linear infinite; }

    /* Suggestions */
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
    .aether-assist-input-row { display: flex; gap: 8px; align-items: flex-end; }
    .aether-assist-textarea {
      flex: 1; resize: none; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; padding: 10px 14px; font-size: 13.5px;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: rgba(255,255,255,0.04); color: #e4e8f1;
      outline: none; max-height: 100px; min-height: 40px;
      transition: border-color 0.2s; scrollbar-width: none;
    }
    .aether-assist-textarea::-webkit-scrollbar { display: none; }
    .aether-assist-textarea:focus { border-color: rgba(0,212,255,0.3); }
    .aether-assist-textarea::placeholder { color: #4a5068; }

    /* Mic button */
    .aether-assist-mic {
      width: 40px; height: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0; color: #6b7394;
    }
    .aether-assist-mic:hover { color: #00d4ff; border-color: rgba(0,212,255,0.25); background: rgba(0,212,255,0.06); }
    .aether-assist-mic.active {
      color: #ff4466; border-color: rgba(255,68,102,0.4);
      background: rgba(255,68,102,0.08);
      animation: aether-mic-pulse 1.5s ease-in-out infinite;
    }
    .aether-assist-mic svg { width: 18px; height: 18px; }

    @keyframes aether-mic-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255,68,102,0.3); }
      50% { box-shadow: 0 0 0 6px rgba(255,68,102,0); }
    }

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
    [data-theme="light"] .aether-heading { color: #1a1f35; }
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
    [data-theme="light"] .aether-assist-mic { color: #6b7394; border-color: rgba(0,0,0,0.1); background: rgba(0,0,0,0.02); }
    [data-theme="light"] .aether-assist-mic:hover { color: #0077cc; }
    [data-theme="light"] .aether-assist-mic.active { color: #ff4466; border-color: rgba(255,68,102,0.3); background: rgba(255,68,102,0.06); }

    /* Mobile */
    @media (max-width: 480px) {
      .aether-assist-panel {
        width: calc(100vw - 16px); left: 8px !important; right: auto !important; bottom: 88px;
        height: calc(100vh - 120px); max-height: none; border-radius: 16px;
      }
      .aether-assist-btn { width: 60px; height: 80px; bottom: 8px; }
      .aether-robo { width: 50px; height: 70px; }
      .aether-robo-head { width: 44px; height: 36px; top: 10px; left: 3px; }
      .aether-robo-eye { width: 8px; height: 8px; }
      .aether-robo-eyes { top: 18px; gap: 10px; }
      .aether-robo-leg { width: 7px; height: 13px; }
      .aether-suggest-chip { font-size: 11px; padding: 5px 11px; }
    }
  `;
  document.head.appendChild(style);

  // ─── Create DOM ───
  const btn = document.createElement('button');
  btn.className = 'aether-assist-btn';
  btn.setAttribute('aria-label', 'Chat met AETHER');
  btn.innerHTML = `<div class="aether-robo">
    <div class="aether-robo-antenna"></div>
    <div class="aether-robo-ear left"></div>
    <div class="aether-robo-ear right"></div>
    <div class="aether-robo-head"></div>
    <div class="aether-robo-eyes"><div class="aether-robo-eye"></div><div class="aether-robo-eye"></div></div>
    <div class="aether-robo-mouth"><span></span><span></span><span></span><span></span></div>
    <div class="aether-robo-legs"><div class="aether-robo-leg left"></div><div class="aether-robo-leg right"></div></div>
    <div class="aether-robo-close"><svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg></div>
  </div>`;

  // Resolve logo path (works from /nl/, /en/, /fi/ subdirs)
  const basePath = window.location.pathname.includes('/nl/') || window.location.pathname.includes('/en/') || window.location.pathname.includes('/fi/')
    ? '../' : '';

  const panel = document.createElement('div');
  panel.className = 'aether-assist-panel';
  panel.innerHTML = `
    <div class="aether-assist-header">
      <img src="${basePath}images/logo-color.png" alt="AetherLink" class="aether-assist-logo" />
      <div class="aether-assist-header-info">
        <h3>AETHER <span class="aether-assist-status"></span></h3>
        <p>AI Assistant &bull; AetherLink.ai</p>
      </div>
      <button class="aether-assist-clear" id="aether-clear" title="${t.clearChat}">${t.clearChat}</button>
    </div>
    <div class="aether-assist-messages" id="aether-messages"></div>
    <div class="aether-assist-input">
      <div class="aether-assist-input-row">
        <textarea class="aether-assist-textarea" id="aether-input"
          placeholder="${t.placeholder}" rows="1"></textarea>
        ${hasSTT ? '<button class="aether-assist-mic" id="aether-mic" aria-label="Voice input"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg></button>' : ''}
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
  const micBtn = document.getElementById('aether-mic');

  // Init speech recognition
  if (hasSTT) initRecognition();

  // ─── Render All Messages (only called on init, clear, restore) ───
  function renderAllMessages() {
    messagesEl.innerHTML = '';
    messages.forEach((msg, idx) => {
      appendMessageDOM(msg, idx, false);
    });
    if (suggestionsShown && messages.length === 1 && messages[0].role === 'assistant') {
      renderSuggestions();
    }
    scrollToBottom();
  }

  // Append a single message to the DOM
  function appendMessageDOM(msg, idx, animate) {
    const div = document.createElement('div');
    div.className = `aether-msg aether-msg-${msg.role}${animate ? ' aether-msg-enter' : ''}`;
    div.dataset.msgIdx = idx;

    if (msg.role === 'assistant') {
      const bubble = document.createElement('div');
      bubble.className = 'aether-msg-bubble';
      bubble.innerHTML = renderMarkdown(msg.content);
      div.appendChild(bubble);

      if (msg.content && msg.content.length > 5 && !isStreaming) {
        div.appendChild(createTTSButton(idx));
      }
    } else {
      const bubble = document.createElement('div');
      bubble.className = 'aether-msg-bubble';
      bubble.textContent = msg.content;
      div.appendChild(bubble);
    }
    messagesEl.appendChild(div);
    return div;
  }

  function createTTSButton(idx) {
    const actions = document.createElement('div');
    actions.className = 'aether-msg-actions';
    const isPlaying = ttsPlayingIdx === idx;
    const isTtsLoading = ttsLoadingIdx === idx;
    const btnClass = isPlaying ? ' playing' : isTtsLoading ? ' loading' : '';
    const icon = isTtsLoading ? ICON_LOADING : isPlaying ? ICON_STOP : ICON_SPEAKER;
    const label = isPlaying ? 'Stop' : isTtsLoading ? '...' : (lang === 'fi' ? 'Kuuntele' : lang === 'en' ? 'Listen' : 'Luister');
    actions.innerHTML = `<button class="aether-tts-btn${btnClass}" data-tts-idx="${idx}"><span class="aether-tts-icon">${icon}</span><span>${label}</span></button>`;
    return actions;
  }

  function renderSuggestions() {
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'aether-suggestions';
    suggestionsDiv.id = 'aether-suggestions';
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

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ─── Streaming Render — only updates the last bubble, no full rebuild ───
  function scheduleStreamRender() {
    if (streamRAF) return;
    streamRAF = requestAnimationFrame(flushStreamRender);
  }

  function flushStreamRender() {
    streamRAF = null;
    if (!streamBubbleEl) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'assistant') {
      streamBubbleEl.innerHTML = renderMarkdown(lastMsg.content);
      scrollToBottom();
    }
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
    sendBtn.disabled = !inputEl.value.trim() || isStreaming;
  });

  // ─── Walking Logic ───
  let walkX = window.innerWidth - 90; // Start position (right side)
  let walkDir = -1; // -1 = walking left, 1 = walking right
  let walkSpeed = 0.6; // pixels per frame
  let walkPaused = false;
  let walkTimer = null;
  let idleTimeout = null;

  // Initial position
  btn.style.transform = `translateX(${walkX}px)`;
  btn.classList.add('walking');

  function walkStep() {
    if (isOpen || walkPaused) return;

    walkX += walkDir * walkSpeed;
    const maxX = window.innerWidth - 76;
    const minX = 8;

    // Bounce at edges
    if (walkX <= minX) {
      walkX = minX;
      walkDir = 1;
      btn.classList.remove('facing-left');
    } else if (walkX >= maxX) {
      walkX = maxX;
      walkDir = -1;
      btn.classList.add('facing-left');
    }

    btn.style.transform = `translateX(${walkX}px)`;
    walkTimer = requestAnimationFrame(walkStep);
  }

  // Start walking
  walkTimer = requestAnimationFrame(walkStep);

  // Random idle stops: pause for 2-4s, then continue
  function scheduleIdleStop() {
    const nextPause = 6000 + Math.random() * 10000; // 6-16s between stops
    idleTimeout = setTimeout(() => {
      if (isOpen) { scheduleIdleStop(); return; }
      walkPaused = true;
      btn.classList.remove('walking');
      // Resume after 2-4s
      setTimeout(() => {
        if (!isOpen) {
          walkPaused = false;
          btn.classList.add('walking');
          walkTimer = requestAnimationFrame(walkStep);
        }
        scheduleIdleStop();
      }, 2000 + Math.random() * 2000);
    }, nextPause);
  }
  scheduleIdleStop();

  // Adjust on resize
  window.addEventListener('resize', () => {
    const maxX = window.innerWidth - 76;
    if (walkX > maxX) walkX = maxX;
  });

  // ─── Toggle Panel ───
  btn.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    btn.classList.toggle('open', isOpen);

    if (isOpen) {
      // Stop walking, park the robot
      walkPaused = true;
      btn.classList.remove('walking');
      if (walkTimer) { cancelAnimationFrame(walkTimer); walkTimer = null; }

      // Position panel near the robot
      const btnRect = btn.getBoundingClientRect();
      const panelWidth = Math.min(420, window.innerWidth - 32);
      let panelLeft = btnRect.left + btnRect.width / 2 - panelWidth / 2;
      // Clamp to screen edges
      panelLeft = Math.max(16, Math.min(panelLeft, window.innerWidth - panelWidth - 16));
      panel.style.left = panelLeft + 'px';
      panel.style.right = 'auto';
      panel.style.bottom = '96px';

      setTimeout(() => inputEl.focus(), 400);
    } else {
      // Resume walking
      walkPaused = false;
      btn.classList.add('walking');
      btn.classList.remove('facing-left');
      walkDir = walkX > window.innerWidth / 2 ? -1 : 1;
      if (walkDir === -1) btn.classList.add('facing-left');
      walkTimer = requestAnimationFrame(walkStep);
    }
  });

  // ─── Clear Chat ───
  clearBtn.addEventListener('click', () => {
    stopAudio();
    messages = [{ role: 'assistant', content: t.welcome }];
    suggestionsShown = true;
    isStreaming = false;
    streamBubbleEl = null;
    saveSession();
    renderAllMessages();
  });

  // ─── Mic Button ───
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    });
  }

  // ─── Send Message ───
  async function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isStreaming) return;

    // Remove suggestions if visible
    const sugEl = document.getElementById('aether-suggestions');
    if (sugEl) sugEl.remove();
    suggestionsShown = false;

    // Add user message
    messages.push({ role: 'user', content: text });
    appendMessageDOM(messages[messages.length - 1], messages.length - 1, true);
    scrollToBottom();

    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    isStreaming = true;

    // Show typing indicator
    const typingEl = document.createElement('div');
    typingEl.className = 'aether-msg aether-msg-assistant aether-msg-enter';
    typingEl.id = 'aether-typing';
    typingEl.innerHTML = '<div class="aether-msg-bubble"><div class="aether-typing"><span></span><span></span><span></span></div></div>';
    messagesEl.appendChild(typingEl);
    scrollToBottom();

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
          learningContext: getLearnings(),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Request failed');
      }

      // Remove typing indicator
      const typingIndicator = document.getElementById('aether-typing');
      if (typingIndicator) typingIndicator.remove();

      // Create assistant message element for streaming
      messages.push({ role: 'assistant', content: '' });
      const msgDiv = document.createElement('div');
      msgDiv.className = 'aether-msg aether-msg-assistant aether-msg-enter';
      msgDiv.dataset.msgIdx = messages.length - 1;
      const bubble = document.createElement('div');
      bubble.className = 'aether-msg-bubble';
      msgDiv.appendChild(bubble);
      messagesEl.appendChild(msgDiv);
      streamBubbleEl = bubble;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let chunkDirty = false;
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                assistantContent += parsed.text;
                chunkDirty = true;
              }
            } catch {}
          }
        }

        if (chunkDirty) {
          messages[messages.length - 1].content = assistantContent;
          scheduleStreamRender();
        }
      }

      // Final render of complete message
      if (streamBubbleEl) {
        streamBubbleEl.innerHTML = renderMarkdown(assistantContent);
      }

      if (!assistantContent) {
        messages[messages.length - 1].content = t.errorGeneric;
        if (streamBubbleEl) streamBubbleEl.innerHTML = renderMarkdown(t.errorGeneric);
      }

      // Save learning from this Q&A pair
      saveLearning(text, assistantContent);

      // Add TTS button after streaming completes
      const lastMsgEl = messagesEl.querySelector(`[data-msg-idx="${messages.length - 1}"]`);
      if (lastMsgEl && assistantContent.length > 5) {
        lastMsgEl.appendChild(createTTSButton(messages.length - 1));
      }

    } catch (error) {
      // Remove typing indicator if still present
      const typingIndicator = document.getElementById('aether-typing');
      if (typingIndicator) typingIndicator.remove();

      const errorMsg = error.message.includes('veel berichten') || error.message.includes('Too many') || error.message.includes('Liian monta')
        ? error.message
        : t.errorGeneric;
      messages.push({ role: 'assistant', content: errorMsg });
      appendMessageDOM(messages[messages.length - 1], messages.length - 1, true);
    }

    isStreaming = false;
    streamBubbleEl = null;
    if (streamRAF) { cancelAnimationFrame(streamRAF); streamRAF = null; }
    saveSession();
    sendBtn.disabled = !inputEl.value.trim();
    scrollToBottom();
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
  renderAllMessages();
})();
