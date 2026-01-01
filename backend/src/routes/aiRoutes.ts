
import express from "express";
import protect from "../middleware/auth";
import { chat, chatHistory, explainConcept, generateFlashcards, generateQuiz, generateSummary } from "../controllers/aiController";



const router = express.Router();

router.use(protect);
router.post('/generate-flashcards',generateFlashcards)
router.post('/generate-quiz',generateQuiz)
router.post('/generate-summary',generateSummary)
router.post('/chat',chat)
router.post('/explain-concept',explainConcept)
router.post('/chat-history/:documentId',chatHistory)
export const aiRoutes = router;
