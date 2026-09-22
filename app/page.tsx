"use client";

import { useState } from "react";
import HeroAnimation from "./components/HeroAnimation";
import Playground from "./components/Playground";
import CheckInWidget from "./components/CheckInWidget";
import { FAQS } from "@/lib/scenarios";
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
            {user ? (
              <div className="user-menu">
                {user.image ? (
                  <img src={user.image} alt="" className="user-avatar" referrerPolicy="no-referrer" />
                ) : (
                  <span className="user-avatar user-avatar-fallback">{user.name?.[0] || "U"}</span>
                )}
                <span className="user-name">{user.name || user.email}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => signOut()}>
                  Sign out
                </button>
              </div>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => signIn("google")}>
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="top">
        {/* hero */}
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

        {/* question types */}
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

        {/* features */}
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

        {/* how it works */}
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

        {/* FAQ */}
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
      <CheckInWidget />
    </>
  );
}
