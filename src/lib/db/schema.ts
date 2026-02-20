import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  primaryKey,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// Enums
export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);
export const statusEnum = pgEnum("status", ["todo", "in_progress", "done"]);
export const frequencyEnum = pgEnum("frequency", ["daily", "weekly", "custom"]);

// 1. Profiles
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(), // Links to auth.users
  display_name: text("display_name"),
  avatar_url: text("avatar_url"),
  email: text("email").notNull(),
  settings: jsonb("settings").default({
    theme: "system",
    notifications: {
      due_reminders: true,
      weekly_review: true,
      overdue_alerts: true,
    },
  }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Life Areas
export const lifeAreas = pgTable("life_areas", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  icon: text("icon"), // Lucide icon name
  color: text("color"), // Hex or tailwind color
  description: text("description"),
  position: integer("position").default(0).notNull(),
  is_archived: boolean("is_archived").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Boards
export const boards = pgTable("boards", {
  id: uuid("id").defaultRandom().primaryKey(),
  area_id: uuid("area_id")
    .references(() => lifeAreas.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  position: integer("position").default(0).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// 4. Columns
export const columns = pgTable("columns", {
  id: uuid("id").defaultRandom().primaryKey(),
  board_id: uuid("board_id")
    .references(() => boards.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  color: text("color"),
  position: integer("position").default(0).notNull(),
  wip_limit: integer("wip_limit"),
  is_collapsed: boolean("is_collapsed").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Projects
export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  column_id: uuid("column_id")
    .references(() => columns.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  priority: priorityEnum("priority").default("medium").notNull(),
  due_date: timestamp("due_date"),
  position: integer("position").default(0).notNull(),
  is_archived: boolean("is_archived").default(false).notNull(),
  is_process: boolean("is_process").default(false).notNull(), // For recurring processes
  tags: jsonb("tags").default([]), // Quick tags
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// 6. Tasks
export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  parent_task_id: uuid("parent_task_id"), // For one level of nesting
  title: text("title").notNull(),
  status: statusEnum("status").default("todo").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  due_date: timestamp("due_date"),
  completed_at: timestamp("completed_at"),
  position: integer("position").default(0).notNull(),
  is_recurring: boolean("is_recurring").default(false).notNull(),
  recurrence_rule: text("recurrence_rule"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// 7. Notes
export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  content: text("content"), // Rich text or markdown
  is_pinned: boolean("is_pinned").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// 8. Attachments
export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  project_id: uuid("project_id")
    .references(() => projects.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  file_url: text("file_url").notNull(),
  file_type: text("file_type"),
  file_size: integer("file_size"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// 9. Goals
export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  parent_goal_id: uuid("parent_goal_id"),
  title: text("title").notNull(),
  description: text("description"),
  target_date: timestamp("target_date"),
  target_value: integer("target_value"),
  current_value: integer("current_value").default(0).notNull(),
  unit: text("unit"),
  is_archived: boolean("is_archived").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// 10. Goal Projects (M:N)
export const goalProjects = pgTable(
  "goal_projects",
  {
    goal_id: uuid("goal_id")
      .references(() => goals.id, { onDelete: "cascade" })
      .notNull(),
    project_id: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.goal_id, t.project_id] }),
  }),
);

// 11. Templates
export const templates = pgTable("templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // area, board, project
  content: jsonb("content").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// 12. Time Entries
export const timeEntries = pgTable("time_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  project_id: uuid("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  task_id: uuid("task_id").references(() => tasks.id, { onDelete: "cascade" }),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// 13. Habits
export const habits = pgTable("habits", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  area_id: uuid("area_id").references(() => lifeAreas.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  description: text("description"),
  frequency: frequencyEnum("frequency").default("daily").notNull(),
  frequency_config: jsonb("frequency_config"), // e.g., which days of week
  target_count: integer("target_count").default(1).notNull(),
  is_archived: boolean("is_archived").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// 14. Habit Logs
export const habitLogs = pgTable("habit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  habit_id: uuid("habit_id")
    .references(() => habits.id, { onDelete: "cascade" })
    .notNull(),
  completed_at: timestamp("completed_at").defaultNow().notNull(),
  value: integer("value").default(1).notNull(),
  note: text("note"),
});

// 15. Task Events (for analytics)
export const taskEvents = pgTable("task_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  task_id: uuid("task_id")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  event_type: text("event_type").notNull(), // created, completed, deleted, moved
  payload: jsonb("payload"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// 16. Tags
export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  color: text("color"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// 17. Project Tags (M:N)
export const projectTags = pgTable(
  "project_tags",
  {
    project_id: uuid("project_id")
      .references(() => projects.id, { onDelete: "cascade" })
      .notNull(),
    tag_id: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.project_id, t.tag_id] }),
  }),
);

// 18. Notifications
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // due_reminder, weekly_review, system
  link: text("link"),
  read_at: timestamp("read_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  lifeAreas: many(lifeAreas),
  habits: many(habits),
  goals: many(goals),
  tags: many(tags),
  notifications: many(notifications),
}));

export const lifeAreasRelations = relations(lifeAreas, ({ one, many }) => ({
  user: one(profiles, {
    fields: [lifeAreas.user_id],
    references: [profiles.id],
  }),
  boards: many(boards),
}));

export const boardsRelations = relations(boards, ({ one, many }) => ({
  area: one(lifeAreas, {
    fields: [boards.area_id],
    references: [lifeAreas.id],
  }),
  columns: many(columns),
}));

export const columnsRelations = relations(columns, ({ one, many }) => ({
  board: one(boards, { fields: [columns.board_id], references: [boards.id] }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  column: one(columns, {
    fields: [projects.column_id],
    references: [columns.id],
  }),
  tasks: many(tasks),
  notes: many(notes),
  attachments: many(attachments),
  goalProjects: many(goalProjects),
  projectTags: many(projectTags),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  project: one(projects, {
    fields: [notes.project_id],
    references: [projects.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.project_id],
    references: [projects.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parent_task_id],
    references: [tasks.id],
    relationName: "subtasks",
  }),
  subtasks: many(tasks, { relationName: "subtasks" }),
  events: many(taskEvents),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(profiles, { fields: [habits.user_id], references: [profiles.id] }),
  area: one(lifeAreas, {
    fields: [habits.area_id],
    references: [lifeAreas.id],
  }),
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, { fields: [habitLogs.habit_id], references: [habits.id] }),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  user: one(profiles, { fields: [goals.user_id], references: [profiles.id] }),
  goalProjects: many(goalProjects),
}));

export const goalProjectsRelations = relations(goalProjects, ({ one }) => ({
  goal: one(goals, { fields: [goalProjects.goal_id], references: [goals.id] }),
  project: one(projects, {
    fields: [goalProjects.project_id],
    references: [projects.id],
  }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(profiles, {
    fields: [timeEntries.user_id],
    references: [profiles.id],
  }),
  project: one(projects, {
    fields: [timeEntries.project_id],
    references: [projects.id],
  }),
  task: one(tasks, { fields: [timeEntries.task_id], references: [tasks.id] }),
}));
