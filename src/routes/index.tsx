import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ArrowUp, GraduationCap, RotateCcw, Square } from "lucide-react";
import logo from "@/assets/zophysics_logo.png.asset.json";
import { LEVELS, isLevel, type LevelId } from "@/lib/ai/levels";

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
  const [screen, setScreen] = useState<Screen>("splash");
  const [level, setLevel] = useState<LevelId | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LEVEL_KEY);
    if (isLevel(saved)) setLevel(saved);
  }, []);

  const pick = (id: LevelId) => {
    localStorage.setItem(LEVEL_KEY, id);
    setLevel(id);
    setScreen("chat");
  };

  return (
    <main className="min-h-dvh bg-background bg-cosmos text-foreground">
      {screen === "splash" && <Splash onStart={() => setScreen(level ? "chat" : "level")} />}
      {screen === "level" && <LevelPicker current={level} onPick={pick} />}
      {screen === "chat" && level && <Chat key={level} level={level} onChange={() => setScreen("level")} />}
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
      <button
        onClick={onStart}
        className="mt-10 rounded-full bg-gold px-12 py-4 text-lg font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105 active:scale-95"
      >
        Start / ابدأ
      </button>
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
                <button
                  key={id}
                  onClick={() => onPick(id)}
                  className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-start transition-colors ${
                    current === id ? "border-primary bg-secondary" : "border-border bg-card hover:border-accent hover:bg-secondary"
                  }`}
                >
                  <span className="text-sm text-muted-foreground">{LEVELS[id].en}</span>
                  <span dir="rtl" className="font-bold">{LEVELS[id].ar}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const chatKey = (l: LevelId) => `zophysics-chat-${l}`;

function Chat({ level, onChange }: { level: LevelId; onChange: () => void }) {
  const [input, setInput] = useState("");
  const [initial] = useState<UIMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem(chatKey(level)) || "[]"); } catch { return []; }
  });
  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id: level,
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat", body: { level } }),
  });
  const endRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error") localStorage.setItem(chatKey(level), JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    if (status === "ready") taRef.current?.focus();
  }, [messages, status, level]);

  const send = () => {
    const t = input.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  };

  const suggestions = LEVELS[level].stage === "college"
    ? ["Explain Gauss's law intuitively", "اشرح معادلة شرودنغر ببساطة"]
    : ["ما هو قانون نيوتن الثاني؟ مع مثال", "اشرح لي أول فصل في كتابي"];

  return (
    <section className="mx-auto flex h-dvh max-w-2xl flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <img src={logo.url} alt="Zophysics" className="h-10 w-10 rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold leading-none text-primary">Zophysics</p>
          <p dir="rtl" className="truncate text-start text-xs text-muted-foreground">{LEVELS[level].ar} · {LEVELS[level].en}</p>
        </div>
        {messages.length > 0 && (
          <button onClick={() => { setMessages([]); localStorage.removeItem(chatKey(level)); }} aria-label="New chat" className="rounded-full p-2 text-muted-foreground hover:bg-secondary">
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        <button onClick={onChange} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary">
          <GraduationCap className="h-4 w-4 text-primary" /> تغيير المرحلة
        </button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div className="mt-10 text-center animate-rise">
            <img src={logo.url} alt="" className="mx-auto w-40 opacity-90" />
            <p dir="rtl" className="mt-3 text-lg font-bold text-primary">اسألني أي شيء في الفيزياء!</p>
            <p className="text-sm text-muted-foreground">Ask me anything about physics.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button key={s} dir="auto" onClick={() => sendMessage({ text: s })} className="rounded-full border border-border bg-card px-4 py-2 text-sm hover:border-primary">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          if (m.role === "user")
            return (
              <div key={m.id} className="flex justify-end">
                <div dir="auto" className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-ee-sm bg-gold px-4 py-2.5 text-primary-foreground">{text}</div>
              </div>
            );
          return (
            <div key={m.id} className="flex gap-2">
              <img src={logo.url} alt="" className="mt-1 h-7 w-7 shrink-0 rounded-full" />
              <div dir="auto" className="chat-md min-w-0 flex-1 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{text}</ReactMarkdown>
              </div>
            </div>
          );
        })}
        {busy && messages[messages.length - 1]?.role === "user" && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <img src={logo.url} alt="" className="h-7 w-7 animate-spin rounded-full [animation-duration:3s]" />
            <span className="text-sm">يفكّر… thinking</span>
          </div>
        )}
        {error && <p className="rounded-xl border border-destructive/50 px-4 py-2 text-sm text-destructive">{error.message || "Something went wrong."}</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="border-t border-border bg-background/80 p-3 backdrop-blur">
        <div className="flex items-end gap-2 rounded-3xl border border-input bg-card p-2 focus-within:border-primary">
          <textarea
            ref={taRef}
            autoFocus
            dir="auto"
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="اكتب سؤالك… Type your question"
            className="max-h-36 flex-1 resize-none bg-transparent px-3 py-2 outline-none placeholder:text-muted-foreground"
          />
          {busy ? (
            <button type="button" onClick={stop} aria-label="Stop" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
              <Square className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" aria-label="Send" disabled={!input.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-primary-foreground disabled:opacity-40">
              <ArrowUp className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
