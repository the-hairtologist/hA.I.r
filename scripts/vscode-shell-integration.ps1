# AI Hair Genius VS Code PowerShell Integration
# Add this to your PowerShell profile: $PROFILE
# Or source this file: . .\scripts\vscode-shell-integration.ps1

# Check if we're running in VS Code terminal
if ($env:TERM_PROGRAM -eq "vscode") {
    Write-Host "🔧 Initializing VS Code shell integration for AI Hair Genius..." -ForegroundColor Cyan
    
    # Get the shell integration script path dynamically
    try {
        $ShellIntegrationPath = & code --locate-shell-integration-path pwsh 2>$null
        
        # Source the integration script if it exists
        if ($ShellIntegrationPath -and (Test-Path $ShellIntegrationPath)) {
            . $ShellIntegrationPath
            Write-Host "✅ VS Code shell integration loaded" -ForegroundColor Green
        } else {
            Write-Host "⚠️  VS Code shell integration not found" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Could not load VS Code shell integration" -ForegroundColor Yellow
    }
    
    # AI Hair Genius specific VS Code enhancements
    Write-Host "🎨 Loading AI Hair Genius development shortcuts..." -ForegroundColor Cyan
    
    # Development functions (PowerShell doesn't have aliases with parameters)
    function dev { npm run dev }
    function test { npm run test }
    function testw { npm run test:watch }
    function build { npm run build }
    function lint { npm run lint }
    function type-check { npm run type-check }
    
    # Git workflow functions
    function gs { git status }
    function ga { param($files = ".") git add $files }
    function gc { param($message) git commit -m $message }
    function gpush { git push }
    function glog { git log --oneline -10 }
    function gco { param($branch) git checkout $branch }
    function gb { git branch }
    function gd { git diff }
    
    # Project-specific shortcuts
    function logs { Get-Content -Path "logs\*.log" -Wait -Tail 50 }
    function clean { npm run clean; npm install }
    function reset-db { npm run db:reset }
    function seed-db { npm run db:seed }
    
    # Quick navigation (if in project directory)
    if (Test-Path "package.json") {
        function src { Set-Location src }
        function components { Set-Location src\components }
        function pages { Set-Location src\pages }
        function hooks { Set-Location src\hooks }
        function utils { Set-Location src\utils }
        function tests { Set-Location src\tests }
        function supabase { Set-Location supabase }
        function functions { Set-Location supabase\functions }
        function scripts { Set-Location scripts }
        
        Write-Host "📁 Project navigation shortcuts loaded" -ForegroundColor Green
    }
    
    # Development environment check
    function Test-Environment {
        Write-Host "🔍 AI Hair Genius Environment Check:" -ForegroundColor Cyan
        Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor White
        
        try { $nodeVersion = & node --version 2>$null } catch { $nodeVersion = "Not installed" }
        try { $npmVersion = & npm --version 2>$null } catch { $npmVersion = "Not installed" }
        
        Write-Host "📦 Node version: $nodeVersion" -ForegroundColor White
        Write-Host "📦 npm version: $npmVersion" -ForegroundColor White
        Write-Host "💻 PowerShell version: $($PSVersionTable.PSVersion)" -ForegroundColor White
        Write-Host "💻 VS Code Terminal: $env:TERM_PROGRAM" -ForegroundColor White
        
        if (Test-Path "package.json") {
            Write-Host "✅ In AI Hair Genius project directory" -ForegroundColor Green
            if (Test-Path "node_modules") {
                Write-Host "✅ Dependencies installed" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Dependencies not installed. Run 'npm install'" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ Not in project directory" -ForegroundColor Red
        }
    }
    
    # Quick project setup
    function Quick-Setup {
        if (Test-Path "package.json") {
            Write-Host "🚀 Quick setup for AI Hair Genius..." -ForegroundColor Cyan
            npm install
            npm run type-check
            Write-Host "✅ Setup complete! Use 'dev' to start development server" -ForegroundColor Green
        } else {
            Write-Host "❌ Not in AI Hair Genius project directory" -ForegroundColor Red
        }
    }
    
    # Show available commands
    function Show-HairGeniusHelp {
        Write-Host "🎨 AI Hair Genius Development Commands:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Development:" -ForegroundColor Yellow
        Write-Host "  dev         - Start development server"
        Write-Host "  test        - Run tests"
        Write-Host "  testw       - Run tests in watch mode"
        Write-Host "  build       - Build for production"
        Write-Host "  lint        - Run ESLint"
        Write-Host "  type-check  - Run TypeScript check"
        Write-Host ""
        Write-Host "Git Workflow:" -ForegroundColor Yellow
        Write-Host "  gs          - git status"
        Write-Host "  ga [files]  - git add (defaults to all)"
        Write-Host "  gc 'msg'    - git commit with message"
        Write-Host "  gpush       - git push"
        Write-Host "  glog        - git log (last 10)"
        Write-Host "  gco branch  - git checkout branch"
        Write-Host "  gb          - git branch"
        Write-Host "  gd          - git diff"
        Write-Host ""
        Write-Host "Navigation:" -ForegroundColor Yellow
        Write-Host "  src         - Go to src directory"
        Write-Host "  components  - Go to components"
        Write-Host "  pages       - Go to pages"
        Write-Host "  hooks       - Go to hooks"
        Write-Host "  utils       - Go to utils"
        Write-Host "  tests       - Go to tests"
        Write-Host "  supabase    - Go to supabase"
        Write-Host "  functions   - Go to supabase functions"
        Write-Host ""
        Write-Host "Utilities:" -ForegroundColor Yellow
        Write-Host "  Check-Env      - Check development environment"
        Write-Host "  Quick-Setup    - Quick project setup"
        Write-Host "  Hair-Genius-Help - Show this help"
    }
    
    Write-Host "✨ AI Hair Genius development environment ready!" -ForegroundColor Green
    Write-Host "💡 Type 'Hair-Genius-Help' for available commands" -ForegroundColor Cyan
    
} else {
    Write-Host "💡 VS Code shell integration only works in VS Code terminal" -ForegroundColor Yellow
}