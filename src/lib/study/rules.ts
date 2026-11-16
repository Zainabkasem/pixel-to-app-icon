export const HOUR_REWARDS = [5, 12, 20, 28, 36, 45] as const;
export const SCIENTISTS = ['ابن الهيثم', 'البيروني', 'غاليليو', 'كبلر', 'نيوتن', 'هويغنس', 'برنولي', 'كولوم', 'أمبير', 'فاراداي', 'جول', 'ماكسويل', 'بولتزمان', 'بلانك', 'ماري كوري', 'رذرفورد', 'بور', 'شرودنغر', 'فاينمان', 'أينشتاين'];
export const BADGES = [{ id: 'orbit', name: 'رائد المدارات', price: 25, symbol: '◎' }, { id: 'light', name: 'باحث الضوء', price: 50, symbol: '✧' }, { id: 'quantum', name: 'عبقري الكم', price: 100, symbol: '⚛' }];
export function focusReward(hours: number) { return Number.isInteger(hours) && hours >= 1 && hours <= 6 ? HOUR_REWARDS[hours - 1] : 0; }
export function scientistRank(days: number) { const tier = Math.min(20, Math.max(0, Math.floor(days / 14))); return { tier, name: tier ? SCIENTISTS[tier - 1] : 'مبتدئ', progress: tier === 20 ? 14 : days % 14 }; }
export function inactivityPenalty(stars: number, streak: number, last: number, now: number) { return now - last >= 72 * 3600000 ? { stars: 0, streak: 0 } : { stars, streak }; }
export function quizReward(correct: number, oath: boolean) { return oath ? Math.min(10, Math.max(0, correct * 2)) : 0; }
export function canBuyBadge(stars: number, price: number, owned: boolean) { return !owned && stars >= price; }
