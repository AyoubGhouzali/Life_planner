-- 1. Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS Policies

-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can manage own profile" ON profiles
  FOR ALL USING (id = auth.uid());

-- Life Areas: Users can only manage their own areas
CREATE POLICY "Users can manage own areas" ON life_areas
  FOR ALL USING (user_id = auth.uid());

-- Boards: Users can only manage boards in their own areas
CREATE POLICY "Users can manage own boards" ON boards
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM life_areas
      WHERE life_areas.id = boards.area_id
      AND life_areas.user_id = auth.uid()
    )
  );

-- Columns: Users can only manage columns in their own boards
CREATE POLICY "Users can manage own columns" ON columns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM boards
      JOIN life_areas ON boards.area_id = life_areas.id
      WHERE boards.id = columns.board_id
      AND life_areas.user_id = auth.uid()
    )
  );

-- Projects: Users can only manage projects in their own columns
CREATE POLICY "Users can manage own projects" ON projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM columns
      JOIN boards ON columns.board_id = boards.id
      JOIN life_areas ON boards.area_id = life_areas.id
      WHERE columns.id = projects.column_id
      AND life_areas.user_id = auth.uid()
    )
  );

-- Tasks: Users can only manage tasks in their own projects
CREATE POLICY "Users can manage own tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN columns ON projects.column_id = columns.id
      JOIN boards ON columns.board_id = boards.id
      JOIN life_areas ON boards.area_id = life_areas.id
      WHERE projects.id = tasks.project_id
      AND life_areas.user_id = auth.uid()
    )
  );

-- Notes: Users can only manage notes in their own projects
CREATE POLICY "Users can manage own notes" ON notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN columns ON projects.column_id = columns.id
      JOIN boards ON columns.board_id = boards.id
      JOIN life_areas ON boards.area_id = life_areas.id
      WHERE projects.id = notes.project_id
      AND life_areas.user_id = auth.uid()
    )
  );

-- Attachments: Users can only manage attachments in their own projects
CREATE POLICY "Users can manage own attachments" ON attachments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN columns ON projects.column_id = columns.id
      JOIN boards ON columns.board_id = boards.id
      JOIN life_areas ON boards.area_id = life_areas.id
      WHERE projects.id = attachments.project_id
      AND life_areas.user_id = auth.uid()
    )
  );

-- Goals: Users can manage their own goals
CREATE POLICY "Users can manage own goals" ON goals
  FOR ALL USING (user_id = auth.uid());

-- Goal Projects: Users can manage links for their own goals
CREATE POLICY "Users can manage own goal_projects" ON goal_projects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM goals
      WHERE goals.id = goal_projects.goal_id
      AND goals.user_id = auth.uid()
    )
  );

-- Habits: Users can manage their own habits
CREATE POLICY "Users can manage own habits" ON habits
  FOR ALL USING (user_id = auth.uid());

-- Habit Logs: Users can manage logs for their own habits
CREATE POLICY "Users can manage own habit_logs" ON habit_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM habits
      WHERE habits.id = habit_logs.habit_id
      AND habits.user_id = auth.uid()
    )
  );

-- Time Entries: Users can manage their own time entries
CREATE POLICY "Users can manage own time_entries" ON time_entries
  FOR ALL USING (user_id = auth.uid());

-- Tags: Users can manage their own tags
CREATE POLICY "Users can manage own tags" ON tags
  FOR ALL USING (user_id = auth.uid());

-- Project Tags: Users can manage tags for their own projects
CREATE POLICY "Users can manage own project_tags" ON project_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN columns ON projects.column_id = columns.id
      JOIN boards ON columns.board_id = boards.id
      JOIN life_areas ON boards.area_id = life_areas.id
      WHERE projects.id = project_tags.project_id
      AND life_areas.user_id = auth.uid()
    )
  );

-- Notifications: Users can manage their own notifications
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());


-- 3. Triggers for Automation

-- Function: Auto-create profile and default life areas on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  work_id uuid;
  personal_id uuid;
  fitness_id uuid;
  finance_id uuid;
  learning_id uuid;
BEGIN
  -- Create Profile
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'display_name');

  -- Create Default Life Areas
  INSERT INTO public.life_areas (user_id, name, icon, color, position)
  VALUES (new.id, 'Work', 'Briefcase', '#3b82f6', 1) RETURNING id INTO work_id;
  
  INSERT INTO public.life_areas (user_id, name, icon, color, position)
  VALUES (new.id, 'Personal', 'Home', '#10b981', 2) RETURNING id INTO personal_id;
  
  INSERT INTO public.life_areas (user_id, name, icon, color, position)
  VALUES (new.id, 'Fitness', 'Dumbbell', '#ef4444', 3) RETURNING id INTO fitness_id;
  
  INSERT INTO public.life_areas (user_id, name, icon, color, position)
  VALUES (new.id, 'Finance', 'Wallet', '#f59e0b', 4) RETURNING id INTO finance_id;
  
  INSERT INTO public.life_areas (user_id, name, icon, color, position)
  VALUES (new.id, 'Learning', 'GraduationCap', '#8b5cf6', 5) RETURNING id INTO learning_id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Function: Auto-create default board and columns for new area
CREATE OR REPLACE FUNCTION public.handle_new_life_area()
RETURNS trigger AS $$
DECLARE
  default_board_id uuid;
BEGIN
  -- Create Default Board
  INSERT INTO public.boards (area_id, name, position)
  VALUES (new.id, 'Main Board', 1)
  RETURNING id INTO default_board_id;

  -- Create Default Columns
  INSERT INTO public.columns (board_id, name, color, position)
  VALUES 
    (default_board_id, 'To Do', '#94a3b8', 1),
    (default_board_id, 'In Progress', '#3b82f6', 2),
    (default_board_id, 'Done', '#10b981', 3);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new area
CREATE TRIGGER on_life_area_created
  AFTER INSERT ON public.life_areas
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_life_area();


-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at (repeat for all tables with updated_at)
CREATE TRIGGER on_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_life_areas_updated BEFORE UPDATE ON life_areas FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_boards_updated BEFORE UPDATE ON boards FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_columns_updated BEFORE UPDATE ON columns FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_notes_updated BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_goals_updated BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER on_habits_updated BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
