import { execSync } from 'child_process';

const schools = [
  'alberta-university-arts',
  'alexandria-university-fine-arts',
  'antwerp-royal-academy',
  'art-center-college-design',
  'aut-art-design',
  'cairo-faculty-fine-arts',
  'cairo-university-applied-arts',
  'central-academy-fine-arts',
  'central-saint-martins',
  'chulalongkorn-arts',
  'concordia-fine-arts',
  'csula-art',
  'csulb-art',
  'csun-art',
  'dakar-national-school-arts',
  'durban-university-technology-art-design',
  'ecole-beaux-arts-paris',
  'emily-carr-university',
  'furg-art',
  'helwan-university-fine-arts',
  'hong-kong-art-school',
  'hongik-university',
  'isa-cuba',
  'knua',
  'korea-national-university-arts',
  'london-college-communication',
  'london-college-fashion',
  'lsu-art',
  'morelia-fine-arts',
  'naba-milan',
  'nairobi-institute-art-design',
  'nanyang-academy-fine-arts',
  'national-institute-arts-bamako',
  'nelson-mandela-university-visual-arts',
  'ocad-university',
  'otis-art-design',
  'parsons-school-design',
  'pratt-institute',
  'puc-chile-arts',
  'purdue-visual-performing-arts',
  'queen-margaret-university',
  'queens-university-art',
  'rhodes-university-fine-arts',
  'risd',
  'rmit-university',
  'royal-college-art',
  'ruskin-school-art',
  'rutgers-mason-gross',
  'scad',
  'shanghai-theatre-academy',
  'suny-buffalo-art',
  'suny-stony-brook-art',
  'tsinghua-academy-arts-design',
  'tunisia-fine-arts',
  'ualberta-art-design',
  'uc-berkeley-art-practice',
  'uc-riverside-art',
  'uc-santa-barbara-art',
  'ucla-art-architecture',
  'uconn-art',
  'uic-art',
  'uiuc-art-design',
  'umass-amherst-art',
  'umich-stamps-art-design',
  'umn-art',
  'una-argentina',
  'una-costa-rica-arts',
  'unal-colombia-arts',
  'unam-art-design',
  'unc-chapel-hill-art',
  'university-aberdeen',
  'university-algiers-arts',
  'university-arizona-art',
  'university-arts-london',
  'university-barcelona-fine-arts',
  'university-dar-es-salaam-arts',
  'university-florida-art',
  'university-ghana-arts',
  'university-guadalajara-art-design',
  'university-guanajuato-arts',
  'university-johannesburg-art-design',
  'university-manitoba-art',
  'university-montreal-art',
  'university-nairobi-art-design',
  'university-panama-arts',
  'university-toronto-art',
  'university-washington-art',
  'university-waterloo-art',
  'university-zimbabwe-art',
  'unm-art',
  'usac-guatemala-arts',
  'ut-austin-art',
  'utrecht-school-arts',
  'uts-design-architecture',
  'uwm-art-design',
  'vienna-applied-arts',
  'washington-state-university-art',
  'wits-art',
];

let success = 0;
let failed = 0;
const failedSchools: string[] = [];

console.log(`\n🚀 Starting batch ingest for ${schools.length} schools...\n`);

schools.forEach((school, idx) => {
  const current = idx + 1;
  console.log(`[${current}/${schools.length}] Processing: ${school}`);

  try {
    execSync(`npm run ingest -- --school ${school}`, {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    console.log(`  ✅ Success\n`);
    success++;
  } catch (error) {
    console.log(`  ❌ Failed\n`);
    failed++;
    failedSchools.push(school);
  }
});

console.log('========================================');
console.log(`📊 Batch ingest completed!`);
console.log(`  Total: ${schools.length}`);
console.log(`  ✅ Success: ${success}`);
console.log(`  ❌ Failed: ${failed}`);
console.log('========================================');

if (failed > 0) {
  console.log('\nFailed schools:');
  failedSchools.forEach((s) => console.log(`  - ${s}`));
}
