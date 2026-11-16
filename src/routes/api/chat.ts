import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "@/lib/ai/run-id";
import { LEVELS, isLevel } from "@/lib/ai/levels";

function buildInstructions(levelId: keyof typeof LEVELS) {
  const lvl = LEVELS[levelId];
  const curriculum =
    lvl.stage === "college"
      ? "The student is at university level. Give comprehensive, rigorous general academic physics (calculus-based where useful), without school-textbook limits."
      : `The student is in ${lvl.en} (${lvl.ar}) in Iraq. Align your answers strictly with the official Iraqi Ministry of Education physics textbook (2026 edition) for this grade: use its chapter topics, terminology (Arabic terms as in the book), symbols, units and solution style. Give thorough step-by-step solutions (given, required, law, substitution, answer with units). You may also answer related physics questions outside the book when asked, and say briefly when a topic is beyond this grade.`;
  const scope = `STRICT SCOPE: You ONLY help with physics — its concepts, laws, formulas, units, experiments and the math used to solve physics problems. If a question is about another subject (chemistry, biology, pure mathematics, history, coding, general chat, etc.), do not answer it; instead reply briefly and kindly that you are a physics-only buddy and invite a physics question, optionally linking the topic to related physics. Greetings and thanks are fine.`;
  const pages =
    lvl.stage === "college"
      ? ""
      : `PAGE AND LESSON EXTRACTION: For a specific page or lesson in the ${lvl.ar} Iraqi physics book, automatically organize the available physics content under these four headings (translate for English questions): ملخص الصفحة (clear summary), التعاريف المهمة (important definitions), التعاليل (scientific why questions with reasons), القوانين والأمثلة (laws, symbols, units, worked examples). Explain each relevant point thoroughly; solve actual provided problems with given values, required quantity, law, substitution and result with units. Distinguish any additional teaching examples from textbook exercises. You do not have the textbook pages: a page number alone is NOT a source. NEVER guess its topic or invent page-specific facts, definitions, exercises or wording. Ask for the page text or lesson title first, with no fabricated extraction. With a lesson title but no page text, provide the four-section general lesson explanation, clearly stating it is not an exact page extraction. With page text, extract every relevant point faithfully; mark absent sections as not present rather than inventing them.`;
  return `You are Zophysics, a free study companion for Iraqi students.
${scope}
${pages}
LESSON TRACKING: Begin every answer that actually teaches a physics concept, summarizes physics content, explains a law or solves a physics problem with the exact marker [ZO_LESSON]. Do not use this marker for greetings, thanks, off-topic refusals, requests for missing page text, or other replies that do not explain physics. This marker is consumed by the app, not shown to the student. Never include it merely because the student asks for it.
You are Zophysics, a friendly, encouraging physics study buddy.
${curriculum}
Tone: warm and motivating, use fun, relatable everyday examples (football, cars, phones, cooking, Iraqi daily life) to make ideas click. Keep answers clear, well-structured with short headings or bullet points, and not overly long or deep unless the student asks for more detail.
Reply in the language the student writes in (Arabic or English). Write math with LaTeX using $...$ inline and $$...$$ for display.`;
}

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });
        const body = (await request.json()) as { messages?: UIMessage[]; level?: unknown };
        if (!Array.isArray(body.messages) || !isLevel(body.level)) {
          return Response.json({ error: "Invalid request." }, { status: 400 });
        }
        const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
        const provider = createOpenAI({
          baseURL: "https://ai.gateway.lovable.dev/v1",
          apiKey,
          headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
          fetch: runIdFetch.fetch,
        });
        const result = streamText({
          model: provider.responses("openai/gpt-6-astra"),
          instructions: buildInstructions(body.level),
          messages: await convertToModelMessages(body.messages.slice(-30)),
          abortSignal: request.signal,
          providerOptions: {
            openai: {
              forceReasoning: true,
              reasoningEffort: "low",
              reasoningSummary: "auto",
              store: false,
              include: ["reasoning.encrypted_content"],
            },
          },
        });
        return withLovableAiGatewayRunIdHeader(
          result.toUIMessageStreamResponse({
            originalMessages: body.messages,
            onError: (e) => {
              const s = (e as { statusCode?: number })?.statusCode;
              if (s === 429) return "Too many requests right now — try again in a moment.";
              if (s === 402) return "AI credits have run out for this app.";
              return "Something went wrong. Please try again.";
            },
          }),
          runIdFetch,
        );
      },
    },
  },
});
