/**
 * AETHER-ASSIST v1.0 — AI Chat Widget
 * Fully integrated with AetherLink Luminous Void design system
 * Vanilla JS — no dependencies
 */
(function () {
  'use strict';

  // ─── Config ───
  const API_URL = '/api/chat';
  const WELCOME_NL = 'Hoi! Ik ben AETHER, de AI-assistent van AetherLink. Stel me een vraag over onze AI-diensten, of vertel me waar ik je mee kan helpen.';
  const WELCOME_EN = "Hi! I'm AETHER, the AI assistant of AetherLink. Ask me anything about our AI services, or tell me how I can help.";
  const WELCOME_FI = 'Hei! Olen AETHER, AetherLinkin tekoälyavustaja. Kysy minulta mitä tahansa tekoälypalveluistamme.';

  // Detect language from <html lang="...">
  const lang = document.documentElement.lang || 'nl';
  const welcome = lang === 'fi' ? WELCOME_FI : lang === 'en' ? WELCOME_EN : WELCOME_NL;
  const placeholder = lang === 'fi' ? 'Kysy kysymyksesi...' : lang === 'en' ? 'Ask your question...' : 'Stel je vraag...';
  const poweredBy = 'Powered by AetherLink.ai';

  // ─── State ───
  let isOpen = false;
  let isLoading = false;
  let messages = [{ role: 'assistant', content: welcome }];

  // ─── Inject Styles ───
  const style = document.createElement('style');
  style.textContent = `
    /* AETHER-ASSIST Widget Styles */
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

    .aether-assist-panel {
      position: fixed; bottom: 96px; right: 24px; z-index: 99998;
      width: 400px; max-width: calc(100vw - 32px); height: 560px; max-height: calc(100vh - 140px);
      border-radius: 20px; overflow: hidden;
      background: rgba(10, 13, 26, 0.92);
      backdrop-filter: blur(40px); -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(0,212,255,0.08);
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
      padding: 16px 20px; display: flex; align-items: center; gap: 12px;
      background: linear-gradient(135deg, rgba(0,212,255,0.08), rgba(139,92,246,0.08));
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .aether-assist-avatar {
      width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
      background: linear-gradient(135deg, #00d4ff, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: white; font-weight: 700;
      box-shadow: 0 2px 12px rgba(0,212,255,0.3);
    }
    .aether-assist-header-text h3 {
      margin: 0; font-family: 'Syne', sans-serif; font-size: 15px;
      font-weight: 700; color: #e4e8f1; letter-spacing: 0.5px;
    }
    .aether-assist-header-text p {
      margin: 2px 0 0; font-size: 12px; color: #6b7394;
    }
    .aether-assist-status {
      width: 8px; height: 8px; border-radius: 50%; background: #00dfa2;
      margin-left: auto; flex-shrink: 0;
      box-shadow: 0 0 8px rgba(0,223,162,0.5);
      animation: aether-status-pulse 2s ease-in-out infinite;
    }
    @keyframes aether-status-pulse {
      0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
    }

    /* Messages */
    .aether-assist-messages {
      flex: 1; overflow-y: auto; padding: 16px 16px 8px;
      scroll-behavior: smooth;
      scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent;
    }
    .aether-assist-messages::-webkit-scrollbar { width: 4px; }
    .aether-assist-messages::-webkit-scrollbar-track { background: transparent; }
    .aether-assist-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

    .aether-msg {
      max-width: 85%; margin-bottom: 12px; animation: aether-msg-in 0.3s ease;
    }
    .aether-msg-user { margin-left: auto; }
    .aether-msg-assistant { margin-right: auto; }

    .aether-msg-bubble {
      padding: 10px 16px; font-size: 14px; line-height: 1.55;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      word-wrap: break-word; white-space: pre-wrap;
    }
    .aether-msg-user .aether-msg-bubble {
      background: linear-gradient(135deg, rgba(0,212,255,0.2), rgba(139,92,246,0.15));
      border: 1px solid rgba(0,212,255,0.2);
      border-radius: 16px 16px 4px 16px; color: #e4e8f1;
    }
    .aether-msg-assistant .aether-msg-bubble {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 16px 16px 16px 4px; color: #c8cee0;
    }

    @keyframes aether-msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
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

    /* Input */
    .aether-assist-input {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
      background: rgba(5,6,15,0.5);
    }
    .aether-assist-input-row {
      display: flex; gap: 8px; align-items: flex-end;
    }
    .aether-assist-textarea {
      flex: 1; resize: none; border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; padding: 10px 16px; font-size: 14px;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      background: rgba(255,255,255,0.04); color: #e4e8f1;
      outline: none; max-height: 100px; min-height: 40px;
      transition: border-color 0.2s;
      scrollbar-width: none;
    }
    .aether-assist-textarea::-webkit-scrollbar { display: none; }
    .aether-assist-textarea:focus {
      border-color: rgba(0,212,255,0.3);
    }
    .aether-assist-textarea::placeholder { color: #4a5068; }

    .aether-assist-send {
      width: 40px; height: 40px; border-radius: 12px; border: none; cursor: pointer;
      background: linear-gradient(135deg, #00d4ff, #8b5cf6);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; flex-shrink: 0;
    }
    .aether-assist-send:hover { transform: scale(1.05); box-shadow: 0 2px 12px rgba(0,212,255,0.3); }
    .aether-assist-send:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
    .aether-assist-send svg { width: 18px; height: 18px; fill: white; }

    .aether-assist-footer {
      text-align: center; padding: 6px 0; font-size: 10px; color: #3d4460;
      font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: 0.3px;
    }

    /* Light mode adaptations */
    [data-theme="light"] .aether-assist-panel {
      background: rgba(237, 234, 242, 0.95);
      border-color: rgba(0,0,0,0.08);
      box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 0 40px rgba(0,212,255,0.05);
    }
    [data-theme="light"] .aether-assist-header {
      background: linear-gradient(135deg, rgba(0,212,255,0.06), rgba(139,92,246,0.06));
      border-bottom-color: rgba(0,0,0,0.06);
    }
    [data-theme="light"] .aether-assist-header-text h3 { color: #1a1f35; }
    [data-theme="light"] .aether-assist-header-text p { color: #6b7394; }
    [data-theme="light"] .aether-msg-user .aether-msg-bubble {
      background: linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.1));
      border-color: rgba(0,212,255,0.15); color: #1a1f35;
    }
    [data-theme="light"] .aether-msg-assistant .aether-msg-bubble {
      background: rgba(255,255,255,0.7); border-color: rgba(0,0,0,0.06); color: #2a2f45;
    }
    [data-theme="light"] .aether-assist-input { background: rgba(255,255,255,0.5); border-top-color: rgba(0,0,0,0.06); }
    [data-theme="light"] .aether-assist-textarea {
      background: rgba(255,255,255,0.6); border-color: rgba(0,0,0,0.1); color: #1a1f35;
    }
    [data-theme="light"] .aether-assist-textarea::placeholder { color: #8b91a8; }
    [data-theme="light"] .aether-assist-footer { color: #a0a5b8; }

    /* Mobile */
    @media (max-width: 480px) {
      .aether-assist-panel {
        width: calc(100vw - 16px); right: 8px; bottom: 88px;
        height: calc(100vh - 120px); max-height: none;
        border-radius: 16px;
      }
      .aether-assist-btn { width: 54px; height: 54px; bottom: 20px; right: 16px; }
    }
  `;
  document.head.appendChild(style);

  // ─── Create DOM ───
  // Chat button
  const btn = document.createElement('button');
  btn.className = 'aether-assist-btn';
  btn.setAttribute('aria-label', 'Chat met AETHER');
  btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>`;

  // Panel
  const panel = document.createElement('div');
  panel.className = 'aether-assist-panel';
  panel.innerHTML = `
    <div class="aether-assist-header">
      <div class="aether-assist-avatar">A</div>
      <div class="aether-assist-header-text">
        <h3>AETHER</h3>
        <p>AI Assistant &bull; AetherLink.ai</p>
      </div>
      <div class="aether-assist-status"></div>
    </div>
    <div class="aether-assist-messages" id="aether-messages"></div>
    <div class="aether-assist-input">
      <div class="aether-assist-input-row">
        <textarea class="aether-assist-textarea" id="aether-input"
          placeholder="${placeholder}" rows="1"></textarea>
        <button class="aether-assist-send" id="aether-send" disabled>
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div class="aether-assist-footer">${poweredBy}</div>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const messagesEl = document.getElementById('aether-messages');
  const inputEl = document.getElementById('aether-input');
  const sendBtn = document.getElementById('aether-send');

  // ─── Render Messages ───
  function renderMessages() {
    messagesEl.innerHTML = '';
    messages.forEach((msg) => {
      const div = document.createElement('div');
      div.className = `aether-msg aether-msg-${msg.role}`;
      div.innerHTML = `<div class="aether-msg-bubble">${escapeHtml(msg.content)}</div>`;
      messagesEl.appendChild(div);
    });
    if (isLoading) {
      const typing = document.createElement('div');
      typing.className = 'aether-msg aether-msg-assistant';
      typing.innerHTML = `<div class="aether-msg-bubble"><div class="aether-typing"><span></span><span></span><span></span></div></div>`;
      messagesEl.appendChild(typing);
    }
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

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
      ? `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
      : `<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>`;
    if (isOpen) {
      setTimeout(() => inputEl.focus(), 300);
    }
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
    renderMessages();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Request failed');
      }

      // Stream response
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
            } catch {
              // skip
            }
          }
        }
      }

      // Handle case where no content was streamed
      if (!assistantContent) {
        messages[messages.length - 1].content =
          lang === 'en'
            ? 'Sorry, something went wrong. Please try again or contact us at info@aetherlink.ai.'
            : 'Sorry, er ging iets mis. Probeer het opnieuw of neem contact op via info@aetherlink.ai.';
      }
    } catch (error) {
      isLoading = false;
      messages.push({
        role: 'assistant',
        content:
          error.message === 'Te veel berichten. Probeer het over een minuut opnieuw.'
            ? error.message
            : lang === 'en'
              ? 'Sorry, something went wrong. Please try again or contact us at info@aetherlink.ai.'
              : 'Sorry, er ging iets mis. Probeer het opnieuw of neem contact op via info@aetherlink.ai.',
      });
    }

    isLoading = false;
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
