import Link from "next/link";
import { db } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { canPublishPlayer } from "@/lib/domain/privacy";
import { PlayerForm } from "@/components/admin/player-form";
import { DemoBadge } from "@/components/ui";
import { requireRole } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";
export default async function AdminPlayersPage() {
  await requireRole(["admin","organizer"]);
  const allPlayers = await db.query.players.findMany({ orderBy: [players.displayName] });
  return <><p className="eyebrow">Persone e consensi</p><h1 className="display my-2 text-5xl">Profili giocatori</h1><p className="muted max-w-3xl">Un profilo pubblico richiede consenso esplicito. Per i minorenni serve anche l’autorizzazione documentabile del tutore. Non vengono raccolti telefono, data di nascita o contatti.</p><details className="card card-solid my-8"><summary className="cursor-pointer text-xl font-black">Nuovo profilo</summary><div className="mt-6"><PlayerForm /></div></details>{allPlayers.length ? <div className="table-wrap"><table><thead><tr><th>Nome</th><th>Visibilità</th><th>Consenso</th><th>Tutele minorenni</th><th /></tr></thead><tbody>{allPlayers.map((player) => <tr key={player.id}><td className="font-bold">{player.displayName} {player.isDemo && <DemoBadge />}</td><td>{canPublishPlayer(player) ? "Pubblico" : player.visibility === "public" ? "Pubblicazione bloccata" : "Privato"}</td><td>{player.consentAt ? "Documentato" : "Mancante"}</td><td>{player.isMinor ? player.guardianConsentAt ? "Autorizzazione registrata" : "Autorizzazione mancante" : "Non indicato"}</td><td>{canPublishPlayer(player) && <Link className="underline" href={`/giocatori/${player.publicSlug}`}>Vedi</Link>}</td></tr>)}</tbody></table></div> : <p className="empty-state">Nessun profilo creato. L’importazione CSV dei partecipanti non crea profili pubblici.</p>}</>;
}
