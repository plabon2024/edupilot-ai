import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/* ------------------------------------------------------------------ */
/*  Gemini Client Setup                                                */
/* ------------------------------------------------------------------ */

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "FATAL ERROR: GEMINI_API_KEY is not set in the environment variables."
  );
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemini-2.5-flash-lite";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Flashcard {
  question: string;
  answer: string;
  difficulty: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
}

interface DocumentChunk {
  content: string;
}

/* ------------------------------------------------------------------ */
/*  Helper Function                                                    */
/* ------------------------------------------------------------------ */

const getResponseText = (response: any): string => {
  if (typeof response.text === 'function') {
    return response.text();
  }
  if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
    return response.candidates[0].content.parts[0].text;
  }
  throw new Error("Unable to extract text from response");
};

/* ------------------------------------------------------------------ */
/*  Generate Flashcards                                                */
/* ------------------------------------------------------------------ */

export const generateFlashcards = async (text: string, count: number = 10): Promise<Flashcard[]> => {
  const prompt = `
Generate exactly ${count} educational flashcards from the following text.

Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt
    });

    const generatedText = getResponseText(response);
    const flashcards: Flashcard[] = [];

    const cards = generatedText.split("---").filter(c => c.trim());

    for (const card of cards) {
      const lines = card.split("\n");

      let question = "";
      let answer = "";
      let difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/* ------------------------------------------------------------------ */
/*  Generate Quiz                                                      */
/* ------------------------------------------------------------------ */

export const generateQuiz = async (text: string, numQuestions: number = 5): Promise<QuizQuestion[]> => {
  const prompt = `
Generate exactly ${numQuestions} multiple choice questions from the following text.

Format each question as:
Q: [Question]
01: [Option 1]
02: [Option 2]
03: [Option 3]
04: [Option 4]
C: [Correct option exactly as written above]
E: [Brief explanation]
D: [Difficulty: easy, medium, or hard]

Separate each question with "---"

Text:
${text.substring(0, 15000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt
    });

    const generatedText = getResponseText(response);
    const questions: QuizQuestion[] = [];

    const blocks = generatedText.split("---").filter(b => b.trim());

    for (const block of blocks) {
      const lines = block.split("\n");

      let question = "";
      let options: string[] = [];
      let correctAnswer = "";
      let explanation = "";
      let difficulty = "medium";

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (/^0\d:/.test(trimmed)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith("C:")) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("E:")) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate quiz");
  }
};

/* ------------------------------------------------------------------ */
/*  Generate Summary                                                   */
/* ------------------------------------------------------------------ */

export const generateSummary = async (text: string): Promise<string> => {
  const prompt = `
Provide a concise and well-structured summary of the following text.
Highlight the key concepts and main ideas.

Text:
${text.substring(0, 20000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt
    });

    return getResponseText(response);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary");
  }
};

/* ------------------------------------------------------------------ */
/*  Chat With Context                                                  */
/* ------------------------------------------------------------------ */

export const chatWithContext = async (question: string, chunks: DocumentChunk[]): Promise<string> => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  const prompt = `
Based on the following document context, answer the user's question.
If the answer is not present in the context, say so clearly.

Context:
${context}

Question:
${question}

Answer:
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt
    });

    return getResponseText(response);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process chat request");
  }
};

/* ------------------------------------------------------------------ */
/*  Explain Concept                                                    */
/* ------------------------------------------------------------------ */

export const explainConcept = async (concept: string, context: string): Promise<string> => {
  const prompt = `
Explain the concept of "${concept}" using the following context.
Provide a clear, educational explanation and examples if relevant.

Context:
${context.substring(0, 10000)}
`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: prompt
    });

    return getResponseText(response);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to explain concept");
  }
};