import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — Jev Verdict",
  description: "Terms of Service for Jev Verdict.",
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

export default function TermsPage() {
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
              Try now
            </Link>
          </div>
        </div>
      </header>

      <main className="shell" style={{ maxWidth: 760, padding: "48px 24px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 32 }}>
          Last updated: September 21, 2026
        </p>

        <div style={{ lineHeight: 1.75, fontSize: "0.95rem", color: "var(--ink-2)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>1. Acceptance of Terms</h2>
          <p>By accessing or using Jev Verdict ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>2. Description of Service</h2>
          <p>Jev Verdict provides an AI-powered decision-making tool that analyzes text and returns structured answers (yes/no, choice, and score) with calibrated confidence scores. The Service is built on the TypeSafe System One model.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>3. Accounts</h2>
          <p>You may sign in using your Google account. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>4. Free Tier and Paid Plans</h2>
          <p>New users receive 5 free runs upon sign-up. Additional runs require a paid subscription. Pricing details are available on our <Link href="/pricing" style={{ color: "var(--accent)" }}>Pricing page</Link>.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>5. Subscriptions and Auto-Renewal</h2>
          <p>Paid plans are billed annually. Your subscription will automatically renew at the end of each billing period on the same date, unless you cancel it before the renewal date. You will be charged the then-current annual price on each renewal. You can cancel auto-renewal at any time from your account settings or by contacting us; you will retain access to the Service for the remainder of the prepaid period.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>6. Cancellations and Refunds</h2>
          <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period; no partial or pro-rata refunds are provided for cancellations mid-period. If you believe you have been charged in error, please contact us within 7 days of the charge with the details of the transaction. Refund requests are reviewed on a case-by-case basis. We do not offer refunds for unused time on subscriptions that have been active for more than 7 days.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>7. Acceptable Use</h2>
          <p>You agree not to use the Service to:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Generate content that is unlawful, harmful, or deceptive</li>
            <li>Infringe on the rights of others</li>
            <li>Attempt to reverse engineer or abuse the Service</li>
            <li>Use the Service to make high-stakes decisions without human review</li>
          </ul>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>8. AI Output Disclaimer</h2>
          <p>Jev Verdict returns AI-generated results that may be inaccurate or misleading. You are solely responsible for verifying any decisions made using the Service. The Service should not be used as a substitute for professional judgment.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>9. Intellectual Property</h2>
          <p>The Service, including its design, text, and software, is owned by Jev Verdict. You retain ownership of the content you submit to the Service.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>10. Limitation of Liability</h2>
          <p>The Service is provided "as is" without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>11. Changes to Terms</h2>
          <p>We may update these Terms from time to time. We will notify users of material changes by updating the "Last updated" date at the top of this page.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>12. Contact</h2>
          <p>For questions about these Terms, billing, or refunds, please contact us at <a href="mailto:dingkai005@gmail.com" style={{ color: "var(--accent)" }}>dingkai005@gmail.com</a>.</p>
        </div>
      </main>

      <footer>
        <div className="shell foot-in">
          <span>Jev Verdict — Built for decisions. Still review the hard ones.</span>
          <span>
            <Link href="/terms" style={{ color: "var(--muted)" }}>Terms</Link> ·{" "}
            <Link href="/privacy" style={{ color: "var(--muted)" }}>Privacy</Link> ·{" "}
            <a href="mailto:dingkai005@gmail.com" style={{ color: "var(--muted)" }}>Contact</a>
          </span>
        </div>
      </footer>
    </>
  );
}
