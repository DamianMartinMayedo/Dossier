-- ============================================================
-- 00002 — Bloques de contenido para proyectos principales
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS subtitle TEXT,
  ADD COLUMN IF NOT EXISTS header_image TEXT,
  ADD COLUMN IF NOT EXISTS content JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Garantizar que `content` siempre sea un array JSONB (no objeto, no número).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'projects_content_is_array'
  ) THEN
    ALTER TABLE projects
      ADD CONSTRAINT projects_content_is_array
      CHECK (jsonb_typeof(content) = 'array');
  END IF;
END$$;
