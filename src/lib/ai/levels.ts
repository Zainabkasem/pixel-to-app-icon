export type LevelId = "int1" | "int2" | "int3" | "prep4" | "prep5" | "prep6" | "uni";
export const LEVELS: Record<LevelId, { ar: string; en: string; stage: "middle" | "high" | "college" }> = {
  int1: { ar: "الأول متوسط", en: "1st Intermediate", stage: "middle" },
  int2: { ar: "الثاني متوسط", en: "2nd Intermediate", stage: "middle" },
  int3: { ar: "الثالث متوسط", en: "3rd Intermediate", stage: "middle" },
  prep4: { ar: "الرابع العلمي", en: "4th Preparatory", stage: "high" },
  prep5: { ar: "الخامس العلمي", en: "5th Preparatory", stage: "high" },
  prep6: { ar: "السادس العلمي", en: "6th Preparatory", stage: "high" },
  uni: { ar: "المرحلة الجامعية", en: "University / General Physics", stage: "college" },
};
export function isLevel(v: unknown): v is LevelId {
  return typeof v === "string" && v in LEVELS;
}
