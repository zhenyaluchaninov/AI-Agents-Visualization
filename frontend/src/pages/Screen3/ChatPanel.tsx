export type ChatEndpoint = { x: number; y: number; name: string };
export type ChatEdgeCtx = { id: string; from: ChatEndpoint; to: ChatEndpoint };

function initials(label: string) {
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  const w = words[0] || '';
  return w.slice(0, 2).toUpperCase();
}

export function initChatPanel(
  root: HTMLElement,
  opts: {
    onOpenChange?: (open: boolean) => void;
    onActivateEdge?: (edgeId: string | null) => void;
  } = {},
) {
  const qs = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>(`#${id}`);
  const panel = qs<HTMLDivElement>('panel');
  const panelBody = qs<HTMLDivElement>('panelBody');
  const participants = qs<HTMLDivElement>('participants');
  const closePanel = qs<HTMLButtonElement>('closePanel');
  const continueBtn = qs<HTMLButtonElement>('continueBtn');

  if (!panel || !panelBody || !closePanel || !continueBtn) {
    return {
      openChat: (_edge: ChatEdgeCtx) => {},
      destroy: () => {},
    } as const;
  }

  let unlockedCTA = false;
  let timers: number[] = [];
  let lastEdgeId: string | null = null;

  const handleClose = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    opts.onActivateEdge?.(null);
    opts.onOpenChange?.(false);
    timers.forEach((t) => clearTimeout(t));
    timers = [];
    if (panelBody) panelBody.innerHTML = '';
    if (participants) participants.innerHTML = '';
  };

  const closeListener = () => handleClose();
  closePanel.addEventListener('click', closeListener);

  const NAME_COLORS: Record<string, string> = {
    Research: '#9d8ed4',
    Strategy: '#6ab59d',
    Design: '#ff9d5c',
    Product: '#7dd3c0',
    Engineer: '#6ba3d4',
    Ops: '#ff6b6b',
  };
  function hexToRgb(hex: string) {
    let h = hex.replace('#', '');
    if (h.length === 3) {
      h = [h[0], h[0], h[1], h[1], h[2], h[2]].join('');
    }
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  function hexToRgba(hex: string, a: number) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }
  function tintHex(hex: string, ratio: number) {
    const { r, g, b } = hexToRgb(hex);
    const rr = Math.round(r + (255 - r) * ratio);
    const gg = Math.round(g + (255 - g) * ratio);
    const bb = Math.round(b + (255 - b) * ratio);
    return { r: rr, g: gg, b: bb };
  }
  function tintHexToRgba(hex: string, ratio: number, alpha: number) {
    const { r, g, b } = tintHex(hex, ratio);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  const openChat = (edge: ChatEdgeCtx) => {
    if (panel.classList.contains('open') && lastEdgeId === edge.id) {
      return;
    }
    timers.forEach((t) => clearTimeout(t));
    timers = [];
    if (!unlockedCTA) {
      unlockedCTA = true;
      continueBtn.classList.add('enabled');
      continueBtn.disabled = false;
    }
    panelBody.innerHTML = '';
    if (participants) participants.innerHTML = '';

    const fromColor = NAME_COLORS[edge.from.name] || '#8b7df0';
    const toColor = NAME_COLORS[edge.to.name] || '#8b7df0';
    if (participants) {
      const mkChip = (label: string, hex: string) => {
        const chip = document.createElement('div');
        chip.className = 'participant';
        chip.title = label;
        const av = document.createElement('span');
        av.className = 'participantAv';
        av.textContent = initials(label);
        const txt = document.createElement('span');
        txt.className = 'participantName';
        txt.textContent = label;
        const rgbaBg = hexToRgba(hex, 0.16);
        const rgbaBr = hexToRgba(hex, 0.45);
        chip.style.background = rgbaBg;
        chip.style.borderColor = rgbaBr;
        chip.style.color = '#1f2335';
        av.style.background = `linear-gradient(135deg, ${hex}, ${hexToRgba(hex, 0.75)})`;
        av.style.borderColor = rgbaBr;
        chip.appendChild(av);
        chip.appendChild(txt);
        return chip;
      };
      participants.appendChild(mkChip(edge.from.name, fromColor));
      participants.appendChild(mkChip(edge.to.name, toColor));
    }

    type Msg = { who: string; text: string };
    const msgs: Msg[] = [
      { who: edge.from.name, text: 'Sharing latest findings. Passing key insights to you now.' },
      { who: edge.to.name, text: 'Received. Translating into actionable strategy options.' },
      { who: edge.from.name, text: 'Prioritize the cost-sensitive segment; signal is strong.' },
      { who: edge.to.name, text: 'Copy. Drafting two scenarios; will loop in Engineering next.' },
    ];

    const ICON_TO_TYPING = 200;
    const TYPING_DURATION = 640;
    const POST_DELAY = 220;

    const mountMessage = (m: Msg) => {
      const side = m.who === edge.from.name ? 'left' : 'right';
      const row = document.createElement('div');
      row.className = 'msg';
      row.classList.add(side);

      const avatar = document.createElement('div');
      avatar.className = 'av';
      avatar.classList.add(side);
      avatar.textContent = initials(m.who);
      const baseHex = NAME_COLORS[m.who] || '#8b7df0';
      avatar.style.background = `linear-gradient(135deg, ${baseHex}, ${hexToRgba(baseHex, 0.75)})`;
      avatar.style.border = `1px solid ${hexToRgba(baseHex, 0.65)}`;
      avatar.style.boxShadow = `0 10px 24px ${hexToRgba(baseHex, 0.28)}`;
      row.style.setProperty('--accent', baseHex);

      const slot = document.createElement('div');
      slot.className = 'bubbleSlot';
      slot.classList.add(side);

      if (side === 'right') {
        row.appendChild(slot);
        row.appendChild(avatar);
      } else {
        row.appendChild(avatar);
        row.appendChild(slot);
      }
      panelBody.appendChild(row);
      panelBody.scrollTop = panelBody.scrollHeight;

      let typingEl: HTMLDivElement | null = null;
      const ensureTyping = () => {
        if (typingEl || !slot.isConnected) return;
        typingEl = document.createElement('div');
        typingEl.className = 'typing inline';
        typingEl.classList.add(side);
        const dots = document.createElement('div');
        dots.className = 'typingDots';
        dots.innerHTML = '<span></span><span></span><span></span>';
        typingEl.appendChild(dots);
        slot.appendChild(typingEl);
        panelBody.scrollTop = panelBody.scrollHeight;
      };
      const revealBubble = () => {
        if (!slot.isConnected) return;
        if (typingEl && typingEl.parentElement === slot) {
          slot.removeChild(typingEl);
          typingEl = null;
        }
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.classList.add(side);
        bubble.textContent = m.text;

        if (side === 'right') {
          const pastelBg = tintHexToRgba(baseHex, 0.86, 1);
          const pastelBorder = tintHexToRgba(baseHex, 0.72, 1);
          row.style.setProperty('--accent-bg', pastelBg);
          row.style.setProperty('--accent-fg', '#24304a');
          row.style.setProperty('--accent-border', pastelBorder);
        } else {
          row.style.removeProperty('--accent-bg');
          row.style.removeProperty('--accent-fg');
          row.style.removeProperty('--accent-border');
        }

        slot.appendChild(bubble);
        row.classList.add('appear');
        panelBody.scrollTop = panelBody.scrollHeight;
      };

      return { ensureTyping, revealBubble };
    };

    let timeline = 0;
    msgs.forEach((msg) => {
      timers.push(window.setTimeout(() => {
        const stage = mountMessage(msg);
        timers.push(window.setTimeout(() => {
          stage.ensureTyping();
          timers.push(window.setTimeout(() => stage.revealBubble(), TYPING_DURATION));
        }, ICON_TO_TYPING));
      }, timeline));
      timeline += ICON_TO_TYPING + TYPING_DURATION + POST_DELAY;
    });

    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    opts.onActivateEdge?.(edge.id);
    opts.onOpenChange?.(true);
    lastEdgeId = edge.id;
  };

  const destroy = () => {
    closePanel.removeEventListener('click', closeListener);
  };

  return { openChat, destroy };
}

export function ChatPanel() {
  return (
    <>
      <div id="panel" className="panel" role="dialog" aria-modal="true" aria-hidden="true">
        <div className="hd">
          <div className="participants" id="participants" aria-label="Participants" />
          <button id="closePanel" className="closeBtn" type="button" aria-label="Close">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="#0f172a" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div id="panelBody" className="body" />
      </div>
    </>
  );
}
