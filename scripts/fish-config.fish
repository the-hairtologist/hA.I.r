# Fish shell configuration for AI Hair Genius development
# Add this to your ~/.config/fish/config.fish or source this file

# VS Code shell integration
# This enables enhanced terminal features when using VS Code's integrated terminal
string match -q "$TERM_PROGRAM" "vscode"
and . (code --locate-shell-integration-path fish)

# Development aliases for AI Hair Genius
alias dev="npm run dev"
alias test="npm run test"
alias testw="npm run test:watch"
alias build="npm run build"
alias lint="npm run lint"

# Git aliases for faster workflow
alias gs="git status"
alias ga="git add"
alias gc="git commit"
alias gp="git push"
alias gl="git log --oneline -10"
alias gco="git checkout"

# Project-specific functions
function setup-hair-genius
    echo "🚀 Setting up AI Hair Genius development environment..."
    
    # Check if we're in the right directory
    if not test -f "package.json"
        echo "❌ Not in project root. Please cd to ai-hair-genius directory first."
        return 1
    end
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Copy environment file if it doesn't exist
    if not test -f ".env.local"
        if test -f ".env.example"
            echo "📋 Creating .env.local from example..."
            cp .env.example .env.local
            echo "⚠️  Please update .env.local with your actual values"
        end
    end
    
    echo "✅ Setup complete! Run 'dev' to start development server."
end

function hair-genius-test
    echo "🧪 Running AI Hair Genius tests..."
    npm run test
end

function hair-genius-build
    echo "🏗️  Building AI Hair Genius..."
    npm run build
end

# Enhanced prompt for project (optional)
function fish_prompt
    set_color blue
    echo -n (basename (prompt_pwd))
    
    # Show git branch if in git repo
    if git rev-parse --git-dir >/dev/null 2>&1
        set_color yellow
        echo -n " ("(git branch --show-current)")"
    end
    
    # Show if this is the hair-genius project
    if test -f "package.json" && grep -q "vite_react_shadcn_ts" package.json
        set_color green
        echo -n " [Hair Genius]"
    end
    
    set_color normal
    echo " $ "
end

# Welcome message when in project directory
if test -f "package.json" && grep -q "vite_react_shadcn_ts" package.json
    echo "💇‍♀️ Welcome to AI Hair Genius development!"
    echo "Available commands: dev, test, testw, build, lint"
    echo "Setup: run 'setup-hair-genius' if this is your first time"
end