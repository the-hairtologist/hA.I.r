# Final cleanup for any remaining issues
Write-Host "Running final cleanup..." -ForegroundColor Green

# Check validation.ts again
$file = "src/lib/validation.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "/\(--\|;\\\|", "/(--|;"
    $content = $content -replace "/\(--\|;\\\/", "/(--|;/"
    Set-Content $file $content -Encoding UTF8
    Write-Host " validation.ts cleaned up" -ForegroundColor Green
}

Write-Host "Final cleanup completed!" -ForegroundColor Green
