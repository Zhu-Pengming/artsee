CREATE TABLE IF NOT EXISTS community_hot_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  tag TEXT NOT NULL DEFAULT '🔥 争议',
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('艺术留学', '作品集', '行业就业', '艺术市场')),
  participant_count INT NOT NULL DEFAULT 0 CHECK (participant_count >= 0),
  sort_order INT NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(answers) = 'array'),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'hidden', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_community_hot_topics_status_order
  ON community_hot_topics (status, is_pinned DESC, sort_order, participant_count DESC);

CREATE INDEX IF NOT EXISTS idx_community_hot_topics_category
  ON community_hot_topics (category);

CREATE INDEX IF NOT EXISTS idx_community_hot_topics_theme
  ON community_hot_topics ((metadata->>'theme'));

ALTER TABLE community_hot_topics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_hot_topics_select_published" ON community_hot_topics;

CREATE POLICY "community_hot_topics_select_published"
  ON community_hot_topics FOR SELECT
  USING (status = 'published');

WITH seed(slug, tag, title, category, participant_count, sort_order, is_pinned, answers, metadata) AS (
  VALUES
  (
    'ai-art-award-progress-or-cheating',
    '🔥 争议',
    'AI绘画拿大奖，这是艺术的进步还是作弊？',
    '行业就业',
    156,
    1,
    true,
    jsonb_build_array(
      jsonb_build_object('stance', '正方·进步论', 'content', '摄影术诞生时也被骂"不是艺术"，现在呢？AI是新的画笔，工具无罪，看你怎么用。'),
      jsonb_build_object('stance', '反方·作弊论', 'content', '输入提示词和艺术家三十年功底画出来的放一起评奖，这对人类创作者就是侮辱。'),
      jsonb_build_object('stance', '中间派·语境论', 'content', '关键看奖项定义。如果是"数字艺术奖"没问题，如果是"传统绘画奖"就是作弊。'),
      jsonb_build_object('stance', '激进派·淘汰论', 'content', '美院学生还在手绘，商业插画师已经被AI取代了。这不是艺术问题，是生存问题。'),
      jsonb_build_object('stance', '怀疑派·资本论', 'content', '每次"AI艺术获奖"都是营销事件。画廊和科技公司合谋，炒作比创作重要。')
    ),
    jsonb_build_object('theme', 'AI科技', 'group', 'AI与科技冲击')
  ),
  (
    'midjourney-dead-artist-style',
    '🔥 争议',
    '用Midjourney"致敬"已故画家的风格，是传承还是盗窃？',
    '艺术市场',
    128,
    2,
    true,
    jsonb_build_array(
      jsonb_build_object('stance', '传承派', 'content', '梵高生前也被模仿，艺术史就是风格遗传史。AI只是加速了这个过程。'),
      jsonb_build_object('stance', '盗窃派', 'content', '模仿和喂图训练是两回事。你让AI学1000张莫奈，产出算谁的？莫奈后人同意了吗？'),
      jsonb_build_object('stance', '法律派', 'content', '版权法管不了风格。但管得了数据集。如果训练图没授权，平台该被告。'),
      jsonb_build_object('stance', '实用派', 'content', '客户要"莫奈风格海报"，我手绘3天，AI出图3分钟。你选哪个？'),
      jsonb_build_object('stance', '悲观派', 'content', '以后只有活着的艺术家能维权，死去的变成免费数据库。艺术史成了开源代码。')
    ),
    jsonb_build_object('theme', 'AI科技', 'group', 'AI与科技冲击')
  ),
  (
    'virtual-curator-replace-physical-curation',
    '🔥 争议',
    '虚拟策展人会取代实体策展吗？',
    '行业就业',
    89,
    3,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '技术乐观派', 'content', '线上策展成本是实体的1/10，触达人数是100倍。疫情已经证明了虚拟空间的可能性。'),
      jsonb_build_object('stance', '体验保守派', 'content', '策展是空间叙事，是身体在场。VR再真，也没有站在《葵》面前那种压迫感。'),
      jsonb_build_object('stance', '中间派·融合论', 'content', '未来是"实体展览+虚拟延伸"，不是取代。线上做预告和档案，线下做仪式和交易。'),
      jsonb_build_object('stance', '批判派', 'content', '虚拟策展本质是平台垄断。谁控制服务器，谁就控制艺术史的写法。'),
      jsonb_build_object('stance', '从业者焦虑', 'content', '我刚考上策展硕士，导师说"学会写代码比学会写展评更重要"。该信吗？')
    ),
    jsonb_build_object('theme', 'AI科技', 'group', 'AI与科技冲击')
  ),
  (
    'nft-bubble-digital-art-future',
    '🔥 争议',
    'NFT泡沫破了，数字艺术还有未来吗？',
    '艺术市场',
    203,
    4,
    true,
    jsonb_build_array(
      jsonb_build_object('stance', '泡沫派', 'content', '本来就是洗钱和投机。Beeple卖6900万是资本游戏，不是艺术价值。'),
      jsonb_build_object('stance', '技术派', 'content', '泡沫是泡沫，区块链确权是真实的。数字艺术需要所有权证明，NFT只是第一代方案。'),
      jsonb_build_object('stance', '创作者派', 'content', '我卖NFT赚了第一桶金，够付一年工作室租金。对年轻艺术家，它是融资渠道。'),
      jsonb_build_object('stance', '机构派', 'content', '泰特现代馆还在收NFT。泡沫破了，好作品留下来了。和2000年互联网泡沫一样。'),
      jsonb_build_object('stance', '怀疑派', 'content', '数字艺术未来在，但不一定叫NFT。名字臭了，换张皮继续。')
    ),
    jsonb_build_object('theme', 'AI科技', 'group', 'AI与科技冲击')
  ),
  (
    'should-art-schools-teach-ai-tools',
    '🔥 争议',
    '美院该教AI工具课吗？',
    '艺术留学',
    76,
    5,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '改革派', 'content', '不教AI的美院和拒绝教摄影的美院一样愚蠢。学生毕业即失业，谁负责？'),
      jsonb_build_object('stance', '保守派', 'content', '美院教的是"观看方式"，不是软件操作。AI课去培训班上，别占学分。'),
      jsonb_build_object('stance', '折中派', 'content', '该教，但放在"批判性使用"框架里。让学生知道AI的偏见、版权问题和伦理边界。'),
      jsonb_build_object('stance', '学生视角', 'content', '我想学，但不想学校教。学校教的AI版本永远落后市场三年。'),
      jsonb_build_object('stance', '国际比较', 'content', 'RCA已经有AI艺术方向了，央美还在讨论"要不要开"。差距不在技术，在决策速度。')
    ),
    jsonb_build_object('theme', 'AI科技', 'group', 'AI与科技冲击')
  ),
  (
    'rca-one-year-master-water-degree',
    '🔥 争议',
    '皇家艺术学院一年制硕士是不是"水学历"？',
    '艺术留学',
    245,
    6,
    true,
    jsonb_build_array(
      jsonb_build_object('stance', '辩护派', 'content', 'RCA一年压缩的是假期，不是课程密度。每天睡5小时，比国内三年硕士累多了。'),
      jsonb_build_object('stance', '质疑派', 'content', '一年能做什么？作品集刚做完就毕业，连展览都没策过。花钱买title而已。'),
      jsonb_build_object('stance', '比较派', 'content', '美国MFA两年，英国一年。但美国贵一倍。时间不是标准，投入产出比才是。'),
      jsonb_build_object('stance', '雇主视角', 'content', '招过RCA毕业生，动手能力不如国内美院本科生，但概念包装能力强。看岗位需求。'),
      jsonb_build_object('stance', '亲历者', 'content', '水不水看个人。有人一年做3个项目，有人一年做1个项目。学校给平台，怎么用看自己。')
    ),
    jsonb_build_object('theme', '教育体制', 'group', '院校与教育体制')
  ),
  (
    'art-high-school-route-destroying-kids',
    '🔥 争议',
    '国内美院附中 vs 国际艺术高中，哪条路线在"毁掉"孩子？',
    '艺术留学',
    167,
    7,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '附中辩护', 'content', '附中训练的是真功夫。素描色彩构图，这些底子国际高中教吗？艺考改革后附中更香了。'),
      jsonb_build_object('stance', '国际派', 'content', '附中培养的是"考试机器"，国际高中培养的是"创作者"。思维差异从15岁就定了。'),
      jsonb_build_object('stance', '家长焦虑', 'content', '两条路都贵。附中要北京户口，国际高中一年30万。普通家庭的孩子怎么办？'),
      jsonb_build_object('stance', '回流者', 'content', '我附中毕业去RISD，发现附中那套"全因素素描"根本用不上，重新学了三年。'),
      jsonb_build_object('stance', '现实派', 'content', '看目标。想考央美国美，附中好。想申RCA耶鲁，国际高中好。没有绝对答案。')
    ),
    jsonb_build_object('theme', '教育体制', 'group', '院校与教育体制')
  ),
  (
    'portfolio-agency-diy-anxiety',
    '🔥 争议',
    '作品集机构代做和DIY申请，谁在制造焦虑？',
    '作品集',
    312,
    8,
    true,
    jsonb_build_array(
      jsonb_build_object('stance', 'DIY骄傲派', 'content', '作品集是自我梳理的过程，代做的拿到offer也读不下去。机构贩卖的是"捷径幻觉"。'),
      jsonb_build_object('stance', '机构辩护派', 'content', '信息差客观存在。学校官网不会告诉你"教授今年讨厌粉色"，机构知道。这是知识付费。'),
      jsonb_build_object('stance', '受害者派', 'content', '被机构坑了8万，模板化作品集，全聚德。现在DIY重申请，机构不退费。'),
      jsonb_build_object('stance', '旁观者清', 'content', '机构和DIY都不制造焦虑，焦虑来自"每年录取率5%"。市场供需问题。'),
      jsonb_build_object('stance', '折中派', 'content', '机构做"信息整合和流程管理"，创作必须自己做。边界不清，才出问题。')
    ),
    jsonb_build_object('theme', '教育体制', 'group', '院校与教育体制')
  ),
  (
    'studio-teaching-vs-tutorial',
    '🔥 争议',
    'Studio制教学 vs 导师制，哪种更能培养艺术家？',
    '艺术留学',
    98,
    9,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', 'Studio派', 'content', '耶鲁、哥大的Studio制，同学互相 critique，比导师一对一更能模拟真实艺术生态。'),
      jsonb_build_object('stance', '导师派', 'content', '英国导师制，每周和导师深聊2小时，针对性更强。Studio制容易变成"小圈子互捧"。'),
      jsonb_build_object('stance', '中国问题', 'content', '国内美院说是Studio制，实际是大班放羊。导师制？导师一年见学生两次。'),
      jsonb_build_object('stance', '结果论', 'content', '看毕业生。RISD Studio制出了多少画廊代理艺术家？Slade导师制呢？数据说话。'),
      jsonb_build_object('stance', '个人适配', 'content', '自律的人适合Studio，需要push的人适合导师制。选学校先选教学模式，再选排名。')
    ),
    jsonb_build_object('theme', '教育体制', 'group', '院校与教育体制')
  ),
  (
    'interdisciplinary-application-trend-or-trap',
    '🔥 争议',
    '跨学科申请是趋势还是陷阱？',
    '艺术留学',
    134,
    10,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '趋势派', 'content', 'RCA的IDE、UAL的CCI，纯跨学科项目。未来艺术家必须懂代码、生物、社会学。'),
      jsonb_build_object('stance', '陷阱派', 'content', '什么都学等于什么都不精。申请时吹"跨学科"，毕业时发现没有核心技能找工作。'),
      jsonb_build_object('stance', '策略派', 'content', '跨学科是申请策略。本科纯艺，申硕士转交互，增加录取率。但入学后可能后悔。'),
      jsonb_build_object('stance', '雇主视角', 'content', '招设计师，看到"跨学科"作品集，第一反应是"你到底会什么？"'),
      jsonb_build_object('stance', '理想派', 'content', '达芬奇就是跨学科。问题不是跨不跨，是教育有没有给你真正的跨学科资源。')
    ),
    jsonb_build_object('theme', '教育体制', 'group', '院校与教育体制')
  ),
  (
    'young-artist-gallery-or-social-media',
    '🔥 争议',
    '年轻艺术家该先画廊签约还是先做自媒体？',
    '艺术市场',
    189,
    11,
    true,
    jsonb_build_array(
      jsonb_build_object('stance', '画廊派', 'content', '画廊是信用背书。没画廊记录，拍卖行不会理你，收藏家不敢买。自媒体粉丝不值钱。'),
      jsonb_build_object('stance', '自媒体派', 'content', '小红书10万粉能直接变现，画廊签约前三年可能倒贴。先活下来，再谈艺术。'),
      jsonb_build_object('stance', '中间派', 'content', '两手抓。自媒体做流量，画廊做深度。但精力有限，必然有侧重。'),
      jsonb_build_object('stance', '批判派', 'content', '自媒体逻辑是"取悦算法"，画廊逻辑是"取悦策展人"。两个都偏离"创作本身"。'),
      jsonb_build_object('stance', '数据派', 'content', '2024年Art Basel报告，45%藏家通过Instagram发现艺术家。不做自媒体等于放弃渠道。')
    ),
    jsonb_build_object('theme', '市场价值', 'group', '市场与价值')
  ),
  (
    'chinese-contemporary-art-auction-same-names',
    '🔥 争议',
    '为什么中国当代艺术在国际拍卖行总是"那几个名字"？',
    '艺术市场',
    156,
    12,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '市场现实', 'content', '拍卖行要流动性。张晓刚、曾梵志有二级市场，新名字谁敢举牌？这是金融逻辑。'),
      jsonb_build_object('stance', '文化偏见', 'content', '西方对中国艺术的期待是"政治符号"。你画抽象，他问你"这是不是隐喻？"'),
      jsonb_build_object('stance', '生态问题', 'content', '国内没有成熟的画廊-批评-收藏体系。艺术家直接跳到拍卖，没有中间层积累。'),
      jsonb_build_object('stance', '创作者辩护', 'content', '年轻艺术家不是不想进拍卖，是画廊不推。资源垄断，不是创作问题。'),
      jsonb_build_object('stance', '乐观派', 'content', '90后艺术家已经在改变。陈飞、欧阳春的价格在涨，名单在更新，只是慢。')
    ),
    jsonb_build_object('theme', '市场价值', 'group', '市场与价值')
  ),
  (
    'zero-budget-first-solo-show-shanghai',
    '💬 求助',
    '零预算怎么在上海做第一场个展？',
    '艺术市场',
    67,
    13,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '空间游击', 'content', '咖啡馆、书店、共享办公空间，免费借场地。我第一场展在健身房，流量意外好。'),
      jsonb_build_object('stance', '众筹派', 'content', '用"预售作品"换展览成本。卖10张版画，每张3000，覆盖3万预算。'),
      jsonb_build_object('stance', '联合策展', 'content', '找5个艺术家分摊成本。每人出5000，租空间一周。风险共担，互相引流。'),
      jsonb_build_object('stance', '线上替代', 'content', '先做线上展览，用3D展厅（如Artsteps免费版）。积累媒体素材，再谈实体空间。'),
      jsonb_build_object('stance', '批判提醒', 'content', '零预算展览的问题不是钱，是没人来。先解决"观众是谁"，再解决场地。')
    ),
    jsonb_build_object('theme', '市场价值', 'group', '市场与价值')
  ),
  (
    'art-district-relocation-follow-or-stay',
    '🔥 争议',
    '艺术区搬迁（798/莫干山/M50），艺术家该跟着走还是留守？',
    '艺术市场',
    112,
    14,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '跟随派', 'content', '艺术区是生态。画廊、藏家、媒体都在，你一个人留守没有意义。'),
      jsonb_build_object('stance', '留守派', 'content', '搬迁是 gentrification 的重复。搬到宋庄，三年后宋庄也涨价。根本问题是房租。'),
      jsonb_build_object('stance', '反叛派', 'content', '为什么必须在艺术区？我在郊区仓库，租金1/5，作品尺度不受限。藏家开车来。'),
      jsonb_build_object('stance', '悲观派', 'content', '北京已经不适合年轻艺术家了。去成都、长沙、景德镇，成本差10倍。'),
      jsonb_build_object('stance', '历史循环', 'content', 'SoHo→切尔西→布什维克→？每次搬迁都是前一批艺术家被赶走，后一批接盘。')
    ),
    jsonb_build_object('theme', '市场价值', 'group', '市场与价值')
  ),
  (
    'art-criticism-value-or-kol-commerce',
    '🔥 争议',
    '艺术批评还有价值吗？还是所有人都在等KOL带货？',
    '艺术市场',
    78,
    15,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '批评已死', 'content', '严肃批评没人看，小红书500字"好美"转发过万。批评家改行做策展人或销售了。'),
      jsonb_build_object('stance', '批评转型', 'content', '批评从文字变成视频、播客、直播对谈。形式变了，批判性还在。'),
      jsonb_build_object('stance', '创作者视角', 'content', '我需要批评，但不需要毒舌。建设性批评帮助成长，为骂而骂只是流量。'),
      jsonb_build_object('stance', '机构责任', 'content', '美术馆和双年展还在写学术文章，但阅读量是展览的1/1000。谁在维护这个传统？'),
      jsonb_build_object('stance', '全球比较', 'content', '欧洲还有《Frieze》《Artforum》，中国没有同等平台。不是批评死了，是生态没建起来。')
    ),
    jsonb_build_object('theme', '市场价值', 'group', '市场与价值')
  ),
  (
    'xu-bing-book-from-sky-deep-or-emperors-clothes',
    '🔥 争议',
    '徐冰的《天书》是深刻还是"皇帝的新衣"？',
    '艺术市场',
    234,
    16,
    true,
    jsonb_build_array(
      jsonb_build_object('stance', '深刻派', 'content', '解构汉字系统，质疑语言本身。这是哲学级别的创作，不是"好看不好看"能评判的。'),
      jsonb_build_object('stance', '骗局派', 'content', '造四千个假字，雇人刻版印刷，成本百万，意义在哪？当代艺术就是洗钱话术。'),
      jsonb_build_object('stance', '历史语境', 'content', '1988年做出来是先锋，现在2024年再看，是艺术史教材里的经典。评价要看时代。'),
      jsonb_build_object('stance', '技术致敬', 'content', '我尝试用AI生成"假英文字母"，发现徐冰的手工精神在今天反而更珍贵。'),
      jsonb_build_object('stance', '市场反讽', 'content', '《天书》拍卖价千万。骂它的人，和买它的人，可能根本不在一个世界。')
    ),
    jsonb_build_object('theme', '作品审美', 'group', '作品与审美')
  ),
  (
    'installation-art-funding-scam',
    '🔥 争议',
    '当代装置艺术是不是在"骗funding"？',
    '艺术市场',
    267,
    17,
    true,
    jsonb_build_array(
      jsonb_build_object('stance', '辩护派', 'content', '装置是空间体验，照片看不出来。你站在盐田千春的线里，和看图片是两回事。'),
      jsonb_build_object('stance', '质疑派', 'content', '弄一堆破椅子、旧衣服、霓虹灯，写500字概念陈述，就能申请到文化基金。'),
      jsonb_build_object('stance', '体制批判', 'content', '不是艺术家骗funding，是funding制度要求"大型、跨学科、社区参与"。艺术家在迎合规则。'),
      jsonb_build_object('stance', '比较派', 'content', '传统绘画也有"骗"——学院派肖像、商业定制。哪个时代没有迎合系统的创作？'),
      jsonb_build_object('stance', '观众权利', 'content', '我有权说"看不懂"和"不喜欢"。但说"骗"需要证据，比如财务造假。')
    ),
    jsonb_build_object('theme', '作品审美', 'group', '作品与审美')
  ),
  (
    'graduation-shows-installation-mix',
    '🔥 争议',
    '为什么美院毕业展越来越像"装置大杂烩"？',
    '作品集',
    198,
    18,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '教育导向', 'content', '导师鼓励"观念优先"，学生做绘画被说"保守"。系统性地在淘汰传统媒介。'),
      jsonb_build_object('stance', '成本计算', 'content', '一幅油画成本5000，一个装置成本500。学生穷，装置是无奈选择。'),
      jsonb_build_object('stance', '展览逻辑', 'content', '毕业展要"出效果"，装置占空间、有声音、能互动。绘画挂在墙上，容易被忽略。'),
      jsonb_build_object('stance', '市场对接', 'content', '画廊现在签装置/新媒体艺术家，不签画家。学生提前适应市场。'),
      jsonb_build_object('stance', '怀念派', 'content', '我怀念十年前毕业展还有人在画静物。现在走进展厅像走进家电卖场。')
    ),
    jsonb_build_object('theme', '作品审美', 'group', '作品与审美')
  ),
  (
    'must-female-artists-talk-feminism',
    '🔥 争议',
    '女性艺术家必须谈女性主义吗？',
    '艺术市场',
    145,
    19,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '必须派', 'content', '艺术是个人表达，女性身份是真实经验。不谈才是自我审查，迎合男性主导的市场。'),
      jsonb_build_object('stance', '自由派', 'content', '我想画风景，为什么必须画身体、月经、创伤？女性主义是选择，不是义务。'),
      jsonb_build_object('stance', '市场观察', 'content', '拍卖数据：女性主义主题作品溢价30%。不谈女性主义，等于放弃市场红利。'),
      jsonb_build_object('stance', '男性视角', 'content', '男性艺术家也从不用解释"为什么你不谈男性主义"。双重标准。'),
      jsonb_build_object('stance', '代际差异', 'content', '60后女艺术家被问这个问题，90后已经不被问了。进步在发生，但慢。')
    ),
    jsonb_build_object('theme', '作品审美', 'group', '作品与审美')
  ),
  (
    'abstract-painting-high-price-aesthetic-or-money-laundering',
    '🔥 争议',
    '抽象画卖天价，是审美还是洗钱？',
    '艺术市场',
    189,
    20,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '审美派', 'content', '罗斯科的色域、波洛克的动作，是视觉经验的极致。看不懂不等于没有价值。'),
      jsonb_build_object('stance', '洗钱派', 'content', '抽象画没有明确图像，估值随意，最适合做资金转移。瑞士银行最爱推荐这类。'),
      jsonb_build_object('stance', '学术派', 'content', '抽象是20世纪艺术史的核心转向。天价买的是"历史位置"，不是画布。'),
      jsonb_build_object('stance', '创作者酸葡萄', 'content', '我画抽象十年，没卖出去。天价是少数明星，大多数抽象画家在教小孩画画。'),
      jsonb_build_object('stance', '替代投资', 'content', '藏家买抽象和买比特币一样，是资产配置。审美是附加价值，不是核心价值。')
    ),
    jsonb_build_object('theme', '作品审美', 'group', '作品与审美')
  ),
  (
    'returning-overseas-artist-advantage-or-mismatch',
    '🔥 争议',
    '海归艺术家回国是"降维打击"还是"水土不服"？',
    '行业就业',
    167,
    21,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '降维派', 'content', '国际视野、方法论、人脉资源，回国是碾压。国内美院毕业生还在抄 Pinterest。'),
      jsonb_build_object('stance', '水土不服', 'content', '国外那套"批判性思维"在国内 gallery 系统里用不上。藏家问你"这画挂客厅好看吗"。'),
      jsonb_build_object('stance', '适应派', 'content', '成功的海归都在"翻译"——把国际语言转成本土语境。需要3-5年过渡期。'),
      jsonb_build_object('stance', '反向案例', 'content', '我没出国，但在景德镇做陶瓷，比海归同学卖得好。在地性有时候比国际性值钱。'),
      jsonb_build_object('stance', '阶级问题', 'content', '能出国读艺术的家庭，和不能出国的，起点就不一样。别用"降维"掩盖资源不平等。')
    ),
    jsonb_build_object('theme', '身份在地', 'group', '身份与在地性')
  ),
  (
    'new-chinese-aesthetic-confidence-or-consumerism',
    '🔥 争议',
    '新中式美学是文化自信还是文化消费主义？',
    '艺术市场',
    134,
    22,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '自信派', 'content', '从汉服到宋韵，年轻人终于不追韩流了。这是文化主体性的觉醒。'),
      jsonb_build_object('stance', '消费派', 'content', '故宫口红、茶颜悦色，把文化符号变成打卡道具。消费的是"氛围"，不是文化。'),
      jsonb_build_object('stance', '设计实践', 'content', '我在做新中式空间，难点不是"像不像古人"，是"现代人怎么住得舒服"。'),
      jsonb_build_object('stance', '国际视角', 'content', '西方看"新中式"和看"和风"一样，是东方主义消费。我们以为输出文化，实际在迎合凝视。'),
      jsonb_build_object('stance', '时间检验', 'content', '80年代"寻根文学"也争论过。30年后看，留下的是好作品，不是标签。')
    ),
    jsonb_build_object('theme', '身份在地', 'group', '身份与在地性')
  ),
  (
    'guochao-design-symbol-cliche',
    '🔥 争议',
    '为什么"国潮"设计总是绕不开龙凤、祥云、京剧脸谱？',
    '作品集',
    98,
    23,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '符号惯性', 'content', '设计师懒，甲方更懒。龙凤祥云是"安全牌"，审批快，消费者认知成本低。'),
      jsonb_build_object('stance', '深层结构', 'content', '真正的中国美学是留白、气韵、笔墨，不是符号。但这些东西需要教育成本。'),
      jsonb_build_object('stance', '商业成功', 'content', '李宁用"中国李宁"四个大字卖爆了。符号化是商业策略，不是艺术选择。'),
      jsonb_build_object('stance', '创新尝试', 'content', '我在尝试用"痰盂、热水瓶、搪瓷杯"做设计，被甲方说"不够高级"。创新需要甲方配合。'),
      jsonb_build_object('stance', '历史比较', 'content', '日本设计也不是一开始就有"侘寂"的。先符号化，再提炼精神，是必经阶段。')
    ),
    jsonb_build_object('theme', '身份在地', 'group', '身份与在地性')
  ),
  (
    'minority-elements-homage-or-appropriation',
    '🔥 争议',
    '少数民族元素在时尚/艺术中的使用，是致敬还是挪用？',
    '艺术市场',
    87,
    24,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '致敬派', 'content', '苗族银饰、藏族唐卡，美得震撼。不用它们，它们就消失在现代化里。'),
      jsonb_build_object('stance', '挪用派', 'content', '汉族设计师用彝族纹样，不给版权费，不请彝族工匠，这是文化殖民。'),
      jsonb_build_object('stance', '合作模式', 'content', '正确的做法是"联名"——设计师+非遗传承人，利润分成。不是单向提取。'),
      jsonb_build_object('stance', '法律空白', 'content', '中国没有"传统文化版权法"。苗绣图案被Dior用，只能道德谴责，不能法律维权。'),
      jsonb_build_object('stance', '主体性', 'content', '什么时候少数民族设计师自己进巴黎时装周，而不是被"代表"，才是真正的平等。')
    ),
    jsonb_build_object('theme', '身份在地', 'group', '身份与在地性')
  ),
  (
    'artists-create-for-political-correctness',
    '🔥 争议',
    '艺术家该不该为"政治正确"创作？',
    '艺术市场',
    156,
    25,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '应该派', 'content', '艺术是社会介入。环保、性别、种族，这些议题需要艺术家发声。沉默是共谋。'),
      jsonb_build_object('stance', '不应该', 'content', '艺术是自由的，"政治正确"是另一种审查。从"不能画裸女"到"必须画多元"，都是枷锁。'),
      jsonb_build_object('stance', '策略派', 'content', '国际双年展、基金会申请，都有"社会议题"加分项。不为政治正确，为funding正确。'),
      jsonb_build_object('stance', '中国语境', 'content', '在中国谈"政治正确"是错位。我们的问题是"自我审查"，不是"过度政治化"。'),
      jsonb_build_object('stance', '历史参照', 'content', '苏联社会主义现实主义、美国抽象表现主义（CIA资助），艺术和政治从来纠缠。')
    ),
    jsonb_build_object('theme', '身份在地', 'group', '身份与在地性')
  ),
  (
    'art-study-abroad-return-8k-salary-worth-it',
    '💬 求助',
    '艺术留学回国，月薪8K，这学还值得上吗？',
    '行业就业',
    312,
    26,
    true,
    jsonb_build_array(
      jsonb_build_object('stance', '算账派', 'content', '留学花200万，月薪8K，回本要20年。除非家里有矿，否则是财务自杀。'),
      jsonb_build_object('stance', '长期派', 'content', '我回国第一年8K，第三年开工作室，第五年年入50万。看5年，不要看第一年。'),
      jsonb_build_object('stance', '非金钱回报', 'content', '留学给的是视野、方法论、人脉。这些不会体现在工资条上，但决定天花板。'),
      jsonb_build_object('stance', '替代方案', 'content', '国内读研+短期游学，成本1/5，资源差不多。除非申到Top 3，否则不建议全职留学。'),
      jsonb_build_object('stance', '行业现实', 'content', '艺术行业整体低收入。不是留学不值，是行业不值。想清楚再入行。')
    ),
    jsonb_build_object('theme', '行业生存', 'group', '行业与生存')
  ),
  (
    'gallery-sales-or-art-creation-real-art-job',
    '🔥 争议',
    '画廊销售岗和艺术创作，哪个才是"正经"艺术工作？',
    '行业就业',
    76,
    27,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '创作至上', 'content', '销售是服务业，创作是本体。画廊销售可以替代，艺术家不能替代。'),
      jsonb_build_object('stance', '平等派', 'content', '没有销售，艺术家喝西北风。艺术生态需要所有环节，没有高低。'),
      jsonb_build_object('stance', '现实选择', 'content', '我创作5年没卖出，转做画廊销售，收入稳定了，反而有时间周末创作。'),
      jsonb_build_object('stance', '能力差异', 'content', '有人擅长社交适合做销售，有人擅长独处适合创作。认清自己是第一步。'),
      jsonb_build_object('stance', '中国特殊', 'content', '国内画廊销售经常要"陪藏家喝酒"，这是艺术工作还是商务公关？')
    ),
    jsonb_build_object('theme', '行业生存', 'group', '行业与生存')
  ),
  (
    'artist-influencer-decline-or-survival',
    '🔥 争议',
    '艺术家做"网红"是堕落还是生存智慧？',
    '行业就业',
    189,
    28,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '堕落派', 'content', '天天拍vlog、带货、接广告，还有时间创作吗？艺术家变成内容生产者。'),
      jsonb_build_object('stance', '生存派', 'content', '房租5000，画卖不掉，不做网红饿死吗？先活下来，再谈纯洁。'),
      jsonb_build_object('stance', '新范式', 'content', '杜尚就是最早的"网红"，《泉》是行为艺术+媒体事件。注意力经济不是新东西。'),
      jsonb_build_object('stance', '质量差异', 'content', '蔡国强也拍纪录片，但作品撑得住。怕的是只有人设，没有作品。'),
      jsonb_build_object('stance', '平台剥削', 'content', '抖音抽成、算法控制、流量焦虑。艺术家从被画廊剥削，变成被平台剥削。')
    ),
    jsonb_build_object('theme', '行业生存', 'group', '行业与生存')
  ),
  (
    'art-fair-serves-art-or-rich',
    '🔥 争议',
    '艺术博览会（Art Basel/西岸）是在服务艺术还是服务富人？',
    '艺术市场',
    134,
    29,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '服务艺术', 'content', '博览会给画廊集中曝光，给艺术家国际舞台，给藏家系统选择。效率工具。'),
      jsonb_build_object('stance', '服务富人', 'content', 'VIP预展、私人晚宴、游艇派对。艺术是社交货币，博览会就是高级商场。'),
      jsonb_build_object('stance', '艺术家视角', 'content', '我的画廊每年参加3个博览会，成本30万，卖不出就亏。压力全在画廊。'),
      jsonb_build_object('stance', '公共教育', 'content', '博览会也有公众日、论坛、放映。不能只看到VIP厅，看不到公共项目。'),
      jsonb_build_object('stance', '替代方案', 'content', '线上博览会、 NFT 平台、艺术家自营。未来可能不需要物理博览会。')
    ),
    jsonb_build_object('theme', '行业生存', 'group', '行业与生存')
  ),
  (
    'china-needs-museums-or-alternative-spaces',
    '🔥 争议',
    '中国需要更多"美术馆"还是更多"替代空间"？',
    '艺术市场',
    98,
    30,
    false,
    jsonb_build_array(
      jsonb_build_object('stance', '美术馆派', 'content', '需要。中国美术馆数量是美国的1/10，人均参观率是1/50。基础设施差太远。'),
      jsonb_build_object('stance', '替代空间派', 'content', '现有美术馆是官僚系统，策展人没自主权。替代空间（独立空间、艺术家自营）更灵活。'),
      jsonb_build_object('stance', '质量优先', 'content', '不要数量，要质量。一个UCCA的公共项目，比10个县级美术馆加起来有价值。'),
      jsonb_build_object('stance', '资金结构', 'content', '美术馆靠政府，替代空间靠创始人自掏腰包。两种都缺钱，但缺法不同。'),
      jsonb_build_object('stance', '未来模型', 'content', '可能是"分布式"——没有大馆，但有100个小空间联网。线上聚合，线下分散。')
    ),
    jsonb_build_object('theme', '行业生存', 'group', '行业与生存')
  )
)
INSERT INTO community_hot_topics (
  slug,
  tag,
  title,
  category,
  participant_count,
  sort_order,
  is_pinned,
  answers,
  metadata,
  status
)
SELECT
  slug,
  tag,
  title,
  category,
  participant_count,
  sort_order,
  is_pinned,
  answers,
  metadata,
  'published'
FROM seed
ON CONFLICT (slug) DO UPDATE SET
  tag = EXCLUDED.tag,
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  participant_count = EXCLUDED.participant_count,
  sort_order = EXCLUDED.sort_order,
  is_pinned = EXCLUDED.is_pinned,
  answers = EXCLUDED.answers,
  metadata = EXCLUDED.metadata,
  status = EXCLUDED.status,
  updated_at = now();
