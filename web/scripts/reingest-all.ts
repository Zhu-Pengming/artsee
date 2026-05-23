import { execSync } from 'child_process';

const schools = [
  'csun-art',
  'suny-buffalo-art',
  'university-waterloo-art',
  'hong-kong-art-school',
  'csulb-art',
  'nairobi-institute-art-design',
  'lsu-art',
  'morelia-fine-arts',
  'university-montreal-art',
  'parsons-school-design',
  'uc-riverside-art',
  'university-johannesburg-art-design',
  'university-arizona-art',
  'chulalongkorn-arts',
  'rhodes-university-fine-arts',
  'cairo-university-applied-arts',
  'ruskin-school-art',
  'rmit-university',
  'royal-college-art',
  'uconn-art',
  'unm-art',
  'rutgers-mason-gross',
  'university-nairobi-art-design',
  'hongik-university',
  'helwan-university-fine-arts',
  'university-arts-london',
  'wits-art',
  'isa-cuba',
  'unam-art-design',
  'csula-art',
  'alexandria-university-fine-arts',
  'art-center-college-design',
  'central-saint-martins',
  'concordia-fine-arts',
  'durban-university-technology-art-design',
  'furg-art',
  'knua',
  'korea-national-university-arts',
  'london-college-communication',
  'london-college-fashion',
  'naba-milan',
  'nanyang-academy-fine-arts',
  'nelson-mandela-university-visual-arts',
  'pratt-institute',
  'puc-chile-arts',
  'purdue-visual-performing-arts',
  'queen-margaret-university',
  'queens-university-art',
  'risd',
  'scad',
  'shanghai-theatre-academy',
  'suny-stony-brook-art',
  'tunisia-fine-arts',
  'uc-santa-barbara-art',
  'uic-art',
  'uiuc-art-design',
  'umass-amherst-art',
  'umich-stamps-art-design',
  'umn-art',
  'una-costa-rica-arts',
  'unal-colombia-arts',
  'unc-chapel-hill-art',
  'university-barcelona-fine-arts',
  'university-dar-es-salaam-arts',
  'university-florida-art',
  'university-ghana-arts',
  'university-guadalajara-art-design',
  'university-guanajuato-arts',
  'university-manitoba-art',
  'university-toronto-art',
  'university-washington-art',
  'university-zimbabwe-art',
  'usac-guatemala-arts',
  'ut-austin-art',
  'utrecht-school-arts',
  'uts-design-architecture',
  'uwm-art-design',
  'washington-state-university-art',
  'ucla-art-architecture',
];

let success = 0;
let failed = 0;
const failedSchools: string[] = [];

console.log(`\n🚀 Starting re-ingestion for ${schools.length} schools...\n`);
console.log('⚠️  This will process ALL markdown files in each school folder\n');

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
console.log(`📊 Re-ingestion completed!`);
console.log(`  Total: ${schools.length}`);
console.log(`  ✅ Success: ${success}`);
console.log(`  ❌ Failed: ${failed}`);
console.log('========================================');

if (failed > 0) {
  console.log('\nFailed schools:');
  failedSchools.forEach((s) => console.log(`  - ${s}`));
}
