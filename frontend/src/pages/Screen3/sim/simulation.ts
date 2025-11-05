import { DEFAULT_PARAMS, loadScreen3SavedDefaults, type Screen3Params } from '../DevControls';
import { S3_AGENTS, S3_EDGES, S3_INTRO_EDGES } from '../constants';
import type { AgentEdge } from '../constants';

export type SimNode = { id: string; x: number; y: number; active?: boolean };
export type SimSnapshot = { nodes: SimNode[]; t: number };
export type SimConfig = { canvas: HTMLCanvasElement[]; width: number; height: number; seed?: number };
export type SimCallbacks = { onTick?(snap: SimSnapshot): void; onIntroEdgeStep?(progress: number): void };

type ResizeOptions = { width?: number; height?: number; keepSeed?: boolean };
type Listener = (snapshot: SimSnapshot) => void;

type Edge = {
  id: string;
  from: string;
  to: string;
  seed: number;
};

const INTRO_OVERRIDES_GRAPH = true; // if true, never re-hydrate legacy edges
const INTRO_EDGE_DURATION_MS = 360;

const IDLE_ORB_MAX_CONCURRENT = 4;
const IDLE_ORB_DURATION_MS = 1600;
const IDLE_ORB_INTERVAL_MIN_MS = 280;
const IDLE_ORB_INTERVAL_MAX_MS = 1000;
const IDLE_ORB_FADE_DURATION_MS = 280;
type IdleOrbPass = {
  edgeId: string;
  start: number;
  duration: number;
  direction: 1 | -1;
};

export function createSimulation(cfg: SimConfig, callbacks: SimCallbacks = {}) {
  const [neon, edgesCanvas, vignetteCanvas] = cfg.canvas;
  if (!neon || !edgesCanvas || !vignetteCanvas) {
    throw new Error('Expected three canvases (neon, edges, vignette).');
  }

  const neonContext = neon.getContext('2d');
  const edgesContext = edgesCanvas.getContext('2d');
  const vignetteContext = vignetteCanvas.getContext('2d');
  if (!neonContext || !edgesContext || !vignetteContext) {
    throw new Error('Failed to acquire canvas contexts for Screen3 simulation.');
  }
  const nctx = neonContext;
  const ectx = edgesContext;
  const vctx = vignetteContext;

  const viewportEl = neon.parentElement as HTMLElement | null;

  let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let width = Math.max(1, cfg.width);
  let height = Math.max(1, cfg.height);
  let lastT = performance.now();
  let rafId: number | null = null;

  const params: Screen3Params = { ...DEFAULT_PARAMS };
  const savedDefaults = loadScreen3SavedDefaults();
  if (savedDefaults) {
    Object.assign(params, savedDefaults);
  }
  const listeners = new Set<Listener>();
  const emitTick = (snapshot: SimSnapshot) => {
    callbacks.onTick?.(snapshot);
    listeners.forEach((listener) => listener(snapshot));
  };

  const snapshot: SimSnapshot = {
    nodes: S3_AGENTS.map((agent) => ({ id: agent.id, x: 0, y: 0, active: false })),
    t: performance.now(),
  };

  const anchors = S3_AGENTS.map(() => ({ x: 0, y: 0, angle: 0 }));
  let agentNodes = S3_AGENTS.map((agent) => ({ id: agent.id, x: 0, y: 0 }));
  let runtimeEdges: Edge[] = [];

  const toRuntimeEdge = (edge: AgentEdge | Edge): Edge =>
    'seed' in edge ? { ...edge } : { id: edge.id, from: edge.from, to: edge.to, seed: Math.random() };

  const cloneRuntimeEdge = (edge: Edge): Edge => ({ ...edge });

  const setRuntimeEdges = (edges: Array<AgentEdge | Edge>) => {
    runtimeEdges = edges.map(toRuntimeEdge);
  };

  const appendRuntimeEdge = (edge: AgentEdge | Edge) => {
    const candidate = toRuntimeEdge(edge);
    const idx = runtimeEdges.findIndex((existing) => existing.id === candidate.id);
    if (idx >= 0) {
      runtimeEdges[idx] = candidate;
    } else {
      runtimeEdges.push(candidate);
    }
  };

  const getRuntimeEdges = () => runtimeEdges.map(cloneRuntimeEdge);

  const toAgentEdge = (edge: Edge): AgentEdge => ({ id: edge.id, from: edge.from, to: edge.to });

  if (!INTRO_OVERRIDES_GRAPH) {
    setRuntimeEdges(S3_EDGES);
  }

  const nodes: PNode[] = [];
  let idleOrbPasses: IdleOrbPass[] = [];
  let idleOrbVisibility = 1;
  let idleOrbFadeFrom = 1;
  let idleOrbFadeTo = 1;
  let idleOrbFadeStart = performance.now();
  let idleOrbFadeDuration = IDLE_ORB_FADE_DURATION_MS;
  let nextIdleOrbTime = performance.now() + randRange(IDLE_ORB_INTERVAL_MIN_MS, IDLE_ORB_INTERVAL_MAX_MS);
  let gridCols = 0;
  let gridRows = 0;
  let cellW = 0;
  let cellH = 0;
  let seededOnce = false;

  type IntroEdge = {
    edge: Edge;
    start: number;
    dur: number;
    resolve: () => void;
  } | null;

  let introRunning = true;
  let introEdge: IntroEdge = null;
  let activeEdgeId: string | null = null;
  let activeEdgeSince = performance.now();

  const mouse = { x: null as number | null, y: null as number | null };
  const handleMouseMove = (event: MouseEvent) => {
    if (!viewportEl) return;
    const rect = viewportEl.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) * DPR;
    mouse.y = (event.clientY - rect.top) * DPR;
  };
  const handleMouseLeave = () => {
    mouse.x = null;
    mouse.y = null;
  };
  viewportEl?.addEventListener('mousemove', handleMouseMove);
  viewportEl?.addEventListener('mouseleave', handleMouseLeave);

  class PNode {
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    r = 1;
    pulse = 0;
    age = 0;
    life = 0;
    cx = 0;
    cy = 0;
    cvx = 0;
    cvy = 0;
    ox = 0;
    oy = 0;
    sep = 20;

    constructor(cx: number, cy: number) {
      this.reset(true, { x: cx, y: cy });
      this.cx = cx;
      this.cy = cy;
      this.pulse = Math.random();
    }

    reset(initial = false, pos: { x: number; y: number } | null = null) {
      const start = pos || { x: Math.random() * width * DPR, y: Math.random() * height * DPR };
      this.x = start.x;
      this.y = start.y;
      const a = Math.random() * Math.PI * 2;
      const speed = (Math.random() * 0.7 + 0.3) * params.P_SPEED * 2.0 * DPR;
      this.vx = Math.cos(a) * speed;
      this.vy = Math.sin(a) * speed;
      this.r = (Math.random() * 1.6 + 0.5) * DPR;
      this.pulse = Math.random();
      this.life = params.MEAN_LIFE * (0.6 + Math.random() * 0.8);
      this.age = 0;
      if (initial && (this as any).cx === undefined) {
        this.cx = this.x;
        this.cy = this.y;
      }
      this.cvx = 0;
      this.cvy = 0;
      this.ox = 0;
      this.oy = 0;
      const minS = Math.min(params.SPACING_MIN, params.SPACING_MAX);
      const maxS = Math.max(params.SPACING_MIN, params.SPACING_MAX);
      this.sep = minS + Math.random() * Math.max(0, maxS - minS);
    }

    step(dt: number) {
      const spring = 0.07;
      const dxc = this.cx - this.x;
      const dyc = this.cy - this.y;
      this.vx += dxc * spring * dt;
      this.vy += dyc * spring * dt;
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.hypot(dx, dy) + 1e-3;
        const R = params.ATTR_R * DPR;
        if (dist < R) {
          const falloff = 1 - dist / R;
          const force = params.ATTR * 28 * falloff;
          this.vx += (dx / dist) * force * dt;
          this.vy += (dy / dist) * force * dt;
        }
      }
      const curl = 0.22 * (params.LIFELESS ? 0.6 : 1.0);
      const ox = -this.vy;
      const oy = this.vx;
      this.vx += ox * 0.02 * curl * dt;
      this.vy += oy * 0.02 * curl * dt;
      const damp = 0.985;
      this.vx *= Math.pow(damp, dt * 60);
      this.vy *= Math.pow(damp, dt * 60);
      this.x += this.vx * dt * 60;
      this.y += this.vy * dt * 60;
      this.pulse += 0.02 * dt * 60;
      this.age += dt;
      if (this.age > this.life && !params.LIFELESS) {
        this.respawn();
      }
    }

    renderPos() {
      return { x: this.x, y: this.y };
    }

    respawn() {
      const pos = randomCellPosition();
      this.cx = pos.x;
      this.cy = pos.y;
      this.reset(true, pos);
    }

    fadeAlpha() {
      const tIn = Math.min(1, this.age / 0.35);
      if (params.LIFELESS) return tIn;
      const tOut = Math.min(1, Math.max(0, (this.life - this.age) / 0.45));
      return tIn * tOut;
    }

    draw(ctx: CanvasRenderingContext2D) {
      const tw = 0.6 + Math.sin(this.pulse) * 0.35;
      const a = this.fadeAlpha();
      if (a <= 0) return;
      ctx.globalAlpha = 0.55 * a;
      const rr = this.r * params.P_SIZE;
      const p = this.renderPos();
      ctx.beginPath();
      ctx.arc(p.x, p.y, rr * tw, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function computeGrid(n: number) {
    gridCols = Math.max(4, Math.floor(Math.sqrt(n)));
    gridRows = Math.max(4, Math.round(n / gridCols));
    cellW = (width * DPR) / gridCols;
    cellH = (height * DPR) / gridRows;
  }

  function acceptPos(px: number, py: number) {
    const R0 = (params.HOLE_R || 0) * DPR;
    if (R0 <= 0) return true;
    const dx = px - (neon.width) / 2;
    const dy = py - (neon.height) / 2;
    const r = Math.hypot(dx, dy);
    const fade = 60 * DPR;
    const Rf = R0 + fade;
    if (r <= R0) return false;
    if (r >= Rf) return true;
    const p = (r - R0) / (Rf - R0);
    return Math.random() < p;
  }

  function randomCellPosition() {
    let tries = 0;
    while (true) {
      const c = Math.floor(Math.random() * gridCols);
      const r = Math.floor(Math.random() * gridRows);
      const px = (c + Math.random()) * cellW;
      const py = (r + Math.random()) * cellH;
      if (acceptPos(px, py)) return { x: px, y: py };
      tries++;
      if (tries > 8) {
        const R0 = (params.HOLE_R || 0) * DPR;
        const fade = 60 * DPR;
        const base = R0 + fade + 10 * DPR;
        const rr = base + Math.random() * Math.max(neon.width, neon.height) * 0.3;
        const ang = Math.random() * Math.PI * 2;
        const px2 = neon.width / 2 + Math.cos(ang) * rr;
        const py2 = neon.height / 2 + Math.sin(ang) * rr;
        return { x: px2, y: py2 };
      }
    }
  }

  function reseedParticles(count: number) {
    nodes.length = 0;
    const n = Math.max(1, count | 0);
    computeGrid(n);
    let added = 0;
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        if (added >= n) break;
        const px = (c + Math.random()) * cellW;
        const py = (r + Math.random()) * cellH;
        let pos = { x: px, y: py };
        if (!acceptPos(pos.x, pos.y)) pos = randomCellPosition();
        nodes.push(new PNode(pos.x, pos.y));
        added++;
      }
    }
    while (nodes.length < n) {
      const p = randomCellPosition();
      nodes.push(new PNode(p.x, p.y));
    }
    seededOnce = true;
  }

  function randomizeNodeSpacings() {
    const minS = Math.min(params.SPACING_MIN, params.SPACING_MAX);
    const maxS = Math.max(params.SPACING_MIN, params.SPACING_MAX);
    for (let i = 0; i < nodes.length; i++) {
      nodes[i].sep = minS + Math.random() * Math.max(0, maxS - minS);
    }
  }

  function buildAnchors() {
    const cx = neon.width / 2;
    const cy = neon.height / 2;
    const baseR = Math.min(neon.width, neon.height) * 0.24;
    for (let i = 0; i < S3_AGENTS.length; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / S3_AGENTS.length;
      anchors[i] = {
        x: cx + Math.cos(angle) * baseR,
        y: cy + Math.sin(angle) * baseR,
        angle,
      };
    }
  }

  function buildAgentNodes() {
    agentNodes = S3_AGENTS.map((agent, idx) => ({
      id: agent.id,
      x: anchors[idx]?.x || 0,
      y: anchors[idx]?.y || 0,
    }));
  }

  function updateAgentNodes() {
    for (let i = 0; i < agentNodes.length; i++) {
      agentNodes[i].x = anchors[i]?.x || 0;
      agentNodes[i].y = anchors[i]?.y || 0;
    }
  }

  function updateSnapshot() {
    const now = performance.now();
    snapshot.t = now;
    for (let i = 0; i < snapshot.nodes.length; i++) {
      const target = snapshot.nodes[i];
      const source = agentNodes[i];
      target.x = source.x / DPR;
      target.y = source.y / DPR;
      const onEdge = activeEdgeId
        ? runtimeEdges.some((edge) => edge.id === activeEdgeId && (edge.from === target.id || edge.to === target.id))
        : false;
      target.active = onEdge;
    }
    emitTick(snapshot);
  }

  function drawBackground() {
    nctx.clearRect(0, 0, neon.width, neon.height);
    const g = nctx.createRadialGradient(neon.width / 2, neon.height / 2, 0, neon.width / 2, neon.height / 2, Math.max(neon.width, neon.height) * 0.7);
    g.addColorStop(0, hexToRgba(params.BG1, 1.0));
    g.addColorStop(1, hexToRgba(params.BG2, 1.0));
    nctx.fillStyle = g;
    nctx.fillRect(0, 0, neon.width, neon.height);
  }

  function drawVignette() {
    vctx.clearRect(0, 0, vignetteCanvas.width, vignetteCanvas.height);
    if (params.VIG_STRENGTH <= 0) return;
    const g = vctx.createRadialGradient(
      vignetteCanvas.width / 2,
      vignetteCanvas.height / 2,
      Math.min(vignetteCanvas.width, vignetteCanvas.height) * 0.2,
      vignetteCanvas.width / 2,
      vignetteCanvas.height / 2,
      Math.max(vignetteCanvas.width, vignetteCanvas.height) * 0.7,
    );
    const rgba = hexToRgb(params.VIG_COLOR);
    vctx.globalCompositeOperation = 'source-over';
    g.addColorStop(0, `rgba(${rgba.r},${rgba.g},${rgba.b},0)`);
    g.addColorStop(1, `rgba(${rgba.r},${rgba.g},${rgba.b},${params.VIG_STRENGTH})`);
    vctx.fillStyle = g;
    vctx.fillRect(0, 0, vignetteCanvas.width, vignetteCanvas.height);
  }

  function currentAgentMap() {
    const map = new Map<string, { x: number; y: number }>();
    for (let i = 0; i < agentNodes.length; i++) {
      map.set(agentNodes[i].id, { x: agentNodes[i].x, y: agentNodes[i].y });
    }
    return map;
  }

  function spacingForces() {
    const k = 12;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        const S = Math.max(4, ((a.sep || params.SPACING_MIN) + (b.sep || params.SPACING_MIN)) * 0.5) * DPR;
        const S2 = S * S;
        if (d2 < S2 && d2 > 1) {
          const d = Math.sqrt(d2);
          const push = (1 - d / S) * (k / d);
          const fx = dx * push;
          const fy = dy * push;
          a.vx += fx * 0.001;
          a.vy += fy * 0.001;
          b.vx -= fx * 0.001;
          b.vy -= fy * 0.001;
        }
      }
    }
  }

  function tick() {
    const now = performance.now();
    const dt = Math.min(0.033, (now - lastT) / 1000);
    lastT = now;

    if (idleOrbVisibility !== idleOrbFadeTo) {
      const duration = Math.max(1, idleOrbFadeDuration);
      const tFade = Math.min(1, (now - idleOrbFadeStart) / duration);
      idleOrbVisibility = idleOrbFadeFrom + (idleOrbFadeTo - idleOrbFadeFrom) * tFade;
      if (tFade >= 1) {
        idleOrbVisibility = idleOrbFadeTo;
        if (idleOrbVisibility === 0) {
          idleOrbPasses = [];
        }
      }
    }

    drawBackground();
    spacingForces();
    nctx.save();
    nctx.globalCompositeOperation = isColorBlackish(params.COLOR) ? 'source-over' : 'lighter';
    nctx.shadowBlur = 0;
    nctx.shadowColor = 'transparent';
    nctx.fillStyle = colorWithAlpha(params.COLOR, 1.0);
    nctx.filter = params.BLUR > 0 ? `blur(${params.BLUR}px)` : 'none';

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      node.step(dt);
      node.draw(nctx);
    }

    const L = params.LINK_DIST * DPR;
    const L2 = L * L;
    nctx.lineWidth = params.THICK_P * DPR * 0.35;
    nctx.strokeStyle = colorWithAlpha(params.COLOR, 1.0);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const ap = a.renderPos();
      const af = a.fadeAlpha();
      if (af <= 0) continue;
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const bp = b.renderPos();
        const bf = b.fadeAlpha();
        if (bf <= 0) continue;
        const dx = ap.x - bp.x;
        const dy = ap.y - bp.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < L2) {
          const d = Math.sqrt(d2);
          const opaqueAt = Math.max(1, L * params.P_LINK_OPQ_FRAC);
          const t = Math.max(0, Math.min(1, 1 - d / opaqueAt));
          const base = t;
          const alpha = Math.max(0, Math.min(1, base * af * bf));
          if (alpha > 0.001) {
            nctx.globalAlpha = alpha;
            nctx.beginPath();
            nctx.moveTo(ap.x, ap.y);
            nctx.lineTo(bp.x, bp.y);
            nctx.stroke();
          }
        }
      }
    }

    nctx.globalAlpha = 0.9;
    const agentMap = currentAgentMap();

    idleOrbPasses = idleOrbPasses.filter((pass) => now - pass.start < pass.duration);
    const isIdleState = !introRunning && !activeEdgeId;
    if (isIdleState && idleOrbVisibility > 0.02) {
      if (idleOrbPasses.length < IDLE_ORB_MAX_CONCURRENT && now >= nextIdleOrbTime) {
        const busy = new Set(idleOrbPasses.map((pass) => pass.edgeId));
        const candidates = runtimeEdges.filter((edge) => {
          if (busy.has(edge.id)) return false;
          const from = agentMap.get(edge.from);
          const to = agentMap.get(edge.to);
          return !!from && !!to;
        });
        if (candidates.length > 0) {
          const pick = candidates[Math.floor(Math.random() * candidates.length)];
          const duration = IDLE_ORB_DURATION_MS * (0.9 + Math.random() * 0.2);
          const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1;
          idleOrbPasses.push({
            edgeId: pick.id,
            start: now,
            duration,
            direction,
          });
          nextIdleOrbTime = now + randRange(IDLE_ORB_INTERVAL_MIN_MS, IDLE_ORB_INTERVAL_MAX_MS);
        } else {
          nextIdleOrbTime = now + 200;
        }
      }
    } else if (!isIdleState) {
      nextIdleOrbTime = now + randRange(IDLE_ORB_INTERVAL_MIN_MS, IDLE_ORB_INTERVAL_MAX_MS);
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const ap = a.renderPos();
      const af = a.fadeAlpha();
      if (af <= 0) continue;
      for (let j = 0; j < agentNodes.length; j++) {
        const b = agentNodes[j];
        const dx = ap.x - b.x;
        const dy = ap.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < L2) {
          const d = Math.sqrt(d2);
          const opaqueAt = Math.max(1, L * params.P_LINK_OPQ_FRAC);
          const t = Math.max(0, Math.min(1, 1 - d / opaqueAt));
          const base = t;
          const alpha = Math.max(0, Math.min(1, base * af));
          if (alpha <= 0.001) continue;
          nctx.globalAlpha = alpha;
          nctx.beginPath();
          nctx.moveTo(ap.x, ap.y);
          nctx.lineTo(b.x, b.y);
          nctx.stroke();
        }
      }
    }
    nctx.globalAlpha = 1;
    nctx.restore();

    updateAgentNodes();
    updateSnapshot();

    ectx.clearRect(0, 0, edgesCanvas.width, edgesCanvas.height);
    ectx.save();
    ectx.globalCompositeOperation = 'source-over';
    ectx.filter = 'none';
    const linkAlpha = Math.max(0, Math.min(1, params.LINK_COLOR_A ?? 1));
    const orbAlpha = Math.max(0, Math.min(1, params.LINK_ORB_COLOR_A ?? params.LINK_COLOR_A ?? 1));
    const baseOrbColor = params.LINK_ORB_COLOR || params.LINK_COLOR;
    const linkStrokeColor = colorWithAlpha(params.LINK_COLOR, linkAlpha);
    const orbFillColorIdle = colorWithAlpha(baseOrbColor, orbAlpha * idleOrbVisibility);
    const activeLinkAlpha = Math.max(0, Math.min(1, params.ACTIVE_LINK_COLOR_A ?? linkAlpha));
    const activeLinkColor = colorWithAlpha(params.ACTIVE_LINK_COLOR || params.LINK_COLOR, activeLinkAlpha);
    const activeOrbAlpha = Math.max(0, Math.min(1, params.ACTIVE_LINK_ORB_COLOR_A ?? params.LINK_ORB_COLOR_A ?? orbAlpha));
    const activeOrbColor = colorWithAlpha(params.ACTIVE_LINK_ORB_COLOR || baseOrbColor, activeOrbAlpha);
    const activeOrbCount = Math.max(1, Math.min(40, Math.round(params.ACTIVE_ORB_COUNT ?? 2)));
    const activeLinkThicknessPx = params.ACTIVE_LINK_THICKNESS ?? params.THICK_A;
    const activeLinkWidth = Math.max(0.5, activeLinkThicknessPx) * DPR;
    const idleOrbRadius = Math.max(2 * DPR, (params.LINK_ORB_SIZE || 3) * DPR);
    const activeOrbSizePx = params.ACTIVE_LINK_ORB_SIZE ?? params.LINK_ORB_SIZE ?? 3;
    const activeOrbRadius = Math.max(2 * DPR, activeOrbSizePx * DPR);
    const baseWidth = params.THICK_A * DPR * 0.7;

    if (introRunning) {
      runtimeEdges.forEach((edge) => {
        const A = agentMap.get(edge.from);
        const B = agentMap.get(edge.to);
        if (!A || !B) return;
        ectx.lineWidth = baseWidth;
        ectx.strokeStyle = linkStrokeColor;
        ectx.shadowBlur = 0;
        ectx.shadowColor = 'transparent';
        ectx.globalAlpha = 1;
        ectx.beginPath();
        ectx.moveTo(A.x, A.y);
        ectx.lineTo(B.x, B.y);
        ectx.stroke();
      });

      if (introEdge) {
        const { edge, start, dur, resolve } = introEdge;
        const A = agentMap.get(edge.from);
        const B = agentMap.get(edge.to);
        if (A && B) {
          const elapsed = now - start;
          const t = Math.max(0, Math.min(1, elapsed / dur));
          const x = A.x + (B.x - A.x) * t;
          const y = A.y + (B.y - A.y) * t;
          callbacks.onIntroEdgeStep?.(t);
          ectx.lineWidth = baseWidth;
          ectx.strokeStyle = linkStrokeColor;
          ectx.shadowBlur = 0;
          ectx.shadowColor = 'transparent';
          ectx.globalAlpha = 1;
          ectx.beginPath();
          ectx.moveTo(A.x, A.y);
          ectx.lineTo(x, y);
          ectx.stroke();

          if (t >= 1) {
            const completedEdge = edge;
            const cb = resolve;
            introEdge = null;
            appendRuntimeEdge(completedEdge);
            callbacks.onIntroEdgeStep?.(1);
            try {
              cb();
            } catch {
              // no-op
            }
          }
        }
      }
      ectx.restore();
      drawVignette();
      rafId = requestAnimationFrame(tick);
      return;
    }

    const pulse = activeEdgeId ? 0.5 + 0.5 * Math.sin((now - activeEdgeSince) / 260) : 0;

    const timeBase = now / IDLE_ORB_DURATION_MS;
    runtimeEdges.forEach((edge) => {
      const A = agentMap.get(edge.from);
      const B = agentMap.get(edge.to);
      if (!A || !B) return;
      const isActive = edge.id === activeEdgeId;
      const pulseFactor = isActive ? 1 + 0.9 * pulse : 1;
      if (isActive) {
        ectx.lineWidth = activeLinkWidth * pulseFactor;
        ectx.strokeStyle = activeLinkColor;
      } else {
        ectx.lineWidth = baseWidth;
        ectx.strokeStyle = linkStrokeColor;
      }
      ectx.shadowBlur = 0;
      ectx.shadowColor = 'transparent';
      ectx.globalAlpha = 1;
      ectx.beginPath();
      ectx.moveTo(A.x, A.y);
      ectx.lineTo(B.x, B.y);
      ectx.stroke();

      if (isActive) {
        const phaseStep = 1 / activeOrbCount;
        for (let k = 0; k < activeOrbCount; k++) {
          ectx.save();
          const offset = ((k + 0.5) * phaseStep) % 1;
          const tt = (timeBase + edge.seed + offset) % 1;
          const x = A.x + (B.x - A.x) * tt;
          const y = A.y + (B.y - A.y) * tt;
          ectx.beginPath();
          ectx.globalAlpha = 1;
          ectx.fillStyle = activeOrbColor;
          ectx.shadowBlur = 0;
          ectx.shadowColor = 'transparent';
          ectx.arc(x, y, activeOrbRadius, 0, Math.PI * 2);
          ectx.fill();
          ectx.restore();
        }
      } else if (idleOrbVisibility > 0.001) {
        const passes = idleOrbPasses.filter((pass) => pass.edgeId === edge.id);
        if (passes.length) {
          passes.forEach((pass) => {
            const elapsed = now - pass.start;
            if (elapsed < 0 || elapsed > pass.duration) return;
            const progress = Math.max(0, Math.min(1, elapsed / pass.duration));
            const tt = pass.direction === 1 ? progress : 1 - progress;
            const x = A.x + (B.x - A.x) * tt;
            const y = A.y + (B.y - A.y) * tt;
            ectx.save();
            ectx.beginPath();
            ectx.globalAlpha = 1;
            ectx.fillStyle = orbFillColorIdle;
            ectx.shadowBlur = 0;
            ectx.shadowColor = 'transparent';
            ectx.arc(x, y, idleOrbRadius, 0, Math.PI * 2);
            ectx.fill();
            ectx.restore();
          });
        }
      }
    });

    ectx.restore();
    drawVignette();
    rafId = requestAnimationFrame(tick);
  }

  function setIdleOrbVisibilityTarget(target: number, duration = IDLE_ORB_FADE_DURATION_MS) {
    const clamped = Math.max(0, Math.min(1, target));
    idleOrbFadeFrom = idleOrbVisibility;
    idleOrbFadeTo = clamped;
    idleOrbFadeStart = performance.now();
    idleOrbFadeDuration = Math.max(1, duration);
    if (clamped === 1 && idleOrbVisibility === 0) {
      idleOrbPasses = [];
    }
  }

  function resize(options: ResizeOptions = {}) {
    const keepSeed = !!options.keepSeed && seededOnce;
    DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const vpWidth = options.width ?? viewportEl?.clientWidth ?? viewportEl?.getBoundingClientRect().width ?? width;
    const vpHeight = options.height ?? viewportEl?.clientHeight ?? viewportEl?.getBoundingClientRect().height ?? height;
    width = Math.max(1, vpWidth);
    height = Math.max(1, vpHeight);

    const deviceW = Math.floor(width * DPR);
    const deviceH = Math.floor(height * DPR);

    [neon, edgesCanvas, vignetteCanvas].forEach((canvas) => {
      canvas.width = deviceW;
      canvas.height = deviceH;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    });

    buildAnchors();
    buildAgentNodes();
    if (!keepSeed) {
      reseedParticles(params.MAX);
    } else {
      randomizeNodeSpacings();
    }
    updateAgentNodes();
    updateSnapshot();
  }

  function stop() {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    viewportEl?.removeEventListener('mousemove', handleMouseMove);
    viewportEl?.removeEventListener('mouseleave', handleMouseLeave);
  }

  function start() {
    if (rafId != null) return;
    lastT = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function setParams(next: Partial<Screen3Params>) {
    Object.assign(params, next);
    if (next.MAX && next.MAX !== nodes.length) {
      reseedParticles(next.MAX);
    }
  }

  function setActiveEdge(id: string | null) {
    if (id && !runtimeEdges.some((edge) => edge.id === id)) {
      return;
    }
    activeEdgeId = id;
    activeEdgeSince = performance.now();
    if (id) {
      setIdleOrbVisibilityTarget(0);
    } else {
      setIdleOrbVisibilityTarget(1);
      idleOrbPasses = [];
    }
    nextIdleOrbTime = activeEdgeSince + randRange(IDLE_ORB_INTERVAL_MIN_MS, IDLE_ORB_INTERVAL_MAX_MS);
  }

  function animateIntroEdge(edge: Edge, dur: number) {
    return new Promise<void>((resolve) => {
      introEdge = { edge, start: performance.now(), dur, resolve };
    });
  }

  async function runIntroEdges() {
    introRunning = true;
    introEdge = null;
    idleOrbPasses = [];
    setActiveEdge(null);
    if (INTRO_OVERRIDES_GRAPH) {
      setRuntimeEdges([]);
    }
    setIdleOrbVisibilityTarget(0);
    callbacks.onIntroEdgeStep?.(0);
    const script = INTRO_OVERRIDES_GRAPH ? S3_INTRO_EDGES : S3_EDGES;
    for (const agentEdge of script) {
      const edge = toRuntimeEdge(agentEdge);
      await animateIntroEdge(edge, INTRO_EDGE_DURATION_MS);
    }
    introRunning = false;
    setIdleOrbVisibilityTarget(1);
    nextIdleOrbTime = performance.now() + randRange(IDLE_ORB_INTERVAL_MIN_MS, IDLE_ORB_INTERVAL_MAX_MS);
    callbacks.onIntroEdgeStep?.(1);
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    listener(snapshot);
    return () => listeners.delete(listener);
  }

  resize();
  reseedParticles(params.MAX);

  return {
    start,
    stop,
    resize,
    reseed: (count?: number) => reseedParticles(count ?? params.MAX),
    setParams,
    setActiveEdge,
    runIntroEdges,
    randomizeNodeSpacings,
    subscribe,
    getSnapshot: () => snapshot,
    getEdges: () => getRuntimeEdges().map(toAgentEdge),
    getParams: () => params,
  };
}

function colorWithAlpha(c: string, a: number) {
  const alpha = Math.max(0, Math.min(1, a));
  if (c.startsWith('#')) {
    const { r, g, b } = hexToRgb(c);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (c.startsWith('hsl')) {
    return c.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
  }
  return c;
}

function isColorBlackish(c: string) {
  if (c.startsWith('#')) {
    const { r, g, b } = hexToRgb(c);
    const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return L < 0.05;
  }
  if (c.startsWith('hsl')) {
    try {
      const match = c.match(/hsl[a]?\(([^)]+)\)/i);
      if (!match) return false;
      const parts = match[1].split(/[,\s]+/).filter(Boolean);
      const l = parts[2] || '0%';
      const lv = parseFloat(l) / 100;
      return lv < 0.08;
    } catch {
      return false;
    }
  }
  return false;
}

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

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}
