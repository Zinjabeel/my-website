import { ZoomArrival } from "@/components/site/ZoomArrival";

/**
 * Re-mounted on every navigation, so the arrival animation replays.
 * Pure CSS: content is never held back by scripts, and reduced motion makes it instant.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" tabIndex={-1} className="page-enter outline-none">
      <ZoomArrival />
      {children}
    </main>
  );
}
