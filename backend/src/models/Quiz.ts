import mongoose, { Schema } from "mongoose";
const quizSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      options: {
        type: [String],
        required: true,
        validate: [
          (array: any[]) => array.length === 4,
          "Must have exactily 4 options",
        ],
      },
      correctAnswer: {
        type: String,
        required: true,
      },
      explaination: {
        type: String,
        default: "",
      },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
    },
  ],
  userAnswer: [
    {
      questionIndex: {
        type: Number,
        required: true,
      },
      selectedAnswer: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: true,
      },
      answeredAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],

  score: {
    type: Number,
    default: 0,
  },
  totalQuestion: {
    type: Number,
    required: true,
  },
  completedAt: {
    type: Date,
    default: null,
  },
},
  { timestamps: true, }
);
// imdex for fastert queriss
quizSchema.index({userID:1,documentId:1})
const Quiz=mongoose.model("Quiz",quizSchema)
export default Quiz