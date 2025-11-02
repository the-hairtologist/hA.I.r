# GitHub Branch Protection Guide
## Recommended Settings for hA.I.r Repository

**Version:** 1.0.0  
**Date:** 2025-11-02

---

## Why Branch Protection?

Branch protection rules prevent:
- ❌ Accidental force pushes that rewrite history
- ❌ Merging broken code into production
- ❌ Bypassing code reviews
- ❌ Deploying untested features

---

## Recommended Settings for `hA.I.r` Branch

### 1. Require Pull Request Reviews

**Setting:** Require a pull request before merging  
**Configuration:**
- ✅ Require approvals: **1 reviewer minimum**
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (if CODEOWNERS file exists)
- ⬜ Require approval of the most recent reviewable push

**Why:** Ensures at least one team member reviews changes before merging.

---

### 2. Require Status Checks

**Setting:** Require status checks to pass before merging  
**Required checks:**
```
- test (CI/CD workflow)
- lint (ESLint checks)
- type-check (TypeScript validation)
- build (Production build verification)
```

**Configuration:**
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings

**Why:** Prevents broken code from reaching production.

---

### 3. Require Conversation Resolution

**Setting:** Require conversation resolution before merging  
**Configuration:**
- ✅ All conversations must be resolved

**Why:** Ensures no unaddressed feedback or questions.

---

### 4. Prevent Force Pushes

**Setting:** Do not allow force pushes  
**Configuration:**
- ✅ Block force pushes to this branch

**Why:** Protects against accidental history rewrites.

---

### 5. Prevent Deletions

**Setting:** Do not allow deletions  
**Configuration:**
- ✅ Block deletions of this branch

**Why:** Safeguards the main development branch.

---

## How to Configure in GitHub

### Step 1: Navigate to Settings
1. Go to your GitHub repository
2. Click **Settings** (top-right)
3. Select **Branches** (left sidebar)

### Step 2: Add Rule
1. Click **Add branch protection rule**
2. Branch name pattern: `hA.I.r`
3. Enable the settings listed above
4. Click **Create** or **Save changes**

---

## Optional Advanced Settings

### Auto-Merge When Ready
**Setting:** Allow auto-merge  
**Use case:** Automatically merge PRs when all checks pass and approvals are met

**How to enable:**
```bash
# In PR description, add:
/merge when checks pass
```

### Linear History
**Setting:** Require linear history  
**Use case:** Enforces squash or rebase merges (no merge commits)

**Configuration:**
- ✅ Require linear history
- Choose merge strategy: **Squash and merge** or **Rebase and merge**

### Signed Commits
**Setting:** Require signed commits  
**Use case:** Verifies commit authenticity via GPG keys

**Configuration:**
- ✅ Require signed commits

---

## Exemptions (Use Sparingly)

### Allow Bypass for Admins
**When:** Emergency hotfixes that need immediate deployment  
**Risk:** Bypasses all protections  
**Recommendation:** ⚠️ Only enable for repository admins, not all maintainers

### Allow Force Pushes for Specific Roles
**When:** Never recommended for `hA.I.r` branch  
**Alternative:** Create feature branches for experimental work

---

## Testing Your Protection Rules

### Scenario 1: Try to Push Directly
```bash
# This should be rejected
git checkout hA.I.r
git commit -m "test: direct push"
git push origin hA.I.r
```

**Expected result:** ❌ Error: "Protected branch update failed"

### Scenario 2: Create PR Without Approval
1. Create feature branch
2. Push changes
3. Open PR to `hA.I.r`
4. Try to merge without approval

**Expected result:** ❌ Merge button disabled until approved

### Scenario 3: Merge With Failing Tests
1. Create PR with intentionally broken code
2. Wait for CI/CD to run
3. Try to merge

**Expected result:** ❌ Merge blocked by failed status checks

---

## Workflow After Enabling Protection

### Standard Development Flow

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Run local checks (pre-push hook)
npm run lint
npm run type-check
npm run test

# 4. Push to GitHub
git push origin feature/new-feature

# 5. Open PR via GitHub UI
# 6. Request review from team member
# 7. Wait for CI/CD checks to pass
# 8. Address review feedback
# 9. Get approval
# 10. Merge via GitHub UI (squash or rebase)
```

---

## Troubleshooting

### Issue: "Can't push to protected branch"
**Cause:** Trying to push directly to `hA.I.r`  
**Fix:** Create a feature branch instead

### Issue: "Status checks failed"
**Cause:** Linting, type errors, or failing tests  
**Fix:**
```bash
npm run lint -- --fix
npm run type-check
npm run test
```

### Issue: "PR blocked by required reviews"
**Cause:** No team member has approved  
**Fix:** Request review from Code Owners or team members

---

## Monitoring & Maintenance

### Weekly Tasks
- [ ] Review open PRs older than 7 days
- [ ] Check for branches with failing CI checks
- [ ] Update protection rules if workflow changes

### Monthly Tasks
- [ ] Audit bypass logs (Settings → Branches → Protection history)
- [ ] Review CODEOWNERS file for accuracy
- [ ] Update required status checks if new workflows added

---

## Resources

- [GitHub Branch Protection Docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Actions Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
- [CODEOWNERS Syntax](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

**Last Updated:** 2025-11-02  
**Maintained By:** hA.I.r Development Team
