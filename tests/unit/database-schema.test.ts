import { getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  account,
  auditLogs,
  contactMessages,
  mediaAssets,
  projectMedia,
  projectUnitTypes,
  projects,
  rateLimit,
  session,
  storageDeletionJobs,
  user,
  verification,
} from "@/db/schema";

describe("database schema", () => {
  it("contains the Better Auth core tables and an owner-only role column", () => {
    expect([user, session, account, verification].map(getTableName)).toEqual([
      "user",
      "session",
      "account",
      "verification",
    ]);
    expect(getTableConfig(user).columns.map((column) => column.name)).toContain("role");
  });

  it("persists authentication rate limits across application restarts", () => {
    const config = getTableConfig(rateLimit);

    expect(getTableName(rateLimit)).toBe("rateLimit");
    expect(config.columns.map((column) => column.name)).toEqual(
      expect.arrayContaining(["key", "count", "last_request"]),
    );
    expect(config.uniqueConstraints.map((constraint) => constraint.name)).toContain(
      "rate_limit_key_unique",
    );
  });

  it("enforces project slug uniqueness and optimistic versioning", () => {
    const config = getTableConfig(projects);

    expect(config.columns.map((column) => column.name)).toEqual(
      expect.arrayContaining(["slug", "version", "project_type", "publication_status"]),
    );
    expect(config.uniqueConstraints.map((constraint) => constraint.name)).toContain(
      "projects_slug_unique",
    );
    expect(config.checks.map((constraint) => constraint.name)).toContain(
      "projects_version_positive",
    );
  });

  it("indexes project and media foreign keys used by joins and cascades", () => {
    expect(getTableConfig(projectUnitTypes).indexes.map((index) => index.config.name)).toContain(
      "project_unit_types_project_id_idx",
    );
    expect(getTableConfig(projectMedia).indexes.map((index) => index.config.name)).toEqual(
      expect.arrayContaining([
        "project_media_project_id_idx",
        "project_media_media_asset_id_idx",
      ]),
    );
    expect(getTableConfig(storageDeletionJobs).uniqueConstraints.map((constraint) => constraint.name)).toContain(
      "storage_deletion_jobs_media_asset_unique",
    );
  });

  it("enforces safe owner, unit area and upload-size invariants in PostgreSQL", () => {
    const userConfig = getTableConfig(user);

    expect(userConfig.checks.map((constraint) => constraint.name)).toContain(
      "user_role_allowed",
    );
    expect(userConfig.indexes.map((index) => index.config.name)).toContain(
      "user_single_owner_unique",
    );
    expect(
      getTableConfig(projectUnitTypes).checks.map((constraint) => constraint.name),
    ).toEqual(
      expect.arrayContaining([
        "project_unit_types_area_min_positive",
        "project_unit_types_area_range_valid",
      ]),
    );
    expect(getTableConfig(mediaAssets).checks.map((constraint) => constraint.name)).toContain(
      "media_assets_size_limit",
    );
  });

  it("supports operational message, media, deletion and audit states", () => {
    expect(getTableConfig(contactMessages).columns.map((column) => column.name)).toContain(
      "status",
    );
    expect(getTableConfig(mediaAssets).columns.map((column) => column.name)).toContain(
      "object_key",
    );
    expect(getTableConfig(storageDeletionJobs).columns.map((column) => column.name)).toContain(
      "next_attempt_at",
    );
    expect(getTableConfig(auditLogs).columns.map((column) => column.name)).toContain(
      "metadata",
    );
  });
});
