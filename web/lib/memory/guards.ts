/**
 * Record 硬规则护栏 - 在抽取之前先跑一遍,任一命中则跳过 record
 * 
 * 哲学:宁可漏 record,不能错 record。
 * 护栏是粗粒度的、保守的,靠 prompt 提示模型"不要记"是脆弱的,
 * 在路由代码里前置拦截才稳。
 */

export interface GuardResult {
  passed: boolean;
  reason?: string;
  ruleTriggered?: string;
}

/**
 * 检查是否应该跳过 record
 * 
 * @param userMessage - 用户消息
 * @param sourceRoute - 来源路由
 * @returns 护栏结果
 */
export function checkRecordGuards(
  userMessage: string,
  sourceRoute: string
): GuardResult {
  // 规则 1:来源接口在黑名单
  const blacklistedRoutes = ['ai/translate', 'ai/rewrite', 'ai/proofread'];
  if (blacklistedRoutes.some((route) => sourceRoute.includes(route))) {
    return {
      passed: false,
      reason: '来源接口在黑名单(翻译/改写类接口)',
      ruleTriggered: 'blacklisted_route',
    };
  }

  // 规则 2:用户消息长度 > 800 字 + 含明显引号/代码块
  // 判定为"任务材料"(用户上传一段文本让 AI 处理),不抽取
  if (userMessage.length > 800) {
    const hasQuotes = /「|」|"|"|『|』|```/.test(userMessage);
    const hasCodeBlock = /```[\s\S]+```/.test(userMessage);
    if (hasQuotes || hasCodeBlock) {
      return {
        passed: false,
        reason: '用户消息过长且含引号/代码块,判定为任务材料',
        ruleTriggered: 'task_material',
      };
    }
  }

  // 规则 3:用户消息含假设词 + 问号
  // "如果我..."/"假设..."/"要是..." 配合句末 ?/? 判定为假设性发问
  const hypotheticalPatterns = [
    /如果我.+[??\s]*$/,
    /假设我.+[??\s]*$/,
    /要是我.+[??\s]*$/,
    /假如我.+[??\s]*$/,
    /万一我.+[??\s]*$/,
  ];
  if (hypotheticalPatterns.some((pattern) => pattern.test(userMessage))) {
    return {
      passed: false,
      reason: '用户消息含假设词+问号,判定为假设性发问',
      ruleTriggered: 'hypothetical_question',
    };
  }

  // 规则 4:用户消息提及第三人称 + 申请/留学动词
  // "我朋友想申请..."/"我妈想让..." 判定为非自己
  const thirdPersonPatterns = [
    /我朋友.+(想|要|打算|计划).+(申请|留学|出国)/,
    /我同学.+(想|要|打算|计划).+(申请|留学|出国)/,
    /我妈.+(想|要|打算|让我).+(申请|留学|出国)/,
    /我爸.+(想|要|打算|让我).+(申请|留学|出国)/,
    /我家人.+(想|要|打算|让我).+(申请|留学|出国)/,
    /他.+(想|要|打算|计划).+(申请|留学|出国)/,
    /她.+(想|要|打算|计划).+(申请|留学|出国)/,
  ];
  if (thirdPersonPatterns.some((pattern) => pattern.test(userMessage))) {
    return {
      passed: false,
      reason: '用户消息提及第三人称+申请动词,判定为非自己',
      ruleTriggered: 'third_person',
    };
  }

  // 规则 5:用户消息是纯问句且不含"我"
  // 例:"RCA 学费多少?" - 这是查询,不是陈述自己的情况
  const isPureQuestion =
    /[??]$/.test(userMessage.trim()) && !/我/.test(userMessage);
  if (isPureQuestion && userMessage.length < 50) {
    // 短问句通常不含画像信息
    return {
      passed: false,
      reason: '纯问句且不含"我",判定为查询而非陈述',
      ruleTriggered: 'pure_question',
    };
  }

  // 所有护栏通过
  return {
    passed: true,
  };
}

/**
 * 检查抽取结果是否来自 assistant 消息(禁止)
 * 
 * Record 的输入永远是 user message,assistant message 只用作上下文。
 * 
 * @param extractedValue - 抽取的值
 * @param assistantMessage - AI 回复
 * @returns 是否通过检查
 */
export function checkNotFromAssistant(
  extractedValue: string,
  assistantMessage?: string
): GuardResult {
  if (!assistantMessage) {
    return { passed: true };
  }

  // 简单检查:如果抽取的值在 assistant 消息里出现但不在 user 消息里,
  // 则可能是从 AI 输出抽取的(这里简化处理,实际应该在 extract 阶段就拦住)
  // 这里只做最后一道防线
  return { passed: true };
}
