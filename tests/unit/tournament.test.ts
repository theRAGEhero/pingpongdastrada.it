import { describe, expect, it } from "vitest";
import { calculateStandings, generateRoundRobin, generateSingleElimination, nextMatchTarget, seedOrder, validateSetScore } from "@/lib/domain/tournament";

const entries = Array.from({ length: 8 }, (_,index) => ({ id: `p${index+1}`, displayName: `Giocatore ${index+1}`, seed: index+1 }));

describe("tabellone a eliminazione diretta", () => {
  it("ordina le teste di serie con gli accoppiamenti standard", () => {
    expect(seedOrder(2)).toEqual([1,2]);
    expect(seedOrder(4)).toEqual([1,4,2,3]);
    expect(seedOrder(8)).toEqual([1,8,4,5,2,7,3,6]);
  });
  it("genera tutti i turni e assegna i bye ai semi migliori", () => {
    const matches = generateSingleElimination(entries.slice(0,5));
    expect(matches).toHaveLength(7);
    expect(matches.filter((match) => match.round === 1 && match.status === "bye")).toHaveLength(3);
    expect(matches.find((match) => match.round === 1 && match.bracketPosition === 0)?.winnerEntryId).toBe("p1");
    expect(matches.filter((match) => match.round === 3)).toHaveLength(1);
  });
  it("calcola il turno e lo slot successivi", () => {
    expect(nextMatchTarget({ round: 1, bracketPosition: 0 })).toEqual({ round: 2, bracketPosition: 0, slot: "home" });
    expect(nextMatchTarget({ round: 1, bracketPosition: 3 })).toEqual({ round: 2, bracketPosition: 1, slot: "away" });
  });
  it("rifiuta un tabellone con meno di due partecipanti", () => {
    expect(() => generateSingleElimination(entries.slice(0,1))).toThrow();
  });
});

describe("girone all’italiana", () => {
  it("fa incontrare ogni coppia esattamente una volta", () => {
    const matches = generateRoundRobin(entries.slice(0,4));
    expect(matches).toHaveLength(6);
    expect(new Set(matches.map((match) => match.round)).size).toBe(3);
    const pairs = new Set(matches.map((match) => [match.homeEntryId,match.awayEntryId].sort().join("-")));
    expect(pairs.size).toBe(6);
    for (const entry of entries.slice(0,4)) expect(matches.filter((match) => match.homeEntryId === entry.id || match.awayEntryId === entry.id)).toHaveLength(3);
  });
  it("gestisce il bye con un numero dispari di partecipanti", () => {
    const matches = generateRoundRobin(entries.slice(0,5));
    expect(matches).toHaveLength(10);
    expect(matches.every((match) => match.homeEntryId && match.awayEntryId)).toBe(true);
  });
});

describe("punteggi e classifiche", () => {
  it("accetta soltanto punteggi coerenti con il numero di set", () => {
    expect(validateSetScore(2,1,3)).toBeNull();
    expect(validateSetScore(1,2,3)).toBeNull();
    expect(validateSetScore(1,1,3)).not.toBeNull();
    expect(validateSetScore(3,0,3)).not.toBeNull();
    expect(validateSetScore(-1,2,3)).not.toBeNull();
    expect(validateSetScore(2,0,4)).not.toBeNull();
  });
  it("deriva la classifica solo dalle partite concluse", () => {
    const standings = calculateStandings(entries.slice(0,2), [
      { homeEntryId: "p1", awayEntryId: "p2", homeScore: 2, awayScore: 1, status: "completed" },
      { homeEntryId: "p1", awayEntryId: "p2", homeScore: 0, awayScore: 0, status: "scheduled" },
    ]);
    expect(standings[0]).toMatchObject({ entryId: "p1", played: 1, wins: 1, losses: 0, difference: 1, winPercentage: 100 });
    expect(standings[1]).toMatchObject({ entryId: "p2", played: 1, wins: 0, losses: 1, difference: -1 });
  });
});
