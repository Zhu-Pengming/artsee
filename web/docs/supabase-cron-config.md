# Supabase Cron 配置 - Memory Reflection

## 配置步骤

### 1. 在 Supabase Dashboard 配置 cron

进入 Supabase Dashboard → Database → Cron Jobs,添加以下任务:

```sql
-- 每天凌晨 2 点运行 memory-reflection
select cron.schedule(
  'memory-reflection-daily',
  '0 2 * * *',  -- 每天 02:00 UTC
  $$
  select
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/memory-reflection',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
```

### 2. 替换 URL

将 `YOUR_PROJECT_REF` 替换为你的 Supabase 项目 ID。

### 3. 验证 cron 任务

查看已配置的 cron 任务:

```sql
select * from cron.job;
```

### 4. 手动触发测试

```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/memory-reflection' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json'
```

### 5. 查看执行日志

```sql
select * from cron.job_run_details 
where jobid = (select jobid from cron.job where jobname = 'memory-reflection-daily')
order by start_time desc
limit 10;
```

## Reflection 逻辑说明

当前 Reflection 实现了以下功能:

1. **矛盾消解**:如果用户最近说"算了不去英国了"(action='delete'),确保 `target_countries` 里不含英国
2. **合并检测**:同一字段有 3+ 次更新时标记为需要合并(实际合并逻辑可扩展)
3. **按用户分组**:每个用户的画像独立处理

## 后续扩展

可以在 Edge Function 里增加:

- **降权**:长时间未更新的字段降低 confidence
- **去重**:相同内容的多次抽取合并为一条
- **趋势分析**:用户偏好变化趋势(如从"想去英国"→"不去英国"的转变)
- **通知**:检测到矛盾时通知前端弹确认框

## 注意事项

- Edge Function 需要先部署:`supabase functions deploy memory-reflection`
- cron 任务需要 `pg_cron` 扩展,Supabase 默认已启用
- 确保 service role key 已配置在 Supabase secrets
