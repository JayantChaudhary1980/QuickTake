<div align="center">

# ⚡ QuickTake

### Turn hours of content into minutes of understanding.

AI-powered transcription, summarization, insight extraction, and conversational search for meetings, recordings, lectures, podcasts, and YouTube videos.

<br>

![React](https://img.shields.io/badge/React-19-blue)
![Node](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![Groq](https://img.shields.io/badge/Groq-AI-orange)
![JWT](https://img.shields.io/badge/Auth-JWT-red)

</div>

---

## Overview

QuickTake is a full-stack AI platform designed to help users extract valuable information from long-form content without manually reviewing every minute.

Whether it's a recorded meeting, an online lecture, a podcast episode, an interview, or a YouTube video, QuickTake transforms raw content into structured knowledge.

Upload content, generate transcripts, discover key insights, identify action items, and interact with the material through an AI assistant that understands the conversation.

---

## Why QuickTake?

Information is everywhere.

Meetings run for hours.

Lectures span entire semesters.

Podcasts exceed three hours.

YouTube videos often contain valuable insights hidden inside lengthy discussions.

The problem isn't access to information anymore.

The problem is finding what matters.

QuickTake was built to solve that problem.

---

## Core Features

### 🎙 AI Transcription

Convert audio and video into searchable text using state-of-the-art speech recognition.

* Audio upload
* Video upload
* Fast processing
* Accurate transcripts

---

### 🧠 Intelligent Summaries

Generate concise summaries that capture the essence of long discussions.

Instead of reviewing a 2-hour meeting:

```text
Meeting Duration: 2 Hours
Reading Time: < 2 Minutes
```

---

### 📌 Key Insights Extraction

Automatically identify:

* Important discussion points
* Decisions made
* Critical information
* Noteworthy observations

---

### ✅ Action Item Detection

QuickTake detects actionable tasks from conversations.

Example:

```text
• Update deployment pipeline
• Schedule client meeting
• Review database migration
• Complete UI testing
```

---

### 💬 AI Copilot

Ask questions directly about the content.

Examples:

```text
What decisions were finalized?

Summarize the discussion in 5 points.

What tasks were assigned?

What was discussed about deployment?
```

The AI responds using the transcript generated from the uploaded content.

---

### 📺 YouTube Intelligence

Analyze YouTube videos without watching them entirely.

Paste a link.

Get:

* Transcript
* Summary
* Key insights
* Action items
* AI Q&A

---

### 🔐 Secure Authentication

Built-in authentication system with:

* Google Sign-In
* JWT Authentication
* Protected Routes
* User-Specific Data

---

### 📊 Analytics Dashboard

Track:

* Total analyses
* Platform activity
* User engagement
* AI usage metrics
* Processing statistics

---

### 🌐 Public Sharing

Generate shareable links for analyses and summaries.

Perfect for:

* Teams
* Students
* Study groups
* Project reviews

---

## Architecture

```text
                    ┌──────────────────┐
                    │      Client      │
                    │  React + Vite    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   Express API    │
                    │   Node Backend   │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼

 ┌─────────────┐    ┌─────────────┐     ┌─────────────┐
 │  MongoDB    │    │   Groq AI   │     │  YouTube    │
 │ Persistence │    │ Processing  │     │ Extraction  │
 └─────────────┘    └─────────────┘     └─────────────┘

                             │
                             ▼

               Transcript • Summary • Q&A
               Insights • Action Items
```

---

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* ShadCN UI
* React Router

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### AI Layer

* Groq Whisper Large V3 Turbo
* Llama 3.3 70B Versatile

### Authentication

* Google OAuth
* JWT

---

## Local Development

### Clone Repository

```bash
git clone <repository-url>
cd quicktake
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

```env
MONGODB_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GROQ_API_KEY=
PUBLIC_HOST=
```

---

## Future Roadmap

* Multi-language transcription
* Speaker identification
* PDF report exports
* Team workspaces
* Real-time meeting processing
* Calendar integrations
* Slack integration
* Notion integration

---

## What I Learned

Building QuickTake involved solving problems across multiple domains:

* Full-stack application architecture
* Authentication and authorization
* Media processing workflows
* AI integration pipelines
* Database design
* REST API development
* Prompt engineering
* Production deployment

The project became an opportunity to explore how modern AI systems can transform unstructured content into useful, searchable knowledge.

---

<div align="center">

### Built to make information easier to understand, search, and act upon.

</div>
