import type { ReactNode } from 'react';
import styles from '../Screen1.module.css';
import type { GlowTone } from '../types';

interface AgentIconProps {
  gradient: string;
  glow: GlowTone;
  className: string;
  children: ReactNode;
}

export const AgentIcon = ({ gradient, glow, className, children }: AgentIconProps) => (
  <div className={`${className} ${styles[glow]}`} style={{ background: gradient }}>
    {children}
  </div>
);

export default AgentIcon;
