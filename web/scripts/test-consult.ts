import dotenv from 'dotenv';
import path from 'path';
import fsSync from 'fs';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fsSync.existsSync(envPath)) {
  const envContent = fsSync.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

async function testConsultAPI() {
  const baseUrl = 'http://localhost:3000';

  console.log('\n🧪 测试 1: 纯检索测试\n');
  
  const searchResponse = await fetch(`${baseUrl}/api/v1/knowledge/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: '安特卫普的服装设计专业怎么样？',
      matchCount: 3,
      matchThreshold: 0.5,
    }),
  });

  const searchData = await searchResponse.json();
  console.log('检索结果:');
  console.log(`- 找到 ${searchData.count} 个相关片段`);
  searchData.results?.forEach((r: any, idx: number) => {
    console.log(`\n${idx + 1}. ${r.schoolName} - ${r.headingPath}`);
    console.log(`   相似度: ${(r.similarity * 100).toFixed(1)}%`);
    console.log(`   内容预览: ${r.chunkText.substring(0, 100)}...`);
  });

  console.log('\n\n🧪 测试 2: 短问答模式\n');

  const consultResponse = await fetch(`${baseUrl}/api/v1/ai/consult`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Antwerp Royal Academy 的服装设计专业适合我申请研究生吗？',
      schoolId: '3fff1780-23e6-453e-b82d-2a603ecef497',
      mode: 'short',
      userProfile: {
        stage: '研究生申请',
        major: '服装设计',
        targetCountry: '欧洲',
      },
    }),
  });

  const consultData = await consultResponse.json();
  console.log('AI 回答:');
  console.log(consultData.answer);
  console.log('\n引用来源:');
  consultData.sources?.forEach((s: any, idx: number) => {
    console.log(`${idx + 1}. ${s.schoolName} - ${s.heading} (${(s.similarity * 100).toFixed(1)}%)`);
  });

  console.log('\n\n🧪 测试 3: 深度报告模式\n');

  const reportResponse = await fetch(`${baseUrl}/api/v1/ai/consult`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: '请帮我分析 Antwerp Royal Academy 是否适合我，并给出申请建议',
      schoolId: '3fff1780-23e6-453e-b82d-2a603ecef497',
      mode: 'report',
      userProfile: {
        stage: '研究生申请',
        major: '服装设计',
        targetCountry: '欧洲',
        budget: '中等',
        languageLevel: '雅思 6.5',
      },
    }),
  });

  const reportData = await reportResponse.json();
  console.log('深度报告:');
  console.log(reportData.answer);
  console.log('\n引用来源数量:', reportData.sources?.length);
}

testConsultAPI().catch((error) => {
  console.error('\n❌ 测试失败:', error.message);
  console.error(error.stack);
  process.exit(1);
});
