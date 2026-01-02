import { Request, Response, NextFunction } from "express";
import Flashcard from "../models/Flashcard";
import mongoose from "mongoose";

// Helper: get authenticated user id

const getUserId = (req: Request, res: Response): string | undefined => {
  const userId = req.user?._id;
  if (!userId) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  return userId;
};

//  GET /api/flashcards/:documentId/

export const getFlashcards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const flashcards = await Flashcard.find({
       userId: new mongoose.Types.ObjectId(userId),
      documentId: new mongoose.Types.ObjectId(req.params.documentId),
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/flashcards

export const getAllFlashcardSets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const flashcardSets = await Flashcard.find({ userId })
      .populate("documentId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets,
    });
  } catch (error) {
    next(error);
  }
};

//  POST /api/flashcards/:cardId/review
export const reviewFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const cardId = req.params.cardId;
    if (!cardId) {
      return res.status(400).json({
        success: false,
        error: "cardId is required",
      });
    }
    const flashcardSet = await Flashcard.findOne({
      userId,
      "cards._id": cardId,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard or card not found",
      });
    }

    const card = flashcardSet.cards.id(cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        error: "Card not found",
      });
    }

    card.lastReviewed = new Date();
    card.reviewCount += 1;

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    next(error);
  }
};


// PUT /api/flashcards/:cardId/star
export const toggleStarFlashcard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const cardId = req.params.cardId;
    if (!cardId) {
      return res.status(400).json({
        success: false,
        error: "cardId is required",
      });
    }
    const flashcardSet = await Flashcard.findOne({
      userId,
      "cards._id": cardId,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard or card not found",
      });
    }

    const card = flashcardSet.cards.id(cardId);

    if (!card) {
      return res.status(404).json({
        success: false,
        error: "Card not found",
      });
    }

    card.isStarred = !card.isStarred;
    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    next(error);
  }
};


// DELETE /api/flashcards/:id
export const deleteFlashcardSet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const flashcardSet = await Flashcard.findOne({
      _id: req.params.id,
      userId,
    });

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
      });
    }

    await flashcardSet.deleteOne();

    res.status(200).json({
      success: true,
      message: "Flashcard set deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
