# AI Hair Genius VS Code PowerShell Integration

if ($env:TERM_PROGRAM -eq "vscode") {
    Write-Host "🔧 Initializing VS Code shell integration for AI Hair Genius..." -ForegroundColor Cyan
    
    # Load VS Code shell integration
    try {
        $ShellIntegrationPath = & code --locate-shell-integration-path pwsh 2>$null
        if ($ShellIntegrationPath -and (Test-Path $ShellIntegrationPath)) {
            . $ShellIntegrationPath
            Write-Host "✅ VS Code shell integration loaded" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Could not load VS Code shell integration" -ForegroundColor Yellow
    }
    
    Write-Host "🎨 Loading AI Hair Genius development shortcuts..." -ForegroundColor Cyan
    
    # Development functions
    function dev { npm run dev }
    function test { npm run test }
    function testw { npm run test:watch }
    function build { npm run build }
    function lint { npm run lint }
    function typecheck { npm run type-check }
    
    # Git workflow functions
    function gs { git status }
    function ga { git add . }
    function gpush { git push }
    function gl { git log --oneline -10 }
    function gb { git branch }
    function gd { git diff }
    
    # Quick navigation
    if (Test-Path "package.json") {
        function src { Set-Location src }
        function components { Set-Location src\components }
        function pages { Set-Location src\pages }
        function hooks { Set-Location src\hooks }
        function utils { Set-Location src\utils }
        
        Write-Host "📁 Project navigation shortcuts loaded" -ForegroundColor Green
    }
    
    # Environment check
    function CheckEnv {
        Write-Host "🔍 AI Hair Genius Environment Check:" -ForegroundColor Cyan
        Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor White
        Write-Host "💻 VS Code Terminal: $env:TERM_PROGRAM" -ForegroundColor White
        
        if (Test-Path "package.json") {
            Write-Host "✅ In AI Hair Genius project directory" -ForegroundColor Green
        } else {
            Write-Host "❌ Not in project directory" -ForegroundColor Red
        }
    }
    
    # Help function
    function HairGeniusHelp {
        Write-Host "🎨 AI Hair Genius Commands:" -ForegroundColor Cyan
        Write-Host "Development: dev, test, testw, build, lint, typecheck" -ForegroundColor Yellow
        Write-Host "Git: gs, ga, gpush, gl, gb, gd" -ForegroundColor Yellow
        Write-Host "Navigation: src, components, pages, hooks, utils" -ForegroundColor Yellow
        Write-Host "Utilities: CheckEnv, HairGeniusHelp" -ForegroundColor Yellow
    }
    
    Write-Host "✨ AI Hair Genius development environment ready!" -ForegroundColor Green
    Write-Host "💡 Type 'HairGeniusHelp' for available commands" -ForegroundColor Cyan
    
} else {
    Write-Host "💡 VS Code shell integration only works in VS Code terminal" -ForegroundColor Yellow
}