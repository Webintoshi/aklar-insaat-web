import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import {
  constructionStages,
  mediaCategories,
  projectStatuses,
  projectTypes,
} from "@/lib/validation/project";

const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectTypeEnum = pgEnum("project_type", projectTypes);
export const publicationStatusEnum = pgEnum("publication_status", projectStatuses);
export const constructionStageEnum = pgEnum("construction_stage", constructionStages);
export const mediaCategoryEnum = pgEnum("media_category", mediaCategories);
export const mediaAssetStatusEnum = pgEnum("media_asset_status", [
  "pending",
  "active",
  "deleting",
  "deleted",
  "failed",
]);
export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "published",
  "archived",
]);
export const messageStatusEnum = pgEnum("message_status", [
  "unread",
  "read",
  "archived",
]);
export const deletionJobStatusEnum = pgEnum("deletion_job_status", [
  "pending",
  "processing",
  "completed",
  "failed",
]);

export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: text("role").notNull().default("none"),
    ...timestamps(),
  },
  (table) => [
    unique("user_email_unique").on(table.email),
    uniqueIndex("user_single_owner_unique")
      .on(table.role)
      .where(sql`${table.role} = 'owner'`),
    check("user_role_allowed", sql`${table.role} in ('none', 'owner')`),
  ],
);

export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    ...timestamps(),
  },
  (table) => [
    unique("session_token_unique").on(table.token),
    index("session_user_id_idx").on(table.userId),
    index("session_expires_at_idx").on(table.expiresAt),
  ],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    issuer: text("issuer").notNull(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    idToken: text("id_token"),
    password: text("password"),
    ...timestamps(),
  },
  (table) => [
    unique("account_issuer_account_id_unique").on(table.issuer, table.accountId),
    index("account_user_id_idx").on(table.userId),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ...timestamps(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const rateLimit = pgTable(
  "rateLimit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    count: integer("count").notNull(),
    lastRequest: bigint("last_request", { mode: "number" }).notNull(),
  },
  (table) => [unique("rate_limit_key_unique").on(table.key)],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().default("Adsız Proje"),
    slug: text("slug").notNull(),
    projectType: projectTypeEnum("project_type").notNull(),
    publicationStatus: publicationStatusEnum("publication_status")
      .notNull()
      .default("draft"),
    constructionStage: constructionStageEnum("construction_stage"),
    shortDescription: text("short_description"),
    longDescription: text("long_description"),
    completionDate: date("completion_date"),
    city: text("city"),
    district: text("district"),
    neighborhood: text("neighborhood"),
    address: text("address"),
    mapsUrl: text("maps_url"),
    videoUrl: text("video_url"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    version: integer("version").notNull().default(1),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    unique("projects_slug_unique").on(table.slug),
    check("projects_version_positive", sql`${table.version} > 0`),
    index("projects_publication_status_published_at_idx").on(
      table.publicationStatus,
      table.publishedAt,
    ),
    index("projects_project_type_construction_stage_idx").on(
      table.projectType,
      table.constructionStage,
    ),
  ],
);

export const projectUnitTypes = pgTable(
  "project_unit_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    areaMin: integer("area_min").notNull(),
    areaMax: integer("area_max").notNull(),
    position: integer("position").notNull().default(0),
    ...timestamps(),
  },
  (table) => [
    index("project_unit_types_project_id_idx").on(table.projectId),
    check("project_unit_types_area_min_positive", sql`${table.areaMin} > 0`),
    check(
      "project_unit_types_area_range_valid",
      sql`${table.areaMax} >= ${table.areaMin}`,
    ),
  ],
);

export const projectFeatures = pgTable(
  "project_features",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    position: integer("position").notNull().default(0),
    ...timestamps(),
  },
  (table) => [index("project_features_project_id_idx").on(table.projectId)],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    objectKey: text("object_key").notNull(),
    originalName: text("original_name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    width: integer("width"),
    height: integer("height"),
    etag: text("etag"),
    status: mediaAssetStatusEnum("status").notNull().default("pending"),
    uploadedBy: uuid("uploaded_by").references(() => user.id, { onDelete: "set null" }),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    unique("media_assets_object_key_unique").on(table.objectKey),
    check(
      "media_assets_size_limit",
      sql`${table.sizeBytes} > 0 and ${table.sizeBytes} <= 20971520`,
    ),
    index("media_assets_status_created_at_idx").on(table.status, table.createdAt),
    index("media_assets_uploaded_by_idx").on(table.uploadedBy),
  ],
);

export const projectMedia = pgTable(
  "project_media",
  {
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "restrict" }),
    category: mediaCategoryEnum("category").notNull(),
    position: integer("position").notNull().default(0),
    altText: text("alt_text"),
    ...timestamps(),
  },
  (table) => [
    primaryKey({ columns: [table.projectId, table.mediaAssetId] }),
    index("project_media_project_id_idx").on(table.projectId),
    index("project_media_media_asset_id_idx").on(table.mediaAssetId),
    index("project_media_project_category_position_idx").on(
      table.projectId,
      table.category,
      table.position,
    ),
  ],
);

export const contentPages = pgTable(
  "content_pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    body: text("body").notNull().default(""),
    status: contentStatusEnum("status").notNull().default("draft"),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    unique("content_pages_slug_unique").on(table.slug),
    index("content_pages_status_published_at_idx").on(table.status, table.publishedAt),
  ],
);

export const siteSections = pgTable(
  "site_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sectionKey: text("section_key").notNull(),
    name: text("name").notNull(),
    status: contentStatusEnum("status").notNull().default("draft"),
    content: jsonb("content").$type<Record<string, unknown>>().notNull().default({}),
    position: integer("position").notNull().default(0),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    unique("site_sections_section_key_unique").on(table.sectionKey),
    index("site_sections_status_position_idx").on(table.status, table.position),
  ],
);

export const siteSettings = pgTable("site_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  ...timestamps(),
});

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    subject: text("subject"),
    message: text("message").notNull(),
    status: messageStatusEnum("status").notNull().default("unread"),
    ipHash: text("ip_hash"),
    readAt: timestamp("read_at", { withTimezone: true }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    index("contact_messages_status_created_at_idx").on(table.status, table.createdAt),
  ],
);

export const whatsappAgents = pgTable(
  "whatsapp_agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    messageTemplate: text("message_template").notNull().default("Merhaba"),
    enabled: boolean("enabled").notNull().default(true),
    position: integer("position").notNull().default(0),
    ...timestamps(),
  },
  (table) => [index("whatsapp_agents_enabled_position_idx").on(table.enabled, table.position)],
);

export const whatsappClickEvents = pgTable(
  "whatsapp_click_events",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    agentId: uuid("agent_id").references(() => whatsappAgents.id, {
      onDelete: "set null",
    }),
    pagePath: text("page_path").notNull(),
    referrer: text("referrer"),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("whatsapp_click_events_agent_id_idx").on(table.agentId),
    index("whatsapp_click_events_created_at_idx").on(table.createdAt),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    actorUserId: uuid("actor_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_actor_user_id_idx").on(table.actorUserId),
    index("audit_logs_entity_created_at_idx").on(
      table.entityType,
      table.entityId,
      table.createdAt,
    ),
  ],
);

export const storageDeletionJobs = pgTable(
  "storage_deletion_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    mediaAssetId: uuid("media_asset_id")
      .notNull()
      .references(() => mediaAssets.id, { onDelete: "cascade" }),
    objectKey: text("object_key").notNull(),
    status: deletionJobStatusEnum("status").notNull().default("pending"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    unique("storage_deletion_jobs_media_asset_unique").on(table.mediaAssetId),
    index("storage_deletion_jobs_status_next_attempt_at_idx").on(
      table.status,
      table.nextAttemptAt,
    ),
  ],
);

export const schema = {
  user,
  session,
  account,
  verification,
  rateLimit,
  projects,
  projectUnitTypes,
  projectFeatures,
  mediaAssets,
  projectMedia,
  contentPages,
  siteSections,
  siteSettings,
  contactMessages,
  whatsappAgents,
  whatsappClickEvents,
  auditLogs,
  storageDeletionJobs,
};
