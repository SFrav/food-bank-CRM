BEGIN;

-- A unified database initialisation file that can replace all migrations dated prior to May 2026

SET row_security = off;

--
--Types / enums
--
CREATE TYPE "public"."approval_status_enum" AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE "public"."notification_type_enum" AS ENUM (
    'alert',
    'target',
    'task',
    'ai',
    'system'
);

CREATE TYPE "public"."org_type_enum" AS ENUM (
    'customer',
    'end_user',
    'partner',
    'vendor'
);

CREATE TYPE "public"."role_enum" AS ENUM (
    'admin',
    'head',
    'manager',
    'account_manager',
    'staff',
    'sales',
    'pending'
);

COMMENT ON TYPE "public"."role_enum" IS 'User roles: admin (global), head (team leader), manager (sales manager), account_manager/sales (sales rep)';

CREATE TYPE "public"."user_status_enum" AS ENUM (
    'active',
    'inactive',
    'suspended'
);


--
--Tables
--


CREATE TABLE IF NOT EXISTS "public"."sales_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "activity_type" "text" NOT NULL,
    "subject" "text",
    "description" "text",
    "notes" "text",
    "status" "text",
    "scheduled_at" timestamp with time zone,
    "created_by" "uuid",
    "customer_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "due_at" timestamp with time zone,
    "pic_id" "uuid"
);

CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid",
    "changes" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "company" "text",
    "notes" "text",
    "owner_id" "uuid",
    "user_id" "uuid",
    "is_deleted" boolean DEFAULT false,
    "deleted_at" timestamp with time zone,
    "deleted_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
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
    "entity_id" "uuid"
);

COMMENT ON TABLE "public"."divisions" IS 'Teams within entities. Each team has one head (leader) and contains managers and sales reps. Formerly called divisions, now represents the Team concept in Entity → Team → Head → Manager → Sales hierarchy.';

COMMENT ON COLUMN "public"."divisions"."head_id" IS 'Head (leader) of this team. One head per team.';

COMMENT ON COLUMN "public"."divisions"."entity_id" IS 'Entity (company) this team belongs to.';

CREATE TABLE IF NOT EXISTS "public"."entities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "code" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."manager_team_members" (
    "manager_id" "uuid" NOT NULL,
    "account_manager_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "org_role" "text",
    "type" "public"."notification_type_enum" NOT NULL,
    "title" "text",
    "message" "text" NOT NULL,
    "link" "text",
    "meta" "jsonb" DEFAULT '{}'::"jsonb",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."organization_contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "mobile" "text",
    "whatsapp_number" "text",
    "title" "text",
    "is_primary" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "org_type" "public"."org_type_enum" DEFAULT 'customer'::"public"."org_type_enum" NOT NULL,
    "industry" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "addresses" "jsonb",
    "tax_id" "text",
    "website" "text",
    "phone" "text",
    "email" "text",
    "market_size" "text",
    "type" "text" DEFAULT 'customer'::"text",
    "approval_status" "text" DEFAULT 'approved'::"text",
    "notes" "text"
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
    "setting_value" "jsonb",
    "updated_by" "uuid",
    "updated_at" timestamp with time zone DEFAULT "now"()
);

CREATE TABLE IF NOT EXISTS "public"."titles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "full_name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "role" "public"."role_enum" DEFAULT 'account_manager'::"public"."role_enum" NOT NULL,
    "division_id" "uuid",
    "region_id" "uuid",
    "entity_id" "uuid",
    "manager_id" "uuid",
    "status" "public"."user_status_enum" DEFAULT 'active'::"public"."user_status_enum" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title_id" "uuid"
);

COMMENT ON COLUMN "public"."user_profiles"."division_id" IS 'Team ID (formerly division_id). References divisions table which now represents teams.';

--
--VIEWS
--
CREATE OR REPLACE VIEW "public"."activities" AS
 SELECT "id",
    "activity_type",
    "subject",
    "description",
    "notes",
    "status",
    "scheduled_at",
    "due_at",
    "created_by",
    "customer_id",
    "created_at",
    "updated_at"
   FROM "public"."sales_activities" "sa";

CREATE OR REPLACE VIEW "public"."sales_activity" AS
 SELECT "sa"."id",
    "sa"."activity_type",
    "sa"."notes",
    (COALESCE("sa"."scheduled_at", "sa"."created_at"))::"date" AS "date",
    (COALESCE("sa"."scheduled_at", "sa"."created_at"))::time without time zone AS "time",
    "sa"."created_at",
    "sa"."updated_at",
    "sa"."customer_id",
    "org"."name" AS "customer_name",
    "sa"."created_by" AS "user_id"
   FROM (("public"."sales_activities" "sa"
     LEFT JOIN "public"."organizations" "org" ON (("org"."id" = "sa"."customer_id"))))
  ORDER BY "sa"."created_at" DESC;

CREATE OR REPLACE VIEW "public"."sales_activity_v2" AS
 SELECT "sa"."id",
    "sa"."activity_type",
    "sa"."subject",
    "sa"."description",
    "sa"."scheduled_at",
    "sa"."due_at",
    "sa"."status",
    "sa"."notes",
    "sa"."created_by",
    "sa"."created_at",
    "sa"."updated_at",
    "sa"."customer_id",
    "sa"."pic_id",
    "org"."name" AS "customer_name"
   FROM ("public"."sales_activities" "sa"
     LEFT JOIN "public"."organizations" "org" ON (("org"."id" = "sa"."customer_id")))
  ORDER BY "sa"."created_at" DESC;

CREATE OR REPLACE VIEW "public"."v_audit_log_complete" AS
 SELECT "al"."id",
    "al"."user_id",
    "al"."action" AS "action_type",
    "al"."table_name",
    "al"."record_id",
    NULL::"jsonb" AS "old_values",
    "al"."changes" AS "new_values",
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

CREATE OR REPLACE VIEW "public"."v_master_customer" AS
 SELECT "id",
    "name",
    "industry",
    "is_active",
    "created_at",
    "updated_at"
   FROM "public"."organizations" "o"
  WHERE (("org_type" = 'customer'::"public"."org_type_enum") AND ("is_active" = true));

CREATE OR REPLACE VIEW "public"."v_master_end_user" AS
 SELECT "id",
    "name",
    "industry",
    "is_active",
    "created_at",
    "updated_at"
   FROM "public"."organizations" "o"
  WHERE (("org_type" = 'end_user'::"public"."org_type_enum") AND ("is_active" = true));


--
--Primary keys
--

ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."divisions"
    ADD CONSTRAINT "divisions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."entities"
    ADD CONSTRAINT "entities_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."manager_team_members"
    ADD CONSTRAINT "manager_team_members_pkey" PRIMARY KEY ("manager_id", "account_manager_id");

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."organization_contacts"
    ADD CONSTRAINT "organization_contacts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."regions"
    ADD CONSTRAINT "regions_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."sales_activities"
    ADD CONSTRAINT "sales_activities_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_setting_key_key" UNIQUE ("setting_key");

ALTER TABLE ONLY "public"."titles"
    ADD CONSTRAINT "titles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");


--
--Indexes
--

CREATE INDEX "idx_divisions_entity_id" ON "public"."divisions" USING "btree" ("entity_id");

CREATE INDEX "idx_divisions_head_id" ON "public"."divisions" USING "btree" ("head_id");

CREATE INDEX "idx_manager_team_members_am" ON "public"."manager_team_members" USING "btree" ("account_manager_id");

CREATE INDEX "idx_manager_team_members_manager" ON "public"."manager_team_members" USING "btree" ("manager_id");

CREATE INDEX "idx_user_profiles_division_id" ON "public"."user_profiles" USING "btree" ("division_id");

CREATE INDEX "idx_user_profiles_entity_id" ON "public"."user_profiles" USING "btree" ("entity_id");

CREATE INDEX "idx_user_profiles_manager_id" ON "public"."user_profiles" USING "btree" ("manager_id");

CREATE INDEX "idx_user_profiles_role" ON "public"."user_profiles" USING "btree" ("role");

CREATE INDEX "idx_user_profiles_user_id" ON "public"."user_profiles" USING "btree" ("user_id");

CREATE UNIQUE INDEX "one_manager_per_division" ON "public"."user_profiles" USING "btree" ("division_id") WHERE (("role" = 'manager'::"public"."role_enum") AND ("is_active" = true));

CREATE INDEX "sales_activities_created_at_idx" ON "public"."sales_activities" USING "btree" ("created_at");

CREATE INDEX "sales_activities_created_by_idx" ON "public"."sales_activities" USING "btree" ("created_by");

CREATE INDEX "sales_activities_customer_id_idx" ON "public"."sales_activities" USING "btree" ("customer_id");

CREATE INDEX "sales_activities_due_at_idx" ON "public"."sales_activities" USING "btree" ("due_at");

CREATE INDEX "sales_activities_pic_id_idx" ON "public"."sales_activities" USING "btree" ("pic_id");

CREATE INDEX "sales_activities_scheduled_at_idx" ON "public"."sales_activities" USING "btree" ("scheduled_at");

--
-- Foreign keys
--

ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id");

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."divisions"
    ADD CONSTRAINT "divisions_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."divisions"
    ADD CONSTRAINT "divisions_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."manager_team_members"
    ADD CONSTRAINT "manager_team_members_account_manager_id_fkey" FOREIGN KEY ("account_manager_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."manager_team_members"
    ADD CONSTRAINT "manager_team_members_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."organization_contacts"
    ADD CONSTRAINT "organization_contacts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."organization_contacts"
    ADD CONSTRAINT "organization_contacts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."sales_activities"
    ADD CONSTRAINT "sales_activities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."sales_activities"
    ADD CONSTRAINT "sales_activities_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."sales_activities"
    ADD CONSTRAINT "sales_activities_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "public"."organization_contacts"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_division_id_fkey" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "public"."user_profiles"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_title_id_fkey" FOREIGN KEY ("title_id") REFERENCES "public"."titles"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
--Functions
--

CREATE OR REPLACE FUNCTION "public"."_get_effective_user_profile"("p_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("user_id" "uuid", "profile_id" "uuid", "role" "public"."role_enum", "entity_id" "uuid", "division_id" "uuid")
    LANGUAGE "sql"
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT 
    up.user_id,
    up.id AS profile_id,
    up.role,
    up.entity_id,
    up.division_id -- This is now semantically "team_id"
  FROM public.user_profiles up
  WHERE up.user_id = COALESCE(p_user_id, auth.uid())
  LIMIT 1;
$$;


COMMENT ON FUNCTION "public"."_get_effective_user_profile"("p_user_id" "uuid") IS 'Returns user profile info including entity_id and team (division_id). Used by entity-scoped RPCs.';


CREATE OR REPLACE FUNCTION "public"."activities_delete_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Ensure user can only delete their own activities
  IF OLD.created_by != auth.uid() THEN
    RAISE EXCEPTION 'You can only delete your own activities';
  END IF;
  
  DELETE FROM public.sales_activities 
  WHERE id = OLD.id AND created_by = auth.uid();
  
  RETURN OLD;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."activities_insert_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Set created_by to current user if not provided or null
    IF NEW.created_by IS NULL THEN
        NEW.created_by = auth.uid();
    END IF;
    
    -- If auth.uid() is still null, try to get from JWT
    IF NEW.created_by IS NULL THEN
        NEW.created_by = (auth.jwt() ->> 'sub')::uuid;
    END IF;
    
    -- Set created_at if not provided
    IF NEW.created_at IS NULL THEN
        NEW.created_at = NOW();
    END IF;
    
    -- Set updated_at
    NEW.updated_at = NOW();
    
    INSERT INTO public.sales_activities (
        subject,
        description,
        status,
        due_at,
        scheduled_at,
        created_by,
        created_at,
        updated_at
    ) VALUES (
        NEW.subject,
        NEW.description,
        NEW.status,
        NEW.due_at,
        NEW.scheduled_at,
        NEW.created_by,
        NEW.created_at,
        NEW.updated_at
    );
    
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."activities_update_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Ensure user can only update their own activities
  IF OLD.created_by != auth.uid() THEN
    RAISE EXCEPTION 'You can only update your own activities';
  END IF;
  
  UPDATE public.sales_activities SET
    activity_type = NEW.activity_type,
    subject = NEW.subject,
    description = NEW.description,
    notes = NEW.notes,
    status = NEW.status,
    scheduled_at = NEW.scheduled_at,
    due_at = NEW.due_at,
    customer_id = NEW.customer_id,
    updated_at = now()
  WHERE id = OLD.id AND created_by = auth.uid();
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."admin_create_entity"("p_name" "text", "p_code" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_is_admin boolean;
  v_uid uuid;
  v_entity_id uuid;
BEGIN
  -- Check if current user is admin (bypassing RLS)
  v_uid := auth.uid();
  
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check admin status (this query runs as postgres user, bypassing RLS)
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
  
  -- Insert the entity (bypassing RLS because we're SECURITY DEFINER)
  INSERT INTO public.entities (name, code, is_active, created_by)
  VALUES (p_name, p_code, true, v_uid)
  RETURNING id INTO v_entity_id;
  
  RETURN v_entity_id;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."admin_delete_contact"("p_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  r jsonb;
BEGIN
  IF NOT can_manage_contact(p_id) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  DELETE FROM public.contacts
  WHERE id = p_id
  RETURNING jsonb_build_object('success', TRUE) INTO r;

  RETURN r;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Delete failed';
END;
$$;


CREATE OR REPLACE FUNCTION "public"."admin_delete_entity"("p_entity_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_is_admin boolean;
  v_uid uuid;
BEGIN
  -- Check if current user is admin (bypassing RLS)
  v_uid := auth.uid();
  
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check admin status
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
  
  -- Delete the entity (bypassing RLS because we're SECURITY DEFINER)
  DELETE FROM public.entities
  WHERE id = p_entity_id;
  
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
BEGIN
  SELECT role INTO v_role
  FROM user_profiles
  WHERE user_id = auth.uid();

  IF v_role != 'admin' THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;

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

  DELETE FROM manager_team_members
  WHERE manager_id = v_profile_id OR account_manager_id = v_profile_id;

  DELETE FROM sales_targets
  WHERE assigned_to = v_profile_id;

  -- WITH fallback_admin AS (
  --   SELECT up.user_id
  --   FROM user_profiles up
  --   WHERE up.role = 'admin'
  --     AND up.user_id != v_user_id
  --   ORDER BY up.created_at
  --   LIMIT 1
  -- )
  -- UPDATE opportunities
  -- SET owner_id = COALESCE((SELECT user_id FROM fallback_admin), owner_id),
  --     created_by = COALESCE((SELECT user_id FROM fallback_admin), created_by)
  -- WHERE owner_id = v_user_id;

  DELETE FROM sales_activities
  WHERE created_by = v_user_id;

  DELETE FROM user_profiles
  WHERE id = v_profile_id;

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


CREATE OR REPLACE FUNCTION "public"."admin_update_contact"("p_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text", "p_company" "text", "p_notes" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  r jsonb;
BEGIN
  IF NOT can_manage_contact(p_id) THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  UPDATE public.contacts
  SET name   = p_name,
      email  = p_email,
      phone  = p_phone,
      company= p_company,
      notes  = p_notes,
      updated_at = now() 
  WHERE id = p_id
  RETURNING jsonb_build_object('success', TRUE) INTO r;

  RETURN r;
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Update failed';
END;
$$;

CREATE OR REPLACE FUNCTION "public"."admin_update_entity"("p_entity_id" "uuid", "p_name" "text" DEFAULT NULL::"text", "p_code" "text" DEFAULT NULL::"text", "p_is_active" boolean DEFAULT NULL::boolean) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_is_admin boolean;
  v_uid uuid;
BEGIN
  -- Check if current user is admin (bypassing RLS)
  v_uid := auth.uid();
  
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check admin status
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
  
  -- Update the entity (bypassing RLS because we're SECURITY DEFINER)
  UPDATE public.entities
  SET 
    name = COALESCE(p_name, name),
    code = COALESCE(p_code, code),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = now()
  WHERE id = p_entity_id;
  
  RETURN FOUND;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."admin_update_profile"("p_id" "uuid", "p_role" "public"."role_enum", "p_division" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  -- Try resolve by profile primary key
  SELECT id INTO v_profile_id
  FROM public.user_profiles
  WHERE id = p_id
  LIMIT 1;

  -- If not found, resolve by user_id (auth.users id)
  IF v_profile_id IS NULL THEN
    SELECT id INTO v_profile_id
    FROM public.user_profiles
    WHERE user_id = p_id
    LIMIT 1;
  END IF;

  IF v_profile_id IS NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.user_profiles
  SET 
    role = p_role,
    division_id = p_division,
    updated_at = now()
  WHERE id = v_profile_id;

  RETURN TRUE;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."admin_update_user_profile"("p_profile_id" "uuid", "p_role" "public"."role_enum" DEFAULT NULL::"public"."role_enum", "p_entity_id" "uuid" DEFAULT NULL::"uuid", "p_division_id" "uuid" DEFAULT NULL::"uuid", "p_manager_id" "uuid" DEFAULT NULL::"uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_is_admin boolean;
  v_uid uuid;
  v_target_profile_id uuid;
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
    updated_at = now()
  WHERE id = v_target_profile_id;

  RETURN FOUND;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."can_manage_contact"("target_owner_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  viewer_role text;
  viewer_entity uuid;
  viewer_division uuid;
  target_entity uuid;
  target_division uuid;
BEGIN
  -- 1. Get current user's profile
  SELECT role, entity_id, division_id INTO viewer_role, viewer_entity, viewer_division
  FROM public.user_profiles WHERE user_id = auth.uid();

  -- 2. If same user, immediate true
  IF auth.uid() = target_owner_id THEN RETURN TRUE; END IF;

  -- 3. Admins can do anything
  IF viewer_role = 'admin' THEN RETURN TRUE; END IF;

  -- 4. Get target owner's profile details
  SELECT entity_id, division_id INTO target_entity, target_division
  FROM public.user_profiles WHERE user_id = target_owner_id;

  -- 5. Hierarchy Logic
  IF viewer_role = 'head' THEN
    RETURN viewer_entity = target_entity;
  ELSIF viewer_role IN ('manager', 'account_manager') THEN
    RETURN viewer_entity = target_entity AND viewer_division = target_division;
  END IF;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."ensure_admin_profile"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  _uid uuid;
  _email text;
  _full_name text;
BEGIN
  _uid := auth.uid();
  IF _uid IS NULL THEN
    RETURN;
  END IF;

  SELECT u.email, COALESCE(u.raw_user_meta_data->>'full_name', u.email)
    INTO _email, _full_name
  FROM auth.users u
  WHERE u.id = _uid;

  IF _email IS NULL THEN
    RETURN;
  END IF;

  IF LOWER(_email) IN (
    'admin@gmail.com',
    'hidayat.suli@gmail.com',
    'admin@company.com'
  ) THEN
    INSERT INTO public.user_profiles (id, user_id, full_name, role, is_active)
    VALUES (_uid, _uid, _full_name, 'admin', true)
    ON CONFLICT (user_id)
    DO UPDATE SET
      role = 'admin',
      full_name = EXCLUDED.full_name,
      is_active = true,
      updated_at = now();
  END IF;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."get_current_profile"() RETURNS TABLE("id" "uuid", "user_id" "uuid", "role" "public"."role_enum", "division_id" "uuid")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT up.id,
         up.user_id,
         up.role,
         up.division_id
  FROM public.user_profiles up
  WHERE up.user_id = auth.uid()
  LIMIT 1;
$$;


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

--@Placeholder
CREATE OR REPLACE FUNCTION public.get_manager_archived(
  p_manager_id uuid,
  p_period text DEFAULT NULL,
  p_start_date date DEFAULT NULL,
  p_end_date date DEFAULT NULL
) RETURNS TABLE(
  revenue   numeric,
  margin    numeric,
  project_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_entity_id  uuid;
  v_division_id uuid;
  v_start_date date;
  v_end_date   date;
  v_quarter    int;
  v_year       int;
BEGIN
  -- Get manager's entity and division
  SELECT entity_id, division_id
    INTO v_entity_id, v_division_id
    FROM public.user_profiles
   WHERE id = p_manager_id
     AND role = 'manager';

  IF v_entity_id IS NULL OR v_division_id IS NULL THEN
    RAISE EXCEPTION 'Manager not found or missing entity/division assignment';
  END IF;

  IF p_period IS NOT NULL AND p_period ~ '^Q[1-4] \\d{4}$' THEN
    v_quarter := SUBSTRING(p_period FROM 2 FOR 1)::int;
    v_year    := SUBSTRING(p_period FROM 4)::int;
    v_start_date := MAKE_DATE(v_year, (v_quarter - 1) * 3 + 1, 1);
    v_end_date   := (v_start_date + INTERVAL '3 MONTHS')::date - 1;
  ELSIF p_start_date IS NOT NULL AND p_end_date IS NOT NULL THEN
    v_start_date := p_start_date;
    v_end_date   := p_end_date;
  ELSE
    v_start_date := DATE_TRUNC('quarter', CURRENT_DATE)::date;
    v_end_date   := (v_start_date + INTERVAL '3 MONTHS' - INTERVAL '1 day')::date;
  END IF;

  -- Placeholder – no source tables left, return zeros
  RETURN QUERY
    SELECT
      0::numeric  AS revenue,
      0::numeric  AS margin,
      0::bigint   AS project_count;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."get_my_profile"() RETURNS TABLE("role" "text", "entity_id" "uuid", "division_id" "uuid")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
  SELECT role, entity_id, division_id 
  FROM public.user_profiles 
  WHERE user_id = auth.uid();
$$;


CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT role::text FROM user_profiles WHERE user_id = auth.uid() LIMIT 1;
$$;


CREATE OR REPLACE FUNCTION "public"."get_users_with_profiles"("p_query" "text" DEFAULT NULL::"text", "p_role" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "email" "text", "full_name" "text", "role" "text", "entity_id" "uuid", "division_id" "uuid", "title_id" "uuid", "status" "text")
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
    up.title_id,
    CASE WHEN up.is_active THEN 'active' ELSE 'inactive' END AS status
  FROM public.user_profiles up
  LEFT JOIN auth.users au ON au.id = up.user_id
  WHERE (p_query IS NULL OR up.full_name ILIKE '%' || p_query || '%' OR au.email ILIKE '%' || p_query || '%')
    AND (p_role IS NULL OR up.role::text = p_role)
  ORDER BY up.full_name;
$$;



CREATE OR REPLACE FUNCTION "public"."handle_new_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  v_full_name text;
  v_role public.role_enum;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  IF LOWER(NEW.email) IN ('admin@company.com') THEN
    v_role := 'admin';
  ELSE
    v_role := 'pending';
  END IF;

  INSERT INTO public.user_profiles (
    user_id,
    full_name,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    v_full_name,
    v_role,
    true
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;



CREATE OR REPLACE FUNCTION "public"."is_admin_or_head"() RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT (SELECT role FROM public.get_current_profile()) IN ('admin','head');
$$;



CREATE OR REPLACE FUNCTION "public"."log_audit_event"("p_action" "text", "p_table_name" "text", "p_record_id" "uuid", "p_changes" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  v_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.audit_logs(id, user_id, action, table_name, record_id, changes)
  VALUES (v_id, auth.uid(), p_action, p_table_name, p_record_id, COALESCE(p_changes, '{}'::jsonb));
  RETURN v_id;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."mark_all_notifications_read"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true
  WHERE user_id = auth.uid();
END;
$$;


CREATE OR REPLACE FUNCTION "public"."mark_notification_read"("p_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true
  WHERE id = p_id AND user_id = auth.uid();
END;
$$;


CREATE OR REPLACE FUNCTION "public"."preserve_non_admin_fields"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'auth', 'pg_catalog'
    AS $$
BEGIN
  -- Only run for updates, and only when the user is not an admin
  IF TG_OP = 'UPDATE'
     AND auth.uid() IS NOT NULL
     AND get_my_role() <> 'admin' THEN

    NEW.role        := OLD.role;
    NEW.entity_id   := OLD.entity_id;
    NEW.division_id := OLD.division_id;
    NEW.manager_id  := OLD.manager_id;
    NEW.title_id    := OLD.title_id;
    NEW.status      := OLD.status;
    NEW.is_active   := OLD.is_active;
  END IF;
  RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'auth'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."validate_user_profile_assignment"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Admin should have no entity/team
  IF NEW.role = 'admin' AND (NEW.entity_id IS NOT NULL OR NEW.division_id IS NOT NULL) THEN
    RAISE WARNING 'Admin role should not have entity_id or team (division_id) assigned. Auto-clearing.';
    NEW.entity_id := NULL;
    NEW.division_id := NULL;
    NEW.manager_id := NULL;
  END IF;
  
  -- Head should have entity but ideally no division_id (assigned via divisions.head_id)
  IF NEW.role = 'head' AND NEW.entity_id IS NULL THEN
    RAISE EXCEPTION 'Head role must have entity_id assigned';
  END IF;
  
  -- Manager should have entity and team
  IF NEW.role = 'manager' THEN
    IF NEW.entity_id IS NULL THEN
      RAISE EXCEPTION 'Manager role must have entity_id assigned';
    END IF;
    IF NEW.division_id IS NULL THEN
      RAISE EXCEPTION 'Manager role must have team (division_id) assigned';
    END IF;
  END IF;
  
  -- Sales/Account Manager should have entity, team, and manager
  IF NEW.role IN ('sales', 'account_manager') THEN
    IF NEW.entity_id IS NULL THEN
      RAISE EXCEPTION 'Sales role must have entity_id assigned';
    END IF;
    IF NEW.division_id IS NULL THEN
      RAISE EXCEPTION 'Sales role must have team (division_id) assigned';
    END IF;
    IF NEW.manager_id IS NULL THEN
      RAISE WARNING 'Sales role should have manager_id assigned';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_activities()
RETURNS TABLE (
  id uuid,
  activity_type text,
  customer_id uuid,
  customer_name text,
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
  RETURN QUERY
    SELECT
      sa.id,
      sa.activity_type,
      sa.customer_id,
      o.name          AS customer_name,
      sa.pic_id,
      oc.full_name    AS pic_name,
      sa.scheduled_at,
      sa.status,
      sa.notes,
      sa.created_by,
      sa.created_at
    FROM public.sales_activities sa
    LEFT JOIN public.organizations o
      ON sa.customer_id = o.id
    LEFT JOIN public.organization_contacts oc
      ON sa.pic_id = oc.id
    ORDER BY sa.scheduled_at DESC;
END;
$$;

---
-- Triggers
--

-- Trigger: after insert on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

CREATE OR REPLACE TRIGGER "activities_delete_trigger" INSTEAD OF DELETE ON "public"."activities" FOR EACH ROW EXECUTE FUNCTION "public"."activities_delete_trigger"();

CREATE OR REPLACE TRIGGER "activities_insert_trigger" INSTEAD OF INSERT ON "public"."activities" FOR EACH ROW EXECUTE FUNCTION "public"."activities_insert_trigger"();

CREATE OR REPLACE TRIGGER "activities_update_trigger" INSTEAD OF UPDATE ON "public"."activities" FOR EACH ROW EXECUTE FUNCTION "public"."activities_update_trigger"();

CREATE OR REPLACE TRIGGER "trigger_preserve_non_admin_fields" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."preserve_non_admin_fields"();

CREATE OR REPLACE TRIGGER "trigger_update_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();

CREATE OR REPLACE TRIGGER "trigger_validate_user_profile" BEFORE INSERT OR UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."validate_user_profile_assignment"();

CREATE OR REPLACE TRIGGER "update_organizations_updated_at" BEFORE UPDATE ON "public"."organizations" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();


--
-- Policies and RLS
--

CREATE POLICY "admin_all" ON "public"."user_profiles" USING (("public"."get_my_role"() = 'admin'::"text")) WITH CHECK (("public"."get_my_role"() = 'admin'::"text"));

ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_insert" ON "public"."audit_logs" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "audit_logs_select" ON "public"."audit_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = ANY (ARRAY['admin'::"public"."role_enum", 'head'::"public"."role_enum"]))))));

ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contacts_delete" ON "public"."contacts" FOR DELETE TO "authenticated" USING ("public"."can_manage_contact"("owner_id"));

CREATE POLICY "contacts_insert" ON "public"."contacts" FOR INSERT TO "authenticated" WITH CHECK (("owner_id" = "auth"."uid"()));

CREATE POLICY "contacts_select" ON "public"."contacts" FOR SELECT TO "authenticated" USING ((("owner_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM ("public"."get_my_profile"() "me"("role", "entity_id", "division_id")
     LEFT JOIN "public"."user_profiles" "owner_prof" ON (("owner_prof"."user_id" = "contacts"."owner_id")))
  WHERE (("me"."role" = 'admin'::"text") OR (("me"."role" = 'head'::"text") AND ("owner_prof"."entity_id" = "me"."entity_id")) OR (("me"."role" = ANY (ARRAY['manager'::"text", 'account_manager'::"text"])) AND ("owner_prof"."entity_id" = "me"."entity_id") AND ("owner_prof"."division_id" = "me"."division_id")))))));

CREATE POLICY "contacts_update" ON "public"."contacts" FOR UPDATE TO "authenticated" USING ("public"."can_manage_contact"("owner_id")) WITH CHECK ("public"."can_manage_contact"("owner_id"));

ALTER TABLE "public"."divisions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "divisions_delete" ON "public"."divisions" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = 'admin'::"public"."role_enum")))));

CREATE POLICY "divisions_insert" ON "public"."divisions" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = 'admin'::"public"."role_enum")))));

CREATE POLICY "divisions_select" ON "public"."divisions" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = 'admin'::"public"."role_enum")))) OR ("head_id" IN ( SELECT "user_profiles"."id"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."user_id" = "auth"."uid"()))) OR ("entity_id" IN ( SELECT "user_profiles"."entity_id"
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."role" = 'head'::"public"."role_enum")))) OR ("id" IN ( SELECT "user_profiles"."division_id"
   FROM "public"."user_profiles"
  WHERE ("user_profiles"."user_id" = "auth"."uid"())))));

CREATE POLICY "divisions_update" ON "public"."divisions" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = 'admin'::"public"."role_enum"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = 'admin'::"public"."role_enum")))));

ALTER TABLE "public"."entities" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "entities_delete" ON "public"."entities" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = 'admin'::"public"."role_enum")))));

CREATE POLICY "entities_insert" ON "public"."entities" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = 'admin'::"public"."role_enum")))));

CREATE POLICY "entities_select" ON "public"."entities" FOR SELECT TO "authenticated" USING (true);

CREATE POLICY "entities_update" ON "public"."entities" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = 'admin'::"public"."role_enum"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = 'admin'::"public"."role_enum")))));

CREATE POLICY "insert_own_profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."manager_team_members" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_insert" ON "public"."notifications" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

CREATE POLICY "notifications_select" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));

CREATE POLICY "notifications_update" ON "public"."notifications" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));


ALTER TABLE "public"."organization_contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "organizations_delete" ON "public"."organizations" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = ANY (ARRAY['admin'::"public"."role_enum", 'head'::"public"."role_enum"]))))));



CREATE POLICY "organizations_insert" ON "public"."organizations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "organizations_select" ON "public"."organizations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "organizations_update" ON "public"."organizations" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);


CREATE POLICY "read_own_profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."regions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sales_activities" ENABLE ROW LEVEL SECURITY;

CREATE POLICY sales_activities_select
  ON public.sales_activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
        AND up.role = ANY(
          ARRAY['admin','head','manager','account_manager','staff']::public.role_enum[]
        )
    )
  );

CREATE POLICY sales_activities_insert
  ON public.sales_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY ssales_activities_update
  ON public.sales_activities
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles up_user
      LEFT JOIN public.user_profiles up_creator 
        ON up_creator.user_id = sales_activities.created_by
      WHERE up_user.user_id = auth.uid()
      AND (
        up_user.role IN ('admin', 'head')
        OR (
          up_user.role IN ('manager', 'account_manager', 'staff')
          AND (up_user.entity_id = up_creator.entity_id OR up_creator.entity_id IS NULL)
        )
        OR sales_activities.created_by = auth.uid()
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.user_profiles up_user
      LEFT JOIN public.user_profiles up_creator 
        ON up_creator.user_id = sales_activities.created_by
      WHERE up_user.user_id = auth.uid()
      AND (
        up_user.role IN ('admin', 'head')
        OR (
          up_user.role IN ('manager', 'account_manager', 'staff')
          AND (up_user.entity_id = up_creator.entity_id OR up_creator.entity_id IS NULL)
        )
        OR sales_activities.created_by = auth.uid()
      )
    )
  );

CREATE POLICY sales_activities_delete
  ON public.sales_activities
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles up_user
      LEFT JOIN public.user_profiles up_creator 
        ON up_creator.user_id = sales_activities.created_by
      WHERE up_user.user_id = auth.uid()
      AND (
        -- Admin & Head: Can delete anything
        up_user.role IN ('admin', 'head')
        OR (
          up_user.role IN ('manager', 'account_manager', 'staff')
          AND (up_user.entity_id = up_creator.entity_id OR up_creator.entity_id IS NULL)
        )
        OR sales_activities.created_by = auth.uid()
      )
    )
  );


CREATE POLICY "select_own_profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "system_settings_select" ON "public"."system_settings" FOR SELECT TO "authenticated" USING (true);

ALTER TABLE "public"."titles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "update_own_safe_fields" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));

ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select" ON "public"."user_profiles" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."get_my_profile"() "me"("role", "entity_id", "division_id")
  WHERE (("me"."role" = 'admin'::"text") OR (("me"."role" = 'head'::"text") AND ("me"."entity_id" = "user_profiles"."entity_id")) OR (("me"."role" = ANY (ARRAY['manager'::"text", 'account_manager'::"text"])) AND ("me"."entity_id" = "user_profiles"."entity_id") AND ("me"."division_id" = "user_profiles"."division_id")))))));

CREATE POLICY "user_profiles_update" ON "public"."user_profiles" FOR UPDATE TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."get_my_profile"() "me"("role", "entity_id", "division_id")
  WHERE (("me"."role" = 'admin'::"text") OR (("me"."role" = 'head'::"text") AND ("me"."entity_id" = "user_profiles"."entity_id"))))))) WITH CHECK ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."get_my_profile"() "me"("role", "entity_id", "division_id")
  WHERE (("me"."role" = 'admin'::"text") OR (("me"."role" = 'head'::"text") AND ("me"."entity_id" = "user_profiles"."entity_id")))))));

--
--Grants and other
--

GRANT EXECUTE ON FUNCTION "public"."_get_effective_user_profile"("p_user_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."activities_delete_trigger"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."activities_insert_trigger"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."activities_update_trigger"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_create_entity"("p_name" "text", "p_code" "text") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_delete_contact"("p_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_delete_entity"("p_entity_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_delete_user"("p_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_update_contact"("p_id" "uuid", "p_name" "text", "p_email" "text", "p_phone" "text", "p_company" "text", "p_notes" "text") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_update_entity"("p_entity_id" "uuid", "p_name" "text", "p_code" "text", "p_is_active" boolean) TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_update_profile"("p_id" "uuid", "p_role" "public"."role_enum", "p_division" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."admin_update_user_profile"("p_profile_id" "uuid", "p_role" "public"."role_enum", "p_entity_id" "uuid", "p_division_id" "uuid", "p_manager_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."can_manage_contact"("target_owner_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."ensure_admin_profile"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_current_profile"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_head_manager_archived"("p_period" "text", "p_start_date" "date", "p_end_date" "date") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_manager_archived"("p_manager_id" "uuid", "p_period" "text", "p_start_date" "date", "p_end_date" "date") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_my_profile"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_my_role"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."get_users_with_profiles"("p_query" "text", "p_role" "text") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."handle_new_auth_user"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."is_admin_or_head"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."log_audit_event"("p_action" "text", "p_table_name" "text", "p_record_id" "uuid", "p_changes" "jsonb") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."mark_all_notifications_read"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."mark_notification_read"("p_id" "uuid") TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."preserve_non_admin_fields"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";

GRANT EXECUTE ON FUNCTION "public"."validate_user_profile_assignment"() TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."sales_activities" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."activities" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."audit_logs" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."contacts" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."divisions" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."entities" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."manager_team_members" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."notifications" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."organization_contacts" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."organizations" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."regions" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."sales_activity" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."sales_activity_v2" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."system_settings" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."titles" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."user_profiles" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."v_audit_log_complete" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."v_master_customer" TO "authenticated";

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "public"."v_master_end_user" TO "authenticated";

SET row_security = on;

COMMIT;