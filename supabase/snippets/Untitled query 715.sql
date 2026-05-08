
CREATE POLICY sales_activities_insert
  ON public.sales_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY sales_activities_update
  ON public.sales_activities
  FOR UPDATE
  TO authenticated
  USING (
    -- admin / head can update any row
    EXISTS (
      SELECT 1
      FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.role = ANY(ARRAY['admin','head']::public.role_enum[])
    )
    OR
    -- manager / account_manager / staff may update rows whose creator is in the same entity
    EXISTS (
      SELECT 1
      FROM public.user_profiles up_creator
      JOIN public.user_profiles up_user
        ON up_user.user_id = auth.uid()
      WHERE up_creator.user_id = sales_activities.created_by
        AND up_creator.entity_id = up_user.entity_id
        AND up_user.role = ANY(ARRAY['manager','account_manager','staff']::public.role_enum[])
    )
  )
  WITH CHECK (created_by = auth.uid());   -- keep the same constraint as INSERT

CREATE POLICY sales_activities_delete
  ON public.sales_activities
  FOR DELETE
  TO authenticated
  USING (
    -- admin / head can delete any row
    EXISTS (
      SELECT 1
      FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.role = ANY(ARRAY['admin','head']::public.role_enum[])
    )
    OR
    -- manager / account_manager / staff may delete rows whose creator is in the same entity
    EXISTS (
      SELECT 1
      FROM public.user_profiles up_creator
      JOIN public.user_profiles up_user
        ON up_user.user_id = auth.uid()
      WHERE up_creator.user_id = sales_activities.created_by
        AND up_creator.entity_id = up_user.entity_id
        AND up_user.role = ANY(ARRAY['manager','account_manager','staff']::public.role_enum[])
    )
  );