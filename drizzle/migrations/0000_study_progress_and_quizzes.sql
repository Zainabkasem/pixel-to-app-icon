CREATE TABLE public.study_progress (user_id uuid PRIMARY KEY, stars integer NOT NULL DEFAULT 0, streak integer NOT NULL DEFAULT 0, last_commit_at timestamptz, last_study_day date, badges text[] NOT NULL DEFAULT '{}', focus_started_at timestamptz, focus_hours integer, updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.study_progress TO authenticated;
GRANT ALL ON public.study_progress TO service_role;
ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own study progress" ON public.study_progress FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.physics_quizzes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, level text NOT NULL, questions jsonb NOT NULL, answers jsonb NOT NULL, submitted_at timestamptz, result jsonb, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.physics_quizzes TO service_role;
ALTER TABLE public.physics_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Upload own physics pages" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'physics-pages' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Read own physics pages" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'physics-pages' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Delete own physics pages" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'physics-pages' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE OR REPLACE FUNCTION public.apply_study_action(p_user uuid, p_action text, p_hours integer DEFAULT 1, p_badge text DEFAULT '', p_reward integer DEFAULT 0) RETURNS public.study_progress LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE p public.study_progress; today date := (now() AT TIME ZONE 'Asia/Baghdad')::date; price integer;
BEGIN
 INSERT INTO public.study_progress(user_id) VALUES (p_user) ON CONFLICT DO NOTHING;
 SELECT * INTO p FROM public.study_progress WHERE user_id=p_user FOR UPDATE;
 IF p.last_commit_at IS NOT NULL AND now() - p.last_commit_at >= interval '72 hours' THEN p.stars:=0; p.streak:=0; p.last_study_day:=NULL; END IF;
 IF p_action='start' THEN
  IF p_hours < 1 OR p_hours > 6 THEN RAISE EXCEPTION 'Choose one to six hours'; END IF;
  IF p.focus_started_at IS NOT NULL THEN RAISE EXCEPTION 'A focus session is already active'; END IF;
  p.focus_started_at:=now(); p.focus_hours:=p_hours; p.last_commit_at:=now();
 ELSIF p_action='cancel' THEN p.focus_started_at:=NULL; p.focus_hours:=NULL;
 ELSIF p_action='finish' THEN
  IF p.focus_started_at IS NULL OR now()-p.focus_started_at < make_interval(hours=>p.focus_hours) THEN RAISE EXCEPTION 'Complete the full session first'; END IF;
  p.stars:=p.stars+(ARRAY[5,12,20,28,36,45])[p.focus_hours];
  IF p.last_study_day IS DISTINCT FROM today THEN p.streak:=CASE WHEN p.last_study_day=today-1 THEN p.streak+1 ELSE 1 END; END IF;
  p.last_study_day:=today; p.last_commit_at:=now(); p.focus_started_at:=NULL; p.focus_hours:=NULL;
 ELSIF p_action='quiz' THEN p.stars:=p.stars+greatest(0,least(10,p_reward));
 ELSIF p_action='buy' THEN
  price:=CASE p_badge WHEN 'orbit' THEN 25 WHEN 'light' THEN 50 WHEN 'quantum' THEN 100 ELSE NULL END;
  IF price IS NULL OR p_badge=ANY(p.badges) OR p.stars<price THEN RAISE EXCEPTION 'Badge unavailable or insufficient stars'; END IF;
  p.stars:=p.stars-price; p.badges:=array_append(p.badges,p_badge);
 END IF;
 UPDATE public.study_progress SET stars=p.stars,streak=p.streak,last_commit_at=p.last_commit_at,last_study_day=p.last_study_day,badges=p.badges,focus_started_at=p.focus_started_at,focus_hours=p.focus_hours,updated_at=now() WHERE user_id=p_user RETURNING * INTO p;
 RETURN p;
END $$;
REVOKE ALL ON FUNCTION public.apply_study_action(uuid,text,integer,text,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_study_action(uuid,text,integer,text,integer) TO service_role;