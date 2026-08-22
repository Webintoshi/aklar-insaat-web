import { describe, expect, it } from "vitest";

import { whatsappAgentInputSchema } from "@/lib/validation/whatsapp";

describe("whatsapp agent validation", () => {
  it("accepts a valid Turkish international phone", () => {
    const result = whatsappAgentInputSchema.parse({
      name: "Satış Danışmanı",
      phone: "+905551234567",
      messageTemplate: "Merhaba, projeniz hakkında bilgi almak istiyorum.",
      enabled: true,
      position: 0,
    });

    expect(result.phone).toBe("+905551234567");
  });

  it("rejects phone numbers outside E.164 format", () => {
    expect(() =>
      whatsappAgentInputSchema.parse({
        name: "Satış",
        phone: "0555 123 45 67",
        messageTemplate: "Merhaba",
        enabled: true,
        position: 0,
      }),
    ).toThrow();
  });
});
