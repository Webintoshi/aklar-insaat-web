import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL zorunludur.");

const sql = postgres(databaseUrl, { max: 1, prepare: false });
try {
  const requiredTables = ["user", "session", "projects", "project_unit_types", "media_assets", "project_media", "content_pages", "site_sections", "contact_messages", "whatsapp_agents", "audit_logs", "storage_deletion_jobs"];
  const rows = await sql<{ table_name: string }[]>`select table_name from information_schema.tables where table_schema='public' and table_name in ${sql(requiredTables)}`;
  const present = new Set(rows.map((row) => row.table_name));
  const missing = requiredTables.filter((table) => !present.has(table));
  if (missing.length) throw new Error(`Eksik tablolar: ${missing.join(", ")}`);
  const [counts] = await sql`select (select count(*)::int from projects) as projects, (select count(*)::int from content_pages) as content_pages, (select count(*)::int from contact_messages) as messages, (select count(*)::int from media_assets) as media_assets`;
  console.log(JSON.stringify({ status: "ok", counts }, null, 2));
} finally {
  await sql.end();
}
