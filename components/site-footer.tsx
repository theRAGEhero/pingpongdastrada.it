import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <p className="eyebrow">Bologna · spazio pubblico · sport per tutte e tutti</p>
            <h2 className="display footer-title">Ci vediamo al tavolo.</h2>
          </div>
          <div>
            <p>La piattaforma è open source e appartiene alla comunità. I contenuti crescono solo con dati verificati e condivisione.</p>
            <div className="footer-links">
              <Link href="/progetti#privacy">Privacy</Link>
              <Link href="/progetti#open-source">Open source <ArrowUpRight size={14} aria-hidden="true" /></Link>
              <Link href="/admin">Organizzatori</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© Ping Pong da Strada · Bologna</span>
          <span>Il miglior effetto è l’amicizia.</span>
          <span>Software AGPL-3.0 · Mappa © OpenStreetMap</span>
        </div>
      </div>
    </footer>
  );
}
