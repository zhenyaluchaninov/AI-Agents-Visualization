import styles from '../Screen1.module.css';

interface GatePhaseProps {
  isActive: boolean;
  onStart: () => void;
}

export const GatePhase = ({ isActive, onStart }: GatePhaseProps) => (
  <div className={`${styles.phase} ${isActive ? styles.active : ''}`}>
    <div className={styles.gateContent}>
      <button className={styles.btn} onClick={onStart}>
        Start Presentation
      </button>
    </div>
  </div>
);

export default GatePhase;
