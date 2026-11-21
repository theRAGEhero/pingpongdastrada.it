# Ping Pong da Strada

Piattaforma open source, mobile-first e self-hostable per la comunità di Ping Pong da Strada a Bologna. Gestisce tornei, risultati, statistiche, profili facoltativi, luoghi, eventi e progetti senza trasformare le conversazioni private in contenuti pubblici.

**Il miglior effetto è l’amicizia.**

## Avvio locale

Requisiti: Node.js 24 o superiore e npm. SQLite è incluso tramite `better-sqlite3`; non servono servizi esterni.

```bash
npm install
npm run db:migrate
npm run dev
```

Apri <http://localhost:3000>. Il database iniziale non contiene tornei, giocatori, luoghi o eventi: le sezioni vuote mostrano esplicitamente che i dati non sono ancora stati inseriti. Le due milestone fornite dal committente sono marcate **in verifica**, non approvate ufficialmente.

### Creare un amministratore

Imposta credenziali locali forti, senza aggiungerle al Git:

```bash
ADMIN_EMAIL="organizzatori@example.it" \
ADMIN_PASSWORD="una-password-lunga-e-casuale" \
npm run db:bootstrap
```

In produzione imposta anche `AUTH_SECRET`. Per sviluppo, Auth.js usa un segreto esclusivamente locale già predisposto; non riutilizzarlo in produzione.

Accedi su `/login`. I ruoli previsti sono `admin`, `organizer`, `editor` e `reviewer`; il bootstrap crea un amministratore. La gestione di ulteriori account va eseguita direttamente nel database in questo MVP.

## Docker

```bash
cp .env.example .env
# Modifica .env e imposta un AUTH_SECRET casuale.
docker compose up --build -d
```

Dopo il primo avvio, crea l’amministratore nel volume Docker:

```bash
docker compose exec \
  -e ADMIN_EMAIL="organizzatori@example.it" \
  -e ADMIN_PASSWORD="una-password-lunga-e-casuale" \
  app node scripts/bootstrap-admin.mjs
```

Il database si trova nel volume `pingpong_data`. Le migrazioni vengono applicate automaticamente all’avvio. Non viene effettuato alcun deploy pubblico da questi comandi.

## Funzionalità

- Homepage editoriale responsive e navigazione accessibile.
- Tornei in bozza, in arrivo, in corso o conclusi, con ricerca e filtri.
- Eliminazione diretta con teste di serie e bye; girone all’italiana con numero pari o dispari di partecipanti.
- Avanzamento automatico dei vincitori, validazione dei set e classifiche derivate dai risultati.
- Import CSV dei partecipanti con checksum, provenienza, deduplicazione, errori per riga e conferma manuale.
- Profili pubblici opt-in, pseudonimi, statistiche personali e traguardi calcolati.
- Classifiche orientate alla partecipazione, oltre a partite, vittorie e percentuale.
- Dashboard con filtri per intervallo e sede, grafico e alternativa tabellare.
- Mappa Leaflet/OpenStreetMap, schede di verifica e segnalazioni moderate.
- Eventi con lista, calendario e download ICS.
- Progetti, crowdfunding documentato e milestone collettive.
- Area riservata con ruoli applicati lato server e audit trail.
- Export pubblico JSON/CSV anonimizzato ed export organizzatori per la portabilità.
- Seed DEMO opzionale e isolato, disabilitato per impostazione predefinita.

## Importare partecipanti

1. Crea un torneo e lascialo senza tabellone.
2. Apri **Amministrazione → Importazioni**.
3. Scarica `public/templates/partecipanti.csv` oppure usa questo formato:

```csv
display_name,seed,public_slug
Nome operativo,1,
Altro nome,2,nickname-esistente
```

`seed` e `public_slug` sono facoltativi. Lo slug può collegare soltanto un profilo già esistente. Il caricamento non crea profili pubblici e non cambia consensi o visibilità. Dopo il caricamento controlla l’anteprima e conferma esplicitamente. Un file con errori non può essere importato.

Limite: 1 MB e 500 righe. Non caricare conversazioni WhatsApp, trascrizioni, audio, numeri di telefono o dati di contatto.

## Dati WhatsApp e privacy

`archivio_completo_chat_e_vocali.csv`, se presente localmente, è escluso da Git, Docker e build. L’applicazione non lo legge. Nessuna riga dell’archivio è stata importata nei dati iniziali o nei test.

- Messaggi, vocali e contatti restano privati.
- Le partecipazioni operative sono riservate agli organizzatori finché non vengono collegate a un profilo pubblico valido.
- Un profilo richiede consenso documentato, visibilità pubblica e slug.
- Per una persona minorenne serve anche l’autorizzazione documentabile del tutore.
- Gli import grezzi sono accessibili soltanto nell’area riservata e separati dalle query pubbliche.
- Le statistiche derivano dai tornei registrati; l’appartenenza al gruppo non equivale alla partecipazione attiva.

La piattaforma offre controlli tecnici, ma gli organizzatori restano responsabili di base giuridica, informative, consensi e verifica dei contenuti prima di usare dati reali.

## Dati dimostrativi

Per provare la UI senza usare dati reali:

```bash
npm run db:demo
```

Il comando inserisce contenuti fittizi con `isDemo=true`, badge DEMO e avvisi espliciti. Non usarlo sul database di produzione. Per un controllo pulito usa un database separato:

```bash
DATABASE_PATH=./data/demo.db npm run db:migrate
DATABASE_PATH=./data/demo.db npm run db:demo
DATABASE_PATH=./data/demo.db npm run dev
```

## Export e backup

- Dettaglio torneo pubblico: export JSON; endpoint con `?format=csv` per i risultati pubblici.
- Dettaglio torneo organizzatore: export JSON completo; endpoint con `?format=csv` per i nomi operativi.
- `/api/public/export`: tutti i contenuti pubblici, senza consensi interni o identità private.
- `/api/admin/export`: portabilità amministrativa; esclude password, sessioni e righe grezze degli import.

Per un backup coerente è consigliato fermare temporaneamente l’applicazione e copiare il file SQLite e gli eventuali allegati privati in uno spazio protetto. Conserva i backup con accesso limitato e politiche di retention definite.

## Qualità

```bash
npm run typecheck
npm run lint
npm test
npx playwright install chromium  # soltanto alla prima esecuzione
npm run test:e2e
npm run build
```

I test end-to-end usano `data/e2e.db`, ricreato a ogni esecuzione, e credenziali fittizie locali. Coprono database vuoto, accessibilità automatica WCAG A/AA, navigazione mobile, gestione completa di un torneo e revisione CSV.

## Struttura

```text
app/                 pagine, area amministrativa ed endpoint
components/          componenti visuali e moduli operativi
lib/db/              schema Drizzle, connessione, migrazioni e seed
lib/domain/          algoritmi puri, CSV, privacy ed export
lib/services/        operazioni transazionali sui tornei
lib/actions/         server action autenticate e validate
lib/data/public.ts   query e DTO pubblici con filtri privacy
drizzle/             migrazioni SQL versionate
tests/               test unitari ed end-to-end
scripts/             migrazioni e bootstrap per il container
```

## Limiti dell’MVP

Non sono ancora inclusi: iscrizione pubblica con conferma, live scoring, QR check-in, gallerie fotografiche, Elo, import guidato di risultati/eventi/sedi, estrazione offline di eventi aggregati WhatsApp, adapter PostgreSQL, gestione account self-service e workflow multi-città completo. Le funzioni presenti non simulano queste integrazioni.

La scelta SQLite privilegia la semplicità e la portabilità del primo rilascio. Prima di un uso pubblico intenso valutare backup automatici, HTTPS, reverse proxy, rate limiting e migrazione a PostgreSQL.

## Licenza

AGPL-3.0-only. La mappa usa dati © OpenStreetMap contributors con attribuzione nell’interfaccia.
