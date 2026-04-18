import { NextRequest } from "next/server";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as { prompt: string };

    if (!prompt?.trim()) {
      return Response.json({ error: "Prompt is required." }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "OPENROUTER_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a professional copywriter for Fluent, a payment platform for African freelancers and digital businesses. Your job is to turn rough service descriptions into polished payment link content.

Given a rough description, respond with ONLY valid JSON in this exact format:
{
  "title": "Short, professional title (3-6 words, Title Case)",
  "description": "One-sentence description that clearly explains what the payer is paying for. Professional, specific, and client-facing."
}

Rules:
- Title must be 3–6 words, Title Case, no punctuation at end
- Description must be a single sentence, under 120 characters
- Make it sound professional, like an invoice line item
- Do NOT include any text outside the JSON object`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        "X-Title": "Fluent",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 200,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Generate a payment link title and description for: "${prompt.trim()}"`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return Response.json({ error: `AI error: ${text}` }, { status: 502 });
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
    };

    const raw = data.choices?.[0]?.message?.content ?? "{}";

    let parsed: { title?: string; description?: string };
    try {
      parsed = JSON.parse(raw) as { title?: string; description?: string };
    } catch {
      return Response.json(
        { error: "AI returned invalid JSON." },
        { status: 502 }
      );
    }

    if (!parsed.title || !parsed.description) {
      return Response.json(
        { error: "AI response was incomplete." },
        { status: 502 }
      );
    }

    return Response.json({
      title: parsed.title,
      description: parsed.description,
    });
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
