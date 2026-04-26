import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { skillName, level = "intermediate", count = 8 } = body;

    if (!skillName) {
      return Response.json({ error: "skillName is required" }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return Response.json({ error: "GROQ_API_KEY not set in .env.local" }, { status: 500 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You generate MCQ questions. Return ONLY a valid JSON array. No markdown, no code blocks, no extra text.",
        },
        {
          role: "user",
          content: `Create ${count} multiple-choice questions to assess "${skillName}" at ${level} level.

Return this exact JSON structure:
[
  {
    "id": 1,
    "question": "Question here?",
    "options": ["A", "B", "C", "D"],
    "correct": 0,
    "explanation": "Why the answer is correct",
    "difficulty": "medium",
    "topic": "Sub-topic"
  }
]

Rules:
- correct must be 0, 1, 2, or 3 (index of right answer)
- exactly 4 options per question
- mix easy, medium, hard difficulties
- cover different sub-topics within ${skillName}`,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.8,
      max_tokens: 2048,
    });

    const rawText = completion.choices[0]?.message?.content || "[]";
    console.log("Raw Groq response:", rawText.substring(0, 200));

    // Extract JSON array from response
    let cleanText = rawText.trim();
    cleanText = cleanText.replace(/```(?:json)?\n?/g, "").replace(/```/g, "");
    
    const match = cleanText.match(/\[[\s\S]*\]/);
    if (match) cleanText = match[0];

    const questions = JSON.parse(cleanText);

    // Ensure valid structure
    const normalized = questions.map((q, i) => ({
      id: q.id || i + 1,
      question: q.question || "Missing question",
      options: q.options?.slice(0, 4) || ["A", "B", "C", "D"],
      correct: [0, 1, 2, 3].includes(q.correct) ? q.correct : 0,
      explanation: q.explanation || "",
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "medium",
      topic: q.topic || skillName,
    }));

    return Response.json(normalized);
  } catch (error) {
    console.error("Question generation failed:", error.message);
    return Response.json(
      { error: "Failed to generate questions", details: error.message },
      { status: 500 }
    );
  }
}