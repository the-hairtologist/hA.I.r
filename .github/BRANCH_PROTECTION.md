# Branch Protection Setup Guide

This guide walks you through setting up branch protection rules for your repository to ensure code quality and prevent accidental deletions.

## 🛡️ Why Branch Protection?

Branch protection prevents:
- Direct pushes to main branch (requires PRs)
- Merging failing CI checks
- Accidental branch deletion
- Merging without code review

## 📋 Setup Instructions

### 1. Navigate to Branch Protection Settings

1. Go to your GitHub repository
2. Click **Settings** tab
3. Click **Branches** in the left sidebar
4. Under "Branch protection rules", click **Add rule**

### 2. Configure Protection Rule for `main` Branch

#### Rule Name
- **Branch name pattern**: `main`

#### Protect Matching Branches

**✅ Require a pull request before merging**
- Check: "Require approvals" (set to 1 approval minimum)
- Check: "Dismiss stale pull request approvals when new commits are pushed"
- Check: "Require review from Code Owners" (optional, good for teams)

**✅ Require status checks to pass before merging**
- Check: "Require branches to be up to date before merging"
- Search and select these required status checks:
  - `Lint & Type Check`
  - `Build`
  - `Smoke Tests`
  - `Security Scan`

**✅ Require conversation resolution before merging**
- Ensures all PR comments are addressed

**✅ Require signed commits** (optional but recommended)
- Verifies commit authenticity

**✅ Require linear history** (optional)
- Prevents merge commits, keeps history clean

**✅ Include administrators**
- Even admins must follow these rules (recommended)

**✅ Restrict who can push to matching branches** (optional)
- For teams: specify which users/teams can push

**✅ Allow force pushes** - LEAVE UNCHECKED ❌
- Never allow force pushes to main

**✅ Allow deletions** - LEAVE UNCHECKED ❌
- Prevent accidental branch deletion

### 3. Additional Recommended Settings

#### For `develop` branch (if using)
Create a similar rule for `develop` with slightly relaxed requirements:
- Require 1 approval
- Require passing CI checks
- Allow more flexibility for active development

#### For feature branches
- No protection needed
- Developers can work freely
- Protection applies when merging to main/develop

## 🚀 Recommended Workflow After Setup

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and push**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/your-feature
   ```

3. **Create Pull Request**
   - Go to GitHub
   - Click "Compare & pull request"
   - Fill out PR template
   - Assign reviewers

4. **Wait for CI Checks**
   - All checks must pass (green ✅)
   - Address any failing tests or linting issues

5. **Request Review**
   - At least 1 approval required
   - Address review comments
   - Resolve all conversations

6. **Merge**
   - Once approved and checks pass
   - Use "Squash and merge" (recommended)
   - Delete feature branch after merge

## 📊 Current CI Checks

Your repository has these automated checks:

### Fast CI Pipeline (ci-fast.yml)
- **Triggers**: Push to main/develop, all PRs
- **Duration**: ~3 minutes
- **Checks**:
  - Lint & Type Check
  - Build
  - Smoke Tests (auth, home)
  - Security Scan

### Deep Tests (deep-tests.yml)
- **Triggers**: PRs to main/develop, daily schedule
- **Duration**: ~20-30 minutes
- **Checks**:
  - Comprehensive E2E tests
  - Accessibility tests
  - Mobile device tests
  - Tablet/desktop tests

### Performance Analysis (performance-analysis.yml)
- **Triggers**: Weekly, manual
- **Duration**: ~10-15 minutes
- **Checks**:
  - Load time metrics
  - Bundle size analysis
  - Core Web Vitals

### Security Scan (security-scan.yml)
- **Triggers**: Weekly, manual
- **Duration**: ~5 minutes
- **Checks**:
  - Dependency vulnerabilities
  - Security best practices
  - License compliance

## 🎯 What Happens Now?

### ✅ Protected Workflow
```
Developer → Feature Branch → Push → Create PR → CI Runs → Review → Approve → Merge to Main
```

### ❌ Blocked Actions
- Direct push to main (must use PR)
- Merge with failing tests
- Merge without approval
- Force push to main
- Delete main branch

## 🔧 Troubleshooting

### "Required status check is not running"
- Check that workflow file references match exactly
- Ensure workflows are triggered on PR events
- Verify workflow names in .yml files

### "Cannot merge - reviews required"
- Request review from a collaborator
- Or temporarily adjust rule if you're solo developer

### "CI checks failing"
- Review CI logs in Actions tab
- Fix issues locally and push again
- All checks must be green to merge

## 👥 Team Recommendations

For teams of 2+ developers:
- Require 2 approvals for critical changes
- Add CODEOWNERS for automatic review assignment
- Enable "Require review from Code Owners"
- Set up team-based permissions

For solo developers:
- Can relax approval requirements
- Keep CI checks required
- Still use PRs for better history

## 📚 Additional Resources

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Required Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

✅ Once you complete these steps, your `main` branch is fully protected!
