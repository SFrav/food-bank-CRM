CREATE OR REPLACE FUNCTION "public"."get_head_manager_archived"("p_period" "text" DEFAULT NULL::"text", "p_start_date" "date" DEFAULT NULL::"date", "p_end_date" "date" DEFAULT NULL::"date") RETURNS TABLE("manager_id" "uuid", "manager_name" "text", "entity_id" "uuid", "division_id" "uuid", "revenue" numeric, "margin" numeric, "project_count" bigint)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
DECLARE
  v_user_id UUID;
  v_head_profile RECORD;
  v_start_date DATE;
  v_end_date DATE;
  v_quarter INT;
  v_year INT;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Get head profile
  SELECT * INTO v_head_profile
  FROM public.user_profiles
  WHERE user_id = v_user_id
    AND role = 'head';

  IF v_head_profile IS NULL THEN
    RAISE EXCEPTION 'User is not a head';
  END IF;

  -- Parse period jika diberikan
  IF p_period IS NOT NULL AND p_period ~ '^Q[1-4] \d{4}$' THEN
    v_quarter := SUBSTRING(p_period FROM 2 FOR 1)::INT;
    v_year := SUBSTRING(p_period FROM 4)::INT;
    v_start_date := MAKE_DATE(v_year, (v_quarter - 1) * 3 + 1, 1);
    v_end_date := (v_start_date + INTERVAL '3 MONTHS')::DATE - 1;
  ELSIF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
    v_start_date := p_start_date;
    v_end_date := p_end_date;
  ELSE
    -- Default: current quarter
    v_start_date := DATE_TRUNC('quarter', CURRENT_DATE)::DATE;
    v_end_date := (v_start_date + INTERVAL '3 MONTHS' - INTERVAL '1 day')::DATE;
  END IF;

  -- Return archived untuk semua manager di tim/entity head
  RETURN QUERY
  SELECT 
    m.id AS manager_id,
    m.full_name AS manager_name,
    m.entity_id,
    m.division_id,
    COALESCE(archived.revenue, 0)::NUMERIC AS revenue,
    COALESCE(archived.margin, 0)::NUMERIC AS margin,
    COALESCE(archived.project_count, 0)::BIGINT AS project_count
  FROM public.user_profiles m
  CROSS JOIN LATERAL (
    SELECT * FROM public.get_manager_archived(
      m.id,
      NULL,
      v_start_date,
      v_end_date
    )
  ) archived
  WHERE m.role = 'manager'
    AND m.is_active = true
    AND (
      -- Head melihat manager di tim mereka (division_id)
      (v_head_profile.division_id IS NOT NULL 
       AND m.division_id = v_head_profile.division_id)
      OR
      -- Fallback: Head melihat manager di entity mereka
      (v_head_profile.division_id IS NULL 
       AND v_head_profile.entity_id IS NOT NULL
       AND m.entity_id = v_head_profile.entity_id)
    )
  ORDER BY m.full_name;
END;
$_$;