import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <section className="page-hero"><div className="container"><p className="eyebrow">{eyebrow}</p><h1 className="display page-title">{title}</h1><div className="page-intro">{children}</div></div></section>;
}

export function SectionHeading({ eyebrow, title, text, action }: { eyebrow: string; title: string; text?: string; action?: { href: string; label: string } }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2 className="display">{title}</h2></div>{action ? <Link className="btn btn-outline" href={action.href}>{action.label}<ArrowRight size={17} /></Link> : text ? <p className="muted">{text}</p> : null}</div>;
}

export function EmptyState({ title = "Dati non ancora inseriti", children, action }: { title?: string; children?: React.ReactNode; action?: { href: string; label: string } }) {
  return <div className="empty-state"><Inbox aria-hidden="true" className="mb-3" /><h3>{title}</h3><p className="muted">{children ?? "Questa sezione verrà popolata soltanto con informazioni documentate. Nel frattempo preferiamo lasciare uno spazio vuoto, non riempirlo di numeri."}</p>{action && <Link className="btn btn-outline btn-small mt-4" href={action.href}>{action.label}<ArrowRight size={15} /></Link>}</div>;
}

export function DemoBadge() { return <span className="badge badge-demo">DEMO · dati fittizi</span>; }
export function VerificationBadge({ status }: { status: string }) {
  return status === "verified" ? <span className="badge badge-verify">Verificato</span> : <span className="badge badge-reported">In verifica</span>;
}

export function DemoNotice() {
  return <div className="container section-compact pb-0"><div className="demo-banner" role="note">Stai vedendo dati dimostrativi chiaramente marcati DEMO. Non descrivono persone, eventi o risultati reali.</div></div>;
}
