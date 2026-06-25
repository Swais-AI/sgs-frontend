"use server";

import { signIn, signOut } from "@/auth";
import { cookies } from "next/headers";

export async function continueWithGoogle(formData: FormData) {
  const rawRole = formData.get("role");
  const role = typeof rawRole === "string" && rawRole.trim() ? rawRole : "guest";

  // Store role in a short-lived cookie so it survives the OAuth round-trip
  // (query params in redirectTo can be dropped by the OAuth callback)
  const cookieStore = await cookies();
  cookieStore.set("selected_role", role, { httpOnly: true, path: "/", maxAge: 300 });

  await signIn("google", {
    redirectTo: `/dashboard?role=${encodeURIComponent(role)}`,
  });
}

export async function logout() {
  await signOut({
    redirectTo: "/",
  });
}
