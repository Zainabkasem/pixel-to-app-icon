import { describe, expect, it } from "vitest";
import type { UIMessage } from "ai";
import { isLessonExplanation, resolveOath, PENDING_OATH_KEY } from "@/lib/ai/lesson-session";

const reply = (text: string, role: "user" | "assistant" = "assistant"): UIMessage => ({ id: "reply", role, parts: [{ type: "text", text }] });

describe("Understanding oath rules", () => {
  it("requires the oath after an explained lesson or physics problem", () => {
    expect(isLessonExplanation(reply("[ZO_LESSON] F = ma; 2 × 3 = 6 N"))).toBe(true);
  });
  it("does not require the oath for an empty chat, greeting or rejected subject", () => {
    expect([reply(""), reply("Welcome!"), reply("I only answer physics questions."), reply("[ZO_LESSON]", "user")].some(isLessonExplanation)).toBe(false);
  });
  it("preserves all saved chats, images and grade when the oath is confirmed", () => {
    localStorage.setItem("zophysics-level", "prep5");
    localStorage.setItem("zophysics-chat-prep5", "saved explanations");
    localStorage.setItem("images", "saved image");
    localStorage.setItem(PENDING_OATH_KEY, "1");
    expect(resolveOath(localStorage, true)).toBe("continue");
    expect(localStorage.getItem("zophysics-level")).toBe("prep5");
    expect(localStorage.getItem("zophysics-chat-prep5")).toBe("saved explanations");
    expect(localStorage.getItem("images")).toBe("saved image");
    expect(localStorage.getItem(PENDING_OATH_KEY)).toBeNull();
  });
  it("wipes all local storage and resets to welcome on refusal, dismissal or bypass", () => {
    localStorage.setItem("zophysics-level", "prep5");
    localStorage.setItem("zophysics-chat-prep5", "explanation");
    localStorage.setItem("images", "image");
    expect(resolveOath(localStorage, false)).toBe("welcome");
    expect(localStorage.length).toBe(0);
  });
});