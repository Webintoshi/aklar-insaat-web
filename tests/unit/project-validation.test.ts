import { describe, expect, it } from "vitest";

import {
  projectPatchSchema,
  projectPublishSchema,
} from "@/lib/validation/project";

const publishableProject = {
  name: "Aklar Park Evleri",
  slug: "aklar-park-evleri",
  projectType: "housing",
  constructionStage: "ongoing",
  shortDescription: "Şehrin merkezinde çağdaş bir yaşam alanı.",
  longDescription:
    "Aile yaşamı için tasarlanan geniş sosyal alanlar ve nitelikli malzemeler sunar.",
  city: "Ordu",
  district: "Altınordu",
  neighborhood: "Akyazı",
  address: "Akyazı Mahallesi, 123. Sokak No: 4",
  unitTypes: [{ label: "3+1", areaMin: 145, areaMax: 165 }],
  media: [
    { category: "cover", objectKey: "projects/1/cover.webp" },
    { category: "exterior", objectKey: "projects/1/exterior-1.webp" },
    { category: "interior", objectKey: "projects/1/interior-1.webp" },
  ],
};

describe("projectPublishSchema", () => {
  it("rejects a project when required publishing content or media is missing", () => {
    const result = projectPublishSchema.safeParse({
      ...publishableProject,
      longDescription: "",
      unitTypes: [],
      media: [{ category: "exterior", objectKey: "projects/1/exterior.webp" }],
    });

    expect(result.success).toBe(false);
    if (result.success) return;

    const fieldErrors = result.error.flatten().fieldErrors;
    expect(fieldErrors.longDescription).toBeDefined();
    expect(fieldErrors.unitTypes).toBeDefined();
    expect(fieldErrors.media).toEqual(
      expect.arrayContaining([
        "Yayınlamak için bir kapak görseli zorunludur.",
        "Yayınlamak için toplam en az üç görsel zorunludur.",
      ]),
    );
  });

  it("accepts a complete project with one cover and at least three images", () => {
    expect(projectPublishSchema.safeParse(publishableProject).success).toBe(true);
  });

  it("rejects media that exceeds a category limit", () => {
    const result = projectPublishSchema.safeParse({
      ...publishableProject,
      media: [
        publishableProject.media[0],
        ...Array.from({ length: 21 }, (_, index) => ({
          category: "exterior",
          objectKey: `projects/1/exterior-${index}.webp`,
        })),
      ],
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.media).toContain(
      "Dış mekân görselleri en fazla 20 adet olabilir.",
    );
  });
});

describe("projectPatchSchema", () => {
  it("requires a positive version for optimistic concurrency control", () => {
    expect(projectPatchSchema.safeParse({ version: 0, name: "Yeni ad" }).success).toBe(
      false,
    );
    expect(projectPatchSchema.safeParse({ version: 3, name: "Yeni ad" }).success).toBe(
      true,
    );
  });

  it("allows incomplete fields to be autosaved while the project is a draft", () => {
    expect(
      projectPatchSchema.safeParse({
        version: 1,
        name: "",
        shortDescription: "",
        longDescription: "",
        city: "",
      }).success,
    ).toBe(true);
  });

  it("accepts only Google Maps and YouTube or Vimeo links", () => {
    expect(
      projectPatchSchema.safeParse({
        version: 2,
        mapsUrl: "https://maps.google.com/?q=Ordu",
        videoUrl: "https://www.youtube.com/watch?v=example",
      }).success,
    ).toBe(true);

    expect(
      projectPatchSchema.safeParse({
        version: 2,
        mapsUrl: "https://example.com/fake-map",
      }).success,
    ).toBe(false);
    expect(
      projectPatchSchema.safeParse({
        version: 2,
        videoUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
  });
});
