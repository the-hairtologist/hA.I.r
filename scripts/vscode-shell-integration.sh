#!/bin/bash
# Universal VS Code Shell Integration Script
# Works with Bash, Zsh, and other POSIX-compatible shells
# Usage: source this file in your shell's rc file

# AI Hair Genius VS Code Shell Integration
# This script enhances the terminal experience when working in VS Code

# Check if we're running in VS Code terminal
if [[ "$TERM_PROGRAM" == "vscode" ]]; then
    echo "🔧 Initializing VS Code shell integration for AI Hair Genius..."
    
    # Get the shell integration script path dynamically
    SHELL_INTEGRATION_PATH=$(code --locate-shell-integration-path bash 2>/dev/null)
    
    # Source the integration script if it exists
    if [[ -n "$SHELL_INTEGRATION_PATH" && -f "$SHELL_INTEGRATION_PATH" ]]; then
        source "$SHELL_INTEGRATION_PATH"
        echo "✅ VS Code shell integration loaded"
    else
        echo "⚠️  VS Code shell integration not found"
    fi
    
    # AI Hair Genius specific VS Code enhancements
    echo "🎨 Loading AI Hair Genius development shortcuts..."
    
    # Development aliases
    alias dev="npm run dev"
    alias test="npm run test"
    alias testw="npm run test:watch"
    alias build="npm run build"
    alias lint="npm run lint"
    alias type-check="npm run type-check"
    
    # Git workflow aliases
    alias gs="git status"
    alias ga="git add"
    alias gc="git commit"
    alias gp="git push"
    alias gl="git log --oneline -10"
    alias gco="git checkout"
    alias gb="git branch"
    alias gd="git diff"
    
    # Project-specific shortcuts
    alias logs="tail -f logs/*.log"
    alias clean="npm run clean && npm install"
    alias reset-db="npm run db:reset"
    alias seed-db="npm run db:seed"
    
    # Quick navigation (if in project directory)
    if [[ -f "package.json" ]]; then
        alias src="cd src"
        alias components="cd src/components"
        alias pages="cd src/pages"
        alias hooks="cd src/hooks"
        alias utils="cd src/utils"
        alias tests="cd src/tests"
        alias supabase="cd supabase"
        alias functions="cd supabase/functions"
        alias scripts="cd scripts"
        
        echo "📁 Project navigation shortcuts loaded"
    fi
    
    # Development environment check
    function check-env() {
        echo "🔍 AI Hair Genius Environment Check:"
        echo "📍 Current directory: $(pwd)"
        echo "📦 Node version: $(node --version 2>/dev/null || echo 'Not installed')"
        echo "📦 npm version: $(npm --version 2>/dev/null || echo 'Not installed')"
        echo "🐟 Shell: $SHELL"
        echo "💻 VS Code Terminal: $TERM_PROGRAM"
        
        if [[ -f "package.json" ]]; then
            echo "✅ In AI Hair Genius project directory"
            if [[ -d "node_modules" ]]; then
                echo "✅ Dependencies installed"
            else
                echo "⚠️  Dependencies not installed. Run 'npm install'"
            fi
        else
            echo "❌ Not in project directory"
        fi
    }
    
    # Quick project setup
    function quick-setup() {
        if [[ -f "package.json" ]]; then
            echo "🚀 Quick setup for AI Hair Genius..."
            npm install
            npm run type-check
            echo "✅ Setup complete! Use 'dev' to start development server"
        else
            echo "❌ Not in AI Hair Genius project directory"
        fi
    }
    
    # Show available commands
    function hair-genius-help() {
        echo "🎨 AI Hair Genius Development Commands:"
        echo ""
        echo "Development:"
        echo "  dev         - Start development server"
        echo "  test        - Run tests"
        echo "  testw       - Run tests in watch mode"
        echo "  build       - Build for production"
        echo "  lint        - Run ESLint"
        echo "  type-check  - Run TypeScript check"
        echo ""
        echo "Git Workflow:"
        echo "  gs          - git status"
        echo "  ga          - git add"
        echo "  gc          - git commit"
        echo "  gp          - git push"
        echo "  gl          - git log (last 10)"
        echo "  gco         - git checkout"
        echo "  gb          - git branch"
        echo "  gd          - git diff"
        echo ""
        echo "Navigation:"
        echo "  src         - Go to src directory"
        echo "  components  - Go to components"
        echo "  pages       - Go to pages"
        echo "  hooks       - Go to hooks"
        echo "  utils       - Go to utils"
        echo "  tests       - Go to tests"
        echo "  supabase    - Go to supabase"
        echo "  functions   - Go to supabase functions"
        echo ""
        echo "Utilities:"
        echo "  check-env      - Check development environment"
        echo "  quick-setup    - Quick project setup"
        echo "  hair-genius-help - Show this help"
    }
    
    echo "✨ AI Hair Genius development environment ready!"
    echo "💡 Type 'hair-genius-help' for available commands"
    
else
    echo "💡 VS Code shell integration only works in VS Code terminal"
fi