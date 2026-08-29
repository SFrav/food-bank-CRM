BEGIN;

-- A unified and complete database initialisation migration

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA pg_catalog;

SET row_security = off;

--
--Types / enums
--
CREATE TYPE "public"."beneficiary_enum" AS ENUM (
    'pending',
    'active',
    'inactive',
    'banned',
    'merged'
);

CREATE TYPE "public"."notification_type_enum" AS ENUM (
    'alert',
    'dm',
    'task',
    'calendar',
    'referral',
    'ref_decision',
    'system'
);

CREATE TYPE "public"."org_type_enum" AS ENUM (
    'government',
    'ngo',
    'faith_based'
);

CREATE TYPE "public"."role_enum" AS ENUM (
    'admin',
    'head',
    'manager',
    'referrer',
    'branch_manager',
    'staff',
    'volunteer',
    'pending'
);

CREATE TYPE "public"."user_status_enum" AS ENUM (
    'active',
    'inactive',
    'suspended'
);

CREATE TYPE "public"."allotment_type_enum" AS ENUM (
    'referral',
    'drop_in'
);


--
--Tables
--


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid",
    "old_values" "jsonb" DEFAULT '{}'::"jsonb",
    "new_values" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "role" "public"."role_enum" DEFAULT 'branch_manager'::"public"."role_enum" NOT NULL,
    "division_id" "uuid",
    "region_id" "uuid",
    "entity_id" "uuid",
    "manager_id" "uuid",
    "status" "public"."user_status_enum" DEFAULT 'active'::"public"."user_status_enum" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "street_address" "text",
    "postcode" "text",
    "region_id" "uuid", 
    "adults_count" numeric DEFAULT NULL,
    "children_gt16" numeric DEFAULT NULL,
    "children_lt16" numeric DEFAULT NULL,
    "infant" boolean DEFAULT NULL,
    "allergies" boolean DEFAULT NULL,
    "vegetarian" boolean DEFAULT NULL,
    "hallal" boolean DEFAULT NULL, --@ add no_cooking, no_freezer, no_fridge, gluten free? Move all these preferences to another table?
    "notes" "text",
    "owner_id" "uuid",
    "updated_by" "uuid",
    "status" "public"."beneficiary_enum" DEFAULT 'inactive'::"public"."beneficiary_enum" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."contacts_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contact_id" "uuid" NOT NULL,
    "note" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_by" "uuid"
);

CREATE TABLE IF NOT EXISTS "public"."divisions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "description" "text",
    "manager_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "head_id" "uuid",
    "entity_id" "uuid", 
    "region_id" "uuid"
);


CREATE TABLE IF NOT EXISTS "public"."entities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "is_referrer" boolean DEFAULT false NOT NULL, --@ CREATE TABLE entities_linked - join referrers to food banks and foodbanks to eachother 
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."calendar" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entry_type" "text" NOT NULL,
    "subject" "text",
    "location" "text",
    "notes" "text",
    "status" "text",
    "scheduled_at" timestamp with time zone,
    "created_by" "uuid",
    "beneficiary_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "due_at" timestamp with time zone,
    "pic_id" "uuid"
);

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "calendar_id" "uuid",
    "contact_id" "uuid",
    "org_role" "text",
    "type" "public"."notification_type_enum" NOT NULL,
    "title" "text",
    "message" "text" DEFAULT '',
    "link" "text",
    "meta" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."notifications_user" (
    "id" "uuid" DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    "notification_id" "uuid", -- REFERENCES public.notifications(id) ON DELETE CASCADE,
    "user_id" "uuid", -- REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
    "is_read" boolean NOT NULL DEFAULT false,
    "read_at" timestamptz NULL,
    "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."organisations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "org_type" "public"."org_type_enum" DEFAULT 'ngo'::"public"."org_type_enum" NOT NULL,
    "service" "text",
    "address" "jsonb",
    "region_id" "uuid",
    "website" "text",
    "phone" "text",
    "email" "text",
    "notes" "text",
    "approval_status" "text" DEFAULT 'approved'::"text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."regions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "text", --@revised from jsonb --@set enum to align with types
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "setting_key" "text" NOT NULL, --@set enum to align with types
    "setting_value" text, 
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."entity_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "division_id" "uuid",
    "setting_key" "text" NOT NULL, --@set enum to align with types
    "setting_value" text, 
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."division_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "division_id" "uuid" NOT NULL,
    "setting_key" "text" NOT NULL, --@set enum to align with types
    "setting_value" text, 
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."contacts_referrer" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contact_id" "uuid" NOT NULL,
    "referrer_id" "uuid" NOT NULL,
    "first_referred_by" "uuid", 
    "approved_at" timestamp with time zone,
    "approved_by" "uuid",
    "message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(), --set at create_contact
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "public"."contacts_allotment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "contact_id" "uuid" NOT NULL,
    "date" timestamp with time zone NOT NULL,
    "visit_num" "numeric", -- which of the total allotted weeks is this (e.g. first week receiving food = 1, second week = 2)
    "attended" boolean NOT NULL DEFAULT false,
    "serving" boolean NOT NULL DEFAULT false,
    "served" boolean NOT NULL DEFAULT false, 
    "type" "public"."allotment_type_enum" NOT NULL, -- referred or drop_in
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);




--
--VIEWS
--

CREATE OR REPLACE VIEW "public"."v_audit_log_complete" with (security_invoker = on) AS
 SELECT "al"."id",
    "al"."user_id",
    "al"."action" AS "action_type",
    "al"."table_name",
    "al"."record_id",
    "al"."old_values",
    "al"."new_values",
    NULL::"jsonb" AS "metadata",
    NULL::"text" AS "ip_address",
    NULL::"text" AS "user_agent",
    "al"."created_at",
    NULL::"text" AS "session_id",
    "up"."full_name" AS "user_name",
    ("up"."role")::"text" AS "user_role",
    "up"."entity_id",
    NULL::"text" AS "entity_name"
   FROM ("public"."audit_logs" "al"
     LEFT JOIN "public"."user_profiles" "up" ON (("up"."user_id" = "al"."user_id")))
  ORDER BY "al"."created_at" DESC;

CREATE OR REPLACE VIEW public.contacts_queue with (security_invoker = on) AS
SELECT
  c.id,
  c.name,
  c.email,
  c.phone,
  c.street_address,
  c.postcode,
  c.region_id,
  c.adults_count  AS adults,
  c.children_gt16,
  c.children_lt16,
  c.infant,
  c.allergies,
  c.vegetarian,
  c.hallal,
  c.status,
  c.updated_by   AS user_id,
  c.owner_id,
  c.notes,
  c.created_at,
  MAX(ca.updated_at) AS attended_at   
FROM public.contacts          c
JOIN public.contacts_allotment ca
  ON ca.contact_id = c.id
WHERE
  c.status = 'active'              
  AND ca.attended = TRUE          
  AND ca.serving  = FALSE         
  AND ca.served   = FALSE          
  AND ca.updated_at IS NOT NULL  
GROUP BY
    c.id,
    c.name,
    c.email, 
    c.phone,
    c.street_address,
    c.postcode,
    c.region_id,
    c.adults_count,
    c.children_gt16,
    c.children_lt16,
    c.infant,
    c.allergies,
    c.vegetarian,
    c.hallal,
    c.status,
    c.updated_by,
    c.owner_id,
    c.notes,
    c.created_at
;   

-- CREATE VIEW "public"."user_notifications" with (security_invoker = on) AS
-- SELECT n.id,
--        n.org_role,
--        n.type,
--        n.title,
--        n.message,
--        n.link,
--        n.meta,
--        n.created_at,
--        nu.is_read
-- FROM   public.notifications n
-- JOIN   public.notifications_user nu
--   ON   n.id = nu.notification_id
-- WHERE  nu.user_id = auth.uid();


--
--Primary keys
--

ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id"); --@ check if should be user_id

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");

ALTER TABLE ONLY "public"."entities"
    ADD CONSTRAINT "entities_pkey" PRIMARY KEY ("id"); 

ALTER TABLE ONLY "public"."divisions"
    ADD CONSTRAINT "divisions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."division_settings"
    ADD CONSTRAINT "division_settins_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "uq_contacts_email"
    ON "public"."contacts"("email")
    WHERE "email" IS NOT NULL;

CREATE UNIQUE INDEX "uq_contacts_phone"
    ON "public"."contacts"("phone")
    WHERE "phone" IS NOT NULL;

CREATE UNIQUE INDEX "uq_contacts_name_address_postcode"    
  ON "public"."contacts"("name", "street_address", "postcode")   
  WHERE "street_address" IS NOT NULL AND "postcode" IS NOT NULL;

-- ALTER TABLE "public"."contacts" 
--   ADD CONSTRAINT "uq_contacts" UNIQUE ("name", "phone");

ALTER TABLE ONLY "public"."contacts_notes"
    ADD CONSTRAINT "contacts_notes_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."contacts_referrer"
    ADD CONSTRAINT "contacts_referrer_pkey" PRIMARY KEY ("id");    

ALTER TABLE ONLY "public"."contacts_allotment"
    ADD CONSTRAINT "allotment_pkey" PRIMARY KEY ("id");   

ALTER TABLE "public"."contacts_allotment"
  ADD CONSTRAINT "uq_contacts_allotment" UNIQUE ("contact_id", "date");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- ALTER TABLE ONLY "public"."notifications_user"
--     ADD CONSTRAINT "notifications_user_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "regions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."calendar"
    ADD CONSTRAINT "calendar_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_setting_pkey" UNIQUE ("setting_key");

ALTER TABLE ONLY "public"."entity_settings"
  ADD CONSTRAINT "entity_settins_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."entity_settings"
  ADD CONSTRAINT "uq_entity_setting" UNIQUE ("entity_id", "setting_key");

ALTER TABLE "public"."division_settings"
  ADD CONSTRAINT "uq_division_setting" UNIQUE ("division_id", "setting_key");

ALTER TABLE "public"."user_settings"
  ADD CONSTRAINT "uq_user_setting" UNIQUE ("user_id", "setting_key");

--
--Tables with cascades (req. primary keys)
--

-- CREATE TABLE IF NOT EXISTS "public"."notifications_user" (
--     "id" "uuid" DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
--     "notification_id" "uuid" REFERENCES public.notifications(id) ON DELETE CASCADE,
--     "user_id" "uuid" REFERENCES public.user_profiles(user_id) ON DELETE CASCADE,
--     "is_read" boolean NOT NULL DEFAULT false,
--     "read_at" timestamptz NULL,
--     "created_at" timestamptz DEFAULT now() NOT NULL
-- );


--
-- Foreign keys
--

ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id");

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "settings_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."divisions"
    ADD CONSTRAINT "divisions_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."divisions"
    ADD CONSTRAINT "divisions_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."divisions"
    ADD CONSTRAINT "divisions_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."divisions"
    ADD CONSTRAINT "divisions_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE SET NULL;

-- ALTER TABLE ONLY "public"."notifications"
--     ADD CONSTRAINT "notifications_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."organisations"
    ADD CONSTRAINT "organisations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."calendar"
    ADD CONSTRAINT "calendar_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."calendar"
    ADD CONSTRAINT "calendar_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."calendar"
    ADD CONSTRAINT "calendar_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL;

ALTER TABLE "public"."notifications"
  ADD CONSTRAINT "notifications_calendar_fkey" FOREIGN KEY ("calendar_id") REFERENCES "public"."calendar"("id") ON DELETE SET NULL;

ALTER TABLE "public"."notifications"
  ADD CONSTRAINT "notifications_conctacts_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."notifications_user"
    ADD CONSTRAINT "notifications_user_notify_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "public"."notifications"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications_user"
    ADD CONSTRAINT "notifications_user_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."contacts_referrer"
    ADD CONSTRAINT "referrer_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."contacts_referrer"
    ADD CONSTRAINT "referrer_user_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

--
--Indexes
--
--@
CREATE INDEX "idx_contacts_status" ON "public"."contacts"(status);

CREATE INDEX IF NOT EXISTS idx_contacts_name_trgm ON public.contacts USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_contacts_phone ON public.contacts (phone);

CREATE INDEX IF NOT EXISTS idx_contacts_postcode ON public.contacts (postcode);

CREATE INDEX "idx_allotment_contact_attended"
  ON public.contacts_allotment(contact_id, attended, serving, served, updated_at)
  WHERE attended IS NOT NULL;

CREATE INDEX "idx_divisions_entity_id" ON "public"."divisions" USING "btree" ("entity_id");

CREATE INDEX "idx_divisions_head_id" ON "public"."divisions" USING "btree" ("head_id");

CREATE INDEX "idx_user_profiles_division_id" ON "public"."user_profiles" USING "btree" ("division_id");

CREATE INDEX "idx_user_profiles_entity_id" ON "public"."user_profiles" USING "btree" ("entity_id");

CREATE INDEX "idx_user_profiles_manager_id" ON "public"."user_profiles" USING "btree" ("manager_id");

CREATE INDEX "idx_user_profiles_role" ON "public"."user_profiles" USING "btree" ("role");

CREATE INDEX "idx_user_profiles_user_id" ON "public"."user_profiles" USING "btree" ("user_id");

CREATE UNIQUE INDEX "one_head_per_entity" ON "public"."user_profiles" USING "btree" ("entity_id") WHERE (("role" = 'head'::"public"."role_enum") AND ("is_active" = true));

CREATE UNIQUE INDEX "one_manager_per_division" ON "public"."user_profiles" USING "btree" ("division_id") WHERE (("role" = 'manager'::"public"."role_enum") AND ("is_active" = true));

CREATE INDEX idx_user_notifications_user_id ON "public"."notifications_user" USING "btree" ("user_id");

CREATE INDEX idx_user_notifications_notification_id ON "public"."notifications_user" USING "btree" ("notification_id");

CREATE INDEX "calendar_created_at_idx" ON "public"."calendar" USING "btree" ("created_at");

CREATE INDEX "calendar_created_by_idx" ON "public"."calendar" USING "btree" ("created_by");

CREATE INDEX "calendar_beneficiary_id_idx" ON "public"."calendar" USING "btree" ("beneficiary_id");

CREATE INDEX "calendar_due_at_idx" ON "public"."calendar" USING "btree" ("due_at");

CREATE INDEX "calendar_pic_id_idx" ON "public"."calendar" USING "btree" ("pic_id");

CREATE INDEX "calendar_scheduled_at_idx" ON "public"."calendar" USING "btree" ("scheduled_at");

--
--Functions
--

-------------
-- Audit logs
CREATE OR REPLACE FUNCTION "public"."log_audit_event"("p_action" "text", "p_table_name" "text", "p_record_id" "uuid", "p_old_values" "jsonb" DEFAULT '{}'::"jsonb", "p_new_values" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  v_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.audit_logs(id, user_id, action, table_name, record_id, old_values, new_values)
  VALUES (v_id, auth.uid(), p_action, p_table_name, p_record_id, COALESCE(p_old_values, '{}'::jsonb), COALESCE(p_new_values, '{}'::jsonb));
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_audit_logs(
    p_filters   jsonb,
    p_page      numeric DEFAULT 1,
    p_page_size numeric DEFAULT 5
) RETURNS TABLE (
    id                uuid,
    entity_id         uuid,
    user_id           uuid,
    action_type       text,
    table_name        text,
    record_id         uuid,
    old_values        jsonb,
    new_values        jsonb,
    metadata          jsonb,
    ip_address        text,
    user_agent        text,
    created_at        timestamptz,
    session_id        text,
    user_name         text,
    user_role         text,
    entity_name       text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
SELECT
    id, entity_id, user_id, action_type, table_name, record_id,
    old_values, new_values, metadata, ip_address, user_agent,
    created_at, session_id, user_name, user_role, entity_name
FROM public.v_audit_log_complete
WHERE
    /* action type filter */
    (p_filters ? 'actionType' IS FALSE OR action_type = p_filters->>'actionType')
    /* table name filter */
    AND (p_filters ? 'tableName' IS FALSE OR table_name = p_filters->>'tableName')
    /* user id filter */
    AND (p_filters ? 'userId' IS FALSE OR user_id::text = p_filters->>'userId')
    /* date range filter */
    AND (
        p_filters ? 'dateRange' IS FALSE
        OR (
            (p_filters->'dateRange' ? 'from' IS FALSE
             OR created_at >= ((p_filters->'dateRange'->>'from')::date)::timestamptz)
            AND (p_filters->'dateRange' ? 'to' IS FALSE
                 OR created_at < (((p_filters->'dateRange'->>'to')::date + INTERVAL '1 day')::timestamptz))
        )
    )
ORDER BY created_at DESC
LIMIT p_page_size
OFFSET ((p_page - 1) * p_page_size);
$$;


CREATE OR REPLACE FUNCTION "public"."admin_clear_audit_logs"(
    p_filters jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
    v_sql text := 'DELETE FROM public.audit_logs WHERE TRUE';
    v_cnt integer;
BEGIN
  IF p_filters ? 'actionType' THEN
    v_sql := v_sql || ' AND action = ' || quote_literal(p_filters->>'actionType');
  END IF;
  IF p_filters ? 'tableName' THEN
    v_sql := v_sql || ' AND table_name = ' || quote_literal(p_filters->>'tableName');
  END IF;
  IF p_filters ? 'userId' THEN
    v_sql := v_sql || ' AND user_id = ' || quote_literal(p_filters->>'userId');
  END IF;
  IF p_filters ? 'dateRange' THEN
    IF (p_filters->'dateRange') ? 'from' THEN
      v_sql := v_sql || ' AND created_at >= (' ||
        quote_literal(p_filters->'dateRange'->>'from') || '::date)::timestamptz';
    END IF;
    IF (p_filters->'dateRange') ? 'to' THEN
      v_sql := v_sql || ' AND created_at < (' ||
        quote_literal(p_filters->'dateRange'->>'to') || '::date + interval ''1 day'' )::timestamptz';
    END IF;
  END IF;
  EXECUTE v_sql;
  GET DIAGNOSTICS v_cnt = ROW_COUNT;
  RETURN v_cnt;
END;
$$;

--------------------------
-- Entity management
CREATE OR REPLACE FUNCTION "public"."admin_create_entity"("p_name" "text", "p_code" "text" DEFAULT NULL::"text", p_referrer boolean DEFAULT NULL::boolean) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_is_admin boolean;
  v_uid uuid;
  --v_entity_id uuid;
  new_id uuid;
  new_row public.entities; --for audit log
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = v_uid
      AND role = 'admin'
    LIMIT 1
  ) INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admin can create entities';
  END IF;
  INSERT INTO public.entities (name, code, is_active, is_referrer, created_by)
  VALUES (p_name, p_code, true, p_referrer, v_uid)
    RETURNING * INTO new_row;
    new_id := new_row.id;
  --RETURNING id INTO v_entity_id;

  INSERT INTO public.entity_settings (
    entity_id,
    division_id,
    setting_key,
    setting_value
  )
  SELECT
    new_id,
    NULL,
    unnest(array['referrer_request', 'contact_notify', 'contact_approve', 'contact_ban']),
    unnest(array['manager', 'manager', 'manager', 'manager'])
  ON CONFLICT DO NOTHING;

  PERFORM log_audit_event('CREATE', 'entities', new_id, NULL, row_to_json(new_row)::jsonb);
  RETURN new_id;
  --RETURN v_entity_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_entities"()
RETURNS TABLE (
  id uuid,
  name text,
  code text,
  is_active boolean,
  is_referrer boolean,
  created_by uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
SET "search_path" TO 'public'
SECURITY INVOKER
AS $$
  SELECT
    id, name, code, is_active, is_referrer, created_by, created_at, updated_at
  FROM entities
  WHERE is_active = true
  ORDER BY name ASC;
$$;

--!Disallow entity type from being changed after created
CREATE OR REPLACE FUNCTION "public"."admin_update_entity"("p_entity_id" "uuid", "p_name" "text" DEFAULT NULL::"text", "p_code" "text" DEFAULT NULL::"text", "p_is_active" boolean DEFAULT NULL::boolean) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_is_admin boolean;
  v_uid uuid;
  old_row jsonb; --for audit log
  new_row  public.entities; --for audit log
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT row_to_json(e)
  INTO old_row
  FROM public.entities e
  WHERE e.id = p_entity_id;
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE user_id = v_uid 
      AND role = 'admin'
    LIMIT 1
  ) INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admin can update entities';
  END IF;
  UPDATE public.entities
  SET 
    name = COALESCE(p_name, name),
    code = COALESCE(p_code, code),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = now()
  WHERE id = p_entity_id
  RETURNING * INTO new_row;
  PERFORM log_audit_event('UPDATE', 'entities', p_entity_id, old_row, row_to_json(new_row)::jsonb);
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."admin_delete_entity"("p_entity_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_is_admin boolean;
  v_uid uuid;
  old_row jsonb; --for audit_log
BEGIN
  v_uid := auth.uid();
  
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE user_id = v_uid 
      AND role = 'admin'
    LIMIT 1
  ) INTO v_is_admin;
  
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admin can delete entities';
  END IF;

  SELECT row_to_json(e)::jsonb
  INTO old_row
  FROM public.entities e
  WHERE e.id = p_entity_id;

  DELETE FROM public.entities
  WHERE id = p_entity_id;
  PERFORM log_audit_event('DELETE', 'entities', p_entity_id, old_row, NULL);
  
  RETURN FOUND;
END;
$$;


-- Settings - system, entity & division
CREATE OR REPLACE FUNCTION "public"."get_system_settings"() RETURNS TABLE(
id uuid,
setting_key text,
setting_value text,
updated_by uuid,
updated_at timestamp with time zone
)
LANGUAGE "sql" STABLE SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
  SELECT id, setting_key, setting_value, updated_by, updated_at 
  FROM public.system_settings 
  ORDER BY setting_key ASC
$$;

CREATE OR REPLACE FUNCTION "public"."upsert_system_setting"(
    p_setting_key text,
    p_setting_value text
) RETURNS void 
LANGUAGE plpgsql SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
    INSERT INTO system_settings (setting_key, setting_value)
    VALUES (p_setting_key, p_setting_value)
    ON CONFLICT (setting_key) DO UPDATE
    SET setting_value = EXCLUDED.setting_value;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_entity_settings"("p_entity_id" "uuid") RETURNS TABLE(
id uuid,
entity_id uuid,
division_id text,
setting_key text,
setting_value text,
updated_at timestamp with time zone
)
LANGUAGE "sql" STABLE SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
  SELECT id, entity_id, division_id, setting_key, setting_value, updated_at 
  FROM public.entity_settings 
  WHERE entity_id = p_entity_id
  AND setting_key IN ('referrer_request', 'contact_notify', 'contact_approve', 'contact_ban')
$$;

CREATE OR REPLACE FUNCTION "public"."upsert_entity_setting"(
    p_entity_id uuid,
    p_setting_key text,
    p_setting_value text
) RETURNS void 
LANGUAGE plpgsql SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can update settings';
    END IF;
    INSERT INTO entity_settings (entity_id, setting_key, setting_value)
    VALUES (p_entity_id, p_setting_key, p_setting_value)
    ON CONFLICT (entity_id, setting_key) DO UPDATE
    SET setting_value = EXCLUDED.setting_value;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_division_settings"("p_division_id" "uuid") RETURNS TABLE(
id uuid,
division_id text,
setting_key text,
setting_value text,
updated_at timestamp with time zone
)
LANGUAGE "sql" STABLE SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
  SELECT id, division_id, setting_key, setting_value, updated_at 
  FROM public.division_settings 
  WHERE division_id = p_division_id
  AND setting_key IN ('allotment_weeks', 'exclusion_weeks', 'day_offset', 'hour_offset')
$$;

CREATE OR REPLACE FUNCTION "public"."upsert_division_setting"(
    p_division_id uuid,
    p_setting_key text,
    p_setting_value text
) RETURNS void 
LANGUAGE plpgsql SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can update settings';
    END IF;
    INSERT INTO division_settings (division_id, setting_key, setting_value)
    VALUES (p_division_id, p_setting_key, p_setting_value)
    ON CONFLICT (division_id, setting_key) DO UPDATE
    SET setting_value = EXCLUDED.setting_value;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_user_settings"(
  "p_user_id" "uuid"
  ) RETURNS TABLE(
  id uuid,
  user_id uuid,
  setting_key text, 
  setting_value text,
  updated_at timestamp with time zone
)
LANGUAGE "sql" STABLE SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
  SELECT id, user_id, setting_key, setting_value, updated_at 
  FROM public.user_settings
  WHERE user_id = p_user_id
  AND setting_key IN ('dark_mode', 'notification_email', 'notification_tasks', 'notification_calendar', 'two_FA')
$$;

CREATE OR REPLACE FUNCTION "public"."upsert_user_setting"(
    p_user_id uuid,
    p_setting_key text,
    p_setting_value text
) RETURNS void 
LANGUAGE plpgsql SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can update settings';
    END IF;
    INSERT INTO user_settings (user_id, setting_key, setting_value)
    VALUES (p_user_id, p_setting_key, p_setting_value)
    ON CONFLICT (user_id, setting_key) DO UPDATE
    SET setting_value = EXCLUDED.setting_value;
END;
$$;

-- Admin helpers
-- Prevent infinite recurrsion for admin CRUD on users. For use within the DB
CREATE OR REPLACE FUNCTION "public"."get_my_profile"() RETURNS TABLE("role" "text", "entity_id" "uuid", "division_id" "uuid")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT role, entity_id, division_id 
  FROM public.user_profiles 
  WHERE user_id = auth.uid();
$$;

-- RPC in useAdminUsers hook
CREATE OR REPLACE FUNCTION "public"."get_users_with_profiles"("p_query" "text" DEFAULT NULL::"text", "p_role" "text" DEFAULT NULL::"text") 
RETURNS TABLE(
  "id" "uuid", 
  "email" "text", 
  "full_name" "text", 
  "role" "text", 
  "entity_id" "uuid", 
  "division_id" "uuid", 
  "manager_id" "uuid",
  "region_id" "uuid", 
  "status" "text"
  )
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT 
    up.user_id AS id,
    au.email,
    up.full_name,
    up.role::text AS role,
    up.entity_id,
    up.division_id,
    up.manager_id,
    up.region_id,
    CASE WHEN up.is_active THEN 'active' ELSE 'inactive' END AS status
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE (p_query IS NULL OR up.full_name ILIKE '%' || p_query || '%' OR au.email ILIKE '%' || p_query || '%')
    AND (p_role IS NULL OR up.role::text = p_role)
  ORDER BY up.full_name;
$$;

CREATE OR REPLACE FUNCTION "public"."get_manager_by_division"("p_division_id" "uuid")
RETURNS uuid
LANGUAGE sql STABLE 
SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
  SELECT up.user_id
  FROM public.user_profiles up
  WHERE up.division_id = $1
    AND up.role = 'manager'
    AND up.is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION "public"."preserve_non_admin_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'auth', 'pg_catalog'
    AS $$
DECLARE
v_role text;
BEGIN
    SELECT role::text INTO v_role
    FROM "public"."user_profiles"
    WHERE "user_id" = auth.uid();

  IF TG_OP = 'UPDATE'
     AND auth.uid() IS NOT NULL
     AND v_role <> 'admin' THEN

    NEW.role        := OLD.role;
    NEW.entity_id   := OLD.entity_id;
    NEW.division_id := OLD.division_id;
    NEW.manager_id  := OLD.manager_id;
    NEW.status      := OLD.status;
    NEW.is_active   := OLD.is_active;
  END IF;
  RETURN NEW;
END;
$$;



-- User management
CREATE OR REPLACE FUNCTION "public"."handle_new_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
--REMOVED
END;
$$;

CREATE OR REPLACE FUNCTION "public"."validate_user_profile_assignment"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
--REMOVED
END;
$$;

CREATE OR REPLACE FUNCTION "public"."admin_update_user_profile"(
  "p_profile_id" "uuid", 
  "p_role" "public"."role_enum" DEFAULT NULL,
  "p_entity_id" "uuid" DEFAULT NULL, 
  "p_division_id" "uuid" DEFAULT NULL, 
  "p_manager_id" "uuid" DEFAULT NULL, 
  "p_region_id" "uuid" DEFAULT NULL
  ) 
  RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_is_admin boolean;
  v_uid uuid;
  v_target_profile_id uuid;
  old_row jsonb; --for audit log
  new_row  public.user_profiles; --for audit log
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  SELECT row_to_json(up)
  INTO old_row
  FROM public.user_profiles up
  WHERE up.user_id = p_profile_id;
  SELECT EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE user_id = v_uid
      AND role = 'admin'
    LIMIT 1
  ) INTO v_is_admin;
  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only admin can use this function';
  END IF;
  SELECT id
  INTO v_target_profile_id
  FROM public.user_profiles
  WHERE id = p_profile_id
     OR user_id = p_profile_id
  LIMIT 1;
  IF v_target_profile_id IS NULL THEN
    RAISE NOTICE 'Profile not found for identifier %', p_profile_id;
    RETURN FALSE;
  END IF;
  UPDATE public.user_profiles
  SET
    role = COALESCE(p_role, role),
    entity_id = COALESCE(p_entity_id, entity_id),
    division_id = COALESCE(p_division_id, division_id),
    manager_id = COALESCE(p_manager_id, manager_id),
    region_id = COALESCE(p_region_id, region_id),
    updated_at = now()
  WHERE id = v_target_profile_id
  RETURNING * INTO new_row;
  PERFORM log_audit_event('UPDATE', 'user_profiles', p_profile_id, old_row, row_to_json(new_row)::jsonb);
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."admin_delete_user"("p_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_user_id uuid;
  v_profile_id uuid;
  v_role text;
  old_row jsonb; --for audit_log
BEGIN
  SELECT role INTO v_role
  FROM user_profiles
  WHERE user_id = auth.uid();
  IF v_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  SELECT row_to_json(up)::jsonb
  INTO old_row
  FROM public.user_profiles up
  WHERE up.user_id = p_id;
  SELECT id, user_id INTO v_profile_id, v_user_id
  FROM user_profiles
  WHERE id = p_id;
  IF v_profile_id IS NULL THEN
    SELECT id, user_id INTO v_profile_id, v_user_id
    FROM user_profiles
    WHERE user_id = p_id;
  END IF;
  IF v_profile_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;
  SELECT role INTO v_role
  FROM user_profiles
  WHERE id = v_profile_id;
  IF v_role = 'admin' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot delete admin users'
    );
  END IF;
  IF v_user_id = auth.uid() THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Cannot delete your own account'
    );
  END IF;
  DELETE FROM calendar
  WHERE created_by = v_user_id;
  DELETE FROM user_profiles
  WHERE id = v_profile_id;
  PERFORM log_audit_event('DELETE', 'user_profiles', p_id, old_row, NULL);
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User profile deleted successfully. Auth user still exists in auth.users'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- User profile access for user RPCs
CREATE OR REPLACE FUNCTION "public"."user_get_profile"()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  full_name text,
  email text,
  phone text,
  role text,
  entity_id uuid,
  entity text,
  division_id uuid,
  division text,
  region_id uuid,
  region text,
  manager_id uuid,
  user_status text,
  is_active BOOLEAN,
  created_at timestamp with time zone,
  updated_at timestamp with time zone   
)
LANGUAGE sql STABLE
SET "search_path" TO 'public'
SECURITY INVOKER
AS $$
  SELECT
    up.id,
    up.user_id,
    up.full_name,
    up.email,
    up.phone,
    up.role::text AS role,
    up.entity_id,
    e.name      AS entity,
    up.division_id,
    d.name      AS division,
    up.region_id,
    r.name      AS region,
    up.manager_id,
    up.status as user_status,
    up.is_active,
    up.created_at,
    up.updated_at       
  FROM public.user_profiles up
  LEFT JOIN public.entities e   ON e.id = up.entity_id
  LEFT JOIN public.divisions d   ON d.id = up.division_id
  LEFT JOIN public.regions r ON r.id = up.region_id
  WHERE up.user_id = auth.uid()
  LIMIT 1;                   
$$;

CREATE OR REPLACE FUNCTION "public"."user_update_profile"(
  p_user_id uuid, 
  p_full_name text, 
  p_phone text)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET "search_path" TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can update a user profile';
    END IF;
  UPDATE public.user_profiles
  SET full_name = coalesce(p_full_name, full_name),
      phone = coalesce(p_phone, phone),
      updated_at = now()
  WHERE user_id = p_user_id;
  RETURN FOUND;
END;
$$;


-- Region management
CREATE OR REPLACE FUNCTION "public"."get_regions"()
RETURNS TABLE (
  id uuid,
  name text,
  code text,
  is_active boolean
)
LANGUAGE sql
SET "search_path" TO 'public'
SECURITY DEFINER
AS $$
  SELECT
    id, name, code, is_active
  FROM regions
  -- WHERE is_active = true
  ORDER BY name ASC;
$$;

CREATE OR REPLACE FUNCTION public."create_region"(
    p_name text,
    p_code text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_id uuid;
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can add regions';
    END IF;
    INSERT INTO public.regions (name, code, is_active)
    VALUES (p_name, p_code, true)
    RETURNING id INTO new_id;
    RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public."update_region"(
  p_id uuid,
  p_name text,
  p_code text,
  p_is_active boolean
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can update regions';
    END IF;
  UPDATE public.regions
  SET    name = COALESCE(p_name, name),
         code = COALESCE(p_code, code),
         is_active = COALESCE(p_is_active, is_active)
  WHERE  id = p_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public."delete_region"(p_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can delete regions';
    END IF;
  DELETE FROM public.regions
  WHERE id = p_id;
  RETURN FOUND;
END;
$$;


-- Contact management
CREATE OR REPLACE FUNCTION "public"."create_contact"(
  p_name        text DEFAULT '',
  p_email       text DEFAULT '',
  p_phone       text DEFAULT '',
  p_address     text DEFAULT '',
  p_postcode    text DEFAULT '',
  p_region_id   uuid DEFAULT NULL,
  p_adults  numeric DEFAULT 1,
  p_children_gt16 numeric DEFAULT 0,
  p_children_lt16 numeric DEFAULT 0,
  p_notes       text DEFAULT '',
  p_status      "public"."beneficiary_enum" DEFAULT 'inactive',
  p_user_id     uuid DEFAULT NULL,
  p_owner_id    uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER --@ debug to invoker
SET "search_path" TO 'public'
AS $$
DECLARE
  v_id uuid;
  new_row public.contacts; --for audit log
BEGIN
  IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can add beneficiaries';
    END IF;
  INSERT INTO "public"."contacts"
    (name, email, phone, street_address, postcode, region_id, adults_count, children_gt16, children_lt16, notes, status, updated_by, owner_id, created_by)
  VALUES
    (p_name, p_email, p_phone, p_address, p_postcode, p_region_id, p_adults, p_children_gt16, p_children_lt16, p_notes, p_status, p_user_id, p_owner_id, p_user_id)
  RETURNING * INTO new_row;
  v_id := new_row.id;
  --RETURNING "id" INTO v_id;
  PERFORM log_audit_event('CREATE', 'contacts', v_id, NULL, row_to_json(new_row)::jsonb);
  RETURN v_id;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."get_contacts"(p_order_desc boolean DEFAULT false)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  street_address text,
  postcode text,
  region_id uuid,
  adults numeric,
  children_gt16 numeric,
  children_lt16 numeric,
  infant boolean,
  allergies boolean,
  vegetarian boolean,
  hallal boolean,
  status text,
  user_id uuid,
  owner_id uuid,
  notes text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY INVOKER
SET "search_path" TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can view beneficiaries';
  END IF;
  RETURN QUERY 
  SELECT
    c.id, c.name, c.email, c.phone, c.street_address, c.postcode, c.region_id, 
    c.adults_count AS adults, c.children_gt16, c.children_lt16, c.infant, 
    c.allergies, c.vegetarian, c.hallal, 
    c.status::text, c.updated_by AS user_id, c.owner_id, c.notes, c.created_at
  FROM public.contacts as c
  ORDER BY name ASC, email ASC
  OFFSET 0
  LIMIT ALL;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_contacts_queue(p_order_desc boolean DEFAULT true)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  street_address text,
  postcode text,
  region_id uuid,
  adults numeric,
  children_gt16 numeric,
  children_lt16 numeric,
  infant boolean,
  allergies boolean,
  vegetarian boolean,
  hallal boolean,
  status text,
  user_id uuid,
  owner_id uuid,
  notes text,
  created_at timestamp with time zone,
  attended_at timestamp with time zone
)
LANGUAGE plpgsql
SET "search_path" TO 'public'
SECURITY DEFINER --@debug to security invoker
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can view beneficiaries';
  END IF;
  RETURN QUERY 
  SELECT
    cq.id,
    cq.name,
    cq.email,
    cq.phone,
    cq.street_address,
    cq.postcode,
    cq.region_id,
    cq.adults,
    cq.children_gt16,
    cq.children_lt16,
    cq.infant,
    cq.allergies,
    cq.vegetarian,
    cq.hallal,
    cq.status::text,
    cq.user_id,
    cq.owner_id,
    cq.notes,
    cq.created_at,
    cq.attended_at
  FROM public.contacts_queue as cq
  ORDER BY attended_at ASC;  
END;
$$;


CREATE OR REPLACE FUNCTION public."get_contact_duplicates"(
    p_exact            boolean,
    p_email            text,
    p_phone            text,
    p_name             text,
    p_street_address   text,
    p_postcode         text
)
RETURNS TABLE (
    id              uuid,
    name            text,
    email           text,
    phone           text,
    street_address  text,
    postcode        text,
    region_id       uuid,
    status          text,
    user_id         uuid,
    owner_id        uuid,
    notes           text,
    created_at      timestamp with time zone
)
LANGUAGE plpgsql
SECURITY INVOKER
SET "search_path" TO 'public'
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can view beneficiaries';
    END IF;
    IF p_exact THEN
        RETURN QUERY
        SELECT
            c.id,
            c.name,
            c.email,
            c.phone,
            c.street_address,
            c.postcode,
            c.region_id,
            c.status::text,
            c.updated_by AS user_id,
            c.owner_id,
            c.notes,
            c.created_at
        FROM public.contacts AS c
        WHERE
            (p_email IS NOT NULL AND c.email = p_email) OR
            (p_phone IS NOT NULL AND c.phone = p_phone) OR
            (
                p_name IS NOT NULL
                AND p_street_address IS NOT NULL
                AND p_postcode IS NOT NULL
                AND c.name = p_name
                AND c.street_address = p_street_address
                AND c.postcode = p_postcode
            )
            AND c.status::text <> 'merged';
    END IF;
    IF p_exact AND p_postcode IS NULL THEN
        RETURN QUERY
        SELECT
            c.id,
            c.name,
            c.email,
            c.phone,
            c.street_address,
            c.postcode,
            c.region_id,
            c.status::text,
            c.updated_by AS user_id,
            c.owner_id,
            c.notes,
            c.created_at
        FROM public.contacts AS c
        WHERE
            (
                    c.name ILIKE p_name || '%'
                    OR similarity(c.name, p_name) > 0.3   
            )
            AND c.status::text <> 'merged';
    ELSE
        RETURN QUERY
        SELECT
            c.id,
            c.name,
            c.email,
            c.phone,
            c.street_address,
            c.postcode,
            c.region_id,
            c.status::text,
            c.updated_by AS user_id,
            c.owner_id,
            c.notes,
            c.created_at
        FROM public.contacts AS c
        WHERE
            p_postcode IS NOT NULL
            AND c.postcode = p_postcode
            AND (
                    c.name ILIKE p_name || '%'
                    OR similarity(c.name, p_name) > 0.3         
            )
            AND c.status::text <> 'merged';
    END IF;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."update_contact"( 
  p_id    uuid DEFAULT NULL,
  p_name  text DEFAULT '',
  p_email text DEFAULT '',
  p_phone text DEFAULT '',
  p_address text DEFAULT '',
  p_postcode text DEFAULT '',
  p_region_id uuid DEFAULT NULL,
  p_adults numeric DEFAULT NULL,
  p_children_gt16 numeric DEFAULT NULL,
  p_children_lt16 numeric DEFAULT NULL,
  p_infant boolean DEFAULT NULL,
  p_allergies boolean DEFAULT NULL,
  p_vegetarian boolean DEFAULT NULL,
  p_hallal boolean DEFAULT NULL,
  p_status "public"."beneficiary_enum" DEFAULT 'inactive',
  p_user_id uuid DEFAULT NULL,
  p_owner_id uuid DEFAULT NULL,
  p_notes text DEFAULT ''
)
RETURNS public.contacts --@Return row for greedy update if needed (only for contact related tables)
LANGUAGE plpgsql
SECURITY DEFINER --@Debug to invoker
SET "search_path" TO 'public'
AS $$
DECLARE
  r jsonb;
  old_row jsonb; --for audit log
  new_row  public.contacts; --for audit log
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can update beneficiaries';
  END IF;
  SELECT row_to_json(c)
    INTO old_row
    FROM public.contacts c
    WHERE c.id = p_id;
  UPDATE "public"."contacts"
  SET name      = p_name,
      email     = p_email,
      phone     = p_phone,
      street_address = p_address,
      postcode  = p_postcode,
      region_id = p_region_id,
      adults_count = p_adults,
      children_gt16 = p_children_gt16,
      children_lt16 = p_children_lt16,
      infant = p_infant,
      allergies = p_allergies,
      vegetarian = p_vegetarian,
      hallal    = p_hallal,
      notes     = p_notes,
      status    = p_status,
      updated_by= p_user_id,
      owner_id  = p_owner_id,
      updated_at = now()
  WHERE id = p_id
  RETURNING * INTO new_row;
  
  IF new_row IS NULL THEN
    RAISE EXCEPTION 'No contact found with id %', p_id;
  END IF;
  PERFORM log_audit_event('UPDATE', 'contacts', p_id, old_row, row_to_json(new_row)::jsonb);

  RETURN new_row;
EXCEPTION WHEN others THEN
  RAISE;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."merge_contacts"(
    p_primary   uuid,
    p_secondary uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER --@debug to invoker
SET "search_path" = 'public'
AS $$
DECLARE
    v_caller_role      text;
    v_caller_entity_id uuid;
    v_primary_owner_id uuid;
    v_secondary_owner_id uuid;
    v_primary_creator_id uuid;
    v_secondary_creator_id uuid;
    v_p_owner_entity_id uuid;
    v_s_owner_entity_id uuid;
    v_primary_status   beneficiary_enum;
    v_secondary_status beneficiary_enum;
    v_final_status     beneficiary_enum;
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can merge contacts';
    END IF;

    SELECT role::text, entity_id
    INTO v_caller_role, v_caller_entity_id
    FROM public.user_profiles
    WHERE user_id = auth.uid();

    SELECT owner_id , created_by
    INTO v_primary_owner_id, v_primary_creator_id
    FROM contacts WHERE id = p_primary;    

    SELECT owner_id, created_by 
    INTO v_secondary_owner_id, v_secondary_creator_id
    FROM contacts WHERE id = p_secondary;

    SELECT entity_id
    INTO v_p_owner_entity_id
    FROM public.user_profiles
    WHERE user_id = v_primary_owner_id;

    SELECT entity_id
    INTO v_s_owner_entity_id
    FROM public.user_profiles
    WHERE user_id = v_secondary_owner_id;

    IF v_caller_role IN ('admin', 'head') THEN
    ELSE
      IF v_caller_role NOT IN ('manager', 'branch_manager', 'staff', 'referrer') THEN
        RAISE EXCEPTION 'Only head, managers, branch managers, staff and referrers can merge contacts';
      END IF;
      IF (v_primary_creator_id <> auth.uid() OR v_secondary_creator_id <> auth.uid()) OR 
      (v_p_owner_entity_id <> v_caller_entity_id OR v_s_owner_entity_id <> v_caller_entity_id)  THEN
        RAISE EXCEPTION 'Contacts must be linked to your organisation unless you are an admin and head';
      END IF;
    END IF;

    SELECT status INTO v_primary_status
      FROM contacts WHERE id = p_primary
      FOR UPDATE;    

    SELECT status INTO v_secondary_status
      FROM contacts WHERE id = p_secondary
      FOR UPDATE;

    v_final_status := CASE
        WHEN v_primary_status = 'active'::beneficiary_enum
          OR v_secondary_status = 'active'::beneficiary_enum
          THEN 'active'::beneficiary_enum
        WHEN v_primary_status = 'pending'::beneficiary_enum
          OR v_secondary_status = 'pending'::beneficiary_enum
          THEN 'pending'::beneficiary_enum
        WHEN v_primary_status = 'inactive'::beneficiary_enum
          OR v_secondary_status = 'inactive'::beneficiary_enum
          THEN 'inactive'::beneficiary_enum
        WHEN v_primary_status = 'banned'::beneficiary_enum
          OR v_secondary_status = 'banned'::beneficiary_enum
          THEN 'banned'::beneficiary_enum
        ELSE 'merged'::beneficiary_enum  
    END;

    UPDATE contacts_referrer SET contact_id = p_primary
      WHERE contact_id = p_secondary;

    UPDATE contacts_allotment SET contact_id = p_primary
      WHERE contact_id = p_secondary;

    UPDATE calendar SET beneficiary_id = p_primary
      WHERE beneficiary_id = p_secondary;

    UPDATE calendar SET pic_id = p_primary
      WHERE pic_id = p_secondary;

    UPDATE notifications SET contact_id = p_primary
      WHERE contact_id = p_secondary;

    UPDATE contacts_notes SET contact_id = p_primary
      WHERE contact_id = p_secondary;

    IF v_final_status <> v_primary_status THEN
        UPDATE contacts
           SET status = v_final_status
         WHERE id = p_primary;
    END IF;
    UPDATE contacts
       SET status = 'merged'::beneficiary_enum
     WHERE id = p_secondary;
    RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."delete_contact"(p_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
DECLARE
  r                  jsonb;
  old_row            jsonb; --for audit_log
  v_caller_role      text;
  v_caller_entity_id uuid;
  v_caller_region_id uuid;
  v_owner_id         uuid;
  v_creator_id       uuid;
  v_region_id        uuid;
  v_owner_entity_id  uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can delete contacts';
  END IF;

  SELECT role::text, entity_id, region_id
  INTO v_caller_role, v_caller_entity_id, v_caller_region_id
  FROM public.user_profiles
  WHERE user_id = auth.uid();

  SELECT owner_id , created_by, region_id
  INTO v_owner_id, v_creator_id, v_region_id
  FROM contacts WHERE id = p_id;    

  SELECT entity_id
  INTO v_owner_entity_id
  FROM public.user_profiles
  WHERE user_id = v_owner_id;

IF v_caller_role IN ('admin', 'head', 'manager') THEN
  ELSE
    IF v_caller_role NOT IN ('branch_manager', 'staff', 'referrer') THEN
      RAISE EXCEPTION 'Only admin, head, managers, branch managers, staff and referrers can delete contacts';
    END IF;
    IF (v_creator_id <> auth.uid()) OR 
    (v_owner_entity_id <> v_caller_entity_id) OR (v_caller_region_id != v_region_id) THEN
      RAISE EXCEPTION 'To delete, a contact must be linked to your organisation and the same region unless you are an admin, organisation head or manager';
    END IF;
  END IF;

  SELECT row_to_json(c)::jsonb
  INTO old_row
  FROM public.contacts c
  WHERE c.id = p_id;

  DELETE FROM "public"."contacts"
  WHERE id = p_id
  RETURNING jsonb_build_object('success', true) INTO r;
  PERFORM log_audit_event('DELETE', 'contacts', p_id, old_row, NULL);

  RETURN FOUND;
EXCEPTION WHEN others THEN
  RAISE;
END;
$$;




-- Core referral system logic - notifications, allotment and clean-up
--
--
----
------
------
--------
--------
CREATE OR REPLACE FUNCTION "public"."handle_contact_status"() RETURNS "trigger"
LANGUAGE "plpgsql" SECURITY INVOKER --@Debug to invoker
SET "search_path" TO 'public'
AS $$
--REMOVED
END;
$$;
--------
--------
------
----
--
--

-- Contact notes
CREATE OR REPLACE FUNCTION "public"."handle_contact_note"() RETURNS "trigger"
LANGUAGE "plpgsql" SECURITY DEFINER
SET "search_path" TO 'public'
AS $$
BEGIN
  IF (NEW."notes" IS DISTINCT FROM OLD."notes" AND NEW."notes" IS NOT NULL) THEN
    INSERT INTO "public"."contacts_notes" (
      "contact_id",
      "note",
      "created_by",
      "updated_by"
    ) VALUES (
      NEW."id",
      NEW."notes",
      NEW."updated_by",
      NEW."updated_by"
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Contact notes and allotment
CREATE OR REPLACE FUNCTION "public"."get_profile_names"() RETURNS TABLE("user_id" "uuid", "full_name" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT user_id, full_name
  FROM public.user_profiles;
$$;

CREATE OR REPLACE FUNCTION "public"."get_contact_notes"(p_contact_id uuid)
RETURNS TABLE (
  note_id uuid,
  note_text text,
  created_by uuid,
  creator_name text,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER --@debug to invoker. When set to invoker even those who created the note can't see them
SET "search_path" TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can view beneficiaries';
  END IF;
  RETURN QUERY
  SELECT
    cn.id,
    cn.note,
    cn.created_by,
    up.full_name,
    cn.created_at
  FROM public.contacts_notes cn
  LEFT JOIN public.get_profile_names() up --@Review security profile and potentially restrict return by region, entity and division by role in get_profile_names
    ON cn.created_by = up.user_id
  WHERE cn.contact_id = p_contact_id
  ORDER BY cn.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_contact_note(p_note_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET "search_path" TO 'public'
AS $$
BEGIN
--@restrict to non-volunteer?
  DELETE FROM public.contacts_notes
  WHERE id = p_note_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."get_allotment"(p_contact_id uuid)
RETURNS TABLE (
  allotment_id uuid,
  "date" timestamp with time zone,
  visit_num numeric,
  attended boolean,
  serving boolean,
  served boolean,
  visit_type public.allotment_type_enum,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER --@debug policies
SET "search_path" TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can view beneficiaries';
  END IF;
  RETURN QUERY
  SELECT
    ca.id,
    ca.date,
    ca.visit_num,
    ca.attended,
    ca.serving,
    ca.served,
    ca.type,
    ca.updated_at
  FROM public.contacts_allotment ca
  WHERE ca.contact_id = p_contact_id
  ORDER BY ca.date ASC;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."insert_allotment_discretionary"(
  "p_contact_id" uuid DEFAULT NULL, 
  "p_user_id" uuid DEFAULT NULL,
  "p_date" timestamp with time zone DEFAULT now(), 
  "p_type" allotment_type_enum DEFAULT 'drop_in'::allotment_type_enum,
  "p_note" text DEFAULT ''
  ) RETURNS uuid
LANGUAGE "plpgsql" SECURITY INVOKER
SET "search_path" TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can add allotments';
    END IF;
--@ restrict to non-referrer
  INSERT INTO public.contacts_allotment
      (contact_id, date, visit_num, attended, serving, served, type) 
  VALUES
      (p_contact_id, p_date, 1, true, false, false, p_type)
      RETURNING id INTO v_id;
  INSERT INTO public.contacts_notes
      (contact_id, note, created_by, updated_by)
  VALUES
      (p_contact_id, p_note, p_user_id, p_user_id);
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."mark_allotment_attendance"("p_id" "uuid") RETURNS BOOLEAN
  LANGUAGE "plpgsql" SECURITY INVOKER
  SET "search_path" TO 'public'
  AS $$
DECLARE
  v_caller_role text;
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can mark attendance';
    END IF;
  
    SELECT role::text
    INTO v_caller_role
    FROM public.user_profiles
    WHERE user_id = auth.uid();

    IF v_caller_role NOT IN ('admin', 'head', 'manager', 'branch_manager', 'staff', 'volunteer') THEN
      RAISE EXCEPTION 'Referrers can not administer food parcels';
    END IF;

    UPDATE public.contacts_allotment
       SET attended = TRUE
     WHERE id = p_id
       AND attended = FALSE;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."mark_allotment_serving"("p_id" "uuid") RETURNS BOOLEAN
  LANGUAGE "plpgsql" SECURITY INVOKER
  SET "search_path" TO 'public'
  AS $$
DECLARE
  v_caller_role text;
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can mark as serving';
    END IF;

    SELECT role::text
    INTO v_caller_role
    FROM public.user_profiles
    WHERE user_id = auth.uid();

    IF v_caller_role NOT IN ('admin', 'head', 'manager', 'branch_manager', 'staff', 'volunteer') THEN
      RAISE EXCEPTION 'Referrers can not administer food parcels';
    END IF;

    UPDATE public.contacts_allotment
       SET serving = NOT serving
     WHERE id = p_id;
    RETURN FOUND;
END;
$$;

-- CREATE OR REPLACE FUNCTION "public"."mark_allotment_served"("p_id" "uuid") RETURNS "void"
--   LANGUAGE "plpgsql" SECURITY INVOKER
--   SET "search_path" TO 'public'
--   AS $$
-- BEGIN
--     UPDATE public.contacts_allotment
--        SET served = TRUE
--      WHERE id = p_id
--        AND served = FALSE;
-- END;
-- $$;

CREATE OR REPLACE FUNCTION public."mark_allotment_served"(p_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_role text;
  v_contact_id uuid;
  v_has_future boolean;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can mark as served';
  END IF;

  SELECT role::text
  INTO v_caller_role
  FROM public.user_profiles
  WHERE user_id = auth.uid();

  IF v_caller_role NOT IN ('admin', 'head', 'manager', 'branch_manager', 'staff', 'volunteer') THEN
    RAISE EXCEPTION 'Referrers can not administer food parcels';
  END IF;

  UPDATE public.contacts_allotment
     SET served = TRUE
   WHERE id = p_id
     AND served = FALSE;

  SELECT contact_id
  INTO v_contact_id
  FROM public.contacts_allotment
  WHERE id = p_id;

  SELECT EXISTS (
    SELECT 1
    FROM public.contacts_allotment ca
    WHERE ca.contact_id = v_contact_id
      AND ca.date > now() + interval '1 day'
      AND ca.served = FALSE
  )
  INTO v_has_future;
  IF NOT v_has_future THEN
    UPDATE public.contacts
       SET status = 'inactive'::beneficiary_enum
     WHERE id = v_contact_id
       AND status = 'active'::beneficiary_enum;
  END IF;
  RETURN FOUND;
END;
$$;


CREATE OR REPLACE FUNCTION public.handle_allotment_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.contacts c
     SET status = 'inactive'::beneficiary_enum
   WHERE c.status = 'active'::beneficiary_enum
     AND NOT EXISTS (
        SELECT 1
          FROM public.contacts_allotment ca
         WHERE ca.contact_id = c.id
           AND ca.date > now() + interval '1 day'
     );
  RETURN NULL;
END;
$$;



-- Dashboard
CREATE OR REPLACE FUNCTION "public"."get_division_summary"(
  p_entity_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  pending_beneficiaries bigint,
  beneficiaries bigint,
  referrers bigint,
  workforce bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
   RAISE EXCEPTION 'Only authenticated users can view division summaries';
  END IF;
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    p.cnt AS pending_beneficiaries,
    -- COALESCE(p.cnt,0) AS pending_beneficiaries,
    COALESCE(a.cnt,0) AS beneficiaries,
    COALESCE(r.cnt,0) AS referrers,
    COALESCE(w.cnt,0) AS workforce
  FROM public.divisions d

  LEFT JOIN LATERAL (
      SELECT *
      FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.division_id = d.id
  ) up_user ON true

  LEFT JOIN LATERAL (
      SELECT COUNT(*) AS cnt
      FROM public.contacts c
      -- JOIN public.user_profiles up2
      --   ON up2.user_id = c.owner_id
      -- WHERE up2.division_id = d.id
      --   AND c.status = 'pending'
      WHERE  c.status = 'pending'
  ) p ON true

  LEFT JOIN LATERAL (
      SELECT COUNT(*) AS cnt
      FROM public.contacts c
      JOIN public.user_profiles up2
        ON up2.user_id = c.owner_id
      WHERE up2.division_id = d.id
        AND c.status = 'active'
  ) a ON true

  LEFT JOIN LATERAL (
      SELECT COUNT(*) AS cnt
      FROM public.user_profiles up2
      WHERE up2.division_id = d.id
        AND up2.role = 'referrer'
        AND up2.is_active = true
  ) r ON true

  LEFT JOIN LATERAL (
      SELECT COUNT(*) AS cnt
      FROM public.user_profiles up2
      WHERE up2.division_id = d.id
        AND up2.role IN ('manager','branch_manager','staff','volunteer')
        AND up2.is_active = true
  ) w ON true

  WHERE (p_entity_id IS NOT NULL AND d.entity_id = p_entity_id)
     OR (p_entity_id IS NULL AND up_user.user_id IS NOT NULL) 
     OR (up_user.role = 'referrer'); --@link referrers to all relevant entities
END;
$$;



-- Division management
--used in admin's role management and pending beneficiary assignment
CREATE OR REPLACE FUNCTION "public"."get_divisions_by_entity"(
  p_entity_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  entity_id uuid,
  head_id uuid,
  manager_id uuid,
  region_id uuid,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    d.id,
    d.name,
    d.entity_id,
    d.head_id,
    d.manager_id,
    d.region_id,
    d.created_at
  FROM public.divisions d
  WHERE (p_entity_id IS NULL OR d.entity_id = p_entity_id)
    AND d.is_active = true
  ORDER BY d.name;
$$;

--@ add region
CREATE OR REPLACE FUNCTION public.create_division(
    p_name text,
    p_entity_id uuid,
    p_head_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
    new_id uuid;
    new_row public.divisions; --for audit log
BEGIN
    IF p_head_id IS NULL THEN
        SELECT head_id
        INTO p_head_id
        FROM public.divisions d
        WHERE d.entity_id = p_entity_id
          AND d.head_id IS NOT NULL
          AND EXISTS (
              SELECT 1
              FROM public.user_profiles u
              WHERE u.user_id = d.head_id
          )
        ORDER BY d.created_at
        LIMIT 1;
    END IF;

    INSERT INTO public.divisions (name, entity_id, head_id, created_at, is_active)
    VALUES (p_name, p_entity_id, p_head_id, now(), true)
     RETURNING * INTO new_row;
     new_id := new_row.id;

  INSERT INTO public.division_settings (
    division_id,
    setting_key,
    setting_value
  )
  SELECT
    new_id,
    unnest(array['allotment_weeks', 'exclusion_weeks', 'day_offset', 'hour_offset']),
    unnest(array['6', '12', '1', '10.5']) --days start on Monday (i.e. Monday = 0). Hours start at midnight 
  ON CONFLICT DO NOTHING;

  PERFORM log_audit_event('CREATE', 'divisions', new_id, NULL, row_to_json(new_row)::jsonb);
  RETURN new_id;
END;
$$;

--@ add region?   
CREATE OR REPLACE FUNCTION public."update_division"(
  p_id          uuid,
  p_name        text,
  p_entity_id   uuid,
  p_head_id     uuid DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  v_head_id uuid;
  old_row jsonb; --for audit log
   new_row  public.divisions; --for audit log
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can update divisions';
  END IF;
  --@ add check on role to match policy
  SELECT row_to_json(d)
  INTO old_row
  FROM public.divisions d
  WHERE d.id = p_id;

  IF p_head_id IS NULL THEN
    SELECT head_id
      INTO v_head_id
      FROM public.divisions d
      WHERE d.entity_id = p_entity_id
        AND d.head_id IS NOT NULL
      ORDER BY d.created_at
      LIMIT 1;
  ELSE
    v_head_id := p_head_id;
  END IF;

  UPDATE public.divisions
  SET    name      = p_name,
         entity_id = p_entity_id,
         head_id   = v_head_id  
  WHERE  id = p_id
  RETURNING * INTO new_row;
  PERFORM log_audit_event('UPDATE', 'divisions', p_id, old_row, row_to_json(new_row)::jsonb);
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public."delete_division"(p_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  old_row jsonb; --for audit_log
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can delete divisions';
  END IF;
  --@add check on role to match policy
  SELECT row_to_json(d)::jsonb
  INTO old_row
  FROM public.divisions d
  WHERE d.id = p_id;

  DELETE FROM public.divisions
  WHERE id = p_id;
  PERFORM log_audit_event('DELETE', 'divisions', p_id, old_row, NULL);
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_division_manager()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  other_manager uuid;
BEGIN
  -- IF auth.uid() IS NULL THEN --@ Restore when not using seed data
  --   RAISE EXCEPTION 'Only authenticated users can update division manager';
  -- END IF;
  --Manager added / moved to a division
  IF NEW.role = 'manager' AND NEW.is_active AND NEW.division_id IS NOT NULL THEN
    UPDATE public.divisions
       SET manager_id = NEW.user_id
     WHERE id = NEW.division_id;
    RETURN NEW;
  END IF;
  --Manager removed / deactivated / moved out of division
  IF OLD.role = 'manager' AND OLD.is_active AND OLD.division_id IS NOT NULL THEN
    IF TG_OP = 'DELETE' OR
       (NEW.role <> 'manager' OR NEW.is_active IS NOT TRUE OR NEW.division_id IS NULL) THEN
      SELECT id INTO other_manager
      FROM public.user_profiles
      WHERE division_id = OLD.division_id
        AND role = 'manager'
        AND is_active
        AND id <> OLD.id
      LIMIT 1;
      IF other_manager IS NULL THEN
        UPDATE public.divisions
           SET manager_id = NULL
         WHERE id = OLD.division_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


-- Calendar CRUD
CREATE OR REPLACE FUNCTION public."get_tasks"()
RETURNS TABLE (
  id uuid,
  entry_type text,
  beneficiary_id uuid,
  beneficiary_name text,
  pic_id uuid,
  pic_name text,
  scheduled_at timestamptz,
  status text,
  notes text,
  created_by uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET "search_path" TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can view tasks';
  END IF;
  RETURN QUERY
    SELECT
      ta.id,
      ta.entry_type,
      ta.beneficiary_id,
      co_b.name      AS beneficiary_name,
      ta.pic_id,
      co_pic.name    AS pic_name,
      ta.scheduled_at,
      ta.status,
      ta.notes,
      ta.created_by,
      ta.created_at
    FROM public.calendar ta
    LEFT JOIN public.contacts co_b
      ON ta.beneficiary_id = co_b.id
    LEFT JOIN public.contacts co_pic
      ON ta.pic_id = co_pic.id
    WHERE ta.entry_type <> 'event'
    ORDER BY ta.scheduled_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_calendar(
    start_date timestamptz,
    end_date   timestamptz
)
RETURNS TABLE (
    id            uuid,
    entry_type    text,
    subject       text,
    location      text,
    notes         text,
    scheduled_at  timestamptz,
    status        text,
    created_by    uuid,
    created_at    timestamptz
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
    v_role         text;
    v_entity_id    uuid;
    v_division_id  uuid;
    v_user_id      uuid;
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can view events';
    END IF;
    SELECT role, entity_id, division_id, user_id
    INTO   v_role, v_entity_id, v_division_id, v_user_id
    FROM   public.user_profiles
    WHERE  user_id = auth.uid();

    RETURN QUERY
    SELECT
        c.id, c.entry_type, c.subject, c.location, c.notes,
        c.scheduled_at, c.status, c.created_by, c.created_at
    FROM   public.calendar c
    JOIN   public.user_profiles up_creator
           ON c.created_by = up_creator.user_id
    WHERE  c.scheduled_at BETWEEN start_date AND end_date
    AND    (
            /* admin sees all */
            v_role = 'admin'
            /* high‑level roles see own entity */
            OR (v_role IN ('head','manager','branch_manager')
                AND up_creator.entity_id = v_entity_id)
            /* staff/volunteer see own division */
            OR (v_role IN ('staff','volunteer')
                AND up_creator.division_id = v_division_id)
            /* default: only own records */
            OR (v_role NOT IN ('admin','head','manager','branch_manager',
                               'staff','volunteer')
                AND up_creator.user_id = v_user_id)
          )
    ORDER BY c.scheduled_at ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_calendar(
    p_entry_type   text,
    p_subject     text,
    p_location    text,
    p_beneficiary_id uuid,
    p_pic_id      uuid,
    p_scheduled_at timestamptz,
    p_status      text,
    p_notes       text,
    p_created_by  uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  new_id uuid;
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can add events';
    END IF;
    INSERT INTO public.calendar (
        entry_type, subject, location, beneficiary_id, pic_id,
        scheduled_at, status, notes,
        created_by, created_at, updated_at
    ) VALUES (
        p_entry_type, P_subject, p_location, p_beneficiary_id, p_pic_id,
        p_scheduled_at, p_status, p_notes,
        p_created_by, NOW(), NOW()
    )
    RETURNING id INTO new_id;
    RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_calendar_bulk(events jsonb)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  rec jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can add events';
  END IF;
  FOR rec IN SELECT * FROM jsonb_array_elements(events)
  LOOP
    INSERT INTO public.calendar (
        entry_type, subject, location, beneficiary_id, pic_id,
        scheduled_at, status, notes,
        created_by, created_at, updated_at
    ) VALUES (
        rec->>'p_entry_type',
        rec->>'p_subject',
        rec->>'p_location',
        (rec->>'p_beneficiary_id')::uuid,
        (rec->>'p_pic_id')::uuid,
        (rec->>'p_scheduled_at')::timestamptz,
        rec->>'p_status',
        rec->>'p_notes',
        (rec->>'p_created_by')::uuid,
        NOW(),
        NOW()
    );
  END LOOP;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_calendar(
    p_id          uuid,
    p_entry_type   text,
    p_subject     text,
    p_location    text,
    p_beneficiary_id uuid,
    p_pic_id      uuid,
    p_scheduled_at timestamptz,
    p_status      text,
    p_notes       text
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can update events and tasks';
    END IF;
    --@ add role and user_id=created_by restrictions
    UPDATE public.calendar SET
        entry_type     = p_entry_type,
        subject       = p_subject,
        location      = p_location,
        beneficiary_id = p_beneficiary_id,
        pic_id        = p_pic_id,
        scheduled_at  = p_scheduled_at,
        status        = p_status,
        notes         = p_notes,
        updated_at    = NOW()
    WHERE id = p_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_calendar_status(
    p_id          uuid,
    p_status      text
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can update events and tasks';
    END IF;
    UPDATE public.calendar SET
        status        = p_status,
        updated_at    = NOW()
    WHERE id = p_id;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_calendar(
    p_id uuid
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY INVOKER
SET "search_path" TO "public"
AS $$
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can delete events and tasks';
    END IF;
    DELETE FROM public.calendar WHERE id = p_id;
    RETURN FOUND;
END;
$$;

-- Calendar-notifications
--
--
--
--@
CREATE OR REPLACE FUNCTION "public"."calendar_notify_insert"()
RETURNS trigger
LANGUAGE plpgsql
SET "search_path" TO "public"
AS $$
DECLARE
    v_role text := 'staff';
    v_type text := 'calendar';
    v_link text := '/calendar';
    v_message text := 'A new calendar item has been added';
    v_entity_id uuid;
    v_dynamic_role text;
BEGIN
    SELECT u.entity_id INTO v_entity_id
    FROM public.user_profiles u
    WHERE u.user_id = NEW.created_by;

    CASE NEW.entry_type
        WHEN 'referrer_request' THEN
            SELECT setting_value INTO v_dynamic_role
            FROM public.entity_settings
            WHERE entity_id = v_entity_id
              AND setting_key = 'referrer_request';

            v_role := COALESCE(v_dynamic_role, 'branch_manager');
            v_type := 'task';
            v_link := '/tasks';
            v_message := 'You have a new referrer request';
        WHEN 'beneficiary_request' THEN
            v_role := 'staff';
            v_type := 'task';
            v_link := '/tasks';
            v_message := 'You have a new beneficiary request';
        WHEN 'staff_todo' THEN
            v_role := 'staff';
            v_type := 'task';
            v_link := '/tasks';
            v_message := 'A todo item for staff has been added';
        WHEN 'volunteer_todo' THEN
            v_role := 'volunteer';
            v_type := 'task';
            v_link := '/tasks';
            v_message := 'A todo item for volunteers has been added';
        WHEN 'event' THEN
            v_role := 'branch_manager';
            v_type := 'calendar';
            v_link := '/calendar';
            v_message := 'A new event has been added';
        ELSE
            NULL;
    END CASE;

    INSERT INTO public.notifications (
        org_role,
        type,
        title,
        message,
        link,
        meta,
        created_at,
        calendar_id
    ) VALUES (
        v_role,
        v_type::public.notification_type_enum,
        v_message,
        v_message,
        v_link,
        '{}'::jsonb,
        NOW(),
        NEW.id
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."populate_notifications_user"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
    v_creator_entity uuid;
    v_user_ids       uuid[];
    v_referrer_id    uuid;
    v_target_role    text;
BEGIN
    IF NEW.calendar_id IS NOT NULL THEN
        SELECT u.entity_id
          INTO v_creator_entity
          FROM public.calendar c
          JOIN public.user_profiles u
            ON c.created_by = u.user_id
         WHERE c.id = NEW.calendar_id;
    ELSE
        SELECT u.entity_id
          INTO v_creator_entity
          FROM public.user_profiles u
         WHERE u.user_id = auth.uid();
    END IF;

    IF NEW.type = 'dm' THEN
        v_user_ids := ARRAY[]::uuid[];

    ELSIF NEW.type = 'alert' THEN
        SELECT array_agg(user_id)
          INTO v_user_ids
          FROM public.user_profiles
         WHERE role = NEW.org_role::role_enum
           AND entity_id = v_creator_entity
           AND is_active;

    ELSIF NEW.type = 'task' THEN
        CASE NEW.org_role
            WHEN 'staff', 'all_staff' THEN
                SELECT array_agg(user_id)
                  INTO v_user_ids
                  FROM public.user_profiles
                 WHERE role IN ('branch_manager'::role_enum,'staff'::role_enum)
                   AND entity_id = v_creator_entity
                   AND is_active;

            WHEN 'volunteer' THEN
                SELECT array_agg(user_id)
                  INTO v_user_ids
                  FROM public.user_profiles
                 WHERE role = 'volunteer'::role_enum
                   AND entity_id = v_creator_entity
                   AND is_active;

            WHEN 'branch_manager' THEN
                SELECT array_agg(user_id)
                  INTO v_user_ids
                  FROM public.user_profiles
                 WHERE role = 'branch_manager'::role_enum
                   AND entity_id = v_creator_entity
                   AND is_active;

            WHEN 'referrer' THEN
                SELECT array_agg(user_id)
                  INTO v_user_ids
                  FROM public.user_profiles
                 WHERE role = 'referrer'::role_enum
                   AND entity_id = v_creator_entity
                   AND is_active;

            ELSE
                v_user_ids := ARRAY[]::uuid[];
        END CASE;

    ELSIF NEW.type = 'calendar' THEN
        SELECT array_agg(user_id)
          INTO v_user_ids
          FROM public.user_profiles
         WHERE role = 'branch_manager'::role_enum
           AND entity_id = v_creator_entity
           AND is_active;

    ELSIF NEW.type IN ('ref_decision', 'referral') THEN
        SELECT cr.referrer_id INTO v_referrer_id
        FROM public.contacts_referrer cr
        JOIN public.notifications n ON n.contact_id = cr.contact_id
        WHERE n.id = NEW.id
        ORDER BY cr.created_at DESC
        LIMIT 1;

        IF NEW.type = 'ref_decision' AND v_referrer_id IS NOT NULL THEN
            v_user_ids := ARRAY[v_referrer_id];
        END IF;

        IF NEW.type = 'referral' AND v_referrer_id IS NOT NULL THEN
            SELECT array_agg(up.user_id) INTO v_user_ids
            FROM public.user_profiles up
            JOIN public.contacts c ON c.owner_id = up.user_id
            JOIN public.notifications n ON n.contact_id = c.id
            WHERE n.id = NEW.id
              AND up.entity_id = (SELECT entity_id FROM public.user_profiles WHERE user_id = c.owner_id)
              AND up.is_active
              AND up.role::text = NEW.org_role;
              --(
              --   CASE
              --       WHEN (SELECT division_id FROM public.user_profiles WHERE user_id = c.owner_id) IS NULL
              --       THEN 'head'
              --       ELSE (SELECT setting_value FROM public.entity_settings WHERE entity_id = (SELECT entity_id FROM public.user_profiles WHERE user_id = c.owner_id) AND setting_key = 'contact_notify')
              --   END
              -- );
        END IF;

    ELSE
        v_user_ids := ARRAY[]::uuid[];
    END IF;

    IF v_user_ids IS NOT NULL THEN
        INSERT INTO public.notifications_user(notification_id, user_id)
        SELECT NEW.id, uid
          FROM unnest(v_user_ids) AS uid;
    END IF;

    RETURN NEW;
END;
$$;
--
--
--
--@


CREATE OR REPLACE FUNCTION "public"."get_user_notifications"(
  p_include_read boolean DEFAULT true
)
RETURNS TABLE(
  id uuid,
  org_role text,
  type public.notification_type_enum,
  title text,
  message text,
  link text,
  meta jsonb,
  is_read boolean,
  created_at timestamptz
)
LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can view notifications';
    END IF;
  RETURN QUERY
  SELECT n.id,
         n.org_role,
         n.type,
         n.title,
         n.message,
         n.link,
         n.meta,
         nu.is_read,
         nu.created_at
  FROM notifications_user nu
  JOIN notifications n ON nu.notification_id = n.id
  LEFT JOIN user_settings us
    ON us.user_id = auth.uid()
   AND us.setting_key = CASE
        WHEN n.type = 'task'     THEN 'notification_tasks'
        WHEN n.type = 'calendar' THEN 'notification_calendar'
        ELSE NULL
      END
  WHERE nu.user_id = auth.uid()
    AND (p_include_read OR NOT nu.is_read)
    AND (us.setting_key IS NULL OR us.setting_value = 'true')
  ORDER BY nu.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public."calendar_notify_delete"()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE calendar_id = OLD.id;
    RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION public."create_notification"(
    p_title        text,
    p_message      text,
    p_link         text,
    p_type         public.notification_type_enum,
    p_target_user  uuid DEFAULT NULL,         
    p_org_role     text DEFAULT NULL,    
    p_calendar_id  uuid DEFAULT NULL     
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
    v_notif_id uuid;
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can add notifications';
    END IF;
    INSERT INTO public.notifications
        (calendar_id, org_role, type, title, message, link, meta)
    VALUES
        (p_calendar_id, p_org_role, p_type, p_title, p_message, p_link, '{}'::jsonb)
    RETURNING id INTO v_notif_id;
    
    IF p_type = 'dm' AND p_target_user IS NOT NULL THEN
        INSERT INTO public.notifications_user
            (notification_id, user_id)
        VALUES
            (v_notif_id, p_target_user);
      END IF;

    RETURN v_notif_id;
END;
$$;


-- Notification read and timed delete
CREATE OR REPLACE FUNCTION "public"."mark_notification_read"("p_id" "uuid") RETURNS BOOLEAN
  LANGUAGE "plpgsql" SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can mark notifications as read';
    END IF;
    UPDATE public.notifications_user
       SET is_read = TRUE, read_at = NOW()
     WHERE notification_id = p_id
       AND user_id = auth.uid()
       AND is_read = FALSE;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."mark_all_notifications_read"()
  RETURNS BOOLEAN
  LANGUAGE "plpgsql" SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can mark notifications as read';
    END IF;
    UPDATE public.notifications_user
       SET is_read = TRUE, read_at = NOW()
     WHERE user_id = auth.uid()
       AND is_read = FALSE;
    RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."mark_notifications_read_by_type"(p_type public.notification_type_enum, p_org_role text DEFAULT NULL)
  RETURNS BOOLEAN
  LANGUAGE "plpgsql" SECURITY DEFINER
  SET "search_path" TO 'public'
  AS $$
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can mark notifications as read';
    END IF;
    UPDATE public.notifications_user
       SET is_read = TRUE, read_at = NOW()
     WHERE user_id = auth.uid()
       AND is_read = FALSE
       AND notification_id IN (
            SELECT id
              FROM public.notifications
             WHERE type = p_type
               AND (p_org_role IS NULL OR org_role = p_org_role)
       );
    RETURN FOUND;
END;
$$;


CREATE OR REPLACE FUNCTION public.delete_old_notifications() RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - INTERVAL '1 month';
  RETURN NULL;
END;
$$;

-- Organisation CRUD
CREATE OR REPLACE FUNCTION "public"."get_organisations"("p_region_id" "uuid")
RETURNS TABLE (
  id uuid,
  name text,
  org_type org_type_enum,
  service text,
  address jsonb,
  region_id uuid,
  website text,
  phone text,
  email text,
  approval_status text,
  is_active boolean,
  notes text,
  created_by uuid
)
LANGUAGE sql
SET "search_path" TO 'public'
SECURITY INVOKER
AS $$
  SELECT
    id, name, org_type, service, address, region_id, website, phone, email, approval_status, is_active, notes, created_by
  FROM organisations
  WHERE is_active = true AND approval_status = 'approved' 
  AND (
      p_region_id IS NULL
      OR region_id = p_region_id
    )
  ORDER BY name ASC;
$$;

CREATE OR REPLACE FUNCTION "public"."create_organisation"(
  p_name text,
  p_org_type org_type_enum,
  p_service text,
  p_address jsonb,
  p_region_id uuid,
  p_website text,
  p_phone text,
  p_email text,
  p_approval_status text,
  p_is_active boolean,
  p_notes text,
  p_created_by uuid
) RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
    new_id uuid;
BEGIN
    IF auth.uid() IS NULL THEN
      RAISE EXCEPTION 'Only authenticated users can add services';
    END IF;
    INSERT INTO public.organisations (name, org_type, service, address, region_id, website, phone, email, approval_status, is_active, notes, created_by, created_at, updated_at)
    VALUES (p_name, p_org_type, p_service, COALESCE(p_address, '{}'::jsonb), p_region_id, p_website, p_phone, p_email, p_approval_status, p_is_active, p_notes, p_created_by, now(), now())
    RETURNING id INTO new_id;
    RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."delete_organisation"(p_id uuid)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Only authenticated users can delete services';
  END IF;
  DELETE FROM public.organisations
  WHERE id = p_id;
  RETURN FOUND;
END;
$$;

---
-- Triggers
--

-- Trigger: after insert on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- CREATE OR REPLACE TRIGGER "calendar_delete_trigger" BEFORE DELETE ON "public"."calendar" FOR EACH ROW EXECUTE FUNCTION "public"."calendar_delete_trigger"();

-- CREATE OR REPLACE TRIGGER "calendar_insert_trigger" BEFORE INSERT ON "public"."calendar" FOR EACH ROW EXECUTE FUNCTION "public"."calendar_insert_trigger"();

-- CREATE OR REPLACE TRIGGER "calendar_update_trigger" BEFORE UPDATE ON "public"."calendar" FOR EACH ROW EXECUTE FUNCTION "public"."calendar_update_trigger"();

CREATE OR REPLACE TRIGGER "preserve_non_admin_fields_trigger" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."preserve_non_admin_fields"();

CREATE OR REPLACE TRIGGER "validate_user_profile_trigger" BEFORE INSERT OR UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."validate_user_profile_assignment"();

CREATE TRIGGER "contact_status_insert_trigger"
AFTER INSERT ON "public"."contacts"
FOR EACH ROW
EXECUTE FUNCTION "public"."handle_contact_status"();

CREATE TRIGGER "contact_status_update_trigger"
AFTER UPDATE ON "public"."contacts"
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION "public"."handle_contact_status"();

CREATE TRIGGER allotment_complete_trigger --@ consider changing to a cron job. This is not ideal
AFTER INSERT OR UPDATE ON public.contacts_allotment
FOR EACH STATEMENT
EXECUTE FUNCTION public.handle_allotment_complete();

CREATE TRIGGER "contacts_note_insert_trigger"
AFTER INSERT ON "public"."contacts"
FOR EACH ROW
EXECUTE FUNCTION "public"."handle_contact_note"();

CREATE TRIGGER "contacts_note_update_trigger"
AFTER UPDATE ON "public"."contacts"
FOR EACH ROW
WHEN (OLD.notes IS DISTINCT FROM NEW.notes)
EXECUTE FUNCTION "public"."handle_contact_note"();

CREATE OR REPLACE TRIGGER divisionManager_update_trigger
AFTER INSERT OR UPDATE OF role, division_id, is_active
ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_division_manager();

CREATE OR REPLACE TRIGGER divisionManager_delete_trigger
AFTER DELETE
ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_division_manager();

CREATE TRIGGER calendar_notify_delete_trigger
AFTER DELETE ON public.calendar
FOR EACH ROW
EXECUTE FUNCTION public.calendar_notify_delete();

CREATE TRIGGER delete_old_notifications_trigger --@ consider changing to a cron job. This is not ideal
AFTER INSERT ON public.notifications
FOR EACH STATEMENT EXECUTE FUNCTION public.delete_old_notifications();

-- CREATE TRIGGER trg_delete_user_settings
-- AFTER DELETE ON public.user_profiles
-- FOR EACH ROW EXECUTE FUNCTION public.delete_user_settings();

CREATE TRIGGER populate_notifications_user_trigger
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.populate_notifications_user();

CREATE TRIGGER calendar_notify_insert_trigger
AFTER INSERT ON public.calendar
FOR EACH ROW
EXECUTE FUNCTION public.calendar_notify_insert();


--
-- Policies and RLS
--


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select" ON "public"."audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = ANY (ARRAY['admin'::"public"."role_enum", 'head'::"public"."role_enum"]))))));

CREATE POLICY "audit_logs_insert" ON "public"."audit_logs" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = (select auth.uid())));

CREATE POLICY "audit_logs_delete" ON "public"."audit_logs" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = ANY (ARRAY['admin'::"public"."role_enum", 'head'::"public"."role_enum"]))))));

ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY contacts_select ON public.contacts
FOR SELECT TO authenticated
USING (
  owner_id = (select auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.user_profiles up
    WHERE up.user_id = (select auth.uid())
      AND (up.role::text = 'admin'
      OR (
       up.role::text IN ('head', 'manager', 'referrer')
      AND up.region_id = contacts.region_id 
      ))
  )
  OR EXISTS (
    SELECT 1
    FROM public.user_profiles up
    JOIN public.user_profiles up_owner
      ON up_owner.user_id = contacts.owner_id
    WHERE up.user_id = (select auth.uid())
      AND (
        (up.role::text IN ('head', 'manager', 'referrer') AND up.region_id = up_owner.region_id)
        OR (up.role::text IN ('branch_manager','staff') AND up.entity_id = up_owner.entity_id)
        OR (up.role::text = 'volunteer' AND up.entity_id = up_owner.entity_id AND up.division_id = up_owner.division_id)
      )
  )
  OR EXISTS (
    SELECT 1
    FROM public.contacts_referrer cr
    WHERE cr.contact_id = contacts.id
      AND cr.referrer_id = auth.uid()
  )
);

CREATE POLICY contacts_insert ON public.contacts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_profiles up
      WHERE up.user_id = (select auth.uid())
        AND up.role::text IN ('admin', 'head', 'manager', 'referrer', 'branch_manager', 'staff')
    )
  );

CREATE POLICY contacts_update ON public.contacts
  FOR UPDATE TO authenticated
  USING (
    owner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.user_profiles up
      JOIN public.user_profiles up_owner
        ON up_owner.user_id = contacts.owner_id
      WHERE up.user_id = (select auth.uid())
        AND (
          (up.role::text IN ('admin', 'head', 'manager', 'referrer'))
          OR (up.role::text IN ('branch_manager','staff') AND up.entity_id = up_owner.entity_id)
          OR (up.role::text = 'volunteer' AND up.entity_id = up_owner.entity_id AND up.division_id = up_owner.division_id)
        )
    )
  )
  WITH CHECK (
    owner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.user_profiles up
      JOIN public.user_profiles up_owner
        ON up_owner.user_id = contacts.owner_id
      WHERE up.user_id = (select auth.uid())
        AND (
          (up.role::text IN ('admin', 'head', 'manager', 'referrer'))
          OR (up.role::text IN ('branch_manager','staff') AND up.entity_id = up_owner.entity_id)
          OR (up.role::text = 'volunteer' AND up.entity_id = up_owner.entity_id AND up.division_id = up_owner.division_id)
        )
    )
  );

CREATE POLICY contacts_delete ON public.contacts
  FOR DELETE TO authenticated
  USING (
    owner_id = (select auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.user_profiles up
      JOIN public.user_profiles up_owner
        ON up_owner.user_id = contacts.owner_id
      WHERE up.user_id = (select auth.uid())
        AND (
          up.role::text = 'admin'
          OR (up.role::text IN ('head', 'manager','branch_manager','staff') AND up.entity_id = up_owner.entity_id)
          OR (up.role::text = 'volunteer' AND up.entity_id = up_owner.entity_id AND up.division_id = up_owner.division_id)
        )
    )
  );


ALTER TABLE "public"."contacts_referrer" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_referrer_select" ON "public"."contacts_referrer" 
FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "contacts_referrer_insert" ON "public"."contacts_referrer" 
FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_profiles up
  WHERE ((up.user_id = (select auth.uid())) AND (up.role::text IN ('admin', 'referrer', 'head', 'manager', 'branch_manager', 'staff', 'volunteer') ))))); --= ANY (ARRAY['admin'::"public"."role_enum", 'referrer'::"public"."role_enum", 'head'::"public"."role_enum", 'manager'::"public"."role_enum", 'branch_manager'::"public"."role_enum", 'staff'::"public"."role_enum", 'volunteer'::"public"."role_enum"])

CREATE POLICY "contacts_referrer_update" ON "public"."contacts_referrer" 
FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND (up.role::text IN ('admin', 'referrer', 'head', 'manager', 'branch_manager', 'staff', 'volunteer')))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND (up.role::text IN ('admin', 'referrer', 'head', 'manager', 'branch_manager', 'staff', 'volunteer'))))));

CREATE POLICY "contacts_referrer_delete" ON "public"."contacts_referrer" 
FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = 'admin'::"public"."role_enum")))));


ALTER TABLE "public"."contacts_allotment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_allotment_select" ON "public"."contacts_allotment" 
FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "contacts_allotment_insert" ON "public"."contacts_allotment" 
FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'head', 'referrer', 'manager', 'branch_manager', 'staff') )))));

CREATE POLICY "contacts_allotment_update" ON "public"."contacts_allotment" 
FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'head', 'manager', 'branch_manager', 'staff', 'volunteer')))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'head', 'manager', 'branch_manager', 'staff', 'volunteer'))))));

CREATE POLICY "contacts_allotment_delete" ON "public"."contacts_allotment" 
FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text = 'admin')))));


ALTER TABLE "public"."contacts_notes" ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "contacts_notes_select" ON "public"."contacts_notes" 
-- FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "contacts_notes_select" ON "public"."contacts_notes"
FOR SELECT TO "authenticated"
USING (
  EXISTS (
    SELECT 1
    FROM public.contacts c
    WHERE c.id = contacts_notes.contact_id
      -- AND (
        -- c.owner_id = (select auth.uid())
        OR EXISTS (
          SELECT 1
          FROM public.user_profiles up
          WHERE up.user_id = (select auth.uid())
            AND (up.role::text = 'admin'
            OR (
             up.role::text IN ('head', 'manager')
            AND up.region_id = c.region_id
            ))
        )
        OR EXISTS (
          SELECT 1
          FROM public.user_profiles up
          JOIN public.user_profiles up_owner
            ON up_owner.user_id = c.owner_id
          WHERE up.user_id = (select auth.uid())
            AND (
              (up.role::text IN ('head', 'manager') AND up.region_id = up_owner.region_id)
              OR (up.role::text IN ('branch_manager','staff') AND up.entity_id = up_owner.entity_id)
              OR (up.role::text = 'volunteer' AND up.entity_id = up_owner.entity_id AND up.division_id = up_owner.division_id)
            )
        )
        OR EXISTS (
          SELECT 1
          FROM public.contacts_referrer cr
          WHERE cr.contact_id = c.id
            AND cr.referrer_id = auth.uid()
        )
      -- )
  )
);

CREATE POLICY "contacts_notes_insert" ON "public"."contacts_notes" 
FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'referrer', 'head', 'manager', 'branch_manager', 'staff', 'volunteer') )))));

CREATE POLICY "contacts_notes_update" ON "public"."contacts_notes" 
FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'referrer', 'head', 'manager', 'branch_manager', 'staff', 'volunteer')))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'referrer', 'head', 'manager', 'branch_manager', 'staff', 'volunteer'))))));

CREATE POLICY "contacts_notes_delete" ON "public"."contacts_notes" 
FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text = 'admin')))));
  

ALTER TABLE "public"."divisions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "divisions_delete" ON "public"."divisions" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = 'admin'::"public"."role_enum")))));

CREATE POLICY "divisions_insert" ON "public"."divisions" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = 'admin'::"public"."role_enum")))));

CREATE POLICY "divisions_select" ON "public"."divisions" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = 'admin'::"public"."role_enum")))) OR ("head_id" IN ( SELECT "user_profiles"."id"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."user_id" = (select auth.uid())))) OR ("entity_id" IN ( SELECT "user_profiles"."entity_id"
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = (select auth.uid())) AND ("user_profiles"."role" = 'head'::"public"."role_enum")))) OR ("id" IN ( SELECT "user_profiles"."division_id"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."user_id" = (select auth.uid()))))));

CREATE POLICY "divisions_update" ON "public"."divisions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = 'admin'::"public"."role_enum"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = 'admin'::"public"."role_enum")))));

ALTER TABLE "public"."entities" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entities_select" ON "public"."entities" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "entities_insert" ON "public"."entities" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = 'admin'::"public"."role_enum")))));

CREATE POLICY "entities_update" ON "public"."entities" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = 'admin'::"public"."role_enum"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = 'admin'::"public"."role_enum")))));

CREATE POLICY "entities_delete" ON "public"."entities" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = 'admin'::"public"."role_enum")))));

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "notifications_select" ON public.notifications
-- FOR SELECT TO authenticated
-- USING (
--    EXISTS (
--      SELECT 1
--      FROM public.user_profiles up
--      WHERE up.user_id = auth.uid()
--        AND up.role = 'admin'
--    )
--    OR
--    EXISTS (
--      SELECT 1
--      FROM public.notifications_user nu
--      WHERE nu.notification_id = id
--        AND nu.user_id = auth.uid()
--    )
-- );

CREATE POLICY "notifications_select" ON public.notifications
FOR SELECT TO authenticated
USING (TRUE);

CREATE POLICY "notifications_insert" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "notifications_update" ON public.notifications
FOR UPDATE TO authenticated
USING (false); --restricted - no one can update

CREATE POLICY "notifications_delete" ON public.notifications
FOR DELETE TO authenticated
USING (false); --restricted - only automatic deletes after time period

-- CREATE POLICY "notifications_insert" ON public.notifications
-- FOR INSERT TO authenticated
-- WITH CHECK (
--   (user_id = auth.uid() AND type = 'dm')
--   OR (org_role IS NOT NULL AND type = 'alert')
-- );

-- CREATE POLICY "notifications_update" ON public.notifications
-- FOR UPDATE TO authenticated
-- USING (
--   (user_id = auth.uid() AND type = 'dm')
--   OR (org_role IS NOT NULL AND type = 'alert')
-- )
-- WITH CHECK (
--   (user_id = auth.uid() AND type = 'dm')
--   OR (org_role IS NOT NULL AND type = 'alert')
-- );

ALTER TABLE "public"."notifications_user" ENABLE ROW LEVEL SECURITY;

CREATE POLICY notifications_user_select ON public.notifications_user
FOR SELECT TO authenticated
USING (user_id = (select auth.uid()));

CREATE POLICY notifications_user_insert ON public.notifications_user
FOR INSERT TO authenticated
WITH CHECK (true); --@permissive to all authenticated

CREATE POLICY notifications_user_update ON public.notifications_user
FOR UPDATE TO authenticated
USING (false);


ALTER TABLE "public"."organisations" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organisations_select" ON "public"."organisations" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "organisations_insert" ON "public"."organisations" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = ANY (ARRAY['admin'::"public"."role_enum", 'head'::"public"."role_enum", 'manager'::"public"."role_enum", 'referrer'::"public"."role_enum", 'branch_manager'::"public"."role_enum", 'staff'::"public"."role_enum", 'volunteer'::"public"."role_enum"]))))));

CREATE POLICY "organisations_update" ON "public"."organisations" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = ANY (ARRAY['admin'::"public"."role_enum", 'head'::"public"."role_enum", 'manager'::"public"."role_enum", 'referrer'::"public"."role_enum", 'branch_manager'::"public"."role_enum", 'staff'::"public"."role_enum", 'volunteer'::"public"."role_enum"])))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = ANY (ARRAY['admin'::"public"."role_enum", 'head'::"public"."role_enum", 'manager'::"public"."role_enum", 'referrer'::"public"."role_enum", 'branch_manager'::"public"."role_enum", 'staff'::"public"."role_enum", 'volunteer'::"public"."role_enum"]))))));

CREATE POLICY "organisations_delete" ON "public"."organisations" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role" = ANY (ARRAY['admin'::"public"."role_enum", 'head'::"public"."role_enum", 'manager'::"public"."role_enum", 'referrer'::"public"."role_enum", 'branch_manager'::"public"."role_enum", 'staff'::"public"."role_enum"]))))));

ALTER TABLE "public"."calendar" ENABLE ROW LEVEL SECURITY;

CREATE POLICY calendar_select ON public.calendar FOR SELECT TO authenticated USING ( EXISTS (
      SELECT 1
      FROM public.user_profiles up
      WHERE up.user_id = (select auth.uid())
        AND up.role = ANY(
          ARRAY['admin','head','manager','branch_manager','staff', 'volunteer', 'referrer']::public.role_enum[]
        )
    )
  );

CREATE POLICY calendar_insert ON public.calendar FOR INSERT TO authenticated WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY calendar_update ON public.calendar FOR UPDATE TO authenticated USING ( EXISTS (
      SELECT 1
      FROM public.user_profiles up_user
      LEFT JOIN public.user_profiles up_creator 
        ON up_creator.user_id = calendar.created_by
      WHERE up_user.user_id = auth.uid()
      AND (
        up_user.role IN ('admin', 'head')
        OR (
          up_user.role IN ('manager', 'branch_manager', 'staff')
          AND (up_user.entity_id = up_creator.entity_id OR up_creator.entity_id IS NULL)
        )
        OR calendar.created_by = (select auth.uid())
      )
    )
  )
  WITH CHECK ( EXISTS (
      SELECT 1
      FROM public.user_profiles up_user
      LEFT JOIN public.user_profiles up_creator 
        ON up_creator.user_id = calendar.created_by
      WHERE up_user.user_id = auth.uid()
      AND (
        up_user.role IN ('admin', 'head')
        OR (
          up_user.role IN ('manager', 'branch_manager', 'staff')
          AND (up_user.entity_id = up_creator.entity_id OR up_creator.entity_id IS NULL)
        )
        OR calendar.created_by = (select auth.uid())
      )
    )
  );

CREATE POLICY calendar_delete ON public.calendar FOR DELETE TO authenticated USING ( EXISTS (
      SELECT 1
      FROM public.user_profiles up_user
      LEFT JOIN public.user_profiles up_creator 
        ON up_creator.user_id = calendar.created_by
      WHERE up_user.user_id = auth.uid()
      AND (
        -- Admin & Head: Can delete anything
        up_user.role IN ('admin', 'head')
        OR (
          up_user.role IN ('manager', 'branch_manager', 'staff')
          AND (up_user.entity_id = up_creator.entity_id OR up_creator.entity_id IS NULL)
        )
        OR calendar.created_by = (select auth.uid())
      )
    )
  );


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_settings_select" ON "public"."system_settings" FOR SELECT TO "authenticated" USING (true);

ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_settings_select" ON "public"."user_settings" FOR SELECT USING (((select auth.uid()) = "user_id"));

CREATE POLICY "user_settings_update" ON "public"."user_settings" FOR UPDATE USING (((select auth.uid()) = "user_id"));

CREATE POLICY "user_settings_insert" ON "public"."user_settings" FOR INSERT WITH CHECK (("user_id" = (select auth.uid())));

-- CREATE POLICY "user_settings_delete" ON "public"."user_settings" USING (("public"."get_my_role"() = 'admin'::"text"));
--@

ALTER TABLE "public"."entity_settings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entity_settings_select" ON "public"."entity_settings" 
FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "entity_settings_insert" ON "public"."entity_settings" 
FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'head', 'manager') )))));

CREATE POLICY "entity_settings_update" ON "public"."entity_settings" 
FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'head', 'manager')))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'head', 'manager'))))));

CREATE POLICY "entity_settings_delete" ON "public"."entity_settings" 
FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text = 'admin')))));

ALTER TABLE "public"."division_settings" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "division_settings_select" ON "public"."division_settings" 
FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "division_settings_insert" ON "public"."division_settings" 
FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'head', 'manager', 'branch_manager') )))));

CREATE POLICY "division_settings_update" ON "public"."division_settings" 
FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'head', 'manager', 'branch_manager')))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text IN ('admin', 'head', 'manager', 'branch_manager'))))));

CREATE POLICY "division_settings_delete" ON "public"."division_settings" 
FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = (select auth.uid())) AND ("up"."role"::text = 'admin')))));

ALTER TABLE "public"."regions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "regions_select" ON "public"."regions" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "regions_update" ON "public"."regions" FOR UPDATE TO "authenticated" USING (( (EXISTS ( SELECT 1
   FROM "public"."get_my_profile"() "me"("role", "entity_id", "division_id")
  WHERE (("me"."role" = 'admin'::"text") OR (("me"."role" = 'head'::"text"))))))) WITH CHECK (( (EXISTS ( SELECT 1
   FROM "public"."get_my_profile"() "me"("role", "entity_id", "division_id")
  WHERE (("me"."role" = 'admin'::"text") OR (("me"."role" = 'head'::"text")))))));

CREATE POLICY "regions_delete" ON "public"."regions" FOR DELETE TO "authenticated" USING (((SELECT "role" FROM "public"."get_my_profile"()) = 'admin'::"text"));

ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING ((("user_id" = (select auth.uid())) OR (EXISTS ( SELECT 1
   FROM "public"."get_my_profile"() "me"("role", "entity_id", "division_id")
  WHERE (("me"."role" = 'admin'::"text") OR (("me"."role" = 'head'::"text") AND ("me"."entity_id" = "user_profiles"."entity_id")) OR (("me"."role" = ANY (ARRAY['manager'::"text", 'branch_manager'::"text", 'staff'::"text", 'volunteer'::"text"])) AND ("me"."entity_id" = "user_profiles"."entity_id") AND ("me"."division_id" = "user_profiles"."division_id")))))));

CREATE POLICY "user_profiles_update" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING ((("user_id" = (select auth.uid())) OR (EXISTS ( SELECT 1
   FROM "public"."get_my_profile"() "me"("role", "entity_id", "division_id")
  WHERE (("me"."role" = 'admin'::"text") OR (("me"."role" = 'head'::"text") AND ("me"."entity_id" = "user_profiles"."entity_id"))))))) WITH CHECK ((("user_id" = (select auth.uid())) OR (EXISTS ( SELECT 1
   FROM "public"."get_my_profile"() "me"("role", "entity_id", "division_id")
  WHERE (("me"."role" = 'admin'::"text") OR (("me"."role" = 'head'::"text") AND ("me"."entity_id" = "user_profiles"."entity_id")))))));

CREATE POLICY "user_profiles_delete" ON "public"."user_profiles" FOR DELETE TO "authenticated" USING (((SELECT "role" FROM "public"."get_my_profile"()) = 'admin'::"text"));

--
--Grants 
--

REVOKE EXECUTE ON FUNCTION "public"."handle_new_auth_user"() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."log_audit_event"("p_action" "text", "p_table_name" "text", "p_record_id" "uuid", "p_old_values" "jsonb", "p_new_values" "jsonb") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_audit_logs"("p_filters" "jsonb", "p_page" "numeric", "p_page_size" "numeric") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."admin_clear_audit_logs"("p_filters" "jsonb") FROM PUBLIC;

-- REVOKE EXECUTE ON FUNCTION "public"."ensure_admin_profile"() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."user_get_profile"() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_profile_names"() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."user_update_profile"("p_user_id" "uuid", "p_full_name" "text", "p_phone" "text") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_my_profile"() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_users_with_profiles"("p_query" "text", "p_role" "text") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_manager_by_division"("p_division_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_system_settings"() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."upsert_system_setting"("p_setting_key" "text", "p_setting_value" "text") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_entity_settings"("p_entity_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."upsert_entity_setting"("p_entity_id" "uuid", "p_setting_key" "text", "p_setting_value" "text") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_division_settings"("p_division_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."upsert_division_setting"("p_division_id" "uuid", "p_setting_key" "text", "p_setting_value" "text") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_user_settings"("p_user_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."upsert_user_setting"("p_user_id" "uuid", "p_setting_key" "text", "p_setting_value" "text") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."validate_user_profile_assignment"() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."admin_create_entity"("p_name" "text", "p_code" "text", "p_referrer" boolean) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."admin_delete_entity"("p_entity_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."admin_delete_user"("p_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."admin_update_entity"("p_entity_id" "uuid", "p_name" "text", "p_code" "text", "p_is_active" boolean) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."create_division"("p_name" "text", "p_entity_id" "uuid", "p_head_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."update_division"("p_id" "uuid", "p_name" "text", "p_entity_id" "uuid", "p_head_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."delete_division"("p_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."create_region"(p_name text, p_code text) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."update_region"(p_id uuid, p_name text, p_code text, p_is_active boolean) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."admin_update_user_profile"("p_profile_id" "uuid", "p_role" "public"."role_enum", 
"p_entity_id" "uuid", "p_division_id" "uuid", "p_manager_id" "uuid", "p_region_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_regions"() FROM PUBLIC; 

REVOKE EXECUTE ON FUNCTION "public"."create_contact"("p_name" "text", "p_email" "text", "p_phone" "text", "p_address" "text", 
"p_postcode" "text", "p_region_id" "uuid", "p_adults_count"  "numeric", "p_children_gt16" "numeric", "p_children_lt16" "numeric", 
"p_notes" "text", "p_status" "public"."beneficiary_enum", "p_user_id" "uuid", "p_owner_id" "uuid") FROM PUBLIC; 

REVOKE EXECUTE ON FUNCTION "public"."update_contact"("p_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text", 
"p_address" "text", "p_postcode" "text", "p_region_id" "uuid", "p_adults" "numeric", "p_children_gt16" "numeric", "p_children_lt16" "numeric", "p_infant" boolean, 
"p_allergies" boolean, "p_vegetarian" boolean, "p_hallal" boolean, "p_status" "public"."beneficiary_enum", "p_user_id" "uuid", "p_owner_id" "uuid","p_notes" "text") 
FROM PUBLIC; 

REVOKE EXECUTE ON FUNCTION "public"."delete_contact"("p_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."get_allotment"("p_contact_id" "uuid") FROM PUBLIC; 

REVOKE EXECUTE ON FUNCTION "public"."insert_allotment_discretionary"("p_contact_id" "uuid", "p_user_id" "uuid", 
"p_date" "timestamptz", "p_type" "public"."allotment_type_enum", "p_note" "text") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."mark_allotment_attendance"("p_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."mark_allotment_serving"("p_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."mark_allotment_served"("p_id" "uuid") FROM PUBLIC; 

REVOKE EXECUTE ON FUNCTION "public"."create_calendar"(text, text, text, uuid, uuid, timestamptz, text, text, uuid) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."update_calendar"(uuid, text, text, text, uuid, uuid, timestamptz, text, text) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."update_calendar_status"(uuid, text) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."delete_calendar"("uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."mark_all_notifications_read"() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."mark_notification_read"("p_id" "uuid") FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."delete_old_notifications"() FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION "public"."preserve_non_admin_fields"() FROM PUBLIC;


GRANT EXECUTE ON FUNCTION "public"."handle_new_auth_user"() TO "authenticated"; --@ currently weak? Anyone can sign-up and so add to auth and user_profiles via useAuth GoTrueClient 

GRANT EXECUTE ON FUNCTION "public"."log_audit_event"("p_action" "text", "p_table_name" "text", "p_record_id" "uuid", "p_old_values" "jsonb", "p_new_values" "jsonb") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_audit_logs"("p_filters" "jsonb", "p_page" "numeric", "p_page_size" "numeric") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_clear_audit_logs"("p_filters" "jsonb") TO authenticated;

-- GRANT EXECUTE ON FUNCTION "public"."ensure_admin_profile"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."user_get_profile"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."user_update_profile"("p_user_id" "uuid", "p_full_name" "text", "p_phone" "text") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_my_profile"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_users_with_profiles"("p_query" "text", "p_role" "text") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_manager_by_division"("p_division_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_system_settings"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."upsert_system_setting"("p_setting_key" "text", "p_setting_value" "text") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_entity_settings"("p_entity_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."upsert_entity_setting"("p_entity_id" "uuid", "p_setting_key" "text", "p_setting_value" "text") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_division_settings"("p_division_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."upsert_division_setting"("p_division_id" "uuid", "p_setting_key" "text", "p_setting_value" "text") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_user_settings"("p_user_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."upsert_user_setting"("p_user_id" "uuid", "p_setting_key" "text", "p_setting_value" "text") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."validate_user_profile_assignment"() TO "authenticated"; --@ currently weak? Anyone can sign-up and so add to auth and user_profiles via useAuth GoTrueClient

GRANT EXECUTE ON FUNCTION "public"."admin_create_entity"("p_name" "text", "p_code" "text", "p_referrer" boolean) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_delete_entity"("p_entity_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_delete_user"("p_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_update_entity"("p_entity_id" "uuid", "p_name" "text", "p_code" "text", "p_is_active" boolean) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."create_division"("p_name" "text", "p_entity_id" "uuid", "p_head_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."update_division"("p_id" "uuid", "p_name" "text", "p_entity_id" "uuid", "p_head_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."delete_division"("p_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."create_region"(p_name text, p_code text) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."update_region"(p_id uuid, p_name text, p_code text, p_is_active boolean) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_update_user_profile"("p_profile_id" "uuid", "p_role" "public"."role_enum", "p_entity_id" "uuid", "p_division_id" "uuid", "p_manager_id" "uuid", "p_region_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_regions"() TO "authenticated"; 

GRANT EXECUTE ON FUNCTION "public"."create_contact"("p_name" "text", "p_email" "text", "p_phone" "text", "p_address" "text", "p_postcode" "text", "p_region_id" "uuid", "p_adults_count"  "numeric", "p_children_gt16" "numeric", "p_children_lt16" "numeric", "p_notes" "text", "p_status" "public"."beneficiary_enum", "p_user_id" "uuid", "p_owner_id" "uuid") TO "authenticated"; 

GRANT EXECUTE ON FUNCTION "public"."update_contact"("p_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text", 
"p_address" "text", "p_postcode" "text", "p_region_id" "uuid", "p_adults" "numeric", "p_children_gt16" "numeric", "p_children_lt16" "numeric", "p_infant" boolean, 
"p_allergies" boolean, "p_vegetarian" boolean, "p_hallal" boolean, "p_status" "public"."beneficiary_enum", "p_user_id" "uuid", "p_owner_id" "uuid","p_notes" "text") 
TO "authenticated"; 

GRANT EXECUTE ON FUNCTION "public"."delete_contact"("p_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_allotment"("p_contact_id" "uuid") TO "authenticated"; 

GRANT EXECUTE ON FUNCTION "public"."insert_allotment_discretionary"("p_contact_id" "uuid", "p_user_id" "uuid", "p_date" "timestamptz", "p_type" "public"."allotment_type_enum", "p_note" "text") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."mark_allotment_attendance"("p_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."mark_allotment_serving"("p_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."mark_allotment_served"("p_id" "uuid") TO "authenticated"; 

GRANT EXECUTE ON FUNCTION "public"."create_calendar"(text, text, text, uuid, uuid, timestamptz, text, text, uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."update_calendar"(uuid, text, text, text, uuid, uuid, timestamptz, text, text) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."update_calendar_status"(uuid, text) TO authenticated;

GRANT EXECUTE ON FUNCTION "public"."delete_calendar"("uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."mark_all_notifications_read"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."mark_notification_read"("p_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."delete_old_notifications"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."preserve_non_admin_fields"() TO "authenticated";


REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."audit_logs" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."v_audit_log_complete" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."user_profiles" FROM PUBLIC; 

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."regions" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."system_settings" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."contacts_notes" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."contacts_referrer" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."contacts_allotment" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."entities" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."entity_settings" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."divisions" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."division_settings" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."contacts" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."notifications" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."calendar" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."notifications_user" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."organisations" FROM PUBLIC;

REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."user_settings" FROM PUBLIC;


GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."audit_logs" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."v_audit_log_complete" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."user_profiles" TO "authenticated"; 

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."regions" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."system_settings" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."contacts_notes" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."contacts_referrer" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."contacts_allotment" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."entities" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."entity_settings" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."divisions" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."division_settings" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."contacts" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."notifications" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."calendar" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."notifications_user" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."organisations" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."user_settings" TO "authenticated";


--
-- Realtime and RLS activated
--

SET row_security = on;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

--For real-time notification receipt
ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications";

ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."notifications_user";

-- ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."user_settings";

COMMIT;