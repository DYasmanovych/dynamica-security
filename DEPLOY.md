# Dynamica Security — Deployment with Claude Code

## Step-by-step prompt for Claude Code

Copy and paste this into Claude Code (terminal):

---

### 1. Create the project folder and initialize git

```bash
mkdir dynamica-security && cd dynamica-security
git init
```

### 2. Copy the files

Copy all files from the `dynamica-deploy` folder into this directory:
- `index.html` (the landing page)
- `package.json`
- `vercel.json`
- `.gitignore`
- `README.md`

### 3. Create GitHub repository and push

```bash
# Stage and commit
git add -A
git commit -m "Initial commit: Dynamica Security landing page"

# Create GitHub repo (requires GitHub CLI)
gh repo create dynamica-security --public --source=. --remote=origin --push

# Or manually:
# git remote add origin https://github.com/YOUR_USERNAME/dynamica-security.git
# git branch -M main
# git push -u origin main
```

### 4. Deploy to Vercel

```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Deploy (follow prompts — select the current directory, no framework, no build command)
vercel --prod
```

---

## Claude Code one-shot prompt

You can also paste this as a single prompt into Claude Code:

```
Create a new git repo called "dynamica-security" in the current directory. 
Initialize it, add all files, commit with message "Initial commit: Dynamica Security landing page". 
Then create a public GitHub repository called "dynamica-security" using `gh repo create` and push to it. 
Finally, deploy to Vercel using `vercel --prod`. 
The project is a static HTML site — no build step, no framework. 
The vercel.json and package.json are already configured.
```

---

## After deployment

Vercel will give you a URL like: `https://dynamica-security.vercel.app`

You can add a custom domain in Vercel Dashboard → Settings → Domains.
