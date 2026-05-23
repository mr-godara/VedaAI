# VedaAI — AI Assessment Creator

## Overview
A full-stack AI-powered assessment creator that allows teachers to create assignments and generate structured question papers using AI.

## Architecture
Frontend (Next.js) → REST API (Express) → BullMQ Job Queue → Worker (AI Generation) → MongoDB (storage) → WebSocket → Frontend (real-time update)

## Tech Stack
### Frontend
- Next.js 14 (App Router)
- TypeScript
- Zustand (state management)
- Tailwind CSS
- WebSocket client

### Backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- Redis + BullMQ (job queue)
- WebSocket (ws library)
- Anthropic Claude / OpenAI GPT

## Features
- Assignment creation form with file upload
- AI-powered question paper generation
- Real-time generation progress via WebSocket
- Structured output with sections, difficulty tags, marks
- PDF export
- Redis caching

## Setup Instructions

### Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Anthropic or OpenAI API key

### Installation

```bash
# Clone the repo
git clone https://github.com/mr-godara/VedaAI.git
cd VedaAI

# Backend setup
cd backend
cp .env.example .env
# Fill in your .env values
npm install
npm run dev

# Frontend setup (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend: http://localhost:3000
Backend:  http://localhost:4000
