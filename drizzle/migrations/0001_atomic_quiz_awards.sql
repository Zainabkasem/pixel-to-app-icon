CREATE OR REPLACE FUNCTION public.finish_physics_quiz(p_user uuid,p_id uuid,p_result jsonb,p_reward integer) RETURNS public.study_progress LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE q public.physics_quizzes; p public.study_progress;
BEGIN
 SELECT * INTO q FROM public.physics_quizzes WHERE id=p_id AND user_id=p_user FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Quiz not found'; END IF;
 IF q.submitted_at IS NULL THEN
  UPDATE public.physics_quizzes SET submitted_at=now(),result=p_result WHERE id=p_id;
  p:=public.apply_study_action(p_user,'quiz',1,'',p_reward);
 ELSE p:=public.apply_study_action(p_user,'read'); END IF;
 RETURN p;
END $$;
REVOKE ALL ON FUNCTION public.finish_physics_quiz(uuid,uuid,jsonb,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.finish_physics_quiz(uuid,uuid,jsonb,integer) TO service_role;