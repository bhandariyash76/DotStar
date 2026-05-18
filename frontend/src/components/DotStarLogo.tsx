export default function DotStarLogo({ className = "w-9 h-auto shrink-0" }: { className?: string }) {
  return (
    <svg
      viewBox="0 -10 100 155"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M50 0 Q50 50 100 50 Q50 50 50 100 Q50 50 0 50 Q50 50 50 0 Z" />
      <circle cx="50" cy="125" r="15" />
    </svg>
  );
}
