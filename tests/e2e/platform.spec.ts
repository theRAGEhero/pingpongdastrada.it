import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function login(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.test");
  await page.getByLabel("Password").fill("test-password-12345");
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("il database vuoto mostra stati vuoti onesti e pagine accessibili", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Ping pong da strada/i })).toBeVisible();
  await expect(page.getByText("Le statistiche stanno arrivando")).toBeVisible();
  await expect(page.getByText("DEMO · dati fittizi")).toHaveCount(0);
  for (const route of ["/","/tornei","/giocatori","/classifiche","/statistiche","/mappa","/eventi","/progetti"]) {
    await page.goto(route);
    const violations = (await new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa"]).analyze()).violations;
    expect(violations, `${route}: ${violations.map((item) => item.id).join(", ")}`).toEqual([]);
  }
});

test("un organizzatore crea un torneo, inserisce risultati e lo pubblica", async ({ page }) => {
  await login(page);
  await page.goto("/admin/tornei");
  await page.getByText("Nuovo torneo", { exact: true }).click();
  await page.getByLabel("Nome del torneo").fill("Torneo E2E");
  await page.getByLabel("Data e ora").fill("2027-05-25T15:00");
  await page.getByRole("button", { name: "Crea come bozza" }).click();
  await expect(page).toHaveURL(/\/admin\/tornei\/[a-f0-9-]+/);
  const tournamentUrl = page.url();
  for (const [name,seed] of [["Alice Test","1"],["Bruno Test","2"],["Chiara Test","3"],["Dario Test","4"]]) {
    await page.getByLabel("Nome operativo").fill(name);
    await page.getByLabel("Testa di serie").fill(seed);
    await page.getByRole("button", { name: "Aggiungi partecipante" }).click();
    await expect(page.getByRole("listitem").filter({ hasText: name })).toBeVisible();
  }
  await page.getByRole("button", { name: "Genera abbinamenti" }).click();
  await expect(page.getByText("Turno 1 · incontro 1", { exact: true })).toBeVisible();
  const first = page.locator("form").filter({ has: page.locator(`input[name="homeScore"]`) }).nth(0);
  await first.locator(`input[name="homeScore"]`).fill("2");
  await first.locator(`input[name="awayScore"]`).fill("0");
  await first.getByRole("button", { name: "Salva risultato" }).click();
  await expect(first.getByText("Risultato salvato", { exact: false })).toBeVisible();
  const second = page.locator("form").filter({ has: page.locator(`input[name="homeScore"]`) }).nth(1);
  await second.locator(`input[name="homeScore"]`).fill("1");
  await second.locator(`input[name="awayScore"]`).fill("2");
  await second.getByRole("button", { name: "Salva risultato" }).click();
  await expect(second.getByText("Risultato salvato", { exact: false })).toBeVisible();
  const final = page.locator("form").filter({ has: page.locator(`input[name="homeScore"]`) }).nth(2);
  await final.locator(`input[name="homeScore"]`).fill("2");
  await final.locator(`input[name="awayScore"]`).fill("1");
  await final.getByRole("button", { name: "Salva risultato" }).click();
  await page.getByLabel("Stato editoriale").selectOption("completed");
  await page.getByRole("button", { name: "Salva stato" }).click();
  await expect(page.getByText("Stato aggiornato.", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Vista pubblica" }).click();
  await expect(page.getByRole("heading", { name: "Torneo E2E", exact: true })).toBeVisible();
  await expect(page.getByText("Profilo privato").first()).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/statistiche");
  await expect(page.locator(".metric-value").first()).toHaveText("1");
  await page.goto(tournamentUrl);
  await page.getByRole("button", { name: "Esci" }).click();
});

test("il CSV passa dalla revisione e non crea profili pubblici", async ({ page }) => {
  await login(page);
  await page.goto("/admin/tornei");
  await page.getByText("Nuovo torneo", { exact: true }).click();
  await page.getByLabel("Nome del torneo").fill("Torneo CSV E2E");
  await page.getByLabel("Data e ora").fill("2027-06-01T15:00");
  await page.getByLabel("Formato").selectOption("round_robin");
  await page.getByRole("button", { name: "Crea come bozza" }).click();
  await page.getByRole("link", { name: "Importa da CSV" }).click();
  await page.getByLabel("Fonte e provenienza").fill("Test automatico E2E");
  await page.getByLabel("File CSV").setInputFiles({ name: "partecipanti.csv", mimeType: "text/csv", buffer: Buffer.from("display_name,seed,public_slug\nElia Test,1,\nFranca Test,2,\n") });
  await page.getByRole("button", { name: "Carica e revisiona" }).click();
  await expect(page.getByText("Revisione manuale", { exact: false })).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(2);
  await page.getByRole("button", { name: "Conferma e aggiungi al torneo" }).click();
  await expect(page.getByText("Revisione manuale · stato imported", { exact: true })).toBeVisible();
  await page.goto("/giocatori");
  await expect(page.getByText("Nessun profilo pubblico")).toBeVisible();
});

test("la navigazione mobile non crea overflow orizzontale", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByLabel("Apri il menu").click();
  await expect(page.getByRole("navigation", { name: "Navigazione mobile" })).toBeVisible();
  await page.getByRole("navigation", { name: "Navigazione mobile" }).getByRole("link", { name: "Tornei" }).click();
  await expect(page).toHaveURL(/\/tornei/);
});
