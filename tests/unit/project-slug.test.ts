import { describe, expect, it } from "vitest";

import { projectSlugFromName } from "@/lib/projects/slug";

describe("projectSlugFromName", () => {
  it("creates stable URL-safe slugs from Turkish project names", () => {
    expect(projectSlugFromName("  Şehrin Işığı & Göksu Evleri  ")).toBe(
      "sehrin-isigi-goksu-evleri",
    );
  });

  it("uses a project prefix when the name contains no usable characters", () => {
    expect(projectSlugFromName("---")).toBe("proje");
  });
});
