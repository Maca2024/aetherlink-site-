/**
 * AetherLink Chatbot Widget
 * Self-contained floating chat with Claude AI + ElevenLabs TTS
 */
(function () {
  "use strict";

  // ── Config ──
  const API_BASE = "/api";
  const WELCOME = {
    nl: "Hallo! Ik ben de AetherLink assistent. Hoe kan ik u helpen?",
    en: "Hello! I'm the AetherLink assistant. How can I help you?",
    fi: "Hei! Olen AetherLinkin avustaja. Miten voin auttaa?",
  };
  const PLACEHOLDER = {
    nl: "Stel uw vraag...",
    en: "Ask your question...",
    fi: "Kysy kysymyksesi...",
  };
  const TYPING_TEXT = {
    nl: "AetherLink denkt na...",
    en: "AetherLink is thinking...",
    fi: "AetherLink miettii...",
  };

  // Detect language from <html lang="...">
  const lang = (document.documentElement.lang || "nl").slice(0, 2);

  // ── State ──
  let isOpen = false;
  let isLoading = false;
  let messages = [];
  let currentAudio = null;

  // ── Create DOM ──
  function init() {
    const widget = document.createElement("div");
    widget.id = "al-chatbot";
    widget.innerHTML = `
      <button id="al-chat-fab" aria-label="Open chat">
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <path d="M4 4h18v14H8l-4 4V4z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          <circle cx="9" cy="11" r="1.2" fill="currentColor"/>
          <circle cx="13" cy="11" r="1.2" fill="currentColor"/>
          <circle cx="17" cy="11" r="1.2" fill="currentColor"/>
        </svg>
        <span id="al-fab-pulse"></span>
      </button>
      <div id="al-chat-panel">
        <div id="al-chat-header">
          <div id="al-chat-header-left">
            <div id="al-chat-avatar">
              <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
                <rect x="4" y="6" width="20" height="15" rx="4" stroke="#00d4ff" stroke-width="1.5"/>
                <circle cx="10.5" cy="13" r="1.8" fill="#00d4ff"/>
                <circle cx="17.5" cy="13" r="1.8" fill="#00d4ff"/>
                <line x1="14" y1="6" x2="14" y2="2.5" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="14" cy="2" r="1.2" fill="#00d4ff" opacity="0.6"/>
              </svg>
            </div>
            <div>
              <div id="al-chat-title">AetherLink</div>
              <div id="al-chat-status">Online</div>
            </div>
          </div>
          <button id="al-chat-close" aria-label="Close chat">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div id="al-chat-messages"></div>
        <div id="al-chat-input-wrap">
          <input id="al-chat-input" type="text" placeholder="${PLACEHOLDER[lang] || PLACEHOLDER.nl}" autocomplete="off" />
          <button id="al-chat-send" aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M2 9l14-7-4 16-4-6-6-3z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(widget);
    injectStyles();
    bindEvents();
    // Add welcome message
    addMessage("assistant", WELCOME[lang] || WELCOME.nl);
  }

  // ── Styles ──
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #al-chatbot {
        --al-bg: #0a0d1a;
        --al-bg2: #111527;
        --al-bg3: #181d35;
        --al-cyan: #00d4ff;
        --al-violet: #8b5cf6;
        --al-muted: #6b7394;
        --al-light: #e4e8f1;
        --al-radius: 16px;
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        position: fixed;
        bottom: 0;
        right: 0;
        z-index: 10000;
      }

      /* ── FAB Button ── */
      #al-chat-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--al-cyan), var(--al-violet));
        color: #fff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 24px rgba(0, 212, 255, 0.3), 0 0 0 0 rgba(0, 212, 255, 0.4);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        z-index: 10001;
      }
      #al-chat-fab:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 32px rgba(0, 212, 255, 0.45), 0 0 0 0 rgba(0, 212, 255, 0.4);
      }
      #al-chat-fab.al-hidden { display: none; }

      #al-fab-pulse {
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 2px solid var(--al-cyan);
        animation: al-pulse 2s ease-out infinite;
        pointer-events: none;
      }
      @keyframes al-pulse {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.4); opacity: 0; }
      }

      /* ── Panel ── */
      #al-chat-panel {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 380px;
        max-height: 560px;
        border-radius: var(--al-radius);
        background: var(--al-bg);
        border: 1px solid rgba(0, 212, 255, 0.15);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 212, 255, 0.08);
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 10002;
        animation: al-slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      #al-chat-panel.al-open { display: flex; }

      @keyframes al-slideUp {
        from { opacity: 0; transform: translateY(16px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* ── Header ── */
      #al-chat-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 18px;
        background: linear-gradient(135deg, rgba(0, 212, 255, 0.08), rgba(139, 92, 246, 0.08));
        border-bottom: 1px solid rgba(0, 212, 255, 0.1);
      }
      #al-chat-header-left { display: flex; align-items: center; gap: 10px; }
      #al-chat-avatar {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(0, 212, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #al-chat-title {
        font-family: 'Syne', sans-serif;
        font-weight: 700;
        font-size: 15px;
        color: var(--al-light);
        letter-spacing: -0.02em;
      }
      #al-chat-status {
        font-size: 11px;
        color: #00dfa2;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      #al-chat-status::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #00dfa2;
        display: inline-block;
        animation: al-statusPulse 2s ease infinite;
      }
      @keyframes al-statusPulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      #al-chat-close {
        background: rgba(255,255,255,0.06);
        border: none;
        color: var(--al-muted);
        cursor: pointer;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s, color 0.2s;
      }
      #al-chat-close:hover { background: rgba(255,255,255,0.12); color: var(--al-light); }

      /* ── Messages ── */
      #al-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        min-height: 280px;
        max-height: 380px;
        scrollbar-width: thin;
        scrollbar-color: var(--al-bg3) transparent;
      }
      #al-chat-messages::-webkit-scrollbar { width: 5px; }
      #al-chat-messages::-webkit-scrollbar-track { background: transparent; }
      #al-chat-messages::-webkit-scrollbar-thumb { background: var(--al-bg3); border-radius: 10px; }

      .al-msg {
        max-width: 85%;
        padding: 10px 14px;
        border-radius: 14px;
        font-size: 13.5px;
        line-height: 1.55;
        color: var(--al-light);
        animation: al-msgIn 0.3s ease;
        word-wrap: break-word;
      }
      @keyframes al-msgIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .al-msg-user {
        align-self: flex-end;
        background: linear-gradient(135deg, var(--al-violet), rgba(0, 212, 255, 0.5));
        border-bottom-right-radius: 4px;
      }
      .al-msg-assistant {
        align-self: flex-start;
        background: var(--al-bg2);
        border: 1px solid rgba(0, 212, 255, 0.08);
        border-bottom-left-radius: 4px;
      }
      .al-msg-assistant .al-voice-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-top: 6px;
        padding: 3px 8px;
        font-size: 11px;
        color: var(--al-muted);
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .al-msg-assistant .al-voice-btn:hover {
        color: var(--al-cyan);
        border-color: rgba(0, 212, 255, 0.2);
        background: rgba(0, 212, 255, 0.06);
      }
      .al-msg-assistant .al-voice-btn.al-playing {
        color: var(--al-cyan);
        border-color: rgba(0, 212, 255, 0.3);
      }
      .al-msg-assistant .al-voice-btn svg { flex-shrink: 0; }

      /* Typing indicator */
      .al-typing {
        align-self: flex-start;
        background: var(--al-bg2);
        border: 1px solid rgba(0, 212, 255, 0.08);
        padding: 12px 18px;
        border-radius: 14px;
        border-bottom-left-radius: 4px;
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .al-typing span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--al-cyan);
        animation: al-typing 1.4s ease-in-out infinite;
      }
      .al-typing span:nth-child(2) { animation-delay: 0.2s; }
      .al-typing span:nth-child(3) { animation-delay: 0.4s; }
      @keyframes al-typing {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.3; }
        30% { transform: translateY(-6px); opacity: 1; }
      }

      /* ── Input ── */
      #al-chat-input-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 14px 16px;
        border-top: 1px solid rgba(0, 212, 255, 0.08);
        background: var(--al-bg);
      }
      #al-chat-input {
        flex: 1;
        background: var(--al-bg2);
        border: 1px solid rgba(0, 212, 255, 0.1);
        border-radius: 10px;
        padding: 10px 14px;
        font-size: 13.5px;
        color: var(--al-light);
        outline: none;
        font-family: inherit;
        transition: border-color 0.2s;
      }
      #al-chat-input::placeholder { color: var(--al-muted); }
      #al-chat-input:focus { border-color: rgba(0, 212, 255, 0.35); }
      #al-chat-send {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--al-cyan), var(--al-violet));
        color: #fff;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, opacity 0.2s;
        flex-shrink: 0;
      }
      #al-chat-send:hover { transform: scale(1.06); }
      #al-chat-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

      /* ── Mobile ── */
      @media (max-width: 480px) {
        #al-chat-panel {
          bottom: 0;
          right: 0;
          left: 0;
          width: 100%;
          max-height: 100dvh;
          border-radius: 20px 20px 0 0;
        }
        #al-chat-messages { max-height: calc(100dvh - 160px); }
        #al-chat-fab { bottom: 16px; right: 16px; width: 50px; height: 50px; }
      }

      /* ── Light mode overrides ── */
      [data-theme="light"] #al-chatbot {
        --al-bg: #f4f2f7;
        --al-bg2: #eae7f0;
        --al-bg3: #ddd9e5;
        --al-muted: #7c7492;
        --al-light: #1a1528;
      }
      [data-theme="light"] #al-chat-panel {
        border-color: rgba(139, 92, 246, 0.18);
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.15), 0 0 40px rgba(139, 92, 246, 0.06);
      }
      [data-theme="light"] .al-msg-user {
        color: #fff;
      }
      [data-theme="light"] .al-msg-assistant {
        border-color: rgba(139, 92, 246, 0.1);
      }
      [data-theme="light"] #al-chat-input {
        border-color: rgba(139, 92, 246, 0.12);
      }
      [data-theme="light"] #al-chat-input:focus {
        border-color: rgba(139, 92, 246, 0.35);
      }
      [data-theme="light"] #al-chat-header {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.06), rgba(0, 212, 255, 0.04));
        border-bottom-color: rgba(139, 92, 246, 0.1);
      }
    `;
    document.head.appendChild(style);
  }

  // ── Events ──
  function bindEvents() {
    const fab = document.getElementById("al-chat-fab");
    const panel = document.getElementById("al-chat-panel");
    const closeBtn = document.getElementById("al-chat-close");
    const input = document.getElementById("al-chat-input");
    const sendBtn = document.getElementById("al-chat-send");

    fab.addEventListener("click", () => {
      isOpen = true;
      panel.classList.add("al-open");
      fab.classList.add("al-hidden");
      input.focus();
    });

    closeBtn.addEventListener("click", () => {
      isOpen = false;
      panel.classList.remove("al-open");
      fab.classList.remove("al-hidden");
    });

    sendBtn.addEventListener("click", () => sendMessage());

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  // ── Send Message ──
  async function sendMessage() {
    const input = document.getElementById("al-chat-input");
    const text = input.value.trim();
    if (!text || isLoading) return;

    input.value = "";
    addMessage("user", text);
    messages.push({ role: "user", content: text });

    isLoading = true;
    document.getElementById("al-chat-send").disabled = true;
    showTyping();

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, language: lang }),
      });

      removeTyping();

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      const data = await res.json();
      const reply = data.reply || "Sorry, er ging iets mis.";
      messages.push({ role: "assistant", content: reply });
      addMessage("assistant", reply);
    } catch (err) {
      removeTyping();
      addMessage(
        "assistant",
        lang === "fi"
          ? "Anteeksi, jokin meni pieleen. Yritä uudelleen."
          : lang === "en"
          ? "Sorry, something went wrong. Please try again."
          : "Sorry, er ging iets mis. Probeer het opnieuw."
      );
    } finally {
      isLoading = false;
      document.getElementById("al-chat-send").disabled = false;
    }
  }

  // ── Add Message to DOM ──
  function addMessage(role, content) {
    const container = document.getElementById("al-chat-messages");
    const div = document.createElement("div");
    div.className = `al-msg al-msg-${role}`;

    // Simple markdown: bold, links
    let html = escapeHtml(content)
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener" style="color:var(--al-cyan);text-decoration:underline">$1</a>'
      )
      .replace(/\n/g, "<br>");

    div.innerHTML = html;

    // Add voice button for assistant messages
    if (role === "assistant") {
      const voiceBtn = document.createElement("button");
      voiceBtn.className = "al-voice-btn";
      voiceBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 5.5v3h2.5L7.5 11V3L4.5 5.5H2z" fill="currentColor"/>
          <path d="M9.5 4.5s1 1 1 2.5-1 2.5-1 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
          <path d="M11 3s1.5 1.5 1.5 4S11 11 11 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>
        </svg>
        <span>${lang === "fi" ? "Kuuntele" : lang === "en" ? "Listen" : "Luister"}</span>
      `;
      voiceBtn.addEventListener("click", () => playVoice(content, voiceBtn));
      div.appendChild(voiceBtn);
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  // ── Voice Playback ──
  async function playVoice(text, btn) {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
      document
        .querySelectorAll(".al-voice-btn.al-playing")
        .forEach((b) => b.classList.remove("al-playing"));
    }

    btn.classList.add("al-playing");
    const labelSpan = btn.querySelector("span");
    const originalLabel = labelSpan.textContent;
    labelSpan.textContent =
      lang === "fi" ? "Ladataan..." : lang === "en" ? "Loading..." : "Laden...";

    try {
      const res = await fetch(`${API_BASE}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: lang }),
      });

      if (!res.ok) throw new Error("TTS failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudio = audio;

      labelSpan.textContent =
        lang === "fi"
          ? "Toistetaan..."
          : lang === "en"
          ? "Playing..."
          : "Afspelen...";

      audio.addEventListener("ended", () => {
        btn.classList.remove("al-playing");
        labelSpan.textContent = originalLabel;
        URL.revokeObjectURL(url);
        currentAudio = null;
      });

      audio.addEventListener("error", () => {
        btn.classList.remove("al-playing");
        labelSpan.textContent = originalLabel;
        URL.revokeObjectURL(url);
        currentAudio = null;
      });

      await audio.play();
    } catch (err) {
      btn.classList.remove("al-playing");
      labelSpan.textContent = originalLabel;
    }
  }

  // ── Typing Indicator ──
  function showTyping() {
    const container = document.getElementById("al-chat-messages");
    const div = document.createElement("div");
    div.className = "al-typing";
    div.id = "al-typing-indicator";
    div.innerHTML = "<span></span><span></span><span></span>";
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById("al-typing-indicator");
    if (el) el.remove();
  }

  // ── Utilities ──
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Initialize when DOM ready ──
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
