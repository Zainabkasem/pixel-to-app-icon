import { describe, it, expect } from 'vitest';
import { focusReward, scientistRank, inactivityPenalty, quizReward, canBuyBadge, SCIENTISTS } from '@/lib/study/rules';
describe('Study commitments', () => {
 it('awards five stars for one hour', () => expect(focusReward(1)).toBe(5));
 it('caps a six-hour session at 45 stars and rejects longer sessions', () => { expect(focusReward(6)).toBe(45); expect(focusReward(7)).toBe(0); });
 it('requires fourteen consecutive days per scientist without skipping', () => { expect(scientistRank(13).tier).toBe(0); expect(scientistRank(14).tier).toBe(1); expect(scientistRank(28).tier).toBe(2); });
 it('has twenty ranks with the ultimate at 280 days', () => { expect(SCIENTISTS).toHaveLength(20); expect(scientistRank(280).tier).toBe(20); });
 it('wipes stars and streak exactly at three full days', () => { expect(inactivityPenalty(45,14,0,72*3600000)).toEqual({stars:0,streak:0}); expect(inactivityPenalty(45,14,0,72*3600000-1)).toEqual({stars:45,streak:14}); });
 it('awards no quiz stars without the exam oath', () => { expect(quizReward(5,false)).toBe(0); expect(quizReward(5,true)).toBe(10); });
 it('requires sufficient stars and prevents duplicate badge purchases', () => { expect(canBuyBadge(24,25,false)).toBe(false); expect(canBuyBadge(25,25,false)).toBe(true); expect(canBuyBadge(50,25,true)).toBe(false); });
});
