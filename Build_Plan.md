# Build Plan: LifePlanner — 6-Phase Development Checklist

**Version:** 1.0  
**Last Updated:** February 2026  

---

## Overview

This plan breaks the LifePlanner build into **6 sequential phases**. Each phase produces a working, testable increment of the application. Complete every checklist item in a phase before moving to the next.

**Estimated Total Duration:** 18–24 weeks (part-time solo developer)

```
Phase 1 ──→ Phase 2 ──→ Phase 3 ──→ Phase 4 ──→ Phase 5 ──→ Phase 6
Foundation   Kanban &     Dashboard    Habits,      Analytics    Polish,
& Auth       Task Mgmt    & Home       Goals &      & Reporting  Deploy &
                                       Notes                     Launch
```

---

## Phase 1: Foundation & Authentication (Weeks 1–3)

> **Goal:** Working Next.js app with authentication, database schema, and app shell. A user can sign up, log in, and see an empty dashboard with a sidebar.

### 1.1 Project Setup

- [ ] Initialize Next.js 15 project with TypeScript, Tailwind CSS, pnpm
- [ ] Install and configure shadcn/ui (init + add: button, card, input, label, dialog, dropdown-menu, avatar, separator, skeleton, toast)
- [ ] Set up folder structure per `Architecture.md`
- [ ] Configure `tailwind.config.ts` with custom theme colors and fonts
- [ ] Set up `globals.css` with CSS variables for light/dark theme
- [ ] Configure ESLint + Prettier with consistent rules
- [ ] Initialize Git repository with `.gitignore`
- [ ] Create `.env.local` with Supabase credentials (add `.env.local` to `.gitignore`)

### 1.2 Supabase & Database

- [ ] Create Supabase project
- [ ] Configure Drizzle ORM (`drizzle.config.ts`, `src/lib/db/index.ts`)
- [ ] Define full database schema in `src/lib/db/schema.ts` (all 18 tables)
- [ ] Push schema to Supabase with `pnpm db:push`
- [ ] Create and apply RLS policies for ALL tables via SQL Editor
- [ ] Create database trigger: `on_auth_user_created` → auto-create profile + 5 default life areas
- [ ] Create database trigger: `on_life_area_created` → auto-create default board + 3 columns
- [ ] Create database trigger: `on_row_updated` → auto-update `updated_at`
- [ ] Verify triggers by creating a test user in Supabase Auth dashboard
- [ ] Set up Drizzle Studio for development debugging (`pnpm db:studio`)

### 1.3 Authentication

- [ ] Create Supabase client utilities:
  - [ ] `src/lib/supabase/client.ts` (browser client)
  - [ ] `src/lib/supabase/server.ts` (server client)
- [ ] Create `middleware.ts` with auth guard (protect `/dashboard/*` routes)
- [ ] Build auth Server Actions in `src/actions/auth-actions.ts`:
  - [ ] `signUp(formData)` — email/password registration
  - [ ] `signIn(formData)` — email/password login
  - [ ] `signOut()` — logout and redirect
  - [ ] `resetPassword(formData)` — password reset email
- [ ] Build auth pages:
  - [ ] `(auth)/login/page.tsx` — Login form with validation
  - [ ] `(auth)/signup/page.tsx` — Signup form with validation
  - [ ] `(auth)/forgot-password/page.tsx` — Password reset form
  - [ ] `(auth)/layout.tsx` — Centered card layout
- [ ] Implement form validation with Zod schemas
- [ ] Add loading states to all auth forms
- [ ] Add error display for auth failures (wrong password, email taken, etc.)
- [ ] Test full auth flow: signup → email confirm → login → dashboard → logout

### 1.4 App Shell & Layout

- [ ] Build root layout with providers (`src/app/layout.tsx`):
  - [ ] ThemeProvider (next-themes)
  - [ ] TanStack QueryClientProvider
  - [ ] Toaster (sonner)
- [ ] Build dashboard layout (`src/app/(dashboard)/layout.tsx`):
  - [ ] Sidebar component with:
    - [ ] App logo/title
    - [ ] Navigation links (Dashboard, Areas, Habits, Goals, Analytics, Settings)
    - [ ] Life areas list (fetched from DB) with icons and colors
    - [ ] Collapse/expand toggle
    - [ ] User avatar + sign out at bottom
  - [ ] Header component with:
    - [ ] Page title (dynamic based on route)
    - [ ] Search placeholder (non-functional for now)
    - [ ] Theme toggle (light/dark)
    - [ ] Notification bell placeholder
  - [ ] Mobile responsive: sidebar → hamburger menu or bottom nav
- [ ] Build placeholder dashboard page (`dashboard/page.tsx`) with "Welcome" message
- [ ] Build landing page (`page.tsx`) with sign-in/sign-up CTAs
- [ ] Create shared components:
  - [ ] `components/shared/empty-state.tsx`
  - [ ] `components/shared/loading-skeleton.tsx`
  - [ ] `components/shared/confirm-dialog.tsx`

### 1.5 Phase 1 Verification

- [ ] User can sign up and is redirected to dashboard
- [ ] Profile and 5 default life areas are auto-created in database
- [ ] User can log in and see the sidebar with their life areas
- [ ] User can log out and is redirected to login
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Dark mode toggle works
- [ ] Mobile layout is usable (sidebar collapses)

---

## Phase 2: Life Areas & Kanban Board (Weeks 4–8)

> **Goal:** Full Kanban board experience. User can manage life areas, create projects on boards, drag cards between columns, and open project detail views.

### 2.1 Life Areas CRUD

- [ ] Create Zod validation schemas (`src/lib/validations/area.ts`)
- [ ] Create Server Actions (`src/actions/area-actions.ts`):
  - [ ] `createArea(formData)` — with name, icon, color
  - [ ] `updateArea(id, formData)` — edit name, icon, color
  - [ ] `deleteArea(id)` — with cascade confirmation
  - [ ] `reorderAreas(orderedIds)` — update positions
  - [ ] `archiveArea(id)` — toggle archive status
- [ ] Create DB query functions (`src/lib/db/queries/areas.ts`):
  - [ ] `getAreas(userId)` — all non-archived areas, ordered by position
  - [ ] `getAreaById(areaId)` — single area with board count
  - [ ] `getAreaWithBoards(areaId)` — area + boards + columns + project counts
- [ ] Build UI:
  - [ ] Areas overview page (`/areas/page.tsx`) — grid of area cards with stats
  - [ ] Create area dialog — form with icon picker and color picker
  - [ ] Edit area dialog — prefilled form
  - [ ] Delete area confirmation dialog (warns about cascade)
  - [ ] Area card component — shows name, icon, color, project count, last activity
- [ ] Update sidebar to dynamically render areas from database
- [ ] Implement drag-to-reorder areas in sidebar

### 2.2 Kanban Board

- [ ] Create Server Actions (`src/actions/board-actions.ts`):
  - [ ] `createBoard(areaId, formData)` — new board with default columns
  - [ ] `updateBoard(id, formData)` — rename board
  - [ ] `deleteBoard(id)` — cascade delete
- [ ] Create column Server Actions (`src/actions/column-actions.ts`):
  - [ ] `createColumn(boardId, formData)` — name, color, wip_limit
  - [ ] `updateColumn(id, formData)` — edit column
  - [ ] `deleteColumn(id, moveToColumnId)` — move projects, then delete
  - [ ] `reorderColumns(orderedIds)` — update positions
- [ ] Create DB query functions:
  - [ ] `getBoardWithColumns(boardId)` — board + columns + projects (ordered)
  - [ ] `getColumnsForBoard(boardId)` — columns with project counts
- [ ] Build Kanban components (`src/components/kanban/`):
  - [ ] `board.tsx` — DnD context, renders columns horizontally, horizontal scroll on mobile
  - [ ] `column.tsx` — Sortable column with header (name, count, WIP indicator), droppable zone
  - [ ] `project-card.tsx` — Draggable card showing: title, priority badge, due date, task progress bar, tags
  - [ ] `add-column.tsx` — "+ Add Column" button/form at end of board
  - [ ] `add-project.tsx` — "+ Add Project" button/form at bottom of column
  - [ ] `column-header.tsx` — Column name, count, edit/delete dropdown menu
- [ ] Implement @dnd-kit:
  - [ ] Drag project between columns (updates `column_id`)
  - [ ] Drag to reorder projects within a column (updates `position`)
  - [ ] Drag to reorder columns (updates `position`)
  - [ ] Optimistic updates for all drag operations
  - [ ] Keyboard-accessible drag support
- [ ] Area detail page (`/areas/[areaId]/page.tsx`):
  - [ ] Board tab selector (if multiple boards)
  - [ ] Active Kanban board
  - [ ] Area header with name, icon, edit button

### 2.3 Projects (Cards)

- [ ] Create Zod validation schemas (`src/lib/validations/project.ts`)
- [ ] Create Server Actions (`src/actions/project-actions.ts`):
  - [ ] `createProject(columnId, formData)` — title, description, priority, due_date
  - [ ] `updateProject(id, formData)` — edit all fields
  - [ ] `deleteProject(id)` — cascade delete
  - [ ] `moveProject(id, toColumnId, position)` — drag-and-drop persistence
  - [ ] `archiveProject(id)` — toggle archive
- [ ] Create DB query functions:
  - [ ] `getProjectsByColumn(columnId)` — ordered by position
  - [ ] `getProjectDetail(projectId)` — project + tasks + notes
- [ ] Build project detail view:
  - [ ] Slide-over panel or modal that opens on card click
  - [ ] Editable title (inline)
  - [ ] Description editor (textarea or simple rich text)
  - [ ] Priority selector (low / medium / high / urgent)
  - [ ] Due date picker
  - [ ] Tag management (add/remove tags)
  - [ ] Task checklist section (built in Phase 2.4)
  - [ ] Notes section (placeholder for Phase 3)
  - [ ] Archive / Delete buttons

### 2.4 Tasks (Within Projects)

- [ ] Create Zod validation schemas (`src/lib/validations/task.ts`)
- [ ] Create Server Actions (`src/actions/task-actions.ts`):
  - [ ] `createTask(projectId, formData)` — title, priority, due_date
  - [ ] `updateTask(id, formData)` — edit task
  - [ ] `toggleTask(id)` — toggle completion
  - [ ] `deleteTask(id)` — remove task
  - [ ] `reorderTasks(orderedIds)` — update positions
  - [ ] `createSubtask(parentTaskId, formData)` — nested task
- [ ] Create DB query functions:
  - [ ] `getTasksByProject(projectId)` — ordered, with subtasks
  - [ ] `getTasksByUser(userId, filters)` — for dashboard (all areas)
- [ ] Build task components (`src/components/tasks/`):
  - [ ] `task-list.tsx` — renders tasks for a project with drag-to-reorder
  - [ ] `task-item.tsx` — checkbox, title, priority dot, due date, expand for subtasks
  - [ ] `quick-add-task.tsx` — inline "Add task" input at bottom of list
  - [ ] `task-detail.tsx` — expanded task editor (inline in project detail)
- [ ] Implement task features:
  - [ ] Check/uncheck with optimistic update + strikethrough animation
  - [ ] Subtask expansion (show/hide subtasks under parent)
  - [ ] Overdue date highlighting (red text)
  - [ ] Task count on project card updates in real-time

### 2.5 Phase 2 Verification

- [ ] User can create, edit, delete, and archive life areas
- [ ] Sidebar updates dynamically when areas change
- [ ] Kanban board renders with columns and project cards
- [ ] Drag-and-drop works: between columns and within columns
- [ ] Drag-and-drop persists on page refresh
- [ ] Project detail view opens with full information
- [ ] Tasks can be created, checked off, and reordered within a project
- [ ] Subtasks render under parent tasks
- [ ] WIP limit warning appears when a column exceeds its limit
- [ ] All operations work on mobile (touch drag or alternative UX)
- [ ] Loading skeletons show during data fetching
- [ ] Error states display for failed operations

---

## Phase 3: Dashboard & Notes (Weeks 9–12)

> **Goal:** The home dashboard becomes the command center with aggregated tasks, upcoming deadlines, and quick-add. Notes system is fully functional.

### 3.1 Dashboard — Task Feed

- [ ] Create DB query functions (`src/lib/db/queries/dashboard.ts`):
  - [ ] `getTodaysTasks(userId)` — tasks due today across all areas
  - [ ] `getUpcomingTasks(userId, days)` — tasks due in next N days
  - [ ] `getOverdueTasks(userId)` — past-due tasks
  - [ ] `getRecentActivity(userId, limit)` — recently modified items
  - [ ] `getDashboardStats(userId)` — total tasks, completed today, overdue count
- [ ] Build dashboard widgets (`src/components/dashboard/`):
  - [ ] `summary-stats.tsx` — 4 metric cards (Total Tasks, Completed Today, Overdue, Active Streak)
  - [ ] `today-tasks.tsx` — Today's tasks with checkboxes, grouped by area
  - [ ] `upcoming-deadlines.tsx` — Next 7 days, grouped by day
  - [ ] `recent-activity.tsx` — Last 10 modified items with timestamps
  - [ ] `quick-add-task.tsx` — Dashboard-level task creation with area/project selectors
- [ ] Dashboard page layout:
  - [ ] Responsive grid: 2 columns on desktop, 1 column on mobile
  - [ ] Summary stats row at top
  - [ ] Today's tasks (left) + Upcoming deadlines (right)
  - [ ] Quick-add task bar (sticky or prominent)
  - [ ] Recent activity at bottom

### 3.2 Dashboard — Filters

- [ ] Implement filter system:
  - [ ] Filter by life area (multi-select dropdown)
  - [ ] Filter by status (To Do, In Progress, Done)
  - [ ] Filter by priority (Low, Medium, High, Urgent)
  - [ ] Search by task/project title
- [ ] Create Zustand store for filter state (`src/lib/stores/filter-store.ts`)
- [ ] Filters persist during session (reset on page leave or explicit clear)
- [ ] Active filter count shown on filter button
- [ ] "Clear all filters" button

### 3.3 Notes System

- [ ] Create Server Actions (`src/actions/note-actions.ts`):
  - [ ] `createNote(projectId, formData)` — title + content
  - [ ] `updateNote(id, formData)` — edit title/content
  - [ ] `deleteNote(id)` — remove note
  - [ ] `togglePinNote(id)` — pin/unpin
- [ ] Create DB queries:
  - [ ] `getNotesByProject(projectId)` — ordered by pinned first, then date
- [ ] Build note components:
  - [ ] Note list within project detail view
  - [ ] Note editor with basic rich text (bold, italic, lists, links) — use `@tiptap/react` or simple markdown
  - [ ] Pin button on each note
  - [ ] Delete confirmation
- [ ] Add notes section to project detail panel (below tasks)

### 3.4 Search

- [ ] Implement global search:
  - [ ] Search across projects, tasks, and notes by title/content
  - [ ] Search accessible via header search bar or `Cmd+K` shortcut
  - [ ] Results grouped by type (Projects, Tasks, Notes)
  - [ ] Click result → navigate to relevant area/project
- [ ] Create search DB query (`searchAll(userId, query)`)
- [ ] Build search command palette (shadcn/ui `Command` component)

### 3.5 Phase 3 Verification

- [ ] Dashboard loads with accurate stats from the database
- [ ] Today's tasks show tasks due today with completion checkboxes
- [ ] Upcoming deadlines show the next 7 days correctly
- [ ] Quick-add creates a task and it appears in the dashboard immediately
- [ ] Filters work correctly across area, status, and priority
- [ ] Notes can be created, edited, pinned, and deleted within projects
- [ ] Global search returns relevant results across all content types
- [ ] Dashboard data updates when tasks are completed from the Kanban board
- [ ] Performance: dashboard loads in < 2 seconds

---

## Phase 4: Habits, Goals & Time Tracking (Weeks 13–16)

> **Goal:** Habit tracking with streaks, goal management with project linking, and basic time tracking.

### 4.1 Habit Tracking

- [ ] Create Zod validation schemas (`src/lib/validations/habit.ts`)
- [ ] Create Server Actions (`src/actions/habit-actions.ts`):
  - [ ] `createHabit(formData)` — name, frequency, area_id, target_count
  - [ ] `updateHabit(id, formData)` — edit habit
  - [ ] `deleteHabit(id)` — remove habit
  - [ ] `logHabit(id, date)` — mark as done for a date
  - [ ] `unlogHabit(id, date)` — remove completion for a date
- [ ] Create DB queries (`src/lib/db/queries/habits.ts`):
  - [ ] `getHabits(userId)` — all habits with today's status
  - [ ] `getHabitWithLogs(habitId, dateRange)` — habit + completion history
  - [ ] `getHabitStreaks(habitId)` — current streak + best streak calculation
  - [ ] `getTodaysHabits(userId)` — habits due today with completion status
- [ ] Build habit components (`src/components/habits/`):
  - [ ] `habit-card.tsx` — habit name, frequency, current streak, check button
  - [ ] `habit-calendar.tsx` — heatmap/calendar view of completion history (like GitHub contributions)
  - [ ] `habit-form.tsx` — create/edit form with frequency picker
  - [ ] `habit-checklist.tsx` — dashboard widget: today's habits with check buttons
- [ ] Habits page (`/habits/page.tsx`):
  - [ ] List of all habits as cards
  - [ ] Create habit button + form
  - [ ] Click habit → detail view with calendar and stats
- [ ] Add habit checklist widget to dashboard
- [ ] Streak calculation logic:
  - [ ] Current streak: consecutive days/periods of completion
  - [ ] Best streak: longest ever consecutive streak
  - [ ] Visual streak counter on each habit card

### 4.2 Goals

- [ ] Create Server Actions (`src/actions/goal-actions.ts`):
  - [ ] `createGoal(formData)` — title, description, target_date, target_value
  - [ ] `updateGoal(id, formData)` — edit goal
  - [ ] `deleteGoal(id)` — remove goal
  - [ ] `linkProjectToGoal(goalId, projectId)` — associate project
  - [ ] `unlinkProjectFromGoal(goalId, projectId)` — remove association
- [ ] Create DB queries (`src/lib/db/queries/goals.ts`):
  - [ ] `getGoals(userId)` — all goals with progress
  - [ ] `getGoalDetail(goalId)` — goal + linked projects + progress calculation
- [ ] Build goal components:
  - [ ] Goal card — title, progress bar, target date, linked project count
  - [ ] Goal detail view — full info, linked projects list, progress breakdown
  - [ ] Goal form — create/edit with project linking
  - [ ] Goal progress bar — auto-calculated from linked project/task completion
- [ ] Goals page (`/goals/page.tsx`):
  - [ ] List of goals as cards
  - [ ] Create goal button + form
  - [ ] Click goal → detail with progress and linked projects

### 4.3 Time Tracking (Basic)

- [ ] Create Server Actions (`src/actions/time-actions.ts`):
  - [ ] `startTimer(projectId, taskId?)` — start tracking time
  - [ ] `stopTimer(entryId)` — stop and save duration
  - [ ] `createManualEntry(formData)` — log time manually
  - [ ] `deleteTimeEntry(id)` — remove entry
- [ ] Create DB queries:
  - [ ] `getTimeEntries(userId, dateRange)` — time logs
  - [ ] `getTimeSummary(userId, dateRange)` — total time per area/project
- [ ] Build time tracking UI:
  - [ ] Timer component — start/stop button, elapsed time display
  - [ ] Timer persists in header during navigation (global state via Zustand)
  - [ ] Manual time entry form
  - [ ] Time log list within project detail
- [ ] Optional: Pomodoro mode (25/5 timer with session count)

### 4.4 Phase 4 Verification

- [ ] Habits can be created with different frequencies (daily, weekly, custom)
- [ ] Habit check-in works with visual feedback (animation, streak update)
- [ ] Habit calendar/heatmap shows completion history accurately
- [ ] Streak calculation is correct for current and best streaks
- [ ] Dashboard habit widget shows today's habits
- [ ] Goals can be created and linked to projects
- [ ] Goal progress auto-calculates from linked project completion
- [ ] Timer can be started, runs during navigation, and stops correctly
- [ ] Manual time entry logs correctly
- [ ] Time entries appear in project detail view

---

## Phase 5: Analytics & Reporting (Weeks 17–20)

> **Goal:** Comprehensive analytics page with charts, trends, and life balance visualization. Weekly review system.

### 5.1 Analytics Data Layer

- [ ] Create analytics query functions (`src/lib/db/queries/analytics.ts`):
  - [ ] `getCompletionOverTime(userId, period, dateRange)` — tasks completed per day/week/month
  - [ ] `getAreaDistribution(userId, dateRange)` — task count per area
  - [ ] `getProductivityTrends(userId)` — week-over-week comparison
  - [ ] `getLifeBalanceScores(userId)` — activity score per area (normalized)
  - [ ] `getOverdueAnalysis(userId)` — overdue count + percentage by area
  - [ ] `getStreakSummary(userId)` — all habit streaks
  - [ ] `getTimeDistribution(userId, dateRange)` — time per area/project
  - [ ] `getMostActiveAreas(userId, dateRange)` — ranked areas by activity

### 5.2 Charts & Visualizations

- [ ] Install chart library (Recharts)
- [ ] Build chart components (`src/components/analytics/`):
  - [ ] `completion-chart.tsx` — Bar/line chart: tasks completed over time
  - [ ] `area-distribution.tsx` — Donut/pie chart: task distribution across areas
  - [ ] `productivity-trends.tsx` — Comparison chart: this week vs last week
  - [ ] `life-balance-radar.tsx` — Radar chart: activity level per life area
  - [ ] `time-distribution.tsx` — Stacked bar: time spent per area
  - [ ] `streak-overview.tsx` — Habit streak summary cards
  - [ ] `overdue-breakdown.tsx` — Bar chart: overdue tasks by area

### 5.3 Analytics Page

- [ ] Build analytics page (`/analytics/page.tsx`):
  - [ ] Time period selector: This Week, This Month, Last 30 Days, Last 90 Days, Custom Range
  - [ ] Summary stats row: Total completed, Completion rate, Avg daily tasks, Active streaks
  - [ ] Charts grid layout (responsive: 2-col desktop, 1-col mobile)
  - [ ] Each chart in a card with title and info tooltip
- [ ] Loading skeletons for each chart independently (Suspense boundaries)
- [ ] Empty states for charts with no data

### 5.4 Weekly Review

- [ ] Create weekly review page or modal:
  - [ ] Auto-generated summary: tasks completed this week, areas touched, habits maintained
  - [ ] Comparison with previous week
  - [ ] Overdue task list with quick actions (reschedule, complete, delete)
  - [ ] Life balance radar showing this week's focus
  - [ ] Prompt: "What are your priorities for next week?"
- [ ] Schedule weekly review notification (Sunday evening or configurable)

### 5.5 Phase 5 Verification

- [ ] Analytics page loads with accurate data for the selected time period
- [ ] All charts render correctly with real data
- [ ] Time period selector updates all charts simultaneously
- [ ] Life balance radar accurately reflects activity across areas
- [ ] Charts handle edge cases: no data, single data point, large datasets
- [ ] Charts are responsive on mobile (readable, scrollable if needed)
- [ ] Weekly review shows accurate week summary
- [ ] Performance: analytics page loads in < 3 seconds with charts

---

## Phase 6: Polish, Settings & Deployment (Weeks 21–24)

> **Goal:** Production-ready application with settings, notifications, performance optimization, and live deployment.

### 6.1 Settings Page

- [ ] Build settings page (`/settings/page.tsx`) with tabs:
  - [ ] **Profile:** Edit display name, avatar (upload to Supabase Storage), email
  - [ ] **Appearance:** Theme (light/dark/system), accent color, compact mode
  - [ ] **Notifications:** Toggle notification types (due reminders, weekly review, overdue alerts)
  - [ ] **Data:** Export all data as JSON, export tasks as CSV
  - [ ] **Account:** Change password, delete account (with confirmation)
- [ ] Create Server Actions for settings mutations
- [ ] Store preferences in `profiles.settings` JSON field

### 6.2 Notifications

- [ ] Create notification generation logic:
  - [ ] Task due today → notification
  - [ ] Task overdue → notification
  - [ ] Weekly review reminder → notification
- [ ] Build notification UI:
  - [ ] Bell icon in header with unread count badge
  - [ ] Dropdown panel listing notifications
  - [ ] Mark as read (individual + mark all)
  - [ ] Click notification → navigate to relevant item
- [ ] Server Actions:
  - [ ] `getNotifications(userId)` — unread + recent read
  - [ ] `markAsRead(id)` — mark single notification
  - [ ] `markAllAsRead(userId)` — mark all as read

### 6.3 Recurring Tasks

- [ ] Implement recurring task logic:
  - [ ] When a recurring task is marked complete, auto-create next occurrence
  - [ ] Support: daily, weekly, biweekly, monthly
  - [ ] Show recurrence icon/badge on task
  - [ ] Handle edge cases: skip, pause, change frequency

### 6.4 Performance Optimization

- [ ] Audit and optimize:
  - [ ] Run Lighthouse audit — target 90+ on all scores
  - [ ] Add `<Suspense>` boundaries to all dashboard widgets and analytics charts
  - [ ] Implement `loading.tsx` for every route
  - [ ] Add `next/image` optimization for any user-uploaded images
  - [ ] Review and add database indexes for slow queries
  - [ ] Implement pagination for large task/project lists
  - [ ] Dynamic imports for chart components (`next/dynamic`)
  - [ ] Review bundle size with `@next/bundle-analyzer`

### 6.5 UX Polish

- [ ] Add keyboard shortcuts:
  - [ ] `Cmd+K` — Global search
  - [ ] `Cmd+N` — Quick add task
  - [ ] `Escape` — Close modals/panels
- [ ] Add animations and transitions:
  - [ ] Smooth Kanban card transitions on drag
  - [ ] Task completion check animation
  - [ ] Habit check-in animation
  - [ ] Page transition animations (subtle)
- [ ] Empty states for all views:
  - [ ] No areas → "Create your first life area"
  - [ ] No projects → "Add a project to get started"
  - [ ] No tasks → "Break this project into tasks"
  - [ ] No habits → "Start tracking a daily habit"
  - [ ] No analytics data → "Complete some tasks to see your stats"
- [ ] Error boundaries on every route
- [ ] Confirmation dialogs for all destructive actions
- [ ] Undo toast for task deletion (5-second window)
- [ ] Skeleton loading states for all data-fetching components

### 6.6 Testing

- [ ] Manual testing checklist:
  - [ ] Test all CRUD operations for every entity
  - [ ] Test drag-and-drop on desktop and mobile
  - [ ] Test auth flow: signup, login, logout, password reset
  - [ ] Test responsive layout at 375px, 768px, 1024px, 1440px
  - [ ] Test dark mode across all pages
  - [ ] Test empty states, loading states, error states
  - [ ] Test with 100+ tasks to verify performance
  - [ ] Test keyboard navigation (Tab through all interactive elements)
  - [ ] Cross-browser: Chrome, Firefox, Safari, Edge

### 6.7 Deployment

- [ ] Prepare for deployment:
  - [ ] Create `amplify.yml` build configuration
  - [ ] Set up GitHub repository (push all code)
  - [ ] Remove all console.logs and debug code
  - [ ] Verify `.env` variables are not committed
- [ ] Deploy to AWS Amplify:
  - [ ] Connect GitHub repo to Amplify
  - [ ] Configure environment variables in Amplify Console
  - [ ] Run first deployment and verify
  - [ ] Set up custom domain (if applicable)
  - [ ] Configure SSL certificate
- [ ] Post-deployment:
  - [ ] Update Supabase auth redirect URLs to production domain
  - [ ] Verify RLS policies work in production
  - [ ] Test full user flow on production URL
  - [ ] Set up basic monitoring (Amplify analytics, Supabase dashboard)
  - [ ] Create a backup strategy for the database

### 6.8 Phase 6 Verification

- [ ] Settings page allows profile editing, theme changes, and data export
- [ ] Notifications appear for due/overdue tasks
- [ ] Recurring tasks auto-generate next occurrence on completion
- [ ] Lighthouse scores: Performance ≥ 90, Accessibility ≥ 90, Best Practices ≥ 90
- [ ] All pages have loading, empty, and error states
- [ ] Keyboard shortcuts work globally
- [ ] Application deploys successfully to AWS Amplify
- [ ] Production URL works with HTTPS
- [ ] Full user flow works end-to-end in production

---

## Phase Summary

| Phase | Focus | Key Deliverables | Duration |
|-------|-------|-----------------|----------|
| **1** | Foundation & Auth | Next.js setup, Supabase DB, auth flow, app shell | Weeks 1–3 |
| **2** | Kanban & Tasks | Life areas CRUD, Kanban board with DnD, projects, tasks | Weeks 4–8 |
| **3** | Dashboard & Notes | Home dashboard, filters, notes system, global search | Weeks 9–12 |
| **4** | Habits, Goals & Time | Habit tracking, goal management, time tracking | Weeks 13–16 |
| **5** | Analytics & Reporting | Charts, trends, life balance radar, weekly review | Weeks 17–20 |
| **6** | Polish & Deploy | Settings, notifications, performance, deployment | Weeks 21–24 |

---

## Definition of Done (Per Phase)

Every phase is complete when:

1. All checklist items are checked off
2. All new pages/components have loading and error states
3. All mutations have optimistic updates where applicable
4. Responsive design works on mobile, tablet, and desktop
5. Dark mode works for all new components
6. No TypeScript errors (`pnpm tsc --noEmit` passes)
7. No ESLint warnings (`pnpm lint` passes)
8. Manual testing of all new features passes
