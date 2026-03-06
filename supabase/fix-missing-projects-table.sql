-- =====================================================
-- FIX: Missing public.projects table in Supabase schema cache
-- Run this in Supabase Dashboard -> SQL Editor
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  about_text TEXT,
  about_image_url TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  project_status VARCHAR(50) DEFAULT 'ongoing',
  location VARCHAR(255),
  neighborhood VARCHAR(255),
  location_description TEXT,
  completion_date DATE,
  cta_text VARCHAR(255) DEFAULT 'Detaylari Gor',
  apartment_options TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  meta_title VARCHAR(255),
  meta_desc TEXT,
  sort_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS about_text TEXT,
  ADD COLUMN IF NOT EXISTS about_image_url TEXT,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS project_status VARCHAR(50) DEFAULT 'ongoing',
  ADD COLUMN IF NOT EXISTS location VARCHAR(255),
  ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(255),
  ADD COLUMN IF NOT EXISTS location_description TEXT,
  ADD COLUMN IF NOT EXISTS completion_date DATE,
  ADD COLUMN IF NOT EXISTS cta_text VARCHAR(255) DEFAULT 'Detaylari Gor',
  ADD COLUMN IF NOT EXISTS apartment_options TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS meta_desc TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check CHECK (status IN ('draft', 'published', 'archived', 'completed', 'ongoing'));

ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_project_status_check;
ALTER TABLE public.projects
  ADD CONSTRAINT projects_project_status_check CHECK (project_status IN ('completed', 'ongoing'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug_unique ON public.projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_project_status ON public.projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_is_published ON public.projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON public.projects(is_featured);

CREATE TABLE IF NOT EXISTS public.project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  r2_key TEXT,
  url TEXT NOT NULL,
  thumb_url TEXT,
  category VARCHAR(50) NOT NULL,
  alt_text TEXT,
  file_name TEXT,
  file_size INT,
  width INT,
  height INT,
  sort_order SMALLINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.project_media
  ADD COLUMN IF NOT EXISTS r2_key TEXT,
  ADD COLUMN IF NOT EXISTS url TEXT,
  ADD COLUMN IF NOT EXISTS thumb_url TEXT,
  ADD COLUMN IF NOT EXISTS category VARCHAR(50),
  ADD COLUMN IF NOT EXISTS alt_text TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size INT,
  ADD COLUMN IF NOT EXISTS width INT,
  ADD COLUMN IF NOT EXISTS height INT,
  ADD COLUMN IF NOT EXISTS sort_order SMALLINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.project_media DROP CONSTRAINT IF EXISTS project_media_category_check;
ALTER TABLE public.project_media
  ADD CONSTRAINT project_media_category_check CHECK (category IN ('about', 'exterior', 'interior', 'location'));

CREATE INDEX IF NOT EXISTS idx_project_media_project_id ON public.project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_project_media_sort_order ON public.project_media(sort_order);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Public can read project media" ON public.project_media;
DROP POLICY IF EXISTS "Admins can manage project media" ON public.project_media;

CREATE POLICY "Public can read projects"
  ON public.projects FOR SELECT TO anon, authenticated
  USING (status = 'published' OR is_published = true);

CREATE POLICY "Admins can manage projects"
  ON public.projects FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public can read project media"
  ON public.project_media FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_media.project_id
      AND (p.status = 'published' OR p.is_published = true)
    )
  );

CREATE POLICY "Admins can manage project media"
  ON public.project_media FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

GRANT SELECT ON public.projects TO anon;
GRANT ALL ON public.projects TO authenticated;
GRANT SELECT ON public.project_media TO anon;
GRANT ALL ON public.project_media TO authenticated;

NOTIFY pgrst, 'reload schema';

SELECT
  EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'projects'
  ) AS projects_exists,
  EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'project_media'
  ) AS project_media_exists;
