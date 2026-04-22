/**
 * 在 Supabase 中确保存在「开发者测试账号」（Auth + user_profiles）。
 * 需环境变量：SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY（勿提交仓库）
 *
 * 运行：npm run ensure:dev-user
 */
import { createClient } from '@supabase/supabase-js';

const DEV_EMAIL = 'dev.test@artsee.app';
const DEV_PASSWORD = 'ArtseeDev2026!';
const DEV_NICKNAME = 'Artsee开发者';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('请设置 SUPABASE_URL 与 SUPABASE_SERVICE_ROLE_KEY（见 .env.example）');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  console.log('检查 / 创建开发者测试账号:', DEV_EMAIL);

  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({
    perPage: 200,
  });
  if (listErr) throw listErr;

  let userId = list.users.find((u) => u.email === DEV_EMAIL)?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: DEV_EMAIL,
      password: DEV_PASSWORD,
      email_confirm: true,
      user_metadata: { nickname: DEV_NICKNAME },
    });
    if (error) {
      console.error('createUser 失败:', error.message);
      process.exit(1);
    }
    userId = data.user.id;
    console.log('已创建 Auth 用户:', userId);
  } else {
    console.log('Auth 用户已存在:', userId);
  }

  let { error: upErr } = await supabase.from('user_profiles').upsert(
    { id: userId, nickname: DEV_NICKNAME, role: 'admin' },
    { onConflict: 'id' },
  );
  if (upErr) {
    console.warn('带 role=admin 的 upsert 失败，尝试仅 nickname:', upErr.message);
    upErr = (
      await supabase.from('user_profiles').upsert(
        { id: userId, nickname: DEV_NICKNAME },
        { onConflict: 'id' },
      )
    ).error;
    if (upErr) {
      console.error('user_profiles upsert 失败:', upErr.message);
      process.exit(1);
    }
    console.warn('已降级写入（未设置 role）— 请为 user_profiles 增加 role 列后重跑本脚本。');
  } else {
    console.log('user_profiles 已写入 id、nickname、role=admin。');
  }

  const { error: exErr } = await supabase
    .from('user_profiles')
    .update({
      has_completed_onboarding: true,
      interested_categories: ['painting', 'design', 'digital_art'],
    })
    .eq('id', userId);
  if (exErr) {
    console.warn(
      '冷启动字段未更新（若数据库尚未执行 update_profile_fields.sql 可忽略）:',
      exErr.message,
    );
  } else {
    console.log('冷启动字段已同步。');
  }
  console.log('完成。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
