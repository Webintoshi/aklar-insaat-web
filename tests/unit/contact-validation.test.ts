import { describe, expect, it } from "vitest";

import { contactRequestSchema } from "@/lib/validation/contact";

const validMessage = {
  name: "Ayşe Yılmaz",
  email: "ayse@example.com",
  phone: "+90 532 000 00 00",
  subject: "Proje hakkında bilgi",
  message: "Yeni projeniz hakkında ayrıntılı bilgi almak istiyorum.",
  company: "",
};

describe("contactRequestSchema", () => {
  it("accepts a complete contact message with an empty honeypot", () => {
    expect(contactRequestSchema.safeParse(validMessage).success).toBe(true);
  });

  it("rejects malformed input before it reaches PostgreSQL", () => {
    expect(
      contactRequestSchema.safeParse({
        ...validMessage,
        email: "not-an-email",
        message: "kısa",
      }).success,
    ).toBe(false);
  });
});
