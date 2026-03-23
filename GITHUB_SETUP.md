# Upload to GitHub - Step by Step Guide

## Prerequisites
- Git installed on your computer
- GitHub account created at https://github.com

## Step 1: Initialize Git Repository

Open your terminal/command prompt and navigate to the project folder:

```bash
cd KIRO/public-holidays
git init
git add .
git commit -m "Initial commit: European Public Holidays app with school holidays and bridge day suggestions"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in the details:
   - **Repository name**: `vacation-planner`
   - **Description**: `Plan your perfect vacation with European public holidays, school holidays, and smart bridge day suggestions`
   - **Visibility**: Choose Public (recommended) or Private
   - **DO NOT** check "Initialize this repository with a README" (we already have one)
3. Click **"Create repository"**

## Step 3: Connect and Push to GitHub

After creating the repository, GitHub will show you commands. Use these (replace YOUR_USERNAME with your actual GitHub username):

```bash
git remote add origin https://github.com/YOUR_USERNAME/vacation-planner.git
git branch -M main
git push -u origin main
```

If prompted for credentials:
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your password)
  - Create token at: https://github.com/settings/tokens
  - Select scopes: `repo` (full control of private repositories)

## Step 4: Enable GitHub Pages (Free Hosting)

To make your app live on the internet:

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**:
   - Branch: Select `main`
   - Folder: Select `/ (root)`
5. Click **"Save"**
6. Wait 1-2 minutes
7. Your app will be live at: `https://YOUR_USERNAME.github.io/vacation-planner/`

## Step 5: Update Repository (After Making Changes)

Whenever you make changes to your code:

```bash
git add .
git commit -m "Description of your changes"
git push
```

## Alternative: Using GitHub Desktop (GUI Method)

If you prefer a graphical interface:

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. Click **"File"** → **"Add Local Repository"**
4. Browse to `KIRO/public-holidays` folder
5. Click **"Publish repository"**
6. Choose name and visibility
7. Click **"Publish Repository"**

## Troubleshooting

### Authentication Issues
If you get authentication errors, use a Personal Access Token:
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name and select `repo` scope
4. Copy the token
5. Use it as your password when pushing

### Permission Denied
Make sure you're the owner of the repository or have write access.

### Remote Already Exists
If you get "remote origin already exists":
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/vacation-planner.git
```

## What Gets Uploaded

All files in the project:
- index.html
- app.js
- style.css
- README.md
- FEATURES.md
- DEPLOY.md
- .gitignore

## Next Steps

After uploading:
1. Add a nice description to your repository
2. Add topics/tags: `javascript`, `holidays`, `calendar`, `europe`, `vacation-planner`, `travel`
3. Share your live GitHub Pages URL
4. Consider adding a screenshot to README.md

## Need Help?

- GitHub Docs: https://docs.github.com/
- Git Tutorial: https://git-scm.com/docs/gittutorial
- GitHub Pages: https://pages.github.com/
