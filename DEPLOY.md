# How to Publish to GitHub

Follow these steps to publish this app to GitHub:

## Step 1: Initialize Git Repository

```bash
cd KIRO/public-holidays
git init
git add .
git commit -m "Initial commit: European Public Holidays app"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `european-public-holidays` (or your preferred name)
3. Description: "View public holidays from all European countries with interactive calendar"
4. Choose Public or Private
5. Do NOT initialize with README (we already have one)
6. Click "Create repository"

## Step 3: Push to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/european-public-holidays.git
git branch -M main
git push -u origin main
```

## Step 4: Enable GitHub Pages (Optional)

To host the app for free on GitHub Pages:

1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll to "Pages" section
4. Under "Source", select "main" branch
5. Click "Save"
6. Your app will be live at: `https://YOUR_USERNAME.github.io/european-public-holidays/`

## Alternative: Using GitHub Desktop

If you prefer a GUI:

1. Download GitHub Desktop from https://desktop.github.com/
2. Open GitHub Desktop
3. File → Add Local Repository → Select the `public-holidays` folder
4. Click "Publish repository"
5. Choose repository name and visibility
6. Click "Publish Repository"

## Updating Your Repository

After making changes:

```bash
git add .
git commit -m "Description of your changes"
git push
```

## Need Help?

- GitHub Docs: https://docs.github.com/
- Git Basics: https://git-scm.com/book/en/v2/Getting-Started-Git-Basics
