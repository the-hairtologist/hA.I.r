# AI Hair Genius - VS Code Shell Integration Shortcuts

*Complete reference for all available shortcuts in VS Code terminal*

## 🚀 Development Shortcuts

```powershell
# Core Development Commands
dev          # Start development server (npm run dev)
test         # Run tests (npm run test)
testw        # Run tests in watch mode (npm run test:watch)
build        # Build for production (npm run build)
lint         # Run ESLint (npm run lint)
```

## 🔄 Git Workflow Shortcuts

```powershell
# Git Commands (Updated & Fixed!)
gs           # git status
ga [files]   # git add (defaults to all files)
gcommit 'msg' # git commit with message (FIXED: was gc)
gpush        # git push (FIXED: was gp)
glog         # git log --oneline -10 (FIXED: was gl)
gco branch   # git checkout branch
gb           # git branch
gd           # git diff
```

## 📁 Navigation Shortcuts

```powershell
# Quick Directory Navigation
src          # Go to src folder
components   # Go to components folder
pages        # Go to pages folder
hooks        # Go to hooks folder
utils        # Go to utils folder
tests        # Go to tests folder
supabase     # Go to supabase folder
functions    # Go to supabase/functions folder
```

## 🛠️ Utility Functions

```powershell
# Development Environment
Test-Environment      # Check Node.js, npm versions and project status
Show-HairGeniusHelp   # Display all available commands and shortcuts
```

## 📋 How to Use

### 1. **Automatic Loading (VS Code Terminal)**
The shortcuts are automatically available when you open a VS Code terminal in this project.

### 2. **Manual Loading**
If shortcuts aren't available, manually load them:
```powershell
. .\scripts\vscode-shell-integration-clean.ps1
```

### 3. **PowerShell Profile (Global)**
To make shortcuts available in all PowerShell sessions, add to your profile:
```powershell
# Add to $PROFILE
if (Test-Path "C:\path\to\ai-hair-genius\scripts\vscode-shell-integration-clean.ps1") {
    . "C:\path\to\ai-hair-genius\scripts\vscode-shell-integration-clean.ps1"
}
```

## 🔧 Available Script Files

- **`scripts/vscode-shell-integration-clean.ps1`** - Full-featured PowerShell integration
- **`scripts/vscode-shell-integration.ps1`** - Comprehensive version with additional features  
- **`scripts/vscode-integration-simple.ps1`** - Lightweight version
- **`scripts/vscode-shell-integration.sh`** - Bash/Zsh support
- **`scripts/fish-config.fish`** - Fish shell support

## ✅ PowerShell Compliance

All shortcuts have been updated to be fully compliant with PowerShell best practices:

- ✅ **Function Names**: Use approved PowerShell verbs (`Test-Environment`, `Show-HairGeniusHelp`)
- ✅ **No Alias Conflicts**: Renamed conflicting shortcuts
  - `gc` → `gcommit` (avoided `Get-Content` conflict)
  - `gl` → `glog` (avoided `Get-Location` conflict)
  - `gp` → `gpush` (avoided `Get-ItemProperty` conflict)
- ✅ **Syntax Validation**: All scripts pass PowerShell Script Analyzer

## 🎯 Quick Start Examples

```powershell
# Start development
dev

# Check environment
Test-Environment

# Git workflow
gs                    # Check status
ga                    # Add all files
gcommit "feat: new feature"  # Commit with message
gpush                 # Push to remote

# Navigate and work
components            # Go to components folder
lint                  # Run linting
build                 # Build for production

# Get help
Show-HairGeniusHelp   # Show all available commands
```

## 🔄 Updates & Maintenance

- **Last Updated**: October 24, 2025
- **Status**: All shortcuts working and committed to GitHub
- **Backup**: Automated backup script available (`backup-project.ps1`)

---

**💡 Tip**: Type `Show-HairGeniusHelp` in your VS Code terminal to see this reference anytime!