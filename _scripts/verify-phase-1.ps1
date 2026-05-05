# Verify Phase 1 setup — fetch-and-store images
# Run AFTER: migration applied + bucket created + storage policies applied

$ErrorActionPreference = "Stop"

$SUPABASE_URL = "https://glupdjvdvunogkqgxoui.supabase.co"
$ANON_KEY = "sb_publishable_HKdE2IRmz9lMDcg4p3l1tw_HiTdD4nw"

Write-Host "=== Phase 1 Verification ===" -ForegroundColor Cyan

# Check 1: Column exists in beaches
Write-Host "`n[1/2] Checking beaches.image_storage_url column..." -NoNewline
try {
    $headers = @{
        "apikey" = $ANON_KEY
        "Authorization" = "Bearer $ANON_KEY"
    }
    $url = "$SUPABASE_URL/rest/v1/beaches?select=image_storage_url&limit=1"
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method Get
    Write-Host " OK" -ForegroundColor Green
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)"
    Write-Host "  → Migration not yet applied. Run docs/migrations/2026-05-06-add-image-storage-url.sql in SQL Editor."
    exit 1
}

# Check 2: Bucket exists (404 on missing file = bucket OK)
Write-Host "[2/2] Checking card-images bucket exists..." -NoNewline
try {
    $url = "$SUPABASE_URL/storage/v1/object/public/card-images/_does_not_exist.jpg"
    $response = Invoke-WebRequest -Uri $url -Method Get -ErrorAction SilentlyContinue
    Write-Host " UNEXPECTED" -ForegroundColor Yellow
    Write-Host "  Got 200 for non-existent file — investigate."
    exit 1
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 404) {
        Write-Host " OK (bucket exists, file not found = expected)" -ForegroundColor Green
    } elseif ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host " FAIL" -ForegroundColor Red
        Write-Host "  → Bucket 'card-images' does not exist. Create via Dashboard."
        exit 1
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)"
        exit 1
    }
}

Write-Host "`n=== Phase 1 setup OK ===" -ForegroundColor Green
Write-Host "Ready for Phase 2 (Edge Function pexels-fetch-and-store)."
