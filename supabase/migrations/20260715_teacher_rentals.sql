-- Teachers can rent classroom space themselves (renting by teachers, not only
-- institution admins). A teacher may create, view, and pay for their own
-- rentals within an institution they belong to.

DO $$
BEGIN
  CREATE POLICY "Teachers can view their own rentals"
    ON public.classroom_rentals
    FOR SELECT
    USING (renter_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Teachers can create their own rentals"
    ON public.classroom_rentals
    FOR INSERT
    WITH CHECK (
      renter_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM public.institution_members im
        WHERE im.institution_id = classroom_rentals.institution_id
          AND im.user_id = auth.uid()
          AND im.status = 'active'
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Teachers can update their own pending rentals"
    ON public.classroom_rentals
    FOR UPDATE
    USING (renter_id = auth.uid())
    WITH CHECK (renter_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
