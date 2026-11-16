import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/study/workspace';
import { formulaCatalogueOptions } from '@/lib/study/catalogue.functions';
import { SCHOOL_GRADES, type SchoolGrade } from '@/lib/study/catalogue';
const titles:Record<string,string>={home:'Study Dashboard',chat:'Physics Chat',solver:'Photo Physics Solver',formulas:'Formula Vault',quiz:'Quiz Challenge',focus:'Focus Sessions',rewards:'Stars & Scientist Badges'};
export const Route=createFileRoute('/study/$tool')({
 validateSearch: (search: Record<string, unknown>): { grade?: SchoolGrade | 'all' | undefined; q?: string; chapter?: string; verified?: boolean } => ({
  grade: search['grade'] === 'all' || SCHOOL_GRADES.includes(search['grade'] as SchoolGrade) ? search['grade'] as SchoolGrade | 'all' : undefined,
  q: typeof search['q'] === 'string' ? search['q'] : '',
  chapter: typeof search['chapter'] === 'string' ? search['chapter'] : '',
  verified: search['verified'] === true || search['verified'] === 'true',
 }),
 loader: async ({ context, params }) => { if (params.tool === 'formulas') await context.queryClient.ensureQueryData(formulaCatalogueOptions); },
 errorComponent: ({ error }) => <main dir="rtl" className="min-h-dvh bg-background p-8 text-foreground"><h1 className="text-xl">تعذّر فتح المساحة الدراسية</h1><p role="alert">{error instanceof Error ? error.message : 'حاول مرة أخرى'}</p></main>,
 notFoundComponent: () => <main dir="rtl" className="min-h-dvh bg-background p-8 text-foreground">هذه الصفحة غير موجودة</main>,
 head:({params})=>{const title=`Zophysics — ${titles[params.tool]||'Study Space'}`;const description=params.tool === 'formulas' ? 'Free Iraqi physics formula catalogue across six school grades, with chapter filters, variable definitions and textbook source verification.' : 'Your free Iraqi physics study space: lessons, photo solutions, quizzes, focus sessions and scientist badges.';return {meta:[{title},{name:'description',content:description},{property:'og:title',content:title},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};},component:StudyPage});
function StudyPage(){const {tool}=Route.useParams();return <Workspace tool={tool}/>;}
