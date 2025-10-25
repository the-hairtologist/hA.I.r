#!/usr/bin/env bash

# Development Environment Setup Script
# Configures shell integration and development tools

set -e

echo "🚀 Setting up development environment for AI Hair Genius..."

# Function to setup Fish shell VS Code integration
setup_fish_vscode() {
    echo "🐟 Setting up Fish shell VS Code integration..."
    
    # Check if Fish is installed
    if ! command -v fish &> /dev/null; then
        echo "❌ Fish shell not found. Please install Fish first:"
        echo "   - macOS: brew install fish"
        echo "   - Ubuntu: sudo apt install fish"
        echo "   - Other: https://fishshell.com/"
        return 1
    fi
    
    # Create Fish config directory if it doesn't exist
    mkdir -p ~/.config/fish
    
    # Add VS Code integration to Fish config
    FISH_CONFIG="$HOME/.config/fish/config.fish"
    VS_CODE_INTEGRATION='# VS Code shell integration (Fish)
string match -q "$TERM_PROGRAM" "vscode"
and . (code --locate-shell-integration-path fish)'
    
    if ! grep -q "locate-shell-integration-path fish" "$FISH_CONFIG" 2>/dev/null; then
        echo "" >> "$FISH_CONFIG"
        echo "$VS_CODE_INTEGRATION" >> "$FISH_CONFIG"
        echo "✅ VS Code integration added to Fish config"
    else
        echo "✅ VS Code integration already configured for Fish"
    fi
}

# Function to setup Node.js environment
setup_nodejs() {
    echo "📦 Checking Node.js environment..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found. Please install Node.js 18+ first:"
        echo "   - Visit: https://nodejs.org/"
        echo "   - Or use nvm: https://github.com/nvm-sh/nvm"
        return 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo "⚠️  Node.js version is $NODE_VERSION, but 18+ is recommended"
    else
        echo "✅ Node.js $(node --version) is installed"
    fi
    
    # Install dependencies
    if [ -f "package.json" ]; then
        echo "📥 Installing project dependencies..."
        npm install
        echo "✅ Dependencies installed"
    fi
}

# Function to setup Git hooks (optional)
setup_git_hooks() {
    echo "🔗 Setting up Git hooks..."
    
    # Pre-commit hook for linting
    PRE_COMMIT_HOOK='.git/hooks/pre-commit'
    if [ ! -f "$PRE_COMMIT_HOOK" ]; then
        cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/sh
# Pre-commit hook: Run linting and tests

echo "🔍 Running pre-commit checks..."

# Run linting
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Please fix errors before committing."
    exit 1
fi

# Run tests
npm run test
if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix tests before committing."
    exit 1
fi

echo "✅ Pre-commit checks passed!"
EOF
        chmod +x "$PRE_COMMIT_HOOK"
        echo "✅ Pre-commit hook installed"
    else
        echo "✅ Pre-commit hook already exists"
    fi
}

# Function to setup VS Code settings
setup_vscode() {
    echo "⚙️  Setting up VS Code configuration..."
    
    mkdir -p .vscode
    
    # VS Code settings
    cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
EOF

    # VS Code extensions recommendations
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "vitest.explorer",
    "ms-vscode.vscode-json"
  ]
}
EOF

    echo "✅ VS Code configuration created"
}

# Main setup function
main() {
    echo "🎯 Which setup would you like to run?"
    echo "1) Full setup (recommended)"
    echo "2) Fish shell VS Code integration only"
    echo "3) Node.js environment only"
    echo "4) Git hooks only"
    echo "5) VS Code settings only"
    echo ""
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            setup_nodejs
            setup_fish_vscode
            setup_git_hooks
            setup_vscode
            ;;
        2)
            setup_fish_vscode
            ;;
        3)
            setup_nodejs
            ;;
        4)
            setup_git_hooks
            ;;
        5)
            setup_vscode
            ;;
        *)
            echo "❌ Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
    
    echo ""
    echo "🎉 Setup complete! You're ready to start developing."
    echo ""
    echo "Next steps:"
    echo "1. Run 'npm run dev' to start the development server"
    echo "2. Open http://localhost:8080 in your browser"
    echo "3. Start coding! 🚀"
}

# Run main function
main "$@"