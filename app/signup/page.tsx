"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
      } else {
        await signIn("credentials", { email, password, redirect: false });
        router.push("/");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg, #fafafa)", padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Jev Verdict</h1>
          </Link>
          <p style={{ color: "#888", marginTop: 8 }}>Create your account</p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          style={{
            width: "100%", padding: "12px", borderRadius: 12,
            border: "1px solid #d1d5db", background: "#fff",
            cursor: "pointer", fontSize: "0.95rem", fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            marginBottom: 16,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
          <span style={{ fontSize: "0.8rem", color: "#999" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "#e5e5e5" }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
<input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: "12px", borderRadius: 12, border: "1px solid #d1d5db", background: "#fff",
              fontSize: "0.95rem", outline: "none",
            }}
          />
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              padding: "12px", borderRadius: 12, border: "1px solid #d1d5db", background: "#fff",
              fontSize: "0.95rem", outline: "none",
            }}
          />
          {error && <div style={{ color: "#e53e3e", fontSize: "0.85rem" }}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px", borderRadius: 12, border: "none",
              background: "#000", color: "#fff", fontSize: "0.95rem", fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
            }}
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.9rem", color: "#666" }}>
          Already have an account?{" "}
          <Link href="/signin" style={{ color: "#000", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
