import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";

import postgres from "postgres";

import {
  inferMimeType,
  normalizeLegacyR2Content,
  normalizeConstructionStage,
  normalizePublicationStatus,
  r2ObjectKeyFromLegacyUrl,
} from "../src/lib/migration/supabase-transform";

type Row = Record<string, unknown>;
type MappedMedia = Row & {
  id: string;
  objectKey: string;
  category: string;
  projectId: string;
};
type Report = {
  startedAt: string;
  dryRun: boolean;
  sourceRows: Record<string, number>;
  targetRows: Record<string, number>;
  projectSlugs: string[];
  media: { converted: number; skipped: string[]; keys: string[] };
  warnings: string[];
};

const sourceUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const sourceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const targetUrl = process.env.DATABASE_URL;
const dryRun = process.argv.includes("--dry-run");
if (!sourceUrl || !sourceKey) throw new Error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY zorunludur.");
if (!targetUrl && !dryRun) throw new Error("DATABASE_URL zorunludur (veya --dry-run kullanın).");

const report: Report = { startedAt: new Date().toISOString(), dryRun, sourceRows: {}, targetRows: {}, projectSlugs: [], media: { converted: 0, skipped: [], keys: [] }, warnings: [] };

async function sourceTable(table: string): Promise<Row[]> {
  const rows: Row[] = [];
  for (let offset = 0; ; offset += 1000) {
    const response = await fetch(`${sourceUrl}/rest/v1/${table}?select=*`, {
      headers: { apikey: sourceKey!, Authorization: `Bearer ${sourceKey}`, Range: `${offset}-${offset + 999}`, Prefer: "count=exact" },
    });
    if (response.status === 404 || response.status === 400) {
      report.warnings.push(`${table}: kaynak tablo bulunamadı veya okunamadı (${response.status}).`);
      return [];
    }
    if (!response.ok) throw new Error(`${table} okunamadı: ${response.status} ${await response.text()}`);
    const page = (await response.json()) as Row[];
    rows.push(...page);
    if (page.length < 1000) break;
  }
  report.sourceRows[table] = rows.length;
  return rows;
}

function text(value: unknown, fallback: string | null = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function dateValue(value: unknown) {
  return typeof value === "string" && value ? new Date(value) : new Date();
}

function contentWithoutMeta(row: Row) {
  return Object.fromEntries(Object.entries(row).filter(([key]) => !["created_at", "updated_at", "is_active", "order_index"].includes(key)));
}

function parseUnits(value: unknown) {
  const source = text(value, "")!;
  const matches = [...source.matchAll(/(\d+\+\d+)\D{0,20}(\d{2,4})(?:\s*[-–]\s*(\d{2,4}))?/g)];
  return matches.map((match, index) => ({ label: match[1], areaMin: Number(match[2]), areaMax: Number(match[3] || match[2]), position: index }));
}

async function main() {
  const [projectRows, mediaRowsPrimary, imageRows, pages, messages, heroSections, heroBanners, aboutSections, videoSections, infoSections, infoCards, footers, settings, widgetConfigs, legacyAgents] = await Promise.all([
    sourceTable("projects"), sourceTable("project_media"), sourceTable("project_images"), sourceTable("pages"), sourceTable("contact_messages"), sourceTable("hero_sections"), sourceTable("hero_banners"), sourceTable("about_sections"), sourceTable("video_sections"), sourceTable("info_cards_sections"), sourceTable("info_cards"), sourceTable("footer_settings"), sourceTable("site_settings"), sourceTable("whatsapp_widget_config"), sourceTable("whatsapp_agents"),
  ]);

  const mediaRows = mediaRowsPrimary.length ? mediaRowsPrimary : imageRows;
  report.projectSlugs = projectRows.map((row) => text(row.slug, "")!).filter(Boolean).sort();
  const mappedMedia = mediaRows.flatMap((row): MappedMedia[] => {
    const legacyUrl = row.url ?? row.image_url ?? row.r2_key;
    const objectKey = r2ObjectKeyFromLegacyUrl(row.r2_key ?? legacyUrl);
    if (!objectKey) { report.media.skipped.push(String(legacyUrl ?? row.id ?? "bilinmeyen")); return []; }
    report.media.converted += 1; report.media.keys.push(objectKey);
    const oldCategory = text(row.category ?? row.image_type, "exterior");
    const category = oldCategory === "about" ? "cover" : (["cover", "exterior", "interior", "location"].includes(oldCategory!) ? oldCategory! : "exterior");
    return [{ ...row, id: text(row.id, randomUUID())!, objectKey, category, projectId: text(row.project_id, "")! }];
  });

  const sections: Array<{ key: string; name: string; row?: Row; content?: Row }> = [];
  const latest = (rows: Row[]) => rows.filter((row) => row.is_active !== false).sort((a, b) => dateValue(b.updated_at).getTime() - dateValue(a.updated_at).getTime())[0];
  const hero = latest(heroSections);
  if (hero) sections.push({ key: "hero", name: "Ana Sayfa Hero", content: normalizeLegacyR2Content({ ...contentWithoutMeta(hero), slider_images: heroBanners.filter((row) => row.is_active !== false).sort((a, b) => Number(a.order_index || 0) - Number(b.order_index || 0)).map((row) => ({ id: row.id, image: row.desktop_image, mobile_image: row.mobile_image, title: row.title, cta_text: row.button_text, cta_link: row.button_link })) }) as Row });
  const about = latest(aboutSections); if (about) sections.push({ key: "about", name: "Hakkımızda", content: normalizeLegacyR2Content(contentWithoutMeta(about)) as Row, row: about });
  const video = latest(videoSections); if (video) sections.push({ key: "video", name: "Tanıtım Videosu", content: normalizeLegacyR2Content(contentWithoutMeta(video)) as Row, row: video });
  const info = latest(infoSections); if (info) sections.push({ key: "info_cards", name: "Bilgi Kartları", content: normalizeLegacyR2Content({ ...contentWithoutMeta(info), cards: infoCards.filter((row) => row.section_id === info.id).sort((a, b) => Number(a.order_index || 0) - Number(b.order_index || 0)).map(contentWithoutMeta) }) as Row });
  const footer = latest(footers); if (footer) sections.push({ key: "footer", name: "Alt Bilgi", content: normalizeLegacyR2Content(contentWithoutMeta(footer)) as Row, row: footer });

  if (dryRun) {
    report.targetRows = { projects: projectRows.length, media_assets: mappedMedia.length, project_media: mappedMedia.length, content_pages: pages.length, contact_messages: messages.length, site_sections: sections.length, site_settings: settings.length, whatsapp_agents: Math.max(legacyAgents.length, widgetConfigs.length ? 1 : 0) };
    return;
  }

  const sql = postgres(targetUrl!, { max: 1, prepare: false });
  try {
    await sql.begin(async (tx) => {
      for (const row of projectRows) {
        const id = text(row.id, randomUUID())!; const slug = text(row.slug, `proje-${id.slice(0, 8)}`)!; const publicationStatus = normalizePublicationStatus(row.status, row.is_published); const stage = normalizeConstructionStage(row.project_status ?? row.construction_stage ?? row.status);
        await tx`INSERT INTO projects (id,name,slug,project_type,publication_status,construction_stage,short_description,long_description,completion_date,city,district,neighborhood,address,maps_url,video_url,seo_title,seo_description,version,published_at,created_at,updated_at) VALUES (${id},${text(row.name ?? row.title, "Adsız Proje")},${slug},${text(row.project_type, "housing")},${publicationStatus},${stage},${text(row.description ?? row.short_description ?? row.about_text)},${text(row.long_description ?? row.about_text ?? row.location_description)},${text(row.completion_date)},${text(row.city, "Ordu")},${text(row.district)},${text(row.neighborhood)},${text(row.address ?? row.location)},${text(row.maps_url)},${text(row.video_url)},${text(row.meta_title)},${text(row.meta_desc ?? row.meta_description)},1,${publicationStatus === "published" ? dateValue(row.updated_at) : null},${dateValue(row.created_at)},${dateValue(row.updated_at)}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, publication_status=EXCLUDED.publication_status, updated_at=EXCLUDED.updated_at`;
        for (const unit of parseUnits(row.apartment_options)) await tx`INSERT INTO project_unit_types (project_id,label,area_min,area_max,position) VALUES (${id},${unit.label},${unit.areaMin},${unit.areaMax},${unit.position}) ON CONFLICT DO NOTHING`;
      }
      for (const row of mappedMedia) {
        const size = Math.max(1, Math.min(20 * 1024 * 1024, Number(row.file_size || 1))); const originalName = text(row.file_name, row.objectKey.split("/").pop() || "legacy-media")!;
        await tx`INSERT INTO media_assets (id,object_key,original_name,mime_type,size_bytes,width,height,status,activated_at,created_at,updated_at) VALUES (${row.id},${row.objectKey},${originalName},${inferMimeType(originalName)},${size},${Number(row.width) || null},${Number(row.height) || null},'active',${dateValue(row.created_at)},${dateValue(row.created_at)},${dateValue(row.created_at)}) ON CONFLICT (object_key) DO UPDATE SET status='active', updated_at=EXCLUDED.updated_at`;
        await tx`INSERT INTO project_media (project_id,media_asset_id,category,position,alt_text) SELECT ${row.projectId}, id, ${row.category}, ${Number(row.sort_order ?? row.order_index ?? 0)}, ${text(row.alt_text ?? row.caption)} FROM media_assets WHERE object_key=${row.objectKey} ON CONFLICT (project_id,media_asset_id) DO UPDATE SET category=EXCLUDED.category, position=EXCLUDED.position, alt_text=EXCLUDED.alt_text`;
      }
      for (const row of pages) await tx`INSERT INTO content_pages (id,slug,title,body,status,seo_title,seo_description,published_at,created_at,updated_at) VALUES (${text(row.id, randomUUID())},${text(row.slug, "sayfa")},${text(row.title, "Başlıksız")},${text(row.content, "")},${row.is_published === false ? "draft" : "published"},${text(row.meta_title)},${text(row.meta_description)},${row.is_published === false ? null : dateValue(row.updated_at)},${dateValue(row.created_at)},${dateValue(row.updated_at)}) ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, body=EXCLUDED.body, status=EXCLUDED.status, updated_at=EXCLUDED.updated_at`;
      for (const row of messages) await tx`INSERT INTO contact_messages (id,name,email,phone,subject,message,status,read_at,created_at,updated_at) VALUES (${text(row.id, randomUUID())},${text(row.name, "Bilinmeyen")},${text(row.email, "bilinmiyor@legacy.local")},${text(row.phone)},${text(row.subject)},${text(row.message, "")},${row.is_read === true ? "read" : "unread"},${row.is_read === true ? dateValue(row.updated_at ?? row.created_at) : null},${dateValue(row.created_at)},${dateValue(row.updated_at ?? row.created_at)}) ON CONFLICT (id) DO NOTHING`;
      for (const section of sections) { const row = section.row; const content = section.content ?? contentWithoutMeta(row!); await tx`INSERT INTO site_sections (section_key,name,status,content,position,published_at,created_at,updated_at) VALUES (${section.key},${section.name},'published',${sql.json(content as never)},0,${dateValue(row?.updated_at)},${dateValue(row?.created_at)},${dateValue(row?.updated_at)}) ON CONFLICT (section_key) DO UPDATE SET content=EXCLUDED.content,status='published',updated_at=EXCLUDED.updated_at`; }
      for (const row of settings) if (text(row.key)) await tx`INSERT INTO site_settings (key,value) VALUES (${text(row.key)},${sql.json((row.value ?? {}) as never)}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`;
      if (legacyAgents.length) for (const [index, row] of legacyAgents.entries()) await tx`INSERT INTO whatsapp_agents (id,name,phone,message_template,enabled,position,created_at,updated_at) VALUES (${text(row.id, randomUUID())},${text(row.name, "Satış Danışmanı")},${text(row.phone ?? row.phone_number, "+905327624267")},${text(row.message_template ?? row.default_message, "Merhaba")},${row.is_active !== false && row.enabled !== false},${Number(row.position ?? index)},${dateValue(row.created_at)},${dateValue(row.updated_at)}) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name,phone=EXCLUDED.phone,message_template=EXCLUDED.message_template,enabled=EXCLUDED.enabled,position=EXCLUDED.position`;
      else if (widgetConfigs[0]) { const row = widgetConfigs[0]; await tx`INSERT INTO whatsapp_agents (name,phone,message_template,enabled,position) VALUES ('Satış Danışmanı',${text(row.phone_number, "+905327624267")},${text(row.default_message, "Merhaba")},${row.is_enabled !== false},0)`; }
    });
    for (const table of ["projects", "media_assets", "project_media", "content_pages", "contact_messages", "site_sections", "site_settings", "whatsapp_agents"]) { const [row] = await sql.unsafe(`select count(*)::int as count from ${table}`); report.targetRows[table] = row.count as number; }
  } finally { await sql.end(); }
}

await main();
const output = JSON.stringify({ ...report, finishedAt: new Date().toISOString() }, null, 2);
console.log(output);
if (process.env.MIGRATION_REPORT_PATH) await writeFile(process.env.MIGRATION_REPORT_PATH, output + "\n", "utf8");
