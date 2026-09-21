import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Successful — Jev Verdict",
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

export default function SuccessPage() {
  return (
    <>
      <header className="topbar">
        <div className="shell topbar-in">
          <Link className="brand" href="/">
            <BrandMark />
            Jev Verdict
          </Link>
        </div>
      </header>
      <main className="shell" style={{ maxWidth: 600, margin: "80px auto", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--mint)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a7c5a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8 }}>Payment Successful!</h1>
        <p style={{ color: "var(--muted)", marginBottom: 32 }}>
          Thanks for upgrading. Your Pro plan is now active — enjoy unlimited runs.
        </p>
        <Link href="/" className="btn btn-primary">
          Go to Playground
        </Link>
      </main>
    </>
  );
}
