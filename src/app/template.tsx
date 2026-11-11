import { ZoomArrival } from "@/components/site/ZoomArrival";

/**
 * Page transition. Re-mounted on every navigation, so the CSS animations replay.
 * Pure CSS (no JS) so content is never hidden if scripts are slow; reduced motion collapses it instantly.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div aria-hidden className="page-wipe">
        <span className="label page-wipe__label">Launchly — loading</span>
      </div>
      <main id="main" tabIndex={-1} className="page-enter outline-none">
        <ZoomArrival />
        {children}
      </main>
    </>
  );
}
