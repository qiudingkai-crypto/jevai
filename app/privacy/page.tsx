import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Jev Verdict",
  description: "Privacy Policy for Jev Verdict.",
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

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: 32 }}>
          Last updated: September 21, 2026
        </p>

        <div style={{ lineHeight: 1.75, fontSize: "0.95rem", color: "var(--ink-2)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>1. Information We Collect</h2>
          <p>When you use Jev Verdict, we collect the following information:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>Account information:</strong> Your name, email address, and profile photo from your Google account when you sign in.</li>
            <li><strong>Usage data:</strong> The text you submit, questions you ask, model responses, and timestamps of your API calls.</li>
            <li><strong>Technical data:</strong> Basic log information such as IP address, browser type, and pages visited for security and debugging purposes.</li>
          </ul>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Provide, maintain, and improve the Service</li>
            <li>Authenticate users and track free/paid usage</li>
            <li>Debug and troubleshoot technical issues</li>
            <li>Send service-related notifications</li>
          </ul>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>3. How We Share Information</h2>
          <p>We do not sell your personal information. We may share information with:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>Service providers:</strong> Google (OAuth authentication), TypeSafe (model inference), Vercel (hosting), and Neon (database hosting) — only as necessary to operate the Service.</li>
            <li><strong>Legal requirements:</strong> When required by law or to protect our rights.</li>
          </ul>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>4. Data Storage and Security</h2>
          <p>Your data is stored on secure servers provided by our hosting providers. We use industry-standard security measures including HTTPS encryption and database access controls. However, no method of transmission over the Internet is 100% secure.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>5. Data Retention</h2>
          <p>We retain your account information and usage records for as long as your account remains active. You may request deletion of your account and associated data by contacting us.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt out of non-essential communications</li>
          </ul>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>7. Cookies</h2>
          <p>We use essential cookies for authentication sessions. We do not use third-party tracking cookies.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify users of material changes by updating the "Last updated" date at the top of this page.</p>

          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: 32, marginBottom: 12, color: "var(--ink)" }}>9. Contact</h2>
          <p>For privacy-related questions, please contact us at dingkai005@gmail.com.</p>
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
