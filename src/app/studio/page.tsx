import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StudioClient } from "@/components/studio/StudioClient";

export const metadata: Metadata = {
  title: "Studio — add a project",
  robots: { index: false, follow: false },
};

/** Local-only tool for adding portfolio projects. Not available in production builds. */
export default function StudioPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <StudioClient />;
}
