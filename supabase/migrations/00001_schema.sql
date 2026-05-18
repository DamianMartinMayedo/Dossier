-- ============================================================
-- Esquema para damianmartin.es
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. Tabla de proyectos
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('principal', 'secundario')) DEFAULT 'principal',
  description TEXT DEFAULT '',
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  client TEXT,
  year TEXT,
  featured BOOLEAN DEFAULT false,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_order ON projects("order");
CREATE INDEX idx_projects_slug ON projects(slug);

-- 2. Tabla de perfil (Sobre mí)
CREATE TABLE profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Damián Martín',
  bio TEXT DEFAULT '',
  avatar TEXT,
  skills TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}'
);

INSERT INTO profile (name, bio, skills)
VALUES (
  'Damián Martín',
  'Diseñador especializado en UI/UX, branding y desarrollo de producto digital. Ayudo a empresas y startups a crear experiencias digitales con propósito.',
  ARRAY['UI/UX Design', 'Branding', 'Diseño de producto', 'Prototipado', 'Design Systems']
);

-- 3. Tabla de mensajes de contacto
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_read ON contact_messages(read);
CREATE INDEX idx_messages_created ON contact_messages(created_at DESC);

-- 4. Storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('projects', 'projects', true, 52428800, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('profile', 'profile', true, 10485760, ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: lectura pública
CREATE POLICY "Storage: lectura pública projects"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'projects');

CREATE POLICY "Storage: lectura pública profile"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'profile');

-- Storage RLS: escritura solo autenticados
CREATE POLICY "Storage: escritura projects autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'projects');

CREATE POLICY "Storage: escritura profile autenticados"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'profile');

CREATE POLICY "Storage: actualizar projects autenticados"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'projects');

CREATE POLICY "Storage: actualizar profile autenticados"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'profile');

CREATE POLICY "Storage: eliminar projects autenticados"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'projects');

CREATE POLICY "Storage: eliminar profile autenticados"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'profile');

-- 5. Políticas RLS para tablas

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Proyectos visibles para todos" ON projects FOR SELECT USING (true);
CREATE POLICY "Proyectos editables por autenticados" ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Proyectos actualizables por autenticados" ON projects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Proyectos eliminables por autenticados" ON projects FOR DELETE TO authenticated USING (true);

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Perfil visible para todos" ON profile FOR SELECT USING (true);
CREATE POLICY "Perfil editable por autenticados" ON profile FOR ALL TO authenticated USING (true);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Mensajes insertables por todos" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Mensajes visibles por autenticados" ON contact_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Mensajes editables por autenticados" ON contact_messages FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Mensajes eliminables por autenticados" ON contact_messages FOR DELETE TO authenticated USING (true);
