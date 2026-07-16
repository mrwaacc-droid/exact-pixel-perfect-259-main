-- ════════════════════════════════════════════════════════════════════════════
-- Course Materials Storage Policies
-- Adds support for course-scoped upload paths in the resources bucket.
--
-- The original policies in 20260608120521_ca69a910-*.sql only allow uploads
-- whose first path segment is an institution_id. Course materials are
-- uploaded as `<course_id>/<uuid>-<filename>`, so we add lookup-by-course
-- policies that resolve the institution from the course row and apply the
-- same role checks as the existing institution-scoped paths.
-- ════════════════════════════════════════════════════════════════════════════

-- Helper: resolve institution_id from a course_id without leaking RLS
CREATE OR REPLACE FUNCTION public.course_institution_id(p_course_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_id FROM public.courses WHERE id = p_course_id LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.course_institution_id(uuid) TO authenticated;

-- ── SELECT: members of the course's institution can read course materials ───
DROP POLICY IF EXISTS "resources_course_select" ON storage.objects;
CREATE POLICY "resources_course_select" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'resources'
    AND (string_to_array(name, '/'))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.is_institution_member(
      public.course_institution_id(((string_to_array(name, '/'))[1])::uuid),
      auth.uid()
    )
  );

-- ── INSERT: owner/admin/teacher of the course's institution can upload ──────
DROP POLICY IF EXISTS "resources_course_insert" ON storage.objects;
CREATE POLICY "resources_course_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'resources'
    AND (string_to_array(name, '/'))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.has_institution_role(
      public.course_institution_id(((string_to_array(name, '/'))[1])::uuid),
      auth.uid(),
      ARRAY['owner','admin','teacher']::public.member_role[]
    )
  );

-- ── UPDATE: same role as insert ─────────────────────────────────────────────
DROP POLICY IF EXISTS "resources_course_update" ON storage.objects;
CREATE POLICY "resources_course_update" ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'resources'
    AND (string_to_array(name, '/'))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.has_institution_role(
      public.course_institution_id(((string_to_array(name, '/'))[1])::uuid),
      auth.uid(),
      ARRAY['owner','admin','teacher']::public.member_role[]
    )
  );

-- ── DELETE: owner/admin only ────────────────────────────────────────────────
DROP POLICY IF EXISTS "resources_course_delete" ON storage.objects;
CREATE POLICY "resources_course_delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'resources'
    AND (string_to_array(name, '/'))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND public.has_institution_role(
      public.course_institution_id(((string_to_array(name, '/'))[1])::uuid),
      auth.uid(),
      ARRAY['owner','admin']::public.member_role[]
    )
  );

-- ── Note for ops ────────────────────────────────────────────────────────────
-- The "resources" bucket exists and its institution-scoped policies from
-- 20260608120521_ca69a910-*.sql remain active. The policies above ADD support
-- for course-scoped paths so MaterialUploadDialog.tsx can keep using
-- `<course_id>/<file>` paths without spinning up a second bucket.
--
-- If you would rather isolate course materials in their own bucket, run this
-- in the Supabase dashboard SQL editor (after the migration above):
--
--   INSERT INTO storage.buckets (id, name, public)
--   VALUES ('course-materials', 'course-materials', false)
--   ON CONFLICT (id) DO NOTHING;
--
-- Then change the `.from('resources')` calls in MaterialUploadDialog.tsx,
-- UploadResourceDialog.tsx, and institution.resources.upload.tsx to
-- `.from('course-materials')` and add equivalent policies for that bucket.
