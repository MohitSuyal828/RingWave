# RingWave

> **AI-Powered Secure Voice Calling Platform with Deepfake Voice Detection**

RingWave is a full-stack web application that combines secure voice communication with AI-powered synthetic voice detection. It provides a modern calling platform where users can authenticate, manage their profiles, view call history, and analyze AI-generated authenticity reports through an intuitive dashboard.

The project is built with a modern React frontend and a scalable Express.js backend backed by PostgreSQL.

---

#  Features

###  Authentication
- User Registration
- Secure Login
- JWT Authentication
- Refresh Token Authentication
- Logout
- Protected Routes
- Profile Management
- Password Change

###  Dashboard
- User Statistics
- Recent Calls
- Recent Detection Reports
- Authenticity Summary
- Activity Overview

###  Call Management
- Call History
- Call Duration Tracking
- Call Status
- Pagination Support

###  AI Detection Reports
- Deepfake Voice Detection Logs
- Confidence Scores
- Detection Status
- Historical Reports
- Dashboard Analytics

###  Security
- JWT Authentication
- Password Hashing (bcrypt)
- Helmet Security Headers
- Rate Limiting
- Request Validation (Zod)
- Structured Logging
- CORS Protection

---

#  Project Architecture

```
RingWave
│
├── frontend/                 # React + TypeScript + Vite
│
├── backend/                  # Express.js + PostgreSQL API
│
├── README.md
└── .gitignore
```

---

#  Tech Stack

## Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI Library |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Shadcn/UI | UI Components |
| React Router | Routing |
| TanStack Query | Server State |
| Zustand | Client State |
| Axios | API Requests |
| Framer Motion | Animations |

---

## Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express 5 | REST API |
| PostgreSQL | Database |
| pg | Database Driver |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Zod | Validation |
| Pino | Logging |
| Helmet | Security |
| Express Rate Limit | API Protection |

---

#  Project Structure

```
RingWave/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── src/
│   ├── migrations/
│   ├── sql_archive/
│   ├── package.json
│   └── server.js
│
├── README.md
└── .gitignore
```

---

#  Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/<your-org>/ringwave.git

cd ringwave
```

---

#  Backend Setup

Move into the backend folder

```bash
cd backend
```

Install dependencies

```bash
npm install
```

Create an environment file

```bash
cp .env.example .env
```

Configure your PostgreSQL credentials inside `.env`.

---

## Database

Create a PostgreSQL database.

Example

```sql
CREATE DATABASE ringwave_db;
```

Import the schema

```bash
psql -U postgres -d ringwave_db -f sql_archive/000_full_schema.sql
```

Run the backend

```bash
npm run dev
```

Backend will start on

```
http://localhost:5000
```

---

#  Frontend Setup

Open a new terminal

```bash
cd frontend
```

Install dependencies

```bash
npm install
```

Create the environment file

```bash
cp .env.example .env
```

Run the frontend

```bash
npm run dev
```

Frontend will start on

```
http://localhost:5173
```

---

#  Application Flow

```
User

   │

   ▼

Frontend (React)

   │

Axios

   │

   ▼

Express API

   │

Authentication

   │

Business Logic

   │

PostgreSQL

   │

Response

   │

Frontend UI
```

---

#  Authentication Flow

```
Register

      │

      ▼

Password Hashing

      │

      ▼

PostgreSQL

      │

      ▼

Login

      │

      ▼

Access Token + Refresh Token

      │

      ▼

Protected APIs

      │

      ▼

Automatic Token Refresh
```

---

# 📡 API Overview

## Authentication

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/profile
PATCH  /api/v1/auth/profile
```

---

## Calls

```
GET    /api/v1/calls
POST   /api/v1/calls
```

---

## AI Detection

```
GET    /api/v1/detections
POST   /api/v1/detections
```

---

## Health

```
GET /health
```

---

#  Security Features

- JWT Authentication
- Refresh Token Rotation
- Password Hashing using bcrypt
- Helmet Security Headers
- API Rate Limiting
- Request Validation
- Centralized Error Handling
- Structured Logging
- Environment Variable Configuration

---

#  Current Implementation Status

###  Implemented

- Authentication System
- User Profiles
- Dashboard
- Call History
- AI Detection Reports
- Backend REST API
- PostgreSQL Integration
- Pagination
- Protected Routes
- Global Error Handling
- Logging
- Security Middleware

###  Planned

- Real-time Voice Calling
- Socket.IO Signaling
- Live AI Voice Analysis
- Notifications
- Contact Management
- OTP Verification
- Password Reset via Email
- User Settings Persistence

---

#  Development

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

---

# 📄 License

This project was developed as part of an academic/industry project and is intended for educational and research purposes.
