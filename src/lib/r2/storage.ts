import "server-only";

import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

type R2Configuration = {
  client: S3Client;
  bucket: string;
  publicBaseUrl: string;
};

let configuration: R2Configuration | undefined;

function requiredEnvironment(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(name + " ortam değişkeni tanımlı değil.");
  return value;
}

export function getR2Configuration(): R2Configuration {
  if (configuration) return configuration;

  const accountId = process.env.R2_ACCOUNT_ID;
  const endpoint =
    process.env.R2_ENDPOINT ??
    (accountId ? "https://" + accountId + ".r2.cloudflarestorage.com" : undefined);
  if (!endpoint) throw new Error("R2_ENDPOINT veya R2_ACCOUNT_ID tanımlı değil.");

  configuration = {
    client: new S3Client({
      region: "auto",
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: requiredEnvironment("R2_ACCESS_KEY_ID"),
        secretAccessKey: requiredEnvironment("R2_SECRET_ACCESS_KEY"),
      },
    }),
    bucket: requiredEnvironment("R2_BUCKET_NAME"),
    publicBaseUrl: requiredEnvironment("NEXT_PUBLIC_R2_PUBLIC_URL").replace(/\/+$/, ""),
  };

  return configuration;
}

export async function presignProjectUpload(input: {
  projectId: string;
  category: string;
  contentType: string;
}) {
  const extensionByType: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  const extension = extensionByType[input.contentType];
  if (!extension) throw new Error("Desteklenmeyen medya türü.");

  const objectKey =
    "projects/" +
    input.projectId +
    "/" +
    input.category +
    "/" +
    crypto.randomUUID() +
    "." +
    extension;
  const r2 = getR2Configuration();
  const uploadUrl = await getSignedUrl(
    r2.client,
    new PutObjectCommand({
      Bucket: r2.bucket,
      Key: objectKey,
      ContentType: input.contentType,
    }),
    { expiresIn: 5 * 60 },
  );

  return {
    uploadUrl,
    objectKey,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  };
}

export async function headR2Object(objectKey: string) {
  const r2 = getR2Configuration();
  return r2.client.send(
    new HeadObjectCommand({
      Bucket: r2.bucket,
      Key: objectKey,
    }),
  );
}

export async function deleteR2Object(objectKey: string) {
  const r2 = getR2Configuration();
  await r2.client.send(
    new DeleteObjectCommand({
      Bucket: r2.bucket,
      Key: objectKey,
    }),
  );
}

export function mediaPublicUrl(objectKey: string) {
  if (
    objectKey.startsWith("/") ||
    objectKey.includes("..") ||
    objectKey.includes("\\")
  ) {
    throw new Error("Geçersiz R2 nesne anahtarı.");
  }

  return getR2Configuration().publicBaseUrl + "/" + objectKey;
}
