import { createHash } from "node:crypto";
import { parse } from "csv-parse/sync";
import { z } from "zod";

export type CsvRow = Record<string, string>;

export function parseCsv(source: string): CsvRow[] {
  return parse(source, {
    columns: (headers: string[]) => headers.map((header) => header.trim().toLowerCase().replace(/\s+/g, "_")),
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_column_count: false,
  }) as CsvRow[];
}

export function checksum(source: string) {
  return createHash("sha256").update(source).digest("hex");
}

const participantSchema = z.object({
  display_name: z.string().trim().min(2).max(80),
  seed: z.coerce.number().int().positive().optional().or(z.literal("")),
  public_slug: z.string().trim().regex(/^[a-z0-9-]+$/).optional().or(z.literal("")),
});

export function validateParticipantRows(rows: CsvRow[]) {
  const seenNames = new Set<string>();
  const seenSeeds = new Set<number>();
  return rows.map((row, index) => {
    const parsed = participantSchema.safeParse(row);
    const errors = parsed.success ? [] : parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    if (parsed.success) {
      const normalizedName = parsed.data.display_name.toLocaleLowerCase("it");
      if (seenNames.has(normalizedName)) errors.push("Nome duplicato nel file.");
      seenNames.add(normalizedName);
      if (parsed.data.seed !== "" && parsed.data.seed !== undefined) {
        if (seenSeeds.has(parsed.data.seed)) errors.push("Testa di serie duplicata nel file.");
        seenSeeds.add(parsed.data.seed);
      }
    }
    return { rowNumber: index + 2, row, normalized: parsed.success ? parsed.data : null, errors };
  });
}
