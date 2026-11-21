import Link from "next/link";
import { LayoutDashboard, Map, Trophy, Users, FileUp, CalendarDays, LogOut } from "lucide-react";
import { requireRole } from "@/lib/auth-utils";
import { logout } from "@/lib/actions/auth";

const nav = [
  ["/admin", "Panoramica", LayoutDashboard],
  ["/admin/tornei", "Tornei", Trophy],
  ["/admin/contenuti", "Eventi e contenuti", CalendarDays],
  ["/admin/giocatori", "Profili", Users],
  ["/admin/importazioni", "Importazioni", FileUp],
  ["/admin/sedi", "Moderazione sedi", Map],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole();
  return <div className="min-h-screen bg-[#ece9df]"><div className="border-b-2 border-ink bg-lime"><div className="container py-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Area organizzatori</p><p className="m-0 text-sm">Accesso: <strong>{user.name}</strong> · ruolo {user.role}</p></div><form action={logout}><button className="btn btn-outline btn-small"><LogOut size={15} /> Esci</button></form></div><nav className="mt-5 flex gap-2 overflow-x-auto pb-2" aria-label="Amministrazione">{nav.map(([href,label,Icon]) => <Link className="btn btn-small btn-outline shrink-0 !bg-paper" href={href} key={href}><Icon size={15} />{label}</Link>)}</nav></div></div><div className="container py-10">{children}</div></div>;
}
