# CareOS — AI Clinical Decision Support System

Author: Intikhab Khursheed | intikhabkhurheed.netlify.app
Live Demo:[careos-hospital-client.vercel.app](https://careos-hospital-client.vercel.app/login) (public demo, no login required)
Status: Self-built portfolio project — demo environment only, no real patient data

## Overview

CareOS is a self-developed AI-powered hospital and clinic management platform 
built to demonstrate production-grade architecture for clinical decision support. 
It digitizes core hospital workflows and integrates an LLM backend for 
AI-assisted clinical tasks.

The system enforces strict role isolation across 8 user roles using multi-layer 
RBAC and stateful JWT validation, ensuring that AI-generated outputs and 
real-time event streams remain scoped to the correct clinical context.

## Key Technical Features

- 8-role RBAC architecture (Admin, Doctor, Nurse, Receptionist, Lab, Pharmacy, 
  Patient, Billing) with stateful JWT validation and token-verified Socket.io 
  event streams preventing cross-role data leakage
- Grok AI (llama-3.3-70b-versatile) integration for clinical note generation, 
  lab result interpretation, and drug interaction checking
- Real-time alerts via Socket.io across role-isolated channels
- Dockerized deployment with environment-isolated service containers
- AI anomaly detection on billing records

## Architecture

Client (React 18) communicates with an Express.js REST API backed by MongoDB 
Atlas. All AI calls route through a server-side proxy to prevent key exposure. 
Socket.io manages real-time event broadcasting with middleware-level role 
enforcement before any event reaches the client.

## Tech Stack

Frontend: React 18, Tailwind CSS, Recharts, Socket.io-client
Backend: Node.js, Express.js, MongoDB Atlas, Mongoose, Socket.io
AI: Grok API (llama-3.3-70b-versatile)
Auth: JWT with refresh token rotation, 8-role RBAC
DevOps: Docker, GitHub Actions, Vercel

## Security Architecture

- Cross-role isolation: Socket.io rooms are scoped per role at connection time
- JWT middleware validates role claims on every protected route
- AI prompt construction isolates patient context per authenticated session
- Input validation and API sanitization on all LLM-facing endpoints

## Setup

```bash
git clone https://github.com/IntikhabKhursheed/CareOs-Hospital.git
cd CareOs-Hospital
cp .env.example .env
# Add MONGODB_URI, GROK_API_KEY, JWT_SECRET
npm install
npm run dev
```

Demo credentials available at the live demo link above.
