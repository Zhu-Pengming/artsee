CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  summary TEXT,
  content TEXT,
  category TEXT NOT NULL DEFAULT '申请策略',
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  cover_url TEXT,
  source TEXT,
  author_name TEXT,
  read_count INT NOT NULL DEFAULT 0 CHECK (read_count >= 0),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  publish_status TEXT NOT NULL DEFAULT 'published'
    CHECK (publish_status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_articles_status_published
  ON articles (publish_status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category_published
  ON articles (category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured_order
  ON articles (is_featured, display_order, published_at DESC);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'articles' AND policyname = 'articles_public_read_published'
  ) THEN
    CREATE POLICY articles_public_read_published ON articles
      FOR SELECT USING (publish_status = 'published');
  END IF;
END $$;

INSERT INTO articles (
  title, subtitle, summary, category, tags, cover_url, source, author_name,
  read_count, is_featured, display_order, publish_status, published_at
) VALUES
  (
    '从作品集到职业路径：艺术申请的新决策模型',
    'Portfolio to Career Path',
    '拆解艺术申请中院校选择、作品集叙事、导师资源与就业路径之间的真实关系。',
    '申请策略',
    ARRAY['作品集', '择校', '职业路径'],
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200',
    'Artiqore Editorial',
    '艺见心研究室',
    12800,
    true,
    1,
    'published',
    now() - interval '1 day'
  ),
  (
    '2026 英国艺术留学申请时间线：作品集、语言与面试节点',
    'UK Art Application Timeline',
    '按月份梳理英国艺术院校申请关键节点，帮助申请者建立作品集与材料节奏。',
    '申请策略',
    ARRAY['英国', '时间线', '面试'],
    NULL,
    'Artiqore Editorial',
    '申请策略组',
    9400,
    false,
    2,
    'published',
    now() - interval '2 days'
  ),
  (
    'RCA 与 UAL 的真实差异：研究导向、商业网络与就业路径',
    'RCA vs UAL',
    '从研究机制、专业矩阵、城市资源、商业合作和毕业去向对比两类院校路径。',
    '院校对比',
    ARRAY['RCA', 'UAL', '院校对比'],
    NULL,
    'Artiqore Editorial',
    '院校研究组',
    7600,
    false,
    3,
    'published',
    now() - interval '3 days'
  ),
  (
    'AIGC 进入作品集后，导师到底在看什么？',
    'AI Portfolio Review',
    '当生成式 AI 成为创作工具，作品集评价会更关注问题意识、过程证据和媒介判断。',
    '作品集',
    ARRAY['AIGC', '作品集', '导师视角'],
    NULL,
    'Artiqore Editorial',
    '作品集诊断组',
    5900,
    false,
    4,
    'published',
    now() - interval '4 days'
  )
ON CONFLICT (id) DO NOTHING;
