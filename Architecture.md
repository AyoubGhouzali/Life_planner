# Architecture: LifePlanner Technical Design

**Version:** 1.0  
**Last Updated:** February 2026

---

## 1. System Overview

LifePlanner follows a **modern server-first architecture** built on Next.js 15 App Router with Supabase as the backend-as-a-service platform. The design prioritizes type safety, performance, and developer experience while keeping infrastructure costs minimal through managed services.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                          │
│                                                                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │ React Server │  │  React Client │  │  @dnd-kit (Drag & Drop)  │   │
│  │ Components   │  │  Components   │  │  Zustand (Client State)  │   │
│  │ (RSC)        │  │  (Interactive)│  │  TanStack Query (Cache)  │   │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬─────────────┘   │
│         │                 │                        │                 │
└─────────┼─────────────────┼────────────────────────┼─────────────────┘
          │                 │                        │
          ▼                 ▼                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS 15 SERVER                            │
│                                                                     │
│  ┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │  Server Actions  │  │   Middleware      │  │  Route Handlers  │   │
│  │  (Mutations)     │  │   (Auth Guard)    │  │  (API, if needed)│   │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘   │
│           │                     │                      │             │
│           ▼                     ▼                      ▼             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Drizzle ORM (Type-Safe Queries)            │   │
│  └──────────────────────────────┬───────────────────────────────┘   │
│                                 │                                    │
└─────────────────────────────────┼────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SUPABASE PLATFORM                           │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │  PostgreSQL   │  │  Supabase    │  │  Supabase Realtime       │  │
│  │  Database     │  │  Auth        │  │  (Future: live updates)  │  │
│  │  + RLS        │  │  (JWT)       │  │                          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AWS AMPLIFY (Deployment)                       │
│  CI/CD │ Hosting │ Custom Domain │ SSL │ CDN                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Decisions

### 2.1 Framework: Next.js 15 (App Router)

**Decision:** Use Next.js 15 with the App Router (not Pages Router).

**Rationale:**

- React Server Components reduce client-side JavaScript bundle size.
- Server Actions provide type-safe mutations without building a separate API layer.
- Built-in route-based code splitting and streaming SSR for performance.
- Middleware handles auth guards at the edge before page rendering.
- File-based routing aligns naturally with the app's navigation structure.

**Patterns:**

- Default to Server Components. Add `"use client"` only when the component needs state, effects, or browser APIs.
- Use `loading.tsx` and `error.tsx` files for route-level loading/error states.
- Use route groups `(auth)` and `(dashboard)` to share layouts without affecting URLs.

### 2.2 Database: Supabase (PostgreSQL)

**Decision:** Use Supabase as the database and authentication provider.

**Rationale:**

- Managed PostgreSQL with generous free tier (500MB database, 50K monthly active users).
- Built-in authentication with email/password and OAuth support.
- Row Level Security (RLS) for per-user data isolation at the database level.
- Realtime subscriptions available for future live-update features.
- Dashboard UI for debugging and data management during development.

**Constraints:**

- All tables MUST have RLS policies. No table should be accessible without authentication.
- Direct Supabase client usage is limited to auth operations. Data queries go through Drizzle ORM.
- Service role key is NEVER exposed to the client.

### 2.3 ORM: Drizzle ORM

**Decision:** Use Drizzle ORM for all database operations.

**Rationale:**

- Fully type-safe: schema definitions generate TypeScript types automatically.
- SQL-like query builder feels natural for PostgreSQL.
- Lightweight with no runtime overhead (unlike Prisma).
- Supports migrations and schema push for development.

**Patterns:**

```typescript
// Schema definition → generates types automatically
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  // ...
});

// Inferred types — use these everywhere
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
```

### 2.4 UI: shadcn/ui + Tailwind CSS

**Decision:** Use shadcn/ui as the component library with Tailwind CSS for styling.

**Rationale:**

- shadcn/ui components are copied into the project (not a dependency), giving full control.
- Built on Radix UI primitives — accessible by default (keyboard nav, screen readers, focus management).
- Tailwind CSS enables rapid, consistent styling without CSS-in-JS overhead.
- Both are the de facto standard in the Next.js ecosystem.

**Patterns:**

- Install shadcn/ui components as needed: `npx shadcn-ui@latest add button dialog card`.
- Customize theme via `tailwind.config.ts` and CSS variables.
- Never use inline styles or separate CSS files.
- Use `cn()` utility for conditional class merging.

### 2.5 State Management: Zustand + TanStack Query

**Decision:** Use Zustand for client-side UI state and TanStack Query for server state caching.

**Rationale:**

- **Zustand:** Minimal boilerplate for UI state (sidebar open/closed, active filters, modal state). No context provider nesting.
- **TanStack Query:** Handles server data caching, revalidation, optimistic updates, and background refetching. Eliminates manual loading/error state management.
- Together they create a clean separation: Zustand owns what the client controls, TanStack Query owns what the server controls.

**Patterns:**

```typescript
// Zustand — UI state
export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));

// TanStack Query — server state
export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => fetchTasks(projectId),
  });
}
```

### 2.6 Drag & Drop: @dnd-kit

**Decision:** Use @dnd-kit for all drag-and-drop interactions.

**Rationale:**

- Purpose-built for React with hooks-based API.
- Supports keyboard-accessible drag-and-drop (important for accessibility).
- Handles both sortable lists (reorder tasks) and transferable items (move between columns).
- Performant — uses CSS transforms instead of DOM manipulation.

**Patterns:**

- Use `<DndContext>` at the board level.
- Use `<SortableContext>` for each column.
- Implement `onDragEnd` to call Server Actions for persistence.
- Apply optimistic reordering before the server confirms.

### 2.7 Authentication Flow

**Decision:** Use Supabase Auth with server-side session management via Next.js middleware.

**Flow:**

```
1. User submits login form
2. Server Action calls supabase.auth.signInWithPassword()
3. Supabase returns session (access_token + refresh_token)
4. Tokens stored in HttpOnly cookies (managed by @supabase/ssr)
5. Middleware reads cookies on every request
6. If no valid session → redirect to /login
7. If valid session → pass user to Server Components via headers
```

**Auth Architecture:**

```
src/lib/supabase/
├── client.ts       # createBrowserClient() — for client components
├── server.ts       # createServerClient() — for server components & actions
└── middleware.ts    # Session refresh logic for Next.js middleware
```

---

## 3. Database Design

### 3.1 Schema Overview

The database consists of 18 tables organized into 5 domains:

```
CORE                    PRODUCTIVITY           TRACKING
─────────────           ─────────────          ─────────────
profiles                goals                  time_entries
life_areas              goal_projects          habits
boards                  templates              habit_logs
columns                                        task_events
projects                ORGANIZATION
tasks                   ─────────────
notes                   tags
attachments             project_tags
                        notifications
```

### 3.2 Entity Relationship Summary

```
profiles (1) ──── (N) life_areas (1) ──── (N) boards (1) ──── (N) columns (1) ──── (N) projects
                          │                                                              │
                          │                                                    ┌─────────┼─────────┐
                          │                                                    │         │         │
                          │                                                  tasks    notes   attachments
                          │                                                    │
                          │                                                  subtasks (self-ref)
                          │                                                    │
                          │                                                  task_events
                          │
profiles (1) ──── (N) habits (1) ──── (N) habit_logs
profiles (1) ──── (N) goals (1) ──── (N) goal_projects ──── (N) projects
profiles (1) ──── (N) tags  (M) ──── (N) project_tags  ──── (N) projects
profiles (1) ──── (N) time_entries
profiles (1) ──── (N) notifications
profiles (1) ──── (N) templates
```

### 3.3 Key Schema Decisions

| Decision                          | Rationale                                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| UUID primary keys                 | Enables client-side ID generation for optimistic updates. No sequential IDs to leak data volume.            |
| `position` integer fields         | For drag-and-drop ordering of areas, columns, projects, and tasks. Re-indexed on reorder.                   |
| JSON `settings` on profiles       | Flexible storage for user preferences (theme, defaults) without schema migrations.                          |
| JSON `tags` on projects           | Quick filtering without joins for simple tag display. Normalized `project_tags` table for advanced queries. |
| `is_process` boolean on projects  | Distinguishes recurring processes (e.g., "Weekly Review") from one-time projects.                           |
| Self-referencing `parent_task_id` | Enables one level of subtasks without a separate table.                                                     |
| `wip_limit` on columns            | Enforces work-in-progress limits for Kanban best practices.                                                 |

### 3.4 Row Level Security (RLS)

Every table enforces RLS with the following pattern:

```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data
CREATE POLICY "Users can manage own data" ON table_name
  FOR ALL
  USING (user_id = auth.uid());

-- For nested tables (boards, columns, projects, tasks):
-- Join up to the parent that has user_id
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN columns c ON p.column_id = c.id
      JOIN boards b ON c.board_id = b.id
      JOIN life_areas a ON b.area_id = a.id
      WHERE p.id = tasks.project_id
      AND a.user_id = auth.uid()
    )
  );
```

### 3.5 Database Triggers

| Trigger                | Action                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| `on_auth_user_created` | Auto-creates profile + 5 default life areas                         |
| `on_life_area_created` | Auto-creates a default board + 3 columns (To Do, In Progress, Done) |
| `on_task_completed`    | Sets `completed_at` timestamp; creates task_event record            |
| `on_row_updated`       | Auto-updates `updated_at` timestamp on all tables                   |

---

## 4. Application Architecture

### 4.1 Folder Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group (no sidebar)
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx            # Centered card layout
│   ├── (dashboard)/              # Dashboard route group (with sidebar)
│   │   ├── dashboard/page.tsx    # Home dashboard
│   │   ├── areas/
│   │   │   ├── page.tsx          # All areas grid
│   │   │   └── [areaId]/
│   │   │       ├── page.tsx      # Area detail with Kanban
│   │   │       └── [boardId]/page.tsx  # Specific board
│   │   ├── habits/page.tsx
│   │   ├── goals/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx            # Sidebar + header shell
│   ├── layout.tsx                # Root layout (providers)
│   ├── page.tsx                  # Landing page (public)
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui primitives (auto-generated)
│   ├── layout/
│   │   ├── app-sidebar.tsx       # Navigation sidebar
│   │   ├── header.tsx            # Top bar with search, notifications
│   │   ├── mobile-nav.tsx        # Bottom nav for mobile
│   │   └── theme-toggle.tsx
│   ├── kanban/
│   │   ├── board.tsx             # Board container with DnD context
│   │   ├── column.tsx            # Sortable column
│   │   ├── project-card.tsx      # Draggable project card
│   │   ├── add-column.tsx        # New column form
│   │   └── add-project.tsx       # New project form
│   ├── tasks/
│   │   ├── task-list.tsx         # Task checklist
│   │   ├── task-item.tsx         # Single task row
│   │   ├── task-detail.tsx       # Full task editor
│   │   └── quick-add-task.tsx    # Inline task creation
│   ├── dashboard/
│   │   ├── today-tasks.tsx       # Today's task widget
│   │   ├── upcoming-deadlines.tsx
│   │   ├── summary-stats.tsx     # Key metrics cards
│   │   ├── habit-checklist.tsx   # Daily habits widget
│   │   └── recent-activity.tsx
│   ├── habits/
│   │   ├── habit-card.tsx
│   │   ├── habit-calendar.tsx    # Heatmap view
│   │   └── habit-form.tsx
│   ├── analytics/
│   │   ├── completion-chart.tsx
│   │   ├── area-distribution.tsx
│   │   ├── life-balance-radar.tsx
│   │   └── time-chart.tsx
│   └── shared/
│       ├── empty-state.tsx       # Reusable empty state
│       ├── loading-skeleton.tsx  # Reusable skeleton
│       ├── confirm-dialog.tsx    # Reusable confirmation
│       └── error-boundary.tsx
│
├── lib/
│   ├── db/
│   │   ├── schema.ts             # Drizzle table definitions
│   │   ├── index.ts              # Database client export
│   │   └── queries/
│   │       ├── areas.ts          # Life area queries
│   │       ├── boards.ts         # Board queries
│   │       ├── projects.ts       # Project queries
│   │       ├── tasks.ts          # Task queries
│   │       ├── habits.ts         # Habit queries
│   │       ├── goals.ts          # Goal queries
│   │       └── analytics.ts      # Analytics aggregation queries
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   ├── server.ts             # Server Supabase client
│   │   └── middleware.ts         # Auth middleware helper
│   ├── stores/
│   │   ├── ui-store.ts           # Sidebar, modals, filters
│   │   └── kanban-store.ts       # Board optimistic state
│   ├── hooks/
│   │   ├── use-areas.ts          # Area data hooks
│   │   ├── use-board.ts          # Board + columns + projects
│   │   ├── use-tasks.ts          # Task CRUD hooks
│   │   └── use-habits.ts         # Habit hooks
│   ├── validations/
│   │   ├── area.ts               # Zod schemas for areas
│   │   ├── project.ts            # Zod schemas for projects
│   │   ├── task.ts               # Zod schemas for tasks
│   │   └── habit.ts              # Zod schemas for habits
│   ├── utils/
│   │   ├── cn.ts                 # Class name merger (clsx + twMerge)
│   │   ├── dates.ts              # Date formatting helpers
│   │   ├── colors.ts             # Area/priority color maps
│   │   └── constants.ts          # App-wide constants
│   └── types/
│       └── index.ts              # Shared types (enums, utility types)
│
├── actions/
│   ├── area-actions.ts           # Life area mutations
│   ├── board-actions.ts          # Board mutations
│   ├── project-actions.ts        # Project mutations
│   ├── task-actions.ts           # Task mutations
│   ├── habit-actions.ts          # Habit mutations
│   ├── goal-actions.ts           # Goal mutations
│   └── auth-actions.ts           # Auth mutations
│
└── middleware.ts                  # Next.js middleware (auth guard)
```

### 4.2 Data Flow Patterns

#### Read Path (Server Components)

```
Page (RSC) → lib/db/queries/areas.ts → Drizzle → PostgreSQL → Data
                                                                 ↓
                                                    Render HTML on server
                                                                 ↓
                                                    Stream to client
```

#### Write Path (Server Actions + Optimistic Updates)

```
User Action (click, drag)
    ↓
Client Component calls Server Action
    ↓ (simultaneously)
    ├── Optimistic: TanStack Query updates cache immediately
    └── Server: actions/project-actions.ts → Drizzle → PostgreSQL
                    ↓
              Revalidate path / return data
                    ↓
              TanStack Query reconciles with server response
              (rollback if error)
```

#### Optimistic Update Pattern

```typescript
// hooks/use-tasks.ts
export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleTask, // Server Action
    onMutate: async (taskId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot previous state
      const previous = queryClient.getQueryData(["tasks"]);

      // Optimistically update
      queryClient.setQueryData(["tasks"], (old) =>
        old.map((t) =>
          t.id === taskId ? { ...t, is_completed: !t.is_completed } : t,
        ),
      );

      return { previous };
    },
    onError: (err, taskId, context) => {
      // Rollback on error
      queryClient.setQueryData(["tasks"], context.previous);
      toast.error("Failed to update task");
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
```

### 4.3 Server Action Pattern

All mutations follow this pattern:

```typescript
// actions/task-actions.ts
"use server";

import { createServerClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { taskSchema } from "@/lib/validations/task";
import { revalidatePath } from "next/cache";

export async function createTask(formData: FormData) {
  // 1. Authenticate
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // 2. Validate input
  const parsed = taskSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.message);

  // 3. Execute query
  const [task] = await db
    .insert(tasks)
    .values({
      ...parsed.data,
      // RLS ensures user can only insert into their own projects
    })
    .returning();

  // 4. Revalidate cache
  revalidatePath(`/areas/${task.areaId}`);

  return task;
}
```

---

## 5. Middleware & Auth Guard

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // Create Supabase client with cookie handling
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect unauthenticated users
  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## 6. Deployment Architecture

### AWS Amplify Configuration

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - corepack enable
        - pnpm install --frozen-lockfile
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: .next
    files:
      - "**/*"
  cache:
    paths:
      - .next/cache/**/*
      - node_modules/**/*
```

### Environment Variables (Amplify Console)

```
NEXT_PUBLIC_SUPABASE_URL      → Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY → Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY     → Supabase service role key (server only)
DATABASE_URL                  → Supabase direct connection string
NEXT_PUBLIC_APP_URL           → Production URL (https://yourapp.com)
```

### CI/CD Flow

```
Developer pushes to main
        ↓
AWS Amplify detects push
        ↓
Build: pnpm install → pnpm build
        ↓
Deploy: Atomic deployment with instant rollback
        ↓
CDN: CloudFront distributes static assets globally
        ↓
Live: Application available at custom domain
```

---

## 7. Performance Strategy

| Technique              | Implementation                                                           |
| ---------------------- | ------------------------------------------------------------------------ |
| **Server Components**  | Default to RSC. Client JS only for interactive elements.                 |
| **Streaming SSR**      | Use `<Suspense>` boundaries to stream dashboard widgets independently.   |
| **Route Prefetching**  | Next.js `<Link>` auto-prefetches visible routes.                         |
| **Image Optimization** | `next/image` for all images with proper width/height/blur placeholders.  |
| **Database Indexes**   | Indexes on all foreign keys, position fields, and common filter columns. |
| **Query Optimization** | Use `select()` to fetch only needed columns. Avoid N+1 with joins.       |
| **Bundle Splitting**   | Dynamic `import()` for heavy components (charts, rich text editor).      |
| **Optimistic Updates** | UI responds instantly; server syncs in background.                       |

---

## 8. Error Handling Strategy

### Client-Side

```typescript
// app/(dashboard)/areas/[areaId]/error.tsx
'use client';

export default function AreaError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
```

### Server Actions

All Server Actions return a consistent result shape:

```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### Toast Notifications

Use `sonner` for non-blocking feedback:

```typescript
// Success: toast after optimistic update confirms
toast.success("Task completed");

// Error: toast after optimistic rollback
toast.error("Failed to update task. Please try again.");
```

---

## 9. Security Checklist

| Layer                     | Control                                                                      |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Database**              | RLS enabled on ALL tables. No table without policies.                        |
| **Auth**                  | Supabase Auth with HttpOnly cookies. No tokens in localStorage.              |
| **Server Actions**        | Every action verifies `auth.uid()` before proceeding.                        |
| **Input Validation**      | Zod schemas validate all user input server-side.                             |
| **Environment Variables** | Service role key only on server. `NEXT_PUBLIC_` prefix only for safe values. |
| **CORS**                  | Supabase configured to accept requests only from the app domain.             |
| **Rate Limiting**         | Auth endpoints rate-limited via Supabase. Custom limits on heavy operations. |
| **SQL Injection**         | Drizzle ORM parameterizes all queries. No raw SQL with user input.           |
