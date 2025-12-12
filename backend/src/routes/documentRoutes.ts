import express from "express";

import {
  updateDocument,
  getDocuments,
  getDocument,
  deleteDocument,
} from "../controllers/documentController";

import protect from "../middleware/auth";
import upload from "../config/multer";

const router = express.Router();

// Protect all document routes
router.use(protect);

// UPLOAD PDF → /documents/upload
// documentRoutes.ts
router.post("/upload", (req, res) => upload.single("file"), updateDocument);
// GET ALL DOCUMENTS → /documents
router.get("/", getDocuments);

// GET SINGLE DOCUMENT → /documents/:id
router.get("/:id", getDocument);

// DELETE DOCUMENT → /documents/:id
router.delete("/:id", deleteDocument);

export const documentRoute = router;
