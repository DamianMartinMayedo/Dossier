import { createAdminClient, requireAdmin } from "@/lib/supabase/admin";
import { validateProjectPayload } from "@/lib/utils";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

function revalidatePublicProjectPaths(slug?: string | null) {
  revalidatePath("/");
  revalidatePath("/proyectos");
  if (slug) revalidatePath(`/proyecto/${slug}`);
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { id, ...rest } = body as { id?: string } & Record<string, unknown>;

    const validation = validateProjectPayload(rest);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const payload = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    const supabase = createAdminClient();

    if (id) {
      const { data, error } = await supabase
        .from("projects")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) {
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "Ya existe un proyecto con ese slug" },
            { status: 409 }
          );
        }
        throw error;
      }
      revalidatePublicProjectPaths(data?.slug);
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("projects")
      .insert(payload)
      .select()
      .single();
    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un proyecto con ese slug" },
          { status: 409 }
        );
      }
      throw error;
    }
    revalidatePublicProjectPaths(data?.slug);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: existing } = await supabase
      .from("projects")
      .select("slug")
      .eq("id", id)
      .single();

    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) throw error;

    revalidatePublicProjectPaths(existing?.slug);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
