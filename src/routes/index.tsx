import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from '@tanstack/react-router';
import logo from '@/assets/zophysics_logo.png.asset.json';
import { LEVELS, isLevel, type LevelId } from '@/lib/ai/levels';
import { Button } from '@/components/ui/button';
import { PENDING_OATH_KEY, resolveOath } from '@/lib/ai/lesson-session';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zophysics — Your AI Physics Study Buddy" },
      { name: "description", content: "Learn physics with Zophysics: an AI tutor aligned with Iraqi textbooks from 1st Intermediate to university." },
      { property: "og:title", content: "Zophysics — Your AI Physics Study Buddy" },
      { property: "og:description", content: "AI physics tutor aligned with Iraqi textbooks, from middle school to university." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Screen = "splash" | "level" | "chat";
const LEVEL_KEY = "zophysics-level";

function App() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState<Screen>("splash");
  const [level, setLevel] = useState<LevelId | null>(null);

  useEffect(() => {
    if (localStorage.getItem(PENDING_OATH_KEY)) resolveOath(localStorage, false);
    const saved = localStorage.getItem(LEVEL_KEY);
    if (isLevel(saved)) setLevel(saved);
  }, []);

  const pick = (id: LevelId) => {
    localStorage.setItem(LEVEL_KEY, id);
    setLevel(id);
    navigate({to:"/study/$tool",params:{tool:"home"}});
  };

  return (
    <main className="min-h-dvh bg-background bg-cosmos text-foreground">
      {screen === "splash" && <Splash onStart={() => level ? navigate({to:"/study/$tool",params:{tool:"home"}}) : setScreen("level")} />}
      {screen === "level" && <LevelPicker current={level} onPick={pick} />}
    </main>
  );
}

function Splash({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      <img src={logo.url} alt="Zophysics logo" className="w-72 rounded-full animate-float drop-shadow-[0_0_30px_oklch(0.62_0.1_300/0.35)] sm:w-80" />
      <div className="mt-4 space-y-3 animate-rise">
        <p dir="rtl" className="text-xl font-bold leading-relaxed text-primary">
          أهلاً بك في زوفيزكس! رفيقك الذكي لدراسة الفيزياء خطوة بخطوة 🌟
        </p>
        <p className="font-display text-lg text-muted-foreground">
          Welcome to Zophysics — your smart physics study companion.
        </p>
      </div>
      <p className="mt-6 rounded-full border border-primary/40 bg-secondary px-4 py-1.5 text-sm text-primary animate-rise">
        <span dir="rtl">مجاني 100% لطلاب العراق</span> · 100% Free
      </p>
      <Button
        onClick={onStart}
        className="mt-6 rounded-full bg-gold px-12 py-4 text-lg font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105 active:scale-95"
      >
        Start / ابدأ
      </Button>
    </section>
  );
}

const GROUPS: { title: string; sub: string; ids: LevelId[] }[] = [
  { title: "المرحلة المتوسطة - العراق", sub: "Middle School", ids: ["int1", "int2", "int3"] },
  { title: "المرحلة الإعدادية - العراق", sub: "High School", ids: ["prep4", "prep5", "prep6"] },
  { title: "المرحلة الجامعية", sub: "College", ids: ["uni"] },
];

function LevelPicker({ current, onPick }: { current: LevelId | null; onPick: (id: LevelId) => void }) {
  return (
    <section className="mx-auto max-w-md px-5 py-8">
      <div className="flex items-center gap-3">
        <img src={logo.url} alt="Zophysics" className="h-14 w-14 rounded-full" />
        <div>
          <h1 dir="rtl" className="text-2xl font-bold text-primary">اختر مرحلتك الدراسية</h1>
          <p className="text-sm text-muted-foreground">Choose your stage & grade</p>
        </div>
      </div>
      <div className="mt-6 space-y-6">
        {GROUPS.map((g, gi) => (
          <div key={g.sub} className="animate-rise" style={{ animationDelay: `${gi * 90}ms` }}>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="font-display text-lg text-muted-foreground">{g.sub}</span>
              <span dir="rtl" className="font-bold text-foreground">{g.title}</span>
            </div>
            <div className="grid gap-2">
              {g.ids.map((id) => (
                <Button
                  key={id}
                  onClick={() => onPick(id)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-start transition-colors ${
                    current === id ? "border-primary bg-secondary" : "border-border bg-card hover:border-accent hover:bg-secondary"
                  }`}
                >
                  <span className="text-sm text-muted-foreground">{LEVELS[id].en}</span>
                  <span dir="rtl" className="font-bold">{LEVELS[id].ar}</span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

