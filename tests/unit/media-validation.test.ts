import { describe, expect, it } from "vitest";

import {
  mediaCompleteSchema,
  mediaPresignSchema,
} from "@/lib/validation/media";

const projectId = "d50f64d8-2a8f-4a3e-9308-30dd6dc67854";

describe("mediaPresignSchema", () => {
  it("accepts supported images up to and including 20 MB", () => {
    expect(
      mediaPresignSchema.safeParse({
        projectId,
        category: "cover",
        contentType: "image/heif",
        fileSize: 20 * 1024 * 1024,
        originalName: "cephe.heif",
      }).success,
    ).toBe(true);
  });

  it("rejects unsupported files and images above 20 MB", () => {
    expect(
      mediaPresignSchema.safeParse({
        projectId,
        category: "cover",
        contentType: "image/svg+xml",
        fileSize: 1024,
        originalName: "script.svg",
      }).success,
    ).toBe(false);
    expect(
      mediaPresignSchema.safeParse({
        projectId,
        category: "cover",
        contentType: "image/jpeg",
        fileSize: 20 * 1024 * 1024 + 1,
        originalName: "buyuk.jpg",
      }).success,
    ).toBe(false);
  });
});

describe("mediaCompleteSchema", () => {
  it("requires the R2 key to remain inside the selected project scope", () => {
    expect(
      mediaCompleteSchema.safeParse({
        projectId,
        category: "exterior",
        objectKey: "projects/d50f64d8-2a8f-4a3e-9308-30dd6dc67854/exterior/file.webp",
        originalName: "file.webp",
      }).success,
    ).toBe(true);

    expect(
      mediaCompleteSchema.safeParse({
        projectId,
        category: "exterior",
        objectKey: "projects/another-project/exterior/file.webp",
        originalName: "file.webp",
      }).success,
    ).toBe(false);
  });
});
