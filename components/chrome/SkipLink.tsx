/**
 * Keyboard users land on this first. The reference has no skip link, and with a
 * fixed header plus a seven-link nav there is a lot to tab past.
 */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="focus-visible:bg-paper focus-visible:px-btn-nav-x focus-visible:py-btn-nav-y focus-visible:text-nav focus-visible:text-forest sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-[--spacing(4)] focus-visible:left-[--spacing(4)] focus-visible:z-[500] focus-visible:rounded-sm focus-visible:font-bold"
    >
      Skip to content
    </a>
  );
}
