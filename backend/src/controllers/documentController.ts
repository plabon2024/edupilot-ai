import fs from "fs/promises";

import mongoose from "mongoose";
import { NextFunction, Request, Response } from "express";

import Document from "../models/Document";
import { extractTextFromPDF } from "../utils/pdfParser";
import { chunkText } from "../utils/textChunker";
import Flashcard from "../models/Flashcard";
import Quiz from "../models/Quiz";

import cloudinary from "../config/cloudinary";
import { uploadPDFToCloudinary } from "../utils/cloudinaryUploader";

/* ----------------------------- create / update ---------------------------- */

export const updateDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a file.",
      });
    }

    const { title } = req.body;
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      await fs.unlink(req.file.path).catch(() => { });
      return res.status(400).json({
        success: false,
        error: "Provide a document title.",
      });
    }

    /** 1️⃣ Upload to Cloudinary */
    const cloudinaryResult = await uploadPDFToCloudinary(req.file.path);

    /** 2️⃣ Create DB record */
    const document = await Document.create({
      userId: (req as any).user?._id ?? null,
      title: title.trim(),
      fileName: req.file.originalname,
      filePath: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      fileSize: req.file.size ?? "unknown",
      status: "processing",
      uploadDate: new Date(),
    });

    /** 3️⃣ Process PDF FIRST */
    console.log("processing from ", req.file.path);
    await processPDF(document._id.toString(), req.file.path);
    /** 4️⃣ Delete local file AFTER processing */
    await fs.unlink(req.file.path).catch(() => { });

    return res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded to cloud and processing started.",
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => { });
    }
    next(error);
  }
};

/* ------------------------------- processor -------------------------------- */

const processPDF = async (
  documentId: string,
  filePath: string
): Promise<void> => {
  try {

    if (typeof filePath !== "string" || filePath.startsWith("http")) {
      throw new Error(
        `processPDF expected a local filesystem path; got: ${filePath}`
      );
    }


    await fs.access(filePath);
    const stat = await fs.stat(filePath);
    if (stat.size === 0) {
      throw new Error("Uploaded file is empty (0 bytes).");
    }

    // Extract text
    const { text } = await extractTextFromPDF(filePath);


    if (!text || text.trim().length === 0) {
      await Document.findByIdAndUpdate(
        documentId,
        {
          extractedText: "",
          status: "failed",
          processedAt: new Date(),
          processingError: "No text extracted from PDF (empty result).",
        },
        { new: true }
      ).exec();
      return;
    }

    // Create chunks and update
    const chunks = chunkText(text, 500, 50);
    await Document.findByIdAndUpdate(
      documentId,
      {
        extractedText: text,
        chunks,
        status: "ready",
        processedAt: new Date(),
        processingError: null,
      },
      { new: true }
    ).exec();

    console.log(`Document ${documentId} processed successfully.`);
  } catch (error: any) {
    console.error(`Error processing document ${documentId}:`, error);
    await Document.findByIdAndUpdate(
      documentId,
      {
        status: "failed",
        processedAt: new Date(),
        processingError: error && error.stack ? error.stack : String(error),
      },
      { new: true }
    ).exec();
  } finally {
    // Optionally remove file here if desired
  }
};
/* --------------------------------- listing -------------------------------- */

export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(userId) },
      },
      {
        // lookup flashcards
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        // lookup quizzes
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        // add counts
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        // project fields to exclude heavy fields
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      {
        $sort: { uploadDate: -1 },
      },
    ]).exec();

    return res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------- single doc ------------------------------ */

export const getDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      userId: userId,
    }).exec();

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }

    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: userId,
    }).exec();

    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: userId,
    }).exec();

    // Update lastAccessed
    document.set({ lastAccessed: new Date() });
    await document.save();

    // Combine document data with counts
    const documentData = document.toObject();
    (documentData as any).flashcardCount = flashcardCount;
    (documentData as any).quizCount = quizCount;

    return res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

/* --------------------------------- delete --------------------------------- */

export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const document = await Document.findOne({
      _id: req.params.id,
      userId,
    }).exec();

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
      });
    }


    if (document.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
        resource_type: "raw",
      });
      console.log(document.cloudinaryPublicId)
    }

    await document.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
