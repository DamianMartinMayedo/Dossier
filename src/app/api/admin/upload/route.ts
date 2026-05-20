import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin, createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_BUCKETS = ["projects", "profile", "empresas"] as const;
type AllowedBucket = (typeof ALLOWED_BUCKETS)[number];
const DEFAULT_BUCKET: AllowedBucket = "projects";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function resolveBucket(value: FormDataEntryValue | null): AllowedBucket {
  if (typeof value !== "string") return DEFAULT_BUCKET;
  if ((ALLOWED_BUCKETS as readonly string[]).includes(value)) {
    return value as AllowedBucket;
  }
  return DEFAULT_BUCKET;
}

export async function POST(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Tipo no permitido: ${file.type}. Usa PNG, JPG, WebP, GIF o SVG.` },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: `El archivo pesa más de 10 MB.` },
      { status: 400 }
    );
  }

  // Bucket: viene del FormData (`bucket`). Validado contra ALLOWED_BUCKETS,
  // si llega cualquier otra cosa cae a "projects" por defecto.
  const bucket = resolveBucket(formData.get("bucket"));

  const ext = file.name.split(".").pop() ?? "jpg";
  const fileName = `${uuidv4()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const supabase = createAdminClient();
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return NextResponse.json({ url: publicUrl });
}

export async function DELETE(req: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  const body = (await req.json()) as { paths: string[]; bucket?: string };
  if (!Array.isArray(body.paths) || body.paths.length === 0) {
    return NextResponse.json({ error: "No paths provided" }, { status: 400 });
  }

  const bucket = resolveBucket(body.bucket ?? null);

  const supabase = createAdminClient();
  const { error } = await supabase.storage.from(bucket).remove(body.paths);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
