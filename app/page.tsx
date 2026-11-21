import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import { getHomeData, getProjects } from "@/lib/data/public";
import { formatDate } from "@/lib/utils";
import { HeroArt } from "@/components/hero-art";
import { TournamentCard } from "@/components/tournament-card";
import { PublicMap } from "@/components/public-map";
import { DemoBadge, DemoNotice, EmptyState, SectionHeading, VerificationBadge } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [data, projects] = await Promise.all([getHomeData(), getProjects()]);
  const metrics = [
    { value: data.stats.tournaments, label: "Tornei registrati" },
    { value: data.stats.matches, label: "Partite documentate" },
    { value: data.stats.participations, label: "Partecipazioni ai tornei" },
    { value: data.stats.venues, label: "Luoghi verificati" },
  ];
  const hasMetrics = metrics.some((metric) => metric.value > 0);

  return <>
    {data.stats.hasDemo && <DemoNotice />}
    <section className="hero">
      <div className="container hero-inner">
        <div>
          <p className="eyebrow">Bologna · dal 30 settembre 2023</p>
          <h1 className="display hero-title">Ping pong <span>da strada.</span></h1>
          <p className="hero-copy">Una comunità che si incontra nei parchi e negli spazi pubblici per giocare, conoscersi e prendersi cura della città. Il livello non conta: il primo posto è dell’amicizia.</p>
          <div className="hero-actions">
            <Link href="/eventi" className="btn btn-primary">Gioca con noi <ArrowRight size={18} /></Link>
            <Link href="/tornei" className="btn btn-light">Scopri i tornei</Link>
            <Link href="/mappa" className="btn btn-outline">Trova un tavolo</Link>
          </div>
          <p className="mt-5 text-sm text-[#d8e6df]">Esplora liberamente. La registrazione serve solo a chi gestisce i contenuti.</p>
        </div>
        <HeroArt />
      </div>
      <a href="#comunita" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-bold md:flex">Scendi al tavolo <ArrowDown size={15} /></a>
    </section>

    <section className="section" id="comunita">
      <div className="container">
        <SectionHeading eyebrow="La comunità in numeri" title="Contiamo le esperienze, non le chiacchiere." text="Ogni numero deriva da tornei e risultati effettivamente registrati. I dati mancanti restano dichiaratamente mancanti." />
        {hasMetrics ? <div className="metric-strip">{metrics.filter((metric) => metric.value > 0).map((metric) => <div className="metric" key={metric.label}><strong className="metric-value">{metric.value}</strong><span className="metric-label">{metric.label}</span></div>)}</div> : <EmptyState title="Le statistiche stanno arrivando">Non ci sono ancora tornei pubblicati con dati strutturati. L’archivio potrà crescere tramite i moduli CSV, dopo una revisione dei dati.</EmptyState>}
        {data.stats.uniqueParticipants > 0 && <p className="muted mt-4 text-sm">Partecipanti unici collegati ai record disponibili: <strong>{data.stats.uniqueParticipants}</strong>. La copertura dipende dallo storico importato.</p>}
      </div>
    </section>

    <section className="section pt-0">
      <div className="container">
        <SectionHeading eyebrow="Prossimi appuntamenti" title="Prepariamo il tavolo." action={{ href: "/tornei", label: "Tutti i tornei" }} />
        {data.upcoming.length ? <div className="grid grid-3">{data.upcoming.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)}</div> : <EmptyState title="Nessun torneo in programma">Il calendario è ancora vuoto. Quando una nuova data sarà confermata dagli organizzatori, la troverai qui.</EmptyState>}
      </div>
    </section>

    {data.latest.length > 0 && <section className="section orange-section"><div className="container"><SectionHeading eyebrow="Dall’archivio" title="L’ultima partita è già storia." action={{ href: "/tornei?stato=completed", label: "Risultati e archivio" }} /><div className="grid grid-2">{data.latest.map((tournament) => <TournamentCard key={tournament.id} tournament={tournament} />)}</div></div></section>}

    <section className="section">
      <div className="container split split-wide">
        <div>
          <SectionHeading eyebrow="Dove giocare" title="La città è la nostra sala da gioco." text="Tavoli pubblici, spazi verificati e informazioni utili. Le segnalazioni della comunità passano sempre da una revisione." />
          <div className="map-preview"><PublicMap venues={data.venues} compact /></div>
          <Link href="/mappa" className="btn btn-dark mt-5">Apri la mappa <MapPin size={18} /></Link>
        </div>
        <div className="card card-lime card-solid">
          <Sparkles size={32} aria-hidden="true" />
          <h3>Conosci un tavolo?</h3>
          <p>Aiutaci a tenere la mappa utile: invia una segnalazione con il luogo e ciò che hai visto. Non pubblichiamo nulla automaticamente.</p>
          <Link href="/mappa#segnala" className="btn btn-outline mt-4">Segnala un luogo <ArrowUpRight size={17} /></Link>
        </div>
      </div>
    </section>

    <section className="section dark-section">
      <div className="container">
        <SectionHeading eyebrow="Tappe collettive" title="Una storia fatta insieme." text="Pochi momenti essenziali. La ricostruzione è condivisa e distingue ciò che è verificato da ciò che è ancora in revisione." />
        <div className="milestones">{data.milestones.map((milestone) => <article className="milestone" key={milestone.id}><time className="milestone-date" dateTime={milestone.occurredOn}>{formatDate(`${milestone.occurredOn}T12:00:00Z`)}</time><h3>{milestone.title}</h3><p className="muted">{milestone.description}</p><div><VerificationBadge status={milestone.verificationStatus} />{milestone.isDemo && <DemoBadge />}</div></article>)}</div>
        <p className="mt-5 text-sm text-[#c0ccc5]">Le tappe indicate come «in verifica» non costituiscono una ricostruzione storica ufficialmente approvata.</p>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <SectionHeading eyebrow="Attività e progetti" title="Più di un torneo." action={{ href: "/progetti", label: "Le iniziative" }} />
        {projects.length ? <div className="grid grid-3">{projects.slice(0,3).map((project) => <article className="card" key={project.id}>{project.isDemo && <DemoBadge />}<h3>{project.title}</h3><p className="muted">{project.summary}</p></article>)}</div> : <EmptyState title="Progetti da raccontare">Crowdfunding, collaborazioni e iniziative sociali saranno pubblicati con fonti e risultati verificabili.</EmptyState>}
      </div>
    </section>

    <section className="section lime-section">
      <div className="container section-heading mb-0">
        <div><p className="eyebrow">Il miglior effetto è l’amicizia</p><h2 className="display">Porta la voglia di giocare. Al resto pensiamo insieme.</h2></div>
        <div className="flex flex-wrap gap-3"><Link href="/eventi" className="btn btn-dark">Vedi gli appuntamenti</Link><Link href="/mappa" className="btn btn-outline">Trova il tavolo più vicino</Link></div>
      </div>
    </section>
  </>;
}
