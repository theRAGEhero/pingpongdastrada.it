"use client";

import { useActionState } from "react";
import { authenticate } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(authenticate, {});
  return <form action={action} className="form-grid">{state.error && <p className="form-error" role="alert">{state.error}</p>}<div className="field"><label htmlFor="email">Email</label><input className="input" id="email" name="email" type="email" autoComplete="username" required /></div><div className="field"><label htmlFor="password">Password</label><input className="input" id="password" name="password" type="password" autoComplete="current-password" required /></div><button className="btn btn-primary" disabled={pending}>{pending ? "Accesso…" : "Accedi"}</button></form>;
}
