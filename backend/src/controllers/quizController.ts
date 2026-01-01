import { NextFunction, Response } from 'express';
import Quiz from '../models/Quiz';


export const getQuizzes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user!._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};



export const getQuizById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};






export const submitQuiz = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Answers must be an array",
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz already completed",
      });
    }

    const totalQuestions = quiz.questions.length;
    let correctCount = 0;
    const userAnswers = [];
    const answeredIndices = new Set<number>();

    for (const entry of answers) {
      const { questionIndex, selectedAnswer } = entry;

      if (
        typeof questionIndex !== "number" ||
        questionIndex < 0 ||
        questionIndex >= totalQuestions
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid question index",
        });
      }

      if (answeredIndices.has(questionIndex)) {
        return res.status(400).json({
          success: false,
          error: "Duplicate answers detected",
        });
      }

      answeredIndices.add(questionIndex);

      const question = quiz.questions[questionIndex];
      const isCorrect = selectedAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      userAnswers.push({
        questionIndex,
        selectedAnswer,
        isCorrect,
        answeredAt: new Date(),
      });
    }

    // Optional: enforce full completion
    if (answeredIndices.size !== totalQuestions) {
      return res.status(400).json({
        success: false,
        error: "All questions must be answered",
      });
    }

    const score = Math.round((correctCount / totalQuestions) * 100);

    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalQuestions,
        userAnswers,
      },
    });
  } catch (error) {
    next(error);
  }
};








export const getQuizResults = async (req: Request, res: Response, next: NextFunction){

    try {

    } catch (error) {
        next(error)
    }
}
export const deleteQuiz = async (req: Request, res: Response, next: NextFunction){
    try {

    } catch (error) {
        next(error)
    }
}