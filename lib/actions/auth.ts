"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";

export type LoginState = { error?: string };
export async function authenticate(_previous: LoginState, formData: FormData): Promise<LoginState> {
  try {
    await signIn("credentials", { email: formData.get("email"), password: formData.get("password"), redirectTo: "/admin" });
    return {};
  } catch (error) {
    if (error instanceof AuthError) return { error: "Email o password non corretti." };
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
