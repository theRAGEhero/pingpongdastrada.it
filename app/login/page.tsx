import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "Accesso organizzatori" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");
  return <section className="section"><div className="container grid place-items-center"><div className="w-full max-w-md"><p className="eyebrow">Area riservata</p><h1 className="display my-4 text-5xl">Gestione collettiva.</h1><p className="muted mb-8">L’accesso è riservato agli organizzatori autorizzati. Le azioni importanti vengono registrate nell’audit trail.</p><div className="card card-solid"><LoginForm /></div></div></div></section>;
}
