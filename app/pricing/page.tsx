import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Jev Verdict",
  description: "Start free with 5 runs. Pro plan coming soon.",
};

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
            <Link className="btn btn-ghost btn-sm" href="/">
              Sign in
            </Link>
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
            <div className="price-grid">
              <div className="price-card">
                <div className="tier">Start</div>
                <div className="price">Free</div>
                <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                  Try the playground before you commit.
                </p>
                <ul>
                  <li><CheckIcon /> 5 free runs</li>
                  <li><CheckIcon /> All question types</li>
                  <li><CheckIcon /> Every scenario template</li>
                </ul>
                <Link className="btn btn-ghost" href="/#playground" style={{ width: "100%" }}>
                  Try free
                </Link>
              </div>
              <div className="price-card hl">
                <div className="tier">Pro</div>
                <div className="price">
                  Pro <small>· coming soon</small>
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                  For people who need more than the free tier.
                </p>
                <ul>
                  <li><CheckIcon /> Unlimited runs</li>
                  <li><CheckIcon /> Saved scenarios &amp; history</li>
                  <li><CheckIcon /> Priority support</li>
                </ul>
                <Link className="btn btn-primary" href="/#playground" style={{ width: "100%" }}>
                  Start building
                </Link>
              </div>
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
