import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "Ping Pong da Strada · Bologna", template: "%s · Ping Pong da Strada" },
  description: "La piattaforma open source della comunità di ping pong negli spazi pubblici di Bologna. Tornei, partite, luoghi e amicizia.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: { title: "Ping Pong da Strada", description: "Il miglior effetto è l’amicizia.", locale: "it_IT", type: "website" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#contenuto">Vai al contenuto</a>
        <SiteHeader />
        <main id="contenuto">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
