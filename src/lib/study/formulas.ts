import type { LevelId } from '@/lib/ai/levels';
export type Formula = { chapter: string; name: string; equation: string; symbols: string; levels: LevelId[] };
const all: LevelId[] = ['int1','int2','int3','prep4','prep5','prep6','uni'];
export const FORMULAS: Formula[] = [
 {chapter:'القياس والحركة',name:'السرعة',equation:'v = d / t',symbols:'v السرعة (m/s) · d المسافة (m) · t الزمن (s)',levels:all},
 {chapter:'المادة وخواصها',name:'الكثافة',equation:'ρ = m / V',symbols:'ρ الكثافة (kg/m³) · m الكتلة (kg) · V الحجم (m³)',levels:all},
 {chapter:'القوى',name:'قانون نيوتن الثاني',equation:'F = ma',symbols:'F القوة (N) · m الكتلة (kg) · a التعجيل (m/s²)',levels:['int2','prep4','prep5','uni']},
 {chapter:'القوى',name:'الوزن',equation:'W = mg',symbols:'W الوزن (N) · g تعجيل الجاذبية (m/s²)',levels:all},
 {chapter:'الضغط',name:'الضغط',equation:'P = F / A',symbols:'P الضغط (Pa) · A المساحة (m²)',levels:['int1','int2','prep4','uni']},
 {chapter:'الشغل والطاقة',name:'الشغل',equation:'W = Fd cos θ',symbols:'W الشغل (J) · θ الزاوية بين القوة والإزاحة',levels:['int2','prep4','prep5','uni']},
 {chapter:'الشغل والطاقة',name:'الطاقة الحركية',equation:'K = ½mv²',symbols:'K الطاقة الحركية (J) · v السرعة (m/s)',levels:['int2','prep4','prep5','uni']},
 {chapter:'الشغل والطاقة',name:'القدرة',equation:'P = W / t',symbols:'P القدرة (W) · W الشغل (J)',levels:['int2','int3','prep4','prep5','uni']},
 {chapter:'الكهربائية',name:'قانون أوم',equation:'V = IR',symbols:'V فرق الجهد (V) · I التيار (A) · R المقاومة (Ω)',levels:['int3','prep5','prep6','uni']},
 {chapter:'الكهربائية',name:'القدرة الكهربائية',equation:'P = VI',symbols:'P القدرة (W) · V فرق الجهد (V) · I التيار (A)',levels:['int3','prep5','prep6','uni']},
 {chapter:'الكهربائية',name:'قانون كولوم',equation:'F = k|q₁q₂| / r²',symbols:'q الشحنة (C) · r المسافة (m) · k ثابت كولوم',levels:['int3','prep5','uni']},
 {chapter:'المتسعات',name:'سعة المتسعة',equation:'C = Q / V',symbols:'C السعة (F) · Q الشحنة (C)',levels:['prep6','uni']},
 {chapter:'الحث الكهرومغناطيسي',name:'قانون فاراداي',equation:'ε = −N ΔΦ / Δt',symbols:'ε القوة الدافعة (V) · N عدد اللفات · Φ الفيض (Wb)',levels:['prep6','uni']},
 {chapter:'الموجات والبصريات',name:'سرعة الموجة',equation:'v = fλ',symbols:'f التردد (Hz) · λ الطول الموجي (m)',levels:['int2','int3','prep5','prep6','uni']},
 {chapter:'الحرارة',name:'كمية الحرارة',equation:'Q = mcΔT',symbols:'Q الحرارة (J) · c الحرارة النوعية (J/kg·K)',levels:['int2','prep4','prep5','uni']},
 {chapter:'الفيزياء الحديثة',name:'طاقة الفوتون',equation:'E = hf',symbols:'h ثابت بلانك (J·s) · f التردد (Hz)',levels:['prep6','uni']},
 {chapter:'الفيزياء الحديثة',name:'تكافؤ الكتلة والطاقة',equation:'E = mc²',symbols:'c سرعة الضوء (m/s)',levels:['prep6','uni']},
];
