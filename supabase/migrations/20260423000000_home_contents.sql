-- 首页内容管理表：支持主视觉Banner、热门展厅、近期展会等板块
CREATE TABLE IF NOT EXISTS home_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type TEXT NOT NULL CHECK (section_type IN ('hero_banner', 'hot_hall', 'recent_exhibition')),
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  link_text TEXT,
  badge TEXT,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_home_contents_section_type ON home_contents(section_type);
CREATE INDEX IF NOT EXISTS idx_home_contents_display_order ON home_contents(display_order);
CREATE INDEX IF NOT EXISTS idx_home_contents_is_active ON home_contents(is_active);

-- RLS
ALTER TABLE home_contents ENABLE ROW LEVEL SECURITY;

-- 公开读（所有人均可查询，API层再做 is_active 过滤）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'home_contents' AND policyname = 'home_contents_select_all'
  ) THEN
    CREATE POLICY home_contents_select_all ON home_contents
      FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'home_contents' AND policyname = 'home_contents_insert_admin'
  ) THEN
    CREATE POLICY home_contents_insert_admin ON home_contents
      FOR INSERT WITH CHECK (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'home_contents' AND policyname = 'home_contents_update_admin'
  ) THEN
    CREATE POLICY home_contents_update_admin ON home_contents
      FOR UPDATE USING (false);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'home_contents' AND policyname = 'home_contents_delete_admin'
  ) THEN
    CREATE POLICY home_contents_delete_admin ON home_contents
      FOR DELETE USING (false);
  END IF;
END
$$;

-- 插入初始数据（从 Flutter App 首页硬编码提取）

-- Hero Banner
INSERT INTO home_contents (section_type, title, subtitle, image_url, link_text, badge, display_order, is_active)
VALUES (
  'hero_banner',
  '灵感碎片的万合\n青花新境',
  'SPECIAL / 陶瓷重构专场',
  'https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=2000',
  '立即观展 (Virtual Access)',
  NULL,
  0,
  true
);

-- Hot Halls（热门展厅）
INSERT INTO home_contents (section_type, title, subtitle, image_url, badge, display_order, is_active)
VALUES
  ('hot_hall', '解构青花：数字维度的传统重塑', NULL, 'https://images.unsplash.com/photo-1626074311105-0255c4d3609c?auto=format&fit=crop&q=80&w=800', 'LIVE NOW', 0, true),
  ('hot_hall', '媒介考古：模拟时代的感官记忆', NULL, 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800', 'LIVE NOW', 1, true),
  ('hot_hall', '光影变迁：叙事性空间的数字边界', NULL, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800', 'LIVE NOW', 2, true),
  ('hot_hall', '赛博禅意：机械冥想与算法秩序', NULL, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800', 'LIVE NOW', 3, true),
  ('hot_hall', '极简空间：光影与白墙的对话', NULL, 'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=800', 'LIVE NOW', 4, true);

-- Recent Exhibitions（近期展会）
INSERT INTO home_contents (section_type, title, subtitle, image_url, badge, display_order, is_active)
VALUES
  ('recent_exhibition', '威尼斯双年展中国馆主题发布', NULL, 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200', NULL, 0, true),
  ('recent_exhibition', '西岸美术馆：丝绸与光影', NULL, 'https://images.unsplash.com/photo-1554188248-986adbb73be4?auto=format&fit=crop&q=80&w=800', NULL, 1, true),
  ('recent_exhibition', '当代摄影：城市褶皱', NULL, 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800', NULL, 2, true);

NOTIFY pgrst, 'reload schema';
