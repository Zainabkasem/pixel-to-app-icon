CREATE TABLE public.physics_textbooks (
 grade text PRIMARY KEY CHECK (grade IN ('int1','int2','int3','prep4','prep5','prep6')),
 edition_year integer NOT NULL DEFAULT 2026 CHECK (edition_year = 2026),
 title text NOT NULL,
 source_url text,
 verification_status text NOT NULL DEFAULT 'awaiting_source' CHECK (verification_status IN ('awaiting_source','reviewing','complete')),
 total_pages integer CHECK (total_pages > 0),
 reviewed_pages integer NOT NULL DEFAULT 0 CHECK (reviewed_pages >= 0),
 CHECK (verification_status <> 'complete' OR (source_url IS NOT NULL AND total_pages IS NOT NULL AND reviewed_pages = total_pages))
);
GRANT SELECT ON public.physics_textbooks TO anon, authenticated;
GRANT ALL ON public.physics_textbooks TO service_role;
ALTER TABLE public.physics_textbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Free textbook catalogue" ON public.physics_textbooks FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.physics_formulas (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 grade text NOT NULL REFERENCES public.physics_textbooks(grade),
 name text NOT NULL,
 equation text NOT NULL,
 variables text NOT NULL,
 chapter_title text NOT NULL,
 chapter_number integer CHECK (chapter_number > 0),
 page_number integer CHECK (page_number > 0),
 context text,
 source_url text,
 verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified','verified')),
 sort_order integer NOT NULL DEFAULT 0,
 UNIQUE (grade, name, equation),
 CHECK (verification_status <> 'verified' OR (page_number IS NOT NULL AND chapter_number IS NOT NULL AND source_url IS NOT NULL AND context IS NOT NULL))
);
GRANT SELECT ON public.physics_formulas TO anon, authenticated;
GRANT ALL ON public.physics_formulas TO service_role;
ALTER TABLE public.physics_formulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Free formula catalogue" ON public.physics_formulas FOR SELECT TO anon, authenticated USING (true);
CREATE INDEX physics_formulas_grade_chapter_idx ON public.physics_formulas(grade, chapter_number, sort_order);