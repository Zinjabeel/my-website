"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, Lock, LogOut, Trash2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getSupabase } from "@/lib/supabase";
import { STATUS_LABEL, type BriefRow } from "@/lib/brief";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Signed-in home: profile, the briefs you've sent and their status. */
export function AccountClient() {
  const router = useRouter();
  const { user, ready, displayName, openAuth, signOut } = useAuth();
  const prompted = useRef(false);
  const [briefs, setBriefs] = useState<BriefRow[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!ready || user || prompted.current) return;
    prompted.current = true;
    openAuth("login");
  }, [ready, user, openAuth]);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !user) return;
    let alive = true;
    sb.from("project_briefs")
      .select("id, company, website, project_type, goals, budget, timeline, status, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setLoadError("We couldn't load your briefs. Refresh the page to try again.");
        else setBriefs((data as BriefRow[]) ?? []);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  async function deleteAccount() {
    const sb = getSupabase();
    if (!sb) return;
    setBusy(true);
    setDeleteError("");
    const { error } = await sb.rpc("delete_own_account");
    if (error) {
      setBusy(false);
      setDeleteError("We couldn't delete your account. Please try again, or contact us.");
      return;
    }
    await signOut();
    router.push("/");
  }

  if (!ready) {
    return (
      <div className="card p-8" aria-busy="true">
        <div className="h-6 w-48 animate-pulse rounded bg-paper-3" />
        <div className="mt-6 h-24 animate-pulse rounded bg-paper-3" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="card card-hard max-w-2xl p-7 md:p-10">
        <span className="grid size-12 place-items-center rounded-full bg-ink text-paper">
          <Lock className="size-5" aria-hidden />
        </span>
        <h2 className="display mt-6 text-[clamp(1.7rem,3vw,2.4rem)]">Log in to see your account.</h2>
        <p className="lead mt-4">Your project briefs and their status live here.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => openAuth("login")}>
            Log in <ArrowRight className="size-4" aria-hidden />
          </button>
          <button type="button" className="btn btn-outline" onClick={() => openAuth("signup")}>
            Create account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <section aria-labelledby="briefs-title" className="lg:col-span-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="briefs-title" className="display text-[clamp(1.6rem,2.6vw,2.1rem)]">
            Your briefs
          </h2>
          <Link href="/start" className="btn btn-primary btn-sm">
            New brief <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {loadError && (
          <p role="alert" className="rounded-md border border-danger/50 bg-danger/5 px-4 py-3 text-danger">
            {loadError}
          </p>
        )}

        {!briefs && !loadError && (
          <div className="space-y-3" aria-busy="true">
            {[0, 1].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-[8px] bg-paper-3" />
            ))}
          </div>
        )}

        {briefs?.length === 0 && (
          <div className="card border-dashed bg-transparent p-8 text-center">
            <p className="h-card">No briefs yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-muted">Tell us about your website and we&apos;ll reply with how we&apos;d approach it.</p>
            <Link href="/start" className="btn btn-signal mt-6">
              Start a project <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        )}

        {briefs && briefs.length > 0 && (
          <ul className="space-y-4">
            {briefs.map((b) => (
              <li key={b.id} className="card p-5 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="h-card !text-[1.2rem]">{b.company}</p>
                  <span className={`tag ${b.status === "received" ? "tag-ink" : b.status === "closed" ? "tag-outline" : ""}`}>{STATUS_LABEL[b.status] ?? b.status}</span>
                </div>
                <p className="label mt-2 text-muted">
                  {b.project_type} · Sent {fmt(b.created_at)}
                  {b.budget ? ` · ${b.budget}` : ""}
                  {b.timeline ? ` · ${b.timeline}` : ""}
                </p>
                <p className="mt-4 line-clamp-3 whitespace-pre-line text-[0.975rem] text-ink-2">{b.goals}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="lg:col-span-4">
        <div className="card p-6">
          <p className="eyebrow">Profile</p>
          <div className="mt-5 flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-[1.1rem] font-bold uppercase text-paper" aria-hidden>
              {displayName.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{displayName}</p>
              <p className="truncate text-[0.9rem] text-muted">{user.email}</p>
            </div>
          </div>
          <p className="label mt-5 border-t hairline pt-4 text-muted">Member since {fmt(user.created_at)}</p>
          <button type="button" onClick={() => signOut().then(() => router.push("/"))} className="btn btn-outline btn-sm btn-block mt-5">
            <LogOut className="size-4" aria-hidden /> Log out
          </button>
        </div>

        <div className="mt-5 rounded-[8px] border hairline p-6">
          <p className="eyebrow">Delete account</p>
          <p className="mt-3 text-[0.9rem] text-muted">Removes your account and every brief you&apos;ve sent. This can&apos;t be undone.</p>
          {deleteError && (
            <p role="alert" className="field-error">
              {deleteError}
            </p>
          )}
          {confirmDelete ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={deleteAccount} disabled={busy} className="btn btn-sm border-danger bg-danger text-white">
                {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
                Yes, delete everything
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} disabled={busy} className="btn btn-outline btn-sm">
                Cancel
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmDelete(true)} className="link-underline mt-4 text-[0.875rem] font-semibold text-danger">
              Delete my account
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
