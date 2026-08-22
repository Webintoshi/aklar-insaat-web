import { count, desc, eq, sql } from "drizzle-orm";
import {
  ArrowRight,
  Cloud,
  Database,
  FileImage,
  Folder,
  Mail,
  Plus,
} from "lucide-react";
import Link from "next/link";

import { db } from "@/db/client";
import { auditLogs, contactMessages, mediaAssets, projects } from "@/db/schema";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function completionFor(project: {
  publicationStatus: "draft" | "published" | "archived";
  constructionStage: "ongoing" | "completed" | null;
  shortDescription: string | null;
  longDescription: string | null;
  city: string | null;
}) {
  if (project.publicationStatus !== "draft") return 100;
  const completed = [
    project.constructionStage,
    project.shortDescription,
    project.longDescription,
    project.city,
  ].filter(Boolean).length;
  return Math.max(10, Math.round((completed / 5) * 100));
}

async function getDashboardData() {
  const [
    [projectCount],
    [mediaCount],
    [unreadCount],
    [mediaStorage],
    recentProjects,
    recentMessages,
    recentActivity,
  ] = await Promise.all([
    db.select({ value: count() }).from(projects),
    db.select({ value: count() }).from(mediaAssets).where(eq(mediaAssets.status, "active")),
    db
      .select({ value: count() })
      .from(contactMessages)
      .where(eq(contactMessages.status, "unread")),
    db
      .select({
        value: sql<number>`coalesce(sum(${mediaAssets.sizeBytes}), 0)::float8`,
      })
      .from(mediaAssets)
      .where(eq(mediaAssets.status, "active")),
    db
      .select({
        id: projects.id,
        name: projects.name,
        publicationStatus: projects.publicationStatus,
        constructionStage: projects.constructionStage,
        shortDescription: projects.shortDescription,
        longDescription: projects.longDescription,
        city: projects.city,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .orderBy(desc(projects.updatedAt))
      .limit(5),
    db
      .select({
        id: contactMessages.id,
        name: contactMessages.name,
        subject: contactMessages.subject,
        message: contactMessages.message,
        status: contactMessages.status,
        createdAt: contactMessages.createdAt,
      })
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(5),
    db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(5),
  ]);

  return {
    projectCount: projectCount.value,
    mediaCount: mediaCount.value,
    unreadCount: unreadCount.value,
    mediaBytes: Number(mediaStorage.value),
    recentProjects,
    recentMessages,
    recentActivity,
  };
}

const statusLabels = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşiv",
} as const;

function statusClass(status: keyof typeof statusLabels) {
  if (status === "published") return "bg-[#e4f7ea] text-[#19713b]";
  if (status === "archived") return "border border-[#d7d9de] text-[#555b66]";
  return "bg-[#f0f1f3] text-[#656b76]";
}

export default async function AdminDashboard() {
  const data = await getDashboardData();
  const storageGb = data.mediaBytes / 1024 / 1024 / 1024;
  const metrics = [
    {
      label: "Toplam Proje",
      value: data.projectCount.toLocaleString("tr-TR"),
      detail: "Taslak, yayında ve arşiv",
      icon: Folder,
    },
    {
      label: "Toplam Medya",
      value: data.mediaCount.toLocaleString("tr-TR"),
      detail: "Cloudflare R2 üzerinde",
      icon: FileImage,
    },
    {
      label: "Veritabanı Durumu",
      value: "Sağlıklı",
      detail: "PostgreSQL bağlantısı",
      icon: Database,
    },
    {
      label: "Okunmamış Mesaj",
      value: data.unreadCount.toLocaleString("tr-TR"),
      detail: "İletişim kutusunda",
      icon: Mail,
    },
  ];

  return (
    <div className="mx-auto max-w-[1320px]">
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em] text-[#111318]">
            Genel Bakış
          </h1>
          <p className="mt-1 text-sm text-[#6d727e]">
            Site içeriğinizi yönetin ve performansınızı takip edin.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex h-11 items-center justify-center gap-2.5 self-start rounded-md bg-[#d40000] px-6 text-sm font-semibold text-white transition hover:bg-[#b90000]"
        >
          <Plus className="h-[18px] w-[18px]" aria-hidden="true" />
          Yeni Proje Ekle
        </Link>
      </div>

      <section
        aria-label="Özet"
        className="grid overflow-hidden rounded-md border border-[#dde0e5] bg-white sm:grid-cols-2 xl:grid-cols-4"
      >
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex min-h-[114px] items-center gap-5 border-b border-r border-[#e1e3e7] px-5 py-5 last:border-r-0"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[#d40000]">
              <metric.icon className="h-6 w-6 stroke-[1.7]" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#747985]">{metric.label}</p>
              <p className="mt-1 text-[25px] font-medium leading-none tracking-[-0.02em]">
                {metric.value}
              </p>
              <p className="mt-2 truncate text-xs text-[#848995]">{metric.detail}</p>
            </div>
          </div>
        ))}
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <section className="overflow-hidden rounded-md border border-[#dde0e5] bg-white">
          <div className="flex h-14 items-center justify-between border-b border-[#e1e3e7] px-5">
            <h2 className="text-[15px] font-semibold">Son Projeler</h2>
            <Link href="/admin/projects" className="text-xs font-medium text-[#d40000]">
              Tüm Projeler <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left">
              <thead>
                <tr className="h-9 border-b border-[#e8e9ec] text-[11px] font-medium text-[#777c87]">
                  <th className="px-5">Proje Adı</th>
                  <th>Durum</th>
                  <th>Tamamlanma</th>
                  <th className="pr-5">Son Güncelleme</th>
                </tr>
              </thead>
              <tbody>
                {data.recentProjects.map((project) => {
                  const completion = completionFor(project);
                  return (
                    <tr
                      key={project.id}
                      className="h-[58px] border-b border-[#eceef1] text-[12px] last:border-b-0"
                    >
                      <td className="px-5 font-medium text-[#272a31]">{project.name}</td>
                      <td>
                        <span className={["rounded px-2.5 py-1 text-[11px]", statusClass(project.publicationStatus)].join(" ")}>
                          {statusLabels[project.publicationStatus]}
                        </span>
                      </td>
                      <td className="w-36">
                        <span className="text-[#4f5560]">{completion}%</span>
                        <span className="mt-1 block h-[3px] w-24 overflow-hidden rounded bg-[#e6e8eb]">
                          <span
                            className={project.publicationStatus === "published" ? "block h-full rounded bg-[#178342]" : "block h-full rounded bg-[#7c828c]"}
                            style={{ width: String(completion) + "%" }}
                          />
                        </span>
                      </td>
                      <td className="pr-5 text-[#6f7480]">{formatDate(project.updatedAt)}</td>
                    </tr>
                  );
                })}
                {data.recentProjects.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-[#777c87]">
                      Henüz proje yok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-4">
          <section className="rounded-md border border-[#dde0e5] bg-white">
            <div className="flex h-14 items-center justify-between border-b border-[#e1e3e7] px-5">
              <h2 className="text-[15px] font-semibold">Son Mesajlar</h2>
              <Link href="/admin/messages" className="text-xs font-medium text-[#d40000]">
                Tüm Mesajlar <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="px-5">
              {data.recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex min-h-[52px] items-center gap-3 border-b border-[#eceef1] py-2 last:border-b-0"
                >
                  <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f1f2f4] text-[#747a85]">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    {message.status === "unread" && (
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#d40000]" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{message.name}</p>
                    <p className="truncate text-[11px] text-[#777c87]">
                      {message.subject || message.message}
                    </p>
                  </div>
                  <time className="whitespace-nowrap text-[10px] text-[#888d97]">
                    {formatDate(message.createdAt)}
                  </time>
                </div>
              ))}
              {data.recentMessages.length === 0 && (
                <p className="py-10 text-center text-sm text-[#777c87]">Henüz mesaj yok.</p>
              )}
            </div>
          </section>

          <section className="rounded-md border border-[#dde0e5] bg-white">
            <div className="flex h-14 items-center border-b border-[#e1e3e7] px-5">
              <h2 className="text-[15px] font-semibold">Son Aktiviteler</h2>
            </div>
            <div className="px-5 py-3">
              {data.recentActivity.map((activity, index) => (
                <div key={activity.id} className="relative flex gap-3 pb-4 text-[11px] last:pb-0">
                  {index < data.recentActivity.length - 1 && (
                    <span className="absolute left-[3px] top-2 h-full w-px bg-[#e3e5e8]" />
                  )}
                  <span className={index === 0 ? "relative mt-1 h-[7px] w-[7px] shrink-0 rounded-full bg-[#d40000]" : "relative mt-1 h-[7px] w-[7px] shrink-0 rounded-full bg-[#aeb3bc]"} />
                  <p className="min-w-0 flex-1 truncate text-[#5f6570]">
                    {activity.entityType} · {activity.action}
                  </p>
                  <time className="whitespace-nowrap text-[#8a8f99]">
                    {formatDate(activity.createdAt)}
                  </time>
                </div>
              ))}
              {data.recentActivity.length === 0 && (
                <p className="py-7 text-center text-sm text-[#777c87]">Henüz aktivite yok.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:max-w-[750px]">
        <StatusPanel
          title="Cloudflare R2 Depolama"
          label="Kullanılan Alan"
          value={storageGb.toFixed(2) + " GB"}
          href="/admin/media"
          linkLabel="Medya Merkezi’ne Git"
          icon={Cloud}
        />
        <StatusPanel
          title="PostgreSQL Bağlantısı"
          label="Durum"
          value="Sağlıklı"
          href="/admin/settings"
          linkLabel="Ayarlara Git"
          icon={Database}
          healthy
        />
      </div>
    </div>
  );
}

function StatusPanel({
  title,
  label,
  value,
  href,
  linkLabel,
  icon: Icon,
  healthy = false,
}: {
  title: string;
  label: string;
  value: string;
  href: string;
  linkLabel: string;
  icon: typeof Cloud;
  healthy?: boolean;
}) {
  return (
    <section className="rounded-md border border-[#dde0e5] bg-white px-5 py-5">
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <div className="mt-5 flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-[#d40000]">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs text-[#777c87]">{label}</p>
          <p className={healthy ? "text-xl font-medium text-[#168343]" : "text-xl font-medium"}>
            {value}
          </p>
        </div>
      </div>
      <Link
        href={href}
        className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-[#d40000]"
      >
        {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </section>
  );
}
