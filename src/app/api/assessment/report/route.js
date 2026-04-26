import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const body = await req.json();
    const { skillName, studentName, questions, answers, timeTaken } = body;

    if (!questions?.length) {
      return Response.json({
        overallSummary: "No questions to evaluate.",
        strengths: [],
        weaknesses: [],
        topicBreakdown: [],
        suggestedTopics: [],
        nextSteps: "Try taking an assessment first.",
        tutorNote: "Complete a quiz to get your report!",
        score: 0,
        timeTaken: 0,
      });
    }

    // Calculate score locally
    const questionSummary = questions.map((q, i) => ({
      question: q.question,
      correctAnswer: q.options?.[q.correct] || "N/A",
      studentAnswer: answers?.[i] != null ? q.options?.[answers[i]] || "N/A" : "Skipped",
      isCorrect: answers?.[i] === q.correct,
      topic: q.topic || "General",
      difficulty: q.difficulty || "medium",
    }));

    const correctCount = questionSummary.filter((q) => q.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100);

    if (!process.env.GROQ_API_KEY) {
      // Return basic report without AI
      return Response.json({
        overallSummary: `You scored ${score}% (${correctCount}/${questions.length} correct) on ${skillName}.`,
        strengths: questionSummary.filter((q) => q.isCorrect).map((q) => `Understood: ${q.question.substring(0, 40)}...`),
        weaknesses: questionSummary.filter((q) => !q.isCorrect).map((q) => `Review: ${q.question.substring(0, 40)}...`),
        topicBreakdown: [],
        suggestedTopics: [`${skillName} practice`],
        nextSteps: "Review incorrect answers and retake to improve.",
        tutorNote: `Good effort, ${studentName || "Student"}! Keep practicing.`,
        score,
        timeTaken: timeTaken || 0,
      });
    }

    // AI-enhanced report
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a tutor. Return ONLY a valid JSON object. No markdown, no extra text.",
        },
        {
          role: "user",
          content: `Generate a detailed assessment report.

Student: ${studentName || "Student"}
Skill: ${skillName}
Score: ${score}% (${correctCount}/${questions.length})
Time taken: ${Math.round((timeTaken || 0) / 60)} min

Results:
${JSON.stringify(questionSummary, null, 2)}

Return ONLY this JSON:
{
  "overallSummary": "2-3 sentence overview",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1"],
  "topicBreakdown": [{"topic": "name", "score": 80, "recommendation": "tip"}],
  "suggestedTopics": ["topic1", "topic2", "topic3"],
  "nextSteps": "actionable advice",
  "tutorNote": "encouraging personal note"
}`,
        },
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1536,
    });

    const rawText = completion.choices[0]?.message?.content || "{}";
    console.log("Raw report response:", rawText.substring(0, 200));

    let cleanText = rawText.trim();
    cleanText = cleanText.replace(/```(?:json)?\n?/g, "").replace(/```/g, "");
    
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (match) cleanText = match[0];

    const report = JSON.parse(cleanText);

    return Response.json({
      ...report,
      score,
      timeTaken: timeTaken || 0,
    });
  } catch (error) {
    console.error("Report generation failed:", error.message);
    return Response.json(
      {
        overallSummary: "Unable to generate detailed report.",
        strengths: [],
        weaknesses: [],
        topicBreakdown: [],
        suggestedTopics: [],
        nextSteps: "Try again later.",
        tutorNote: "Don't worry – keep learning!",
        score: 0,
        timeTaken: 0,
      },
      { status: 200 }
    );
  }
}