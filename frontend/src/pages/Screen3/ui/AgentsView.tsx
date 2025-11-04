import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import styles from '../Screen3.module.css';
import type { Screen3Variants } from '../animations';
import { S3, type AgentMeta } from '../constants';
import type { SimSnapshot } from '../sim/simulation';

type AgentsViewProps = {
  agents: readonly AgentMeta[];
  snapshot: SimSnapshot | null;
  variants: Screen3Variants;
  animate: 'hidden' | 'visible';
  onAgentSelect?: (id: string) => void;
  pinsInteractive: boolean;
  reducedMotion: boolean;
  timingStart: number;
  timingStagger: number;
};

const PIN_VERTICAL_OFFSET = -(S3.PIN.SIZE + 2) + S3.PIN.SIZE * 0.1;

export function AgentsView({
  agents,
  snapshot,
  variants,
  animate,
  onAgentSelect,
  pinsInteractive,
  reducedMotion,
  timingStart,
  timingStagger,
}: AgentsViewProps) {
  return (
    <div id="agents" className={styles.agentsLayer} aria-hidden="false">
      {agents.map((agent, index) => {
        const node = snapshot?.nodes.find((n) => n.id === agent.id);
        const x = node?.x ?? -9999;
        const y = node?.y ?? -9999;
        const active = node?.active ?? false;

        const slotStyle: CSSProperties = {
          left: `${x}px`,
          top: `${y}px`,
        };

        const labelStyle: CSSProperties = {
          background: hexToRgba(agent.color, 0.22),
          borderColor: hexToRgba(agent.color, 0.65),
          boxShadow: `0 8px 20px ${hexToRgba(agent.color, 0.35)}`,
        };
        (labelStyle as Record<string, string>)['--agent-label-shadow-color'] = darkenHexToRgba(agent.color, 0.75, 0.85);
        (labelStyle as Record<string, string>)['--agent-label-outline-color'] = darkenHexToRgba(agent.color, 0.75, 0.38);

        const pinStyle: CSSProperties = {
          width: `${S3.PIN.SIZE}px`,
          height: `${S3.PIN.SIZE}px`,
          background: hexToRgba(agent.color, 0.28),
          borderColor: hexToRgba(agent.color, 0.75),
          boxShadow: `0 8px 20px ${hexToRgba(agent.color, 0.35)}`,
        };
        (pinStyle as Record<string, string>)['--agent-label-shadow-color'] = darkenHexToRgba(agent.color, 0.75, 0.85);
        (pinStyle as Record<string, string>)['--agent-label-outline-color'] = darkenHexToRgba(agent.color, 0.75, 0.38);

        const pinWrapperStyle: CSSProperties = {
          top: `${PIN_VERTICAL_OFFSET}px`,
        };

        const baseDelay = reducedMotion ? 0 : timingStart + index * timingStagger;
        const labelTransition = {
          delay: baseDelay,
          duration: reducedMotion ? 0.18 : S3.TIMING.AGENTS.LABEL_DURATION,
          ease: S3.EASE.SOFT,
        };
        const pinTransition = {
          delay: reducedMotion ? 0 : baseDelay + S3.TIMING.AGENTS.PIN_DELAY_OFFSET,
          duration: reducedMotion ? 0.18 : S3.TIMING.AGENTS.PIN_DURATION,
          ease: S3.EASE.DEFAULT,
        };

        return (
          <div className={styles.agentSlot} key={agent.id} style={slotStyle}>
            <motion.div
              className={styles.agentMotion}
              variants={variants.fadeUp}
              initial="hidden"
              animate={animate}
              transition={labelTransition}
            >
              <div className={styles.agent} style={labelStyle}>
                <div className={styles.agentLabel}>{agent.name}</div>
              </div>
            </motion.div>

            <motion.div
              className={styles.chatpinMotion}
              style={pinWrapperStyle}
              variants={variants.pinIn}
              initial="hidden"
              animate={animate}
              transition={pinTransition}
            >
              <button
                type="button"
                className={`${styles.chatpin} ${active ? styles.chatpinActive : ''}`}
                style={pinStyle}
                onClick={() => onAgentSelect?.(agent.id)}
                aria-label={`Open chat for ${agent.name}`}
                data-active={active ? 'true' : 'false'}
                disabled={!pinsInteractive}
              >
                <ChatIcon />
              </button>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

function ChatIcon() {
  return (
    <svg className={styles.chatIcon} width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <g className="ci-bubble" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5.5h12a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5H10.2c-.43 0-.85.13-1.2.36L6 19.5v-2.9A2.5 2.5 0 0 1 3.5 14V8A2.5 2.5 0 0 1 6 5.5Z" />
      </g>
      <g className="ci-dots" fill="currentColor">
        <circle cx="9" cy="12" r="1.3" />
        <circle cx="12" cy="12" r="1.3" />
        <circle cx="15" cy="12" r="1.3" />
      </g>
    </svg>
  );
}

function hexToRgb(hex: string) {
  let h = hex.replace('#', '');
  if (h.length === 3) {
    h = [h[0], h[0], h[1], h[1], h[2], h[2]].join('');
  }
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function hexToRgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

function darkenHexToRgba(hex: string, mul: number, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  const rr = Math.max(0, Math.min(255, Math.round(r * mul)));
  const gg = Math.max(0, Math.min(255, Math.round(g * mul)));
  const bb = Math.max(0, Math.min(255, Math.round(b * mul)));
  return `rgba(${rr},${gg},${bb},${alpha})`;
}
