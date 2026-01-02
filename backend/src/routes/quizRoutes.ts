import express from "express";
import {
  deleteQuiz,
  getQuizById,
  getQuizResults,
  getQuizzes,
  submitQuiz,
} from "../controllers/quizController";
import protect from "../middleware/auth";

const router = express.Router();

// All quiz routes require authentication
router.use(protect);
// GET /api/quizzes/:documentId
router.get("/:documentId", getQuizzes);
// GET /api/quizzes/quiz/:id
router.get("/quiz/:id", getQuizById);
//  POST /api/quizzes/quiz/:id/submit
router.post("/quiz/:id/submit", submitQuiz);
//   GET /api/quizzes/quiz/:id/results
router.get("/quiz/:id/results", getQuizResults);
// DELETE /api/quizzes/quiz/:id
router.delete("/quiz/:id", deleteQuiz);

export const quizRoutes = router;
