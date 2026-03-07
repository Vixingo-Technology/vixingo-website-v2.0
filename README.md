# Vixingo — Your Vision, Our Execution

> AI Automation · Full-Stack Development · AI Integration

A production-ready company website & internal platform built with **Next.js 16**, **Tailwind CSS v4**, **Prisma**, and **NextAuth.js**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Private-red)

---

## Features

### Public Website

- **Landing page** — Hero, services teaser, portfolio showcase, blog, team preview, SaaS waitlist, contact CTA
- **Services** — AI Automation, Full-Stack Development, AI Integration
- **Portfolio** — Filterable project gallery with detail pages
- **Blog** — Static blog with MDX-ready slugs
- **Team** — Team directory with roles & bios
- **Contact** — Form with API submission
- **Waitlist** — Email capture for SaaS launch
- **AI Chatbot (Vix)** — Floating chat widget with knowledge-base responses

### Employee Portal (Auth Required)

- **Dashboard** — Stats, recent tasks, activity feed
- **Task Manager** — Kanban / list / calendar views with drag-and-drop
- **Case Studies** — CRUD with visibility controls (Public / Internal / Confidential)
- **Blog CMS** — Rich text editor (Tiptap) for creating & managing posts
- **Portfolio Manager** — CRUD with featured toggle & category filters

### Admin Panel (Admin Role Only)

- **Admin Dashboard** — KPIs, recent submissions, waitlist chart
- **Employee Management** — Invite, role editing, activate/deactivate
- **Submissions Inbox** — Contact form emails with read/reply/archive workflow
- **Waitlist Management** — Table with CSV export, bulk actions, source breakdown
- **Settings** — Company info, social links, notifications, chatbot config

### Design System

- Dark mode (default) + Light mode toggle
- Gold accent palette (`#C9A84C`)
- 4 Google Fonts: Bebas Neue, Syne, DM Sans, JetBrains Mono
- Scroll reveal animations, noise overlay textures, gold gradient text

---

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack)      |
| Language   | TypeScript 5                            |
| Styling    | Tailwind CSS v4 + CSS custom properties |
| Auth       | NextAuth.js v4 (Credentials, JWT)       |
| Database   | Prisma 5 + PostgreSQL                   |
| Rich Text  | Tiptap                                  |
| Animations | Framer Motion, CSS keyframes            |
| Icons      | Phosphor Icons                          |
| Forms      | React Hook Form + Zod                   |
| Toasts     | Sonner                                  |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (optional — app works with demo data)

### Installation

```bash
# Clone the repository
git clone https://github.com/Vixingo-Technology/vixingo-website-v2.0.git
cd vixingo-website-v2.0

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Generate Prisma client
npx prisma generate

# Push database schema (requires PostgreSQL)
npm run db:push

# Seed demo data (optional)
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Use Supabase As The Database

This project already uses PostgreSQL via Prisma, so Supabase can be used without changing the schema provider.

1. Create a Supabase project in the dashboard.
2. Go to `Project Settings -> Database -> Connection string`.
3. Copy both connection strings:
    - Pooled connection (transaction/pooler, port `6543`) for `DATABASE_URL`
    - Direct connection (port `5432`) for `DIRECT_URL`
4. Update `.env.local` with those values (see `.env.example` for format).
   Prisma 7 reads these from `prisma.config.ts` (not from `schema.prisma`).
5. Apply schema to Supabase:

```bash
npm run db:push
```

6. (Optional) Seed demo data:

```bash
npm run db:seed
```

If your password contains special characters, URL-encode it before putting it in the connection string.

### Demo Accounts

| Role            | Email              | Password     |
| --------------- | ------------------ | ------------ |
| Admin           | admin@vixingo.com  | Admin123!    |
| Senior Employee | jordan@vixingo.com | Employee123! |
| Employee        | sam@vixingo.com    | Employee123! |

---

## Scripts

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `npm run dev`         | Start dev server (Turbopack)   |
| `npm run build`       | Production build               |
| `npm run start`       | Start production server        |
| `npm run lint`        | Run ESLint                     |
| `npm run db:push`     | Push Prisma schema to database |
| `npm run db:seed`     | Seed database with demo data   |
| `npm run db:studio`   | Open Prisma Studio             |
| `npm run db:generate` | Regenerate Prisma client       |

---

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin panel pages
│   ├── api/                # API routes (auth, chat, contact, waitlist)
│   ├── blog/               # Blog pages + CMS
│   ├── dashboard/          # Employee dashboard
│   ├── tasks/              # Task manager
│   └── ...                 # Other public pages
├── components/
│   ├── chat/               # AI chatbot widget
│   ├── editor/             # Tiptap rich text editor
│   ├── layout/             # Navbar, Footer, Sidebar, ThemeToggle
│   ├── providers/          # Theme & Auth context providers
│   ├── sections/           # Landing page sections
│   └── ui/                 # Reusable UI components
├── lib/                    # Utilities (cn, prisma client)
├── prisma/                 # Database schema & seed
└── public/                 # Static assets (logo, icons)
```

---

## Deployment

Deploy to [Vercel](https://vercel.com) with zero config:

```bash
npx vercel
```

Set environment variables in the Vercel dashboard.

---

## License

Private — © Vixingo Technology
