export function Brand({ tagLine }: { tagLine?: string }) {
  return (
    <div className="brand">
      <span className="logo">
        Bijak<span className="dot">!</span>
        <svg viewBox="0 0 100 8" preserveAspectRatio="none">
          <path d="M2,5 Q50,-2 98,5" stroke="#D9432B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </span>
      <span className="tag">{tagLine || 'SPM QUIZ BUDDY'}</span>
    </div>
  );
}
