# RingWave 🌊

> AI-powered secure audio calling platform with real-time deepfake & synthetic voice detection.

---

## Overview

RingWave is a modern internet audio calling platform that integrates AI-powered voice deepfake detection. During every call, AI models continuously analyze speech patterns in real time, providing authenticity scores and alerting users if speech appears cloned, synthetic, or manipulated.

### Key Features

- **Secure Authentication** — Register, login, OTP verification, password reset
- **Audio Calling** — One-to-one and group audio calls
- **AI Detection** — Real-time deepfake & synthetic voice analysis
- **Authenticity Badges** — Genuine / Suspicious / Synthetic / Analyzing / Unknown
- **Detection Reports** — Post-call AI analysis reports with confidence scores
- **Contact Management** — Add, accept, block contacts with online status
- **Notifications** — Real-time alerts for calls, detections, and requests
- **Dashboard** — Stats, recent calls, detection summaries, online contacts
- **Settings** — Notification, security, audio, and appearance preferences

---

## Tech Stack

| Category | Technology | Version |
|---|---|---|
| Framework | React | 19 |
| Language | TypeScript | 5.x |
| Build Tool | Vite | 6.x |
| Styling | TailwindCSS | 3.4 |
| UI Components | Shadcn/UI | Latest |
| State Management | Zustand | 5.x |
| Server State | TanStack React Query | 5.x |
| HTTP Client | Axios | 1.x |
| Real-time | Socket.io-client | 4.x |
| Animations | Framer Motion | 11.x |
| Routing | React Router DOM | 6.x |
| Forms | React Hook Form | 7.x |
| Validation | Zod | 3.x |
| Icons | Lucide React | Latest |

---

## Project Structure

```
ringwave/
├── .env                          # Environment variables
├── .env.example                  # Environment variables template
├── .vscode/
│   └── settings.json             # VS Code workspace settings
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
└── src/
    ├── main.tsx                  # App entry point
    ├── index.css                 # Global styles + Tailwind directives
    ├── constants/
    │   ├── routes.ts             # All route path constants
    │   ├── theme.ts              # Theme colors and design tokens
    │   └── detection.ts         # Detection state config (shared)
    ├── types/
    │   └── index.ts              # All TypeScript interfaces and types
    ├── lib/
    │   ├── queryClient.ts        # React Query client configuration
    │   └── utils.ts              # Helper utilities (formatDuration, cn, etc.)
    ├── services/
    │   ├── axios.ts              # Axios instance + token refresh interceptor
    │   └── socket.ts             # Socket.io client + event constants
    ├── store/
    │   ├── authStore.ts          # Auth state (user, tokens, login/logout)
    │   ├── callStore.ts          # Call state (active call, mute, detection)
    │   └── notificationStore.ts  # Notification state (unread count, list)
    ├── router/
    │   └── index.tsx             # All routes with protected/guest guards
    ├── components/
    │   ├── ui/                   # Shadcn auto-generated components
    │   ├── layout/
    │   │   ├── AppLayout.tsx     # Main app shell (sidebar + topbar + outlet)
    │   │   ├── AuthLayout.tsx    # Centered auth page wrapper
    │   │   ├── Sidebar.tsx       # Collapsible navigation sidebar
    │   │   └── Topbar.tsx        # Top header with search + profile dropdown
    │   └── routing/
    │       ├── ProtectedRoute.tsx  # Redirects unauthenticated users to login
    │       └── GuestRoute.tsx      # Redirects authenticated users to dashboard
    └── pages/
        ├── SplashPage.tsx        # Animated splash screen
        ├── DashboardPage.tsx     # Main dashboard with stats and activity
        ├── ContactsPage.tsx      # Contact list with tabs and search
        ├── CallHistoryPage.tsx   # All past calls with filters
        ├── DetectionReportsPage.tsx  # AI detection reports per call
        ├── NotificationsPage.tsx # All notifications with read/unread
        ├── ProfilePage.tsx       # User profile and account info
        ├── SettingsPage.tsx      # App settings with toggles
        ├── NotFoundPage.tsx      # 404 error page
        ├── auth/
        │   ├── LoginPage.tsx         # Email + password login
        │   ├── RegisterPage.tsx      # Full registration with validation
        │   ├── OtpPage.tsx           # 6-digit OTP verification
        │   ├── ForgotPasswordPage.tsx # Request password reset email
        │   └── ResetPasswordPage.tsx  # Set new password via token
        └── calls/
            ├── IncomingCallPage.tsx  # Incoming call screen with accept/reject
            ├── OutgoingCallPage.tsx  # Outgoing call dialing screen
            ├── ActiveCallPage.tsx    # Live call with detection timeline
            └── GroupCallPage.tsx     # Group call with participant grid
```

---

## Pages (18 Total)

| # | Page | Route | Access |
|---|---|---|---|
| 1 | Splash | `/` | Public |
| 2 | Login | `/login` | Guest only |
| 3 | Register | `/register` | Guest only |
| 4 | OTP Verification | `/otp` | Guest only |
| 5 | Forgot Password | `/forgot-password` | Guest only |
| 6 | Reset Password | `/reset-password` | Guest only |
| 7 | Dashboard | `/dashboard` | Protected |
| 8 | Contacts | `/contacts` | Protected |
| 9 | Call History | `/call-history` | Protected |
| 10 | Detection Reports | `/detection-reports` | Protected |
| 11 | Notifications | `/notifications` | Protected |
| 12 | Profile | `/profile` | Protected |
| 13 | Settings | `/settings` | Protected |
| 14 | Incoming Call | `/call/incoming` | Protected |
| 15 | Outgoing Call | `/call/outgoing` | Protected |
| 16 | Active Call | `/call/active/:callId` | Protected |
| 17 | Group Call | `/call/group/:callId` | Protected |
| 18 | 404 Not Found | `*` | Public |

---


### Design Principles

- **Dark Mode Only** — Deep navy cybersecurity aesthetic
- **Glassmorphism** — Frosted glass cards with backdrop blur
- **Framer Motion** — Smooth animations on every interaction
- **16px Radius** — Consistent rounded corners throughout
- **Desktop First** — Optimized for desktop, tablet compatible

### Detection Badge States

| State | Color | Meaning |
|---|---|---|
| Genuine | 🟢 Green | Voice verified as authentic |
| Suspicious | 🟡 Yellow | Inconsistencies detected |
| Synthetic | 🔴 Red | AI-generated voice confirmed |
| Analyzing | 🔵 Cyan | Real-time analysis in progress |
| Unknown | ⚪ Gray | Insufficient data |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/ringwave.git
cd ringwave

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_SOCKET_URL=http://localhost:8000
VITE_APP_NAME=RingWave
VITE_APP_VERSION=1.0.0
```

---

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

---

## API Integration

All API endpoints are pre-configured with Axios. Replace the mock data in each page with real API calls when the backend is ready.

### Auth Endpoints

```ts
POST /auth/register       # Create new account
POST /auth/login          # Login with email/password
POST /auth/verify-otp     # Verify OTP code
POST /auth/resend-otp     # Resend OTP code
POST /auth/forgot-password # Request reset email
POST /auth/reset-password  # Set new password
POST /auth/refresh         # Refresh access token
POST /auth/logout          # Logout
```

### Call Endpoints

```ts
GET  /calls               # Get call history
GET  /calls/:id           # Get single call details
POST /calls/initiate      # Start a new call
PUT  /calls/:id/accept    # Accept incoming call
PUT  /calls/:id/reject    # Reject incoming call
PUT  /calls/:id/end       # End active call
```

### Detection Endpoints

```ts
GET  /detections          # Get all detection reports
GET  /detections/:callId  # Get report for specific call
GET  /detections/alerts   # Get flagged detections
```

### Contact Endpoints

```ts
GET    /contacts          # Get all contacts
POST   /contacts/request  # Send contact request
PUT    /contacts/:id/accept  # Accept request
PUT    /contacts/:id/block   # Block contact
DELETE /contacts/:id      # Remove contact
```

---

## 🔄 State Management

### Zustand Stores

| Store | Purpose |
|---|---|
| `authStore` | User info, tokens, login/logout (persisted) |
| `callStore` | Active call, mute state, detection events |
| `notificationStore` | Notifications list, unread count |

### React Query

Used for all server data fetching with:
- 5 minute stale time
- 10 minute cache time
- 2 automatic retries
- No refetch on window focus

---

## Security Features

- **JWT Authentication** — Access + refresh token pattern
- **Auto Token Refresh** — Silent refresh on 401 with request queue
- **Protected Routes** — Auth guard on all app pages
- **Guest Routes** — Redirect authenticated users away from auth pages
- **End-to-End Encryption** — Indicated in UI (backend implementation required)
- **AI Voice Shield** — Real-time deepfake detection on every call

---

## Socket Events

```ts
// Call events
call:incoming           # New incoming call
call:accepted           # Call was accepted
call:rejected           # Call was rejected
call:ended              # Call has ended
call:participant_joined # Someone joined group call
call:participant_left   # Someone left group call

// Detection events
detection:update        # New detection result
detection:alert         # Suspicious/synthetic alert

// Contact events
contact:request         # New contact request
contact:accepted        # Contact request accepted
contact:online          # Contact came online
contact:offline         # Contact went offline

// Notification events
notification:new        # New notification arrived

// WebRTC Signaling
signal:offer            # WebRTC offer
signal:answer           # WebRTC answer
signal:ice              # ICE candidate
```

---

## Routing Architecture

```
/                     → SplashPage (public)
/login                → LoginPage (guest only)
/register             → RegisterPage (guest only)
/otp                  → OtpPage (guest only)
/forgot-password      → ForgotPasswordPage (guest only)
/reset-password       → ResetPasswordPage (guest only)

[Protected - requires auth]
/dashboard            → DashboardPage
/contacts             → ContactsPage
/call-history         → CallHistoryPage
/detection-reports    → DetectionReportsPage
/notifications        → NotificationsPage
/profile              → ProfilePage
/settings             → SettingsPage

[Protected - full screen, no sidebar]
/call/incoming        → IncomingCallPage
/call/outgoing        → OutgoingCallPage
/call/active/:callId  → ActiveCallPage
/call/group/:callId   → GroupCallPage

*                     → NotFoundPage (404)
```

---

## Author

**Mansi**
- Project: RingWave — AI-Powered Secure Audio Calling
- Stack: React 19 + TypeScript + TailwindCSS + Shadcn UI

---

<div align="center">
  <strong>Built with ❤️ using React 19 + TypeScript + TailwindCSS</strong><br/>
  <em>RingWave — Secure · Verified · Trusted</em>
</div>
