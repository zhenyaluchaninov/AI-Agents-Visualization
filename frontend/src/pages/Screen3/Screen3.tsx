import { useEffect, useRef, useCallback, useState } from 'react';
import styles from './Screen3.module.css';
import { DevControls, DEFAULT_PARAMS, initDevControls } from './DevControls';
import { ChatPanel, initChatPanel } from './ChatPanel';
import type { Screen3Params } from './DevControls';

type Screen3Props = { devControlsEnabled?: boolean };

export default function Screen3({ devControlsEnabled = false }: Screen3Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const devControlsReadyRef = useRef<(() => void) | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const handleDevControlsReady = useCallback(() => {
    devControlsReadyRef.current?.();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflowY;
    const prevBodyOverflow = body.style.overflowY;
    html.style.overflowY = 'hidden';
    body.style.overflowY = 'hidden';
    return () => {
      html.style.overflowY = prevHtmlOverflow;
      body.style.overflowY = prevBodyOverflow;
    };
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setHasEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const $ = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>(`#${id}`)!;

    const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const vp = $('vp') as HTMLDivElement;
    const neon = $('layer-neon') as HTMLCanvasElement;
    const edgesCanvas = $('layer-edges') as HTMLCanvasElement;
    const vigCanvas = $('layer-vignette') as HTMLCanvasElement;
    const nctx = neon.getContext('2d')!;
    const ectx = edgesCanvas.getContext('2d')!;
    const vctx = vigCanvas.getContext('2d')!;

    let W = 0, H = 0, lastT = performance.now();
    let panelOpen = false;

    const params: Screen3Params = { ...DEFAULT_PARAMS };

    type ResizeOptions = { keepSeed?: boolean };
    let seededOnce = false;

    function resize(options: ResizeOptions = {}) {
      const keepSeed = !!options.keepSeed && seededOnce;
      const width = vp.clientWidth || vp.getBoundingClientRect().width;
      const height = vp.clientHeight || vp.getBoundingClientRect().height;
      const cssW = Math.max(1, width);
      const cssH = Math.max(1, height);
      W = neon.width = Math.floor(cssW * DPR);
      H = neon.height = Math.floor(cssH * DPR);
      edgesCanvas.width = W; edgesCanvas.height = H;
      vigCanvas.width = W; vigCanvas.height = H;
      [neon, edgesCanvas, vigCanvas].forEach((c) => { c.style.width = cssW + 'px'; c.style.height = cssH + 'px'; });
      buildAnchors();
      buildAgentNodes();
      if (!keepSeed) {
        reseedParticles(params.MAX);
        seededOnce = true;
      }
      placeAgents();
    }
    const handleResize = () => resize();


    const mouse = { x: null as number | null, y: null as number | null };
    vp.addEventListener('mousemove', (e) => { const r = vp.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * DPR; mouse.y = (e.clientY - r.top) * DPR; });
    vp.addEventListener('mouseleave', () => { mouse.x = mouse.y = null; });

    const AGENTS = [
      { id: 'A1', name: 'Research' }, { id: 'A2', name: 'Strategy' }, { id: 'A3', name: 'Design' },
      { id: 'A4', name: 'Product' }, { id: 'A5', name: 'Engineer' }, { id: 'A6', name: 'Ops' },
    ];

    const anchors: { x: number; y: number; angle: number }[] = [];
    function buildAnchors() {
      anchors.length = 0;
      const cx = W / 2, cy = H / 2, baseR = Math.min(W, H) * 0.24;
      for (let i = 0; i < AGENTS.length; i++) {
        const angle = -Math.PI / 2 + i * (Math.PI * 2 / AGENTS.length);
        anchors.push({ x: cx + Math.cos(angle) * baseR, y: cy + Math.sin(angle) * baseR, angle });
      }
    }

    const agentsLayer = $('agents') as HTMLDivElement;
    const agentEls = new Map<string, HTMLDivElement>();
    const chatPins = new Map<string, HTMLButtonElement>();
    const continueBtn = root.querySelector<HTMLButtonElement>('#continueBtn');
    if (continueBtn) {
      continueBtn.disabled = true;
      continueBtn.classList.remove('enabled');
    }
    let continueUnlocked = false;
    const unlockContinue = () => {
      if (continueUnlocked) return;
      continueUnlocked = true;
      if (continueBtn) {
        continueBtn.disabled = false;
        continueBtn.classList.add('enabled');
      }
    };
    function chatIconSvg() {
      return `
        <svg class=\"ci\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" aria-hidden=\"true\">
          <g class=\"ci-bubble\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\">
            <path d=\"M6 5.5h12a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5H10.2c-.43 0-.85.13-1.2.36L6 19.5v-2.9A2.5 2.5 0 0 1 3.5 14V8A2.5 2.5 0 0 1 6 5.5Z\"/>
          </g>
          <g class=\"ci-dots\" fill=\"currentColor\">
            <circle cx=\"9\" cy=\"12\" r=\"1.3\"/>
            <circle cx=\"12\" cy=\"12\" r=\"1.3\"/>
            <circle cx=\"15\" cy=\"12\" r=\"1.3\"/>
          </g>
        </svg>
      `;
    }
    const DEFAULT_CHAT_ICON_PX = 29;
    const DEFAULT_CHAT_PIN_PX = 36;

    function tunePinSvg(pin: HTMLButtonElement) {
      const svg = pin.querySelector('svg');
      if (!svg) return;
      svg.classList.add('ci');
      svg.removeAttribute('width');
      svg.removeAttribute('height');
    }
    function applyChatPinSizing() {
      const pinSize = DEFAULT_CHAT_PIN_PX;
      const iconSize = DEFAULT_CHAT_ICON_PX;
      chatPins.forEach((pin) => {
        pin.style.width = pinSize + 'px';
        pin.style.height = pinSize + 'px';
        const svg = pin.querySelector('svg');
        if (svg) {
          (svg as SVGElement).style.width = iconSize + 'px';
          (svg as SVGElement).style.height = iconSize + 'px';
        }
      });
    }
    function applyChatPinIcons() {
      chatPins.forEach((pin) => {
        pin.setAttribute('type', 'button');
        pin.innerHTML = chatIconSvg();
        tunePinSvg(pin);
      });
    }
    const AGENT_COLORS: Record<string, string> = {
      A1: '#9d8ed4',
      A2: '#6ab59d',
      A3: '#ff9d5c',
      A4: '#7dd3c0',
      A5: '#6ba3d4',
      A6: '#ff6b6b',
    };
    function darkenHexToRgba(hex: string, mul: number, alpha: number) { const { r, g, b } = hexToRgb(hex); const rr = Math.max(0, Math.min(255, Math.round(r * mul))); const gg = Math.max(0, Math.min(255, Math.round(g * mul))); const bb = Math.max(0, Math.min(255, Math.round(b * mul))); return `rgba(${rr},${gg},${bb},${alpha})`; }
    function mountAgents() {
      agentsLayer.innerHTML = '';
      agentEls.clear(); chatPins.clear();
      AGENTS.forEach((a) => {
        const el = document.createElement('div'); el.className = 'agent'; el.innerHTML = '<div class="label"></div>';
        (el.querySelector('.label') as HTMLDivElement).textContent = a.name;
        const col = AGENT_COLORS[a.id] || '#8b7df0';
        el.style.background = hexToRgba(col, 0.22);
        el.style.borderColor = hexToRgba(col, 0.65);
        el.style.boxShadow = `0 8px 20px ${hexToRgba(col, 0.35)}`;
        const shadow = darkenHexToRgba(col, 0.75, 0.85);
        const halo = darkenHexToRgba(col, 0.75, 0.38);
        el.style.setProperty('--agent-label-shadow-color', shadow);
        el.style.setProperty('--agent-label-outline-color', halo);
        el.classList.add('introHidden');
        agentsLayer.appendChild(el); agentEls.set(a.id, el);
        const pin = document.createElement('button'); pin.className = 'chatpin'; pin.textContent = '💬';
        const col2 = AGENT_COLORS[a.id] || '#8b7df0';
        try { pin.setAttribute('type', 'button'); pin.innerHTML = chatIconSvg(); tunePinSvg(pin); } catch {}
        pin.style.background = hexToRgba(col2, 0.28);
        pin.style.borderColor = hexToRgba(col2, 0.75);
        pin.style.color = '#fff';
        pin.style.boxShadow = `0 8px 20px ${hexToRgba(col2, 0.35)}`;
        pin.style.setProperty('--agent-label-shadow-color', shadow);
        pin.style.setProperty('--agent-label-outline-color', halo);
        pin.classList.add('introHidden');
        pin.disabled = true;
        pin.setAttribute('aria-hidden', 'true');
        pin.addEventListener('click', () => openChatForAgent(a.id)); agentsLayer.appendChild(pin); chatPins.set(a.id, pin);
      });
    }
    function placeAgents() {
      for (let i = 0; i < AGENTS.length; i++) {
        const el = agentEls.get(AGENTS[i].id)!; const pin = chatPins.get(AGENTS[i].id)!; const p = anchors[i]; if (!el || !pin || !p) continue;
        const x = p.x / DPR, y = p.y / DPR; el.style.left = x + 'px'; el.style.top = y + 'px'; pin.style.left = x + 'px';
        const pinSize = DEFAULT_CHAT_PIN_PX;
        pin.style.top = (y - (pinSize + 2) + pinSize * 0.10) + 'px';
      }
    }

    let agentNodes: { id: string; x: number; y: number }[] = [];
    function buildAgentNodes() { agentNodes = AGENTS.map((a, i) => ({ id: a.id, x: anchors[i]?.x || 0, y: anchors[i]?.y || 0 })); }
    function updateAgentNodes() { for (let i = 0; i < agentNodes.length; i++) { agentNodes[i].x = anchors[i].x; agentNodes[i].y = anchors[i].y; } }

    const edges = [['A1', 'A3'], ['A1', 'A4'], ['A2', 'A5'], ['A2', 'A6'], ['A3', 'A5'], ['A4', 'A6'], ['A5', 'A6']]
      .map((e, i) => ({ id: 'E' + (i + 1), from: e[0], to: e[1], seed: Math.random() }));
    let activeEdgeId: string | null = null, activeEdgeSince = 0;
    let lastActiveEdgeId: string | null = null;
    let ambientAlpha = 1;
    let ambientActive = new Set<string>();
    let ambientLastSwitch = 0;

    function currentAgentMap() { const m = new Map<string, { x: number; y: number; name: string }>(); for (let i = 0; i < AGENTS.length; i++) { const p = anchors[i]; m.set(AGENTS[i].id, { x: p.x, y: p.y, name: AGENTS[i].name }); } return m; }
    function updatePinActivity() {
      chatPins.forEach((pin) => pin.classList.remove('active'));
      if (!activeEdgeId) return;
      const e = edges.find((E) => E.id === activeEdgeId);
      if (!e) return;
      chatPins.get(e.from)?.classList.add('active');
      chatPins.get(e.to)?.classList.add('active');
    }
    const chat = initChatPanel(root, {
      onOpenChange: (o) => { panelOpen = o; },
      onActivateEdge: (id) => { activeEdgeId = id; if (id) activeEdgeSince = performance.now(); updatePinActivity(); },
    });
    function openChatForAgent(agentId: string) {
      const e = edges.find((E) => E.from === agentId || E.to === agentId); if (!e) return;
      if (panelOpen && activeEdgeId === e.id) return;
      const amap = currentAgentMap(); const edge = { id: e.id, from: amap.get(e.from)!, to: amap.get(e.to)! };
      chat.openChat(edge);
      unlockContinue();
    }

    class PNode {
      x = 0; y = 0; vx = 0; vy = 0; r = 1; pulse = 0; age = 0; life = 0; cx = 0; cy = 0; cvx = 0; cvy = 0; ox = 0; oy = 0; sep = 20;
      constructor(cx: number, cy: number) { this.reset(true, { x: cx, y: cy }); this.cx = cx; this.cy = cy; this.pulse = Math.random(); }
      reset(_initial = false, pos: { x: number; y: number } | null = null) {
        const start = pos || { x: Math.random() * W, y: Math.random() * H };
        this.x = start.x; this.y = start.y;
        const a = Math.random() * Math.PI * 2; const speed = (Math.random() * 0.7 + 0.3) * params.P_SPEED * 2.0 * DPR;
        this.vx = Math.cos(a) * speed; this.vy = Math.sin(a) * speed;
        this.r = (Math.random() * 1.6 + 0.5) * DPR; this.pulse = Math.random(); this.life = (params.MEAN_LIFE * (0.6 + Math.random() * 0.8));
        this.age = 0; if ((this as any).cx === undefined) { this.cx = this.x; this.cy = this.y; }
        this.cvx = 0; this.cvy = 0; this.ox = 0; this.oy = 0;
        const minS = Math.min(params.SPACING_MIN, params.SPACING_MAX); const maxS = Math.max(params.SPACING_MIN, params.SPACING_MAX);
        this.sep = minS + Math.random() * Math.max(0, maxS - minS);
      }
      step(dt: number) {
        const spring = 0.07; const dxc = this.cx - this.x, dyc = this.cy - this.y; this.vx += dxc * spring * dt; this.vy += dyc * spring * dt;
        if (mouse.x !== null && mouse.y !== null) { const dx = mouse.x - this.x, dy = mouse.y - this.y; const dist = Math.hypot(dx, dy) + 1e-3; const R = params.ATTR_R * DPR; if (dist < R) { const falloff = (1 - dist / R); const force = params.ATTR * 28 * falloff; this.vx += (dx / dist) * force * dt; this.vy += (dy / dist) * force * dt; } }
        const curl = 0.22 * (params.LIFELESS ? 0.6 : 1.0); const ox = -this.vy, oy = this.vx; this.vx += ox * 0.02 * curl * dt; this.vy += oy * 0.02 * curl * dt;
        const damp = 0.985; this.vx *= Math.pow(damp, dt * 60); this.vy *= Math.pow(damp, dt * 60); this.x += this.vx * dt * 60; this.y += this.vy * dt * 60; this.pulse += 0.02 * dt * 60; this.age += dt; if (this.age > this.life && !params.LIFELESS) { this.respawn(); }
      }
      renderPos(_dt: number) { return { x: this.x, y: this.y }; }
      respawn() { const pos = randomCellPosition(); this.cx = pos.x; this.cy = pos.y; this.reset(true, pos); }
      fadeAlpha() { const tIn = Math.min(1, this.age / 0.35); if (params.LIFELESS) return tIn; const tOut = Math.min(1, Math.max(0, (this.life - this.age) / 0.45)); return tIn * tOut; }
      draw(ctx: CanvasRenderingContext2D, dt: number) { const tw = 0.6 + Math.sin(this.pulse) * 0.35; const a = this.fadeAlpha(); if (a <= 0) return; ctx.globalAlpha = 0.55 * a; const rr = this.r * params.P_SIZE; const p = this.renderPos(dt); ctx.beginPath(); ctx.arc(p.x, p.y, rr * tw, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    }

    let nodes: PNode[] = [];
    let gridCols = 0, gridRows = 0, cellW = 0, cellH = 0;
    function computeGrid(n: number) { gridCols = Math.max(4, Math.floor(Math.sqrt(n))); gridRows = Math.max(4, Math.round(n / gridCols)); cellW = W / gridCols; cellH = H / gridRows; }
    function acceptPos(px: number, py: number) { const R0 = (params.HOLE_R || 0) * DPR; if (R0 <= 0) return true; const dx = px - W / 2, dy = py - H / 2; const r = Math.hypot(dx, dy); const fade = 60 * DPR; const Rf = R0 + fade; if (r <= R0) return false; if (r >= Rf) return true; const p = (r - R0) / (Rf - R0); return Math.random() < p; }
    function randomCellPosition() { let tries = 0; while (true) { const c = Math.floor(Math.random() * gridCols); const r = Math.floor(Math.random() * gridRows); const px = (c + Math.random()) * cellW; const py = (r + Math.random()) * cellH; if (acceptPos(px, py)) return { x: px, y: py }; tries++; if (tries > 8) { const R0 = (params.HOLE_R || 0) * DPR; const fade = 60 * DPR; const base = R0 + fade + 10 * DPR; const rr = base + Math.random() * Math.max(W, H) * 0.3; const ang = Math.random() * Math.PI * 2; const px2 = W / 2 + Math.cos(ang) * rr; const py2 = H / 2 + Math.sin(ang) * rr; return { x: px2, y: py2 }; } } }
    function reseedParticles(nCount: number) { nodes.length = 0; const n = Math.max(1, nCount | 0); computeGrid(n); let added = 0; for (let r = 0; r < gridRows; r++) { for (let c = 0; c < gridCols; c++) { if (added >= n) break; const px = (c + Math.random()) * cellW; const py = (r + Math.random()) * cellH; let pos = { x: px, y: py }; if (!acceptPos(pos.x, pos.y)) pos = randomCellPosition(); nodes.push(new PNode(pos.x, pos.y)); added++; } } while (nodes.length < n) { const p = randomCellPosition(); nodes.push(new PNode(p.x, p.y)); } seededOnce = true; }
    function randomizeNodeSpacings() { const minS = Math.min(params.SPACING_MIN, params.SPACING_MAX); const maxS = Math.max(params.SPACING_MIN, params.SPACING_MAX); for (let i = 0; i < nodes.length; i++) { nodes[i].sep = minS + Math.random() * Math.max(0, maxS - minS); } }

    let rafId: number | null = null;

    type IntroEdge = { fromId: string; toId: string; start: number; dur: number; resolve: () => void } | null;
    let introRunning = true;
    let introEdge: IntroEdge = null;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    function animateIntroEdge(fromId: string, toId: string, dur: number) {
      return new Promise<void>((resolve) => {
        introEdge = { fromId, toId, start: performance.now(), dur, resolve };
      });
    }
    function drawBackground() { nctx.clearRect(0, 0, W, H); const g = nctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.7); g.addColorStop(0, hexToRgba(params.BG1, 1.0)); g.addColorStop(1, hexToRgba(params.BG2, 1.0)); nctx.fillStyle = g; nctx.fillRect(0, 0, W, H); }
    function drawVignette() { vctx.clearRect(0, 0, W, H); if (params.VIG_STRENGTH <= 0) return; const g = vctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.7); const rgba = hexToRgb(params.VIG_COLOR); vctx.globalCompositeOperation = 'source-over'; g.addColorStop(0, `rgba(${rgba.r},${rgba.g},${rgba.b},0)`); g.addColorStop(1, `rgba(${rgba.r},${rgba.g},${rgba.b},${params.VIG_STRENGTH})`); vctx.fillStyle = g; vctx.fillRect(0, 0, W, H); }
    function spacingForces() { const k = 12; for (let i = 0; i < nodes.length; i++) { const a = nodes[i]; for (let j = i + 1; j < nodes.length; j++) { const b = nodes[j]; const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy; const S = Math.max(4, ((a.sep || params.SPACING_MIN) + (b.sep || params.SPACING_MIN)) * 0.5) * DPR; const S2 = S * S; if (d2 < S2 && d2 > 1) { const d = Math.sqrt(d2); const push = (1 - d / S) * (k / d); const fx = dx * push, fy = dy * push; a.vx += fx * 0.001; a.vy += fy * 0.001; b.vx -= fx * 0.001; b.vy -= fy * 0.001; } } } }
    function tick() {
      const now = performance.now();
      const dt = Math.min(0.033, (now - lastT) / 1000);
      lastT = now;
      if (activeEdgeId !== lastActiveEdgeId) { updatePinActivity(); lastActiveEdgeId = activeEdgeId; }
      applyChatPinSizing();
      drawBackground();
      spacingForces();
      nctx.save(); nctx.globalCompositeOperation = isColorBlackish(params.COLOR) ? 'source-over' : 'lighter'; nctx.shadowBlur = 0; nctx.shadowColor = 'transparent'; nctx.fillStyle = colorWithAlpha(params.COLOR, 1.0); nctx.filter = params.BLUR > 0 ? `blur(${params.BLUR}px)` : 'none';
      nodes.forEach((n) => { n.step(dt); n.draw(nctx, dt); });
      const L = params.LINK_DIST * DPR, L2 = L * L; nctx.lineWidth = params.THICK_P * DPR * 0.35; nctx.strokeStyle = colorWithAlpha(params.COLOR, 1.0);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]; const ap = a.renderPos(dt); const af = a.fadeAlpha(); if (af <= 0) continue;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]; const bp = b.renderPos(dt); const bf = b.fadeAlpha(); if (bf <= 0) continue;
          const dx = ap.x - bp.x, dy = ap.y - bp.y, d2 = dx * dx + dy * dy; if (d2 < L2) {
            const d = Math.sqrt(d2); const opaqueAt = Math.max(1, L * params.P_LINK_OPQ_FRAC); const t = Math.max(0, Math.min(1, 1 - (d / opaqueAt)));
            const base = t; const alpha = Math.max(0, Math.min(1, base * af * bf)); if (alpha > 0.001) { nctx.globalAlpha = alpha; nctx.beginPath(); nctx.moveTo(ap.x, ap.y); nctx.lineTo(bp.x, bp.y); nctx.stroke(); }
          }
        }
      }
      nctx.globalAlpha = 0.9;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]; const ap = a.renderPos(dt); const af = a.fadeAlpha(); if (af <= 0) continue;
        for (let j = 0; j < agentNodes.length; j++) {
          const b = agentNodes[j]; const dx = ap.x - b.x, dy = ap.y - b.y, d2 = dx * dx + dy * dy; if (d2 < L2) {
            const d = Math.sqrt(d2); const opaqueAt = Math.max(1, L * params.P_LINK_OPQ_FRAC); const t = Math.max(0, Math.min(1, 1 - (d / opaqueAt)));
            const base = t; const alpha = Math.max(0, Math.min(1, base * af)); if (alpha <= 0.001) continue; nctx.globalAlpha = alpha; nctx.beginPath(); nctx.moveTo(ap.x, ap.y); nctx.lineTo(b.x, b.y); nctx.stroke();
          }
        }
      }
      nctx.globalAlpha = 1; nctx.restore();
      placeAgents(); updateAgentNodes();
      ectx.clearRect(0, 0, W, H); ectx.save(); ectx.globalCompositeOperation = isColorBlackish(params.LINK_COLOR) ? 'source-over' : 'lighter';

      if (introRunning) {
        if (introEdge) {
          const amap = currentAgentMap();
          const A = amap.get(introEdge.fromId);
          const B = amap.get(introEdge.toId);
          if (A && B) {
            const t = Math.max(0, Math.min(1, (now - introEdge.start) / introEdge.dur));
            const x = A.x + (B.x - A.x) * t;
            const y = A.y + (B.y - A.y) * t;
            const baseWidth = params.THICK_A * DPR * 0.7;
            const baseGlow = params.GLOW_LINKS * DPR * 0.7;
            ectx.lineWidth = baseWidth;
            ectx.strokeStyle = colorWithAlpha(params.LINK_COLOR, 1.0);
            ectx.shadowBlur = baseGlow; ectx.shadowColor = params.LINK_COLOR; ectx.globalAlpha = 1;
            ectx.beginPath(); ectx.moveTo(A.x, A.y); ectx.lineTo(x, y); ectx.stroke();

            ectx.save();
            const baseR = Math.max(2 * DPR, (params.LINK_ORB_SIZE || 3) * DPR);
            ectx.beginPath();
            ectx.fillStyle = colorWithAlpha(params.LINK_ORB_COLOR || params.LINK_COLOR, 0.95);
            ectx.shadowBlur = Math.max(8 * DPR, baseR * 1.6); ectx.shadowColor = params.LINK_ORB_COLOR || params.LINK_COLOR;
            ectx.arc(x, y, baseR, 0, Math.PI * 2); ectx.fill();
            ectx.restore();

            if (t >= 1 && introEdge) { const cb = introEdge.resolve; introEdge = null; try { cb(); } catch {} }
          }
        }
        ectx.restore(); drawVignette(); rafId = requestAnimationFrame(tick); return;
      }
      const baseWidth = params.THICK_A * DPR * 0.7, baseGlow = params.GLOW_LINKS * DPR * 0.7; const pulse = activeEdgeId ? (0.5 + 0.5 * Math.sin((performance.now() - activeEdgeSince) / 260)) : 0; const amap = currentAgentMap();
      const targetAmb = activeEdgeId ? 0 : 1;
      ambientAlpha += (targetAmb - ambientAlpha) * Math.min(1, dt * 3);
      if (now - ambientLastSwitch > 2400) {
        ambientActive = new Set<string>();
        const k = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < k; i++) {
          const pick = edges[Math.floor(Math.random() * edges.length)];
          if (pick) ambientActive.add(pick.id);
        }
        ambientLastSwitch = now;
      }
      edges.forEach((E) => {
        const A = amap.get(E.from), B = amap.get(E.to); if (!A || !B) return;
        const isActive = (E.id === activeEdgeId);
        ectx.lineWidth = isActive ? baseWidth * (1.0 + 0.9 * pulse) : baseWidth;
        ectx.strokeStyle = colorWithAlpha(params.LINK_COLOR, isActive ? 1.0 : 0.85);
        ectx.shadowBlur = isActive ? baseGlow * (1.2 + 0.8 * pulse) : baseGlow; ectx.shadowColor = params.LINK_COLOR; ectx.globalAlpha = isActive ? 1 : 0.95;
        ectx.beginPath(); ectx.moveTo(A.x, A.y); ectx.lineTo(B.x, B.y); ectx.stroke();

        if (isActive) {
          ectx.save();
          const scale = panelOpen ? 1.5 : 1.0; const baseR = (params.LINK_ORB_SIZE || 3) * DPR; const orbR = baseR * scale; const N = 10; const tNow = (performance.now() / 1600) % 1;
          for (let k = 0; k < N; k++) {
            const tt = (tNow + k / N) % 1; const x = A.x + (B.x - A.x) * tt; const y = A.y + (B.y - A.y) * tt;
            ectx.beginPath(); ectx.fillStyle = colorWithAlpha(params.LINK_ORB_COLOR || params.LINK_COLOR, 0.95);
            ectx.shadowBlur = Math.max(8 * DPR, baseR * 1.6); ectx.shadowColor = params.LINK_ORB_COLOR || params.LINK_COLOR; ectx.arc(x, y, orbR, 0, Math.PI * 2); ectx.fill();
          }
          ectx.restore();
        } else if (ambientAlpha > 0 && ambientActive.has(E.id)) {
          ectx.save();
          const baseR = Math.max(1.2 * DPR, (params.LINK_ORB_SIZE || 3) * DPR * 0.6);
          const tNow = (performance.now() / 2200 + (E.seed || 0)) % 1;
          const orbCount = 1;
          for (let k = 0; k < orbCount; k++) {
            const tt = (tNow + k / (orbCount || 1)) % 1; const x = A.x + (B.x - A.x) * tt; const y = A.y + (B.y - A.y) * tt;
            ectx.beginPath();
            ectx.globalAlpha = 0.30 * ambientAlpha; ectx.fillStyle = colorWithAlpha(params.LINK_COLOR, 0.9);
            ectx.shadowBlur = Math.max(6 * DPR, baseR * 1.2); ectx.shadowColor = params.LINK_COLOR; ectx.arc(x, y, baseR, 0, Math.PI * 2); ectx.fill();
          }
          ectx.restore();
        }
      });
      ectx.restore(); drawVignette(); rafId = requestAnimationFrame(tick);
    }

    function colorWithAlpha(c: string, a: number) { if (c.startsWith('#')) { const { r, g, b } = hexToRgb(c); return `rgba(${r},${g},${b},${a})`; } if (c.startsWith('hsl')) { return c.replace('hsl', 'hsla').replace(')', `, ${a})`); } return c; }
    function isColorBlackish(c: string) { if (c.startsWith('#')) { const { r, g, b } = hexToRgb(c); const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; return L < 0.05; } if (c.startsWith('hsl')) { try { const m = c.match(/hsl[a]?\(([^)]+)\)/i); if (!m) return false; const parts = m[1].split(/[,\s]+/).filter(Boolean); const l = parts[2] || '0%'; const lv = parseFloat(l) / 100; return lv < 0.08; } catch { return false; } } return false; }
    function hexToRgb(hex: string) { let h = hex.replace('#', ''); if (h.length === 3) { h = [h[0], h[0], h[1], h[1], h[2], h[2]].join(''); } const num = parseInt(h, 16); return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }; }
    function hexToRgba(hex: string, a: number) { const { r, g, b } = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; }

    const wireDevControls = () => initDevControls(root, params, { reseedParticles, randomizeNodeSpacings });
    devControlsReadyRef.current = wireDevControls;
    wireDevControls();

    mountAgents();
    applyChatPinIcons();
    applyChatPinSizing();
    resize();
    rafId = requestAnimationFrame(tick);
    window.addEventListener('resize', handleResize);

    (async () => {
      try {
        requestAnimationFrame(() => {
          vp.classList.add('intro-in');
          vp.classList.remove('intro-start');
        });
        await sleep(520);
        resize({ keepSeed: true });
        await sleep(1000);

        let agentDelay = 140;
        for (let i = 0; i < AGENTS.length; i++) {
          const el = agentEls.get(AGENTS[i].id);
          if (el) el.classList.remove('introHidden');
          if (i < AGENTS.length - 1) {
            await sleep(agentDelay);
            agentDelay = Math.round(agentDelay * 1.3);
          }
        }

        await sleep(1500);

        for (let i = 0; i < AGENTS.length - 1; i++) {
          const fromId = AGENTS[i].id; const toId = AGENTS[i + 1].id;
          const fromPin = chatPins.get(fromId);
          if (fromPin) { fromPin.classList.remove('introHidden'); }
          await sleep(160);
          await animateIntroEdge(fromId, toId, 820);
          const toPin = chatPins.get(toId);
          if (toPin) { toPin.classList.remove('introHidden'); }
          await sleep(140);
        }

        introRunning = false;
        chatPins.forEach((pin) => { pin.disabled = false; pin.removeAttribute('aria-hidden'); pin.style.pointerEvents = 'auto'; });
      } catch {
        introRunning = false; chatPins.forEach((pin) => { pin.disabled = false; pin.removeAttribute('aria-hidden'); pin.style.pointerEvents = 'auto'; });
      }
    })();

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
      devControlsReadyRef.current = null;
      chat.destroy?.();
    };
  }, []);

  return (
    <div ref={rootRef} className={`${styles.root} ${hasEntered ? styles.entered : ''}`}>

      <div className={`${styles.bgOrb} ${styles.orb1}`} />
      <div className={`${styles.bgOrb} ${styles.orb2}`} />
      <div className={`${styles.bgOrb} ${styles.orb3}`} />
      <div className={styles.content}>
        <div className={styles.title}>Agents are discussing</div>
        <div className={styles.subtitle}>Tap a chat icon to peek inside.</div>

        <DevControls enabled={devControlsEnabled} onReady={handleDevControlsReady} />
        <div className="viewport intro-start" id="vp">
          <canvas id="layer-neon" />
          <canvas id="layer-edges" />
          <canvas id="layer-vignette" />
          <div id="agents" aria-hidden="false" />

          <ChatPanel />
        </div>

        <div className={styles.cta}><button id="continueBtn" className={styles.btn} disabled>Continue</button></div>
      </div>
    </div>
  );
}

