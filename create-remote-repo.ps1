# PowerShell script to create a GitHub repo and push the current folder
# Usage: open PowerShell in the project root and run:
#   .\create-remote-repo.ps1
# This script uses the GitHub CLI (gh). Install it if you don't have it: https://cli.github.com/
# It will attempt to create a repository named "content managmer invoice" and push the current branch.

$repoName = "content managmer invoice"
$visibility = "public"  # change to "private" if you prefer

Write-Host "Checking for gh (GitHub CLI)..."
$gh = Get-Command gh -ErrorAction SilentlyContinue
if (-not $gh) {
    Write-Host "gh (GitHub CLI) not found. Install it from https://cli.github.com/ and authenticate (gh auth login)."
    exit 1
}

# Verify gh auth
Write-Host "Checking gh authentication status..."
$auth = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "You are not authenticated with gh. Run 'gh auth login' and re-run this script."
    exit 1
}

# Create repo and push
Write-Host "Creating GitHub repository: $repoName"
# Use --confirm to skip interactive prompts where possible
$createCmd = "gh repo create --public --source=. --remote origin --push --confirm '$repoName'"
Write-Host "Running: $createCmd"
# Execute command
Invoke-Expression $createCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Repository created and pushed. Remote 'origin' is set to the new GitHub repo."
} else {
    Write-Host "gh command failed with exit code $LASTEXITCODE. See output above for details."
}
