import { createAdminClient, requireAdmin } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * CRUD de colaboraciones (logos de empresas que aparecen en el marquee
 * "Colaboraciones" del home).
 *
 * POST   con body { id?, name, image_url, order } → upsert
 * DELETE ?id=... → borra fila (la imagen en Storage se borra desde el cliente
 *                 vía /api/admin/upload DELETE).
 *
 * Tras cualquier mutación se revalida la home, donde vive `<CollabGrid />`.
 */

interface Body {
  id?: string;
  name?: unknown;
  image_url?: unknown;
  order?: unknown;
}

function validate(body: Body): { name: string; image_url: string; order: number } | string {
  if (typeof body.name !== "string" || body.name.trim().length === 0) {
    return "El nombre es obligatorio";
  }
  if (typeof body.image_url !== "string" || body.image_url.trim().length === 0) {
    return "Falta la imagen";
  }
  const order =
    typeof body.order === "number"
      ? body.order
      : typeof body.order === "string" && body.order.trim() !== ""
        ? Number(body.order)
        : 0;
  if (!Number.isFinite(order)) return "El orden tiene que ser numérico";
  return { name: body.name.trim(), image_url: body.image_url.trim(), order };
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const validated = validate(body);
  if (typeof validated === "string") {
    return NextResponse.json({ error: validated }, { status: 400 });
  }

  const supabase = createAdminClient();
  const payload = { ...validated, updated_at: new Date().toISOString() };

  if (body.id) {
    const { data, error } = await supabase
      .from("collaborations")
      .update(payload)
      .eq("id", body.id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    revalidatePath("/");
    return NextResponse.json(data);
  }

  const { data, error } = await supabase
    .from("collaborations")
    .insert(payload)
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  revalidatePath("/");
  return NextResponse.json(data);
}

/**
 * PATCH /api/admin/empresas
 * body: { items: [{ id: string, order: number }, ...] }
 *
 * Actualización masiva de `order` cuando el usuario reordena por drag.
 * Hacemos los updates en paralelo (Supabase no soporta multi-row update
 * con valores distintos en una sola query sin raw SQL).
 */
export async function PATCH(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: { items?: Array<{ id: unknown; order: unknown }> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Falta `items`" }, { status: 400 });
  }

  const updates = body.items.map((it) => {
    if (typeof it.id !== "string" || typeof it.order !== "number") return null;
    return { id: it.id, order: it.order };
  });
  if (updates.some((u) => u === null)) {
    return NextResponse.json({ error: "Items mal formados" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const results = await Promise.all(
    (updates as Array<{ id: string; order: number }>).map((u) =>
      supabase
        .from("collaborations")
        .update({ order: u.order, updated_at: now })
        .eq("id", u.id),
    ),
  );
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Falta el id" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("collaborations").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
