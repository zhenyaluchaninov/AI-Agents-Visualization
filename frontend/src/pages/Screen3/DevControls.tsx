// no styles imported here

export interface Screen3Params {
  MAX: number;
  HOLE_R: number;
  SPACING_MIN: number;
  SPACING_MAX: number;
  P_SPEED: number;
  P_SIZE: number;
  MEAN_LIFE: number;
  ATTR: number;
  ATTR_R: number;
  LINK_DIST: number;
  THICK_P: number;
  THICK_A: number;
  P_LINK_OPQ_FRAC: number;
  BLUR: number;
  GLOW_LINKS: number;
  LINK_ORB_SIZE: number;
  COLOR: string;
  LINK_COLOR: string;
  LINK_ORB_COLOR: string;
  BG1: string;
  BG2: string;
  VIG_COLOR: string;
  VIG_STRENGTH: number;
  LIFELESS: boolean;
}

export const DEFAULT_PARAMS: Screen3Params = {
  MAX: 160,
  HOLE_R: 184,
  SPACING_MIN: 9,
  SPACING_MAX: 116,
  P_SPEED: 0.2,
  P_SIZE: 1.7,
  MEAN_LIFE: 7,
  ATTR: 0.12,
  ATTR_R: 234,
  LINK_DIST: 96,
  THICK_P: 1,
  THICK_A: 2,
  P_LINK_OPQ_FRAC: 0.93,
  BLUR: 0,
  GLOW_LINKS: 20,
  LINK_ORB_SIZE: 3,
  COLOR: '#a298f2',
  LINK_COLOR: '#8b7df0',
  LINK_ORB_COLOR: '#8280ff',
  BG1: '#ffffff',
  BG2: '#d3d0f0',
  VIG_COLOR: '#a0beda',
  VIG_STRENGTH: 0.1,
  LIFELESS: false,
};

// (randomize color utilities were removed)

type InitOptions = {
  reseedParticles: (n: number) => void;
  randomizeNodeSpacings: () => void;
};

// Reads UI values if #controls exists, syncs spans, and wires listeners to mutate params.
// Returns true if controls were found and wired.
export function initDevControls(root: HTMLElement, params: Screen3Params, opts: InitOptions): boolean {
  const qs = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>(`#${id}`);
  const hasControls = !!root.querySelector('#controls');
  if (!hasControls) return false;
  const ctrl = qs<HTMLDivElement>('controls');
  const vp = qs<HTMLDivElement>('vp');
  if (!ctrl || !vp) return false;

  const LS_KEY = 'screen3.defaults.v1';

  function positionPanel() {
    try {
      const vpEl = vp; const ctrlEl = ctrl;
      if (!vpEl || !ctrlEl) return;
      const rootRect = root.getBoundingClientRect();
      const vpRect = vpEl.getBoundingClientRect();
      const width = 320; // fixed width for stability
      const gap = 12;
      const left = Math.max(12, Math.round((vpRect.left - rootRect.left) - width - gap));
      const top = Math.round(vpRect.top - rootRect.top);
      const height = Math.round(vpRect.height);
      Object.assign(ctrlEl.style, {
        position: 'absolute',
        left: left + 'px',
        top: top + 'px',
        width: width + 'px',
        height: height + 'px',
        maxHeight: height + 'px',
        overflowY: 'auto',
        zIndex: '20',
      } as Partial<CSSStyleDeclaration>);
    } catch { /* noop */ }
  }

  const ui = {
    nodes: qs<HTMLInputElement>('nodes')!,
    link: qs<HTMLInputElement>('link')!,
    pspeed: qs<HTMLInputElement>('pspeed')!,
    psize: qs<HTMLInputElement>('psize')!,
    lifeless: qs<HTMLInputElement>('lifeless')!,
    thickP: qs<HTMLInputElement>('thickP')!,
    thickA: qs<HTMLInputElement>('thickA')!,
    plinkOpaqueAt: qs<HTMLInputElement>('plinkOpaqueAt')!,
    glowLinks: qs<HTMLInputElement>('glowLinks')!,
    color: qs<HTMLInputElement>('color')!,
    colorVal: qs<HTMLSpanElement>('colorVal')!,
    linkColor: qs<HTMLInputElement>('linkColor')!,
    trailSize: qs<HTMLInputElement>('trailSize')!,
    trailColor: qs<HTMLInputElement>('trailColor')!,
    life: qs<HTMLInputElement>('life')!,
    spacingMin: qs<HTMLInputElement>('spacingMin')!,
    spacingMax: qs<HTMLInputElement>('spacingMax')!,
    blur: qs<HTMLInputElement>('blur')!,
    holeR: qs<HTMLInputElement>('holeR')!,
    nodesVal: qs<HTMLSpanElement>('nodesVal')!,
    linkVal: qs<HTMLSpanElement>('linkVal')!,
    pspeedVal: qs<HTMLSpanElement>('pspeedVal')!,
    psizeVal: qs<HTMLSpanElement>('psizeVal')!,
    thickPVal: qs<HTMLSpanElement>('thickPVal')!,
    thickAVal: qs<HTMLSpanElement>('thickAVal')!,
    plinkOpaqueAtVal: qs<HTMLSpanElement>('plinkOpaqueAtVal')!,
    glowLinksVal: qs<HTMLSpanElement>('glowLinksVal')!,
    lifeVal: qs<HTMLSpanElement>('lifeVal')!,
    spacingMinVal: qs<HTMLSpanElement>('spacingMinVal')!,
    spacingMaxVal: qs<HTMLSpanElement>('spacingMaxVal')!,
    blurVal: qs<HTMLSpanElement>('blurVal')!,
    holeRVal: qs<HTMLSpanElement>('holeRVal')!,
    trailSizeVal: qs<HTMLSpanElement>('trailSizeVal')!,
    trailColorVal: qs<HTMLSpanElement>('trailColorVal')!,
    bg1: qs<HTMLInputElement>('bg1')!,
    bg2: qs<HTMLInputElement>('bg2')!,
    bg1Val: qs<HTMLSpanElement>('bg1Val')!,
    bg2Val: qs<HTMLSpanElement>('bg2Val')!,
    vigColor: qs<HTMLInputElement>('vigColor')!,
    vigStrength: qs<HTMLInputElement>('vigStrength')!,
    vigColorVal: qs<HTMLSpanElement>('vigColorVal')!,
    vigStrengthVal: qs<HTMLSpanElement>('vigStrengthVal')!,
    attr: qs<HTMLInputElement>('attr')!,
    attrVal: qs<HTMLSpanElement>('attrVal')!,
    attrR: qs<HTMLInputElement>('attrR')!,
    attrRVal: qs<HTMLSpanElement>('attrRVal')!,
    linkColorVal: qs<HTMLSpanElement>('linkColorVal')!,
  } as const;
  // Guard against unexpected DOM mismatches
  for (const k of Object.keys(ui) as (keyof typeof ui)[]) {
    if (!ui[k]) return false;
  }

  // Load saved defaults from localStorage and apply to UI before reading values
  function loadSavedDefaults(): Partial<Screen3Params> | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }
  function applyDefaultsToUI(d: Partial<Screen3Params>) {
    if (d.MAX != null) ui.nodes.value = String(d.MAX);
    if (d.HOLE_R != null) ui.holeR.value = String(d.HOLE_R);
    if (d.SPACING_MIN != null) ui.spacingMin.value = String(d.SPACING_MIN);
    if (d.SPACING_MAX != null) ui.spacingMax.value = String(d.SPACING_MAX);
    if (d.P_SPEED != null) ui.pspeed.value = String(Math.round(d.P_SPEED * 100));
    if (d.P_SIZE != null) ui.psize.value = String(d.P_SIZE);
    if (d.MEAN_LIFE != null) ui.life.value = String(d.MEAN_LIFE);
    if (d.ATTR != null) ui.attr.value = String(Math.round(d.ATTR * 100));
    if (d.ATTR_R != null) ui.attrR.value = String(d.ATTR_R);
    if (d.LINK_DIST != null) ui.link.value = String(d.LINK_DIST);
    if (d.THICK_P != null) ui.thickP.value = String(d.THICK_P);
    if (d.THICK_A != null) ui.thickA.value = String(d.THICK_A);
    if (d.P_LINK_OPQ_FRAC != null) ui.plinkOpaqueAt.value = String(Math.round(d.P_LINK_OPQ_FRAC * 100));
    if (d.BLUR != null) ui.blur.value = String(d.BLUR);
    if (d.GLOW_LINKS != null) ui.glowLinks.value = String(d.GLOW_LINKS);
    if (d.LINK_ORB_SIZE != null) ui.trailSize.value = String(d.LINK_ORB_SIZE);
    if (d.COLOR != null) ui.color.value = d.COLOR;
    if (d.LINK_COLOR != null) ui.linkColor.value = d.LINK_COLOR;
    if (d.LINK_ORB_COLOR != null) ui.trailColor.value = d.LINK_ORB_COLOR;
    if (d.BG1 != null) ui.bg1.value = d.BG1;
    if (d.BG2 != null) ui.bg2.value = d.BG2;
    if (d.VIG_COLOR != null) ui.vigColor.value = d.VIG_COLOR;
    if (d.VIG_STRENGTH != null) ui.vigStrength.value = String(Math.round(d.VIG_STRENGTH * 100));
    if (d.LIFELESS != null) ui.lifeless.checked = !!d.LIFELESS;
  }
  const savedDefaults = loadSavedDefaults();
  if (savedDefaults) applyDefaultsToUI(savedDefaults);

  // Apply initial values from UI
  params.MAX = parseInt(ui.nodes.value, 10);
  params.LINK_DIST = parseInt(ui.link.value, 10);
  params.P_SPEED = parseInt(ui.pspeed.value, 10) / 100;
  params.P_SIZE = parseFloat(ui.psize.value);
  params.THICK_P = parseInt(ui.thickP.value, 10);
  params.THICK_A = parseInt(ui.thickA.value, 10);
  params.P_LINK_OPQ_FRAC = parseInt(ui.plinkOpaqueAt.value, 10) / 100;
  params.GLOW_LINKS = parseInt(ui.glowLinks.value, 10);
  params.COLOR = ui.color.value;
  params.LINK_COLOR = ui.linkColor.value;
  params.LINK_ORB_SIZE = parseInt(ui.trailSize.value, 10);
  params.LINK_ORB_COLOR = ui.trailColor.value;
  params.BG1 = ui.bg1.value;
  params.BG2 = ui.bg2.value;
  params.VIG_COLOR = ui.vigColor.value;
  params.VIG_STRENGTH = parseInt(ui.vigStrength.value, 10) / 100;
  params.ATTR = parseInt(ui.attr.value, 10) / 100;
  params.ATTR_R = parseInt(ui.attrR.value, 10);
  params.MEAN_LIFE = parseInt(ui.life.value, 10);
  params.SPACING_MIN = parseInt(ui.spacingMin.value, 10);
  params.SPACING_MAX = parseInt(ui.spacingMax.value, 10);
  params.BLUR = parseInt(ui.blur.value, 10);
  params.LIFELESS = !!ui.lifeless.checked;
  params.HOLE_R = parseInt(ui.holeR.value, 10);

  const sync = () => {
    ui.nodesVal.textContent = String(params.MAX);
    ui.linkVal.textContent = String(params.LINK_DIST);
    ui.pspeedVal.textContent = params.P_SPEED.toFixed(2);
    ui.psizeVal.textContent = params.P_SIZE.toFixed(1);
    ui.thickPVal.textContent = String(params.THICK_P);
    ui.thickAVal.textContent = String(params.THICK_A);
    ui.glowLinksVal.textContent = String(params.GLOW_LINKS);
    ui.plinkOpaqueAtVal.textContent = Math.round(params.P_LINK_OPQ_FRAC * 100) + '%';
    ui.bg1Val.textContent = params.BG1; ui.bg2Val.textContent = params.BG2; ui.linkColorVal.textContent = params.LINK_COLOR; ui.colorVal.textContent = params.COLOR;
    ui.vigColorVal.textContent = params.VIG_COLOR; ui.vigStrengthVal.textContent = params.VIG_STRENGTH.toFixed(2);
    ui.attrVal.textContent = params.ATTR.toFixed(3); ui.attrRVal.textContent = String(params.ATTR_R);
    ui.lifeVal.textContent = String(params.MEAN_LIFE);
    ui.spacingMinVal.textContent = String(params.SPACING_MIN);
    ui.spacingMaxVal.textContent = String(params.SPACING_MAX);
    ui.blurVal.textContent = String(params.BLUR);
    ui.trailSizeVal.textContent = String(params.LINK_ORB_SIZE);
    ui.trailColorVal.textContent = params.LINK_ORB_COLOR;
    ui.holeRVal.textContent = String(params.HOLE_R);
  };

  [ui.link, ui.pspeed, ui.psize, ui.thickP, ui.thickA, ui.plinkOpaqueAt, ui.glowLinks, ui.attr, ui.attrR, ui.life, ui.blur, ui.trailSize, ui.holeR]
    .forEach((inp: HTMLInputElement) => inp.addEventListener('input', () => {
      params.LINK_DIST = parseInt(ui.link.value, 10);
      params.P_SPEED = parseInt(ui.pspeed.value, 10) / 100;
      params.P_SIZE = parseFloat(ui.psize.value);
      params.THICK_P = parseInt(ui.thickP.value, 10);
      params.THICK_A = parseInt(ui.thickA.value, 10);
      params.P_LINK_OPQ_FRAC = parseInt(ui.plinkOpaqueAt.value, 10) / 100;
      params.GLOW_LINKS = parseInt(ui.glowLinks.value, 10);
      params.ATTR = parseInt(ui.attr.value, 10) / 100;
      params.ATTR_R = parseInt(ui.attrR.value, 10);
      params.MEAN_LIFE = parseInt(ui.life.value, 10);
      params.BLUR = parseInt(ui.blur.value, 10);
      params.LINK_ORB_SIZE = parseInt(ui.trailSize.value, 10);
      params.HOLE_R = parseInt(ui.holeR.value, 10);
      sync();
    }));
  ui.spacingMin.addEventListener('input', () => { params.SPACING_MIN = parseInt(ui.spacingMin.value, 10); opts.randomizeNodeSpacings(); sync(); });
  ui.spacingMax.addEventListener('input', () => { params.SPACING_MAX = parseInt(ui.spacingMax.value, 10); opts.randomizeNodeSpacings(); sync(); });
  ui.holeR.addEventListener('change', () => { opts.reseedParticles(params.MAX); });
  ui.lifeless.addEventListener('change', () => { params.LIFELESS = !!ui.lifeless.checked; });
  ui.nodes.addEventListener('input', () => { params.MAX = parseInt(ui.nodes.value, 10); sync(); opts.reseedParticles(params.MAX); });
  ui.color.addEventListener('input', () => { params.COLOR = ui.color.value; ui.colorVal.textContent = params.COLOR; });
  ui.linkColor.addEventListener('input', () => { params.LINK_COLOR = ui.linkColor.value; ui.linkColorVal.textContent = params.LINK_COLOR; });
  ui.trailColor.addEventListener('input', () => { params.LINK_ORB_COLOR = ui.trailColor.value; ui.trailColorVal.textContent = params.LINK_ORB_COLOR; });
  ui.bg1.addEventListener('input', () => { params.BG1 = ui.bg1.value; ui.bg1Val.textContent = params.BG1; });
  ui.bg2.addEventListener('input', () => { params.BG2 = ui.bg2.value; ui.bg2Val.textContent = params.BG2; });
  ui.vigColor.addEventListener('input', () => { params.VIG_COLOR = ui.vigColor.value; ui.vigColorVal.textContent = params.VIG_COLOR; });
  ui.vigStrength.addEventListener('input', () => { params.VIG_STRENGTH = parseInt(ui.vigStrength.value, 10) / 100; ui.vigStrengthVal.textContent = params.VIG_STRENGTH.toFixed(2); });

  sync();
  // Position panel to the left of the viewport and keep it aligned on resize
  positionPanel();
  requestAnimationFrame(positionPanel);
  window.addEventListener('resize', positionPanel);

  // Defaults utilities: save/clear/copy current params
  function currentParamsToCode(p: Screen3Params) {
    const esc = (s: string) => s;
    const lines = [
      'export const DEFAULT_PARAMS: Screen3Params = {',
      `  MAX: ${p.MAX},`,
      `  HOLE_R: ${p.HOLE_R},`,
      `  SPACING_MIN: ${p.SPACING_MIN},`,
      `  SPACING_MAX: ${p.SPACING_MAX},`,
      `  P_SPEED: ${p.P_SPEED},`,
      `  P_SIZE: ${p.P_SIZE},`,
      `  MEAN_LIFE: ${p.MEAN_LIFE},`,
      `  ATTR: ${p.ATTR},`,
      `  ATTR_R: ${p.ATTR_R},`,
      `  LINK_DIST: ${p.LINK_DIST},`,
      `  THICK_P: ${p.THICK_P},`,
      `  THICK_A: ${p.THICK_A},`,
      `  P_LINK_OPQ_FRAC: ${p.P_LINK_OPQ_FRAC},`,
      `  BLUR: ${p.BLUR},`,
      `  GLOW_LINKS: ${p.GLOW_LINKS},`,
      `  LINK_ORB_SIZE: ${p.LINK_ORB_SIZE},`,
      `  COLOR: '${esc(p.COLOR)}',`,
      `  LINK_COLOR: '${esc(p.LINK_COLOR)}',`,
      `  LINK_ORB_COLOR: '${esc(p.LINK_ORB_COLOR)}',`,
      `  BG1: '${esc(p.BG1)}',`,
      `  BG2: '${esc(p.BG2)}',`,
      `  VIG_COLOR: '${esc(p.VIG_COLOR)}',`,
      `  VIG_STRENGTH: ${p.VIG_STRENGTH},`,
      `  LIFELESS: ${p.LIFELESS},`,
      '};'
    ];
    return lines.join('\n');
  }

  const saveBtn = document.getElementById('saveDefaults') as HTMLButtonElement | null;
  const clearBtn = document.getElementById('clearDefaults') as HTMLButtonElement | null;
  const copyBtn = document.getElementById('copyDefaults') as HTMLButtonElement | null;
  if (saveBtn) saveBtn.addEventListener('click', () => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(params)); alert('Saved current UI values as defaults for this browser.'); } catch {}
  });
  if (clearBtn) clearBtn.addEventListener('click', () => {
    try { localStorage.removeItem(LS_KEY); alert('Cleared saved defaults.'); } catch {}
  });
  if (copyBtn) copyBtn.addEventListener('click', async () => {
    const code = currentParamsToCode(params);
    try { await navigator.clipboard.writeText(code); alert('Copied DEFAULT_PARAMS code to clipboard. Paste into DevControls.tsx'); } catch { alert('Copy failed. Here is the code in console.'); console.log(code); }
  });

  return true;
}

export function DevControls({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;
  return (
    <div className="ui" id="controls" aria-hidden={false}>
      <h2>Neon Web</h2>
      <details className="group" open>
        <summary>Particles & Links</summary>
        <div className="row"><label>Nodes</label><input id="nodes" type="range" min="1" max="170" defaultValue="160" /><span id="nodesVal">160</span></div>
        <div className="row"><label>Inner Hole Radius (px)</label><input id="holeR" type="range" min="0" max="400" defaultValue="184" /><span id="holeRVal">184</span></div>
        <div className="row"><label>Spacing Min (px)</label><input id="spacingMin" type="range" min="4" max="200" defaultValue="9" /><span id="spacingMinVal">32</span></div>
        <div className="row"><label>Spacing Max (px)</label><input id="spacingMax" type="range" min="8" max="260" defaultValue="116" /><span id="spacingMaxVal">116</span></div>
        <div className="row"><label>Particle Speed</label><input id="pspeed" type="range" min="0" max="100" defaultValue="20" /><span id="pspeedVal">0.20</span></div>
        <div className="row"><label>Particle Size</label><input id="psize" type="range" min="0" max="3" step="0.1" defaultValue="1.7" /><span id="psizeVal">1.7</span></div>
        <div className="row"><label>Mean Lifespan (s)</label><input id="life" type="range" min="1" max="12" defaultValue="7" /><span id="lifeVal">7</span></div>
        <div className="row"><label>Static Particles</label><input id="lifeless" type="checkbox" /><span></span></div>
        <div className="row"><label>Strength</label><input id="attr" type="range" min="0" max="30" step="1" defaultValue="12" /><span id="attrVal">0.120</span></div>
        <div className="row"><label>Radius (px)</label><input id="attrR" type="range" min="40" max="400" defaultValue="234" /><span id="attrRVal">234</span></div>
        <div className="row"><label>Link Distance</label><input id="link" type="range" min="40" max="300" defaultValue="96" /><span id="linkVal">96</span></div>
        <div className="row"><label>Particle Link Thickness</label><input id="thickP" type="range" min="1" max="6" defaultValue="1" /><span id="thickPVal">1</span></div>
        <div className="row"><label>Particle Links Opaque At (%)</label><input id="plinkOpaqueAt" type="range" min="20" max="100" defaultValue="93" /><span id="plinkOpaqueAtVal">93%</span></div>
        <div className="row"><label>Accent (particles)</label><input id="color" type="color" defaultValue="#a298f2" /><span id="colorVal">#a298f2</span></div>
        <div className="row"><label>Blur (px)</label><input id="blur" type="range" min="0" max="8" defaultValue="0" /><span id="blurVal">0</span></div>
      </details>
      <details className="group" open>
        <summary>Agents</summary>
        <div className="row"><label>Link Color</label><input id="linkColor" type="color" defaultValue="#8b7df0" /><span id="linkColorVal">#8b7df0</span></div>
        <div className="row"><label>Agent Link Thickness</label><input id="thickA" type="range" min="1" max="8" defaultValue="2" /><span id="thickAVal">2</span></div>
        <div className="row"><label>Agent Links Glow</label><input id="glowLinks" type="range" min="0" max="40" defaultValue="20" /><span id="glowLinksVal">20</span></div>
        <div className="row"><label>Trail Size (px)</label><input id="trailSize" type="range" min="1" max="10" defaultValue="3" /><span id="trailSizeVal">3</span></div>
        <div className="row"><label>Trail Color</label><input id="trailColor" type="color" defaultValue="#8280ff" /><span id="trailColorVal">#8280ff</span></div>
      </details>
      <details className="group" open>
        <summary>Background</summary>
        <div className="row"><label>Inner</label><input id="bg1" type="color" defaultValue="#ffffff" /><span id="bg1Val">#ffffff</span></div>
        <div className="row"><label>Outer</label><input id="bg2" type="color" defaultValue="#d3d0f0" /><span id="bg2Val">#d3d0f0</span></div>
        <div className="row"><label>Vignette Color</label><input id="vigColor" type="color" defaultValue="#a0beda" /><span id="vigColorVal">#a0beda</span></div>
        <div className="row"><label>Vignette Strength</label><input id="vigStrength" type="range" min="0" max="100" defaultValue="10" /><span id="vigStrengthVal">0.10</span></div>
        <div className="row"><small>Particles are jittered-grid seeded, locally orbit, fade in/out and respawn for even coverage.</small></div>
      </details>
      <details className="group" open>
        <summary>Defaults</summary>
        <div className="row" style={{ gap: 6 }}>
          <button id="saveDefaults" type="button">Save As Defaults</button>
          <button id="copyDefaults" type="button">Copy Code</button>
          <button id="clearDefaults" type="button">Clear Saved</button>
        </div>
        <div className="row"><small>Saved defaults persist in this browser (localStorage). "Copy Code" lets you paste values into DEFAULT_PARAMS in DevControls.tsx.</small></div>
      </details>
    </div>
  );
}
