import { NextResponse } from "next/server";

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

    const prompt = `
      You are an expert career coach and resume writer.
      The user will provide their resume and a job description.
      Your task is to rewrite the resume so it is **highly relevant** to the job posting while keeping the candidate’s authentic experience.

      Guidelines:
      - Highlight **skills, tools, and achievements** that match the job description.
      - Rewrite bullet points to be **clear, quantifiable, and results-driven**.
      - Keep professional tone, concise wording, and ATS (Applicant Tracking System) friendly formatting.
      - Please keep 3-5 jobs (preferrably 5) in the list of jobs.
      - Do not remove important experience unless it is irrelevant. If the resume has more than 5 jobs, keep the most recent 5 and condense older ones.
      - Return the updated resume in **Markdown format**.


Target Role:
${jd}

Resume to improve:
${resumeText}
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false,
        options: { temperature: 0.3, num_predict: 2000 },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Ollama error: ${text}` },
        { status: 500 },
      );
    }

    const data = await response.json();
    return NextResponse.json({ optimized: data.response ?? "" });
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException; // narrow to something with .code
    const msg =
      e?.code === "ECONNREFUSED"
        ? "Cannot reach Ollama at http://localhost:11434. Is it running? Try `ollama serve`."
        : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
