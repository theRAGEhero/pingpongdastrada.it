import { describe, expect, it } from "vitest";
import { checksum, parseCsv, validateParticipantRows } from "@/lib/domain/csv";

describe("import CSV", () => {
  it("legge BOM, intestazioni e valori", () => {
    const rows = parseCsv("\uFEFFDisplay Name,Seed,Public Slug\r\nAda DEMO,1,ada-demo\r\n");
    const validated = validateParticipantRows(rows);
    expect(validated[0].errors).toEqual([]);
    expect(validated[0].normalized).toMatchObject({ display_name: "Ada DEMO", seed: 1, public_slug: "ada-demo" });
  });
  it("segnala duplicati di nomi e teste di serie", () => {
    const validated = validateParticipantRows(parseCsv("display_name,seed\nAda,1\nada,1\n"));
    expect(validated[1].errors).toContain("Nome duplicato nel file.");
    expect(validated[1].errors).toContain("Testa di serie duplicata nel file.");
  });
  it("non accetta nomi vuoti o slug non sicuri", () => {
    const validated = validateParticipantRows(parseCsv("display_name,public_slug\nA,<script>\n"));
    expect(validated[0].errors.length).toBeGreaterThan(0);
  });
  it("calcola un checksum stabile per la deduplicazione dei file", () => {
    expect(checksum("a,b\n1,2\n")).toBe(checksum("a,b\n1,2\n"));
    expect(checksum("a,b\n1,2\n")).not.toBe(checksum("a,b\n2,1\n"));
  });
});
