import { describe, expect, it } from "vitest";
import { csvCell, icsDate, icsEscape, toCsv } from "@/lib/domain/export";

describe("formati di export", () => {
  it("neutralizza separatori e interruzioni di riga CSV", () => {
    expect(csvCell('Nome, "Nick"')).toBe('"Nome, ""Nick"""');
    expect(csvCell("=HYPERLINK(\"https://example.test\")")).toBe("\"'=HYPERLINK(\"\"https://example.test\"\")\"");
    expect(csvCell(-1)).toBe("-1");
    expect(toCsv(["a","b"],[["1","2"]])).toContain("a,b\r\n1,2");
  });
  it("esegue escaping dei campi ICS e usa date UTC", () => {
    expect(icsEscape("Riga 1\nRiga 2, tavolo; parco")).toBe("Riga 1\\nRiga 2\\, tavolo\\; parco");
    expect(icsDate("2026-05-25T15:30:00.000Z")).toBe("20260525T153000Z");
  });
});
