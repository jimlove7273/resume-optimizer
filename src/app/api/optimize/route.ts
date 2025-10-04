// app/api/optimize-resume/route.ts
import { NextResponse } from "next/server";

const MODELS_ENDPOINT = "https://models.github.ai/inference/chat/completions";

export async function POST(req: Request) {
  try {
    const { resumeText, jobDescription, tone } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "Missing resumeText" },
        { status: 400 },
      );
    }

    const jd = jobDescription?.trim() || "Frontend Developer";
    const selectedTone = tone || "Professional";

    const systemPrompt = `
You are an expert career coach and resume writer.
Rewrite the resume so it is highly relevant to the job posting while keeping the candidate’s authentic experience.
Guidelines:
- Highlight skills, tools, achievements matching the job description.
- Rewrite bullets to be clear, quantifiable, results-driven.
- Keep professional tone, concise wording, and ATS-friendly formatting.
- Keep 3-5 jobs (preferably 5). If >5, keep most recent 5 and condense older ones.
- Return the updated resume in Markdown format.
Target role: ${jd}
Tone: ${selectedTone}
`;

    const userMessage = `Resume to improve:\n\n${resumeText}`;

    const modelId = process.env.GITHUB_MODEL_ID || "openai/gpt-4.1";

    const body = {
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 2000,
      temperature: 0.3,
      stream: false,
    };

    const resp = await fetch(MODELS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_MODELS_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify(body),
    });

    const text = await resp.text();
    // Try to parse JSON if possible
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!resp.ok) {
      // If GitHub returns unknown_model we surface guidance
      const errCode =
        data?.error?.code ?? data?.code ?? data?.error?.message ?? text;
      if (typeof errCode === "string" && errCode.includes("unknown_model")) {
        return NextResponse.json(
          {
            error: `Unknown model '${modelId}'. Check that GITHUB_MODEL_ID is set to a model you can access (see https://github.com/marketplace/models and open the model's Playground -> Code tab).`,
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        { error: `GitHub Models error: ${text}` },
        { status: resp.status },
      );
    }

    const optimized =
      data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? "";

    return NextResponse.json({ optimized });
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException;
    const msg =
      e?.code === "ECONNREFUSED"
        ? "Cannot reach GitHub Models endpoint. Check network and token."
        : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
