import { useEffect, useRef, useState } from 'react';
import styles from './Screen2.module.css';


type Agent = { role: string; personality: string; color: 'visionary' | 'pragmatist' | 'cautious' | 'critic' | 'innovator' | 'mediator' };

const TEAM_DATA: Agent[] = [
  { role: 'Policy',     personality: 'Visionary',  color: 'visionary' },
  { role: 'Operations', personality: 'Pragmatist', color: 'pragmatist' },
  { role: 'Risk',       personality: 'Cautious',   color: 'cautious' },
  { role: 'Finance',    personality: 'Critic',     color: 'critic' },
  { role: 'Data',       personality: 'Innovator',  color: 'innovator' },
  { role: 'Community',  personality: 'Mediator',   color: 'mediator' },
];

export default function Screen2() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Phase containers
  const phaseCreationRef = useRef<HTMLDivElement>(null);
  const phaseTeamRef = useRef<HTMLDivElement>(null);

  // Creation phase refs
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  const roleWrapRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLSpanElement>(null);
  const pinRoleRef = useRef<HTMLSpanElement>(null);

  const personalityWrapRef = useRef<HTMLDivElement>(null);
  const personalityRef = useRef<HTMLSpanElement>(null);
  const pinCriticRef = useRef<HTMLSpanElement>(null);

  const callout1Ref = useRef<HTMLDivElement>(null);
  const callout1BoxRef = useRef<HTMLDivElement>(null);
  const callout1TextRef = useRef<HTMLSpanElement>(null);
  const callout2Ref = useRef<HTMLDivElement>(null);
  const callout2BoxRef = useRef<HTMLDivElement>(null);
  const callout2TextRef = useRef<HTMLSpanElement>(null);

  const nextBtnRef = useRef<HTMLButtonElement>(null);

  // Overlay + connectors
  const overlayRef = useRef<SVGSVGElement>(null);
  const leftPathRef = useRef<SVGPathElement>(null);
  const rightPathRef = useRef<SVGPathElement>(null);
  const dotLFromRef = useRef<HTMLDivElement>(null);
  const dotLToRef = useRef<HTMLDivElement>(null);
  const dotRFromRef = useRef<HTMLDivElement>(null);
  const dotRToRef = useRef<HTMLDivElement>(null);

  // Team phase refs
  const teamTitleRef = useRef<HTMLHeadingElement>(null);
  const startDiscussionBtnRef = useRef<HTMLButtonElement>(null);

  // Local state for team UI
  const [teamCardsShown, setTeamCardsShown] = useState(false);
  const abortRef = useRef(false);
  const runIdRef = useRef(0);
  const nextRunId = () => (++runIdRef.current);

  // Helpers to read CSS variables
  const css = () => getComputedStyle(rootRef.current || document.documentElement);
  const toMs = (v?: string) => {
    const s = (v ?? '').toString().trim();
    if (s.endsWith('ms')) return parseFloat(s);
    if (s.endsWith('s')) return parseFloat(s) * 1000;
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };
  const TYPE_SPEED = () => toMs(css().getPropertyValue('--type-speed')) || 50;

  const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

  async function typeText(el: HTMLElement | null, text: string, spd?: number, runId?: number) {
    if (!el) return;
    const v = spd ?? TYPE_SPEED();
    el.textContent = '';
    for (let i = 0; i < text.length; i++) {
      if (abortRef.current) return;
      if (runId !== undefined && runId !== runIdRef.current) return;
      el.textContent += text[i];
      // eslint-disable-next-line no-await-in-loop
      await wait(v);
    }
  }

  // Smooth height utilities
  type SmoothInfo = { h: number; k: number; min: number };
  const smoothItemsRef = useRef<HTMLElement[]>([]);
  function setupSmoothResize(target: HTMLElement | null, k = 0.18, overflowHidden = true, allowShrink = true) {
    if (!target) return;
    const measured = target.scrollHeight || target.getBoundingClientRect().height;
    target.style.height = `${Math.max(0, measured)}px`;
    if (overflowHidden) target.style.overflow = 'hidden';
    (target as any).__smooth = { h: measured, k, min: allowShrink ? 0 : measured } as SmoothInfo;
    smoothItemsRef.current.push(target);
  }
  function updateSmoothSizes() {
    for (const el of smoothItemsRef.current) {
      const s: SmoothInfo | undefined = (el as any).__smooth;
      if (!s) continue;
      const target = Math.max(el.scrollHeight, s.min || 0);
      s.h += (target - s.h) * s.k;
      if (Math.abs(target - s.h) < 0.5) s.h = target;
      el.style.height = `${s.h}px`;
    }
  }
  function releaseSmoothResize(keepMatch?: (el: HTMLElement) => boolean) {
    const kept: HTMLElement[] = [];
    for (const el of smoothItemsRef.current) {
      if (keepMatch && keepMatch(el)) { kept.push(el); continue; }
      el.style.height = '';
      el.style.overflow = '';
      delete (el as any).__smooth;
    }
    smoothItemsRef.current = kept;
  }

  // Geometry + overlay
  function sizeOverlay() {
    const svg = overlayRef.current;
    if (!svg) return;
    svg.setAttribute('width', String(window.innerWidth));
    svg.setAttribute('height', String(window.innerHeight));
    svg.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  }
  function rectCenter(r: DOMRect) {
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function sPath(p0: { x: number; y: number }, p1: { x: number; y: number }) {
    const dx = p1.x - p0.x, dy = p1.y - p0.y;
    const c1 = { x: p0.x + dx * 0.35, y: p0.y + dy * 0.10 };
    const c2 = { x: p1.x - dx * 0.35, y: p1.y - dy * 0.10 };
    return `M ${p0.x},${p0.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${p1.x},${p1.y}`;
  }
  function placeDot(dot: HTMLDivElement | null, p: { x: number; y: number }) {
    if (!dot) return;
    dot.style.left = `${p.x}px`;
    dot.style.top = `${p.y}px`;
  }
  function pathLength(el: SVGPathElement) {
    try { return el.getTotalLength(); } catch { return 400; }
  }

  const rafRef = useRef<number | null>(null);
  function updateGeometryFrame() {
    sizeOverlay();
    updateSmoothSizes();

    const co1 = callout1BoxRef.current?.getBoundingClientRect();
    const co2 = callout2BoxRef.current?.getBoundingClientRect();
    const pr = pinRoleRef.current?.getBoundingClientRect();
    const pc = pinCriticRef.current?.getBoundingClientRect();
    if (!co1 || !co2 || !pr || !pc) {
      rafRef.current = window.requestAnimationFrame(updateGeometryFrame);
      return;
    }

    const pL_from = { x: co1.right, y: co1.top + co1.height / 2 };
    const pR_from = { x: co2.left,  y: co2.top + co2.height / 2 };
    const pRole    = rectCenter(pr);
    const pCritic  = rectCenter(pc);

    placeDot(dotLToRef.current, pRole);
    placeDot(dotRToRef.current, pCritic);
    placeDot(dotLFromRef.current, pL_from);
    placeDot(dotRFromRef.current, pR_from);

    if (leftPathRef.current)  leftPathRef.current.setAttribute('d',  sPath(pRole,  pL_from));
    if (rightPathRef.current) rightPathRef.current.setAttribute('d', sPath(pCritic, pR_from));

    rafRef.current = window.requestAnimationFrame(updateGeometryFrame);
  }
  function startTicker() {
    if (rafRef.current == null) rafRef.current = window.requestAnimationFrame(updateGeometryFrame);
  }
  function stopTicker() {
    if (rafRef.current != null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  async function drawPathAnimated(pathEl: SVGPathElement | null, fromPoint: { x: number; y: number }, toPoint: { x: number; y: number }) {
    if (!pathEl) return;
    pathEl.setAttribute('d', sPath(fromPoint, toPoint));
    const L = pathLength(pathEl);
    // reset
    pathEl.style.transition = 'none';
    pathEl.style.strokeDasharray = `${L}`;
    pathEl.style.strokeDashoffset = `${L}`;
    void pathEl.getBoundingClientRect();
    // animate
    pathEl.style.opacity = '1';
    pathEl.style.transition = `opacity var(--fade) var(--ease), stroke-dashoffset var(--line) var(--ease)`;
    pathEl.style.strokeDashoffset = '0';
    await new Promise<void>((res) => {
      const h = () => { pathEl.removeEventListener('transitionend', h); res(); };
      pathEl.addEventListener('transitionend', h, { once: true });
    });
  }

  // Switch phases (A -> B)
  const switchToTeamPhase = async () => {
    // Fade connectors along with Phase A fade out
    if (leftPathRef.current) leftPathRef.current.style.opacity = '0';
    if (rightPathRef.current) rightPathRef.current.style.opacity = '0';
    [dotLFromRef.current, dotLToRef.current, dotRFromRef.current, dotRToRef.current].forEach((d) => {
      if (d) d.classList.remove(styles.show);
    });
    if (phaseCreationRef.current) phaseCreationRef.current.classList.remove(styles.active);
    await wait(600);
    stopTicker();
    if (overlayRef.current) overlayRef.current.style.display = 'none';

    // Team phase in
    if (phaseTeamRef.current) phaseTeamRef.current.classList.add(styles.active);
    if (teamTitleRef.current) teamTitleRef.current.classList.add(styles.show);
    await wait(200);

    setTeamCardsShown(true); // reveal with stagger via inline delays
    await wait(1500);
    if (startDiscussionBtnRef.current) startDiscussionBtnRef.current.classList.add(styles.show);
  };

  // Init sequence mirrors the prototype timings and steps
  useEffect(() => {
    let resizeTimer: number | undefined;
    let scrollTimer: number | undefined;
    let ro: ResizeObserver | null = null;

    const onResize = () => {
      startTicker();
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => stopTicker(), 500);
    };
    const onScroll = () => {
      startTicker();
      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => stopTicker(), 400);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true } as any);

    const run = async () => {
      const RUN = nextRunId();
      abortRef.current = false;
      await wait(50);
      if (abortRef.current || RUN !== runIdRef.current) return;
      if (cardRef.current) cardRef.current.classList.add(styles.show);

      await wait(200);
      if (abortRef.current || RUN !== runIdRef.current) return;
      if (avatarRef.current) avatarRef.current.classList.add(styles.show);

      sizeOverlay();
      startTicker();

      setupSmoothResize(cardRef.current, .05, false, false);
      setupSmoothResize(callout1BoxRef.current, .05);
      setupSmoothResize(callout2BoxRef.current, .05);

      try { if ((document as any).fonts) await (document as any).fonts.ready; } catch {}

      // Seed path styles
      if (leftPathRef.current) {
        leftPathRef.current.style.opacity = '0';
        leftPathRef.current.style.strokeDasharray = '1';
        leftPathRef.current.style.strokeDashoffset = '1';
      }
      if (rightPathRef.current) {
        rightPathRef.current.style.opacity = '0';
        rightPathRef.current.style.strokeDasharray = '1';
        rightPathRef.current.style.strokeDashoffset = '1';
      }

      // Sequence A (Finance -> left callout)
      await wait(220);
      if (abortRef.current || RUN !== runIdRef.current) return;
      await typeText(roleRef.current, 'Finance', undefined, RUN);
      if (dotLToRef.current) dotLToRef.current.classList.add(styles.show);

      await wait(220);
      if (abortRef.current || RUN !== runIdRef.current) return;
      await drawPathAnimated(
        leftPathRef.current,
        rectCenter(pinRoleRef.current!.getBoundingClientRect()),
        {
          x: callout1BoxRef.current!.getBoundingClientRect().right,
          y: callout1BoxRef.current!.getBoundingClientRect().top + callout1BoxRef.current!.getBoundingClientRect().height / 2,
        }
      );

      if (dotLFromRef.current) dotLFromRef.current.classList.add(styles.show);
      await wait(160);
      if (abortRef.current || RUN !== runIdRef.current) return;
      if (callout1Ref.current) callout1Ref.current.classList.add(styles.show);
      await typeText(callout1TextRef.current, 'The system picks specialists most likely involved in solving this challenge.', 18, RUN);

      // Sequence B (Critic -> right callout)
      await wait(420);
      if (abortRef.current || RUN !== runIdRef.current) return;
      await typeText(personalityRef.current, 'Critic', 56, RUN);
      if (dotRToRef.current) dotRToRef.current.classList.add(styles.show);

      await wait(220);
      if (abortRef.current || RUN !== runIdRef.current) return;
      await drawPathAnimated(
        rightPathRef.current,
        rectCenter(pinCriticRef.current!.getBoundingClientRect()),
        {
          x: callout2BoxRef.current!.getBoundingClientRect().left,
          y: callout2BoxRef.current!.getBoundingClientRect().top + callout2BoxRef.current!.getBoundingClientRect().height / 2,
        }
      );

      if (dotRFromRef.current) dotRFromRef.current.classList.add(styles.show);
      await wait(160);
      if (abortRef.current || RUN !== runIdRef.current) return;
      if (callout2Ref.current) callout2Ref.current.classList.add(styles.show);
      await typeText(callout2TextRef.current, 'We add different mindsets to keep the team balanced.', 18, RUN);

      // Show Continue button
      await wait(300);
      if (abortRef.current || RUN !== runIdRef.current) return;
      if (nextBtnRef.current) nextBtnRef.current.classList.add(styles.show);

      stopTicker();
      window.setTimeout(() => releaseSmoothResize((el) => {
        return el === cardRef.current || el === callout1BoxRef.current || el === callout2BoxRef.current;
      }), 350);

      ro = new ResizeObserver(() => {
        startTicker();
        window.clearTimeout((window as any).__obs);
        (window as any).__obs = window.setTimeout(() => stopTicker(), 300);
      });
      [
        roleWrapRef.current,
        personalityWrapRef.current,
        pinRoleRef.current,
        pinCriticRef.current,
        callout1BoxRef.current,
        callout2BoxRef.current,
      ].forEach((el) => el && ro!.observe(el));
    };

    void run();

    return () => {
      abortRef.current = true;
      runIdRef.current++; // invalidate any in-flight typing loops
      stopTicker();
      ro?.disconnect();
      releaseSmoothResize();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStartDiscussion = () => {
    alert('Proceeding to Screen 3: Team Discussion Network...');
  };

  return (
    <div ref={rootRef} className={styles.root}>
      {/* Overlay SVG + dots */}
      <svg ref={overlayRef} className={styles.overlay} width="100%" height="100%">
        <path ref={leftPathRef} className={styles.overlayPath} />
        <path ref={rightPathRef} className={styles.overlayPath} />
      </svg>

      <div ref={dotLFromRef} className={`${styles.dot}`}></div>
      <div ref={dotLToRef}   className={`${styles.dot}`}></div>
      <div ref={dotRFromRef} className={`${styles.dot}`}></div>
      <div ref={dotRToRef}   className={`${styles.dot}`}></div>

      {/* Phase A: Agent Creation */}
      <div ref={phaseCreationRef} className={`${styles.phase} ${styles.active}`}>
        <div className={styles.wrap}>
          <div ref={cardRef} className={`${styles.card}`}>
            <div ref={avatarRef} className={styles.avatar}>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={styles.avatarSvg}>
                <circle cx="12" cy="10" r="3" fill="#fff"/>
                <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#fff" opacity=".85"/>
              </svg>
            </div>

            <div ref={roleWrapRef} className={styles.titleWrap}>
              <span ref={roleRef} className={styles.role}></span>
              <span ref={pinRoleRef} className={`${styles.anchorPin} ${styles.pinRole}`} aria-hidden="true"></span>
            </div>
            <div ref={personalityWrapRef} className={styles.titleWrap} style={{ marginTop: 8 }}>
              <span ref={personalityRef} className={styles.personality}></span>
              <span ref={pinCriticRef} className={`${styles.anchorPin} ${styles.pinCritic}`} aria-hidden="true"></span>
            </div>

            <div ref={callout1Ref} className={`${styles.callout} ${styles.left}`}>
              <div ref={callout1BoxRef} className={styles.calloutBox}><span ref={callout1TextRef}></span></div>
            </div>
            <div ref={callout2Ref} className={`${styles.callout} ${styles.right}`}>
              <div ref={callout2BoxRef} className={styles.calloutBox}><span ref={callout2TextRef}></span></div>
            </div>
          </div>

          <div className={styles.cta}>
            <button ref={nextBtnRef} className={`${styles.btn}`} onClick={switchToTeamPhase}>Continue</button>
          </div>
        </div>
      </div>

      {/* Phase B: Team Reveal */}
      <div ref={phaseTeamRef} className={styles.phase}>
        <div className={styles.teamContainer}>
          <h2 ref={teamTitleRef} className={styles.teamTitle}>Your specialist team is ready</h2>

          <div className={styles.teamGrid}>
            {TEAM_DATA.map((agent, index) => (
              <div
                key={`${agent.role}-${index}`}
                className={`${styles.agentCard} ${teamCardsShown ? styles.show : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`${styles.agentIcon} ${styles[`personality-${agent.color}` as const]}`}>
                  <svg viewBox="0 0 24 24" fill="none" className={styles.agentIconSvg}>
                    <circle cx="12" cy="10" r="3" fill="#fff"/>
                    <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#fff" opacity=".8"/>
                  </svg>
                </div>
                <div className={styles.agentName}>{agent.role}</div>
                <div className={styles.agentStyle}>{agent.personality}</div>
              </div>
            ))}
          </div>

          <button ref={startDiscussionBtnRef} className={styles.btn} onClick={onStartDiscussion}>
            Start Discussion
          </button>
        </div>
      </div>
    </div>
  );
}
