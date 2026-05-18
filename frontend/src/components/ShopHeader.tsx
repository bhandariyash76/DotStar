import { cn } from "@/lib/utils";

interface ShopHeaderProps {
  overline?: string;
  title: string;
  description?: string;
  className?: string;
}

export default function ShopHeader({
  overline,
  title,
  description,
  className,
}: ShopHeaderProps) {
  return (
    <header className={cn("mb-10 md:mb-14", className)}>
      {overline && (
        <p className="text-overline uppercase text-ink-muted mb-3">{overline}</p>
      )}
      <h1 className="text-headline text-ink">{title}</h1>
      {description && (
        <p className="text-body text-ink-secondary mt-4 max-w-xl">{description}</p>
      )}
    </header>
  );
}
