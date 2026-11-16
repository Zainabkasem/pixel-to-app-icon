import { describe, expect, it } from 'vitest';
import { SCHOOL_GRADES, hasVerifiedCitation, isCompleteCatalogue, type CatalogueFormula, type Textbook } from '@/lib/study/catalogue';
const formula: CatalogueFormula = { id: 'test', grade: 'prep6', name: 'سعة المتسعة', equation: 'C = Q / V', variables: 'C السعة · Q الشحنة · V فرق الجهد', chapter_title: 'المتسعات', chapter_number: 1, page_number: 12, context: 'تعريف السعة', source_url: 'https://example.org/book.pdf', verification_status: 'verified', sort_order: 1 };
const books: Textbook[] = SCHOOL_GRADES.map(grade => ({ grade, title: grade, edition_year: 2026, source_url: 'https://example.org/book.pdf', verification_status: 'complete', total_pages: 100, reviewed_pages: 100 }));
describe('Six-grade textbook evidence', () => {
 it('requires all three intermediate and three scientific preparatory grades', () => {
  expect(SCHOOL_GRADES).toEqual(['int1','int2','int3','prep4','prep5','prep6']);
  expect(isCompleteCatalogue({ books: books.slice(1), formulas: [formula] })).toBe(false);
  expect(isCompleteCatalogue({ books, formulas: [formula] })).toBe(true);
 });
 it('requires every page of the 2026 edition to be reviewed', () => {
  expect(isCompleteCatalogue({ books: books.map((b, i) => i === 0 ? { ...b, reviewed_pages: 99 } : b), formulas: [formula] })).toBe(false);
  expect(isCompleteCatalogue({ books: books.map(b => ({ ...b, edition_year: 2025 })), formulas: [formula] })).toBe(false);
 });
 it('does not treat missing page, chapter or source as a verified formula', () => {
  expect(hasVerifiedCitation(formula)).toBe(true);
  expect(hasVerifiedCitation({ ...formula, page_number: null })).toBe(false);
  expect(hasVerifiedCitation({ ...formula, chapter_number: null })).toBe(false);
  expect(hasVerifiedCitation({ ...formula, source_url: null })).toBe(false);
  expect(isCompleteCatalogue({ books, formulas: [{ ...formula, verification_status: 'unverified' }] })).toBe(false);
 });
});