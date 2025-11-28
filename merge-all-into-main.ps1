# Merge multiple remote branches into main in order, with optional remote deletion
# Usage:
#   .\merge-all-into-main.ps1 [-DeleteRemote]
# By default, remote branches are NOT deleted after merging. Use -DeleteRemote to remove them.

param(
    [switch]$DeleteRemote
)

$ErrorActionPreference = 'Stop'

function Ensure-CleanWorkingTree {
    $status = git status --porcelain
    if ($status) {
        Write-Host "Working tree is not clean. Commit or stash changes before running." -ForegroundColor Red
        exit 1
    }
}

Ensure-CleanWorkingTree

Write-Host "Fetching origin..." -ForegroundColor Cyan
& git fetch origin --prune

Write-Host "Switching to main..." -ForegroundColor Cyan
& git checkout main
& git pull origin main

$TS = (Get-Date).ToUniversalTime().ToString('yyyyMMddTHHmmssZ')

# Recommended merge order (adjust as needed)
$branches = @(
    "copilot/add-ci-workflows-and-documentation",
    "auto-fix/automated-fixes-20251103-034128",
    "auto-fix/automated-fixes-20251103-041231",
    "auto-fix/automated-fixes-20251103-041235",
    "auto-fix/automated-fixes-20251103-171549",
    "auto-fix/automated-fixes-20251128-181734",
    "copilot/remove-duplicate-constant-declarations",
    "copilot/improve-bundle-and-setup",
    "copilot/improve-repo-walkthrough-suggestions",
    "copilot/organize-github-repository",
    "copilot/repo-cleanupci-and-env-mobile",
    "copilot/repo-cleanupci-and-env-mobile-again",
    "copilot/fix-error-handling-in-main",
    "copilot/fix-undefined-variable-issue",
    "copilot/fix-235234037-1068842937-7fbc449a-e002-4c15-9d9f-7ed10f72bc28",
    "copilot/fix-235234037-1068842937-8fcdcea7-ca04-4403-aef2-d4ceb2718b01",
    "copilot/add-flutter-app-integration",
    "copilot/squash-commit-for-pr-132",
    "copilot/sub-pr-118",
    "copilot/sub-pr-120",
    "copilot/sub-pr-120-again",
    "copilot/sub-pr-120-another-one",
    "copilot/sub-pr-120-yet-again",
    "copilot/sub-pr-132-56f932eb-ba6e-4b19-bf75-d59bec5de4e8",
    "copilot/sub-pr-132-65ec3dca-8584-4e6c-a304-1d5cd26ec86c",
    "copilot/sub-pr-132-87b4bce3-aef6-4385-a72c-7e3f72652d7c",
    "copilot/sub-pr-132-4815af59-765d-4528-975e-70ee3debf37a",
    "copilot/sub-pr-132-5254d9f6-c6c4-4b74-844c-60c6a2e06814",
    "copilot/sub-pr-132-a16e43bb-457f-473a-89c0-9fbe24b1442b"
)

foreach ($branch in $branches) {
    Write-Host "\n=== Processing remote branch origin/$branch ===" -ForegroundColor Yellow
    $exists = git ls-remote --exit-code --heads origin $branch 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Found origin/$branch." -ForegroundColor Green
        $tag = "backup/$branch/$TS"
        Write-Host "Creating backup tag $tag -> origin/$branch" -ForegroundColor Cyan
        git tag -f $tag origin/$branch
        git push origin "refs/tags/$tag"

        git checkout main
        git pull origin main

        Write-Host "Attempting non-fast-forward merge of origin/$branch..." -ForegroundColor Cyan
        git merge --no-ff --no-commit origin/$branch
        if ($LASTEXITCODE -eq 0) {
            git commit -m "chore: merge $branch into main"
            git push origin main
            Write-Host "Merged origin/$branch into main and pushed." -ForegroundColor Green
            if ($DeleteRemote) {
                Write-Host "Deleting remote branch origin/$branch..." -ForegroundColor Magenta
                git push origin --delete $branch
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "Warning: failed to delete origin/$branch" -ForegroundColor Red
                }
            } else {
                Write-Host "Remote branch origin/$branch kept (no-delete mode)." -ForegroundColor Cyan
            }
            if (git show-ref --quiet refs/heads/$branch) {
                git branch -d $branch
                if ($LASTEXITCODE -ne 0) {
                    Write-Host "Note: could not delete local branch $branch" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "Merge conflict detected while merging origin/$branch. Aborting merge." -ForegroundColor Red
            git merge --abort
            Write-Host "Resolve conflicts for $branch manually, then re-run script or merge separately." -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "Remote branch origin/$branch does not exist; skipping." -ForegroundColor Gray
    }
}

Write-Host "\nDone. All listed branches processed (or skipped if they didn't exist)." -ForegroundColor Green
