import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex flex-wrap items-center gap-1.5 text-caption", className)}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <ChevronRight className="w-3.5 h-3.5 text-ink-muted shrink-0" aria-hidden />
            )}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="text-ink-secondary hover:text-accent transition-colors duration-300"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-ink" : "text-ink-secondary"}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
