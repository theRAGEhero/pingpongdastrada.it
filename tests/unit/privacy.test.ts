import { describe, expect, it } from "vitest";
import { canPublishPlayer } from "@/lib/domain/privacy";

const base = { visibility: "public", consentAt: "2026-01-01T00:00:00Z", isMinor: false, guardianConsentAt: null, publicSlug: "nick" };
describe("privacy dei profili", () => {
  it("richiede consenso, visibilità e slug", () => {
    expect(canPublishPlayer(base)).toBe(true);
    expect(canPublishPlayer({ ...base, consentAt: null })).toBe(false);
    expect(canPublishPlayer({ ...base, visibility: "private" })).toBe(false);
    expect(canPublishPlayer({ ...base, publicSlug: null })).toBe(false);
  });
  it("blocca i profili di minorenni senza autorizzazione del tutore", () => {
    expect(canPublishPlayer({ ...base, isMinor: true })).toBe(false);
    expect(canPublishPlayer({ ...base, isMinor: true, guardianConsentAt: "2026-01-02T00:00:00Z" })).toBe(true);
  });
});
