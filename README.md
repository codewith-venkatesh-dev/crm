# Mini CRM (Customer Relationship Management) Web Application

A clean, high-performance, production-minded **Mini CRM application** built for internal business lead and sales pipeline management.

---

## 🌟 Overview

The Mini CRM provides a unified platform to track customer leads from initial contact to deal closure. Built with **React 18**, **TypeScript**, **Express.js**, **Prisma ORM**, and **MySQL**, it prioritizes high usability, clean visual design, low latency, and robust relational modeling.

---

## 🚀 Key Features

### 1. Lead Management
- **Full CRUD operations**: Add, view, edit, and delete leads with confirmation dialogs.
- **Predefined Lead Sources**: Website, Referral, LinkedIn, Cold Email, WhatsApp, Phone Call, Advertisement, and Other.
- **Pipeline Stages**: `NEW`, `CONTACTED`, `NEGOTIATING`, `CLOSED`, and `LOST`.
- **Search & Filter**: Debounced search by name, company, email, or phone; filter by status, source, or follow-up urgency; dynamic sorting.

### 2. Follow-ups & Reminders
- **Reminders**: Schedule follow-ups with due dates, times, descriptions, and interaction types (`CALL`, `EMAIL`, `MEETING`, `WHATSAPP`, `TASK`, `OTHER`).
- **Completion Toggling**: Mark follow-ups complete with timestamp tracking.
- **Visual Status Badges**: Automatic highlight for Overdue, Due Today, and Upcoming tasks.

### 3. Pipeline View (Kanban Board)
- Drag-and-drop and dropdown-based stage progression between `NEW`, `CONTACTED`, `NEGOTIATING`, and `CLOSED`.
- Visual cards displaying lead name, company, source badge, and next follow-up date.

### 4. Interactive Activity Timeline
- Automatic audit stream logging system events, status transitions, follow-up schedules, and custom user notes.

### 5. Dashboard Metrics
- Summary metric cards for total leads, stage breakdown counts, overdue tasks, and tasks due today.
- Widgets for quick lead access and imminent follow-up reminders.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack React Query v5, React Router v6, React Hook Form, Zod, Lucide Icons, `@hello-pangea/dnd` |
| **Backend** | Node.js, Express.js, TypeScript, Zod request validation |
| **Database & ORM**| MySQL 8 / MariaDB, Prisma ORM v5 |

---

## 📁 Project Structure

```text
mini-crm/
├── client/                     # Frontend Vite + React Application
│   ├── src/
│   │   ├── components/         # Reusable UI, Badges, Modals, Toasts
│   │   │   ├── common/         # Badge, Modal, Toast, ConfirmDialog
│   │   │   ├── layout/         # MainLayout, Sidebar
│   │   │   ├── leads/          # LeadFormModal, FollowUpModal, NoteModal
│   │   │   └── pipeline/       # KanbanBoard
│   │   ├── pages/              # DashboardPage, LeadsPage, PipelinePage, LeadDetailPage
│   │   ├── services/           # REST API client wrapper (api.ts)
│   │   ├── types/              # CRM TypeScript interfaces (crm.ts)
│   │   ├── App.tsx             # TanStack Query & Router Setup
│   │   ├── main.tsx            # DOM Entrypoint
│   │   └── index.css           # Tailwind & Custom Styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                     # Backend Express REST API Server
│   ├── prisma/
│   │   ├── schema.prisma       # Relational Schema & Enums
│   │   └── seed.ts             # Realistic 8-Lead Seed Data Script
│   ├── src/
│   │   ├── controllers/        # Lead, FollowUp, Activity & Dashboard Controllers
│   │   ├── middleware/         # Zod Validation & Central Error Handling
│   │   ├── routes/             # Express API Routers
│   │   ├── lib/                # Prisma Singleton Instance
│   │   └── server.ts           # Express Application Bootstrap
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── package.json                # Root package for workspace commands
└── README.md                   # Project Documentation
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **NPM**: v9.0.0 or higher
- **MySQL**: Local MySQL 8.0 server or MariaDB (running on port `3306`)

---

### Step 1: Clone & Configure Environment

```bash
cd f:/crm/server
cp .env.example .env
```

Ensure `server/.env` contains your MySQL database connection string:

```env
DATABASE_URL="mysql://root:@localhost:3306/mini_crm"
PORT=5000
```

---

### Step 2: Install Backend & Push Database Schema

```bash
cd f:/crm/server
npm install
npm run db:push
```

This will automatically create the `mini_crm` database in MySQL and synchronize all Prisma models (`Lead`, `FollowUp`, `Activity`).

---

### Step 3: Seed Sample Data

```bash
npm run db:seed
```

This populates 8 sample leads with overdue follow-ups, upcoming meetings, closed deals, and activity histories.

---

### Step 4: Install Frontend Dependencies

```bash
cd f:/crm/client
npm install
```

---

### Step 5: Start Development Servers

Run backend and frontend simultaneously:

**Terminal 1 (Backend API Server - Port 5000):**
```bash
cd f:/crm/server
npm run dev
```

**Terminal 2 (Frontend App - Port 3000):**
```bash
cd f:/crm/client
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 🔌 REST API Overview

### Leads
- `GET /api/leads`: List leads (Supports `search`, `status`, `source`, `followUpState`, `sortBy`, `sortOrder`, `page`, `limit`)
- `GET /api/leads/:id`: Fetch lead details with follow-ups and activity timeline
- `POST /api/leads`: Create lead
- `PUT /api/leads/:id`: Update lead
- `PATCH /api/leads/:id/status`: Update status stage (`NEW`, `CONTACTED`, `NEGOTIATING`, `CLOSED`, `LOST`)
- `DELETE /api/leads/:id`: Delete lead (cascading deletes for follow-ups & activities)

### Follow-ups
- `GET /api/leads/:leadId/follow-ups`: List follow-ups for lead
- `POST /api/leads/:leadId/follow-ups`: Schedule follow-up
- `PUT /api/follow-ups/:id`: Update follow-up details
- `PATCH /api/follow-ups/:id/complete`: Toggle completion status
- `DELETE /api/follow-ups/:id`: Delete follow-up

### Activities
- `GET /api/leads/:leadId/activities`: List activity logs
- `POST /api/leads/:leadId/activities`: Log interaction note/call/meeting summary

### Dashboard
- `GET /api/dashboard/summary`: Return lead counts, stage breakdown, overdue tasks, and recent items

---

## 🎨 Design Decisions

1. **Why MySQL & Prisma ORM?**
   - MySQL provides strict relational integrity, indexed queries, and reliable foreign-key constraints. Prisma ORM grants type-safe database queries across the application, automated migration workflows, and seamless TypeScript integration.

2. **How Leads, Follow-ups, and Activities Relate:**
   - A `Lead` has a one-to-many relationship with `FollowUp` and `Activity`.
   - When a follow-up is completed or status changes, an `Activity` record is created automatically to preserve a complete interaction timeline.
   - Deleting a lead cleanly triggers a cascading delete across associated follow-ups and activities.

3. **Avoiding Over-engineering:**
   - Intentionally omitted multi-tenant authentication, email delivery queues, and heavy state managers in favor of native React state combined with **TanStack React Query**, keeping the application lightweight, fast, and easy to maintain.

---

## 🔮 Future Improvements

- CSV export / import for lead lists.
- Email template generation.
- Automated email notification triggers for overdue follow-up tasks.
