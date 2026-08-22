import { describe, expect, it } from "vitest";

import { normalizeLegacyR2Content, resolveR2ContentUrls, r2ObjectKeyFromLegacyUrl } from "@/lib/migration/supabase-transform";

describe("Supabase migration transforms", () => {
  it("keeps an existing object key unchanged", () => {
    expect(r2ObjectKeyFromLegacyUrl("projects/abc/cover/image.webp")).toBe(
      "projects/abc/cover/image.webp",
    );
  });

  it("extracts a key from the production media domain", () => {
    expect(
      r2ObjectKeyFromLegacyUrl(
        "https://media.orduaklarinsaat.com/projects/abc/exterior/a.jpg",
      ),
    ).toBe("projects/abc/exterior/a.jpg");
  });

  it("extracts a key from an R2 development domain", () => {
    expect(
      r2ObjectKeyFromLegacyUrl(
        "https://pub-example.r2.dev/projects/abc/interior/a%20b.jpg?x=1",
      ),
    ).toBe("projects/abc/interior/a b.jpg");
  });

  it("rejects local and unrelated URLs", () => {
    expect(r2ObjectKeyFromLegacyUrl("/images/hero.jpg")).toBeNull();
    expect(r2ObjectKeyFromLegacyUrl("https://example.com/image.jpg")).toBeNull();
  });

  it("normalizes nested content URLs to keys and resolves them at runtime", () => {
    const normalized = normalizeLegacyR2Content({ hero: { image: "https://pub-example.r2.dev/home/hero.webp" }, link: "https://example.com" });
    expect(normalized).toEqual({ hero: { image: "home/hero.webp" }, link: "https://example.com" });
    expect(resolveR2ContentUrls(normalized, "https://media.orduaklarinsaat.com")).toEqual({ hero: { image: "https://media.orduaklarinsaat.com/home/hero.webp" }, link: "https://example.com" });
  });
});
