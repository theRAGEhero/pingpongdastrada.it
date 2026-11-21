"use client";

import { useActionState } from "react";
import { moderateVenueSuggestionAction } from "@/lib/actions/content";

export function SuggestionModeration({ id }: { id: string }) {
  const [state, action, pending] = useActionState(moderateVenueSuggestionAction, {});
  return <form action={action} className="mt-4"><input type="hidden" name="id" value={id} /><div className="flex flex-wrap gap-2"><button className="btn btn-dark btn-small" name="status" value="approved" disabled={pending}>Verificata, da inserire</button><button className="btn btn-outline btn-small" name="status" value="rejected" disabled={pending}>Non confermata</button></div>{state.error && <p className="form-error">{state.error}</p>}{state.success && <p className="form-success">{state.success}</p>}</form>;
}
