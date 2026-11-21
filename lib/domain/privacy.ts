export function canPublishPlayer(player: { visibility: string; consentAt: string | null; isMinor: boolean; guardianConsentAt: string | null; publicSlug: string | null }) {
  return player.visibility === "public" && Boolean(player.consentAt && player.publicSlug) && (!player.isMinor || Boolean(player.guardianConsentAt));
}

export function assertPublicPlayer<T extends { visibility: string; consentAt: string | null; isMinor: boolean; guardianConsentAt: string | null; publicSlug: string | null }>(player: T): T {
  if (!canPublishPlayer(player)) throw new Error("Profilo non pubblicabile: consenso o requisiti privacy mancanti.");
  return player;
}
