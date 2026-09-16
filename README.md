# SPEAKWISE AI

**“Think in Marathi. Speak in English. Speak with Confidence.”**
## Project Summary

SpeakWise AI is an AI-powered English learning platform designed especially for Marathi-speaking learners. It helps users translate Marathi thoughts into natural English, improve grammar, practice pronunciation, learn grammar concepts, and develop English speaking confidence through interactive practice.

---
# 📌 1. Introduction

SpeakWise AI is a web-based English learning platform that helps Marathi-speaking learners improve their English communication skills.

The application combines translation, grammar correction, pronunciation assistance, English practice, and voice interaction into a single learning platform.

It provides a simple and interactive environment where users can practice English without hesitation and gradually improve their communication skills.

### Application Flow

**User Input → React Interface → Node.js / Express Server → AI / NLP Processing → Response → Browser**

---

# 2. Problem Statement

Many Marathi-speaking learners face difficulty while converting their thoughts into English and speaking confidently.

Common problems include:

* Difficulty translating Marathi sentences naturally into English.
* Grammar and sentence-formation mistakes.
* Lack of pronunciation practice.
* Fear of making mistakes while speaking English.
* Limited opportunities for interactive English conversation.
* Difficulty understanding English grammar concepts.

SpeakWise AI provides an interactive platform to address these problems through translation, grammar learning, pronunciation support, and English practice.

---

# 3. Objectives

* Improve English speaking confidence.
* Help users translate Marathi thoughts into natural English.
* Provide grammar correction and explanations.
* Improve English pronunciation.
* Provide structured grammar learning.
* Provide interactive English practice.
* Support voice-based learning using Speech-to-Text and Text-to-Speech.
* Provide a simple and responsive learning interface.

---

# ✨ 4.Key Feature
| # | Feature                     | Description                             |
| - | --------------------------- | --------------------------------------- |
| 1 | 🔀 **Native Translation**   | Marathi/Roman Marathi → natural English |
| 2 | 📝 **Grammar Correction**   | Detects and explains grammar mistakes   |
| 3 | 📖 **Grammar Learning**     | Basic to advanced grammar lessons       |
| 4 | 🗣️ **Pronunciation Guide** | Audio + meanings + examples             |
| 5 | 💬 **English Practice**     | Interactive English practice            |
| 6 | 🎙️ **Voice Support**       | Speech-to-Text + Text-to-Speech         |

---

# 🛠️ 5. Technology Stack

| Technology     | Purpose                                    |
| -------------- | ------------------------------------------ |
| React.js       | Frontend user interface                    |
| Vite           | Frontend development and build tool        |
| JavaScript     | Application logic and interaction          |
| HTML5          | Page structure                             |
| CSS3           | Styling and responsive design              |
| Node.js        | Backend runtime                            |
| Express.js     | Backend server and API development         |
| SQLite         | Database management                        |
| REST API       | Communication between frontend and backend |
| Speech-to-Text | Voice input and speech recognition         |
| Text-to-Speech | Voice output and pronunciation practice    |
| Render         | Web application hosting                    |
| Git & GitHub   | Source code management                     |

---

# 6. System Modules

## 6.1 Native Language → English

Users can enter Marathi sentences and receive their English translation.
The module focuses on producing natural and understandable English rather than direct word-to-word translation.

## 6.2 Grammar Correction

The system identifies common grammar mistakes and provides corrected English sentences with explanations.

## 6.3 Grammar Learning

The Grammar module provides structured English grammar topics ranging from basic to advanced concepts.
Examples include:

* Parts of Speech
* Tenses
* Articles
* Prepositions
* Sentence Structure
* Subject-Verb Agreement
* Modal Verbs
* Active and Passive Voice

## 6.4 Pronunciation

Users can search for an English word and receive:
* Pronunciation
* Meaning
* Example sentence
* Audio pronunciation

## 6.5 English Practice

Users receive practice questions or Marathi prompts and respond in English.
The system evaluates the response and provides correction or feedback.

## 6.6 Voice Support

The application supports:
* Speech-to-Text for voice input.
* Text-to-Speech for listening to English responses.
---

# 🧠 7. AI and NLP Concepts Used

SpeakWise AI uses Natural Language Processing and AI-based workflows to support English learning.

### Language Understanding

The system processes user language input and identifies the intended meaning.

### Translation

Marathi language input is processed and converted into meaningful English sentences.

### Grammar Error Correction

The system identifies grammatical errors and generates corrected suggestions.

### Context-Aware Conversation

The practice module can maintain conversation context to provide more natural responses.

### Speech Processing

Speech-to-Text converts spoken input into text, while Text-to-Speech converts text responses into audio.
---

# 8. Project Structure

```text
speakwise-ai/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── aiRoutes.js
│   │   ├── pronunciationRoutes.js
│   │   ├── practiceRoutes.js
│   │   ├── streakRoutes.js
│   │   └── progressRoutes.js
│   │
│   ├── services/
│   │   └── aiTutorService.js
│   │
│   ├── db/
│   │   └── database.js
│   │
│   └── index.js
│
├── package.json
├── render.yaml
├── README.md
├── .gitignore
└── .env.example
```

---

# 9. Important Files

| File / Folder      | Description                      |
| ------------------ | -------------------------------- |
| `client/`          | React frontend application       |
| `src/components/`  | Reusable UI components           |
| `src/pages/`       | Application pages/modules        |
| `src/services/`    | Frontend API/service functions   |
| `App.jsx`          | Main React application           |
| `main.jsx`         | React entry point                |
| `server/`          | Backend application              |
| `server/routes/`   | Backend API routes               |
| `server/services/` | AI-related backend services      |
| `server/db/`       | SQLite database configuration    |
| `server/index.js`  | Express server entry point       |
| `package.json`     | Project dependencies and scripts |
| `render.yaml`      | Render deployment configuration  |
| `.env.example`     | Environment variable template    |

---

# 10. Database Design

SpeakWise AI uses SQLite for storing application data.

### Users Table

| Column     | Data Type | Constraint                  |
| ---------- | --------- | --------------------------- |
| id         | INTEGER   | Primary Key, Auto Increment |
| name       | TEXT      | NOT NULL                    |
| email      | TEXT      | UNIQUE, NOT NULL            |
| password   | TEXT      | NOT NULL                    |
| created_at | DATETIME  | Default Timestamp           |

### Progress Table

| Column       | Data Type | Constraint                  |
| ------------ | --------- | --------------------------- |
| id           | INTEGER   | Primary Key, Auto Increment |
| user_id      | INTEGER   | User Reference              |
| module       | TEXT      | NOT NULL                    |
| score        | INTEGER   | NOT NULL                    |
| completed_at | DATETIME  | Default Timestamp           |

### Practice / Learning Data

The application can store user learning activity such as practice attempts, progress, and streak information.

### Simple Schema

```text
USERS
│
├── id (PK)
├── name
├── email (UNIQUE)
├── password
└── created_at

        │
        │
        ↓

PROGRESS
│
├── id (PK)
├── user_id
├── module
├── score
└── completed_at
```

---

# 11. Application Flow

```text
              USER
                ↓
        React User Interface
                ↓
         User Input / Voice
                ↓
       Node.js + Express API
                ↓
       AI / NLP Processing
                ↓
    ┌───────────┼────────────┐
    ↓           ↓            ↓
Translation  Grammar     Practice
    ↓           ↓            ↓
    └───────────┼────────────┘
                ↓
        Response Generation
                ↓
        Text / Audio Output
                ↓
             USER
```

The user interacts with the React-based interface. Requests are processed through the Node.js and Express backend. AI/NLP processing generates the required response, which is then displayed or spoken back to the user.

---

# 12. API and Backend Operations

| Operation         | Purpose                                |
| ----------------- | -------------------------------------- |
| Authentication    | User registration and login            |
| Translation API   | Marathi to English translation         |
| Grammar API       | Grammar correction and feedback        |
| Pronunciation API | Word pronunciation and information     |
| Practice API      | English practice and responses         |
| Progress API      | Stores and retrieves learning progress |
| Streak API        | Tracks practice activity               |

---

# 🔐 13. Security Implementation

* User authentication is implemented for protected application features.
* Passwords should be stored securely using password hashing.
* API routes validate incoming user data.
* Environment variables are used for sensitive configuration.
* Database operations are handled through the backend.
* Sensitive API keys are not exposed in frontend source code.
* User input is validated before processing.
* Detailed server/database errors are not displayed to normal users.
* `.env` files and sensitive credentials are excluded from GitHub using `.gitignore`.

---

#  🖥️ 14. User Interface

SpeakWise AI provides a clean and responsive interface with a navigation sidebar.
### Main Navigation
* Dashboard
* Native Language → English
* Pronunciation
* Practice
* Grammar
* Settings
* Theme
* Log Out
The interface is designed to provide easy navigation between different English learning modules.

---

# 15. How to Use SpeakWise AI

### Step 1 — Register / Login
Create an account or log in to access the learning modules.

### Step 2 — Dashboard
Open the dashboard and select the required learning module.

### Step 3 — Translation
Enter or speak a Marathi sentence and receive an English translation.

### Step 4 — Pronunciation
Search for an English word to hear its pronunciation and understand its meaning.

### Step 5 — Practice
Answer English practice questions and receive feedback.

### Step 6 — Grammar
Select grammar topics and study explanations and examples.

### Step 7 — Voice Practice
Use the microphone to convert speech into text and practice spoken English.

---

# 🧪 16. Testing
The application was tested for the following major functions:

| Test Case          | Expected Result                           |
| ------------------ | ----------------------------------------- |
| User Registration  | New user account created                  |
| User Login         | User successfully logged in               |
| Translation        | Marathi input converted to English        |
| Grammar Correction | Incorrect sentence receives correction    |
| Pronunciation      | Word pronunciation is provided            |
| Practice           | User can submit English answers           |
| Voice Input        | Speech converted into text                |
| Voice Output       | Text converted into speech                |
| Progress           | Learning activity is recorded             |
| Logout             | User session is terminated                |
| Responsive UI      | Interface works on different screen sizes |

---

# 🌐 17. Hosting

The SpeakWise AI application is deployed using **Render**.

**Hosted Application:** https://speakwiseai-mqic.onrender.com


---
# 🚀 18. Future Enhancements

* Multi-language support for additional Indian languages.
* Personalized AI learning paths.
* Advanced speech analytics.
* Pronunciation scoring.
* Interview preparation mode.
* Vocabulary games and flashcards.
* Daily learning challenges.
* Advanced progress analytics.
* Offline learning support.
* Improved conversational AI.

---

# 📜 19. Conclusion

SpeakWise AI is an interactive English learning platform designed to help Marathi-speaking learners improve their English communication skills.
The project combines React.js, Node.js, Express.js, SQLite, AI/NLP processing, and voice technologies to provide translation, grammar correction, pronunciation practice, and interactive English learning.
The system provides a practical and user-friendly environment where learners can practice English regularly and improve their communication confidence.

---

**MLU24F074 | SpeakWise AI**
