This project: prepare and upload to a new GitHub repository named "content managmer invoice".

Files added:
- `create-remote-repo.ps1` — PowerShell script that uses the GitHub CLI (gh) to create a repo named "content managmer invoice" and push the current folder as the repository. It will set the remote `origin` and push the current branch.

Manual steps (if you prefer to do it yourself):

1) Ensure you have Git and GitHub CLI installed and authenticated.
   - Git: https://git-scm.com/
   - GitHub CLI: https://cli.github.com/ (then run `gh auth login`)

2) From the project root in PowerShell, confirm the branch you want to push (example uses `main`):

   git status
   git branch --show-current

3) If this project is not yet a git repo, initialize and commit:

   git init
   git add .
   git commit -m "Initial commit for content managmer invoice"

4) Create the remote repo and push (replace <your-github-user>):

   # Using gh (recommended)
   gh repo create "content managmer invoice" --public --source=. --remote origin --push

   # Or manually using the web and then push
   # - Create a new repo named `content managmer invoice` on GitHub
   # - Then run:
   git remote add origin https://github.com/<your-github-user>/content-managmer-invoice.git
   git push -u origin main

Notes:
- The PowerShell script will fail early if `gh` is not installed or if you are not authenticated.
- The repo name in the web/manual steps is normalized to `content-managmer-invoice` for URL compatibility; the gh command supports the display name with spaces but GitHub will typically convert it into a URL-friendly name.

If you want, I can:
- Run the script here (requires your gh authentication/credentials) and create the remote for you.
- Or create the repository on GitHub for you if you provide a personal access token with repo creation permissions.

Tell me which you want me to do next.