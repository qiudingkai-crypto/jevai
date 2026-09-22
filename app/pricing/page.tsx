"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

const CREDIT_PACKS = [
  {
    key: "credits_500",
    name: "Starter Pack",
    price: "$4.9",
    period: "one-time",
    productId: "PROD_4NE6mzBEIlp3qttwrY7SXz",
    desc: "500 runs, never expire.",
    runs: 500,
  },
  {
    key: "credits_1000",
    name: "Pro Pack",
    price: "$9.9",
    period: "one-time",
    highlight: true,
    badge: "Best value",
    productId: "PROD_4Qj3FxHBiSgC3WiwLxEZmh",
    desc: "1,000 runs, never expire.",
    runs: 1000,
  },
];

function BrandMark() {
  return (
    <span className="brand-mark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.1L5 10l5.1 1.9L12 17l1.9-5.1L19 10l-5.1-1.9L12 3Z" />
      </svg>
    </span>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function PricingPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(productId: string, tierKey: string) {
    if (!session?.user) {
      signIn("google");
      return;
    }
    setLoading(tierKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Failed to create checkout");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="shell topbar-in">
          <Link className="brand" href="/">
            <BrandMark />
            Jev Verdict
          </Link>
          <nav className="nav">
            <Link href="/#playground">Playground</Link>
            <Link href="/#types">Question types</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/#faq">FAQ</Link>
          </nav>
          <div className="topbar-cta">
            <Link className="btn btn-primary btn-sm" href="/#playground">
              Try Jev free
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="section" style={{ paddingTop: 64 }}>
          <div className="shell">
            <div className="section-head">
              <div className="section-eyebrow">Pricing</div>
              <h2>Start free. Buy credits when you need them.</h2>
              <p>
                5 free runs on sign-up. Then buy credit packs — no subscription, no expiry.
              </p>
            </div>

            <div className="price-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)", maxWidth: 700, margin: "0 auto" }}>
              {CREDIT_PACKS.map((pack) => (
                <div key={pack.key} className={`price-card${pack.highlight ? " hl" : ""}`}>
                  {pack.badge && (
                    <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--mint)", marginBottom: 8 }}>
                      {pack.badge}
                    </div>
                  )}
                  <div className="tier">{pack.name}</div>
                  <div className="price">
                    {pack.price} <small>{pack.period}</small>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                    {pack.desc}
                  </p>
                  <ul>
                    <li><CheckIcon /> {pack.runs} runs total</li>
                    <li><CheckIcon /> Never expire</li>
                    <li><CheckIcon /> Use anytime</li>
                  </ul>
                  <button
                    className={pack.highlight ? "btn btn-primary" : "btn btn-ghost"}
                    onClick={() => handleCheckout(pack.productId, pack.key)}
                    disabled={loading !== null}
                    style={{ width: "100%" }}
                  >
                    {loading === pack.key ? "Redirecting…" : `Buy ${pack.name}`}
                  </button>
                </div>
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
          <span><a href="/terms" style={{ color: "var(--muted)" }}>Terms</a> ·{" "}<a href="/privacy" style={{ color: "var(--muted)" }}>Privacy</a> ·{" "}<a href="mailto:dingkai005@gmail.com" style={{ color: "var(--muted)" }}>Contact</a></span>
        </div>
      </footer>
    </>
  );
}
