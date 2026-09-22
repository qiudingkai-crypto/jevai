"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import HeroAnimation from "./components/HeroAnimation";
import Playground from "./components/Playground";
import { FAQS } from "@/lib/scenarios";
import { signIn, signOut, useSession } from "next-auth/react";

const REWARDS = [1, 1, 2, 2, 2, 3, 3];

function CheckInModal({ onClose, onClaimed }: { onClose: () => void; onClaimed: () => void }) {
  const [streak, setStreak] = useState(0);
  const [claimed, setClaimed] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/checkin").then((r) => r.json()).then((d) => setStreak(d.streak || 0));
  }, []);

  async function claim() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      const d = await res.json();
      if (d.reward) {
        setClaimed(d.reward);
        setStreak(d.streak);
        onClaimed();
      }
    } finally { setLoading(false); }
  }

  const canClaim = !claimed && streak < 7;

  return createPortal(
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 24, padding: 32, maxWidth: 600, width: "100%",
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>Daily Reward</h3>
          <p style={{ color: "#888", marginTop: 4, fontSize: "0.9rem" }}>Sign in daily to claim credits</p>
        </div>
        {claimed !== null && (
          <div style={{
            textAlign: "center", marginBottom: 16, padding: 12,
            background: "rgba(74,222,128,0.15)", borderRadius: 12,
            color: "#16a34a", fontWeight: 700,
          }}>+{claimed} credits claimed!</div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 20 }}>
          {REWARDS.map((r, i) => {
            const day = i + 1;
            const got = day <= streak;
            const isToday = day === streak + 1 && canClaim;
            return (
              <div key={i} style={{
                background: got ? "rgba(74,222,128,0.12)" : isToday ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.02)",
                border: isToday ? "2px solid #16a34a" : "1px solid #e5e5e5",
                borderRadius: 10, padding: "10px 4px", textAlign: "center",
              }}>
                <div style={{ fontSize: "0.65rem", color: "#999" }}>Day {day}</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, marginTop: 2 }}>+{r}</div>
                <div style={{ fontSize: "0.6rem", color: "#999" }}>credits</div>
                {got && <div style={{ fontSize: "0.7rem", color: "#16a34a" }}>✓</div>}
              </div>
            );
          })}
        </div>
        {canClaim && (
          <button onClick={claim} disabled={loading} style={{
            width: "100%", padding: "12px", background: "#16a34a", color: "#fff",
            border: "none", borderRadius: 12, fontWeight: 700, cursor: loading ? "wait" : "pointer",
          }}>
            {loading ? "Claiming..." : `Claim +${REWARDS[streak]} credits`}
          </button>
        )}
        {!canClaim && !claimed && <div style={{ textAlign: "center", color: "#999" }}>Come back tomorrow!</div>}
        {streak >= 7 && !claimed && <div style={{ textAlign: "center", color: "#16a34a", fontWeight: 600 }}>Reward completed!</div>}
      </div>
    </div>,
    document.body
  );
}

function TopBarRight({ onOpenCheckIn }: { onOpenCheckIn: () => void }) {
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
  }, []);

  if (!user) {
    return <button className="btn btn-primary btn-sm" onClick={() => signIn("google")}>Sign in</button>;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        onClick={onOpenCheckIn}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 12px", borderRadius: 999,
          border: "1px solid var(--border)",
          background: canCheckIn ? "var(--mint)" : "var(--paper-raised, #f5f5f5)",
          color: canCheckIn ? "#000" : "var(--text)",
          fontSize: "0.82rem", fontWeight: 600,
          cursor: canCheckIn ? "pointer" : "default",
        }}
      >
        <span>🎁</span>
        <span>{canCheckIn ? "Daily reward" : "Checked in"}</span>
      </button>

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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
              </svg>
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
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <span className="brand-mark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9L12 3Z" />
      </svg>
    </span>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item${open ? " open" : ""}`}>
      <button className="faq-q" type="button" onClick={() => setOpen(!open)}>
        {q}
        <svg className="chev" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className="faq-a" style={{ maxHeight: open ? 500 : 0 }}>
        <p>{a}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const user = session?.user;
  const [checkInOpen, setCheckInOpen] = useState(false);

  const handlePrimaryCta = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      document.getElementById("playground")?.scrollIntoView({ behavior: "smooth" });
    } else {
      signIn("google");
    }
  };

  return (
    <>
      <header className="topbar">
        <div className="shell topbar-in">
          <a className="brand" href="#top">
            <BrandMark />
            Jev Verdict
          </a>
          <nav className="nav">
            <a href="#playground">Playground</a>
            <a href="#types">Question types</a>
            <a href="/pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="topbar-cta">
            <TopBarRight onOpenCheckIn={() => setCheckInOpen(true)} />
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero shell">
          <div className="hero-grid">
            <div>
              <span className="kicker">
                <i /> TypeSafe System One model
              </span>
              <h1>
                Ask about any text.
                <br />
                <em>Get probabilities, not prose.</em>
              </h1>
              <p className="hero-tag">
                One call answers your yes/no, choice and score questions — with
                calibrated confidence.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary" onClick={handlePrimaryCta}>
                  {user ? "Try the playground" : "Start with 5 free runs"}
                </button>
                {!user && (
                  <span className="hero-free-note">
                    No credit card. 5 free runs on sign-up.
                  </span>
                )}
              </div>
            </div>
            <div className="hero-anim-col">
              <HeroAnimation />
            </div>
          </div>
        </section>

        <Playground />

        <section className="types" id="types">
          <div className="shell">
            <div className="section-head">
              <div className="section-eyebrow">Three question types</div>
              <h2>Ask in the shape the answer takes.</h2>
              <p>
                No freeform prompts. Each question declares its type, so Jev
                returns a structured result your code can branch on — every time,
                in the same shape.
              </p>
            </div>
            <div className="types-grid">
              <div className="type-card">
                <div className="ic" style={{ background: "var(--mint)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h3>Yes / No</h3>
                <p>
                  Binary decisions with a calibrated probability. Great for
                  routing, filtering and guardrails.
                </p>
                <div className="ex">
                  <b>Q:</b> Does this ticket need a human reply today?
                  <br />
                  <b>A:</b> Yes · <b style={{ color: "var(--mint)" }}>96%</b>{" "}
                  confidence
                </div>
              </div>
              <div className="type-card">
                <div className="ic" style={{ background: "var(--accent)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
                <h3>Choice</h3>
                <p>
                  Pick from a fixed set of labels. Jev returns every option with
                  a share, so you see the runner-up.
                </p>
                <div className="ex">
                  <b>Q:</b> Which team handles this?
                  <br />
                  <b>A:</b> billing ·{" "}
                  <b style={{ color: "var(--accent)" }}>97%</b> · technical 1% ·
                  sales 1%
                </div>
              </div>
              <div className="type-card">
                <div className="ic" style={{ background: "var(--yellow)" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                  </svg>
                </div>
                <h3>Score</h3>
                <p>
                  A number on a scale you define. Sentiment, severity, fit —
                  anything you can bound.
                </p>
                <div className="ex">
                  <b>Q:</b> How frustrated is the customer? (0–5)
                  <br />
                  <b>A:</b> <b style={{ color: "var(--yellow)" }}>3.0</b> · angry
                  and ready to churn
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="shell">
            <div className="section-head">
              <div className="section-eyebrow">Why teams switch</div>
              <h2>Built for decisions, not chat.</h2>
            </div>
            <div className="feat-grid">
              <div className="feat-card">
                <div className="num">01</div>
                <h3>Typed answers your code trusts</h3>
                <p>
                  No parsing markdown, no JSON-instructions games. Yes/No,
                  Choice and Score come back in a fixed schema every time.
                </p>
              </div>
              <div className="feat-card">
                <div className="num">02</div>
                <h3>Calibrated confidence</h3>
                <p>
                  96% means 96% — Jev is scored against real datasets so
                  probabilities map to actual accuracy.
                </p>
              </div>
              <div className="feat-card">
                <div className="num">03</div>
                <h3>Fast and cheap</h3>
                <p>
                  Sub-second latency at a fraction of frontier model pricing.
                  Built to run on every message, not just the hard cases.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="how">
          <div className="shell">
            <div className="section-head">
              <div className="section-eyebrow">How it works</div>
              <h2>Three steps to a decision.</h2>
            </div>
            <div className="steps">
              <div className="step">
                <div className="n">01</div>
                <h3>Pick a case</h3>
                <p>
                  Start from a scenario template — Upwork proposal, chat
                  triage, content moderation — or a blank state.
                </p>
              </div>
              <div className="step">
                <div className="n">02</div>
                <h3>Paste your text</h3>
                <p>
                  Drop in the message, review, proposal or ticket. Add the
                  questions you want answered on the side.
                </p>
              </div>
              <div className="step">
                <div className="n">03</div>
                <h3>Get structured answers</h3>
                <p>
                  Each question returns a typed result with a confidence
                  number. Branch on it, queue it, or flag for review.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="faq" id="faq">
          <div className="shell">
            <div className="section-head">
              <div className="section-eyebrow">FAQ</div>
              <h2>Questions, answered.</h2>
            </div>
            <div className="faq-list">
              {FAQS.map(([q, a], i) => (
                <FAQItem key={i} q={q} a={a} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="shell foot-in">
          <span>
            Jev is an independent playground for the TypeSafe Jev model. Not
            affiliated with TypeSafe.
          </span>
          <span>
            <a href="/terms" style={{ color: "var(--muted)" }}>Terms</a> ·{" "}
            <a href="/privacy" style={{ color: "var(--muted)" }}>Privacy</a> ·{" "}
            <a href="mailto:dingkai005@gmail.com" style={{ color: "var(--muted)" }}>Contact</a>
          </span>
        </div>
      </footer>

      {checkInOpen && <CheckInModal onClose={() => setCheckInOpen(false)} onClaimed={() => window.dispatchEvent(new Event("credits-updated"))} />}
    </>
  );
}
