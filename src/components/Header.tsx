import { ChevronLeft, Heart, ShoppingCart } from 'lucide-react'

interface HeaderProps {
  nameZh: string
  nameEn: string
  isFavorited: boolean
  cartCount: number
  onBack: () => void
  onToggleFavorite: () => void
  onOpenCart: () => void
}

export default function Header({
  nameZh,
  nameEn,
  isFavorited,
  cartCount,
  onBack,
  onToggleFavorite,
  onOpenCart,
}: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.12)' }}
    >
      <button
        onClick={onBack}
        className="flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:text-text-primary hover:bg-charcoal-800 transition-colors duration-200"
        aria-label="Back to recipes"
      >
        <ChevronLeft size={22} strokeWidth={1.5} />
      </button>

      <div className="text-center">
        <h1
          className="text-2xl tracking-[0.06em] text-text-primary m-0 leading-none"
          style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}
        >
          {nameZh}
        </h1>
        <p
          className="text-[11px] tracking-[0.15em] uppercase text-text-muted mt-1 m-0"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {nameEn}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Favorite toggle */}
        <button
          onClick={onToggleFavorite}
          className={`
            flex items-center justify-center w-9 h-9 rounded-md transition-all duration-300
            ${isFavorited ? 'text-[#FF2E93]' : 'text-text-muted hover:text-amber-500'}
          `}
          aria-label={isFavorited ? 'Unsave recipe' : 'Save recipe'}
        >
          <Heart
            size={20}
            strokeWidth={1.5}
            fill={isFavorited ? '#FF2E93' : 'none'}
            className="transition-all duration-300"
          />
        </button>

        {/* Cart with badge */}
        <button
          onClick={onOpenCart}
          className="relative flex items-center justify-center w-9 h-9 rounded-md text-text-muted hover:text-ice-400 transition-colors duration-200"
          aria-label={`Shopping cart, ${cartCount} items`}
        >
          <ShoppingCart size={20} strokeWidth={1.5} />
          {cartCount > 0 && (
            <span
              className="
                absolute -top-0.5 -right-0.5
                min-w-[18px] h-[18px] px-1
                flex items-center justify-center
                rounded-full
                text-[10px] font-bold
                transition-all duration-300
                animate-in
              "
              style={{
                fontFamily: 'var(--font-mono)',
                background: '#00E5FF',
                color: '#0A0E17',
                boxShadow: '0 0 8px rgba(0, 229, 255, 0.4)',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
