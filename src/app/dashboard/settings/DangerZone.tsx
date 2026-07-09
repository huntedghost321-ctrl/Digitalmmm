"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DangerZone() {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const deleteAccount = async () => {
    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: confirmText }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message ?? "Something went wrong.");
        return;
      }
      if (data.deleted) {
        router.push("/");
        router.refresh();
      } else {
        setMessage(data.message);
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <a
        href="/api/account/export"
        className="inline-block rounded border border-teal px-4 py-2 text-sm font-medium text-teal hover:bg-teal hover:text-paper"
      >
        Export all my data (JSON)
      </a>

      <details className="rounded border border-red-200 bg-red-50/50 p-4">
        <summary className="cursor-pointer text-sm font-medium text-red-800">
          Delete my account and all data
        </summary>
        <p className="mt-2 text-xs text-red-900/80">
          This permanently removes your account, products, versions, exports and
          notifications. Type <strong>DELETE</strong> to confirm.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-32 rounded border border-red-300 bg-white px-3 py-1.5 font-mono text-sm outline-none"
          />
          <button
            onClick={deleteAccount}
            disabled={confirmText !== "DELETE" || deleting}
            className="rounded bg-red-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete permanently"}
          </button>
        </div>
        {message && <p className="mt-3 text-xs text-red-900">{message}</p>}
      </details>
    </div>
  );
}
