import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { queryOptions } from '@tanstack/react-query';
import type { Database } from '@/integrations/supabase/types';
import type { Catalogue } from './catalogue';

export const getFormulaCatalogue = createServerFn({ method: 'GET' }).handler(async (): Promise<Catalogue> => {
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('تعذّر الاتصال ببنك القوانين');
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith('sb_') && headers.get('Authorization') === `Bearer ${key}`) headers.delete('Authorization');
      headers.set('apikey', key);
      return fetch(input, { ...init, headers });
    } },
  });
  const [books, formulas] = await Promise.all([
    client.from('physics_textbooks').select('*'),
    client.from('physics_formulas').select('*').order('sort_order').range(0, 9999),
  ]);
  if (books.error || formulas.error) throw new Error('تعذّر تحميل بنك القوانين، حاول مرة أخرى');
  return { books: books.data ?? [], formulas: formulas.data ?? [] };
});
export const formulaCatalogueOptions = queryOptions({ queryKey: ['formula-catalogue'], queryFn: () => getFormulaCatalogue(), staleTime: 60_000 });