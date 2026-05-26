// @ts-nocheck
'use client';

export interface Institution {
  id: string;
  name: string;
  originalName?: string;
  location: string;
  description: string;
  image: string;
  notableAlumni?: string[];
  rank?: string;
  // Comparison Metrics
  admissionDifficulty?: string;
  portfolioReq?: string;
  annualCost?: string;
  employmentRate?: string;
  studentFacultyRatio?: string;
  scholarshipRate?: string;
  campusFacility?: string;
  majorStrengths?: string[];
  alumniNetwork?: string;
  radarData?: {
    academic: number;
    employment: number;
    facility: number;
    cost: number;
    reputation: number;
    innovation: number;
  };
}

export const INSTITUTIONS_DATA: Record<string, Institution[]> = {
  "中国香港": [
    { 
      id: "hk-1", 
      name: "香港理工大学设计学院", 
      originalName: "PolyU Design", 
      location: "九龙红磡", 
      image: "https://picsum.photos/seed/polyu-hk/800/600", 
      description: "亚洲顶尖设计学院，以创新与实践见长。",
      rank: "QS #16",
      admissionDifficulty: "15%",
      portfolioReq: "Portfolio + Interview",
      annualCost: "HK$160,000",
      employmentRate: "92%",
      studentFacultyRatio: "12:1",
      scholarshipRate: "High",
      campusFacility: "Industry-grade labs",
      majorStrengths: ["Interaction Design", "Industrial Design"],
      alumniNetwork: "Strong in Asia-Pacific",
      radarData: { academic: 85, employment: 90, facility: 88, cost: 70, reputation: 82, innovation: 95 }
    },
    { id: "hk-2", name: "香港艺术学院", originalName: "Hong Kong Art School", location: "湾仔", image: "https://picsum.photos/seed/hkas-art/800/600", description: "专注于当代艺术实践，与澳洲皇家墨尔本理工大学合办课程。" },
    { id: "hk-3", name: "香港中文大学艺术系", originalName: "CUHK Fine Arts", location: "沙田", image: "https://picsum.photos/seed/cuhk-hk/800/600", description: "深耕中国艺术史与创作，融合东西文化。" },
    { id: "hk-4", name: "香港浸会大学视觉艺术院", originalName: "HKBU Academy of Visual Arts", location: "九龙塘", image: "https://picsum.photos/seed/hkbu-hk/800/600", description: "提供跨学科艺术教育，强调社会介入。" },
    { id: "hk-5", name: "香港城市大学创意媒体学院", originalName: "CityU School of Creative Media", location: "九龙塘", image: "https://picsum.photos/seed/cityu-hk/800/600", description: "结合科技与艺术，推动数字媒体创新。" },
    { id: "hk-6", name: "香港大学艺术学系", originalName: "HKU Fine Arts", location: "薄扶林", image: "https://picsum.photos/seed/hku-hk/800/600", description: "历史悠久，侧重艺术史研究与策划。" },
    { id: "hk-7", name: "香港教育大学文化与创意艺术学系", originalName: "EdUHK CCA", location: "大埔", image: "https://picsum.photos/seed/eduhk-hk/800/600", description: "致力于艺术教育与社区艺术发展。" },
    { id: "hk-8", name: "香港岭南大学视觉研究系", originalName: "Lingnan Visual Studies", location: "屯门", image: "https://picsum.photos/seed/lingnan-hk/800/600", description: "小而精，关注视觉文化分析与批评。" },
    { id: "hk-9", name: "香港演艺学院", originalName: "HKAPA", location: "湾仔", image: "https://picsum.photos/seed/hkapa-hk/800/600", description: "表演艺术领域的权威，包含舞台美术 with 室内设计。" },
    { id: "hk-10", name: "香港科技大学媒体与设计", originalName: "HKUST Media & Design", location: "清水湾", image: "https://picsum.photos/seed/hkust-hk/800/600", description: "新兴跨学科领域，探索AI与设计的未来。" }
  ],
  "美国": [
    { 
      id: "us-1", 
      name: "罗德岛设计学院", 
      originalName: "RISD", 
      location: "普罗维登斯", 
      image: "https://picsum.photos/seed/us-risd/800/600", 
      description: "常年位居全美艺术设计类榜首，被誉为‘艺术界的哈佛’。",
      rank: "QS #3",
      admissionDifficulty: "19%",
      portfolioReq: "12-20 pages + Home Test",
      annualCost: "$78,000",
      employmentRate: "94%",
      studentFacultyRatio: "10:1",
      scholarshipRate: "Medium",
      campusFacility: "RISD Museum integration",
      majorStrengths: ["Graphic Design", "Illustration", "Architecture"],
      alumniNetwork: "Premier worldwide",
      radarData: { academic: 98, employment: 92, facility: 95, cost: 40, reputation: 99, innovation: 94 }
    },
    { id: "us-2", name: "耶鲁大学艺术学院", originalName: "Yale School of Art", location: "纽黑文", image: "https://picsum.photos/seed/us-yale/800/600", description: "顶级综合性大学中的皇冠，平面设计与绘画闻名遐迩。" },
    { id: "us-3", name: "芝加哥艺术学院", originalName: "SAIC", location: "芝加哥", image: "https://picsum.photos/seed/us-saic/800/600", description: "强调跨学科创作与批判思维，与芝加哥艺术博物馆紧密关联。" },
    { 
      id: "us-4", 
      name: "帕森斯设计学院", 
      originalName: "Parsons School of Design", 
      location: "纽约", 
      image: "https://picsum.photos/seed/us-parsons/800/600", 
      description: "时尚界的摇篮，服装设计全球领先。",
      rank: "QS #4",
      admissionDifficulty: "35%",
      portfolioReq: "8-12 pages + Parsons Challenge",
      annualCost: "$82,000",
      employmentRate: "91%",
      studentFacultyRatio: "9:1",
      scholarshipRate: "High",
      campusFacility: "NYC Industry Bridge",
      majorStrengths: ["Fashion", "Communication Design"],
      alumniNetwork: "Fashion industry hub",
      radarData: { academic: 92, employment: 96, facility: 90, cost: 30, reputation: 95, innovation: 98 }
    },
    { id: "us-5", name: "普瑞特艺术学院", originalName: "Pratt Institute", location: "布鲁克林", image: "https://picsum.photos/seed/us-pratt/800/600", description: "工业设计与室内设计极具声望，注重实用主义与美学结合。" },
    { id: "us-6", name: "加州艺术学院", originalName: "CalArts", location: "瓦伦西亚", image: "https://picsum.photos/seed/us-calarts/800/600", description: "华特·迪士尼创立，动画与新媒体艺术的先驱。" },
    { id: "us-7", name: "艺术中心设计学院", originalName: "ArtCenter College of Design", location: "帕萨迪纳", image: "https://picsum.photos/seed/us-artcenter/800/600", description: "交通工具设计全球第一，好莱坞概念设计师的殿堂。" },
    { id: "us-8", name: "马里兰艺术学院", originalName: "MICA", location: "巴尔的摩", image: "https://picsum.photos/seed/us-mica/800/600", description: "全美历史最悠久的艺术学院，插画与平面设计广受认可。" },
    { id: "us-9", name: "萨凡纳艺术设计学院", originalName: "SCAD", location: "萨凡纳", image: "https://picsum.photos/seed/us-scad/800/600", description: "专业设置全美最全，数字化就业导向极强。" },
    { id: "us-10", name: "卡内基梅隆大学设计学院", originalName: "CMU School of Design", location: "匹兹堡", image: "https://picsum.photos/seed/us-cmu/800/600", description: "交互设计（IXD）的鼻祖，人机交互领域的权威。" }
  ],
  "欧洲": [
    { 
      id: "eu-1", 
      name: "皇家艺术学院", 
      originalName: "Royal College of Art (RCA)", 
      location: "伦敦, 英国", 
      image: "https://picsum.photos/seed/eu-rca/800/600", 
      description: "全球唯一的全研究制艺术研究生院校，QS世界排名长期第一。",
      rank: "QS #1",
      admissionDifficulty: "12%",
      portfolioReq: "Portfolio + Video + Interview",
      annualCost: "£35,000",
      employmentRate: "96%",
      studentFacultyRatio: "8:1",
      scholarshipRate: "Elite",
      campusFacility: "Cutting-edge research labs",
      majorStrengths: ["Design Products", "Service Design", "MA Fine Art"],
      alumniNetwork: "Unmatched research clout",
      radarData: { academic: 100, employment: 95, facility: 98, cost: 45, reputation: 100, innovation: 100 }
    },
    { 
      id: "eu-2", 
      name: "中央圣马丁学院", 
      originalName: "Central Saint Martins", 
      location: "伦敦, 英国", 
      image: "https://picsum.photos/seed/eu-csm/800/600", 
      description: "跨界创意的代名词，时尚与当代艺术的实验田。",
      rank: "QS #2",
      admissionDifficulty: "15%",
      portfolioReq: "15-20 slides + Digital Case Study",
      annualCost: "£28,000",
      employmentRate: "93%",
      studentFacultyRatio: "11:1",
      scholarshipRate: "Standard",
      campusFacility: "Legendary studio spaces",
      majorStrengths: ["Fashion Design", "Fine Art", "Jewelry Design"],
      alumniNetwork: "Global creative leaders",
      radarData: { academic: 95, employment: 98, facility: 92, cost: 50, reputation: 98, innovation: 97 }
    },
    { id: "eu-3", name: "埃因霍温设计学院", originalName: "Design Academy Eindhoven", location: "埃因霍温, 荷兰", image: "https://picsum.photos/seed/eu-dae/800/600", description: "概念设计的麦加，以概念性与社会性反思著称。" },
    { id: "eu-4", name: "国立高等美术学院", originalName: "ENSBA Paris", location: "巴黎, 法国", image: "https://picsum.photos/seed/eu-ensba/800/600", description: "拥有数百年历史的古典艺术殿堂，培养了无数大师。" },
    { id: "eu-5", name: "柏林艺术大学", originalName: "UdK Berlin", location: "柏林, 德国", image: "https://picsum.photos/seed/eu-udk/800/600", description: "欧洲最大的综合性艺术大学，先锋精神与传统工艺并存。" },
    { id: "eu-6", name: "阿尔托大学艺术设计学院", originalName: "Aalto ARTS", location: "赫尔辛基, 芬兰", image: "https://picsum.photos/seed/eu-aalto/800/600", description: "北欧设计的巅峰，强调可持续性与以人为本的创新。" },
    { id: "eu-7", name: "米兰理工大学设计学院", originalName: "Politecnico di Milano", location: "米兰, 意大利", image: "https://picsum.photos/seed/eu-polimi/800/600", description: "意大利工业设计的精神核心，产学研结合的典范。" },
    { id: "eu-8", name: "苏黎世艺术大学", originalName: "ZHdK", location: "苏黎世, 瑞士", image: "https://picsum.photos/seed/eu-zhdk/800/600", description: "德语区顶尖学府，多媒体与游戏设计处于领先地位。" },
    { id: "eu-9", name: "里特维尔德学院", originalName: "Gerrit Rietveld Academie", location: "阿姆斯特丹, 荷兰", image: "https://picsum.photos/seed/eu-rietveld/800/600", description: "极致的先锋与自由，鼓励学生打破一切界限。" },
    { id: "eu-10", name: "国立高等装饰艺术学院", originalName: "ENSAD Paris", location: "巴黎, 法国", image: "https://picsum.photos/seed/eu-ensad/800/600", description: "法国工业设计与平面设计的最高学府之一。" }
  ],
  "日本": [
    { id: "jp-1", name: "东京艺术大学", originalName: "Tokyo Geidai", location: "东京", image: "https://picsum.photos/seed/jp-geidai/800/600", description: "日本唯一的国立艺术大学，艺术界的最高学术殿堂。" },
    { id: "jp-2", name: "多摩美术大学", originalName: "Tama Art University", location: "东京", image: "https://picsum.photos/seed/jp-tama/800/600", description: "御三家之一，深泽直人曾任教，平面与工业设计极强。" },
    { id: "jp-3", name: "武藏野美术大学", originalName: "Musabi", location: "东京", image: "https://picsum.photos/seed/jp-musabi/800/600", description: "原研哉任教，强调艺术与设计的感性平衡。" },
    { id: "jp-4", name: "京都精华大学", originalName: "Kyoto Seika University", location: "京都", image: "https://picsum.photos/seed/jp-seika/800/600", description: "日本第一个设立漫画学部的大学，动漫迷的朝圣地。" },
    { id: "jp-5", name: "女子美术大学", originalName: "Joshibi", location: "伊势原", image: "https://picsum.photos/seed/jp-joshibi/800/600", description: "专注女性艺术教育，培养了许多知名角色设计师。" },
    { id: "jp-6", name: "金泽美术工艺大学", originalName: "Kanazawa College of Art", location: "金泽", image: "https://picsum.photos/seed/jp-kanazawa/800/600", description: "工艺美术气息浓厚，工业设计在日本业界口碑极佳。" },
    { id: "jp-7", name: "京都市立艺术大学", originalName: "Kyoto City University of Arts", location: "京都", image: "https://picsum.photos/seed/jp-kyotocity/800/600", description: "日本历史最悠久的艺术大学，传统与创新交织。" },
    { id: "jp-8", name: "东京造形大学", originalName: "Tokyo Zokei University", location: "东京", image: "https://picsum.photos/seed/jp-zokei/800/600", description: "由桑泽洋子创立，注重社会实践与视觉沟通。" },
    { id: "jp-9", name: "爱知县立艺术大学", originalName: "Aichi Prefectural University of Fine Arts", location: "名古屋", image: "https://picsum.photos/seed/jp-aichi/800/600", description: "致力于地域文化与艺术创作的深度结合。" },
    { id: "jp-10", name: "东北艺术工科大学", originalName: "TUAD", location: "山形", image: "https://picsum.photos/seed/jp-tuad/800/600", description: "将艺术 with 社区再生结合的先驱院校。" }
  ],
  "韩国": [
    { id: "kr-1", name: "首尔大学美术学院", originalName: "SNU College of Fine Arts", location: "首尔", image: "https://picsum.photos/seed/kr-snu/800/600", description: "韩国学府之首，综合研究实力与艺术造诣兼具。" },
    { id: "kr-2", name: "弘益大学美术学院", originalName: "Hongik Art", location: "首尔", image: "https://picsum.photos/seed/kr-hongik/800/600", description: "韩国设计界的代名词，拥有庞大的校友网络与产业影响力。" },
    { id: "kr-3", name: "韩国艺术综合大学", originalName: "K-ARTS", location: "首尔", image: "https://picsum.photos/seed/kr-karts/800/600", description: "由文化体育观光部设立，专注于专业艺术家培养。" },
    { id: "kr-4", name: "梨花女子大学美术学院", originalName: "Ewha Art", location: "首尔", image: "https://picsum.photos/seed/kr-ewha/800/600", description: "历史底蕴深厚，培养了无数杰出的女性艺术家与设计师。" },
    { id: "kr-5", name: "中央大学数字艺术学院", originalName: "Chung-Ang CAU", location: "首尔", image: "https://picsum.photos/seed/kr-cau/800/600", description: "摄影、戏剧与电影艺术在韩国排名极高。" },
    { id: "kr-6", name: "国民大学设计学院", originalName: "Kookmin Design", location: "首尔", image: "https://picsum.photos/seed/kr-kookmin/800/600", description: "工业设计与汽车设计在韩国首屈一指。" },
    { id: "kr-7", name: "建国大学艺术设计系", originalName: "Konkuk University", location: "首尔", image: "https://picsum.photos/seed/kr-konkuk/800/600", description: "不仅在纯艺方面出色，现代传媒设计也极具竞争力。" },
    { id: "kr-8", name: "汉阳大学设计学院", originalName: "Hanyang Design", location: "首尔", image: "https://picsum.photos/seed/kr-hanyang/800/600", description: "注重工程与设计的跨科融合。" },
    { id: "kr-9", name: "檀国大学艺术学部", originalName: "Dankook University", location: "龙仁", image: "https://picsum.photos/seed/kr-dankook/800/600", description: "综合实力平衡，艺术创作氛围浓厚。" },
    { id: "kr-10", name: "祥明大学艺术学院", originalName: "Sangmyung University", location: "首尔", image: "https://picsum.photos/seed/kr-sangmyung/800/600", description: "摄影与多媒体教育在业界声誉斐然。" }
  ],
  "加拿大": [
    { id: "ca-1", name: "安大略艺术设计大学", originalName: "OCAD University", location: "多伦多", image: "https://picsum.photos/seed/ca-ocad/800/600", description: "加拿大规模最大、历史最悠久的艺术院校，城市艺术地标。" },
    { id: "ca-2", name: "艾米丽卡尔艺术与设计大学", originalName: "Emily Carr (ECUAD)", location: "温哥华", image: "https://picsum.photos/seed/ca-ecuad/800/600", description: "位列全球前50的极客型艺术大学，媒体艺术领先。" },
    { id: "ca-3", name: "新斯科舍艺术与设计大学", originalName: "NSCAD", location: "哈利法克斯", image: "https://picsum.photos/seed/ca-nscad/800/600", description: "视觉艺术研究的先锋，北美最受尊崇的艺术学校之一。" },
    { id: "ca-4", name: "康考迪亚大学美术学院", originalName: "Concordia Fine Arts", location: "蒙特利尔", image: "https://picsum.photos/seed/ca-concordia/800/600", description: "跨学科艺术教育的中心，数字艺术氛围极其浓厚。" },
    { id: "ca-5", name: "多伦多大学丹尼尔斯建筑学院", originalName: "Daniels Architecture", location: "多伦多", image: "https://picsum.photos/seed/ca-daniels/800/600", description: "建筑、景观与设计研究的顶级平台。" },
    { id: "ca-6", name: "不列颠哥伦比亚大学艺术系", originalName: "UBC Art History & Visual Art", location: "温哥华", image: "https://picsum.photos/seed/ca-ubc/800/600", description: "植根于人文研究的当代艺术创作中心。" },
    { id: "ca-7", name: "约克大学艺术学院", originalName: "York AMPD", location: "多伦多", image: "https://picsum.photos/seed/ca-york/800/600", description: "跨媒体、电影与表演艺术的综合性强校。" },
    { id: "ca-8", name: "艾伯塔艺术大学", originalName: "AUArts", location: "卡尔加里", image: "https://picsum.photos/seed/ca-auarts/800/600", description: "强调手工工艺与现代商业设计的垂直结合。" },
    { id: "ca-9", name: "谢尔丹学院设计学部", originalName: "Sheridan College", location: "奥克维尔", image: "https://picsum.photos/seed/ca-sheridan/800/600", description: "‘动画界的哈佛’，毕业生遍布好莱坞各大制片公司。" },
    { id: "ca-10", name: "塞内卡学院艺术中心", originalName: "Seneca Arts", location: "多伦多", image: "https://picsum.photos/seed/ca-seneca/800/600", description: "职业导向明确，3D动画与游戏设计极具竞争力。" }
  ],
  "亚洲其他国家": [
    { id: "as-1", name: "新加坡国立大学设计学院", originalName: "NUS Design", location: "新加坡", image: "https://picsum.photos/seed/as-nus/800/600", description: "亚洲顶尖，注重城市设计与交互创新。" },
    { id: "as-2", name: "南洋理工大学艺术与设计学院", originalName: "NTU ADM", location: "新加坡", image: "https://picsum.photos/seed/as-ntu/800/600", description: "世界级设施，专注于数字动画与媒体研究。" },
    { id: "as-3", name: "中国美术学院", originalName: "China Academy of Art", location: "杭州", image: "https://picsum.photos/seed/as-caa/800/600", description: "中国传统与当代 experimental 艺术的融合枢纽。" },
    { id: "as-4", name: "中央美术学院", originalName: "CAFA", location: "北京", image: "https://picsum.photos/seed/as-cafa/800/600", description: "中国艺术教育的最高学府，大师辈出。" },
    { id: "as-5", name: "拉萨尔艺术学院", originalName: "LASALLE", location: "新加坡", image: "https://picsum.photos/seed/as-lasalle/800/600", description: "当代多艺术形态的熔炉，东南亚艺术的核心。" },
    { id: "as-6", name: "那法艺术学院", originalName: "NAFA", location: "新加坡", image: "https://picsum.photos/seed/as-nafa/800/600", description: "历史悠久，传承南洋画派精神的同时拥抱现代设计。" },
    { id: "as-7", name: "万隆理工学院艺术设计学院", originalName: "ITB FSRD", location: "印尼", image: "https://picsum.photos/seed/as-itb/800/600", description: "印尼当代艺术与设计的发源地。" },
    { id: "as-8", name: "西尔帕空大学艺术学院", originalName: "Silpakorn Fine Arts", location: "泰国", image: "https://picsum.photos/seed/as-silpakorn/800/600", description: "泰国的艺术圣地，古典雕塑与绘画的一流学府。" },
    { id: "as-9", name: "菲律宾大学大学美术学院", originalName: "UP Fine Arts", location: "菲律宾", image: "https://picsum.photos/seed/as-up/800/600", description: "培养了多位菲律宾国家艺术家，东南亚当代艺术先锋。" },
    { id: "as-10", name: "清华大学美术学院", originalName: "Tsinghua Academy", location: "北京", image: "https://picsum.photos/seed/as-tsinghua/800/600", description: "原中央工艺美院，工业设计与跨学科研究的巅峰。" }
  ]
};
