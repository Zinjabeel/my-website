import type { Metadata } from "next";
import { AccountClient } from "@/components/account/AccountClient";
import { PageHead } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Your account",
  description: "Your Launchly account: project briefs and their status.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <>
      <PageHead eyebrow="Your account" title="Your Launchly account." />
      <section className="wrap section">
        <AccountClient />
      </section>
    </>
  );
}
