import "server-only";

import { and, asc, desc, eq, sql } from "drizzle-orm";
import { ZodError } from "zod";

import { db } from "@/db/client";
import {
  auditLogs,
  mediaAssets,
  projectFeatures,
  projectMedia,
  projectUnitTypes,
  projects,
} from "@/db/schema";
import { projectSlugFromName } from "@/lib/projects/slug";
import {
  type ProjectPatchInput,
  projectPublishSchema,
  type projectTypes,
} from "@/lib/validation/project";

export class ProjectNotFoundError extends Error {
  constructor() {
    super("Proje bulunamadı.");
    this.name = "ProjectNotFoundError";
  }
}

export class ProjectVersionConflictError extends Error {
  constructor() {
    super("Proje başka bir oturumda güncellendi. Son veriyi yükleyip tekrar deneyin.");
    this.name = "ProjectVersionConflictError";
  }
}

export class ProjectPublishValidationError extends Error {
  readonly validation: ZodError;

  constructor(validation: ZodError) {
    super("Proje yayın koşullarını karşılamıyor.");
    this.name = "ProjectPublishValidationError";
    this.validation = validation;
  }
}

export async function createProjectDraft(
  actorUserId: string,
  projectType: (typeof projectTypes)[number],
) {
  return db.transaction(async (transaction) => {
    const draftToken = crypto.randomUUID();
    const [project] = await transaction
      .insert(projects)
      .values({
        name: "Adsız Proje",
        slug: projectSlugFromName("taslak-" + draftToken),
        projectType,
      })
      .returning();

    await transaction.insert(auditLogs).values({
      actorUserId,
      action: "project.draft_created",
      entityType: "project",
      entityId: project.id,
      metadata: { projectType },
    });

    return project;
  });
}

export async function listAdminProjects() {
  return db
    .select()
    .from(projects)
    .orderBy(desc(projects.updatedAt), desc(projects.id))
    .limit(100);
}

export async function getAdminProject(id: string) {
  const [[project], unitTypes, features, media] = await Promise.all([
    db.select().from(projects).where(eq(projects.id, id)).limit(1),
    db
      .select()
      .from(projectUnitTypes)
      .where(eq(projectUnitTypes.projectId, id))
      .orderBy(asc(projectUnitTypes.position)),
    db
      .select()
      .from(projectFeatures)
      .where(eq(projectFeatures.projectId, id))
      .orderBy(asc(projectFeatures.position)),
    db
      .select({
        id: mediaAssets.id,
        objectKey: mediaAssets.objectKey,
        originalName: mediaAssets.originalName,
        mimeType: mediaAssets.mimeType,
        sizeBytes: mediaAssets.sizeBytes,
        status: mediaAssets.status,
        category: projectMedia.category,
        position: projectMedia.position,
        altText: projectMedia.altText,
      })
      .from(projectMedia)
      .innerJoin(mediaAssets, eq(projectMedia.mediaAssetId, mediaAssets.id))
      .where(eq(projectMedia.projectId, id))
      .orderBy(asc(projectMedia.category), asc(projectMedia.position)),
  ]);

  if (!project) throw new ProjectNotFoundError();
  return { ...project, unitTypes, features, media };
}

export async function updateProject(
  id: string,
  actorUserId: string,
  input: ProjectPatchInput,
) {
  return db.transaction(async (transaction) => {
    const updatedAt = new Date();
    const updateValues: Partial<
      Omit<typeof projects.$inferSelect, "id" | "version" | "createdAt">
    > & {
      version: ReturnType<typeof sql>;
      updatedAt: Date;
    } = {
      version: sql`${projects.version} + 1`,
      updatedAt,
    };

    if (input.name !== undefined) updateValues.name = input.name;
    if (input.slug !== undefined) updateValues.slug = input.slug;
    if (input.projectType !== undefined) updateValues.projectType = input.projectType;
    if (input.status !== undefined) {
      updateValues.publicationStatus = input.status;
      updateValues.archivedAt = input.status === "archived" ? updatedAt : null;
    }
    if (input.constructionStage !== undefined) {
      updateValues.constructionStage = input.constructionStage;
    }
    if (input.shortDescription !== undefined) {
      updateValues.shortDescription = input.shortDescription;
    }
    if (input.longDescription !== undefined) {
      updateValues.longDescription = input.longDescription;
    }
    if (input.completionDate !== undefined) {
      updateValues.completionDate = input.completionDate;
    }
    if (input.city !== undefined) updateValues.city = input.city;
    if (input.district !== undefined) updateValues.district = input.district;
    if (input.neighborhood !== undefined) updateValues.neighborhood = input.neighborhood;
    if (input.address !== undefined) updateValues.address = input.address;
    if (input.mapsUrl !== undefined) updateValues.mapsUrl = input.mapsUrl;
    if (input.videoUrl !== undefined) updateValues.videoUrl = input.videoUrl;
    if (input.seoTitle !== undefined) updateValues.seoTitle = input.seoTitle;
    if (input.seoDescription !== undefined) {
      updateValues.seoDescription = input.seoDescription;
    }

    const [updatedProject] = await transaction
      .update(projects)
      .set(updateValues)
      .where(and(eq(projects.id, id), eq(projects.version, input.version)))
      .returning();

    if (!updatedProject) {
      const [existingProject] = await transaction
        .select({ id: projects.id })
        .from(projects)
        .where(eq(projects.id, id))
        .limit(1);

      if (!existingProject) throw new ProjectNotFoundError();
      throw new ProjectVersionConflictError();
    }

    if (input.unitTypes !== undefined) {
      await transaction.delete(projectUnitTypes).where(eq(projectUnitTypes.projectId, id));
      if (input.unitTypes.length > 0) {
        await transaction.insert(projectUnitTypes).values(
          input.unitTypes.map((unitType, position) => ({
            projectId: id,
            label: unitType.label,
            areaMin: Math.round(unitType.areaMin),
            areaMax: Math.round(unitType.areaMax),
            position,
          })),
        );
      }
    }

    if (input.featureNames !== undefined) {
      await transaction.delete(projectFeatures).where(eq(projectFeatures.projectId, id));
      if (input.featureNames.length > 0) {
        await transaction.insert(projectFeatures).values(
          input.featureNames.map((name, position) => ({
            projectId: id,
            name,
            position,
          })),
        );
      }
    }

    await transaction.insert(auditLogs).values({
      actorUserId,
      action: input.status === "archived" ? "project.archived" : "project.autosaved",
      entityType: "project",
      entityId: id,
      metadata: {
        previousVersion: input.version,
        currentVersion: updatedProject.version,
        fields: Object.keys(input).filter((key) => key !== "version"),
      },
    });

    return updatedProject;
  });
}

export async function publishProject(id: string, actorUserId: string) {
  return db.transaction(async (transaction) => {
    const [project] = await transaction
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    if (!project) throw new ProjectNotFoundError();

    const [unitTypes, media] = await Promise.all([
      transaction
        .select({
          label: projectUnitTypes.label,
          areaMin: projectUnitTypes.areaMin,
          areaMax: projectUnitTypes.areaMax,
        })
        .from(projectUnitTypes)
        .where(eq(projectUnitTypes.projectId, id))
        .orderBy(asc(projectUnitTypes.position)),
      transaction
        .select({
          category: projectMedia.category,
          objectKey: mediaAssets.objectKey,
        })
        .from(projectMedia)
        .innerJoin(
          mediaAssets,
          and(
            eq(projectMedia.mediaAssetId, mediaAssets.id),
            eq(mediaAssets.status, "active"),
          ),
        )
        .where(eq(projectMedia.projectId, id)),
    ]);

    const validation = projectPublishSchema.safeParse({
      name: project.name,
      slug: project.slug,
      projectType: project.projectType,
      status: project.publicationStatus,
      constructionStage: project.constructionStage,
      shortDescription: project.shortDescription,
      longDescription: project.longDescription,
      completionDate: project.completionDate,
      city: project.city,
      district: project.district,
      neighborhood: project.neighborhood,
      address: project.address,
      mapsUrl: project.mapsUrl,
      videoUrl: project.videoUrl,
      unitTypes,
      media,
    });

    if (!validation.success) {
      throw new ProjectPublishValidationError(validation.error);
    }

    const publishedAt = new Date();
    const [publishedProject] = await transaction
      .update(projects)
      .set({
        publicationStatus: "published",
        publishedAt,
        archivedAt: null,
        version: sql`${projects.version} + 1`,
        updatedAt: publishedAt,
      })
      .where(eq(projects.id, id))
      .returning();

    await transaction.insert(auditLogs).values({
      actorUserId,
      action: "project.published",
      entityType: "project",
      entityId: id,
      metadata: { version: publishedProject.version },
    });

    return publishedProject;
  });
}

export async function detachProjectMedia(projectId: string, mediaAssetId: string, actorUserId: string) {
  return db.transaction(async (transaction) => {
    const [link] = await transaction.delete(projectMedia).where(and(eq(projectMedia.projectId, projectId), eq(projectMedia.mediaAssetId, mediaAssetId))).returning();
    if (!link) throw new ProjectNotFoundError();
    await transaction.insert(auditLogs).values({ actorUserId, action: "project.media_detached", entityType: "project", entityId: projectId, metadata: { mediaAssetId } });
    return link;
  });
}

export async function moveProjectMedia(projectId: string, mediaAssetId: string, direction: -1 | 1, actorUserId: string) {
  return db.transaction(async (transaction) => {
    const [current] = await transaction.select().from(projectMedia).where(and(eq(projectMedia.projectId, projectId), eq(projectMedia.mediaAssetId, mediaAssetId))).limit(1);
    if (!current) throw new ProjectNotFoundError();
    const siblings = await transaction.select().from(projectMedia).where(and(eq(projectMedia.projectId, projectId), eq(projectMedia.category, current.category))).orderBy(asc(projectMedia.position));
    const other = siblings[siblings.findIndex((item) => item.mediaAssetId === mediaAssetId) + direction];
    if (!other) return current;
    const updatedAt = new Date();
    await transaction.update(projectMedia).set({ position: other.position, updatedAt }).where(and(eq(projectMedia.projectId, projectId), eq(projectMedia.mediaAssetId, mediaAssetId)));
    await transaction.update(projectMedia).set({ position: current.position, updatedAt }).where(and(eq(projectMedia.projectId, projectId), eq(projectMedia.mediaAssetId, other.mediaAssetId)));
    await transaction.insert(auditLogs).values({ actorUserId, action: "project.media_reordered", entityType: "project", entityId: projectId, metadata: { mediaAssetId, direction } });
    return { ...current, position: other.position };
  });
}
