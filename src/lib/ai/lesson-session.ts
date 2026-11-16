import type { UIMessage } from "ai";

export const LESSON_MARKER = "[ZO_LESSON]";
export const PENDING_OATH_KEY = "zophysics-pending-oath";

export function messageText(message: UIMessage): string {
  return message.parts.map((part) => part.type === "text" ? part.text : "").join("");
}

export function isLessonExplanation(message: UIMessage): boolean {
  return message.role === "assistant" && messageText(message).includes(LESSON_MARKER);
}

export function displayMessageText(message: UIMessage): string {
  return messageText(message).replaceAll(LESSON_MARKER, "").replace(/\[ZO_(?:L(?:E(?:S(?:S(?:O(?:N)?)?)?)?)?)?$/, "").trimStart();
}

export function resolveOath(storage: Pick<Storage, "clear" | "removeItem">, confirmed: boolean): "continue" | "welcome" {
  if (confirmed) {
    storage.removeItem(PENDING_OATH_KEY);
    return "continue";
  }
  storage.clear();
  return "welcome";
}