import type { Database } from '@/integrations/supabase/types';
export const SCHOOL_GRADES = ['int1', 'int2', 'int3', 'prep4', 'prep5', 'prep6'] as const;
export type SchoolGrade = typeof SCHOOL_GRADES[number];
export type Textbook = Database['public']['Tables']['physics_textbooks']['Row'];
export type CatalogueFormula = Database['public']['Tables']['physics_formulas']['Row'];
export type Catalogue = { books: Textbook[]; formulas: CatalogueFormula[] };
export function hasVerifiedCitation(f: CatalogueFormula) {
  return f.verification_status === 'verified' && Boolean(f.source_url && f.context && f.chapter_number && f.page_number);
}
export function isCompleteCatalogue(data: Catalogue) {
  return SCHOOL_GRADES.every(grade => {
    const book = data.books.find(b => b.grade === grade);
    return Boolean(book && book.edition_year === 2026 && book.verification_status === 'complete' && book.source_url && book.total_pages && book.reviewed_pages === book.total_pages);
  }) && data.formulas.length > 0 && data.formulas.every(hasVerifiedCitation);
}