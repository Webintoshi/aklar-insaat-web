import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { account, auditLogs, user } from "@/db/schema";
import { ownerCredentialsSchema } from "@/lib/auth/security";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL ortam değişkeni tanımlı değil.");
}

const credentials = ownerCredentialsSchema.parse({
  name: process.env.OWNER_NAME,
  email: process.env.OWNER_EMAIL,
  password: process.env.OWNER_PASSWORD,
});

const client = postgres(databaseUrl, {
  max: 1,
  prepare: false,
  connect_timeout: 10,
});
const database = drizzle(client);

try {
  const ownerId = await database.transaction(async (transaction) => {
    const [existingOwner] = await transaction
      .select({ id: user.id })
      .from(user)
      .where(eq(user.role, "owner"))
      .limit(1);

    if (existingOwner) {
      throw new Error(
        "Sahip hesabı zaten var. Bu tek kullanımlık seed komutu yeniden çalıştırılamaz.",
      );
    }

    const passwordHash = await hashPassword(credentials.password);
    const [createdOwner] = await transaction
      .insert(user)
      .values({
        name: credentials.name,
        email: credentials.email.toLocaleLowerCase("tr-TR"),
        emailVerified: true,
        role: "owner",
      })
      .returning({ id: user.id });

    await transaction.insert(account).values({
      userId: createdOwner.id,
      issuer: "local:credential",
      accountId: createdOwner.id,
      providerId: "credential",
      password: passwordHash,
    });

    await transaction.insert(auditLogs).values({
      actorUserId: createdOwner.id,
      action: "owner.seeded",
      entityType: "user",
      entityId: createdOwner.id,
      metadata: { source: "scripts/seed-owner.ts" },
    });

    return createdOwner.id;
  });

  console.info(`Sahip hesabı oluşturuldu: ${ownerId}`);
} finally {
  await client.end();
}
