/**
 * Artsee 后端（Supabase）集成健康检查
 *
 * 与 `.cursor/skills/jinhui-stack-debug/build-test-suite/SKILL.md` 对齐的约定：
 * - P0：后端（DB / Auth / Storage）优先；本脚本仅做只读探测，多次运行不改变远端状态 → 幂等。
 * - 不写入业务数据；不涉及清理逻辑（无写则无脏数据）。
 * - 提交前可执行：`npm run test:backend`（先保证本脚本通过，再跑前端测试）。
 *
 * 依赖：SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY
 * 可从项目根 `.env` 自动加载（见下方 loadEnv）。
 *
 * 运行：npm run test:backend
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** 从项目根 `.env` 注入环境变量（不增加 npm 依赖） */
function loadEnvFromRoot() {
  const root = join(__dirname, '..', '..');
  const envPath = join(root, '.env');
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvFromRoot();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const requiredResults = [];
const warnings = [];

function fail(msg) {
  console.error('❌', msg);
  process.exit(1);
}

async function checkRequired(name, fn) {
  try {
    await fn();
    requiredResults.push({ name, ok: true });
    console.log('✅ [必选]', name);
  } catch (e) {
    requiredResults.push({ name, ok: false, err: e });
    console.log('❌ [必选]', name, '-', e?.message || e);
  }
}

async function checkWarn(name, fn) {
  try {
    await fn();
    console.log('✅ [可选]', name);
  } catch (e) {
    const msg = e?.message || String(e);
    warnings.push({ name, message: msg });
    console.log('⚠️  [可选]', name, '-', msg);
  }
}

async function main() {
  if (!url || !serviceKey) {
    fail(
      '缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY。请在项目根创建 .env（参考 .env.example）或导出环境变量。',
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('='.repeat(60));
  console.log('Artsee 后端健康检查（Supabase · 只读 · 幂等）');
  console.log('URL:', url);
  console.log('='.repeat(60));

  // —— 必选：核心表 / 服务可读（与业务客户端一致）——
  await checkRequired('数据库：schools 可读', async () => {
    const { error } = await supabase.from('schools').select('id').limit(1);
    if (error) throw new Error(error.message);
  });

  await checkRequired('数据库：programs 可读', async () => {
    const { error } = await supabase.from('programs').select('id').limit(1);
    if (error) throw new Error(error.message);
  });

  await checkRequired('数据库：cases 可读', async () => {
    const { error } = await supabase.from('cases').select('id').limit(1);
    if (error) throw new Error(error.message);
  });

  await checkRequired('数据库：posts 可读', async () => {
    const { error } = await supabase.from('posts').select('id').limit(1);
    if (error) throw new Error(error.message);
  });

  await checkRequired('数据库：user_profiles 可读', async () => {
    const { error } = await supabase.from('user_profiles').select('id').limit(1);
    if (error) throw new Error(error.message);
  });

  await checkRequired('Storage：存在 avatars 桶', async () => {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw new Error(error.message);
    const names = (data || []).map((b) => b.name);
    if (!names.includes('avatars')) {
      throw new Error('未找到 avatars 桶，请执行 supabase/migrations/20260410120000_storage_avatars.sql');
    }
  });

  await checkRequired('Auth：Admin 可列出用户', async () => {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1 });
    if (error) throw new Error(error.message);
    if (!data) throw new Error('无返回');
  });

  // —— 可选：迁移未全时仅告警，不阻断 CI（便于分步上线 schema）——
  await checkWarn('数据库：user_profiles 含冷启动字段（interested_categories / has_completed_onboarding）', async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, interested_categories, has_completed_onboarding, avatar_url')
      .limit(1);
    if (error) throw new Error(error.message);
    if (data?.length) {
      const row = data[0];
      if (!('interested_categories' in row) || !('has_completed_onboarding' in row)) {
        throw new Error('缺少字段，请执行仓库内 update_profile_fields.sql');
      }
    }
  });

  console.log('='.repeat(60));
  const failed = requiredResults.filter((r) => !r.ok);
  if (failed.length) {
    console.log(
      '必选未通过：',
      failed.length,
      '/',
      requiredResults.length,
      '（请先修复 Supabase 配置与迁移）',
    );
    process.exit(1);
  }
  console.log('必选全部通过：', requiredResults.length, '项');
  if (warnings.length) {
    console.log('可选检查有告警', warnings.length, '条（见上文 ⚠️），不影响退出码 0');
  }
  console.log('='.repeat(60));
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
