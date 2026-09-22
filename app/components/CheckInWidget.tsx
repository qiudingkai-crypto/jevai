"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

const REWARDS = [1, 1, 2, 2, 2, 3, 3];

export default function CheckInWidget() {
  const { data: session } = useSession();
  const [streak, setStreak] = useState(0);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [claimed, setClaimed] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/checkin")
      .then((r) => r.json())
      .then((d) => {
        setStreak(d.streak || 0);
        setCanCheckIn(d.canCheckIn || false);
        setCompleted(d.completed || false);
      });
  }, [session]);

  async function handleCheckIn() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      const d = await res.json();
      if (d.reward) {
        setClaimed(d.reward);
        setStreak(d.streak);
        setCanCheckIn(false);
        if (d.streak >= 7) setCompleted(true);
        // Refresh credits display
        window.dispatchEvent(new Event("credits-updated"));
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!session?.user) return null;
  if (completed && !open) return null;

  return (
    <>
      {/* Floating button */}
      {canCheckIn && !open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 100,
            background: "var(--mint, #4ade80)",
            color: "#000",
            border: "none",
            borderRadius: 999,
            padding: "12px 20px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(74, 222, 128, 0.4)",
          }}
        >
          +{REWARDS[streak]} Claim daily reward
        </button>
      )}

      {/* Modal */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1a1a2e",
              borderRadius: 24,
              padding: 32,
              maxWidth: 600,
              width: "100%",
              color: "#fff",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                Welcome Reward
              </h3>
              <p style={{ color: "rgba(255,255,255,0.6)", marginTop: 8 }}>
                Sign in daily to claim credits
              </p>
            </div>

            {/* Claimed reward toast */}
            {claimed !== null && (
              <div style={{
                textAlign: "center",
                marginBottom: 20,
                padding: 12,
                background: "rgba(74, 222, 128, 0.15)",
                borderRadius: 12,
                color: "#4ade80",
                fontWeight: 700,
              }}>
                +{claimed} credits claimed!
              </div>
            )}

            {/* 7-day grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 8,
              marginBottom: 24,
            }}>
              {REWARDS.map((reward, i) => {
                const day = i + 1;
                const claimed = day <= streak;
                const isToday = day === streak + 1 && canCheckIn;
                return (
                  <div
                    key={i}
                    style={{
                      background: claimed
                        ? "rgba(74, 222, 128, 0.15)"
                        : isToday
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(255,255,255,0.05)",
                      border: isToday ? "2px solid #4ade80" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "12px 4px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>Day {day}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: 4 }}>
                      +{reward}
                    </div>
                    <div style={{ fontSize: "0.65rem", opacity: 0.5, marginTop: 2 }}>credits</div>
                    {claimed && (
                      <div style={{ fontSize: "0.7rem", color: "#4ade80", marginTop: 4 }}>✓</div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Claim button */}
            {canCheckIn && (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#4ade80",
                  color: "#000",
                  border: "none",
                  borderRadius: 12,
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: loading ? "wait" : "pointer",
                }}
              >
                {loading ? "Claiming..." : `Claim +${REWARDS[streak]} credits`}
              </button>
            )}
            {!canCheckIn && !completed && (
              <div style={{ textAlign: "center", opacity: 0.5 }}>
                Come back tomorrow!
              </div>
            )}
            {completed && (
              <div style={{ textAlign: "center", color: "#4ade80", fontWeight: 600 }}>
                Welcome reward completed!
              </div>
            )}

            <button
              onClick={() => setOpen(false)}
              style={{
                width: "100%",
                marginTop: 12,
                padding: "10px",
                background: "transparent",
                color: "rgba(255,255,255,0.5)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
