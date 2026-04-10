import styles from './Signature.module.css';

export default function Signature() {
  return (
    <div className={styles.signature}>
      <svg viewBox="0 0 48 48" className={styles.icon}>
        <defs>
          <filter id="sigGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M24 4 L42 14 L40 34 Q24 44 8 34 L6 14 Z"
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
          filter="url(#sigGlow)"
        />
        <text
          x="24"
          y="26"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#00ff88"
          fontSize="12"
          fontWeight="800"
        >
          VS
        </text>
      </svg>
      <span className={styles.tooltip}>Автор: Варвара Сапегина, группа АБ-420, 2026</span>
    </div>
  );
}
