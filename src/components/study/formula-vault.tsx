import { useNavigate, useSearch } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { BookOpen, Search, ShieldCheck, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LEVELS, type LevelId } from '@/lib/ai/levels';
import { SCHOOL_GRADES, hasVerifiedCitation, isCompleteCatalogue, type SchoolGrade } from '@/lib/study/catalogue';
import { formulaCatalogueOptions } from '@/lib/study/catalogue.functions';

export function FormulaVault({ level }: { level: LevelId }) {
  const { data } = useSuspenseQuery(formulaCatalogueOptions);
  const search = useSearch({ from: '/study/$tool' });
  const navigate = useNavigate();
  const grade = search.grade ?? (level === 'uni' ? 'all' : level);
  const chapter = search.chapter;
  const update = (changes: { grade?: SchoolGrade | 'all'; chapter?: string; q?: string; verified?: boolean }) => navigate({ to: '/study/$tool', params: { tool: 'formulas' }, search: prev => ({ ...prev, ...changes }) });
  const selected = data.formulas.filter(f => grade === 'all' || f.grade === grade);
  const chapters = [...new Set(selected.map(f => f.chapter_title))];
  const query = search.q.trim().toLowerCase();
  const filtered = selected.filter(f => (!chapter || f.chapter_title === chapter) && (!search.verified || hasVerifiedCitation(f)) && `${f.name} ${f.equation} ${f.variables} ${f.chapter_title}`.toLowerCase().includes(query));
  const complete = isCompleteCatalogue(data);
  const verifiedCount = data.formulas.filter(hasVerifiedCitation).length;
  return <>
    <div className="mb-6 flex items-center gap-4"><BookOpen className="h-8 w-8 shrink-0 text-primary"/><div><h1 className="text-2xl font-bold">بنك القوانين السريع</h1><p className="mt-1 text-sm text-muted-foreground">الصفوف العراقية الستة · طبعة 2026 المطلوبة</p></div></div>
    <div className="mb-6 flex flex-wrap gap-6 border-y border-border py-5"><p><span className="text-2xl font-bold text-primary">6</span> <span className="text-sm text-muted-foreground">صفوف</span></p><p><span className="text-2xl font-bold">{data.formulas.length}</span> <span className="text-sm text-muted-foreground">إدخالات مرجعية</span></p><p><span className="text-2xl font-bold text-primary">{verifiedCount}</span> <span className="text-sm text-muted-foreground">موثّقة من الكتاب</span></p></div>
    <p role="status" className="mb-6 flex items-start gap-3 border-s-2 border-primary bg-secondary p-4 text-sm leading-7"><FileQuestion className="mt-1 h-5 w-5 shrink-0 text-primary"/>{complete ? 'اكتملت مراجعة الصفحات في كتب الصفوف الستة.' : 'البنك غير مكتمل: القوانين الحالية مرجع عام، وتوزيعها على الصفوف والفصول لم يُطابق كتب 2026 بعد. لا توجد أرقام صفحات موثّقة؛ يلزم توفير الكتب الستة ومراجعتها صفحةً صفحة.'}</p>
    <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3"><Button variant={grade === 'all' ? 'default' : 'outline'} onClick={() => update({ grade: 'all', chapter: '' })} className="col-span-2 h-10 sm:col-span-3">جميع الصفوف الستة</Button>{SCHOOL_GRADES.map(g => <Button key={g} variant={grade === g ? 'default' : 'outline'} className="h-auto min-h-10 whitespace-normal" onClick={() => update({ grade: g, chapter: '' })}>{LEVELS[g].ar}</Button>)}</div>
    <div className="flex flex-wrap gap-3"><label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-card px-3"><Search className="h-4 w-4 shrink-0 text-muted-foreground"/><input aria-label="Search formulas" placeholder="اسم القانون، الرمز، أو المتغير…" value={search.q} onChange={e => update({ q: e.target.value })} className="h-11 w-full min-w-0 bg-transparent outline-none"/></label><Select value={chapter || 'all'} onValueChange={value => update({ chapter: value === 'all' ? '' : value })}><SelectTrigger aria-label="Chapter" className="h-11 w-full sm:w-56"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">جميع الموضوعات / الفصول</SelectItem>{chapters.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select><Button variant={search.verified ? 'default' : 'outline'} className="h-11" onClick={() => update({ verified: !search.verified })}><ShieldCheck/>الموثّقة فقط</Button></div>
    <p className="my-4 text-xs text-muted-foreground">{filtered.length} نتيجة · {search.verified ? 'قوانين موثّقة' : 'تشمل إدخالات غير موثّقة'}</p>
    {SCHOOL_GRADES.filter(g => grade === 'all' || grade === g).map(g => {
      const rows = filtered.filter(f => f.grade === g);
      const book = data.books.find(b => b.grade === g);
      return <section key={g} className="mb-8"><div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3"><h2 className="text-xl font-bold">{LEVELS[g].ar}</h2><span className="text-xs text-muted-foreground">{book?.verification_status === 'complete' ? 'كتاب مُراجع' : 'بانتظار مراجعة كتاب 2026'}</span></div>{[...new Set(rows.map(f => f.chapter_title))].map(c => <div key={c} className="mb-6"><h3 className="mb-3 text-sm font-bold text-primary">{c}</h3><div className="grid gap-4 sm:grid-cols-2">{rows.filter(f => f.chapter_title === c).map(f => <article key={f.id} className="min-w-0 rounded-lg border border-border bg-card p-5"><p className="text-xs text-muted-foreground">{hasVerifiedCitation(f) ? `الفصل ${f.chapter_number} · الصفحة ${f.page_number}` : 'موضوع مرجعي · الفصل والصفحة غير موثّقين'}</p><h4 className="mt-2 text-lg font-bold">{f.name}</h4><p dir="ltr" className="my-5 overflow-x-auto text-center font-display text-2xl text-primary">{f.equation}</p><p className="text-sm leading-7 text-muted-foreground">{f.variables}</p>{f.context && <p className="mt-3 text-sm leading-7">{f.context}</p>}{hasVerifiedCitation(f) && f.source_url && <Button asChild variant="link" className="mt-3 px-0"><a href={f.source_url} target="_blank" rel="noreferrer">صفحة المصدر</a></Button>}</article>)}</div></div>)}{!rows.length && <p className="py-6 text-sm text-muted-foreground">لا توجد قوانين مطابقة للفلاتر الحالية.</p>}</section>;
    })}
  </>;
}