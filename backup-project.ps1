# AI Hair Genius - Backup Script
# Run this script to create instant backups of your project
# Usage: .\backup-project.ps1

param(
    [string]$BackupLocation = "C:\Users\tomto\OneDrive\Documents\GitHub\",
    [switch]$IncludeGit,
    [switch]$Compress
)

# Get current timestamp
$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmm'
$projectName = "ai-hair-genius"

# Define backup paths
$backupFolderPath = Join-Path $BackupLocation "$projectName-backup-$timestamp"
$backupArchivePath = Join-Path $BackupLocation "$projectName-archive-$timestamp.zip"

Write-Host "🔄 Starting AI Hair Genius backup..." -ForegroundColor Cyan
Write-Host "📅 Timestamp: $timestamp" -ForegroundColor Yellow

# Create folder backup
Write-Host "📁 Creating folder backup..." -ForegroundColor Yellow
$excludeDirs = @(".git", "node_modules", "dist", ".vscode")
if (-not $IncludeGit) {
    $robocopyExcludes = "/XD " + ($excludeDirs -join " ")
} else {
    $robocopyExcludes = "/XD node_modules dist .vscode"
}

$robocopyCmd = "robocopy `"$PWD`" `"$backupFolderPath`" /E $robocopyExcludes /XF *.log *.tmp"
Invoke-Expression $robocopyCmd | Out-Null

# Verify backup
$fileCount = (Get-ChildItem $backupFolderPath -Recurse | Measure-Object).Count
Write-Host "✅ Folder backup created: $fileCount files" -ForegroundColor Green
Write-Host "📁 Location: $backupFolderPath" -ForegroundColor White

# Create archive backup if requested
if ($Compress) {
    Write-Host "📦 Creating compressed archive..." -ForegroundColor Yellow
    
    $filesToBackup = Get-ChildItem -Path "." -Recurse | Where-Object { 
        $_.FullName -notmatch "(node_modules|\.git|dist)" -and 
        $_.Extension -ne ".log" -and 
        $_.Extension -ne ".tmp" 
    }
    
    $filesToBackup | Compress-Archive -DestinationPath $backupArchivePath -CompressionLevel Optimal -Force
    
    $archiveSize = [math]::Round((Get-Item $backupArchivePath).Length / 1MB, 2)
    Write-Host "✅ Archive created: $archiveSize MB" -ForegroundColor Green
    Write-Host "📦 Location: $backupArchivePath" -ForegroundColor White
}

# Check Git status
Write-Host "🔍 Checking Git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Uncommitted changes found!" -ForegroundColor Red
    Write-Host "   Consider committing and pushing to GitHub for remote backup" -ForegroundColor Yellow
} else {
    Write-Host "✅ Git repository is clean" -ForegroundColor Green
    
    # Check if remote is up to date
    git fetch origin 2>$null
    $behindCount = (git rev-list HEAD..origin/$(git branch --show-current) --count 2>$null)
    $aheadCount = (git rev-list origin/$(git branch --show-current)..HEAD --count 2>$null)
    
    if ($aheadCount -gt 0) {
        Write-Host "⚠️  $aheadCount commit(s) not pushed to GitHub!" -ForegroundColor Red
        Write-Host "   Run 'git push' to backup to remote repository" -ForegroundColor Yellow
    } else {
        Write-Host "✅ GitHub backup is up to date" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 Backup complete!" -ForegroundColor Green
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   • Folder backup: $backupFolderPath" -ForegroundColor White
if ($Compress) {
    Write-Host "   • Archive backup: $backupArchivePath" -ForegroundColor White
}
Write-Host "   • GitHub remote: https://github.com/Ha-i-r/ai-hair-genius" -ForegroundColor White
Write-Host ""
Write-Host "💡 To restore, use any of these backups or clone from GitHub" -ForegroundColor Cyan