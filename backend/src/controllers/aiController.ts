import { Request, Response, NextFunction } from "express";
import Document from "../models/Document";
import Flashcard from "../models/Flashcard";
import Quiz from "../models/Quiz";
import ChatHistory from "../models/ChatHistory";

import {
  generateFlashcards as generateFlashcardsAI,
  generateQuiz as generateQuizAI,
  generateSummary as generateSummaryAI,
  chatWithContext,
} from "../utils/geminiService";
import { findRelevantChunks } from "../utils/textChunker";

/* ------------------------------------------------------------------ */
/*  Generate Flashcards                                                */
/* ------------------------------------------------------------------ */

export const generateFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentId, count = 10 } = req.body;

    if (!documentId) {
      return res
        .status(400)
        .json({ success: false, error: "Document ID is required" });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user!._id,
      status: "ready",
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found or not ready" });
    }

    const flashcards = await generateFlashcardsAI(
      document.extractedText,
      Number(count)
    );

    const flashcardSet = await Flashcard.create({
      userId: req.user!._id,
      documentId: document._id,
      cards: flashcards.map((card) => ({
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
        reviewCount: 0,
        isStarred: false,
      })),
    });

    return res.status(201).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/*  Generate Quiz                                                      */
/* ------------------------------------------------------------------ */

export const generateQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentId, numQuestions = 5, title } = req.body;

    if (!documentId) {
      return res
        .status(400)
        .json({ success: false, error: "Document ID is required" });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user!._id,
      status: "ready",
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found or not ready" });
    }

    const questions = await generateQuizAI(
      document.extractedText,
      Number(numQuestions)
    );

    const quiz = await Quiz.create({
      userId: req.user!._id,
      documentId: document._id,
      title: title || `${document.title} - Quiz`,
      questions,
      totalQuestions: questions.length,
      userAnswers: [],
      score: 0,
    });

    return res.status(201).json({
      success: true,
      data: quiz,
      message: "Quiz generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/*  Generate Summary                                                   */
/* ------------------------------------------------------------------ */

export const generateSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res
        .status(400)
        .json({ success: false, error: "Document ID is required" });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user!._id,
      status: "ready",
    });

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found or not ready" });
    }

    const summary = await generateSummaryAI(document.extractedText);

    return res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        title: document.title,
        summary,
      },message:'summary generated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/*  Chat With Document                                                 */
/* ------------------------------------------------------------------ */

export const chat = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({
        success: false,
        error: "documentId and question are required",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user!._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
      });
    }

 
    const relevantChunks = findRelevantChunks(document.chunks, question, 3);

    const chunkIndices = relevantChunks.map((c) => c.chunkIndex);

  /*  Chat history                                                  */
   
    let chatHistory = await ChatHistory.findOne({
      userId: req.user!._id,
      documentId: document._id,
    });

    if (!chatHistory) {
      chatHistory = await ChatHistory.create({
        userId: req.user!._id,
        documentId: document._id,
        messages: [],
      });
    }

  /*  Gemini answer                                                 */

    const answer = await chatWithContext(question, relevantChunks);

    chatHistory.messages.push(
      {
        role: "user",
        content: question,
        timestamp: new Date(),
        relevantChunks: [],
      },
      {
        role: "assistant",
        content: answer,
        timestamp: new Date(),
        relevantChunks: chunkIndices,
      }
    );

    await chatHistory.save();

    return res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        relevantChunks: chunkIndices,
        chatHistoryId: chatHistory._id,
      },
      message: "Response generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const explainConcept = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentId, concept } = req.body;

    if (!documentId || !concept) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId and concept",
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user!._id,
      status: "ready",
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found or not ready",
      });
    }

  /*  Find relevant chunks                                          */

    const relevantChunks = findRelevantChunks(document.chunks, concept, 3);

    const context = relevantChunks.map((chunk) => chunk.content).join("\n\n");

  /*  Gemini explanation                                            */

    const explanation = await generateSummaryAI(
      `Explain the concept "${concept}" using the context below:\n\n${context}`
    );

    return res.status(200).json({
      success: true,
      data: {
        concept,
        explanation,
        relevantChunks: relevantChunks.map((c) => c.chunkIndex),
      },
      message: "Explanation generated successfully",
    });
  } catch (error) {
    next(error);
  }
};

/*  Get Chat History for a Document                                    */
/*  GET /api/ai/chat-history/:documentId                               */

export const chatHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: "Please provide documentId",
      });
    }

    const history = await ChatHistory.findOne({
      userId: req.user!._id,
      documentId,
    }).select("messages");

    if (!history) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No chat history found for this document",
      });
    }

    return res.status(200).json({
      success: true,
      data: history.messages,
      message: "Chat history retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};
