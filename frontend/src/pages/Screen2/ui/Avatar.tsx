
export default function Avatar({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ width: 40, height: 40 }}>
        <circle cx="12" cy="10" r="3" fill="#fff"/>
        <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#fff" opacity=".85"/>
      </svg>
    </div>
  );
}
