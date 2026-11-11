import Link from "next/link";
import { Wordmark } from "./Logo";

/** Slim top bar that scrolls with the page; the floating dock handles navigation. */
export function TopBar({ section }: { section?: string }) {
  return (
    <header className="gutter relative z-10 flex items-center justify-between py-5">
      <Link href="/" aria-label="Launchly — home" className="text-[1.15rem]">
        <Wordmark />
      </Link>
      <p className="label hidden text-muted md:block">(Website development studio)</p>
      <p className="label text-muted">{section ?? "Index"}</p>
    </header>
  );
}
