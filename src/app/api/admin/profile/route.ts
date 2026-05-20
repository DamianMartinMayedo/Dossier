import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin, createAdminClient } from "@/lib/supabase/admin";

interface ProfilePayload {
  name?: string;
  role?: string;
  bio?: string;
  avatar?: string | null;
  skills?: string[];
  services?: string[];
  languages?: string[];
  formacion?: { label: string; title: string; subtitle: string }[];
  stats?: { num: string; label: string }[];
  social_links?: Record<string, string>;
}

function isStrArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function validate(body: unknown): { ok: true; data: ProfilePayload } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Payload inválido" };
  }
  const b = body as Record<string, unknown>;
  const out: ProfilePayload = {};

  if (b.name !== undefined) {
    if (typeof b.name !== "string" || b.name.trim().length === 0) {
      return { ok: false, error: "El nombre no puede estar vacío" };
    }
    out.name = b.name.trim();
  }
  if (b.role !== undefined) {
    if (typeof b.role !== "string") return { ok: false, error: "role debe ser texto" };
    out.role = b.role;
  }
  if (b.bio !== undefined) {
    if (typeof b.bio !== "string") return { ok: false, error: "bio debe ser texto" };
    out.bio = b.bio;
  }
  if (b.avatar !== undefined) {
    if (b.avatar !== null && typeof b.avatar !== "string") {
      return { ok: false, error: "avatar inválido" };
    }
    out.avatar = b.avatar as string | null;
  }
  if (b.skills !== undefined) {
    if (!isStrArray(b.skills)) return { ok: false, error: "skills debe ser lista de texto" };
    out.skills = b.skills;
  }
  if (b.services !== undefined) {
    if (!isStrArray(b.services)) return { ok: false, error: "services debe ser lista de texto" };
    out.services = b.services;
  }
  if (b.languages !== undefined) {
    if (!isStrArray(b.languages)) return { ok: false, error: "languages debe ser lista de texto" };
    out.languages = b.languages;
  }
  if (b.formacion !== undefined) {
    if (!Array.isArray(b.formacion)) return { ok: false, error: "formacion inválido" };
    for (const item of b.formacion) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof (item as Record<string, unknown>).label !== "string" ||
        typeof (item as Record<string, unknown>).title !== "string" ||
        typeof (item as Record<string, unknown>).subtitle !== "string"
      ) {
        return { ok: false, error: "formacion: cada item necesita label/title/subtitle" };
      }
    }
    out.formacion = b.formacion as ProfilePayload["formacion"];
  }
  if (b.stats !== undefined) {
    if (!Array.isArray(b.stats)) return { ok: false, error: "stats inválido" };
    for (const item of b.stats) {
      if (
        !item ||
        typeof item !== "object" ||
        typeof (item as Record<string, unknown>).num !== "string" ||
        typeof (item as Record<string, unknown>).label !== "string"
      ) {
        return { ok: false, error: "stats: cada item necesita num/label" };
      }
    }
    out.stats = b.stats as ProfilePayload["stats"];
  }
  if (b.social_links !== undefined) {
    if (!b.social_links || typeof b.social_links !== "object") {
      return { ok: false, error: "social_links inválido" };
    }
    out.social_links = b.social_links as Record<string, string>;
  }

  return { ok: true, data: out };
}

export async function GET() {
  const authError = await requireAdmin();
  if (authError) return authError;

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("profile").select("*").single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ profile: data });
}

export async function PUT(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const validated = validate(body);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Hay una única row de profile. La identificamos por id.
  const { data: existing } = await supabase.from("profile").select("id").single();
  if (!existing) {
    return NextResponse.json({ error: "No existe row de profile" }, { status: 404 });
  }

  const { error } = await supabase
    .from("profile")
    .update(validated.data)
    .eq("id", existing.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Refrescamos páginas que muestran profile.
  revalidatePath("/sobre-mi");
  revalidatePath("/");

  return NextResponse.json({ ok: true });
}
