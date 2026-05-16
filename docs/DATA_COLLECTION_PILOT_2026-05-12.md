# Data Collection Pilot - Full Field Sample

采集时间：2026-05-12

目标：用官网来源尝试补齐当前申请决策平台所需字段，验证“全字段、高质量、证据留痕”的采集方式。

本批次仅做样例，不写入数据库。采集对象选自当前数据库已有英国项目：

1. Central Saint Martins / UAL - BA (Hons) Fine Art
2. Anglia Ruskin University - BA (Hons) Fine Art
3. Aberystwyth University - BA Fine Art

## Quality Rules

- `verified`: 官网页面或官方 PDF 明确给出。
- `derived`: 从官网字段推导，例如 3 years -> 36 months。
- `not_found`: 本次官网采集中未找到，不编造。
- `needs_secondary_source`: 官方项目页未给出，需政府数据、排名源、就业数据源或平台自有数据补齐。
- 每个字段必须保留 `source_url` 或 `missing_reason`。

## 1. Central Saint Martins / UAL - BA (Hons) Fine Art

### Source URLs

- Course page: https://www.arts.ac.uk/subjects/fine-art/undergraduate/ba-hons-fine-art-csm

### Structured Record

```json
{
  "entity_match": {
    "school_name_en": "Central Saint Martins",
    "institution_group": "University of the Arts London",
    "program_name": "BA (Hons) Fine Art",
    "matched_existing_db_program_name": "BA (Hons) Fine Art",
    "match_confidence": 0.98,
    "source_url": "https://www.arts.ac.uk/subjects/fine-art/undergraduate/ba-hons-fine-art-csm"
  },
  "basic_info": {
    "degree_award": { "value": "Bachelor of Arts with Honours", "status": "verified" },
    "degree_level": { "value": "bachelor", "status": "derived" },
    "ucas_code": { "value": "W100", "status": "verified" },
    "university_code": { "value": "U65", "status": "verified" },
    "start_date": { "value": "September 2026", "status": "verified" },
    "duration_text": { "value": "3 years full-time; optional diploma year can extend study", "status": "verified" },
    "duration_months": { "value": 36, "status": "derived" },
    "mode": { "value": "full-time", "status": "verified" },
    "credits": { "value": 360, "status": "verified" },
    "campus": { "value": "Central Saint Martins", "status": "verified" },
    "city": { "value": "London", "status": "verified" },
    "country_code": { "value": "GB", "status": "derived" }
  },
  "overview": {
    "summary": {
      "value": "Contemporary fine art course organised around 2D, 3D, 4D and XD studios, combining studio practice, critical studies and professional development.",
      "status": "verified"
    },
    "pathways": { "value": ["2D", "3D", "4D", "XD"], "status": "verified" },
    "optional_diploma_options": {
      "value": ["Diploma in Professional Studies", "Diploma in Creative Computing", "Diploma in Apple Development"],
      "status": "verified"
    }
  },
  "application": {
    "application_route": { "value": "UCAS", "status": "verified" },
    "personal_statement_required": { "value": true, "status": "verified" },
    "personal_statement_character_limit": { "value": 4000, "status": "verified" },
    "portfolio_required": { "value": true, "status": "verified" },
    "portfolio_submission_platform": { "value": "PebblePad", "status": "verified" },
    "portfolio_max_pages": { "value": 25, "status": "verified" },
    "portfolio_requirements": {
      "value": [
        "Recent work reflecting creative strengths",
        "Finished projects and works in progress",
        "Evidence of experimentation with techniques and materials",
        "Evidence of research informing ideas and creative identity",
        "One sentence per page outlining ideas and interests"
      ],
      "status": "verified"
    },
    "interview_possible": { "value": true, "status": "verified" },
    "interview_format": { "value": "online", "status": "verified" },
    "interview_duration_minutes": { "value": "15-20", "status": "verified" },
    "reference_count": { "value": null, "status": "not_found", "missing_reason": "Course page did not state number of references." },
    "gpa_requirement": { "value": null, "status": "not_found", "missing_reason": "UK undergraduate page uses qualifications/portfolio rather than GPA." }
  },
  "entry_requirements": {
    "foundation_diploma": { "value": "Pass at Foundation Diploma in Art and Design Level 3 or 4 or equivalent", "status": "verified" },
    "btec": { "value": "Merit, Pass, Pass at BTEC Extended Diploma in preferred subjects", "status": "verified" },
    "gcse": { "value": "Three GCSE passes at grade 4 or above", "status": "verified" },
    "portfolio_assessment_required": { "value": true, "status": "verified" }
  },
  "language_requirements": {
    "ielts_overall_min": { "value": 6.0, "status": "verified" },
    "ielts_component_min": { "value": 5.5, "status": "verified" },
    "toefl_ibt": { "value": null, "status": "not_found", "missing_reason": "Course page references IELTS/main English requirements; no course-specific TOEFL score extracted in this run." },
    "duolingo": { "value": null, "status": "not_found", "missing_reason": "No course-specific Duolingo score extracted in this run." }
  },
  "fees": {
    "home_tuition_fee": { "value": 9790, "currency": "GBP", "period": "year", "fee_year": "2026/27", "status": "verified" },
    "international_tuition_fee": { "value": 30890, "currency": "GBP", "period": "year", "fee_year": "2026 entry", "status": "verified" },
    "international_fee_increase_policy": { "value": "May increase by up to 5% in each future year", "status": "verified" },
    "additional_costs_note": { "value": "Materials and equipment specific to the course may require additional costs.", "status": "verified" },
    "deposit": { "value": null, "status": "not_found", "missing_reason": "Course page did not state deposit." }
  },
  "curriculum": {
    "core_structure": { "value": ["Studio practice", "Critical Studies", "Professional Development"], "status": "verified" },
    "learning_methods": {
      "value": ["unit briefings", "inductions and workshops", "teaching events", "off-site work", "exchange opportunities", "tutorials", "seminars", "critical reviews", "lectures", "independent study"],
      "status": "verified"
    },
    "assessment_methods": {
      "value": ["studio work", "research and preparatory work", "documentation", "verbal and visual presentations", "written work", "participation in debate", "peer and self-critical evaluation"],
      "status": "verified"
    }
  },
  "facilities": {
    "facilities_summary": { "value": "CSM facilities include fine art studio resources and specialist making environments; page specifically references facilities and metal fabrication workshop imagery.", "status": "verified" },
    "facility_items": { "value": ["metal fabrication workshop"], "status": "verified" }
  },
  "career_outcomes": {
    "career_paths": {
      "value": ["postgraduate study", "fine art", "philosophy", "film", "communication", "landscape architecture", "art history", "gallery and museum studies", "literature", "broadcast journalism"],
      "status": "verified"
    },
    "employment_rate": { "value": null, "status": "needs_secondary_source", "missing_reason": "Course page lists pathways but not employment rate." },
    "median_salary": { "value": null, "status": "needs_secondary_source", "missing_reason": "Requires Discover Uni / HESA / external outcomes source." }
  },
  "scholarships": {
    "items": [
      { "name": "UAL Bursaries", "status": "verified" },
      { "name": "UAL Travel Bursary", "status": "verified" },
      { "name": "University Hardship Fund", "status": "verified" }
    ],
    "amounts": { "value": null, "status": "not_found", "missing_reason": "Course page lists funding names but not amounts." }
  },
  "ranking": {
    "qs_art_design_rank": { "value": null, "status": "needs_secondary_source", "missing_reason": "Course page does not provide QS subject rank." },
    "us_news_rank": { "value": null, "status": "needs_secondary_source" }
  },
  "platform_metrics": {
    "views": { "value": null, "status": "requires_internal_tracking" },
    "favorites": { "value": null, "status": "requires_internal_tracking" },
    "applications": { "value": null, "status": "requires_internal_tracking" },
    "admission_rate_platform": { "value": null, "status": "requires_internal_tracking" }
  }
}
```

## 2. Anglia Ruskin University - BA (Hons) Fine Art

### Source URLs

- Course page: https://www.aru.ac.uk/study/undergraduate/fine-art
- Undergraduate portfolio page: https://www.aru.ac.uk/arts-humanities-education-and-social-sciences/portfolios-and-auditions/ug-portfolios

### Structured Record

```json
{
  "entity_match": {
    "school_name_en": "Anglia Ruskin University",
    "program_name": "Fine Art",
    "degree": "BA (Hons)",
    "matched_existing_db_program_name": "Fine Art",
    "match_confidence": 0.97,
    "source_url": "https://www.aru.ac.uk/study/undergraduate/fine-art"
  },
  "basic_info": {
    "degree_award": { "value": "BA (Hons)", "status": "verified" },
    "degree_level": { "value": "bachelor", "status": "derived" },
    "ucas_code": { "value": "W105", "status": "verified" },
    "start_date": { "value": "September 2026", "status": "verified" },
    "location": { "value": "Cambridge", "status": "verified" },
    "duration_text": { "value": "3 years", "status": "verified" },
    "duration_months": { "value": 36, "status": "derived" },
    "placement_option": { "value": true, "status": "verified" },
    "placement_ucas_code": { "value": "W107", "status": "verified" },
    "foundation_year_option": { "value": true, "status": "verified" },
    "foundation_year_ucas_code": { "value": "W106", "status": "verified" }
  },
  "overview": {
    "summary": {
      "value": "Fine Art BA focused on experimentation with materials, media and contemporary fine art practice in a collaborative studio environment.",
      "status": "verified"
    },
    "subject_media": {
      "value": ["photography", "printmaking", "performance art", "film and video", "digital media", "installation", "site-specific approaches"],
      "status": "verified"
    }
  },
  "application": {
    "portfolio_required": { "value": true, "status": "verified" },
    "portfolio_requirements": { "value": "ARU has an undergraduate portfolio preparation page and course page says tutors support students to build a substantial portfolio.", "status": "verified" },
    "personal_statement_required": { "value": null, "status": "not_found", "missing_reason": "Not explicitly extracted from course page." },
    "interview_required": { "value": null, "status": "not_found", "missing_reason": "Not explicitly extracted from course page." },
    "reference_count": { "value": null, "status": "not_found" }
  },
  "entry_requirements": {
    "standard_entry": { "value": "Published entry requirements are a guide and decisions consider overall suitability and minimum requirements.", "status": "verified" },
    "foundation_year_gcse": { "value": "5 GCSEs at grade D/3 or above and evidence of two years post-GCSE study at Level 3", "status": "verified" },
    "computer_requirement": { "value": "Computer and reliable internet access required", "status": "verified" }
  },
  "language_requirements": {
    "ielts_overall_min": { "value": 5.5, "status": "verified" },
    "ielts_component_min": { "value": null, "status": "not_found", "missing_reason": "Course page excerpt states IELTS 5.5 or equivalent but did not expose component minimum in this run." },
    "toefl_ibt": { "value": null, "status": "not_found" },
    "duolingo": { "value": null, "status": "not_found" }
  },
  "fees": {
    "home_tuition_fee": { "value": 9790, "currency": "GBP", "period": "year", "fee_year": "2026/27", "status": "verified" },
    "international_tuition_fee": { "value": 18400, "currency": "GBP", "period": "year", "fee_year": "2026/27", "status": "verified" },
    "deposit": { "value": 4000, "currency": "GBP", "status": "verified" },
    "placement_year_fee": { "value": 1700, "currency": "GBP", "fee_year": "2026/27", "status": "verified" },
    "material_cost_estimate": { "value": 300, "currency": "GBP", "period": "over 3 years", "status": "verified" },
    "optional_trip_costs": { "value": "Two London trips in year 1 around GBP 25 train travel with railcard; optional international trip every two years.", "status": "verified" }
  },
  "curriculum": {
    "year_1_modules": {
      "value": ["Fine Art Practice 1", "Critical Histories of Art", "Ways of Seeing", "Into ARU", "Approaches to Drawing", "Experimental Practice", "Anglia Language Programme"],
      "status": "verified"
    },
    "year_2_modules": {
      "value": ["Fine Art Practice 2", "Critical Issues and Debates", "Ruskin Module", "Printmaking Ideas and Processes", "Spatial Practices", "Archive: Creative Futures", "Exhibitions in Context"],
      "status": "verified"
    },
    "year_3_modules": {
      "value": ["Fine Art Major Project", "Research Project", "Working in the Creative Industries"],
      "status": "verified"
    },
    "assessment_methods": {
      "value": ["portfolios", "installed exhibitions", "essays or shorter written assignments", "degree show", "research project"],
      "status": "verified"
    },
    "exam_required": { "value": false, "status": "verified" }
  },
  "facilities": {
    "facility_items": {
      "value": ["dedicated fine art studio", "own workspace", "Ruskin Gallery", "life drawing studio", "Mac and PC suites", "printmaking workshop", "3D workshops", "photography and media facilities", "Future Lab"],
      "status": "verified"
    }
  },
  "career_outcomes": {
    "career_paths": {
      "value": ["fine art practice", "community arts", "prop and set making", "art therapy", "museum and gallery administration", "education", "advertising", "art direction", "marketing", "digital content production", "lecturing", "teaching"],
      "status": "verified"
    },
    "employer_examples": { "value": ["Eden Project"], "status": "verified" },
    "employment_claim": { "value": "1st in the East of England for undergraduates employed as managers, directors or senior officials; source GOS 2025.", "status": "verified" },
    "employment_rate": { "value": null, "status": "needs_secondary_source", "missing_reason": "Course page gives a ranking-style claim, not a percentage." }
  },
  "scholarships": {
    "items": [
      { "name": "Supanee Gazeley Prize", "amount": 3000, "currency": "GBP", "status": "verified" },
      { "name": "Alumni Scholarship", "amount_note": "20% off fees for ARU graduates", "status": "verified" }
    ]
  },
  "ranking": {
    "tef": { "value": "Gold", "status": "verified" },
    "qs_art_design_rank": { "value": null, "status": "needs_secondary_source" }
  },
  "platform_metrics": {
    "views": { "value": null, "status": "requires_internal_tracking" },
    "favorites": { "value": null, "status": "requires_internal_tracking" },
    "applications": { "value": null, "status": "requires_internal_tracking" }
  }
}
```

## 3. Aberystwyth University - BA Fine Art

### Source URLs

- Course page: https://courses.aber.ac.uk/undergraduate/W100-fine-art/
- Tuition fees: https://www.aber.ac.uk/en/study-with-us/fees/undergrad/tuition-fees
- Prospectus / English requirement source surfaced by search: https://www.aber.ac.uk/en/pub/ug/UG-2025-EN-web-1.pdf

### Structured Record

```json
{
  "entity_match": {
    "school_name_en": "Aberystwyth University",
    "program_name": "Fine Art",
    "degree": "BA",
    "matched_existing_db_program_name": "Fine Art",
    "match_confidence": 0.97,
    "source_url": "https://courses.aber.ac.uk/undergraduate/W100-fine-art/"
  },
  "basic_info": {
    "degree_award": { "value": "BA", "status": "verified" },
    "degree_level": { "value": "bachelor", "status": "derived" },
    "ucas_code": { "value": "W100", "status": "verified" },
    "start_date": { "value": "September 2026", "status": "verified" },
    "duration_text": { "value": "3 years", "status": "verified" },
    "duration_months": { "value": 36, "status": "derived" },
    "ucas_tariff": { "value": "120-104", "status": "verified" },
    "country_code": { "value": "GB", "status": "derived" }
  },
  "overview": {
    "summary": {
      "value": "Fine Art course covering painting, printmaking, drawing, photography, book illustration, experimental film, installation and site-specific performance.",
      "status": "verified"
    },
    "school_resources": {
      "value": "Access to an internationally renowned collection of art and artefacts at the School of Art.",
      "status": "verified"
    }
  },
  "application": {
    "portfolio_required": { "value": true, "status": "verified" },
    "portfolio_requirements": { "value": "Satisfactory portfolio required for A Level, BTEC, IB and European Baccalaureate routes.", "status": "verified" },
    "personal_statement_required": { "value": null, "status": "not_found" },
    "interview_required": { "value": null, "status": "not_found" },
    "reference_count": { "value": null, "status": "not_found" }
  },
  "entry_requirements": {
    "a_levels": { "value": "BBB-BCC including B in Art or related subject, plus satisfactory portfolio", "status": "verified" },
    "btec": { "value": "DDM-DMM, plus satisfactory portfolio", "status": "verified" },
    "international_baccalaureate": { "value": "30-28, plus satisfactory portfolio", "status": "verified" },
    "european_baccalaureate": { "value": "75%-65% overall, plus satisfactory portfolio", "status": "verified" },
    "gcse": { "value": "English or Welsh minimum grade C/4", "status": "verified" }
  },
  "language_requirements": {
    "ielts_overall_min": { "value": 6.5, "status": "verified" },
    "ielts_component_min": { "value": 5.5, "status": "verified" },
    "toefl_ibt": { "value": null, "status": "not_found" },
    "duolingo": { "value": null, "status": "not_found" }
  },
  "fees": {
    "home_tuition_fee": { "value": 9790, "currency": "GBP", "period": "year", "fee_year": "2026/27", "status": "verified" },
    "international_tuition_fee": { "value": 19190, "currency": "GBP", "period": "year", "fee_year": "2026/27", "status": "verified", "mapping_note": "Mapped from Full-Time Arts / Social Sciences fee band." },
    "fee_freeze_policy": { "value": "International undergraduate fee levels are frozen at entry level for subsequent study years.", "status": "verified" },
    "accommodation_award": { "value": "Most international students are eligible to apply for the International Accommodation Award.", "status": "verified" },
    "deposit": { "value": null, "status": "not_found" }
  },
  "curriculum": {
    "year_1_core": {
      "value": ["Drawing: Extended Practice", "Drawing: Looking, Seeing, Thinking", "Painting: Extended Practice", "Painting: Looking, Seeing, Thinking", "Media Exploration"],
      "status": "verified"
    },
    "year_2_core": {
      "value": ["Digital Skills", "Professional Practice for Students of Art"],
      "status": "verified"
    },
    "year_3_core": {
      "value": ["Exhibition 2: Graduation Show", "Research and Process in Practice", "Exhibition Preparation (2)", "The Professional Artist"],
      "status": "verified"
    },
    "teaching_methods": {
      "value": ["workshops", "tutorials", "demonstrations", "practicals", "lectures", "crits", "field trips"],
      "status": "verified"
    },
    "assessment_methods": {
      "value": ["course work", "portfolios", "exhibitions", "essays", "reflective diaries", "book reviews", "research projects", "presentations"],
      "status": "verified"
    }
  },
  "facilities": {
    "facility_summary": {
      "value": "School of Art collection and Arts Centre association; detailed workshop/equipment list not fully extracted in this run.",
      "status": "verified_partial"
    },
    "facility_items": { "value": ["School of Art collections"], "status": "verified" }
  },
  "career_outcomes": {
    "career_paths": {
      "value": ["professional artist", "professional art historian", "curator", "administrator", "university educator", "secondary school teacher", "art gallery manager", "museum or exhibition curator", "journalist", "art director in publishing", "conservator"],
      "status": "verified"
    },
    "employer_examples": {
      "value": ["Arts Council", "BBC", "Design Council", "The Observer", "Royal Academy of Arts", "Royal Collections Trust", "Saatchi Gallery", "Tate Gallery", "Victoria and Albert Museum"],
      "status": "verified"
    },
    "employment_rate": { "value": null, "status": "needs_secondary_source" },
    "median_salary": { "value": null, "status": "needs_secondary_source" }
  },
  "ranking": {
    "student_satisfaction_employability_claim": { "value": "Course page claims one of the highest-ranking art departments in the UK for student satisfaction and employability success.", "status": "verified_claim" },
    "qs_art_design_rank": { "value": null, "status": "needs_secondary_source" }
  },
  "platform_metrics": {
    "views": { "value": null, "status": "requires_internal_tracking" },
    "favorites": { "value": null, "status": "requires_internal_tracking" },
    "applications": { "value": null, "status": "requires_internal_tracking" }
  }
}
```

## Findings From This Pilot

1. 官网可高质量补齐的字段：
   - 项目名、学位、UCAS code、开学时间、学制、模式
   - 学费、押金、placement fee、材料费/额外成本
   - 语言要求中的 IELTS
   - 作品集是否 required、页数、提交平台、面试形式
   - 模块、教学方式、评估方式、设施、职业方向

2. 官网经常缺失或不稳定的字段：
   - TOEFL / Duolingo / PTE 分数
   - 就业率、平均薪资、录取率
   - 推荐信数量
   - 生活费详细拆分
   - 排名

3. 需要二级来源补齐的字段：
   - Discover Uni / HESA：就业率、薪资、学生满意度
   - QS / US News：排名
   - 学校 scholarships 页面：奖学金金额与资格
   - 平台埋点：浏览、收藏、申请人数、录取率、热度

4. 对当前数据库的直接价值：
   - `program_admissions.ielts_overall`、`ielts_subscores`、`portfolio_requirements`、`portfolio_format`、`regular_deadline`
   - `program_fees.international_tuition_fee`、`domestic_tuition_fee`、`additional_fees_note`
   - `programs.core_courses`、`career_paths`、`duration_text`、`requires_interview`、`requires_personal_statement`

## Recommended Next Step

把这套 JSON 结构固化为 staging schema。每次抓取时，先入 staging，不直接覆盖正式表：

- `source_pages`
- `source_snapshots`
- `program_extraction_staging`
- `program_field_evidence`
- `data_review_queue`

审核通过后再写正式业务表。
