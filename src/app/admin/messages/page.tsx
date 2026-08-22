import { desc } from "drizzle-orm";
import { Mail } from "lucide-react";

import { db } from "@/db/client";
import { contactMessages } from "@/db/schema";

import { MessageActions } from "./_components/message-actions-v2";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const statusLabel = {
  unread: "Okunmadı",
  read: "Okundu",
  archived: "Arşiv",
} as const;

export default async function MessagesPage() {
  const messages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(100);

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-7">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Mesajlar</h1>
        <p className="mt-1 text-sm text-[#707581]">
          İletişim formundan gelen talepleri okuyun ve arşivleyin.
        </p>
      </div>

      <section className="overflow-hidden rounded-md border border-[#dde0e5] bg-white">
        {messages.map((message) => (
          <article
            key={message.id}
            className="grid gap-4 border-b border-[#e7e9ec] px-5 py-5 last:border-b-0 md:grid-cols-[42px_1fr_auto]"
          >
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f2f4] text-[#646a75]">
              <Mail className="h-5 w-5" aria-hidden="true" />
              {message.status === "unread" && (
                <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#d40000]" />
              )}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="font-semibold text-[#20232a]">{message.name}</h2>
                <span className="rounded bg-[#f2f3f5] px-2 py-1 text-[10px] text-[#686e79]">
                  {statusLabel[message.status]}
                </span>
                <time className="text-xs text-[#888d97]">{formatDate(message.createdAt)}</time>
              </div>
              <p className="mt-1 text-xs text-[#777c87]">
                {message.email}
                {message.phone ? " · " + message.phone : ""}
              </p>
              {message.subject && (
                <p className="mt-3 text-sm font-medium text-[#343840]">{message.subject}</p>
              )}
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#5d636e]">
                {message.message}
              </p>
            </div>
            <MessageActions id={message.id} status={message.status} />
          </article>
        ))}
        {messages.length === 0 && (
          <div className="px-5 py-20 text-center text-sm text-[#777c87]">
            Henüz iletişim mesajı yok.
          </div>
        )}
      </section>
    </div>
  );
}
