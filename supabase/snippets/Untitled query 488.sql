   SELECT tgname
   FROM   pg_trigger
   WHERE  tgrelid = 'public.user_profiles'::regclass
     AND  tgname = 'trigger_update_updated_at';