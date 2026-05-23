# PowerShell script for batch ingesting school wikis

$schools = @(
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
    'wits-art'
)

$success = 0
$failed = 0
$failedSchools = @()

Write-Host "`n🚀 Starting batch ingest for $($schools.Count) schools...`n" -ForegroundColor Cyan

for ($i = 0; $i -lt $schools.Count; $i++) {
    $school = $schools[$i]
    $current = $i + 1
    
    Write-Host "[$current/$($schools.Count)] Processing: $school" -ForegroundColor Yellow
    
    try {
        $output = npm run ingest -- --school $school 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Success`n" -ForegroundColor Green
            $success++
        } else {
            Write-Host "  ❌ Failed`n" -ForegroundColor Red
            $failed++
            $failedSchools += $school
        }
    } catch {
        Write-Host "  ❌ Failed`n" -ForegroundColor Red
        $failed++
        $failedSchools += $school
    }
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📊 Batch ingest completed!" -ForegroundColor Cyan
Write-Host "  Total: $($schools.Count)"
Write-Host "  ✅ Success: $success" -ForegroundColor Green
Write-Host "  ❌ Failed: $failed" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host "`nFailed schools:" -ForegroundColor Red
    foreach ($s in $failedSchools) {
        Write-Host "  - $s" -ForegroundColor Red
    }
}
