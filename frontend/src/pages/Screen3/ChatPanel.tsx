import styles from './Screen3.module.css';

export type ChatEndpoint = { x: number; y: number; name: string };
export type ChatEdgeCtx = { id: string; from: ChatEndpoint; to: ChatEndpoint };

function initials(label: string) {
  return label
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
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
  const closePanel = qs<HTMLButtonElement>('closePanel');
  const continueBtn = qs<HTMLButtonElement>('continueBtn');

  // If expected nodes are missing, provide no-op API to avoid runtime errors
  if (!panel || !panelBody || !closePanel || !continueBtn) {
    return {
      openChat: (_edge: ChatEdgeCtx) => {},
      destroy: () => {},
    } as const;
  }

  let unlockedCTA = false;

  const handleClose = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    opts.onActivateEdge?.(null);
    opts.onOpenChange?.(false);
  };

  const closeListener = () => handleClose();
  closePanel.addEventListener('click', closeListener);

  const openChat = (edge: ChatEdgeCtx) => {
    if (!unlockedCTA) {
      unlockedCTA = true;
      continueBtn.classList.add('enabled');
      continueBtn.disabled = false;
    }
    panelBody.innerHTML = '';
    const msgs = [
      { who: edge.from.name, text: 'Sharing latest findings. Passing key insights to you now.' },
      { who: edge.to.name, text: 'Received. Translating into actionable strategy options.' },
      { who: edge.from.name, text: 'Prioritize the cost-sensitive segment; signal is strong.' },
      { who: edge.to.name, text: 'Copy. Drafting two scenarios; will loop in Engineering next.' },
    ];
    msgs.forEach((m) => {
      const row = document.createElement('div');
      row.className = 'msg';
      const av = document.createElement('div');
      av.className = 'av';
      av.textContent = initials(m.who);
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.textContent = m.text;
      row.appendChild(av);
      row.appendChild(bubble);
      panelBody.appendChild(row);
    });
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    opts.onActivateEdge?.(edge.id);
    opts.onOpenChange?.(true);
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
          <div style={{ fontWeight: 700, color: '#e9f3ff' }}>Conversation</div>
          <button id="closePanel" className={styles.btn} type="button">Close</button>
        </div>
        <div id="panelBody" className="body" />
      </div>
      <div className={styles.cta}><button id="continueBtn" className={styles.btn} disabled>Continue</button></div>
    </>
  );
}
