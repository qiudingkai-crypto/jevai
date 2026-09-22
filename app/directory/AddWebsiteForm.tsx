"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AddWebsiteForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    try {
      const response = await fetch("/api/directory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          url: data.get("url"),
          iconUrl: data.get("iconUrl"),
          description: data.get("description"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || "Failed to add website.");
        return;
      }
      form.reset();
      setOpen(false);
      router.push(`/directory?page=${result.page}`);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.addArea}>
      <button className="btn btn-primary btn-sm" type="button" onClick={() => { setOpen(!open); setError(""); }}>
        {open ? "Cancel" : "+ Add website"}
      </button>
      {open && (
        <form className={styles.addForm} onSubmit={onSubmit}>
          <label>Name<input name="name" required maxLength={100} placeholder="e.g. Jev Search" /></label>
          <label>URL<input name="url" type="url" required placeholder="https://example.com/" /></label>
          <label>Icon URL (optional)<input name="iconUrl" type="url" placeholder="https://example.com/favicon.ico" /></label>
          <label>Description<textarea name="description" required maxLength={280} rows={3} placeholder="What does this app do?" /></label>
          {error && <p className={styles.formError} role="alert">{error}</p>}
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>{saving ? "Saving…" : "Add website"}</button>
        </form>
      )}
    </div>
  );
}
