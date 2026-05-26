// @ts-nocheck
'use client';

export async function chatWithAI(messages: { role: 'user' | 'model', text: string }[]) {
  const latest = messages[messages.length - 1]?.text?.trim();

  if (!latest) {
    return '告诉我你的作品集、院校或创作问题，我会先帮你拆成可执行的下一步。';
  }

  try {
    const { askConsultant } = await import('./platformApi');
    const answer = await askConsultant(latest);
    if (answer) return answer;
  } catch (error) {
    console.warn('[artiqore-ui] AI consult fallback:', error);
  }

  return `我先按「艺见心」的顾问逻辑帮你梳理：${latest}\n\n建议先从目标、作品集叙事、院校匹配和时间线四个维度拆解。后端 AI 暂时不可用时，这里会先给出可执行的基础拆解。`;
}

export async function analyzeInstitutions(institutions: any[]) {
  const names = institutions.map((item) => item?.name).filter(Boolean).join('、');

  try {
    const { analyzeInstitutionsWithBackend } = await import('./platformApi');
    const result = await analyzeInstitutionsWithBackend(institutions);
    if (result) {
      if (typeof result === 'string') return result;
      return JSON.stringify(result, null, 2);
    }
  } catch (error) {
    console.warn('[artiqore-ui] AI analyze fallback:', error);
  }

  return [
    `已选择院校：${names || '暂未选择院校'}`,
    '',
    '核心判断：先看专业方向与导师资源，再看作品集气质是否匹配，最后用预算、签证与就业路径做现实校准。',
    '',
    '后端 AI 分析暂时不可用时，这里会先生成基础择校判断。',
  ].join('\n');
}
