# Product Requirements Document (PRD)

## LifePlanner — Personal Life Management Platform

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** In Development

---

## 1. Executive Summary

LifePlanner is a web-based personal productivity platform that enables users to organize, track, and optimize multiple areas of their life through Kanban boards, task management, habit tracking, goal setting, and analytics — all within a single, unified interface.

The product targets students, professionals, freelancers, and self-improvement enthusiasts who need more than a simple to-do list but find tools like Notion too complex or fragmented for personal life management.

---

## 2. Goals & Success Metrics

### Product Goals

| Goal                        | Description                                                         |
| --------------------------- | ------------------------------------------------------------------- |
| **Unified Life Management** | Replace 3+ separate productivity tools with one integrated platform |
| **Visual Organization**     | Kanban-first approach makes project status instantly visible        |
| **Actionable Insights**     | Analytics reveal productivity patterns users can't see on their own |
| **Habit Consistency**       | Built-in habit tracking closes the gap between planning and doing   |
| **Frictionless UX**         | Quick-add, drag-and-drop, and keyboard shortcuts minimize friction  |

### Success Metrics (MVP)

| Metric                                                | Target                       |
| ----------------------------------------------------- | ---------------------------- |
| User can create an account and see default life areas | < 30 seconds                 |
| Time to create first project with tasks               | < 2 minutes                  |
| Task completion via Kanban drag-and-drop              | Works with zero page reloads |
| Dashboard loads with aggregated data                  | < 1.5 seconds                |
| Mobile usability score (Lighthouse)                   | ≥ 90                         |

---

## 3. User Personas

### Persona 1: The Ambitious Student — "Sara"

- **Age:** 21 | Computer Science major
- **Pain:** Uses Google Calendar for classes, Notion for notes, Todoist for tasks, and a notebook for gym tracking. Nothing connects.
- **Need:** See all her life areas (Academics, Fitness, Side Projects, Social) in one place with clear priorities.
- **Goal:** Never miss a deadline, maintain her gym streak, ship her side project.

### Persona 2: The Overloaded Professional — "Marcus"

- **Age:** 34 | Product Manager
- **Pain:** Work tasks bleed into personal time. No visibility into how he spends time across life domains.
- **Need:** Separate work from personal projects while seeing the full picture on a dashboard.
- **Goal:** Better work-life balance with data to prove he's making progress.

### Persona 3: The Intentional Freelancer — "Leila"

- **Age:** 28 | Freelance Designer
- **Pain:** Tracks client work in Trello, personal goals in a journal, finances in a spreadsheet.
- **Need:** Multi-project Kanban with client and personal areas, plus financial goal tracking.
- **Goal:** Grow her business while maintaining personal projects and health habits.

---

## 4. Feature Requirements

### 4.1 Authentication & User Management

**Priority: P0 (Must Have)**

| ID      | Requirement            | Acceptance Criteria                                                                           |
| ------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| AUTH-01 | Email/password sign up | User can register with email and password. Email confirmation sent.                           |
| AUTH-02 | Email/password sign in | User can log in with credentials. Invalid credentials show error.                             |
| AUTH-03 | OAuth sign in (Google) | User can sign in with Google. Profile auto-created on first login.                            |
| AUTH-04 | Session management     | Sessions persist across page refreshes. Expired sessions redirect to login.                   |
| AUTH-05 | Sign out               | User can sign out. All protected routes become inaccessible.                                  |
| AUTH-06 | Password reset         | User can request password reset via email and set a new password.                             |
| AUTH-07 | Auto-profile creation  | On first sign-up, a profile record and 5 default life areas are auto-created.                 |
| AUTH-08 | Protected routes       | All `/dashboard/*` routes require authentication. Unauthenticated users redirect to `/login`. |

### 4.2 Dashboard (Home)

**Priority: P0 (Must Have)**

| ID      | Requirement        | Acceptance Criteria                                                            |
| ------- | ------------------ | ------------------------------------------------------------------------------ |
| DASH-01 | Unified task feed  | Home page shows tasks from ALL life areas, sorted by due date (soonest first). |
| DASH-02 | Filter by area     | User can filter the task feed by one or more life areas.                       |
| DASH-03 | Filter by status   | User can filter by status: To Do, In Progress, Done.                           |
| DASH-04 | Quick add task     | User can create a task from the dashboard, selecting area and project inline.  |
| DASH-05 | Today's tasks      | Dedicated section showing tasks due today, with completion checkboxes.         |
| DASH-06 | Upcoming deadlines | Widget showing tasks due in the next 7 days, grouped by day.                   |
| DASH-07 | Summary stats      | Display: total tasks, completed today, overdue count, active streak (habits).  |
| DASH-08 | Recent activity    | Feed of recently modified tasks/projects (last 10 items).                      |

### 4.3 Life Areas

**Priority: P0 (Must Have)**

| ID      | Requirement      | Acceptance Criteria                                                                              |
| ------- | ---------------- | ------------------------------------------------------------------------------------------------ |
| AREA-01 | Default areas    | Five default areas created on signup: Work 💼, Personal 🏠, Fitness 💪, Finance 💰, Learning 📚. |
| AREA-02 | Create area      | User can create a new life area with name, icon, and color.                                      |
| AREA-03 | Edit area        | User can edit area name, icon, color, and description.                                           |
| AREA-04 | Delete area      | User can delete an area (with confirmation). Cascades to boards, projects, tasks.                |
| AREA-05 | Archive area     | User can archive an area to hide it from the sidebar without deleting data.                      |
| AREA-06 | Reorder areas    | User can drag-and-drop to reorder areas in the sidebar.                                          |
| AREA-07 | Area detail page | Clicking an area shows its Kanban board(s), project count, and area-level stats.                 |

### 4.4 Kanban Boards

**Priority: P0 (Must Have)**

| ID     | Requirement              | Acceptance Criteria                                                                      |
| ------ | ------------------------ | ---------------------------------------------------------------------------------------- |
| KAN-01 | Default board            | Each area gets a default board on creation with 3 columns: To Do, In Progress, Done.     |
| KAN-02 | Multiple boards per area | User can create additional boards within an area (e.g., "Q1 Goals", "Client Work").      |
| KAN-03 | Add column               | User can add columns to a board with custom name and optional color.                     |
| KAN-04 | Edit column              | User can rename columns and change their color.                                          |
| KAN-05 | Delete column            | User can delete a column (with confirmation). Projects within move to a selected column. |
| KAN-06 | Reorder columns          | User can drag-and-drop to reorder columns.                                               |
| KAN-07 | WIP limits               | User can set a work-in-progress limit per column. Visual warning when exceeded.          |
| KAN-08 | Column collapse          | User can collapse a column to save screen space.                                         |

### 4.5 Projects (Kanban Cards)

**Priority: P0 (Must Have)**

| ID      | Requirement          | Acceptance Criteria                                                                      |
| ------- | -------------------- | ---------------------------------------------------------------------------------------- |
| PROJ-01 | Create project       | User can create a project in a column with title, description, priority, and due date.   |
| PROJ-02 | Drag between columns | User can drag a project card to another column. Position persists on refresh.            |
| PROJ-03 | Drag to reorder      | User can drag to reorder projects within the same column.                                |
| PROJ-04 | Project detail view  | Clicking a project opens a detail panel/modal with full info, tasks, and notes.          |
| PROJ-05 | Edit project         | User can edit all project fields inline in the detail view.                              |
| PROJ-06 | Delete project       | User can delete a project (with confirmation). Cascades to tasks, notes.                 |
| PROJ-07 | Priority indicator   | Project cards show a visual priority indicator (color-coded: low, medium, high, urgent). |
| PROJ-08 | Due date display     | Project cards show due date. Overdue dates highlighted in red.                           |
| PROJ-09 | Task progress        | Project cards show a mini progress bar (e.g., "3/8 tasks done").                         |
| PROJ-10 | Labels/Tags          | User can add tags to projects. Tags are filterable on the board.                         |
| PROJ-11 | Archive project      | User can archive a project to remove it from the board without deleting.                 |

### 4.6 Tasks & Checklists

**Priority: P0 (Must Have)**

| ID      | Requirement       | Acceptance Criteria                                                                       |
| ------- | ----------------- | ----------------------------------------------------------------------------------------- |
| TASK-01 | Create task       | User can add tasks within a project with title, status, priority, and due date.           |
| TASK-02 | Toggle completion | User can check/uncheck a task. Completed tasks show strikethrough.                        |
| TASK-03 | Edit task         | User can edit task title, priority, due date, and status inline.                          |
| TASK-04 | Delete task       | User can delete a task (with confirmation or undo).                                       |
| TASK-05 | Reorder tasks     | User can drag-and-drop to reorder tasks within a project.                                 |
| TASK-06 | Subtasks          | User can create subtasks under a task (one level of nesting).                             |
| TASK-07 | Task status       | Tasks have statuses: To Do, In Progress, Done.                                            |
| TASK-08 | Recurring tasks   | User can mark a task as recurring (daily, weekly, monthly). Auto-recreates on completion. |
| TASK-09 | Bulk actions      | User can select multiple tasks and bulk mark as done, delete, or move.                    |

### 4.7 Notes

**Priority: P1 (Should Have)**

| ID      | Requirement               | Acceptance Criteria                                                       |
| ------- | ------------------------- | ------------------------------------------------------------------------- |
| NOTE-01 | Create note               | User can add notes to a project with a title and rich text content.       |
| NOTE-02 | Edit note                 | User can edit notes with a rich text editor (bold, italic, lists, links). |
| NOTE-03 | Delete note               | User can delete a note with confirmation.                                 |
| NOTE-04 | Pin note                  | User can pin a note to the top of the notes list within a project.        |
| NOTE-05 | Quick note from dashboard | User can create a quick note from the dashboard, selecting area/project.  |

### 4.8 Analytics & Reporting

**Priority: P1 (Should Have)**

| ID      | Requirement           | Acceptance Criteria                                                              |
| ------- | --------------------- | -------------------------------------------------------------------------------- |
| ANAL-01 | Task completion chart | Line/bar chart showing tasks completed per day/week/month.                       |
| ANAL-02 | Area distribution     | Pie or donut chart showing task distribution across life areas.                  |
| ANAL-03 | Productivity trends   | Weekly comparison showing improvement or decline in task completion.             |
| ANAL-04 | Life balance radar    | Radar chart showing activity level across all life areas.                        |
| ANAL-05 | Time period selector  | User can filter analytics by: This Week, This Month, Last 30 Days, Custom Range. |
| ANAL-06 | Most active areas     | Ranked list of areas by number of tasks completed in the selected period.        |
| ANAL-07 | Overdue analysis      | Count and percentage of overdue tasks, broken down by area.                      |
| ANAL-08 | Streak tracking       | Display current and longest streaks for habit completion.                        |

### 4.9 Habits

**Priority: P1 (Should Have)**

| ID     | Requirement           | Acceptance Criteria                                                                  |
| ------ | --------------------- | ------------------------------------------------------------------------------------ |
| HAB-01 | Create habit          | User can create a habit with name, frequency (daily/weekly/custom), and linked area. |
| HAB-02 | Log completion        | User can mark a habit as complete for today. Visual check animation.                 |
| HAB-03 | Streak display        | Each habit shows current streak count and best streak.                               |
| HAB-04 | Habit calendar        | Heatmap or calendar view showing habit completion history.                           |
| HAB-05 | Edit habit            | User can edit habit name, frequency, and settings.                                   |
| HAB-06 | Delete/archive habit  | User can delete or archive a habit.                                                  |
| HAB-07 | Daily habit checklist | Dashboard widget showing today's habits with checkboxes.                             |

### 4.10 Goals

**Priority: P2 (Nice to Have)**

| ID      | Requirement       | Acceptance Criteria                                                                             |
| ------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| GOAL-01 | Create goal       | User can create a goal with title, description, target date, and target value.                  |
| GOAL-02 | Link to projects  | User can link one or more projects to a goal. Progress auto-calculates from project completion. |
| GOAL-03 | Goal hierarchy    | User can create sub-goals under a parent goal.                                                  |
| GOAL-04 | Progress tracking | Goal shows progress bar based on linked project/task completion.                                |
| GOAL-05 | Goal timeline     | Visual timeline showing goal milestones and current position.                                   |

### 4.11 Time Tracking

**Priority: P2 (Nice to Have)**

| ID      | Requirement        | Acceptance Criteria                                                            |
| ------- | ------------------ | ------------------------------------------------------------------------------ |
| TIME-01 | Start/stop timer   | User can start a timer on a task or project. Timer persists across navigation. |
| TIME-02 | Manual entry       | User can manually log time spent on a task/project.                            |
| TIME-03 | Pomodoro mode      | Optional Pomodoro timer (25 min work / 5 min break) with session count.        |
| TIME-04 | Time reports       | Analytics page shows time spent per area, project, and task.                   |
| TIME-05 | Daily time summary | Dashboard shows total time tracked today.                                      |

### 4.12 Settings & Customization

**Priority: P1 (Should Have)**

| ID     | Requirement              | Acceptance Criteria                                                           |
| ------ | ------------------------ | ----------------------------------------------------------------------------- |
| SET-01 | Profile settings         | User can edit display name, avatar, and email.                                |
| SET-02 | Theme toggle             | User can switch between light and dark mode.                                  |
| SET-03 | Notification preferences | User can toggle notification types (due date reminders, weekly review, etc.). |
| SET-04 | Default area             | User can set a default area that opens on login.                              |
| SET-05 | Data export              | User can export all their data as JSON or CSV.                                |

### 4.13 Notifications

**Priority: P2 (Nice to Have)**

| ID       | Requirement          | Acceptance Criteria                                                         |
| -------- | -------------------- | --------------------------------------------------------------------------- |
| NOTIF-01 | In-app notifications | Bell icon in header with unread count. Dropdown shows recent notifications. |
| NOTIF-02 | Due date reminders   | Notification generated when a task is due today or overdue.                 |
| NOTIF-03 | Weekly review prompt | Weekly notification prompting the user to review their progress.            |
| NOTIF-04 | Mark as read         | User can mark individual or all notifications as read.                      |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Requirement             | Target           |
| ----------------------- | ---------------- |
| Initial page load (LCP) | < 2.5 seconds    |
| Client-side navigation  | < 300ms          |
| Kanban drag-and-drop    | 60fps, zero jank |
| Database query response | < 200ms (p95)    |
| API response time       | < 500ms (p95)    |

### 5.2 Security

| Requirement        | Implementation                                                |
| ------------------ | ------------------------------------------------------------- |
| Row Level Security | All tables enforce RLS — users can only access their own data |
| Authentication     | Supabase Auth with JWT tokens, HttpOnly cookies               |
| Input validation   | Server-side validation on all mutations (Zod schemas)         |
| CSRF protection    | Next.js built-in CSRF handling via Server Actions             |
| Rate limiting      | Supabase rate limits + custom rate limiting on auth endpoints |

### 5.3 Accessibility

| Requirement           | Standard                                                               |
| --------------------- | ---------------------------------------------------------------------- |
| WCAG compliance       | Level AA                                                               |
| Keyboard navigation   | All interactive elements reachable via Tab, actionable via Enter/Space |
| Screen reader support | Proper ARIA labels on all components, live regions for dynamic content |
| Color contrast        | Minimum 4.5:1 ratio for text, 3:1 for large text                       |
| Focus management      | Visible focus indicators, logical tab order, focus trapping in modals  |

### 5.4 Responsive Design

| Breakpoint            | Experience                                                                                            |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| Mobile (< 640px)      | Single column layout. Sidebar collapses to bottom nav or hamburger menu. Kanban scrolls horizontally. |
| Tablet (640px–1024px) | Two-column where appropriate. Sidebar collapsible.                                                    |
| Desktop (> 1024px)    | Full layout with persistent sidebar, multi-column Kanban, and dashboard grid.                         |

---

## 6. Out of Scope (V1)

The following features are explicitly **not** included in V1 and are deferred to future releases:

- Real-time collaboration / multi-user
- Mobile native app (React Native / Expo)
- AI-powered features (smart suggestions, natural language task creation)
- Calendar integration (Google Calendar, Apple Calendar)
- Third-party integrations (Slack, email, Zapier)
- Template marketplace / community sharing
- Offline-first / PWA with full offline support
- Gamification (XP, levels, achievements beyond streaks)
- File attachments (Supabase Storage integration)

---

## 7. User Flows

### 7.1 First-Time User Flow

```
Landing Page → Sign Up → Email Confirmation → Dashboard
                                                  ↓
                                          5 Default Life Areas Created
                                                  ↓
                                          Onboarding Tooltip Tour
                                                  ↓
                                          "Create Your First Project" CTA
```

### 7.2 Daily Usage Flow

```
Open App → Dashboard (Today's Tasks + Habits)
              ↓
         Complete tasks via checkbox
         Log habits via check button
              ↓
         Navigate to specific area
              ↓
         Kanban Board → Drag project to "Done"
              ↓
         Open project → Check off sub-tasks
              ↓
         Return to Dashboard → See updated stats
```

### 7.3 Weekly Review Flow

```
Notification: "Time for your weekly review!"
              ↓
         Analytics Page → Review completion rates
              ↓
         Life Balance Radar → Identify neglected areas
              ↓
         Plan next week → Create/move projects
              ↓
         Set priorities → Update task due dates
```

---

## 8. Priority Matrix

| Priority | Label        | Meaning                                             | Phases      |
| -------- | ------------ | --------------------------------------------------- | ----------- |
| **P0**   | Must Have    | Core functionality. App doesn't work without it.    | Phase 1–2   |
| **P1**   | Should Have  | Important features that significantly improve UX.   | Phase 3–4   |
| **P2**   | Nice to Have | Valuable features that can wait for later releases. | Phase 5–6   |
| **P3**   | Future       | Deferred to V2 or beyond.                           | Post-launch |
