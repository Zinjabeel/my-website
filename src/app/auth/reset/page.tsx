import type { Metadata } from "next";
import { ResetClient } from "@/components/auth/ResetClient";
import { PageHead } from "@/components/ui/primitives";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default function ResetPage() {
  return (
    <>
      <PageHead eyebrow="Reset password" title="Choose a new password." />
      <section className="wrap section">
        <ResetClient />
      </section>
    </>
  );
}
