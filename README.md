# Mini CRM (Customer Relationship Management) Web Application

A clean, high-performance, production-minded **Mini CRM application** built for internal business lead, user rights, and sales pipeline management.

---

## 🌟 Overview

The Mini CRM provides a unified platform to track customer leads from initial contact to deal closure. Built with **React 18**, **TypeScript**, **Express.js**, **Prisma ORM**, and **MySQL**, it includes **JWT authentication**, **User Rights privileges** (`userRight = 1` for Super Admin, `userRight = 0` for Normal User), **Lead & Follow-up ownership**, and **Follow-up closure outcome notes**.

---

## 🚀 Key Features

### 1. User Rights & JWT Authentication (`userRight`)
- **JWT Protection**: Secure API request authorization header (`Authorization: Bearer <token>`).
- **Super Admin Privilege (`userRight = 1`)**: Full control over User Management (`/users`), user creation, and role assignments.
- **Normal User Privilege (`userRight = 0`)**: Standard access to leads, pipeline, and follow-ups.

### 2. Lead & Ownership Management
- **Full CRUD**: Add, view, edit, and delete leads with confirmation dialogs.
- **Lead Ownership**: Tracks who added each lead (`createdById`).
- **Predefined Lead Sources**: Website, Referral, LinkedIn, Cold Email, WhatsApp, Phone Call, Advertisement, and Other.
- **Pipeline Stages**: `NEW`, `CONTACTED`, `NEGOTIATING`, `CLOSED`, and `LOST`.

### 3. Follow-ups & Closure Outcome Notes
- **Task Scheduling**: Schedule follow-ups with due dates, times, descriptions, types, and assigned sales agents (`assignedToId`).
- **Outcome Notes on Closure**: When marking a follow-up complete, prompt modal captures *what happened in that follow-up* (`completionNote`), saving the outcome to the record and timeline.
- **Visual Status Badges**: Overdue, Due Today, and Upcoming task indicators.

### 4. Pipeline View (Kanban Board)
- Drag-and-drop and dropdown-based stage progression between `NEW`, `CONTACTED`, `NEGOTIATING`, and `CLOSED`.
- Card displays for lead name, company, source badge, assigned agent, and next follow-up date.

### 5. Interactive Activity Timeline & Dashboard
- Automatic audit stream logging system events, status transitions, follow-up outcomes, and custom user notes.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack React Query v5, React Router v6, React Hook Form, Zod, Lucide Icons, `@hello-pangea/dnd` |
| **Backend** | Node.js, Express.js, TypeScript, JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Zod validation |
| **Database & ORM**| MySQL 8 / MariaDB, Prisma ORM v5 |

---

## ⚡ Quick Test Credentials

- **Super Admin (`userRight = 1`)**: `admin@crm.com` / `password123`
- **Sales Agent (`userRight = 0`)**: `agent@crm.com` / `password123`

---

## 📘 User Guide & Deployment Manual

For full instructions on operating the CRM, managing user rights, recording follow-up outcome notes, and deploying to a production server with PM2 and Nginx, refer to:
👉 **[MANUAL.md](file:///f:/crm/MANUAL.md)**
