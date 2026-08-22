const allowedMediaHosts = ["media.orduaklarinsaat.com"];

export function r2ObjectKeyFromLegacyUrl(
  value: unknown,
  bucketName = "aklar-insaat-web",
): string | null {
  if (typeof value !== "string" || !value.trim() || value.startsWith("/")) return null;
  const raw = value.trim();
  if (!/^https?:\/\//i.test(raw)) return raw.replace(/^\/+/, "");

  try {
    const url = new URL(raw);
    const isR2Host =
      url.hostname.endsWith(".r2.dev") ||
      url.hostname.endsWith(".r2.cloudflarestorage.com");
    if (!isR2Host && !allowedMediaHosts.includes(url.hostname)) return null;
    let key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (url.hostname.endsWith(".r2.cloudflarestorage.com") && key.startsWith(bucketName + "/")) {
      key = key.slice(bucketName.length + 1);
    }
    return key || null;
  } catch {
    return null;
  }
}

export function inferMimeType(name: string): string {
  const extension = name.split(".").pop()?.toLowerCase();
  return ({ jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", heic: "image/heic", heif: "image/heif" } as Record<string, string>)[extension || ""] || "application/octet-stream";
}

export function normalizePublicationStatus(value: unknown, published?: unknown) {
  if (value === "archived") return "archived" as const;
  if (value === "published" || published === true) return "published" as const;
  return "draft" as const;
}

export function normalizeConstructionStage(value: unknown) {
  return value === "completed" ? ("completed" as const) : ("ongoing" as const);
}

export function normalizeLegacyR2Content(value: unknown): unknown {
  if (typeof value === "string") return /^https?:\/\//i.test(value) ? r2ObjectKeyFromLegacyUrl(value) ?? value : value;
  if (Array.isArray(value)) return value.map(normalizeLegacyR2Content);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalizeLegacyR2Content(child)]));
  return value;
}

export function resolveR2ContentUrls(value: unknown, publicBase: string): unknown {
  if (typeof value === "string") {
    const isObjectKey = !value.startsWith("/") && !/^https?:\/\//i.test(value) && value.includes("/") && /\.(?:jpe?g|png|webp|heic|heif|gif|svg)$/i.test(value);
    return isObjectKey ? publicBase.replace(/\/+$/, "") + "/" + value.replace(/^\/+/, "") : value;
  }
  if (Array.isArray(value)) return value.map((child) => resolveR2ContentUrls(child, publicBase));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, resolveR2ContentUrls(child, publicBase)]));
  return value;
}
