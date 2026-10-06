/**
 * Typographic placeholder wordmark. Replace with TAS Group's official logo artwork before launch.
 */
export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 40 28" className="h-7 w-10" aria-hidden="true">
        <rect x="0" y="9" width="40" height="19" fill="#f28c28" />
        <g stroke="#06141d" strokeOpacity=".35" strokeWidth="1.5">
          <path d="M6 11v15M12 11v15M18 11v15M24 11v15M30 11v15M36 11v15" />
        </g>
        <path d="M0 3h40" stroke="#20b9d4" strokeWidth="2" />
        <path d="M20 3v6" stroke="#edf3f5" strokeWidth="1.5" />
      </svg>
      <span className="flex flex-col leading-none">
        <span className="display-wide text-xl tracking-tight text-foam">TAS</span>
        <span className="label mt-1 !text-[0.55rem] !tracking-[0.24em] text-mist">Group of Companies</span>
      </span>
    </span>
  );
}
