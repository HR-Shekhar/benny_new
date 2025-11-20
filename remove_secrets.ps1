# Script to remove chabot_2/.env from git history
# This uses git filter-branch with proper Windows handling

$env:FILTER_BRANCH_SQUELCH_WARNING=1

# Remove the file from all commits
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch chabot_2/.env' --prune-empty --tag-name-filter cat -- --all

# Clean up backup refs
git for-each-ref --format="%(refname)" refs/original/ | ForEach-Object { git update-ref -d $_ }

# Force garbage collection
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "Secrets removed from git history. You can now force push with: git push origin --force --all"


