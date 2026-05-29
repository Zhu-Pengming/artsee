CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE public.ai_conversations
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.ai_messages
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
