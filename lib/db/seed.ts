import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { cities, milestones } from "./schema";

export async function ensureBaseData() {
  const city = await db.query.cities.findFirst({ where: eq(cities.slug, "bologna") });
  const cityId = city?.id ?? randomUUID();
  if (!city) await db.insert(cities).values({ id: cityId, name: "Bologna", slug: "bologna", region: "Emilia-Romagna" });

  const initialMilestones = [
    {
      occurredOn: "2023-09-30",
      title: "Nasce il gruppo WhatsApp",
      description: "Il primo spazio informale per organizzare partite spontanee a Bologna.",
    },
    {
      occurredOn: "2025-05-25",
      title: "Il primo torneo organizzato",
      description: "La comunità aggiunge ai giochi spontanei un appuntamento organizzato collettivamente.",
    },
  ];
  for (const item of initialMilestones) {
    const existing = await db.query.milestones.findFirst({ where: eq(milestones.occurredOn, item.occurredOn) });
    if (!existing) {
      await db.insert(milestones).values({
        id: randomUUID(), cityId, ...item, status: "published", verificationStatus: "reported",
        source: "Indicazione del committente · ricostruzione in revisione con gli organizzatori",
      });
    }
  }
}
