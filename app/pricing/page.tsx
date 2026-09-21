"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

const TIERS = [
  {
    key: "creator",
    name: "Creator",
    price: "$9.9",
    period: "/ year",
    highlight: false,
    productId: "PROD_0QcN4J6nShFWox3sFiuyFY",
    desc: "For solo creators running Jev in their own workflow.",
    features: [
      "Unlimited playground runs",
      "All 3 question types",
      "Saved scenarios",
      "Email support",
    ],
  },
  {
    key: "studio",
    name: "Studio",
    price: "$29.9",
    period: "/ year",
    highlight: true,
    badge: "Most popular",
    productId: "PROD_0QcN4J6nShFWox3sFiuyFY", // TODO: replace with Studio product ID
    desc: "For teams evaluating proposals and candidates at scale.",
    features: [
      "Everything in Creator",
      "Batch evaluation",
      "Priority support",
      "API access",
    ],
  },
  {
    key: "max",
    name: "Max",
    price: "$49.9",
    period: "/ year",
    highlight: false,
    productId: "PROD_0QcN4J6nShFWox3sFiuyFY", // TODO: replace with Max product ID
    desc: "For power users who need Jev everywhere in their pipeline.",
    features: [
      "Everything in Studio",
      "Advanced analytics",
      "Dedicated support",
      "Custom integrations",
    ],
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
              <h2>Start free. Scale when you are.</h2>
              <p>
                No credit card required. Run Jev five times free, then decide
                whether it belongs in your pipeline.
              </p>
            </div>
            <div className="price-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {TIERS.map((tier) => (
                <div key={tier.key} className={`price-card${tier.highlight ? " hl" : ""}`}>
                  {tier.badge && (
                    <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--mint)", marginBottom: 8 }}>
                      {tier.badge}
                    </div>
                  )}
                  <div className="tier">{tier.name}</div>
                  <div className="price">
                    {tier.price} <small>{tier.period}</small>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                    {tier.desc}
                  </p>
                  <ul>
                    {tier.features.map((f) => (
                      <li key={f}><CheckIcon /> {f}</li>
                    ))}
                  </ul>
                  <button
                    className={tier.highlight ? "btn btn-primary" : "btn btn-ghost"}
                    onClick={() => handleCheckout(tier.productId, tier.key)}
                    disabled={loading !== null}
                    style={{ width: "100%" }}
                  >
                    {loading === tier.key ? "Redirecting…" : `Choose ${tier.name}`}
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
          <span>Built for decisions. Still review the hard ones.</span>
        </div>
      </footer>
    </>
  );
}
