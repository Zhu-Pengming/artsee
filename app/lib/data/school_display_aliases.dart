class SchoolDisplayAlias {
  final String id;
  final String slug;
  final String nameZh;
  final String nameEn;
  final String country;
  final String city;
  final int? qsArtRank;
  final List<String> aliases;
  final List<String> featureTags;
  final List<String> strengthDisciplines;
  final String schoolType;
  final String description;
  final String? logoUrl;
  final String? remoteId;

  const SchoolDisplayAlias({
    required this.id,
    required this.slug,
    required this.nameZh,
    required this.nameEn,
    required this.country,
    required this.city,
    required this.aliases,
    required this.featureTags,
    required this.strengthDisciplines,
    required this.schoolType,
    required this.description,
    this.qsArtRank,
    this.logoUrl,
    this.remoteId,
  });

  Map<String, dynamic> toSchoolRow() {
    return {
      'id': id,
      'slug': slug,
      'name_zh': nameZh,
      'name_en': nameEn,
      'country': country,
      'raw_country': country,
      'city': city,
      'description': description,
      'feature_tags': featureTags,
      'strength_disciplines': strengthDisciplines,
      'school_type': schoolType,
      'aliases': aliases,
      'qs_art_rank': qsArtRank,
      'qs_art_design_rank': qsArtRank,
      'logo_url': logoUrl,
      'program_count': null,
      'portfolio_difficulty': qsArtRank != null && qsArtRank! <= 20 ? 5 : 4,
      'city_cost_index': city == '伦敦' || city == '纽约' ? 5 : 4,
      'career_resources_rating': qsArtRank != null && qsArtRank! <= 20 ? 5 : 4,
      'saved_count': 0,
      'consultation_count': 0,
      'status': 'active',
      'data_source': 'auxiliary_catalog',
      'is_auxiliary_display': true,
      if (remoteId != null) 'remote_school_id': remoteId,
    };
  }
}

const kSchoolDisplayAliases = <SchoolDisplayAlias>[
  SchoolDisplayAlias(
    id: 'aux-royal-college-art',
    slug: 'royal-college-art',
    nameZh: '皇家艺术学院',
    nameEn: 'Royal College of Art',
    country: '英国',
    city: '伦敦',
    qsArtRank: 1,
    aliases: ['rca', '皇艺', '皇家艺术学院', 'royal college of art'],
    featureTags: ['公立', '研究生院', '艺术设计', '顶尖艺术院校'],
    strengthDisciplines: ['纯艺术', '服务设计', '产品设计', '视觉传达', '时尚'],
    schoolType: 'art_academy',
    description: '皇家艺术学院是位于伦敦的研究型艺术与设计学院，以研究生教育、跨学科设计和当代艺术实践见长。',
    remoteId: 'ce0cf7d4-1908-45b1-a7f9-6faec1c2aaf2',
  ),
  SchoolDisplayAlias(
    id: 'aux-university-arts-london',
    slug: 'university-arts-london',
    nameZh: '伦敦艺术大学',
    nameEn: 'University of the Arts London',
    country: '英国',
    city: '伦敦',
    qsArtRank: 2,
    aliases: ['ual', '伦艺', '伦敦艺术大学', 'university of the arts london'],
    featureTags: ['公立', '艺术设计', '多学院'],
    strengthDisciplines: ['时尚设计', '平面设计', '纯艺术', '电影制作', '摄影'],
    schoolType: 'multi_disciplinary',
    description: '伦敦艺术大学由多所艺术、设计、时尚与传媒学院组成，是英国创意教育的重要体系。',
    remoteId: 'a9665370-b362-4bd4-a3e7-3a341286a875',
  ),
  SchoolDisplayAlias(
    id: 'aux-central-saint-martins',
    slug: 'central-saint-martins',
    nameZh: '中央圣马丁学院',
    nameEn: 'Central Saint Martins',
    country: '英国',
    city: '伦敦',
    qsArtRank: 2,
    aliases: [
      'csm',
      '中央圣马丁',
      'central saint martins',
      'central saint martins college'
    ],
    featureTags: ['公立', '艺术设计', '作品集导向'],
    strengthDisciplines: ['时尚设计', '平面设计', '纯艺术', '珠宝设计', '纺织设计'],
    schoolType: 'design_school',
    description: '中央圣马丁学院隶属伦敦艺术大学，以时尚、纯艺、视觉传达和跨学科创意见长。',
    remoteId: '9846a847-090b-4d04-ab1b-f46aa8169f15',
  ),
  SchoolDisplayAlias(
    id: 'aux-london-college-fashion',
    slug: 'london-college-fashion',
    nameZh: '伦敦时装学院',
    nameEn: 'London College of Fashion',
    country: '英国',
    city: '伦敦',
    qsArtRank: 2,
    aliases: ['lcf', '伦敦时装学院', 'london college of fashion'],
    featureTags: ['公立', '时尚', '艺术设计'],
    strengthDisciplines: ['时尚设计', '时尚媒体', '时尚商业'],
    schoolType: 'design_school',
    description: '伦敦时装学院隶属伦敦艺术大学，覆盖时装设计、时尚媒体、时尚管理与商业方向。',
    remoteId: '0d2bc70b-2729-40f5-a021-cfadb56bed04',
  ),
  SchoolDisplayAlias(
    id: 'aux-london-college-communication',
    slug: 'london-college-communication',
    nameZh: '伦敦传媒学院',
    nameEn: 'London College of Communication',
    country: '英国',
    city: '伦敦',
    qsArtRank: 2,
    aliases: ['lcc', '伦敦传媒学院', 'london college of communication'],
    featureTags: ['公立', '传媒', '艺术设计'],
    strengthDisciplines: ['平面设计', '摄影', '电影', '交互设计'],
    schoolType: 'design_school',
    description: '伦敦传媒学院隶属伦敦艺术大学，侧重视觉传达、摄影、电影、媒体与交互方向。',
    remoteId: 'abec56b4-735e-4d52-b970-b245289efc09',
  ),
  SchoolDisplayAlias(
    id: 'aux-risd',
    slug: 'risd',
    nameZh: '罗德岛设计学院',
    nameEn: 'Rhode Island School of Design',
    country: '美国',
    city: 'Providence',
    qsArtRank: 4,
    aliases: ['risd', '罗德岛', '罗德岛设计学院', 'rhode island school of design'],
    featureTags: ['私立', '艺术设计', '顶尖艺术院校'],
    strengthDisciplines: ['平面设计', '工业设计', '纯艺术', '插画', '建筑'],
    schoolType: 'design_school',
    description: '罗德岛设计学院是美国顶尖艺术与设计学院，以 studio 训练、设计基础和跨媒介创作见长。',
    remoteId: '871a1998-1c0e-40ea-b55a-14bbefd408a7',
  ),
  SchoolDisplayAlias(
    id: 'aux-saic',
    slug: 'school-art-institute-chicago',
    nameZh: '芝加哥艺术学院',
    nameEn: 'School of the Art Institute of Chicago',
    country: '美国',
    city: 'Chicago',
    qsArtRank: 5,
    aliases: ['saic', '芝加哥艺术学院', 'school of the art institute of chicago'],
    featureTags: ['私立', '艺术设计', '博物馆资源'],
    strengthDisciplines: ['纯艺术', '绘画', '雕塑', '摄影', '跨学科'],
    schoolType: 'art_academy',
    description: '芝加哥艺术学院与芝加哥艺术博物馆联系紧密，强调当代艺术、跨学科实践与批判性创作。',
  ),
  SchoolDisplayAlias(
    id: 'aux-scad',
    slug: 'scad',
    nameZh: '萨凡纳艺术与设计学院',
    nameEn: 'Savannah College of Art and Design',
    country: '美国',
    city: 'Savannah',
    qsArtRank: 15,
    aliases: [
      'scad',
      '萨凡纳',
      '萨凡纳艺术与设计学院',
      'savannah college of art and design'
    ],
    featureTags: ['私立', '艺术设计', '多校区', '高就业率'],
    strengthDisciplines: ['动画', '电影', '用户体验设计', '工业设计', '时尚设计'],
    schoolType: 'design_school',
    description: '萨凡纳艺术与设计学院提供丰富的艺术与设计专业，重视职业路径和创意产业连接。',
    remoteId: '0a580837-088e-46e4-a424-9642186faac0',
  ),
  SchoolDisplayAlias(
    id: 'aux-pratt',
    slug: 'pratt-institute',
    nameZh: '普瑞特艺术学院',
    nameEn: 'Pratt Institute',
    country: '美国',
    city: 'Brooklyn',
    qsArtRank: 5,
    aliases: ['pratt', '普瑞特', '普瑞特艺术学院', 'pratt institute'],
    featureTags: ['私立', '艺术设计', '作品集导向'],
    strengthDisciplines: ['建筑', '工业设计', '室内设计', '平面设计', '插画'],
    schoolType: 'design_school',
    description: '普瑞特艺术学院位于纽约布鲁克林，在建筑、工业设计、室内设计和平面设计方向有较强声誉。',
  ),
  SchoolDisplayAlias(
    id: 'aux-parsons',
    slug: 'parsons-school-design',
    nameZh: '帕森斯设计学院',
    nameEn: 'Parsons School of Design',
    country: '美国',
    city: '纽约',
    qsArtRank: 4,
    aliases: ['parsons', '帕森斯', '帕森斯设计学院', 'parsons school of design'],
    featureTags: ['私立', '设计学院', '时尚', '纽约'],
    strengthDisciplines: ['时尚设计', '产品设计', '交互设计', '平面设计'],
    schoolType: 'design_school',
    description: '帕森斯设计学院隶属 The New School，位于纽约，在时尚、设计与社会创新方向具有强行业连接。',
    remoteId: '53177fa4-1ae6-4145-a03a-05b7d71b33df',
  ),
  SchoolDisplayAlias(
    id: 'aux-sva',
    slug: 'school-visual-arts',
    nameZh: '纽约视觉艺术学院',
    nameEn: 'School of Visual Arts',
    country: '美国',
    city: '纽约',
    qsArtRank: null,
    aliases: ['sva', '纽约视觉艺术学院', 'school of visual arts'],
    featureTags: ['私立', '视觉艺术', '纽约'],
    strengthDisciplines: ['插画', '动画', '平面设计', '摄影', '电影'],
    schoolType: 'design_school',
    description: '纽约视觉艺术学院位于纽约，聚焦视觉艺术、插画、动画、设计、摄影和影像方向。',
  ),
  SchoolDisplayAlias(
    id: 'aux-calarts',
    slug: 'calarts',
    nameZh: '加州艺术学院',
    nameEn: 'California Institute of the Arts',
    country: '美国',
    city: 'Valencia',
    qsArtRank: null,
    aliases: ['calarts', '加州艺术学院', 'california institute of the arts'],
    featureTags: ['私立', '艺术设计', '动画'],
    strengthDisciplines: ['动画', '电影', '实验艺术', '表演艺术'],
    schoolType: 'art_academy',
    description: '加州艺术学院以动画、实验影像、音乐、表演和跨学科艺术实践闻名。',
  ),
];

String normalizeSchoolAliasText(String value) {
  return value.trim().toLowerCase().replaceAll(RegExp(r'\s+'), ' ');
}

bool schoolAliasMatches(String query, String alias) {
  final normalizedQuery = normalizeSchoolAliasText(query);
  final normalizedAlias = normalizeSchoolAliasText(alias);
  if (normalizedQuery.isEmpty || normalizedAlias.isEmpty) return false;
  final isLatinAlias = RegExp(r'^[a-z0-9\s]+$').hasMatch(normalizedAlias);
  if (!isLatinAlias) return normalizedQuery.contains(normalizedAlias);

  final escaped = RegExp.escape(normalizedAlias);
  return RegExp('(^|[^a-z0-9])$escaped([^a-z0-9]|\$)')
      .hasMatch(normalizedQuery);
}
