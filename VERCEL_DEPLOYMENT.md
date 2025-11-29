# Deploying Receipt Manager to Vercel

This guide will help you deploy the Receipt Manager application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works fine)
2. [Vercel CLI](https://vercel.com/docs/cli) installed (optional but recommended)
3. Git installed on your system

## Deployment Steps

### 1. Initialize Git Repository

```bash
cd "/Volumes/Transcend/Restaurant receipt manager"
git init
git add .
git commit -m "Initial commit - Receipt Manager"
```

### 2. Deploy to Vercel

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? `receipt-manager` (or your choice)
- In which directory is your code located? `./`
- Want to override settings? **N**

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. If you haven't pushed to GitHub yet:
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git remote add origin YOUR_GITHUB_REPO_URL
     git branch -M main
     git push -u origin main
     ```
4. Import the repository in Vercel
5. Click "Deploy"

### 3. Update Google OAuth Settings

After deployment, Vercel will give you a URL like `https://receipt-manager-xyz.vercel.app`

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **Authorized JavaScript origins**, add:
   - `https://your-vercel-url.vercel.app`
5. Click **Save**
6. Wait 1-2 minutes for changes to propagate

### 4. Test Your Deployment

1. Visit your Vercel URL
2. Click "Sign in with Google"
3. Verify that you can:
   - Log in successfully
   - Add receipts
   - Upload images
   - Manage suppliers

## Troubleshooting

### Google Sign-In Not Working

- Ensure your Vercel URL is added to **Authorized JavaScript origins** in Google Cloud Console
- Wait a few minutes after adding the URL for changes to take effect
- Check browser console for errors

### Images Not Uploading

- Verify `DRIVE_FOLDER_ID` in `config.js` is correct
- Check that the Google Apps Script has permissions to access the Drive folder

### Backend Errors

- Ensure your Apps Script is deployed and the `SCRIPT_URL` in `config.js` is correct
- Check the Apps Script execution logs for errors

## Continuous Deployment

Vercel automatically redeploys when you push to your Git repository:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push
```

Vercel will automatically build and deploy the new version.

## Custom Domain (Optional)

To use a custom domain:

1. Go to your project in Vercel Dashboard
2. Click **Settings** > **Domains**
3. Add your custom domain
4. Update DNS records as instructed
5. Add the custom domain to Google OAuth authorized origins
