import Link from "next/link";

const links = [
  ["/tornei", "Tornei"],
  ["/giocatori", "Giocatori"],
  ["/classifiche", "Classifiche"],
  ["/statistiche", "Statistiche"],
  ["/mappa", "Mappa"],
  ["/eventi", "Eventi"],
  ["/progetti", "Comunità"],
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Ping Pong da Strada, home">
          <span className="brand-ball" aria-hidden="true" />
          <span>Ping Pong<br />da Strada</span>
        </Link>
        <nav className="desktop-nav" aria-label="Navigazione principale">
          {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Apri il menu">Menu</summary>
          <nav aria-label="Navigazione mobile">
            {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
            <Link href="/admin">Area organizzatori</Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
