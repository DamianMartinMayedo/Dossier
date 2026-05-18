import { createServerClient } from "@supabase/ssr";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createClient as createUserServerClient } from "./server";

/**
 * Service-role client. Bypasses RLS. Only use AFTER `requireAdmin()`.
 *
 * Note: the service-role key is unauthenticated and shares no auth state
 * with the request — use a plain supabase-js client, not the SSR variant.
 */
export function createAdminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * SSR client with admin's session cookies. Used to identify the caller.
 * Note: this still reads cookies via next/headers, so it works in API routes.
 */
async function createSessionClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op: route handlers don't always allow mutating cookies.
        },
      },
    }
  );
}

/**
 * Validates that the current request is from the configured admin user.
 * Returns `null` if allowed, or a `Response` (401/500) to short-circuit.
 *
 * Usage in API routes:
 *   const denied = await requireAdmin();
 *   if (denied) return denied;
 */
export async function requireAdmin(): Promise<Response | null> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return Response.json(
      { error: "ADMIN_EMAIL no configurado" },
      { status: 500 }
    );
  }

  const supabase = await createSessionClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  return null;
}

/**
 * Server-side helper to check admin status from Server Components / layouts.
 * Returns the email if admin, otherwise `null`.
 */
export async function getAdminUser(): Promise<string | null> {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return null;

  const supabase = await createUserServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    return null;
  }
  return user.email!;
}
