CREATE TABLE IF NOT EXISTS application_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  target_year TEXT NOT NULL DEFAULT '2026 Fall',
  status TEXT NOT NULL DEFAULT 'active',
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_plans_user_created
  ON application_plans (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS application_plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES application_plans (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  month_label TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  sort_order INT NOT NULL DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_application_plan_tasks_user_plan
  ON application_plan_tasks (user_id, plan_id, sort_order);

CREATE TABLE IF NOT EXISTS portfolio_task_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_task_groups_user_order
  ON portfolio_task_groups (user_id, sort_order);

CREATE TABLE IF NOT EXISTS portfolio_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES portfolio_task_groups (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'normal',
  sort_order INT NOT NULL DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_tasks_user_group
  ON portfolio_tasks (user_id, group_id, sort_order);

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  last_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_consultations_user_updated
  ON consultations (user_id, updated_at DESC);

ALTER TABLE application_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_plan_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_task_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "application_plans_own_all"
  ON application_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "application_plan_tasks_own_all"
  ON application_plan_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portfolio_task_groups_own_all"
  ON portfolio_task_groups FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portfolio_tasks_own_all"
  ON portfolio_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consultations_own_all"
  ON consultations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
