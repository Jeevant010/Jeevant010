// Pure-markup ambient background for private pages. No client hooks.
export default function Atmosphere({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`page-atmosphere pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="page-atmosphere-grid" />
      <div className="page-atmosphere-glow" />
      <div className="page-atmosphere-scan" />
      <div className="page-noise" />
    </div>
  );
}
