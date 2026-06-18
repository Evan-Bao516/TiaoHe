/** Simple fridge outline icon — not available in lucide-react */
export default function FridgeIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Fridge body */}
      <rect x="5" y="2" width="14" height="20" rx="1.5" />
      {/* Freezer compartment line */}
      <line x1="5" y1="9" x2="19" y2="9" />
      {/* Handle */}
      <line x1="19" y1="6" x2="19" y2="8" />
      <line x1="19" y1="12" x2="19" y2="14" />
    </svg>
  )
}
