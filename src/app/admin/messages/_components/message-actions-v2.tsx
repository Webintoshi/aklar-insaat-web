"use client";

import { Archive, Mail, MailOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type MessageActionsProps = {
  id: string;
  status: "unread" | "read" | "archived";
};

export function MessageActions({ id, status }: MessageActionsProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function changeStatus(nextStatus: MessageActionsProps["status"]) {
    setPending(true);
    try {
      const response = await fetch("/api/admin/messages/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error("Mesaj durumu güncellenemedi.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => changeStatus(status === "unread" ? "read" : "unread")}
        className="rounded p-2 text-[#656b76] hover:bg-[#f2f3f5] disabled:opacity-50"
        aria-label={status === "unread" ? "Okundu olarak işaretle" : "Okunmadı olarak işaretle"}
      >
        {status === "unread" ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
      </button>
      {status !== "archived" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => changeStatus("archived")}
          className="rounded p-2 text-[#656b76] hover:bg-[#f2f3f5] disabled:opacity-50"
          aria-label="Arşivle"
        >
          <Archive className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
