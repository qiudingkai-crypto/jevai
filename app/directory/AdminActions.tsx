"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function AdminActions({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(`/api/directory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          url: data.get("url"),
          iconUrl: data.get("iconUrl") || null,
          description: data.get("description"),
        }),
      });
      if (!res.ok) {
        const r = await res.json();
        setError(r.error || "Failed to save.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/directory/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const r = await res.json();
        alert(r.error || "Failed to delete.");
        return;
      }
      router.refresh();
    } catch {
      alert("Network error.");
    }
  }

  if (editing) {
    return (
      <form className={styles.editForm} onSubmit={onSave}>
        <label>Name<input name="name" required maxLength={100} defaultValue={name} /></label>
        <label>URL<input name="url" type="url" required defaultValue={window.location.href} /></label>
        <label>Icon URL (optional)<input name="iconUrl" type="url" /></label>
        <label>Description<textarea name="description" required maxLength={280} rows={2} /></label>
        {error && <p className={styles.formError}>{error}</p>}
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn btn-primary btn-sm" type="submit" disabled={saving}>Save</button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className={styles.adminBar}>
      <button className={styles.adminBtn} onClick={() => setEditing(true)}>Edit</button>
      <button className={styles.adminBtnDanger} onClick={onDelete}>Delete</button>
    </div>
  );
}
