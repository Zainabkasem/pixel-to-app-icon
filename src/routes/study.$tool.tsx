import { createFileRoute } from '@tanstack/react-router';
import { Workspace } from '@/components/study/workspace';
const titles:Record<string,string>={home:'Study Dashboard',chat:'Physics Chat',solver:'Photo Physics Solver',formulas:'Formula Vault',quiz:'Quiz Challenge',focus:'Focus Sessions',rewards:'Stars & Scientist Badges'};
export const Route=createFileRoute('/study/$tool')({head:({params})=>{const title=`Zophysics — ${titles[params.tool]||'Study Space'}`;const description='Your free Iraqi physics study space: lessons, photo solutions, quizzes, focus sessions and scientist badges.';return {meta:[{title},{name:'description',content:description},{property:'og:title',content:title},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]};},component:StudyPage});
function StudyPage(){const {tool}=Route.useParams();return <Workspace tool={tool}/>;}
