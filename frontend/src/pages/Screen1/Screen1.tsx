import { useEffect, useRef, useState } from 'react';
import styles from './Screen1.module.css';

type Phase = 'gate' | 'intro' | 'main' | 'team';

export default function Screen1() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);

  const introLine1Ref = useRef<HTMLHeadingElement>(null);
  const introLine2Ref = useRef<HTMLParagraphElement>(null);
  const finalLine1Ref = useRef<HTMLHeadingElement>(null);
  const finalLine2Ref = useRef<HTMLParagraphElement>(null);

  const [phase, setPhase] = useState<Phase>('gate');

  // Selection state
  const [selectedProblem, setSelectedProblem] = useState<null | 'ER' | 'Bus'>(null);
  const [selectedInsights, setSelectedInsights] = useState<Set<string>>(() => new Set());
  const [showContinue, setShowContinue] = useState(false);

  // Team assembly reveal state
  const [finalLine1Visible, setFinalLine1Visible] = useState(false);
  const [finalLine2Visible, setFinalLine2Visible] = useState(false);
  const [iconsVisibleCount, setIconsVisibleCount] = useState(0);
  const [finalBtnVisible, setFinalBtnVisible] = useState(false);
  const teamSeqLockRef = useRef(false);

  // Helpers to read CSS vars (scoped to container)
  const css = () => getComputedStyle(containerRef.current || document.documentElement);
  const toMs = (v?: string) => {
    const s = (v ?? '').toString().trim();
    if (s.endsWith('ms')) return parseFloat(s);
    if (s.endsWith('s')) return parseFloat(s) * 1000;
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };
  const READ_DELAY = () => toMs(css().getPropertyValue('--read-delay'));
  const ICONS_AFTER_TEXT = () => toMs(css().getPropertyValue('--icons-after-text'));
  const ICON_STAGGER = () => toMs(css().getPropertyValue('--icon-stagger'));
  const INTRO_OVERLAP = () => toMs(css().getPropertyValue('--intro-overlap'));
  const PHASE_FADE = () => toMs(css().getPropertyValue('--phase-fade'));
  const ICON_DURATION = () => toMs(css().getPropertyValue('--icon-duration'));
  const FADE_DURATION = () => toMs(css().getPropertyValue('--fade-duration'));

  const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
  const onceTransitionEnd = (el: HTMLElement | null) =>
    new Promise<void>((res) => {
      if (!el) return res();
      const timeout = setTimeout(res, PHASE_FADE() + 80);
      const handler = (e: Event) => {
        const te = e as TransitionEvent;
        if (te.propertyName === 'opacity') {
          clearTimeout(timeout);
          el.removeEventListener('transitionend', handler);
          res();
        }
      };
      el.addEventListener('transitionend', handler, { once: true });
    });

  // Phase management using classList to allow fine-grain overlap
  const getPhaseEl = (p: Phase) => ({ gate: gateRef, intro: introRef, main: mainRef, team: teamRef }[p].current);
  const getActivePhaseEl = () => {
    const refs = [gateRef.current, introRef.current, mainRef.current, teamRef.current];
    for (const el of refs) {
      if (el && el.classList.contains(styles.active)) return el;
    }
    return null;
  };

  async function switchPhase(next: Phase, onShown?: () => void, opts?: { overlapStartMs?: number; delayBeforeNext?: number }) {
    const fromEl = getActivePhaseEl();
    const toEl = getPhaseEl(next);
    const overlapStartMs = opts?.overlapStartMs;
    const delayBeforeNext = !overlapStartMs ? opts?.delayBeforeNext ?? 0 : 0;

    if (fromEl && fromEl.classList.contains(styles.active)) {
      fromEl.classList.remove(styles.active);
      await onceTransitionEnd(fromEl);
      if (delayBeforeNext > 0) {
        await wait(delayBeforeNext);
      }
    }

    if (toEl) {
      if (!overlapStartMs) {
        toEl.style.visibility = 'hidden';
      }
      toEl.classList.add(styles.active);
    }

    if (overlapStartMs != null) {
      await wait(Math.max(0, overlapStartMs));
      onShown?.();
      await onceTransitionEnd(toEl || null);
    } else {
      if (toEl) {
        // Force layout so visibility change takes effect with the active class applied
        void toEl.offsetHeight;
        toEl.style.visibility = 'visible';
      }
      await onceTransitionEnd(toEl || null);
      onShown?.();
    }

    if (toEl && !overlapStartMs) {
      toEl.style.visibility = '';
    }
    setPhase(next);
  }

  // Intro sequence (two lines, sequential)
  const startIntroSequence = async () => {
    if (introLine1Ref.current) introLine1Ref.current.classList.remove(styles.reveal);
    if (introLine2Ref.current) introLine2Ref.current.classList.remove(styles.reveal);

    // line 1
    if (introLine1Ref.current) introLine1Ref.current.classList.add(styles.reveal);
    await wait(FADE_DURATION());
    await wait(READ_DELAY());

    // line 2
    if (introLine2Ref.current) introLine2Ref.current.classList.add(styles.reveal);
    await wait(FADE_DURATION());
    await wait(READ_DELAY());

    // Fade out intro fully, then show problem cards (main)
    await switchPhase('main', undefined, { delayBeforeNext: 300 });
    // Hard-hide intro to avoid any residual overlap later
    if (introRef.current) introRef.current.style.display = 'none';
  };

  // Reveal sequence for Team phase: title → subtitle → icons (staggered) → button
  useEffect(() => {
    const el = teamRef.current;
    if (!el) return;

    const runIdRef = { current: 0 } as { current: number };
    const nextRunId = () => (++runIdRef.current);

    const run = async () => {
      const RUN = nextRunId();
      if (teamSeqLockRef.current) return;
      teamSeqLockRef.current = true;
      // Reset
      setFinalBtnVisible(false);
      setIconsVisibleCount(0);
      setFinalLine1Visible(false);
      setFinalLine2Visible(false);

      // 1) Title
      setFinalLine1Visible(true);
      await wait(FADE_DURATION());
      if (RUN !== runIdRef.current) return;
      await wait(READ_DELAY());
      if (RUN !== runIdRef.current) return;

      // 2) Subtitle
      setFinalLine2Visible(true);
      await wait(FADE_DURATION());
      if (RUN !== runIdRef.current) return;
      await wait(READ_DELAY());
      if (RUN !== runIdRef.current) return;

      // 3) Icons stagger
      await wait(ICONS_AFTER_TEXT());
      if (RUN !== runIdRef.current) return;
      for (let i = 1; i <= 5; i++) {
        setIconsVisibleCount(i);
        await wait(ICON_STAGGER() + 80);
        if (RUN !== runIdRef.current) return;
      }

      // 4) After last icon pops, reveal the button
      await wait(ICON_DURATION());
      if (RUN !== runIdRef.current) return;
      setFinalBtnVisible(true);
      teamSeqLockRef.current = false;
    };

    // Start if already active on mount
    if (el.classList.contains(styles.active)) run();

    // Observe class changes to trigger when team phase activates
    const mo = new MutationObserver(() => {
      if (el.classList.contains(styles.active)) run();
      else { nextRunId(); teamSeqLockRef.current = false; } // invalidate and unlock when deactivating
    });
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });

    return () => {
      mo.disconnect();
      nextRunId(); // invalidate on cleanup to stop any in-flight sequence (StrictMode-safe)
      teamSeqLockRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Removed legacy manual team sequence; handled by StrictMode-safe effect above

  // Initial active phase class for Gate
  useEffect(() => {
    if (gateRef.current) {
      gateRef.current.classList.add(styles.active);
    }
  }, []);

  // Continue button toggle condition
  useEffect(() => {
    setShowContinue(Boolean(selectedProblem) && selectedInsights.size > 0);
  }, [selectedProblem, selectedInsights]);

  const onStart = async () => {
    await switchPhase('intro', startIntroSequence, { overlapStartMs: INTRO_OVERLAP() });
  };

  const onContinue = async () => {
    await switchPhase('team');
  };

  const toggleInsight = (key: string) => {
    setSelectedInsights((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div ref={containerRef} className={styles.root}>
      {/* Background orbs */}
      <div className={`${styles.bgOrb} ${styles.orb1}`} />
      <div className={`${styles.bgOrb} ${styles.orb2}`} />
      <div className={`${styles.bgOrb} ${styles.orb3}`} />

      {/* Gate */}
      <div ref={gateRef} className={styles.phase}>
        <div className={styles.gateContent}>
          <button className={styles.btn} onClick={onStart}>Start Presentation</button>
        </div>
      </div>

      {/* Intro */}
      <div ref={introRef} className={styles.phase}>
        <div className={styles.introContent}>
          <h1 ref={introLine1Ref} className={`${styles.introTitle} ${styles.fadeUp}`}>Collective intelligence, on your terms.</h1>
          <p ref={introLine2Ref} className={`${styles.introSubtitle} ${styles.fadeUp}`}>Different minds. One challenge.</p>
        </div>
      </div>

      {/* Main */}
      <div ref={mainRef} className={`${styles.phase} ${styles.mainPhase}`}>
        <div className={styles.mainWrapper}>
          <div className={styles.mainContainer}>
            <div className={styles.mainHeader}>
              <h2 className={styles.mainTitle}>Choose a challenge</h2>
              <p className={styles.mainSubtitle}>Select the scenario you want to explore with AI specialists</p>
            </div>

            <div className={styles.problemsGrid}>
              {/* ER card */}
              <div
                className={`${styles.problemCard} ${selectedProblem === 'ER' ? styles.problemCardSelected : ''}`}
                onClick={() => setSelectedProblem('ER')}
              >
                <div className={`${styles.problemIcon} ${styles.glowPurple}`} style={{ background: 'linear-gradient(135deg,#d8c9ff,#e8deff)' }}>
                  <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                    <rect x="3" y="7" width="18" height="12" rx="4" fill="#ffffff"/>
                    <path d="M12 10v6M9 13h6" stroke="#7165d8" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className={styles.problemTitle}>Emergency Room overload</h3>
                <p className={styles.problemDesc}>Urban hospital faces peak-time bottlenecks. Patients wait too long, staff rotate poorly, beds don't free fast enough. We want near-term changes we can pilot without new budget.</p>
              </div>

              {/* Bus card */}
              <div
                className={`${styles.problemCard} ${selectedProblem === 'Bus' ? styles.problemCardSelected : ''}`}
                onClick={() => setSelectedProblem('Bus')}
              >
                <div className={`${styles.problemIcon} ${styles.glowBlue}`} style={{ background: 'linear-gradient(135deg,#b3d9ff,#c8e5ff)' }}>
                  <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                    <rect x="3" y="6" width="18" height="10" rx="2" fill="#ffffff"/>
                    <circle cx="8" cy="18" r="2" fill="#5a87c6"/>
                    <circle cx="16" cy="18" r="2" fill="#5a87c6"/>
                    <path d="M6 9h12" stroke="#5a87c6" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9 6v3M15 6v3" stroke="#5a87c6" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className={styles.problemTitle}>Winter bus delays</h3>
                <p className={styles.problemDesc}>Mid-size bus network struggles with cold starts, plowing and bunching. We need street-level fixes — depots, routing and rider comms — under existing constraints.</p>
              </div>
            </div>

            {/* Insights */}
            <div className={styles.insightsSection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>What should the team focus on?</h3>
                <p className={styles.sectionSubtitle}>Select one or more areas to explore</p>
              </div>

              <div className={styles.insightsGrid}>
                <div
                  className={`${styles.insightCard} ${selectedInsights.has('perspectives') ? styles.insightCardSelected : ''}`}
                  onClick={() => toggleInsight('perspectives')}
                >
                  <div className={`${styles.insightIcon} ${styles.glowGold}`} style={{ background: 'linear-gradient(135deg,#ffe4a3,#ffecb8)' }}>
                    <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                      <circle cx="12" cy="12" r="3" fill="#d4a853"/>
                      <path d="M12 5v2M12 17v2M5 12h2M17 12h2" stroke="#d4a853" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M7.05 7.05l1.41 1.41M15.54 15.54l1.41 1.41M7.05 16.95l1.41-1.41M15.54 8.46l1.41-1.41" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h4 className={styles.insightTitle}>Perspectives</h4>
                  <p className={styles.insightDesc}>Different lenses that reframe what to pay attention to</p>
                </div>

                <div
                  className={`${styles.insightCard} ${selectedInsights.has('tensions') ? styles.insightCardSelected : ''}`}
                  onClick={() => toggleInsight('tensions')}
                >
                  <div className={`${styles.insightIcon} ${styles.glowPink}`} style={{ background: 'linear-gradient(135deg,#ffb5cc,#ffc8db)' }}>
                    <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                      <path d="M12 3v18" stroke="#d47a97" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M5 12h14" stroke="#d47a97" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="8" cy="8" r="2" fill="#d47a97" opacity=".8"/>
                      <circle cx="16" cy="16" r="2" fill="#d47a97" opacity=".8"/>
                    </svg>
                  </div>
                  <h4 className={styles.insightTitle}>Tensions</h4>
                  <p className={styles.insightDesc}>Productive trade-offs the team will explore together</p>
                </div>

                <div
                  className={`${styles.insightCard} ${selectedInsights.has('opportunities') ? styles.insightCardSelected : ''}`}
                  onClick={() => toggleInsight('opportunities')}
                >
                  <div className={`${styles.insightIcon} ${styles.glowGreen}`} style={{ background: 'linear-gradient(135deg,#b5e4d3,#c8f0e3)' }}>
                    <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                      <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7z" fill="#6ab59d" opacity=".3"/>
                      <circle cx="12" cy="12" r="3" fill="#6ab59d"/>
                    </svg>
                  </div>
                  <h4 className={styles.insightTitle}>Opportunities</h4>
                  <p className={styles.insightDesc}>Near-term ideas for low-cost pilots (no new budget)</p>
                </div>

                <div
                  className={`${styles.insightCard} ${selectedInsights.has('blindspots') ? styles.insightCardSelected : ''}`}
                  onClick={() => toggleInsight('blindspots')}
                >
                  <div className={`${styles.insightIcon} ${styles.glowPurple}`} style={{ background: 'linear-gradient(135deg,#d8c9ff,#e8deff)' }}>
                    <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                      <circle cx="12" cy="12" r="9" stroke="#9d8ed4" strokeWidth="2" fill="none"/>
                      <path d="M12 16v-4" stroke="#9d8ed4" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="12" cy="8" r="1.5" fill="#9d8ed4"/>
                    </svg>
                  </div>
                  <h4 className={styles.insightTitle}>Blind Spots</h4>
                  <p className={styles.insightDesc}>Key questions to guide your next conversation</p>
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <div className={styles.continueSection}>
            <button
              className={`${styles.btn} ${styles.continueBtn} ${showContinue ? styles.show : ''}`}
              onClick={onContinue}
              disabled={!showContinue}
            >
              Continue
            </button>
          </div>
        </div>
      </div>

      {/* Team Assembly */}
      <div ref={teamRef} className={`${styles.phase} ${styles.teamPhase}`}>
        <div className={styles.assemblyContent}>
          <h2 className={`${styles.assemblyTitle} ${styles.fadeUp} ${finalLine1Visible ? styles.reveal : ''}`} ref={finalLine1Ref}>
            Let's examine this from different angles.
          </h2>
          <p className={`${styles.assemblySubtitle} ${styles.fadeUp} ${finalLine2Visible ? styles.reveal : ''}`} ref={finalLine2Ref}>
            We'll gather specialists with diverse perspectives.
          </p>

          <div className={styles.agentIcons}>
            {[0,1,2,3,4].map((i) => (
              <div key={i} className={`${styles.iconBounce} ${i < iconsVisibleCount ? styles.reveal : ''}`}>
                <div
                  className={`${styles.agentCircle} ${i === 0 ? styles.glowGold : i === 1 ? styles.glowPink : i === 2 ? styles.glowGreen : i === 3 ? styles.glowPurple : styles.glowBlue}`}
                  style={{
                    background:
                      i === 0 ? 'linear-gradient(135deg,#ffe4a3,#ffecb8)'
                      : i === 1 ? 'linear-gradient(135deg,#ffb5cc,#ffc8db)'
                      : i === 2 ? 'linear-gradient(135deg,#b5e4d3,#c8f0e3)'
                      : i === 3 ? 'linear-gradient(135deg,#d8c9ff,#e8deff)'
                      : 'linear-gradient(135deg,#b3d9ff,#c8e5ff)'
                  }}
                >
                  {i === 0 && (
                    <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                      <circle cx="12" cy="10" r="3" fill="#d4a853"/>
                      <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#d4a853" opacity=".6"/>
                    </svg>
                  )}
                  {i === 1 && (
                    <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                      <circle cx="12" cy="10" r="3" fill="#d47a97"/>
                      <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#d47a97" opacity=".6"/>
                    </svg>
                  )}
                  {i === 2 && (
                    <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                      <circle cx="12" cy="10" r="3" fill="#6ab59d"/>
                      <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#6ab59d" opacity=".6"/>
                    </svg>
                  )}
                  {i === 3 && (
                    <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                      <circle cx="12" cy="10" r="3" fill="#9d8ed4"/>
                      <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#9d8ed4" opacity=".6"/>
                    </svg>
                  )}
                  {i === 4 && (
                    <svg viewBox="0 0 24 24" fill="none" className={styles.agentSvg}>
                      <circle cx="12" cy="10" r="3" fill="#6a9dd4"/>
                      <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#6a9dd4" opacity=".6"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className={`${styles.btn} ${styles.assembleBtn} ${finalBtnVisible ? styles.show : ''}`}>Assemble the Team</button>
        </div>
      </div>
    </div>
  );
}
