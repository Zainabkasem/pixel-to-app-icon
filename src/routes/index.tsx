import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { ArrowUp, GraduationCap, LogOut, RotateCcw, ShieldCheck, Square } from "lucide-react";
import logo from "@/assets/zophysics_logo.png.asset.json";
import { LEVELS, isLevel, type LevelId } from "@/lib/ai/levels";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { displayMessageText, isLessonExplanation, PENDING_OATH_KEY, resolveOath } from "@/lib/ai/lesson-session";

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
    if (localStorage.getItem(PENDING_OATH_KEY)) resolveOath(localStorage, false);
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
      {screen === "chat" && level && <Chat key={level} level={level} onChange={() => setScreen("level")} onExit={() => setScreen("splash")} onReset={() => { setLevel(null); setScreen("splash"); }} />}
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
      <button
        onClick={onStart}
        className="mt-6 rounded-full bg-gold px-12 py-4 text-lg font-bold text-primary-foreground shadow-glow transition-transform hover:scale-105 active:scale-95"
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

function Chat({ level, onChange, onExit, onReset }: { level: LevelId; onChange: () => void; onExit: () => void; onReset: () => void }) {
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
  const [exitAction, setExitAction] = useState<"grade" | "exit" | "clear" | null>(null);
  const needsOath = useRef(false);
  const observedIds = useRef(new Set(initial.map((message) => message.id)));
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    for (const message of messages) {
      if (!observedIds.current.has(message.id) && isLessonExplanation(message)) {
        observedIds.current.add(message.id);
        needsOath.current = true;
        localStorage.setItem(PENDING_OATH_KEY, "1");
      }
    }
  }, [messages]);

  const performExit = (action: "grade" | "exit" | "clear") => {
    if (action === "grade") onChange();
    else if (action === "exit") onExit();
    else { setMessages([]); localStorage.removeItem(chatKey(level)); }
  };
  const requestExit = (action: "grade" | "exit" | "clear") => {
    if (needsOath.current) {
      stop();
      setExitAction(action);
    } else { stop(); performExit(action); }
  };
  const refuseOath = () => {
    needsOath.current = false;
    stop();
    resolveOath(localStorage, false);
    setExitAction(null);
    onReset();
  };
  const confirmOath = () => {
    if (!exitAction) return;
    localStorage.setItem(chatKey(level), JSON.stringify(messagesRef.current));
    resolveOath(localStorage, true);
    needsOath.current = false;
    const action = exitAction;
    setExitAction(null);
    performExit(action);
  };
  const exitHandler = useRef(requestExit);
  exitHandler.current = requestExit;

  useEffect(() => {
    // A same-URL history entry catches browser Back without leaving the chat.
    window.history.pushState({ zophysicsChatGuard: true }, "", window.location.href);
    const back = () => {
      window.history.pushState({ zophysicsChatGuard: true }, "", window.location.href);
      exitHandler.current("exit");
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!needsOath.current) return;
      exitHandler.current("exit");
      event.preventDefault();
      event.returnValue = "";
    };
    const pageHide = () => {
      if (needsOath.current) resolveOath(localStorage, false);
    };
    const pageShow = (event: PageTransitionEvent) => {
      if (event.persisted && needsOath.current && !localStorage.getItem(PENDING_OATH_KEY)) window.location.reload();
    };
    window.addEventListener("popstate", back);
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("pagehide", pageHide);
    window.addEventListener("pageshow", pageShow);
    return () => {
      window.removeEventListener("popstate", back);
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("pagehide", pageHide);
      window.removeEventListener("pageshow", pageShow);
    };
  }, []);

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
    : ["ما هو قانون نيوتن الثاني؟ مع مثال", "اشرح لي صفحة 34 من كتابي"];

  return (
    <section className="mx-auto flex h-dvh max-w-2xl flex-col">
      <header className="flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur">
        <img src={logo.url} alt="Zophysics" className="h-10 w-10 rounded-full" />
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold leading-none text-primary">Zophysics <span className="ms-1 rounded-full bg-secondary px-2 py-0.5 font-sans text-[10px] font-medium text-primary">مجاني · Free</span></p>
          <p dir="rtl" className="truncate text-start text-xs text-muted-foreground">{LEVELS[level].ar} · {LEVELS[level].en}</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" onClick={() => requestExit("clear")} aria-label="New chat" title="New chat" className="shrink-0 rounded-full text-muted-foreground">
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => requestExit("grade")} className="shrink-0 gap-1.5 rounded-full text-xs">
          <GraduationCap className="h-4 w-4 text-primary" /> تغيير المرحلة
        </Button>
        <Button variant="ghost" size="icon" onClick={() => requestExit("exit")} aria-label="Exit chat" title="الخروج · Exit chat" className="shrink-0 rounded-full text-muted-foreground">
          <LogOut />
        </Button>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <div className="mt-10 text-center animate-rise">
            <img src={logo.url} alt="" className="mx-auto w-40 opacity-90" />
            <p dir="rtl" className="mt-3 text-lg font-bold text-primary">اسألني أي شيء في الفيزياء!</p>
            <p className="text-sm text-muted-foreground">Physics only · Free for every Iraqi student</p>
            <p dir="rtl" className="mt-1 text-xs text-muted-foreground">فيزياء فقط · مجاني بالكامل</p>
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
          const text = m.role === "assistant" ? displayMessageText(m) : m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
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
      <Dialog open={exitAction !== null} onOpenChange={(open) => { if (!open) refuseOath(); }}>
        <DialogContent dir="rtl" className="w-[calc(100%-2rem)] max-w-lg rounded-lg border-primary/50 p-6 text-center sm:p-8">
          <ShieldCheck className="mx-auto h-12 w-12 text-primary" />
          <DialogTitle className="text-center text-2xl leading-relaxed tracking-normal text-primary">شرط القسم عند الخروج</DialogTitle>
          <DialogDescription className="text-center leading-relaxed">
            هل فهمت الدرس أو حل المسألة؟ تأكيد القسم يحفظ محادثاتك. رفض القسم أو إغلاق هذه النافذة يحذف جميع المحادثات والصور المحفوظة والمرحلة الدراسية من هذا الجهاز، ويعيدك إلى شاشة الترحيب.
            <span lang="en" dir="ltr" className="mt-3 block">Confirm to keep your history. Refusing or closing this window permanently deletes all locally saved data.</span>
          </DialogDescription>
          <Button onClick={confirmOath} className="h-auto min-h-12 whitespace-normal bg-gold px-4 py-3 text-base font-bold leading-relaxed text-primary-foreground">
            أقسم بالله أنني فهمت هذا الدرس
          </Button>
          <Button variant="outline" onClick={refuseOath} className="h-auto min-h-10 whitespace-normal border-destructive/50 py-2 text-destructive">
            لا أقسم — حذف البيانات والعودة للبداية
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  );
}
