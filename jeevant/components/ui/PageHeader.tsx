import type { ReactNode } from "react";

// Public-page hero header. Server-safe (CSS animations only).
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="page-header relative">
      <div className="page-header-brackets" aria-hidden />
      <p className="eyebrow">
        <span className="eyebrow-dot" />
        {eyebrow}
      </p>

      <div className={aside ? "mt-4 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between" : "mt-4"}>
        <div className="min-w-0">
          <h1 className="page-title">{title}</h1>
          {description ? <p className="page-desc">{description}</p> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>

      {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
