# EduPilot AI 

A comprehensive backend system for an AI-powered educational platform that enables document processing, flashcard generation, quiz creation, and interactive chat with documents using Google's Gemini AI.

## 🚀 Features

- **Document Management**: Upload, process, and manage PDF documents
- **AI-Powered Learning Tools**:
  - Automatic flashcard generation from documents
  - Quiz generation with multiple-choice questions
  - Document summarization
  - Interactive chat with document context
  - Concept explanation using document content
- **User Authentication**: Secure JWT-based authentication system
- **Progress Tracking**: Dashboard with learning statistics and activity tracking
- **Cloud Storage**: Cloudinary integration for document storage

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account
- Google Gemini API key

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd edupilot-ai-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Server Configuration
NODE_ENV=development
PORT=5000
MAX_FILE_SIZE=10485760

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
```

4. **Start the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "newusername",
  "email": "newemail@example.com",
  "profileImage": "image_url"
}
```

#### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### Document Endpoints

#### Upload Document
```http
POST /api/documents/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <PDF file>,
  "title": "Document Title"
}
```

#### Get All Documents
```http
GET /api/documents
Authorization: Bearer <token>
```

#### Get Single Document
```http
GET /api/documents/:id
Authorization: Bearer <token>
```

#### Delete Document
```http
DELETE /api/documents/:id
Authorization: Bearer <token>
```

### AI Features Endpoints

#### Generate Flashcards
```http
POST /api/ai/generate-flashcards
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentId": "document_id",
  "count": 10
}
```

#### Generate Quiz
```http
POST /api/ai/generate-quiz
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentId": "document_id",
  "numQuestions": 5,
  "title": "Quiz Title"
}
```

#### Generate Summary
```http
POST /api/ai/generate-summary
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentId": "document_id"
}
```

#### Chat with Document
```http
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentId": "document_id",
  "question": "Your question here"
}
```

#### Explain Concept
```http
POST /api/ai/explain-concept
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentId": "document_id",
  "concept": "Concept to explain"
}
```

#### Get Chat History
```http
POST /api/ai/chat-history/:documentId
Authorization: Bearer <token>
```

### Flashcard Endpoints

#### Get All Flashcard Sets
```http
GET /api/flashcards
Authorization: Bearer <token>
```

#### Get Flashcards by Document
```http
GET /api/flashcards/:documentId
Authorization: Bearer <token>
```

#### Review Flashcard
```http
POST /api/flashcards/:cardId/review
Authorization: Bearer <token>
```

#### Toggle Star Flashcard
```http
PUT /api/flashcards/:cardId/star
Authorization: Bearer <token>
```

#### Delete Flashcard Set
```http
DELETE /api/flashcards/:id
Authorization: Bearer <token>
```

### Quiz Endpoints

#### Get Quizzes by Document
```http
GET /api/quizzes/:documentId
Authorization: Bearer <token>
```

#### Get Quiz by ID
```http
GET /api/quizzes/quiz/:id
Authorization: Bearer <token>
```

#### Submit Quiz
```http
POST /api/quizzes/quiz/:id/submit
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    {
      "questionIndex": 0,
      "selectedAnswer": "A"
    },
    {
      "questionIndex": 1,
      "selectedAnswer": "B"
    }
  ]
}
```

#### Get Quiz Results
```http
GET /api/quizzes/quiz/:id/results
Authorization: Bearer <token>
```

#### Delete Quiz
```http
DELETE /api/quizzes/quiz/:id
Authorization: Bearer <token>
```

### Progress Endpoints

#### Get Dashboard
```http
GET /api/progress/dashboard
Authorization: Bearer <token>
```

**Response includes:**
- Total documents, flashcard sets, and quizzes
- Flashcard statistics (total, reviewed, starred)
- Average quiz score
- Recent activity (documents and quizzes)

## 📦 Project Structure

```
src/
├── config/           # Configuration files (database, multer, cloudinary)
├── controllers/      # Request handlers
├── models/           # MongoDB schemas
├── routes/           # API route definitions
├── middleware/       # Authentication and error handling
├── utils/            # Helper functions (PDF parser, text chunker, Gemini service)
└── server.ts         # Application entry point
```

### Installation

```sh
git clone https://github.com/plabon2024/edupilot-ai.git
cd backend
npm install
```
### Run the Server

```sh
npm run dev
```

The server will start on:

```text
http://localhost:8000
```
