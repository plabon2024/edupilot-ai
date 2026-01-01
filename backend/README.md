
# EduPilot AI Backend

## Project Overview

EduPilot AI Backend is a Node.js and Express-based REST API designed to support an AI-powered learning platform. It provides secure user authentication, document management, AI-assisted learning tools (flashcards, quizzes, summaries, and chat), and persistent study analytics backed by MongoDB. The system is built with TypeScript, follows modular route and controller separation, and integrates with Google Gemini for AI capabilities.

---

## Features

* JWT-based authentication and user profile management
* Secure PDF document upload and management
* AI-powered features:

  * Flashcard generation
  * Quiz generation and submission
  * Concept explanations
  * Document-based chat with history
* Flashcard review system with starring and spaced repetition signals
* Quiz scoring, validation, and result tracking
* Centralized error handling and request validation
* MongoDB persistence via Mongoose

---

## API Routes

### Authentication

| Method | Route                     | Description                        |
| ------ | ------------------------- | ---------------------------------- |
| POST   | /api/auth/register        | Register a new user                |
| POST   | /api/auth/login           | Authenticate user and return token |
| GET    | /api/auth/profile         | Get authenticated user profile     |
| PUT    | /api/auth/profile         | Update user profile                |
| POST   | /api/auth/change-password | Change account password            |

### Documents

| Method | Route                 | Description                     |
| ------ | --------------------- | ------------------------------- |
| POST   | /api/documents/upload | Upload or update a PDF document |
| GET    | /api/documents        | Fetch all user documents        |
| GET    | /api/documents/:id    | Fetch a single document         |
| DELETE | /api/documents/:id    | Delete a document               |

### AI Services

| Method | Route                            | Description                          |
| ------ | -------------------------------- | ------------------------------------ |
| POST   | /api/ai/generate-flashcards      | Generate flashcards from a document  |
| POST   | /api/ai/generate-quiz            | Generate a quiz from a document      |
| POST   | /api/ai/generate-summary         | Generate a document summary          |
| POST   | /api/ai/explain-concept          | Explain a specific concept           |
| POST   | /api/ai/chat                     | Chat with AI about a document        |
| GET    | /api/ai/chat-history/:documentId | Retrieve chat history for a document |

### Flashcards

| Method | Route                          | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| GET    | /api/flashcards                | Get all flashcard sets        |
| GET    | /api/flashcards/:documentId    | Get flashcards for a document |
| POST   | /api/flashcards/:cardId/review | Submit a flashcard review     |
| PUT    | /api/flashcards/:cardId/star   | Star or unstar a flashcard    |
| DELETE | /api/flashcards/:id            | Delete a flashcard set        |

---


## Setup Instructions

### Prerequisites

* Node.js (v18 or later recommended)
* npm
* MongoDB (local or Atlas)

### Installation

```sh
git clone <repository_url>
cd edupilot-ai-backend
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
MONGODB_URI=<your_mongodb_connection_string>
DB_NAME=ed
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRE=1D
NODE_ENV=development
CLIENT_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=<cloudinary_name>
CLOUDINARY_API_KEY=<cloudinary_key>
CLOUDINARY_API_SECRET=<cloudinary_secret>
CLOUDINARY_UPLOAD_PRESET=<preset>

GEMINI_API_KEY=<google_gemini_api_key>
```

### Run the Server

```sh
npm run dev
```

The server will start on:

```text
http://localhost:8000
```

---
