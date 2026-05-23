# Database Migrations

## How to Run Migrations

### Using Supabase CLI (Recommended)

```bash
# Connect to your project
supabase link --project-ref your-project-ref

# Run a specific migration
supabase db push --file docs/migrations/007-chat-logs.sql
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of the migration file
4. Execute the SQL

### Using psql

```bash
psql postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres \
  -f docs/migrations/007-chat-logs.sql
```

## Migration Files

### 007-chat-logs.sql (Phase 0.4)
**Purpose**: Add conversation logging for evaluation and analytics

**Tables Created**:
- `chat_logs`: Stores all chat/consult interactions

**Indexes Created**:
- `idx_chat_logs_user_time`: Query logs by user and time
- `idx_chat_logs_intent_time`: Query logs by intent and time
- `idx_chat_logs_route`: Query logs by route (chat/consult)

**Privacy Considerations**:
- Contains user queries and answers
- Ensure compliance before enabling in production
- Consider adding data retention policy
- May need user consent depending on jurisdiction

**Verification**:
```sql
-- Check table exists
SELECT * FROM chat_logs LIMIT 1;

-- Check indexes
SELECT indexname FROM pg_indexes WHERE tablename = 'chat_logs';
```

## Rollback

To rollback the chat_logs migration:

```sql
DROP TABLE IF EXISTS chat_logs CASCADE;
```

## Next Migrations

- `008-chunk-source-metadata.sql` (Phase 2.1): Add source metadata to chunks
- `009-wiki-conflicts.sql` (Phase 2.4): Track conflicting information
- `010-entity-pages.sql` (Phase 5.1): LLM-compiled entity pages
