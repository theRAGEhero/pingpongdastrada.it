import { auth } from "@/auth";
import type { Role } from "@/lib/db/schema";
import { redirect } from "next/navigation";

export async function requireRole(roles: Role[] = ["admin", "organizer", "editor", "reviewer"]) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!roles.includes(session.user.role)) redirect("/admin?errore=autorizzazione");
  return session.user;
}
