"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";

function BrandMark() {
  return (
    <span className="brand-mark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9L12 3Z" />
      </svg>
    </span>
  );
}

function TopBarRight() {
  const { data: session } = useSession();
  const user = session?.user;
  const [credits, setCredits] = useState<number | null>(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function refresh() {
    if (!user) return;
    try {
      const [u, c] = await Promise.all([
        fetch("/api/usage").then((r) => r.json()),
        fetch("/api/checkin").then((r) => r.json()),
      ]);
      setCredits(u.credits ?? 0);
      setCanCheckIn(c.canCheckIn ?? false);
    } catch {}
  }

  useEffect(() => { refresh(); }, [user]);
  useEffect(() => {
    const h = () => refresh();
    window.addEventListener("credits-updated", h);
    return () => window.removeEventListener("credits-updated", h);
  }, [user]);

  if (!user) {
    return <button className="btn btn-primary btn-sm" onClick={() => (window.location.href = "/signin")}>Sign in</button>;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 999,
        border: "1px solid var(--border)",
        background: canCheckIn ? "var(--mint)" : "var(--paper-raised, #f5f5f5)",
        color: canCheckIn ? "#000" : "var(--text)",
        fontSize: "0.82rem", fontWeight: 600,
        cursor: canCheckIn ? "pointer" : "default",
      }}>
        <span>🎁</span>
        <span>{canCheckIn ? "Daily reward" : "Checked in"}</span>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "6px 12px", borderRadius: 999,
        border: "1px solid var(--border)",
        background: "var(--paper-raised, #f5f5f5)",
        fontSize: "0.82rem", fontWeight: 600,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M9 10h4.5a1.5 1.5 0 010 3H9" />
        </svg>
        {credits ?? "…"} credits
      </div>

      <div style={{ position: "relative" }}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "4px 10px 4px 4px", borderRadius: 999,
            border: "1px solid var(--border)",
            background: "var(--paper-raised, #f5f5f5)",
            cursor: "pointer",
          }}
        >
          {user.image ? (
            <img src={user.image} alt="" referrerPolicy="no-referrer" style={{ width: 28, height: 28, borderRadius: "50%" }} />
          ) : (
            <span style={{
              width: 28, height: 28, borderRadius: "50%",
              background: "var(--mint)", color: "#000",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: "0.85rem",
            }}>{user.name?.[0] || "U"}</span>
          )}
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            {user.name?.split(" ")[0] || user.email?.split("@")[0]}
          </span>
        </button>
        {userMenuOpen && (
          <div style={{
            position: "absolute", top: "calc(100% + 8px)", right: 0,
            background: "#fff", border: "1px solid var(--border)", borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)", minWidth: 160, zIndex: 100, overflow: "hidden",
          }}>
            <button
              onClick={() => { setUserMenuOpen(false); window.location.href = "/pricing"; }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "12px 16px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: "0.9rem", textAlign: "left",
              }}
            >
              Account & Billing
            </button>
            <button
              onClick={() => signOut()}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                width: "100%", padding: "12px 16px",
                background: "none", border: "none", borderTop: "1px solid var(--border)",
                cursor: "pointer", fontSize: "0.9rem", textAlign: "left",
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="topbar">
      <div className="shell topbar-in">
        <Link className="brand" href="/">
          <BrandMark />
          Jev Verdict
        </Link>
        <nav className="nav">
          <Link href="/directory" className={active === "directory" ? "active" : ""}>Explore</Link>
          <Link href="/#playground">Playground</Link>
          <Link href="/#types">Question types</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="topbar-cta">
          <TopBarRight />
        </div>
      </div>
    </header>
  );
}
