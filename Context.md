# Context: Life Planner Application

## Role of the AI Agent

### Purpose

You are an expert full-stack developer AI agent responsible for building **LifePlanner** — a comprehensive personal productivity and life management web application. You act as the sole developer, architect, and quality assurance engineer for this project.

### Core Responsibilities

1. **Code Generation & Implementation** — Write production-quality TypeScript code for both frontend and backend, following modern best practices and the established tech stack conventions.
2. **Architecture Adherence** — Respect the defined system architecture (see `Architecture.md`), database schema, and folder structure. Never introduce conflicting patterns or technologies without explicit approval.
3. **Incremental Development** — Follow the phased `Build_Plan.md` strictly. Complete each phase fully before moving to the next. Each deliverable should be functional, tested, and integrated.
4. **Quality Standards** — Every component must include proper TypeScript types, error handling, loading states, empty states, and responsive design. No placeholder or stub implementations in final deliverables.
5. **Consistency** — Maintain consistent naming conventions, code style, component patterns, and UX patterns throughout the entire application.

### Development Principles

- **Type Safety First** — Use TypeScript strictly. No `any` types. Define interfaces/types for all data structures, API responses, and component props.
- **Server-First Rendering** — Prefer React Server Components. Use `"use client"` only when interactivity (state, effects, event handlers) is required.
- **Optimistic Updates** — For mutations (create, update, delete, drag-and-drop), apply changes to the UI immediately and sync with the server in the background. Revert on failure.
- **Progressive Enhancement** — Core functionality should work without JavaScript where possible. Enhance with client-side interactivity.
- **Mobile-First Design** — Design for mobile screens first, then scale up to desktop. Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).
- **Accessibility** — Use semantic HTML, proper ARIA attributes, keyboard navigation support, and sufficient color contrast.

### What the AI Agent Should Always Do

- Read and follow `SKILL.md` files before generating any document or artifact.
- Reference `PRD.md` for feature requirements and acceptance criteria.
- Reference `Architecture.md` for technical decisions, patterns, and folder structure.
- Reference `Build_Plan.md` for the current phase and task priorities.
- Write complete, runnable code — not pseudocode or partial snippets.
- Include all necessary imports, types, and exports.
- Handle edge cases: empty data, loading, errors, unauthorized access.
- Use the existing component library (shadcn/ui) instead of building custom primitives.

### What the AI Agent Should Never Do

- Skip error handling or loading states.
- Use `any` type or ignore TypeScript errors.
- Install new dependencies without justification.
- Break existing functionality when adding new features.
- Create files outside the established folder structure.
- Hardcode values that should come from environment variables or the database.
- Ignore Row Level Security (RLS) policies or bypass authentication checks.

---

## Application Context

### What is LifePlanner?

LifePlanner is a **premium personal productivity platform** that helps users organize every aspect of their life — work, studies, fitness, finances, content creation, and more — through a unified interface built around Kanban boards, task management, habit tracking, and analytics.

### The Problem

People juggle multiple areas of life simultaneously but lack a single tool that:

- Organizes projects and tasks across different life domains
- Provides visual project management (Kanban) per life area
- Tracks habits and goals alongside tasks
- Delivers analytics on productivity patterns and life balance
- Works seamlessly on both desktop and mobile

Existing tools (Notion, Trello, Todoist) solve parts of this problem but none offer a purpose-built "life operating system" with integrated analytics, habit tracking, and multi-area Kanban management.

### Target Users

| Segment                          | Description                                                            |
| -------------------------------- | ---------------------------------------------------------------------- |
| **Students**                     | Managing coursework, extracurriculars, fitness, and personal projects  |
| **Professionals**                | Balancing work projects, career development, health, and personal life |
| **Freelancers**                  | Tracking multiple client projects alongside personal goals             |
| **Self-improvement enthusiasts** | People actively working on habits, goals, and life optimization        |

### Core Value Proposition

> "One place to plan, track, and optimize every area of your life."

### Key Differentiators

1. **Life Area Organization** — First-class concept of "life areas" as top-level containers, not just folders or tags.
2. **Per-Area Kanban Boards** — Each life area has its own Kanban board(s), not a single shared board.
3. **Cross-Area Dashboard** — Unified home view aggregating tasks, deadlines, and progress across all areas.
4. **Built-in Analytics** — Productivity metrics, completion rates, time tracking, and life balance visualization without third-party integrations.
5. **Habit & Goal Integration** — Habits and goals live alongside projects and tasks, not in a separate app.

### High-Level Feature Map

```
┌─────────────────────────────────────────────────────────────┐
│                        LifePlanner                          │
├─────────────┬─────────────┬──────────────┬─────────────────┤
│  Dashboard  │  Life Areas │   Habits &   │   Analytics &   │
│   (Home)    │  & Kanban   │    Goals     │   Reporting     │
├─────────────┼─────────────┼──────────────┼─────────────────┤
│ • Task feed │ • Area CRUD │ • Habit CRUD │ • Task metrics  │
│ • Filters   │ • Boards    │ • Streaks    │ • Time tracking │
│ • Calendar  │ • Columns   │ • Goal tree  │ • Area balance  │
│ • Quick add │ • Projects  │ • Check-ins  │ • Charts        │
│ • Upcoming  │ • Tasks     │ • Reminders  │ • Exports       │
│   deadlines │ • Drag&Drop │ • Routines   │ • Weekly review │
└─────────────┴─────────────┴──────────────┴─────────────────┘
```

### Tech Stack Summary

| Layer            | Technology                  | Purpose                             |
| ---------------- | --------------------------- | ----------------------------------- |
| Framework        | Next.js 15 (App Router)     | Server components, routing, API     |
| Language         | TypeScript                  | Type safety across the stack        |
| Styling          | Tailwind CSS v4             | Utility-first responsive design     |
| UI Components    | shadcn/ui                   | Accessible, customizable primitives |
| Database         | Supabase (PostgreSQL)       | Managed database + auth + realtime  |
| ORM              | Drizzle ORM                 | Type-safe database queries          |
| State Management | Zustand + TanStack Query v5 | Client state + server cache         |
| Drag & Drop      | @dnd-kit                    | Kanban board interactions           |
| Auth             | Supabase Auth               | Email/password + OAuth              |
| Deployment       | AWS Amplify                 | Hosting + CI/CD                     |

### Database Entity Overview

```
User (auth.users)
  └── Profile (1:1)
       ├── Life Areas (1:N)  →  💼 Work, 🏠 Personal, 💪 Fitness, 💰 Finance, 📚 Learning
       │    ├── Boards (1:N)
       │    │    └── Columns (1:N)
       │    │         └── Projects (1:N)
       │    │              ├── Tasks (1:N)  →  Subtasks (self-ref)
       │    │              ├── Notes (1:N)
       │    │              └── Attachments (1:N)
       │    └── Time Entries (1:N)
       ├── Habits (1:N)
       │    └── Habit Logs (1:N)
       ├── Goals (1:N)  →  Subgoals (self-ref)
       │    └── Goal ↔ Project links (M:N)
       ├── Tags (1:N)
       │    └── Tag ↔ Project links (M:N)
       ├── Templates (1:N)
       └── Notifications (1:N)
```

### Project Repository Structure

```
life-planner/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth pages (login, signup)
│   │   ├── (dashboard)/        # Protected dashboard routes
│   │   │   ├── dashboard/      # Home dashboard
│   │   │   ├── areas/          # Life areas & Kanban boards
│   │   │   ├── habits/         # Habit tracking
│   │   │   ├── goals/          # Goals management
│   │   │   ├── analytics/      # Reports & analytics
│   │   │   └── settings/       # User settings
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── kanban/             # Kanban board components
│   │   ├── tasks/              # Task-related components
│   │   ├── habits/             # Habit-related components
│   │   ├── analytics/          # Chart & metric components
│   │   └── layout/             # Shell, sidebar, nav
│   ├── lib/
│   │   ├── db/
│   │   │   ├── schema.ts       # Drizzle schema definitions
│   │   │   ├── index.ts        # Database client
│   │   │   └── queries/        # Reusable query functions
│   │   ├── supabase/
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   └── middleware.ts   # Auth middleware
│   │   ├── stores/             # Zustand stores
│   │   ├── hooks/              # Custom React hooks
│   │   ├── utils/              # Utility functions
│   │   └── types/              # Shared TypeScript types
│   └── actions/                # Server Actions (mutations)
├── supabase/
│   └── migrations/             # Database migrations
├── public/                     # Static assets
├── drizzle.config.ts
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database (Drizzle direct connection)
DATABASE_URL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
