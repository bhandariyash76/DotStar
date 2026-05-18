import { cn } from "@/lib/utils";

/**
 * Metallic Gradient for brand letters
 */
export function MetallicGradient() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="metal-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="20%" stopColor="#ffffff" />
          <stop offset="45%" stopColor="#888888" />
          <stop offset="50%" stopColor="#444444" />
          <stop offset="55%" stopColor="#888888" />
          <stop offset="80%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface BrandTextProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/* Custom SVG letters matching the reference DOT.STAR font style */

export function LetterD({ metallic = false }: { metallic?: boolean }) {
  return (
    <svg className="h-full w-auto shrink-0 text-inherit" viewBox="0 0 78 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 16H44C60 16 70 27 70 39C70 51 60 56 44 56H8" stroke={metallic ? "url(#metal-grad)" : "currentColor"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LetterT({ metallic = false }: { metallic?: boolean }) {
  return (
    <svg className="h-full w-auto shrink-0 text-inherit" viewBox="0 0 66 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 16H60M33 16V56" stroke={metallic ? "url(#metal-grad)" : "currentColor"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LetterS({ metallic = false }: { metallic?: boolean }) {
  return (
    <svg className="h-full w-auto shrink-0 text-inherit" viewBox="0 0 72 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M62 16H22C13 16 8 21 8 28C8 35 13 39 22 39H50C59 39 64 43 64 50C64 55 59 56 50 56H10" stroke={metallic ? "url(#metal-grad)" : "currentColor"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LetterA({ metallic = false }: { metallic?: boolean }) {
  return (
    <svg className="h-full w-auto shrink-0 text-inherit" viewBox="0 0 72 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 56L31 18C34 13 38 13 41 18L64 56" stroke={metallic ? "url(#metal-grad)" : "currentColor"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LetterR({ metallic = false }: { metallic?: boolean }) {
  return (
    <svg className="h-full w-auto shrink-0 text-inherit" viewBox="0 0 76 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M10 56V16H46C60 16 68 22 68 31C68 40 60 44 46 44H10M46 44L68 56" stroke={metallic ? "url(#metal-grad)" : "currentColor"} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function EclipseO() {
  return (
    <span className="relative inline-flex items-center justify-center h-[1.05em] w-[1.05em] mx-[0.06em] shrink-0">
      <span className="absolute inset-0 rounded-full border-[1.5px] md:border-[2px] border-current" />
    </span>
  );
}

// Moon-glowing eclipse variant for the dark Waiting List page
export function MoonEclipseO() {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '130%',
        aspectRatio: '1',
        marginInline: '0.15em',
        flexShrink: 0,
      }}
    >
      {/* Outer glowing ring */}
      <span
        style={{
          position: 'absolute',
          inset: '5%',
          borderRadius: '50%',
          border: 'clamp(1.5px, 0.28vw, 3px) solid rgba(255, 255, 255, 0.95)',
          boxShadow: [
            '0 0 6px 2px rgba(255, 255, 255, 0.9)',
            '0 0 14px 5px rgba(255, 255, 255, 0.5)',
            '0 0 28px 10px rgba(255, 255, 255, 0.22)',
            '0 0 48px 18px rgba(255, 255, 255, 0.1)',
            'inset 0 0 8px 2px rgba(255, 255, 255, 0.4)',
          ].join(', '),
          animation: 'moon-pulse 4s ease-in-out infinite',
        }}
      />
      {/* Crescent shadow — offset to create lunar effect */}
      <span
        style={{
          position: 'absolute',
          width: '82%',
          height: '82%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 62% 38%, #050508 0%, #0a0a12 55%, transparent 100%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-46%, -54%)', // Offset to create crescent moon
          boxShadow: 'inset 2px -2px 8px rgba(180, 210, 255, 0.08)',
        }}
      />
      {/* Inner atmosphere glow on the lit side */}
      <span
        style={{
          position: 'absolute',
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, rgba(200,220,255,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-60%, -60%)',
        }}
      />
    </span>
  );
}

export default function BrandText({ className, size = 'md' }: BrandTextProps) {
  const sizeClasses = {
    sm: "h-4 md:h-5 gap-0.5",
    md: "h-5 md:h-8 gap-1.5",
    lg: "h-8 md:h-12 gap-2"
  };

  return (
    <section className={cn("flex items-center", sizeClasses[size], className)}>
      <div className="flex items-center h-full gap-[0.1em]">
        <LetterD />
        <EclipseO />
        <LetterT />
      </div>
      <div className="flex items-center h-full gap-[0.1em] ml-[0.3em]">
        <LetterS />
        <LetterT />
        <LetterA />
        <LetterR />
      </div>
    </section>
  );
}
