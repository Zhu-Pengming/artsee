-- Art School Database Patch
-- Generated from schools_final_data_fixed.csv
-- Updates existing records + 4 new inserts

BEGIN;

UPDATE schools SET
  raw_country = '中国',
  city = 'Beijing',
  country_code = 'CN',
  description = '清华大学美术学院，前身为中央工艺美术学院，成立于1956年，1999年并入清华大学，是中国第一所艺术设计高等学府。学院历史悠久，学科齐全，教学科研设施完善，享誉海内外。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.enad.tsinghua.edu.cn/Admissions.htm',
  logo_url = 'https://www.enad.tsinghua.edu.cn/img/logo.svg',
  tuition_usd_per_year = 5500,
  program_count = 20,
  portfolio_difficulty = 5,
  city_cost_index = 3,
  career_resources_rating = 4,
  founded_year = 1956,
  qs_art_design_rank = 25,
  qs_history_of_art_rank = 3,
  major_tags = '[{"category":"design","tags":["textile_fashion","ceramic","visual_communication","environmental_art","industrial","information_art"]},{"category":"fine_arts","tags":["painting","sculpture"]},{"category":"art_history","tags":["art_history"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学下属学院']::text[],
  strength_disciplines = ARRAY['设计', '美术', '艺术理论', '纺织服装设计', '陶瓷设计', '视觉传达设计', '环境艺术设计', '工业设计', '工艺美术', '信息艺术设计', '绘画', '雕塑', '艺术史论']::text[],
  notable_alumni = '庞薰琹, 王小丁, 何静, 刘北光',
  acceptance_rate = 0.05,
  qs_overall_rank = 25
WHERE id = '771bd252-5afa-40ca-b335-ebd7082e9473';

UPDATE schools SET
  raw_country = '美国',
  city = 'Tempe',
  country_code = 'US',
  description = '亚利桑那州立大学艺术学院是美国一所知名的艺术学府，隶属于赫伯格设计与艺术学院。学院提供多样化的艺术课程，致力于培养学生的创造力和批判性思维。其位于坦佩校区，为学生提供丰富的学术资源和实践机会。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://admission.asu.edu/international/undergrad-student',
  notable_alumni = 'Barbara Barrett, Herbie Behm, Willie Bloomquist, Marc Briggs, Michael Burns, Malissia Clinton, Reka Cseresnyes, Matthew Desmond, Christine Devine, Kenny Dillingham, Doug Ducey, Missy Farr-Kaye, Mary Lou Fulton, Mary Temple Grandin, Gregory Haile, Derrick Hall, Jan Henne-Hawkins, Zeke Jones, Vada Manager, Aaron Matos, Ruth McGregor, Al Michaels, Phil Mickelson, Harriet Nembhard, Anthony Robles, Petra Pardi, Ed Pastor, Greg Powers, Edward “Joe” Shoen, Kyrsten Sinema, Kate Spade, Brenda Strong, Ayọ Tometi, Matt Thurmond, Pat Tillman, Danny White, Jeri Williams, Ryan Wood, Margaret H. Woodward, Peterson Zah',
  tuition_usd_per_year = 37167,
  acceptance_rate = 0.9,
  program_count = 18,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1885,
  qs_overall_rank = 179,
  feature_tags = ARRAY['公立', '综合大学下属艺术学院']::text[]
WHERE id = 'dcbcea12-455b-4e78-902c-25586623fbde';

UPDATE schools SET
  raw_country = '巴西',
  city = 'Porto Alegre',
  country_code = 'BR',
  description = '联邦南大河州大学艺术学院位于南大河州首府阿雷格里港。学院成立于1908年，最初名为“自由美术学院”，是巴西历史最悠久的艺术高等学府之一。目前设有视觉艺术、音乐和戏剧艺术系，拥有百余名教授和约1600名学生。',
  international_students_page = 'http://www.ufrgs.br/relinter/english/applying-to-ufrgs',
  tuition_usd_per_year = 1030,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1908,
  qs_overall_rank = 691,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['视觉艺术', '音乐', '戏剧艺术']::text[]
WHERE id = 'e56d9045-f5ab-40a4-baa4-163d4d82afff';

UPDATE schools SET
  raw_country = '新西兰',
  city = 'Auckland',
  country_code = 'NZ',
  description = '奥克兰理工大学（AUT）是新西兰一所充满活力的综合性大学，其艺术与设计学院在新西兰处于领先地位。学校注重实践教学和行业联系，为学生提供丰富的实习和项目机会。AUT在QS世界大学排名中表现出色，尤其在国际视野、体育相关学科、酒店与休闲管理等领域享有盛誉。其艺术与设计专业强调原创性、创造力和设计思维，培养学生在真实世界中解决问题的能力。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.aut.ac.nz/international',
  notable_alumni = 'Bruce McLaren, David Farrier, Angela Cullen, Ali Williams, Peter Thomson, Jim Anderton',
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Logo_of_Auckland_University_of_Technology.svg/1200px-Logo_of_Auckland_University_of_Technology.svg.png',
  tuition_usd_per_year = 26548,
  acceptance_rate = 0.91,
  program_count = 10,
  portfolio_difficulty = 4,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1895,
  qs_art_design_rank = 300,
  qs_architecture_built_environment_rank = 260,
  qs_overall_rank = 410,
  qs_art_humanities_rank = 373,
  major_tags = '[{"category":"design","tags":["fashion","visual_communication","digital_design","product_design","spatial_design"]},{"category":"art","tags":["visual_arts","photography","intermedia"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学', '艺术设计']::text[],
  strength_disciplines = ARRAY['设计', '视觉艺术', '时尚设计', '数字设计']::text[]
WHERE id = 'd0a13c23-c3d4-4cfb-a372-f3f9ea839c9b';

UPDATE schools SET
  raw_country = '埃及',
  city = 'Cairo',
  country_code = 'EG',
  description = '赫勒万大学应用艺术学院是埃及历史悠久的设计院校之一，起源于1839年。学院在艺术、设计科学和技术领域提供卓越的教育和研究，旨在培养创新型人才。学院拥有十四个学术系和七个特色课程，致力于为学生提供与时俱进的知识和技能，以满足就业市场需求。',
  international_students_page = 'https://applied-arts.capu.edu.eg/en/students-en',
  logo_url = 'https://applied-arts.capu.edu.eg/images/applied-arts.png',
  tuition_usd_per_year = 3500,
  program_count = 18,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1839,
  major_tags = '[{"category":"design","tags":["multimedia_printing","packaging_science","furniture_design","glass_design","apparel","textile_printing","spinning_weaving","sculpture","decoration","ceramics","metal_products_jewelry","industrial_design","interior_design","advertising","print_publishing","photography_cinema_television"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['多媒体印刷', '包装科学', '家具设计', '玻璃设计', '服装', '纺织印染', '纺织', '雕塑', '装饰', '陶瓷', '金属制品与珠宝', '工业设计', '室内设计', '广告', '出版', '摄影电影电视']::text[]
WHERE id = '5290253e-55da-4391-88f3-f4b55c1cdd11';

UPDATE schools SET
  raw_country = '美国',
  city = 'Los Angeles',
  country_code = 'US',
  description = '加州州立大学洛杉矶分校艺术系为学生提供视觉艺术领域的知识和技能培养，旨在为教学、商业和工业等多个专业领域以及艺术深造做好准备。该系提供学士、硕士和艺术硕士学位课程，以及艺术辅修和时尚、纤维与材料证书课程。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.calstatela.edu/admissions/international-applicants',
  notable_alumni = 'Billie Jean King, Helen Hunt, Alfonso Ribeiro, Edward James Olmos, Robert Redford',
  logo_url = 'https://www.calstatela.edu/sites/default/files/CalStateLA-with-Eagle-Logotype-1793x287.png',
  tuition_usd_per_year = 19764,
  acceptance_rate = 0.91,
  portfolio_difficulty = 3,
  city_cost_index = 4,
  career_resources_rating = 3,
  founded_year = 1947,
  major_tags = '[{"category":"design","tags":["animation","graphic_design","fashion","fiber","materials"]},{"category":"fine_arts","tags":["studio_arts","ceramics","photography","painting","printmaking","sculpture"]},{"category":"art_history","tags":["art_history"]},{"category":"art_education","tags":["art_education"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学院系']::text[],
  strength_disciplines = ARRAY['动画', '平面设计', '时尚', '纯艺术', '艺术史', '艺术教育']::text[]
WHERE id = 'f740eeda-ac36-43bb-b687-e4079d3d61c5';

UPDATE schools SET
  raw_country = '美国',
  city = 'Long Beach',
  country_code = 'US',
  description = '加州州立大学长滩分校艺术学院（CSULB College of the Arts）是美国西部最大的公立艺术学院之一，提供音乐、舞蹈、戏剧、电影、设计和艺术等多个领域的本科和研究生课程。学院以其多元化的艺术教育、实践机会和对社区的贡献而闻名，致力于培养具有创造力和社会责任感的艺术家和设计师。',
  application_deadline = 'Fall: Oct 1-Apr 1; Spring: Aug 1-Oct 1',
  international_students_page = 'https://www.csulb.edu/international/future-students',
  notable_alumni = '4 CSULB Alums Named to Interior Design Magazine 30 Under 30 List',
  logo_url = '/home/ubuntu/upload/search_images/G9UBeNG3Lge7.png',
  tuition_usd_per_year = 19646,
  acceptance_rate = 0.46,
  portfolio_difficulty = 3,
  city_cost_index = 4,
  career_resources_rating = 3,
  founded_year = 1949,
  qs_overall_rank = 1401,
  major_tags = '[{"category":"music","tags":["music"]},{"category":"film","tags":["cinematography","documentary_production","critical_studies","directing","post_production","producing","screenwriting"]},{"category":"dance","tags":["dance"]},{"category":"design","tags":["industrial_design","interior_design","graphic_design","fashion_design"]},{"category":"theater","tags":["theatre_arts"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学下属学院']::text[],
  strength_disciplines = ARRAY['音乐', '电影', '舞蹈', '设计', '戏剧']::text[]
WHERE id = 'c2607cfe-2086-48b7-a9be-6d343019a3a9';

UPDATE schools SET
  raw_country = '美国',
  city = 'Northridge',
  country_code = 'US',
  description = '加州州立大学北岭分校艺术与设计系提供动画、艺术教育、艺术史、陶瓷、绘画、传达设计、插画、油画、摄影、版画、雕塑和视频等本科专业，并提供视觉艺术硕士学位。该系致力于培养学生在视觉艺术领域的知识、技能和批判性思维。',
  application_deadline = 'May 31 (Fall Admission), October 31 (Spring Admission) for graduate international students',
  international_students_page = 'https://www.csun.edu/admissions-financial-aid/how-to-apply/international-students',
  notable_alumni = 'Samantha and Mark Sirota',
  logo_url = 'https://www.csun.edu/sites/default/files/csun-logo-white.png',
  tuition_usd_per_year = 36460,
  acceptance_rate = 0.92,
  program_count = 11,
  portfolio_difficulty = 3,
  city_cost_index = 4,
  career_resources_rating = 3,
  founded_year = 1958,
  major_tags = '[{"category":"design","tags":["animation","communication_design","illustration","photography","video"]},{"category":"fine_arts","tags":["ceramics","drawing","painting","printmaking","sculpture"]},{"category":"art_history","tags":["art_history"]},{"category":"art_education","tags":["art_education"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学院系', '艺术设计']::text[],
  strength_disciplines = ARRAY['动画', '传达设计', '插画', '油画', '摄影', '雕塑', '陶瓷', '版画', '艺术史', '艺术教育']::text[]
WHERE id = 'f549c16a-b5dc-40c8-bfd1-f6db456d5c33';

UPDATE schools SET
  raw_country = '中国',
  city = 'Beijing',
  country_code = 'CN',
  description = '中央美术学院是教育部直属的中国唯一一所高等美术学校，可追溯至1918年。设有中国画、油画、雕塑、设计、建筑等十六个专业院系，涵盖本科、硕士、博士及留学生教育，致力于建设现代形态美术教育学科结构。',
  application_deadline = 'Bachelor degree program: March & April; Master degree program: November; Doctoral Degree program: March; Foundation Course: March to June (one academic year), October to December (half year)',
  international_students_page = 'http://global.cafa.edu.cn/study/apply/',
  notable_alumni = '齐白石,黄宾虹,潘天寿,林风眠,徐悲鸿,吴作人,靳尚谊',
  tuition_usd_per_year = 8000,
  program_count = 30,
  portfolio_difficulty = 5,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1918,
  qs_art_design_rank = 14,
  major_tags = '[{"category":"fine_arts","tags":["chinese_painting","calligraphy","painting","sculpture","mural_painting","experimental_art","photography","fine_arts_theory","art_history","cultural_industry_management","animation","public_art","art_and_technology","cultural_heritage_conservation_and_restoration","craft_art","art_education","art_management"]},{"category":"design","tags":["visual_communication_design","industrial_design","product_design","digital_media_art","fashion_and_jewelry_design","environmental_design","urban_design","architecture","landscape_architecture","film_and_television_photography_and_production"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['中国画', '油画', '雕塑', '设计', '建筑', '实验艺术', '视觉传达设计', '工业设计', '产品设计', '数字媒体艺术', '服装与服饰设计', '摄影', '美术学', '艺术史论', '文化产业管理', '建筑学', '风景园林设计', '影视摄影与制作', '环境设计', '公共艺术', '动画', '艺术管理', '艺术与科技', '文物保护与修复', '工艺美术', '艺术设计学', '艺术教育', '城市设计', '科技艺术', '美术教育']::text[],
  acceptance_rate = 0.05,
  qs_overall_rank = 300
WHERE id = '24dab8e3-71ce-4ed7-bf87-08a7aaaf6bd8';

UPDATE schools SET
  raw_country = '英国',
  city = 'London',
  country_code = 'GB',
  description = '中央圣马丁艺术与设计学院是伦敦艺术大学的组成学院，是世界领先的艺术与设计教育中心之一。学院以其毕业生和师生的创造力而闻名，提供预科、本科和研究生课程，涵盖艺术、设计、时尚、平面设计、珠宝、纺织等多个领域。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.arts.ac.uk/study-at-ual/international',
  notable_alumni = 'John Galliano, Stella McCartney, Alexander McQueen, Zac Posen, Riccardo Tisci, Jarvis Cocker, Laure Prouvost',
  logo_url = 'https://www.arts.ac.uk/__data/assets/image/0027/372915/DSC_5434_a1322dd5-c58a-4c36-b0f4-5d9ec005e246.jpg',
  tuition_usd_per_year = 41538,
  acceptance_rate = 0.05,
  program_count = 54,
  portfolio_difficulty = 5,
  city_cost_index = 5,
  career_resources_rating = 5,
  founded_year = 1854,
  qs_art_design_rank = 2,
  major_tags = '[{"category":"design","tags":["fashion","graphic_communication","jewellery","textile","product","ceramic","industrial"]},{"category":"art","tags":["fine_art"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '作品集导向']::text[],
  strength_disciplines = ARRAY['时尚设计', '平面设计', '纯艺术', '珠宝设计', '纺织设计']::text[]
WHERE id = '9846a847-090b-4d04-ab1b-f46aa8169f15';

UPDATE schools SET
  raw_country = '泰国',
  city = 'Bangkok',
  country_code = 'TH',
  description = '朱拉隆功大学美术与应用艺术学院成立于1983年，是泰国顶尖的艺术学府，提供视觉艺术、音乐、创意艺术和舞蹈等本科及研究生课程。学院致力于培养具有知识、技能和创造力的艺术家，以促进泰国艺术文化的发展。',
  application_deadline = 'Feb-May (for international graduate programs)',
  international_students_page = 'https://www.faa.chula.ac.th/international/',
  logo_url = 'https://www.faa.chula.ac.th/international/wp-content/uploads/2020/06/logo.png',
  tuition_usd_per_year = 4400,
  program_count = 7,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1983,
  qs_overall_rank = 221,
  major_tags = '[{"category":"visual_arts","tags":["visual_arts"]},{"category":"creative_arts","tags":["fashion","creative_arts"]},{"category":"music","tags":["thai_music","western_music","music_therapy"]},{"category":"dance","tags":["thai_dance","contemporary_dance"]},{"category":"curatorial_practice","tags":["curatorial_practice"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学院系']::text[],
  strength_disciplines = ARRAY['视觉艺术', '音乐', '创意艺术', '舞蹈', '艺术疗法', '策展实践']::text[]
WHERE id = '919e4d96-99ee-4818-9e83-45c05543bc95';

UPDATE schools SET
  raw_country = '加拿大',
  city = 'Montreal',
  country_code = 'CA',
  description = '康考迪亚大学艺术学院是加拿大领先的艺术教育机构之一，提供广泛的视觉艺术、表演艺术和设计课程。学院以其创新精神和跨学科方法而闻名，培养学生在艺术领域进行批判性思维和创造性实践。',
  international_students_page = 'https://www.concordia.ca/admissions/international.html',
  logo_url = 'https://www.concordia.ca/etc/designs/concordia/clientlibs/img/logo-concordia-university.png',
  tuition_usd_per_year = 23215,
  acceptance_rate = 0.44,
  program_count = 48,
  portfolio_difficulty = 4,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1974,
  major_tags = '[{"category":"design","tags":["graphic_design","industrial_design","animation"]},{"category":"fine_arts","tags":["painting","sculpture","photography"]},{"category":"performing_arts","tags":["film_production","theatre","dance"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学院系']::text[],
  strength_disciplines = ARRAY['电影制作', '动画', '当代艺术']::text[]
WHERE id = '92842fef-59ff-493e-88c8-fdacf347ee25';

UPDATE schools SET
  raw_country = '南非',
  city = 'Durban',
  country_code = 'ZA',
  description = '德班理工大学艺术与设计学院是南非领先的艺术设计学府，致力于培养学生的创造力、批判性思维和创新能力。学院提供多元化的艺术、设计、教育和人文科学课程，旨在培养适应市场需求并具备创业精神的毕业生。学院以其卓越的教学和研究享誉国内外，鼓励跨学科合作，推动艺术与科技的融合。',
  international_students_page = 'https://www.dut.ac.za/international_education_and_partnerships/',
  program_count = 10,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 2002,
  major_tags = '[{"category":"arts","tags":["drama","production_studies","fine_art","jewellery_design"]},{"category":"design","tags":["fashion","textiles","visual_communication","interior_design","photography"]},{"category":"media","tags":["journalism","language_practice","translation_interpreting","english_communication","video_technology"]},{"category":"education","tags":["art_education"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['戏剧与制作研究', '时尚与纺织', '纯艺术与珠宝设计', '媒体语言与传播', '视频技术', '视觉传达设计']::text[]
WHERE id = 'dbb64588-51e3-4da0-a2ce-41698edb1d78';

UPDATE schools SET
  raw_country = '加拿大',
  city = 'Vancouver',
  country_code = 'CA',
  description = '艾米丽卡尔艺术与设计大学是加拿大顶尖的艺术与设计学府，成立于1925年，以其卓越的创意教育和充满活力的社区而闻名，致力于通过艺术和设计塑造社会。',
  application_deadline = 'Jan 15 (Summer Accelerated Foundation, Fall); Sep 15 (Spring)',
  international_students_page = 'https://ecuad.ca/life-at-ecu/international-students-guide/',
  notable_alumni = 'Annie Liu, Douglas Coupland, Tommy Genesis, Michael Snow, Lynn Johnston',
  logo_url = 'https://ecuad.ca/wp-content/uploads/2025/12/Emily-Carr-University-of-Art-Design-Logo-Primary.png',
  tuition_usd_per_year = 12850,
  acceptance_rate = 0.47,
  program_count = 11,
  portfolio_difficulty = 4,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1925,
  qs_art_design_rank = 30,
  major_tags = '[{"category":"design","tags":["communication_design","industrial_design","interaction_design"]},{"category":"fine_arts","tags":["visual_arts","film_screen_arts","photography","animation"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '作品集导向']::text[],
  strength_disciplines = ARRAY['动画', '视觉传达', '工业设计', '电影与屏幕艺术', '摄影', '视觉艺术']::text[]
WHERE id = 'c18a731f-1249-4234-9837-939d49f230e7';

UPDATE schools SET
  raw_country = '墨西哥',
  city = 'Mexico City',
  country_code = 'MX',
  description = '墨西哥国立自治大学艺术与设计学院是墨西哥领先的艺术与设计机构，致力于培养艺术与设计领域的专业人才和研究人员，拥有悠久的历史和丰富的艺术藏品。学院以研究生产为基础，通过教学和文化传播服务墨西哥社会。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.unaminternacional.unam.mx/en/unam',
  logo_url = 'https://fad.unam.mx/wp-content/uploads/2025/03/logo-fad-azul.png',
  program_count = 3,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1781,
  qs_art_design_rank = 40,
  qs_architecture_built_environment_rank = 49,
  qs_overall_rank = 136,
  qs_art_humanities_rank = 26,
  major_tags = '[{"category":"design","tags":["visual_communication","graphic_design"]},{"category":"art","tags":["visual_arts","fine_arts"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['视觉传达设计', '视觉艺术', '艺术与设计']::text[]
WHERE id = '2aadd82f-ed0d-4d67-8583-a09586cc3729';

UPDATE schools SET
  raw_country = '埃及',
  city = 'Giza',
  country_code = 'EG',
  description = '开罗大学艺术学院以其学术项目的丰富性和多样性而著称，涵盖建筑、室内建筑、舞台美术、平面设计、绘画、雕塑和艺术史等专业。学院致力于培养具备艺术才能和科学知识的创意人才，服务本地及全球艺术发展。',
  tuition_usd_per_year = 3000,
  program_count = 7,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1908,
  qs_overall_rank = 347,
  major_tags = '[{"category":"design","tags":["graphic_design","interior_architecture","scenography"]},{"category":"fine_arts","tags":["painting","sculpture","art_history"]},{"category":"architecture","tags":["architecture"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['建筑', '室内建筑', '舞台美术', '平面设计', '绘画', '雕塑', '艺术史']::text[]
WHERE id = '9678a373-3eef-44f6-b848-50431019a4b1';

UPDATE schools SET
  raw_country = '菲律宾',
  city = 'Cebu City',
  country_code = 'PH',
  description = '圣卡洛斯大学美术学院提供电影研究硕士以及广告艺术、电影、时尚设计和绘画学士等多样化课程。学院拥有创意中心、Mac实验室和录音编辑室等先进设施，旨在培养学生的创造力，并为他们在艺术领域的职业发展做好准备。',
  international_students_page = 'https://enrollmentguide.usc.edu.ph/international-student',
  logo_url = 'https://usc.edu.ph/wp-content/themes/universitygo665/images/main-logo.png',
  program_count = 5,
  portfolio_difficulty = 3,
  city_cost_index = 2,
  career_resources_rating = 3,
  founded_year = 1595,
  major_tags = '[{"category":"design","tags":["advertising_arts","fashion_design"]},{"category":"film","tags":["cinema","film_studies"]},{"category":"fine_arts","tags":["painting"]}]'::jsonb,
  feature_tags = ARRAY['私立', '艺术设计', '综合大学院系']::text[],
  strength_disciplines = ARRAY['广告艺术', '电影', '时尚设计', '绘画']::text[]
WHERE id = 'e416cdb9-3848-43a4-8fd7-1cf48baa40d2';

UPDATE schools SET
  raw_country = '古巴',
  city = 'Havana',
  country_code = 'CU',
  description = '古巴艺术大学（ISA）成立于1976年，是古巴领先的艺术高等学府，致力于培养视觉艺术、音乐、戏剧艺术、舞蹈艺术以及视听媒体艺术等领域的艺术家和创作者。学校强调个人实践，提供研究生课程，并拥有经验丰富的师资队伍。其课程涵盖绘画、雕塑、摄影、设计、表演等多个专业方向，是古巴艺术教育的重要基地。',
  application_deadline = 'Varies by program',
  notable_alumni = 'Alexandre Arrechea, Quisqueya Henríquez, Reynier Leyva Novo',
  logo_url = 'https://isa.cult.cu/wp-content/uploads/2020/08/LOGO-ISA-50p.png',
  program_count = 6,
  portfolio_difficulty = 4,
  city_cost_index = 2,
  career_resources_rating = 3,
  founded_year = 1976,
  qs_overall_rank = 18519,
  major_tags = '[{"category":"visual_arts","tags":["painting","sculpture","photography","graphic_design","multimedia"]},{"category":"music","tags":["performance","composition","orchestra_conducting","music_pedagogy"]},{"category":"theatre_arts","tags":["acting","directing","dramaturgy","scenic_design"]},{"category":"dance_arts","tags":["ballet","folkloric_dance","contemporary_dance"]},{"category":"audiovisual_media_arts","tags":["film","radio","television"]},{"category":"cultural_heritage_conservation","tags":["art_conservation","art_restoration"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术大学']::text[],
  strength_disciplines = ARRAY['视觉艺术', '音乐', '戏剧艺术', '舞蹈艺术', '视听媒体艺术']::text[]
WHERE id = '1b352fb1-0855-4bba-bd95-c37084e5ff20';

UPDATE schools SET
  raw_country = '荷兰',
  city = 'Utrecht',
  country_code = 'NL',
  description = '乌得勒支艺术大学（HKU）是欧洲最大的艺术大学之一，提供艺术与媒体高等教育。学校设有九个学院，涵盖纯艺术、设计、音乐与技术、游戏与互动等领域，致力于为创意产业培养人才，推动创新。',
  international_students_page = 'https://www.hku.nl/en/study-at-hku/explore-and-apply/international',
  logo_url = 'https://www.hku.nl/assets/img/favicons/favicon.svg',
  tuition_usd_per_year = 12500,
  portfolio_difficulty = 4,
  city_cost_index = 3,
  career_resources_rating = 4,
  founded_year = 1987,
  major_tags = '[{"category":"art","tags":["fine_art"]},{"category":"design","tags":["design"]},{"category":"music","tags":["music"]},{"category":"theatre","tags":["theatre"]},{"category":"media","tags":["media"]},{"category":"game","tags":["game_design"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['纯艺术', '设计', '音乐', '戏剧', '媒体', '游戏与互动']::text[]
WHERE id = '88926be6-7bbe-4a98-b82c-3ae3f4cc4e0b';

UPDATE schools SET
  raw_country = '香港',
  city = 'Hong Kong',
  country_code = 'HK',
  description = '香港藝術學院（HKAS）成立於2000年，是香港藝術中心的附屬機構。學院提供學位課程，主要集中於陶瓷、繪畫、攝影和雕塑等美術學科，並與RMIT大學合作開設學士學位課程。學院致力於培養藝術人才，並通過短期課程和外展項目將藝術融入社區。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.hkas.edu.hk/programme/notes-to-non-local-students/',
  logo_url = 'https://www.hkas.edu.hk/images/og_img/School Logo/HKAC_HKAS_Lock-up_ENG_2024.jpg',
  tuition_usd_per_year = 12820,
  program_count = 2,
  portfolio_difficulty = 3,
  city_cost_index = 5,
  career_resources_rating = 4,
  founded_year = 2000,
  major_tags = '[{"category":"fine_art","tags":["ceramics","painting","photography","sculpture"]}]'::jsonb,
  feature_tags = ARRAY['艺术设计']::text[],
  strength_disciplines = ARRAY['纯艺术', '陶瓷', '绘画', '摄影', '雕塑']::text[]
WHERE id = '03634ce1-696e-4f42-8d53-b1b9d5fc5180';

UPDATE schools SET
  raw_country = '韩国',
  city = 'Seoul',
  country_code = 'KR',
  description = '弘益大学（Hongik University）是韩国首尔一所知名的综合性大学，以其艺术与设计专业闻名。学校成立于1946年，致力于培养独立思考、富有创造力并能服务人类社会的专业人才。其艺术与设计学院在国际上享有较高声誉，提供多元化的本科和研究生课程。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://oia.hongik.ac.kr/oia-e/content/17',
  notable_alumni = 'Kim Jong-deok, Eom Ha-young, Lee Geon-man, Gray, Loco, Joo Woo-jae, Noh Hong-chul, Kim Ou-joon, Jo Han-seon, Sohn Hye-won, 柳炅秀, 许允真',
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Hongik_University.svg',
  tuition_usd_per_year = 8000,
  portfolio_difficulty = 4,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1946,
  major_tags = '[{"category":"design","tags":["visual_communication","industrial_design","metalwork_jewelry","ceramics_glass","woodworking_furniture","textile_fashion"]},{"category":"architecture","tags":["architecture","interior_architecture"]},{"category":"fine_arts","tags":["painting","sculpture","printmaking","oriental_painting","art_history_theory"]},{"category":"performing_arts","tags":["musical_theatre","contemporary_music"]}]'::jsonb,
  feature_tags = ARRAY['综合大学', '艺术设计', '私立']::text[],
  strength_disciplines = ARRAY['建筑', '室内建筑', '视觉传达设计', '工业设计', '金工与珠宝设计', '陶瓷与玻璃设计', '木工与家具设计', '纺织艺术与时尚设计', '艺术史与理论', '音乐剧', '现代音乐']::text[],
  acceptance_rate = 0.37,
  qs_overall_rank = 500,
  qs_art_design_rank = 100
WHERE id = 'f0937d52-6446-4c4a-ba19-38833bb9adc0';

UPDATE schools SET
  raw_country = '突尼斯',
  city = '突尼斯市',
  country_code = 'TN',
  description = '突尼斯高等美术学院（ISBAT）是突尼斯历史最悠久的艺术学府，成立于1923年，位于首都突尼斯市。学院在推动突尼斯艺术运动和视觉艺术传播方面发挥了重要作用，培养了众多艺术家。学院与多所法国大学合作，管理着突尼斯的艺术与文化博士学院。',
  application_deadline = 'Varies by program',
  notable_alumni = 'Azzedine Alaïa, Ali Bellagha, Jellal Ben Abdallah, Pierre Boucherle, Ammar Farhat, Safia Farhat, Aïcha Filali, Geneviève Gavrel',
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1923,
  feature_tags = ARRAY['公立', '艺术学院']::text[],
  strength_disciplines = ARRAY['纯艺术', '视觉艺术']::text[],
  tuition_usd_per_year = 3153,
  acceptance_rate = 0.3
WHERE id = '54201cc1-7e39-45b1-a741-462b3c8bf63f';

UPDATE schools SET
  raw_country = '韩国',
  city = 'Seoul',
  country_code = 'KR',
  description = '韩国国立艺术大学是位于韩国首尔的一所国立大学。学校成立于1993年，是韩国唯一的国立艺术大学，旨在培养各个艺术领域的专业人才。',
  international_students_page = 'https://www.karts.ac.kr/en/karts/foreign.do',
  logo_url = 'http://www.karts.ac.kr/en/images/k_img.png',
  tuition_usd_per_year = 6000,
  program_count = 27,
  portfolio_difficulty = 4,
  city_cost_index = 4,
  career_resources_rating = 3,
  founded_year = 1993,
  qs_art_design_rank = 21,
  major_tags = '[{"category": "performing_arts", "tags": ["music", "drama", "dance", "korean_traditional_arts"]}, {"category": "visual_arts", "tags": ["visual_arts"]}, {"category": "film_media", "tags": ["film", "tv", "multimedia"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术学院', '艺术设计']::text[],
  strength_disciplines = ARRAY['表演艺术', '音乐', '戏剧', '电影、电视与多媒体', '舞蹈', '视觉艺术', '韩国传统艺术']::text[],
  notable_alumni = 'Kim Go-eun, Lee Sun-kyun, Jung So-min, Lee Je-hoon, Park So-dam',
  acceptance_rate = 0.15,
  qs_overall_rank = 800
WHERE id = '111b0131-97a8-4f61-acc3-c19f0435da75';

UPDATE schools SET
  raw_country = '英国',
  city = 'London',
  country_code = 'GB',
  description = '伦敦时装学院（London College of Fashion, UAL）是世界领先的时尚设计、媒体和商业教育机构，隶属于伦敦艺术大学。学院致力于通过时尚的力量塑造生活，推动经济和社会转型。学院提供广泛的本科和研究生课程，涵盖时尚的各个领域，旨在培养具备专业技能、实践经验和行业洞察力的毕业生。',
  application_deadline = 'Undergraduate: Jan 15; Postgraduate: Dec 2 (Round 1), Mar 18 (Round 2)',
  international_students_page = 'https://www.arts.ac.uk/study-at-ual/international',
  notable_alumni = 'Jimmy Choo, Peggy Gou, Alek Wek, Jonathan Anderson, William Tempest',
  logo_url = 'https://www.arts.ac.uk/__data/assets/image/0004/104924/LCF-logo.png',
  tuition_usd_per_year = 29490,
  acceptance_rate = 0.23,
  program_count = 70,
  portfolio_difficulty = 5,
  city_cost_index = 5,
  career_resources_rating = 5,
  founded_year = 1906,
  qs_art_design_rank = 2,
  major_tags = '[{"category":"fashion","tags":["fashion_design","fashion_media","fashion_business"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '时尚', '伦敦']::text[],
  strength_disciplines = ARRAY['时尚设计', '时尚媒体', '时尚商业']::text[]
WHERE id = '0d2bc70b-2729-40f5-a021-cfadb56bed04';

UPDATE schools SET
  raw_country = '美国',
  city = 'Baton Rouge',
  country_code = 'US',
  description = '路易斯安那州立大学艺术学院是路易斯安那州最大的艺术系，拥有35多名全职教职员工和500名本科生及研究生，提供艺术史、陶瓷、数字艺术、平面设计、绘画、摄影、版画和雕塑等专业。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.lsu.edu/admissions/apply/international.php',
  tuition_usd_per_year = 28631,
  acceptance_rate = 0.73,
  program_count = 7,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1860,
  feature_tags = ARRAY['公立', '综合大学院系', '艺术设计']::text[],
  strength_disciplines = ARRAY['数字艺术', '平面设计', '工作室艺术', '艺术史', '陶瓷', '绘画', '摄影', '版画', '雕塑']::text[]
WHERE id = '0e073461-abbd-4a0c-9161-1c36b9786a63';

UPDATE schools SET
  raw_country = '新加坡',
  city = 'Singapore',
  country_code = 'SG',
  description = '南洋艺术学院（NAFA）成立于1938年，是新加坡历史最悠久、规模最大的艺术学府。学院以严谨高质量的课程、创新实践的教学方法、多元艺术创作和社区推广而闻名。NAFA培养了众多杰出校友，致力于通过艺术激发学习和成长。',
  international_students_page = 'https://www.nafa.edu.sg/admissions',
  notable_alumni = 'Constance Lau, Ceno2, Julie Tan, Mohammad Din Mohammad, Anthony Poon',
  logo_url = 'https://www.nafa.edu.sg/images/default-source/corp-images/nafa-logo.png',
  tuition_usd_per_year = 23000,
  portfolio_difficulty = 4,
  city_cost_index = 5,
  career_resources_rating = 4,
  founded_year = 1938,
  major_tags = '[{"category":"design","tags":["3d_design","fashion_studies","design_media"]},{"category":"fine_art","tags":["fine_art"]},{"category":"performing_arts","tags":["dance","music","theatre"]}]'::jsonb,
  feature_tags = ARRAY['艺术设计', '表演艺术', '新加坡']::text[],
  strength_disciplines = ARRAY['纯艺术', '设计', '表演艺术']::text[],
  acceptance_rate = 0.45,
  qs_overall_rank = 1001,
  qs_art_design_rank = 200
WHERE id = '39be0ff2-08c7-4aab-a51f-521043a46254';

UPDATE schools SET
  raw_country = '马里',
  city = '巴马科',
  country_code = 'ML',
  description = '巴马科国立艺术学院（INA）是马里巴马科的一所国家级艺术学校，成立于1933年，最初名为苏丹工匠之家。学院提供珠宝制作与设计、插画、绘画、雕塑、摄影、音乐和戏剧等课程，培养了众多马里知名艺术家。',
  application_deadline = 'Varies by program',
  notable_alumni = 'Yaya Coulibaly, Habib Dembélé, Ismael Diabate, Amahiguere Dolo, Habib Koité, Abdoulaye Konaté, Malick Sidibé, Salif Traoré',
  portfolio_difficulty = 3,
  city_cost_index = 2,
  founded_year = 1933,
  feature_tags = ARRAY['公立', '艺术学院']::text[],
  strength_disciplines = ARRAY['绘画', '音乐', '戏剧', '雕塑', '摄影']::text[],
  tuition_usd_per_year = 500,
  acceptance_rate = 0.5
WHERE id = 'c570ec4f-b224-46f7-aa8e-ad6a5afdb004';

UPDATE schools SET
  raw_country = '哥伦比亚',
  city = 'Bogotá',
  country_code = 'CO',
  description = '哥伦比亚国立大学艺术学院是哥伦比亚国立大学下属的艺术学院，位于首都波哥大。学院提供平面设计等本科专业，以及动画、产品设计、摄影、设计教育、器乐演奏与教学、戏剧与表演艺术、交响乐指挥、建筑、城市规划、设计、音乐治疗、艺术教育、博物馆学与遗产管理、创意写作、艺术史与理论、文化遗产保护、造型艺术与视觉艺术、人居环境等多个研究生专业及艺术与建筑博士项目。',
  international_students_page = 'https://unal.edu.co/internacionalizacion',
  logo_url = 'https://unal.edu.co/typo3conf/ext/unal_skin_default/Resources/Public/images/escudoUnal.svg',
  program_count = 27,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1867,
  qs_overall_rank = 259,
  major_tags = '[{"category":"design","tags":["graphic_design","animation","product_design","photography","design_education","urban_design"]},{"category":"music","tags":["instrumental_performance","symphonic_conducting","music_therapy"]},{"category":"performing_arts","tags":["theater","performing_arts"]},{"category":"architecture","tags":["housing_architecture","urbanism","architecture","construction","habitat"]},{"category":"art_history","tags":["art_history_and_theory","cultural_heritage_conservation","museology_and_heritage_management"]},{"category":"fine_arts","tags":["plastic_and_visual_arts"]},{"category":"creative_writing","tags":["creative_writing"]},{"category":"art_education","tags":["art_education"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学下属学院']::text[],
  strength_disciplines = ARRAY['平面设计', '动画', '产品设计', '摄影', '器乐演奏', '戏剧与表演艺术', '建筑', '城市规划', '艺术史与理论', '文化遗产保护', '造型艺术与视觉艺术']::text[],
  tuition_usd_per_year = 2000,
  acceptance_rate = 0.1
WHERE id = '12b507ff-b6ac-4b9a-837a-0bb887484162';

UPDATE schools SET
  raw_country = '哥斯达黎加',
  city = 'Heredia',
  country_code = 'CR',
  description = '哥斯达黎加国立大学艺术学院（CIDEA）是哥斯达黎加国立大学（UNA）的艺术研究、教学和推广中心。学院提供视觉艺术、表演艺术、舞蹈和音乐等多个领域的本科和研究生课程，致力于培养具有创造性和批判性思维的艺术专业人才，推动哥斯达黎加的艺术发展。',
  application_deadline = '第一学期：10月最后一周至11月最后一周；第二学期：5月最后一周',
  international_students_page = 'https://www.aice.una.ac.cr/index.php/caja-de-herramientas?view=article&id=49',
  logo_url = 'https://www.cidea.una.ac.cr/images/Logos/logo-una-aice.jpg',
  tuition_usd_per_year = 1000,
  program_count = 8,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 2,
  founded_year = 1973,
  major_tags = '[{"category":"performing_arts","tags":["drama","dance","music"]},{"category":"visual_arts","tags":["visual_communication","art_education"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['表演艺术', '视觉传达', '舞蹈', '音乐']::text[]
WHERE id = '50b60ba0-c7b9-4977-8ae9-1258dda62b5d';

UPDATE schools SET
  raw_country = '南非',
  city = 'Port Elizabeth',
  country_code = 'ZA',
  description = '纳尔逊·曼德拉大学是南非一所综合性公立大学，由多所院校合并而成。其视觉艺术系历史悠久，可追溯至1882年成立的伊丽莎白港艺术学校，提供从学士到硕士的全面视觉艺术课程。',
  international_students_page = 'https://international.mandela.ac.za/',
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 2005,
  major_tags = '[{"category":"design","tags":["fashion_design","textile_design","graphic_design","photography"]},{"category":"fine_arts","tags":["ceramics","painting","printmaking","sculpture"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学', '艺术设计']::text[],
  strength_disciplines = ARRAY['时尚与纺织设计', '平面设计', '摄影', '陶瓷', '绘画', '版画', '雕塑']::text[]
WHERE id = '138c1907-243e-4253-9c59-ca8c0c42c1cf';

UPDATE schools SET
  raw_country = '加拿大',
  city = 'Toronto',
  country_code = 'CA',
  description = 'OCAD University是加拿大历史最悠久、规模最大的艺术与设计大学，位于多伦多市中心。学校提供17个本科和7个研究生项目，涵盖艺术、设计、数字媒体等多个领域。以其创新的教育理念和对艺术设计行业的贡献而闻名。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.ocadu.ca/student-services/international-students',
  notable_alumni = 'Shary Boyle, Floria Sigismondi, Michael Snow, Gary Taxali, Madelaine Fischer-Bernhut, Delali Cofie, Sharene Shafie, Samuel Kwan, Michael Martchenko, Michael Belmore',
  logo_url = 'https://www.ocadu.ca/themes/custom/ocad/img/logo-white.png',
  tuition_usd_per_year = 27500,
  acceptance_rate = 0.65,
  program_count = 24,
  portfolio_difficulty = 4,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1876,
  qs_art_design_rank = 69,
  major_tags = '[{"category":"design","tags":["工业设计","数字媒体","环境设计","平面设计"]},{"category":"art","tags":["摄影","插画","雕塑","纯艺术"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['工业设计', '数字未来', '摄影', '战略远见与创新', '插画', '雕塑/装置', '环境设计']::text[],
  qs_overall_rank = 1001
WHERE id = 'd456313e-7ac9-4c02-8404-2a19b58e178d';

UPDATE schools SET
  raw_country = '智利',
  city = 'Santiago',
  country_code = 'CL',
  description = '智利天主教大学艺术学院是智利领先的艺术教育机构，提供音乐、艺术和戏剧领域的学术机会，致力于艺术创作、研究和文化推广。',
  international_students_page = 'https://admision.uc.cl/informacion-para/international-students/',
  notable_alumni = 'Egon Wolff, Roberto Matta, Jorge Díaz, Diamela Eltit, Paula Escobar',
  logo_url = 'https://www.uc.cl/site/templates/dist/images/logo-uc-chile-blanco.svg',
  tuition_usd_per_year = 2400,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  founded_year = 1888,
  qs_architecture_built_environment_rank = 34,
  qs_overall_rank = 116,
  qs_art_humanities_rank = 26,
  feature_tags = ARRAY['综合大学下属学院']::text[],
  strength_disciplines = ARRAY['音乐', '艺术', '戏剧']::text[]
WHERE id = '05278c55-d9af-4cbd-89d3-e5c2b47c7384';

UPDATE schools SET
  raw_country = '美国',
  city = 'Brooklyn',
  country_code = 'US',
  description = '普瑞特艺术学院是一所位于美国纽约布鲁克林的顶尖艺术设计学院，以其卓越的艺术、设计、建筑和信息科学课程而闻名。学院致力于培养创新型领导者，通过严谨的学术训练和实践项目，帮助学生在全球创意产业中取得成功。',
  application_deadline = 'Jan 5',
  international_students_page = 'https://www.pratt.edu/administrative-departments/office-of-the-provost/office-of-international-affairs/',
  notable_alumni = '约瑟夫·巴贝拉,罗伯特·雷德福,特伦斯·霍华德,罗布·赞比,马丁·兰道,哈维·费尔斯坦,贝齐·约翰逊,丽兹·克莱伯恩',
  logo_url = 'https://www.pratt.edu/wp-content/themes/pratt/assets/images/pratt-logo.svg',
  tuition_usd_per_year = 59588,
  acceptance_rate = 0.73,
  program_count = 60,
  portfolio_difficulty = 5,
  city_cost_index = 5,
  career_resources_rating = 4,
  founded_year = 1887,
  qs_art_design_rank = 5,
  qs_history_of_art_rank = 10,
  major_tags = '[{"category":"design","tags":["graphic_design","industrial_design","interior_design","fashion_design"]},{"category":"art","tags":["fine_arts","photography","animation"]},{"category":"architecture","tags":["architecture","landscape_architecture"]}]'::jsonb,
  feature_tags = ARRAY['艺术设计', '私立', '作品集导向']::text[],
  strength_disciplines = ARRAY['建筑', '工业设计', '室内设计', '平面设计', '时尚设计', '纯艺术', '摄影', '动画']::text[]
WHERE id = 'f04d1cd8-0af8-4e39-afe5-69cc7f0682ab';

UPDATE schools SET
  raw_country = '美国',
  city = 'West Lafayette',
  country_code = 'US',
  description = '普渡大学帕蒂和拉斯蒂·鲁夫设计、艺术与表演学院提供艺术/设计教育、电影与视频、工业设计、室内设计、音乐、戏剧等本科和研究生课程。学院以其国际知名的师资力量和世界一流的研究型大学资源，为学生提供卓越的艺术教育，培养创新人才。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://admissions.purdue.edu/become-student/international/',
  tuition_usd_per_year = 31000,
  acceptance_rate = 0.5,
  program_count = 10,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1966,
  qs_art_design_rank = 159,
  qs_overall_rank = 88,
  major_tags = '[{"category":"design","tags":["industrial_design","interior_design","visual_communication_design"]},{"category":"art","tags":["art_education","film_video","integrated_studio_arts","studio_arts_technology"]},{"category":"performing_arts","tags":["music","sound_for_performing_arts","theatre"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学下属学院', '艺术设计']::text[],
  strength_disciplines = ARRAY['艺术与设计教育', '电影与视频', '工业设计', '综合工作室艺术', '室内设计', '音乐', '表演艺术音效', '工作室艺术与技术', '戏剧', '视觉传达设计']::text[]
WHERE id = '9d253e86-aa43-4e29-9bcc-4c482db648f9';

UPDATE schools SET
  raw_country = '英国',
  city = 'Musselburgh',
  country_code = 'GB',
  description = '玛格丽特皇后大学（Queen Margaret University）成立于1875年，是一所位于苏格兰爱丁堡附近的公立大学。学校以其以人为本的教学方法和对社会公正的承诺而闻名，在医疗保健、社会科学、创意艺术、商业管理等领域提供独特的课程。',
  international_students_page = 'https://www.qmu.ac.uk/study-here/international-students',
  notable_alumni = 'Susan Boyle, Kevin McKidd, Ashley Jensen, Angel Coulby, Edith Bowman, Simon Neil, Matt Baker',
  logo_url = 'https://www.qmu.ac.uk/news-and-events/brand-guidelines/logo',
  tuition_usd_per_year = 13032,
  acceptance_rate = 0.73,
  portfolio_difficulty = 3,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1875,
  major_tags = '[{"category":"creative_arts","tags":["表演艺术","媒体与传播"]},{"category":"health","tags":["医疗保健"]},{"category":"social_sciences","tags":["社会科学"]},{"category":"business","tags":["商业管理"]},{"category":"education","tags":["教育"]}]'::jsonb,
  feature_tags = ARRAY['公立']::text[],
  strength_disciplines = ARRAY['医疗保健', '社会科学', '创意艺术', '商业管理', '教育']::text[]
WHERE id = '20b81b8a-98fc-4853-9f34-277384540f42';

UPDATE schools SET
  raw_country = '美国',
  city = 'Providence',
  country_code = 'US',
  description = '罗德岛设计学院（RISD）成立于1877年，是美国顶尖的艺术与设计学院之一。学院以其严谨的、以工作室为基础的教学模式和文科教育而闻名。RISD致力于培养批判性思维和实践能力兼备的艺术家和设计师，鼓励学生通过实验和创新来推动艺术与设计领域的发展。',
  application_deadline = 'Early decision: Nov 3, Regular decision: Jan 20',
  international_students_page = 'https://www.risd.edu/admissions/first-year/international-applicants',
  notable_alumni = 'Seth MacFarlane, James Franco, David Byrne, Gus Van Sant, Dale Chihuly, Brian Chesky',
  logo_url = 'https://www.risd.edu/sites/default/files/2023-09/risd-logo-white.svg',
  tuition_usd_per_year = 66460,
  acceptance_rate = 0.14,
  program_count = 21,
  portfolio_difficulty = 5,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1877,
  qs_art_design_rank = 4,
  major_tags = '[{"category":"design","tags":["平面设计","工业设计","服装设计","室内建筑","景观建筑","家具设计","陶瓷","玻璃","珠宝设计","纺织品设计"]},{"category":"fine_arts","tags":["绘画","雕塑","摄影","版画","电影/动画/视频","纯艺术"]}]'::jsonb,
  feature_tags = ARRAY['艺术设计', '私立', '顶尖艺术院校']::text[],
  strength_disciplines = ARRAY['平面设计', '工业设计', '服装设计', '纯艺术', '建筑']::text[]
WHERE id = '871a1998-1c0e-40ea-b55a-14bbefd408a7';

UPDATE schools SET
  raw_country = '南非',
  city = 'Makhanda',
  country_code = 'ZA',
  description = '罗德大学美术系是人文学院的一部分，提供全面的美术实践、理论和视觉艺术史教学。该系致力于通过接触丰富而富有挑战性的教学和学习，培养学生的创造性和智力潜力。它位于南非东开普省的马卡恩达市。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.ru.ac.za/fineart/applying/',
  logo_url = 'https://www.ru.ac.za/media/rhodesuniversity/styleassets/2019v6/upload/footer-logo.png',
  portfolio_difficulty = 3,
  city_cost_index = 2,
  career_resources_rating = 2,
  founded_year = 1904,
  major_tags = '[{"category":"fine_art","tags":["painting","sculpture","printmaking","photography","curatorial_practice","art_history","visual_culture"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['纯艺术', '艺术史与视觉文化', '策展实践']::text[]
WHERE id = '6d91d0e1-4fd7-406b-835b-71e35208c075';

UPDATE schools SET
  raw_country = '澳大利亚',
  city = 'Melbourne',
  country_code = 'AU',
  description = 'RMIT大学，即皇家墨尔本理工大学，是澳大利亚一所全球领先的科技、设计与企业型大学。学校以其行业紧密结合的课程和实践性学习而闻名，提供从职业教育到研究生学位的广泛课程。RMIT致力于培养具备全球视野和创新精神的毕业生，在艺术、设计、建筑和工程等领域享有盛誉。',
  international_students_page = 'https://www.rmit.edu.au/study-with-us/international-students',
  notable_alumni = 'James Wan, Leigh Whannell, Gillian Chung, Judith Durham, Wu Chun, Elaine Yiu, Charlie Vickers',
  logo_url = 'https://www.rmit.edu.au/-/media/rmit/images/logo/rmit-logo-red.svg',
  tuition_usd_per_year = 27600,
  acceptance_rate = 0.22,
  program_count = 5,
  portfolio_difficulty = 4,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1887,
  qs_art_design_rank = 19,
  qs_architecture_built_environment_rank = 15,
  qs_overall_rank = 125,
  major_tags = '[{"category":"design","tags":["fashion","graphic_design","industrial_design","interior_design"]},{"category":"art","tags":["fine_art","photography","media_art"]},{"category":"architecture","tags":["architecture","landscape_architecture","urban_design"]}]'::jsonb,
  feature_tags = ARRAY['公立', '科技', '设计', '企业']::text[],
  strength_disciplines = ARRAY['建筑', '艺术设计', '信息技术']::text[]
WHERE id = '529317c2-806f-44c3-a541-75b78317aa66';

UPDATE schools SET
  raw_country = '美国',
  city = 'New Brunswick',
  country_code = 'US',
  description = '梅森·格罗斯艺术学院是罗格斯大学的艺术学院，成立于1976年。学院提供舞蹈、设计、电影制作、音乐、戏剧和视觉艺术等本科和研究生学位课程。学院致力于培养富有创造力、批判性思维和创新精神的艺术家和学者，鼓励学生通过艺术回馈社会，并在全球艺术领域发挥领导作用。',
  international_students_page = 'https://www.masongross.rutgers.edu/admissions/international-applicants/',
  tuition_usd_per_year = 32436,
  acceptance_rate = 0.58,
  portfolio_difficulty = 4,
  city_cost_index = 3,
  career_resources_rating = 4,
  founded_year = 1976,
  qs_overall_rank = 328,
  feature_tags = ARRAY['公立', '艺术学院']::text[],
  strength_disciplines = ARRAY['舞蹈', '电影制作', '音乐', '戏剧', '视觉艺术', '设计']::text[]
WHERE id = 'c5e595c9-ba54-4dc8-b6fd-f23bfc5585a1';

UPDATE schools SET
  raw_country = '美国',
  city = 'Savannah',
  country_code = 'US',
  description = '萨凡纳艺术与设计学院（SCAD）是美国一所私立艺术学院，提供100多个艺术与设计领域的学位课程。学校在萨凡纳、亚特兰大和法国拉科斯特设有校区，并提供在线学习。SCAD以其卓越的教学质量和高就业率而闻名，致力于培养学生的创造性职业发展。',
  application_deadline = 'Rolling',
  international_students_page = 'https://www.scad.edu/admission/admission-information/international',
  notable_alumni = 'India.Arie, Peg Parnevik, Kayli Carter, Bob Bland',
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Savannah_College_of_Art_and_Design_logo.svg/1200px-Savannah_College_of_Art_and_Design_logo.svg.png',
  tuition_usd_per_year = 42665,
  acceptance_rate = 0.83,
  program_count = 100,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 5,
  founded_year = 1978,
  qs_art_design_rank = 15,
  feature_tags = ARRAY['私立', '艺术设计', '多校区', '高就业率']::text[],
  strength_disciplines = ARRAY['工业设计', '时尚设计', '用户体验设计', '纤维艺术', '配饰设计', '家具设计', '动画', '电影', '视觉特效']::text[]
WHERE id = '0a580837-088e-46e4-a424-9642186faac0';

UPDATE schools SET
  raw_country = '中国',
  city = 'Shanghai',
  country_code = 'CN',
  description = '上海戏剧学院（Shanghai Theatre Academy，简称“上戏”）是一所创建于1945年的综合性表演艺术大学，专注于戏剧训练与研究。作为中国顶尖的艺术高等学府之一，上戏在戏剧、影视、舞蹈和舞台设计等领域提供本科和研究生课程。',
  application_deadline = 'Jan 15',
  international_students_page = 'https://english.shanghai.gov.cn/en-ShorttermCourses/20241225/c01afc1a9ea842a5867d170a94ddc9d4.html',
  notable_alumni = '胡歌, 迪丽热巴, 李冰冰, 蔡国强, 陈震, 邓伦, 李沁, 佟大为, 冯绍峰, 郑恺, 苗苗, 江疏影, 陈赫, 杜江',
  tuition_usd_per_year = 2466,
  program_count = 14,
  portfolio_difficulty = 4,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1945,
  feature_tags = ARRAY['公立', '表演艺术']::text[],
  strength_disciplines = ARRAY['表演', '导演', '戏剧文学', '舞台设计', '电影电视', '戏曲', '舞蹈']::text[],
  acceptance_rate = 0.02
WHERE id = '1a20ba69-9924-46f3-8e03-fc0ffa4ecb01';

UPDATE schools SET
  raw_country = '美国',
  city = 'Stony Brook',
  country_code = 'US',
  description = '石溪大学艺术系是石溪大学文理学院的一部分，提供本科和研究生艺术课程。该系致力于培养学生的艺术创作能力和批判性思维，拥有专业的师资团队和完善的艺术设施，为学生提供丰富的学习资源和实践机会。',
  logo_url = 'https://www.topuniversities.com/sites/default/files/profiles/logos/stony-brook-university-state-university-of-new-york_592560cf2aeae70239af4ccb_large.jpg',
  tuition_usd_per_year = 32741,
  acceptance_rate = 0.48,
  portfolio_difficulty = 2,
  city_cost_index = 3,
  career_resources_rating = 3,
  qs_overall_rank = 452,
  qs_art_humanities_rank = 85,
  feature_tags = ARRAY['公立', '综合大学院系']::text[]
WHERE id = '90edad7b-b1ce-4f66-a3dd-4ddf1c1e36fb';

UPDATE schools SET
  raw_country = '美国',
  city = 'Berkeley',
  country_code = 'US',
  description = '加州大学伯克利分校艺术实践系提供严谨的实践、概念和批判性工作室艺术培训，隶属于世界知名的公立研究型大学。学生在全球背景下发展跨媒体艺术实践的理解，并为当代艺术领域的广泛职业生涯积累宝贵经验。',
  application_deadline = 'mid-December each year for MFA',
  tuition_usd_per_year = 47265,
  acceptance_rate = 0.11,
  program_count = 2,
  portfolio_difficulty = 4,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1868,
  qs_overall_rank = 17,
  qs_art_humanities_rank = 1,
  feature_tags = ARRAY['公立', '综合大学院系', '艺术实践']::text[],
  strength_disciplines = ARRAY['纯艺术', '工作室艺术', '艺术理论']::text[],
  notable_alumni = 'Shirin Neshat, Theresa Hak Kyung Cha, Enrique Chagoya, Jay DeFeo, Miné Okubo'
WHERE id = '4372406c-11cf-4267-9599-8bc29f88ac89';

UPDATE schools SET
  raw_country = '美国',
  city = 'Santa Barbara',
  country_code = 'US',
  description = '加州大学圣塔芭芭拉分校艺术系提供一个充满活力、开放的学习环境，致力于个人与合作艺术的创作。该系鼓励跨学科的艺术实践，涵盖电子与数字艺术、绘画、雕塑、表演及理论批评等领域。',
  application_deadline = 'Jan 5',
  international_students_page = 'https://oiss.ucsb.edu/',
  notable_alumni = 'Richard Serra',
  logo_url = 'https://www.topuniversities.com/sites/default/files/profiles/logos/university-of-california-santa-barbara-ucsb_91_large.jpg',
  tuition_usd_per_year = 49885,
  acceptance_rate = 0.29,
  program_count = 2,
  portfolio_difficulty = 4,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1891,
  qs_art_design_rank = 137,
  qs_overall_rank = 179,
  qs_art_humanities_rank = 76,
  major_tags = '[{"category": "art", "tags": ["fine_arts", "digital_art", "painting", "sculpture"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学', '跨学科', '理论与实践结合']::text[]
WHERE id = 'f9b01656-1751-49ba-926d-a3712dd498dd';

UPDATE schools SET
  raw_country = '美国',
  city = 'Los Angeles',
  country_code = 'US',
  description = '加州大学洛杉矶分校艺术与建筑学院（UCLA Arts）是世界顶尖的艺术与设计学院之一，隶属于加州大学洛杉矶分校。学院提供艺术、建筑、设计、媒体艺术以及世界艺术与文化等多个领域的本科和研究生课程，致力于培养具有批判性思维和创新能力的艺术家、设计师和学者。',
  international_students_page = 'https://admission.ucla.edu/apply/international-applicants',
  logo_url = 'https://di79x7a4whson.cloudfront.net/assets/img/ucla-arts-share-img.jpg',
  tuition_usd_per_year = 46121,
  acceptance_rate = 0.09,
  program_count = 15,
  portfolio_difficulty = 5,
  city_cost_index = 4,
  career_resources_rating = 5,
  founded_year = 1919,
  qs_overall_rank = 31,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学']::text[],
  notable_alumni = 'James Franco, Catherine Hardwicke, Frank Gehry, John Baldessari'
WHERE id = 'cf278f55-d919-4946-a4d1-16ea53c16dd4';

UPDATE schools SET
  raw_country = '美国',
  city = 'Buffalo',
  country_code = 'US',
  description = '纽约州立大学布法罗分校艺术系致力于培养学生在工作室艺术、后工作室艺术、平面设计、美学、批判理论和艺术史方面的创造性和学术技能。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.buffalo.edu/admissions/international.html',
  logo_url = 'https://commons.wikimedia.org/wiki/File:University_at_Buffalo_logo.png',
  tuition_usd_per_year = 31536,
  acceptance_rate = 0.74,
  program_count = 4,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1846,
  qs_overall_rank = 410,
  major_tags = '[{"category":"design","tags":["graphic_design"]},{"category":"fine_arts","tags":["painting","sculpture","photography","drawing","printmaking","bio_art","performance_art"]},{"category":"art_history","tags":["art_history","critical_theory","aesthetics"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学院系', '艺术设计']::text[],
  strength_disciplines = ARRAY['工作室艺术', '平面设计', '艺术史', '摄影', '雕塑', '新兴实践']::text[]
WHERE id = '8e51816d-3259-4308-83be-669cb65e2f62';

UPDATE schools SET
  raw_country = '加拿大',
  city = 'Edmonton',
  country_code = 'CA',
  description = '阿尔伯塔大学艺术学院是加拿大顶尖综合性大学阿尔伯塔大学的重要组成部分，提供涵盖美术、人文和社会科学等广泛领域的优质课程。学院拥有15个系，60多个专业方向，致力于培养具有全球视野的创新型人才。学院拥有超过59,000名校友，在加拿大乃至全球享有盛誉。',
  international_students_page = 'https://www.ualberta.ca/en/admissions/international-undergraduate-admission.html',
  notable_alumni = 'Paul Gross, Lorna Crozier',
  tuition_usd_per_year = 28000,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 4,
  founded_year = 1908,
  qs_overall_rank = 94,
  qs_art_humanities_rank = 168,
  major_tags = '[{"category":"fine_arts","tags":["art_and_design","drama","music"]},{"category":"humanities","tags":["east_asian_studies","english_and_film_studies","history_classics_and_religion","media_and_technology_studies","modern_languages_and_cultural_studies","philosophy"]},{"category":"social_sciences","tags":["anthropology","economics","linguistics","political_science","psychology","sociology","women_s_and_gender_studies"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学下属学院', '艺术人文社科']::text[],
  strength_disciplines = ARRAY['纯艺术', '人文科学', '社会科学']::text[]
WHERE id = 'a4a43542-50b1-479d-a500-47b2242de36c';

UPDATE schools SET
  raw_country = '阿尔及利亚',
  city = 'Algiers',
  country_code = 'DZ',
  description = '阿尔及尔高等美术学院（ESBA）是阿尔及利亚一所历史悠久的美术学院，成立于1843年，致力于艺术教育。学院提供绘画、雕塑、设计等多个艺术专业，培养学生的艺术实践和创新能力。',
  application_deadline = '2025年7月20日至8月20日（预注册）',
  logo_url = 'https://esba.dz/wp-content/uploads/2026/02/header.jpg',
  program_count = 4,
  portfolio_difficulty = 4,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1843,
  major_tags = '[{"category":"arts_plastiques","tags":["expression_picturale","volume_matiere"]},{"category":"design","tags":["image_media","espace"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术学院', '作品集导向']::text[],
  strength_disciplines = ARRAY['绘画', '雕塑', '平面设计', '空间设计']::text[]
WHERE id = '375b7757-df4a-4421-a31e-f5f7c66a401a';

UPDATE schools SET
  raw_country = '西班牙',
  city = 'Barcelona',
  country_code = 'ES',
  description = '巴塞罗那大学美术学院是西班牙顶尖的艺术学府，隶属于历史悠久的巴塞罗那大学。学院提供艺术、设计、文化遗产保护等领域的学士、硕士和博士课程，致力于培养学生的艺术实践、创作和研究能力。',
  international_students_page = 'https://www.ub.edu/portal/web/finearts/external-relations',
  tuition_usd_per_year = 5800,
  program_count = 10,
  portfolio_difficulty = 3,
  city_cost_index = 4,
  career_resources_rating = 3,
  founded_year = 1450,
  qs_overall_rank = 160,
  qs_art_humanities_rank = 87,
  major_tags = '[{"category":"fine_arts","tags":["painting","sculpture","drawing"]},{"category":"design","tags":["graphic_design","audiovisual_design"]},{"category":"art_history","tags":["art_history","cultural_heritage"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学院系']::text[],
  strength_disciplines = ARRAY['纯艺术', '艺术史', '设计', '文化遗产保护']::text[]
WHERE id = '3be6eeaf-df31-4729-bdcc-9b763d003bc4';

UPDATE schools SET
  raw_country = '美国',
  city = 'Riverside',
  country_code = 'US',
  description = '加州大学河滨分校艺术系提供广泛的传统与当代艺术实践课程，鼓励学生在教师指导下探索和发展个人才能。该系强调艺术作为一种动态的文化话语，影响着我们对现实的体验和对重要事物的认知。作为一所大学院系，它致力于提供高水平的艺术教育，培养学生的批判性思维和视觉素养。',
  international_students_page = 'https://admissions.ucr.edu/international',
  logo_url = 'https://brand.ucr.edu/sites/default/files/2020-09/ucr-logo-horizontal-blue.png',
  tuition_usd_per_year = 57789,
  acceptance_rate = 0.66,
  program_count = 3,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1954,
  qs_overall_rank = 440,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['纯艺术', '视觉传达']::text[]
WHERE id = '58390c24-2bf3-4167-afca-678e71d01412';

UPDATE schools SET
  raw_country = '美国',
  city = 'Storrs',
  country_code = 'US',
  description = '康涅狄格大学艺术与艺术史系是一个充满活力的艺术与学术社区，提供丰富的资源、课程和体验。该系提供艺术学士、艺术史学士和艺术硕士（MFA）学位，涵盖平面设计、插画/动画、工业设计、摄影/视频、版画、绘画/素描、雕塑/陶瓷等多个专业方向。作为一所研究型大学的艺术系，它致力于培养学生的创造性思维和实践能力，为他们在艺术及相关领域的职业生涯做好准备。',
  application_deadline = 'Jan 15 (Fall), Oct 1 (Spring)',
  international_students_page = 'https://admissions.uconn.edu/apply/international/',
  notable_alumni = 'Jennifer Dierdorf, Jared Holt, Kathryn Myers, Kaleigh Rusgrove Berry, Elizabeth Ellenwood',
  logo_url = 'https://brand.uconn.edu/wp-content/uploads/2019/02/uconn-wordmark-stacked-white.svg',
  tuition_usd_per_year = 39678,
  acceptance_rate = 0.52,
  program_count = 4,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1881,
  qs_overall_rank = 534,
  major_tags = '[{"category":"design","tags":["graphic_design","industrial_design"]},{"category":"fine_arts","tags":["illustration","animation","photography","video","printmaking","painting","drawing","sculpture","ceramics"]},{"category":"art_history","tags":["art_history"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学', '艺术设计']::text[],
  strength_disciplines = ARRAY['平面设计', '插画', '动画', '工业设计', '摄影', '版画', '绘画', '雕塑', '陶瓷', '艺术史']::text[]
WHERE id = '0cc53fce-d5a3-431b-8c15-49f7f4ab6238';

UPDATE schools SET
  raw_country = '坦桑尼亚',
  city = 'Dar es Salaam',
  country_code = 'TZ',
  description = '达累斯萨拉姆大学人文学院是坦桑尼亚历史最悠久、规模最大的公立大学达累斯萨拉姆大学的一部分。学院位于达累斯萨拉姆市西部，提供人文学科领域的学士学位课程。',
  international_students_page = 'https://admission.udsm.ac.tz/index.php?r=site%2Flogin#',
  logo_url = 'https://www.udsm.ac.tz/sites/default/files/udsm%20logo.png',
  city_cost_index = 2,
  founded_year = 1961,
  qs_overall_rank = 701,
  qs_art_humanities_rank = 601,
  feature_tags = ARRAY['公立', '综合大学']::text[],
  strength_disciplines = ARRAY['历史', '文学', '政治学']::text[]
WHERE id = '00be11d8-0759-45fe-98ab-1c7f6c5179ec';

UPDATE schools SET
  raw_country = '美国',
  city = 'Gainesville',
  country_code = 'US',
  description = '佛罗里达大学艺术与艺术史学院致力于培养学生批判性思维，通过学术研究和创新实践，赋予学生知识、技能和洞察力，以积极应对不断变化的世界。',
  application_deadline = 'Early Action: Nov 1, Regular Decision: Jan 15',
  international_students_page = 'https://admissions.ufl.edu/international-admissions-guide',
  logo_url = 'https://www.ufl.edu/wp-content/themes/uf-theme/assets/img/uf-logo-white.svg',
  tuition_usd_per_year = 28658,
  acceptance_rate = 0.24,
  program_count = 10,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1975,
  qs_overall_rank = 212,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['艺术', '艺术史', '平面设计', '数字艺术与科学']::text[]
WHERE id = 'cc06f85e-6a0f-4e49-bcfe-6cfc91da3450';

UPDATE schools SET
  raw_country = '加纳',
  city = 'Accra',
  country_code = 'GH',
  description = '加纳大学表演艺术学院是加纳首屈一指的表演艺术培训机构，提供戏剧、舞蹈和音乐领域的本科和研究生课程。学院注重理论与实践相结合，培养学生在表演艺术领域的创造力、协作能力和专业技能，为全球艺术界输送人才。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://spa.ug.edu.gh/admission',
  notable_alumni = 'Nana Akufo-Addo, John Mahama, John Evans Atta Mills, Black Sherif, Dag Heward-Mills, Anas Aremeyaw Anas',
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1948,
  major_tags = '[{"category":"performing_arts","tags":["theatre","dance","music"]}]'::jsonb,
  feature_tags = ARRAY['公立', '表演艺术']::text[],
  strength_disciplines = ARRAY['戏剧', '舞蹈', '音乐']::text[]
WHERE id = '2235b362-46c4-4276-ad59-2ae052c23f63';

UPDATE schools SET
  raw_country = '墨西哥',
  city = 'Guadalajara',
  country_code = 'MX',
  description = '瓜达拉哈拉大学艺术、建筑与设计中心（CUAAD）是瓜达拉哈拉大学的组成部分，拥有三个校区。它提供艺术、建筑和设计领域的30个学士、硕士和博士项目，涵盖戏剧艺术、视觉艺术、音乐、建筑和城市规划等多个专业方向。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://ci.cgai.udg.mx/index.php/en/estudiantes/externos',
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Escudo_de_la_Universidad_de_Guadalajara.svg/1200px-Escudo_de_la_Universidad_de_Guadalajara.svg.png',
  tuition_usd_per_year = 2750,
  acceptance_rate = 0.28,
  program_count = 30,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1791,
  qs_overall_rank = 1001,
  major_tags = '[{"category":"art","tags":["theater_arts","visual_arts","sound_and_image","music"]},{"category":"design","tags":["design_projects","communications_projects"]},{"category":"architecture","tags":["architectural_projects","urban_planning_projects"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['戏剧艺术', '视觉艺术', '声音与图像', '音乐', '建筑项目', '传播项目', '设计项目', '城市规划项目']::text[]
WHERE id = '7ea0c6bc-c8ef-40b3-83c9-c53074f117a5';

UPDATE schools SET
  raw_country = '墨西哥',
  city = 'Guanajuato',
  country_code = 'MX',
  description = '瓜纳华托大学是墨西哥一所历史悠久的公立研究型大学，其艺术与设计系在当地享有盛誉。学校位于风景如画的瓜纳华托市，提供包括视觉艺术、平面设计和建筑在内的多样化课程，强调文化传承与创新设计的结合。',
  application_deadline = 'Apr 15',
  international_students_page = 'https://www3.ugto.mx/en/162-admision-licenciaturas',
  tuition_usd_per_year = 2600,
  portfolio_difficulty = 3,
  city_cost_index = 2,
  career_resources_rating = 3,
  founded_year = 1732,
  qs_overall_rank = 801,
  major_tags = '[{"category":"design","tags":["graphic_design"]},{"category":"fine_arts","tags":["visual_arts"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学', '文化遗产']::text[],
  strength_disciplines = ARRAY['平面设计', '视觉艺术', '建筑']::text[]
WHERE id = 'e6142dc1-9c80-4089-b563-4b1d48ce1f2b';

UPDATE schools SET
  raw_country = '美国',
  city = 'Chicago',
  country_code = 'US',
  description = '伊利诺伊大学芝加哥分校建筑、设计与艺术学院（CADA）是伊利诺伊大学芝加哥分校下属学院，汇集了视觉和表演艺术家、设计师、建筑师、历史学家和博物馆专业人士。学院提供建筑、艺术与艺术史、设计以及戏剧与音乐等领域的多元化课程，致力于培养下一代创意人才。',
  application_deadline = 'Regular Decision deadline: February 2, 2026 (for Fall 2026 admission)',
  notable_alumni = 'Tiffany Funk, Matthew van der Ploeg',
  tuition_usd_per_year = 39242,
  acceptance_rate = 0.79,
  program_count = 20,
  portfolio_difficulty = 3,
  city_cost_index = 4,
  career_resources_rating = 3,
  founded_year = 1946,
  qs_art_design_rank = 201,
  qs_architecture_built_environment_rank = 101,
  qs_overall_rank = 334,
  qs_art_humanities_rank = 189,
  major_tags = '[{"category":"architecture","tags":["architecture"]},{"category":"art_history","tags":["art_history"]},{"category":"design","tags":["graphic_design","industrial_design"]},{"category":"performing_arts","tags":["theatre","music"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学下属学院']::text[],
  strength_disciplines = ARRAY['建筑', '平面设计', '工业设计', '艺术史']::text[]
WHERE id = 'd6085ce7-3bfc-41b1-90de-b10d46a9af23';

UPDATE schools SET
  raw_country = '美国',
  city = 'Champaign',
  country_code = 'US',
  description = '伊利诺伊大学香槟分校艺术与设计学院是美国顶尖的公立艺术与设计学院之一，提供多元化的艺术、设计和建筑课程。学院致力于培养学生的创造力、批判性思维和实践能力，鼓励跨学科合作，为学生提供丰富的学习资源和实践机会。其毕业生在艺术和设计领域表现出色。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://art.illinois.edu/programs-and-applying/admissions-funding/',
  logo_url = 'https://art.illinois.edu/wp-content/uploads/2023/07/Art-Design-Wordmark-Primary-RGB.png',
  tuition_usd_per_year = 40096,
  acceptance_rate = 0.37,
  program_count = 10,
  portfolio_difficulty = 4,
  city_cost_index = 3,
  career_resources_rating = 4,
  founded_year = 1867,
  qs_art_design_rank = 127,
  qs_overall_rank = 70,
  major_tags = '[{"category":"design","tags":["graphic_design","industrial_design","interaction_design"]},{"category":"fine_arts","tags":["painting","sculpture","photography","printmaking"]},{"category":"architecture","tags":["architecture"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学下属学院']::text[],
  strength_disciplines = ARRAY['平面设计', '工业设计', '纯艺术', '建筑']::text[]
WHERE id = 'f70d8095-ba7f-4f35-b3a0-abaa0cba12ae';

UPDATE schools SET
  raw_country = '南非',
  city = 'Johannesburg',
  country_code = 'ZA',
  description = '约翰内斯堡大学艺术、设计与建筑学院（FADA）是南非领先的创意教育中心。学院提供从建筑、时尚设计到视觉艺术的广泛课程，致力于在非洲背景下推动创意产业的发展，其艺术与设计学科在QS排名中表现突出。',
  application_deadline = 'Sep 30',
  international_students_page = 'https://www.uj.ac.za/international-students/',
  tuition_usd_per_year = 4000,
  portfolio_difficulty = 4,
  city_cost_index = 3,
  career_resources_rating = 4,
  founded_year = 2005,
  qs_art_design_rank = 151,
  qs_overall_rank = 312,
  major_tags = '[{"category":"design","tags":["fashion","industrial","visual_communication"]},{"category":"architecture","tags":["architecture"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '建筑']::text[],
  strength_disciplines = ARRAY['建筑', '时尚设计', '工业设计', '视觉艺术']::text[]
WHERE id = '3cd8074e-a353-40ec-8caf-847d54abdc54';

UPDATE schools SET
  raw_country = '加拿大',
  city = 'Winnipeg',
  country_code = 'CA',
  description = '曼尼托巴大学建筑学院是加拿大首个提供四个研究生建筑环境学位课程的学院，专注于卓越设计、教学和研究，致力于改善建筑环境质量以及相关的生态、经济、物理和社会福祉。',
  application_deadline = 'Dec 1',
  international_students_page = 'https://umanitoba.ca/explore/international',
  logo_url = 'https://umanitoba.ca/themes/custom/umanitoba/images/logo.svg',
  tuition_usd_per_year = 24700,
  acceptance_rate = 0.52,
  program_count = 6,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1919,
  qs_overall_rank = 643,
  major_tags = '[{"category":"architecture","tags":["architecture","city_planning","interior_design","landscape_architecture","environmental_design"]}]'::jsonb,
  feature_tags = ARRAY['公立', '建筑设计']::text[]
WHERE id = '3998d5fb-ef68-423c-bcc8-2197ee59f491';

UPDATE schools SET
  raw_country = '加拿大',
  city = 'Winnipeg',
  country_code = 'CA',
  description = '马尼托巴大学艺术学院（School of Art）成立于1913年，是加拿大西部历史最悠久的艺术学院。学院提供工作室艺术和艺术史的本科及研究生课程，注重跨学科学习，将传统艺术与当代实践相结合。学院拥有屡获殊荣的ARTlab建筑，为学生提供一流的创作和研究设施。',
  international_students_page = 'https://umanitoba.ca/admissions/international-student-admissions',
  notable_alumni = 'Marcel Dzama, Wanda Koop, Micah Lexier, Sarah Ann Johnson, Ivan Eyre',
  logo_url = 'https://umanitoba.ca/themes/custom/umanitoba/images/logo.svg',
  tuition_usd_per_year = 18000,
  acceptance_rate = 0.52,
  program_count = 5,
  portfolio_difficulty = 3,
  city_cost_index = 2,
  career_resources_rating = 3,
  founded_year = 1913,
  qs_overall_rank = 643,
  major_tags = '[{"category":"art","tags":["studio_art","art_history","ceramics","drawing","painting","sculpture","photography","printmaking","video"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '跨学科', '历史悠久']::text[],
  strength_disciplines = ARRAY['纯艺术', '艺术史']::text[]
WHERE id = '42cccf0e-57b9-436c-844f-21cbe23c9cf6';

UPDATE schools SET
  raw_country = '美国',
  city = 'Amherst',
  country_code = 'US',
  description = '马萨诸塞大学阿默斯特分校艺术系致力于通过深入的核心学科以及跨学科和综合方法，培养学生成为当代艺术家和设计师。该系提供本科和研究生艺术课程，注重实践与理论结合。',
  international_students_page = 'https://www.umass.edu/admissions/undergraduate-admissions/apply/international-students',
  tuition_usd_per_year = 40449,
  acceptance_rate = 0.6,
  program_count = 5,
  portfolio_difficulty = 2,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1863,
  qs_overall_rank = 247,
  qs_art_humanities_rank = 92,
  feature_tags = ARRAY['公立', '综合大学院系', '艺术设计']::text[],
  strength_disciplines = ARRAY['动画', '陶瓷', '设计与技术', '跨媒体', '绘画', '版画', '雕塑']::text[]
WHERE id = '2690f242-5947-4c8b-bbbb-8d57a5202b7a';

UPDATE schools SET
  raw_country = '美国',
  city = 'Minneapolis',
  country_code = 'US',
  description = '明尼苏达大学双城分校艺术学院隶属于世界知名的研究型大学，致力于在跨学科和严谨的学术环境中进行艺术研究、教育和推广。学院设施先进，涵盖雕塑、铸造、陶瓷、数字制造、版画、绘画、黑白摄影和数字影像等多个领域。',
  application_deadline = 'November 1 (Early Action I), December 1 (Early Action II), January 1 (Regular Deadline)',
  international_students_page = 'https://admissions.tc.umn.edu/admissions/international-freshman-admissions-overview',
  notable_alumni = 'Nafyar, George Morrison, Sonja Peterson, Sayge Carroll, Caroline Kent, Camden Stevens, May Ling Kopecky, Andrea Carlson, Katayoun Amjadi, Juana Berrío',
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/University_of_Minnesota_logo.svg/1200px-University_of_Minnesota_logo.svg.png',
  tuition_usd_per_year = 43332,
  acceptance_rate = 0.8,
  program_count = 10,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1851,
  major_tags = '[{"category":"fine_art","tags":["sculpture","foundry","ceramics","printmaking","drawing","painting","photography","digital_imaging"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '研究型大学']::text[]
WHERE id = 'c642ba6b-2125-4f22-ae83-4578034c742b';

UPDATE schools SET
  raw_country = '肯尼亚',
  city = 'Nairobi',
  country_code = 'KE',
  description = '内罗毕大学艺术与设计学院是肯尼亚内罗毕大学下属的艺术设计学院。内罗毕大学成立于1956年，是肯尼亚领先的综合性大学之一。学院致力于提供高质量的艺术与设计教育，培养学生的创造力与实践能力。',
  international_students_page = 'https://uonbi.ac.ke/international-students',
  tuition_usd_per_year = 850,
  portfolio_difficulty = 2,
  city_cost_index = 3,
  career_resources_rating = 2,
  founded_year = 1956,
  qs_overall_rank = 1001,
  feature_tags = ARRAY['公立', '艺术设计']::text[]
WHERE id = '8ccef01c-2188-425f-88a0-52c5b3d71599';

UPDATE schools SET
  raw_country = '澳大利亚',
  city = 'Sydney',
  country_code = 'AU',
  description = '悉尼科技大学设计、建筑与建造学院（DAB）是一个充满活力、以实践为导向的学院，专注于行业合作。学院在设计和建筑环境领域提供卓越的专业教育，致力于通过研究和教学，塑造一个更公正、更具韧性的未来。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://www.uts.edu.au/for-students/admissions-entry/how-to-apply/international-applicants',
  tuition_usd_per_year = 27800,
  acceptance_rate = 0.22,
  portfolio_difficulty = 4,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1988,
  qs_overall_rank = 96,
  qs_art_humanities_rank = 184,
  major_tags = '[{"category":"design","tags":["设计代理","设计未来","视觉化"]},{"category":"architecture","tags":["建筑","城市规划","社会公正","可持续建筑"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '建筑', '科技大学']::text[],
  strength_disciplines = ARRAY['设计', '建筑', '城市规划', '可持续发展', '视觉化']::text[]
WHERE id = '64e95331-3bc0-484a-8c4b-d2990cb8ec6e';

UPDATE schools SET
  raw_country = '英国',
  city = 'London',
  country_code = 'GB',
  description = '伦敦艺术大学（UAL）成立于1842年，是全球顶尖的艺术设计学府。它通过六所学院提供多元化的创意教育，培养创新人才，致力于为世界带来积极改变。',
  international_students_page = 'https://www.arts.ac.uk/study-at-ual/international',
  tuition_usd_per_year = 38200,
  acceptance_rate = 0.26,
  program_count = 249,
  portfolio_difficulty = 5,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1842,
  qs_art_design_rank = 2,
  qs_art_humanities_rank = 94,
  major_tags = '[{"category":"design","tags":["fashion","graphic_design","product_design"]},{"category":"art","tags":["fine_art","photography","illustration"]},{"category":"media","tags":["film","animation","journalism"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['时尚设计', '平面设计', '纯艺术', '电影制作', '摄影']::text[]
WHERE id = 'a9665370-b362-4bd4-a3e7-3a341286a875';

UPDATE schools SET
  raw_country = '加拿大',
  city = 'Toronto',
  country_code = 'CA',
  description = '多伦多大学艺术史系提供艺术史（FAH）的辅修、主修和专业课程。其课程涵盖从史前到当代的全球艺术，包括地中海地区、欧洲、美洲原住民和殖民地艺术以及亚洲艺术。该系注重培养学生的基础技能、批判性分析能力和广阔的文化视野，鼓励学生掌握多门外语以进行深入研究。',
  international_students_page = 'https://future.utoronto.ca/international-students',
  tuition_usd_per_year = 43000,
  acceptance_rate = 0.43,
  program_count = 3,
  portfolio_difficulty = 3,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1934,
  qs_overall_rank = 29,
  qs_art_humanities_rank = 14,
  major_tags = '[{"category":"art_history","tags":["ancient_art","medieval_art","renaissance_baroque_art","modern_contemporary_art","canadian_art","asian_art","history_of_architecture"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学院系']::text[]
WHERE id = '9458269d-b061-480c-914a-fa15efaa13b8';

UPDATE schools SET
  raw_country = '美国',
  city = 'Seattle',
  country_code = 'US',
  description = '华盛顿大学艺术+艺术史+设计学院是华盛顿大学内创意创新与研究的中心。学院注重体验式学习、积极创作和新实践开发，提供艺术、艺术史和设计领域的本科、硕士和博士学位课程。学生在跨学科合作、严谨研究和艺术创作中学习，培养批判性思维和解决问题的能力。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://admit.washington.edu/apply/first-year/how-to-apply/english-proficiency/',
  tuition_usd_per_year = 45111,
  acceptance_rate = 0.39,
  program_count = 8,
  portfolio_difficulty = 3,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1861,
  qs_overall_rank = 81,
  major_tags = '[{"category":"art","tags":["fine_arts","studio_art"]},{"category":"art_history","tags":["art_history"]},{"category":"design","tags":["industrial_design","visual_communication_design"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学', '艺术设计']::text[],
  strength_disciplines = ARRAY['纯艺术', '艺术史', '设计']::text[]
WHERE id = '1aecb0d2-2129-4996-bf31-a11aa3ae2766';

UPDATE schools SET
  raw_country = '加拿大',
  city = 'Waterloo',
  country_code = 'CA',
  description = '滑铁卢大学文学院是一个充满活力的社区，涵盖人文、社会科学、美术、表演艺术和媒体艺术。学院通过多元化的研究、教学和学习，在一个文化复杂和技术驱动的世界中产生社会影响。学院致力于培养学生的技能和价值观，以促进个人、社区和环境的福祉。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://uwaterloo.ca/future-students/international-students',
  notable_alumni = 'Marie Bountrogianni, Mark Bourrie, Gail Bowen',
  logo_url = 'https://uwaterloo.ca/brand/sites/ca.brand/files/waterloo_arts_logo_horiz_rev_rgb_0.png',
  tuition_usd_per_year = 45000,
  acceptance_rate = 0.53,
  program_count = 28,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 4,
  founded_year = 1957,
  qs_overall_rank = 119,
  qs_art_humanities_rank = 294,
  feature_tags = ARRAY['综合大学院系', '人文社科', '艺术', '带薪实习']::text[],
  strength_disciplines = ARRAY['艺术与设计', '英语语言文学', '心理学', '经济学', '法律', '政治与国际研究']::text[]
WHERE id = 'b8f01a91-3dba-4130-a54d-33353bcfdfef';

UPDATE schools SET
  raw_country = '美国',
  city = 'Milwaukee',
  country_code = 'US',
  description = '威斯康星大学密尔沃基分校佩克艺术学院是威斯康星州领先的艺术学校之一，提供高质量的艺术教育和专业培训。学院提供40多个艺术领域的本科、硕士和证书课程，涵盖艺术与设计、电影与动画、舞蹈、音乐和戏剧等。学院致力于培养具有远见卓识、善于研究和富有创造力的艺术家和创业者，通过实践学习和社区参与，让学生在艺术领域发挥影响力。',
  application_deadline = 'Varies by program',
  international_students_page = 'https://uwm.edu/cie/international-admissions/',
  logo_url = 'https://uwm.edu/arts/wp-content/uploads/sites/637/2023/04/PSOA-Logo-Horizontal-Black-Gold.svg',
  tuition_usd_per_year = 24415,
  acceptance_rate = 0.91,
  program_count = 40,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1962,
  major_tags = '[{"category":"art","tags":["animation","fine_arts","art_education","blacksmithing","community_arts","illustration","photography","studio_art"]},{"category":"design","tags":["design_visual_communication","digital_fabrication_design"]},{"category":"film","tags":["cinematic_arts","film_animation"]},{"category":"dance","tags":["african_diaspora_dance","dance_performance"]},{"category":"music","tags":["music_composition_technology","music_composition_theory","music_conducting","music_education","music_history_literature","music_performance","music_string_pedagogy"]},{"category":"theatre","tags":["theatre_education","musical_theatre","stage_directing","theatre_production"]}]'::jsonb,
  feature_tags = ARRAY['公立', '艺术设计', '综合大学院系']::text[],
  strength_disciplines = ARRAY['艺术与设计', '电影与动画', '舞蹈', '音乐', '戏剧']::text[]
WHERE id = 'ffc6816e-c18d-4b79-b72b-5af110b0d3ef';

UPDATE schools SET
  raw_country = '加拿大',
  city = 'Montreal',
  country_code = 'CA',
  description = '蒙特利尔大学（Université de Montréal）是加拿大一所顶尖的法语公立研究型大学，位于魁北克省蒙特利尔市。学校成立于1878年，拥有13个学院和附属学校，提供广泛的本科和研究生课程。其艺术与科学学院涵盖人文、社会科学、自然科学等多个领域，致力于通过研究和教学促进知识发展。蒙特利尔大学以其多元文化环境和卓越的学术声誉吸引着全球学生。',
  application_deadline = 'Varies by program (Fall: Apr 1, Winter: Aug 1, Summer: Dec 1)',
  international_students_page = 'https://admission.umontreal.ca/en/who-are-you/foreign-student/',
  notable_alumni = 'Hubert Reeves, Joanne Liu, Roger Guillemin, Denys Arcand, Jean-Marc Vallée, Louise Arbour, Éric Chacour, Kim Thùy, Pierre Elliott Trudeau',
  logo_url = 'https://www.umontreal.ca/public/www/user_upload/logo_udem_en.png',
  tuition_usd_per_year = 16425,
  acceptance_rate = 0.41,
  portfolio_difficulty = 3,
  city_cost_index = 4,
  career_resources_rating = 4,
  founded_year = 1878,
  qs_overall_rank = 168,
  feature_tags = ARRAY['公立', '综合大学', '法语教学']::text[],
  strength_disciplines = ARRAY['人类学', '化学', '传播学', '地理学', '语言学', '文学', '数学', '哲学', '物理学', '心理学', '政治学', '生物科学', '经济学', '社会学', '法语文学', '历史', '艺术史与电影研究', '计算机科学与运筹学', '图书馆与信息科学', '犯罪学', '心理教育学', '工业关系', '社会工作', '宗教研究']::text[]
WHERE id = '7b99f064-3654-4033-bebc-9a0c37e639c6';

UPDATE schools SET
  raw_country = '美国',
  city = 'Pullman',
  country_code = 'US',
  description = '华盛顿州立大学艺术系是该校艺术教育的核心，提供本科和研究生课程，鼓励学生通过创新和跨学科方法进行艺术实践与研究。教师团队由国际知名艺术家和学者组成，并与乔丹·施尼策尔艺术博物馆合作，为学生提供丰富的学习资源和实践机会。',
  international_students_page = 'https://admission.wsu.edu/apply/international-students/',
  tuition_usd_per_year = 31922,
  acceptance_rate = 0.8663,
  program_count = 4,
  portfolio_difficulty = 3,
  city_cost_index = 3,
  career_resources_rating = 3,
  founded_year = 1890,
  qs_overall_rank = 423,
  major_tags = '[{"category":"fine_arts","tags":["2d_art_design","3d_art_design","drawing","media_arts"]}]'::jsonb,
  feature_tags = ARRAY['公立', '综合大学下属艺术系']::text[],
  strength_disciplines = ARRAY['纯艺术', '2D艺术与设计', '3D艺术与设计', '媒体艺术']::text[]
WHERE id = '473c5fe3-41ef-484e-b1e4-fdfc8c8a3697';

UPDATE schools SET
  raw_country = '塞内加尔',
  city = 'Dakar',
  country_code = 'SN',
  description = '达喀尔国立艺术与文化工艺学院（ENAMC）前身为达喀尔国立艺术学院，于2022年正式更名。学院历史可追溯至1948年成立的达喀尔音乐学院，在塞内加尔艺术教育中扮演重要角色，致力于培养文化艺术领域的专业人才。',
  application_deadline = 'Varies by program',
  logo_url = 'https://enamc.sn/wp-content/uploads/2025/07/DG-1.jpg',
  portfolio_difficulty = 3,
  city_cost_index = 2,
  career_resources_rating = 2,
  founded_year = 1948,
  feature_tags = ARRAY['公立', '艺术设计']::text[],
  strength_disciplines = ARRAY['视觉艺术', '舞台艺术', '文化发展']::text[]
WHERE id = '896565cb-c048-4c47-87ca-acfb68be4f7e';

UPDATE schools SET
  raw_country = '法国',
  city = 'Paris',
  country_code = 'FR',
  description = '巴黎国立高等美术学院是法国一所历史悠久、享有国际声誉的艺术学府，隶属于法国文化部。学院以工作室教学为核心，提供理论与实践相结合的艺术教育，旨在培养高水平的艺术家。它是巴黎科学与文学大学（PSL）的成员之一。',
  logo_url = 'https://beauxartsparis.fr/themes/custom/beauxartsparis-bootstrap-subtheme/images/logo_Beaux Arts.svg',
  tuition_usd_per_year = 3051,
  program_count = 2,
  portfolio_difficulty = 5,
  city_cost_index = 5,
  career_resources_rating = 4,
  founded_year = 1648,
  qs_art_design_rank = 40,
  feature_tags = ARRAY['公立', '艺术设计', '历史悠久']::text[],
  strength_disciplines = ARRAY['纯艺术']::text[]
WHERE id = 'debe2ccf-6f15-4555-a54f-e0340f47a3f8';

-- ===== NEW SCHOOLS =====

INSERT INTO schools (id, name_zh, name_en, raw_country, city, country_code, description, official_website, tuition_usd_per_year, acceptance_rate, program_count, portfolio_difficulty, city_cost_index, career_resources_rating, founded_year, slug, status) VALUES
  ('b9714dfa-afc2-416f-aba0-a08cc6700127', '阿尔伯塔艺术大学', 'Alberta University of the Arts', '加拿大', 'Calgary', 'CA', '阿尔伯塔艺术大学是加拿大阿尔伯塔省唯一的艺术、工艺和设计大学，也是加拿大仅有的四所此类大学之一。学校成立于1926年，以其世界一流的设施、屡获殊荣的师资以及毕业生的才华和专业精神而闻名。', 'https://www.auarts.ca/', 23030, 0.37, 4, 4, 3, 4, 1926, 'alberta-university-of-the-arts', 'pending') ON CONFLICT DO NOTHING;

INSERT INTO schools (id, name_zh, name_en, raw_country, city, country_code, description, official_website, tuition_usd_per_year, acceptance_rate, program_count, portfolio_difficulty, city_cost_index, career_resources_rating, founded_year, slug, status) VALUES
  ('668bd443-dc32-431d-844d-7ce8ec30ab57', '墨西哥国家绘画、雕塑和版画学校', 'National School of Painting, Sculpture and Engraving "La Esmeralda"', '墨西哥', 'Mexico City', 'MX', '墨西哥国家绘画、雕塑和版画学校（La Esmeralda）成立于1927年，位于墨西哥城，是墨西哥顶尖的当代艺术学院。学校提供视觉艺术本科课程，培养了众多知名艺术家，如弗里达·卡罗曾在此任教。', 'https://www.esmeralda.edu.mx/', NULL, NULL, 1, 4, 3, 3, 1927, 'la-esmeralda-national-school-of-painting-sculpture-and-engraving', 'pending') ON CONFLICT DO NOTHING;

INSERT INTO schools (id, name_zh, name_en, raw_country, city, country_code, description, official_website, tuition_usd_per_year, acceptance_rate, program_count, portfolio_difficulty, city_cost_index, career_resources_rating, founded_year, slug, status) VALUES
  ('53177fa4-1ae6-4145-a03a-05b7d71b33df', '帕森斯设计学院', 'Parsons School of Design', '美国', 'New York City', 'US', 'Parsons School of Design enables students to develop the knowledge and skills they need to succeed in and contribute to our rapidly changing society. Students collaborate with peers throughout The New School, industry partners, and communities around the world and in New York City, a global center of art, design, and business.', 'https://www.newschool.edu/parsons/', 63940, 0.566, 37, 5, 5, 4, 1896, 'parsons-school-of-design', 'pending') ON CONFLICT DO NOTHING;

INSERT INTO schools (id, name_zh, name_en, raw_country, city, country_code, description, official_website, tuition_usd_per_year, acceptance_rate, program_count, portfolio_difficulty, city_cost_index, career_resources_rating, founded_year, slug, status) VALUES
  ('6f9a100f-c4b3-4445-be5d-d6f56778c496', '皇家美术学院安特卫普', 'Royal Academy of Fine Arts Antwerp', '比利时', 'Antwerp', 'BE', '皇家美术学院安特卫普成立于1663年，是世界顶尖艺术学府之一。学院提供服装设计、时尚、平面设计、珠宝设计、绘画、摄影、版画、雕塑等专业，吸引全球50多个国家的学生。', 'https://ap-arts.be/en/academy', 14500, NULL, 9, 5, 3, 4, 1663, 'royal-academy-of-fine-arts-antwerp', 'pending') ON CONFLICT DO NOTHING;

COMMIT;
