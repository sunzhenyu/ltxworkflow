export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      {/* Background rounded square */}
      <rect width="32" height="32" rx="8" fill="url(#lg)" />
      {/* Play triangle */}
      <polygon points="11,9 11,23 24,16" fill="white" opacity="0.95" />
      {/* Film strip lines */}
      <rect x="7" y="9" width="2.5" height="4" rx="0.5" fill="white" opacity="0.5" />
      <rect x="7" y="15" width="2.5" height="4" rx="0.5" fill="white" opacity="0.5" />
      <rect x="7" y="21" width="2.5" height="2" rx="0.5" fill="white" opacity="0.5" />
    </svg>
  );
}
