# 🚀 Deployment Guide - Receipt Manager Backend

## Overview

This guide will walk you through deploying the Receipt Manager backend using Google Apps Script, Google Sheets, and Google Drive.

## Prerequisites

- Google Account
- Access to Google Drive
- Access to Google Sheets
- Access to Google Cloud Console (for OAuth)

---

## Step 1: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder named **"Pot of Jollof Receipts"**
3. Open the folder and copy the **Folder ID** from the URL
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - Example: If URL is `https://drive.google.com/drive/folders/1ABC123xyz`, the ID is `1ABC123xyz`
4. **Save this ID** - you'll need it later

---

## Step 2: Create Google Sheet Database

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named **"Receipt Manager DB"**
3. The script will automatically create these sheets when first run:
   - Users
   - Receipts
   - Suppliers
   - ActivityLog

---

## Step 3: Set Up Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any existing code in `Code.gs`
3. Copy the entire contents of `backend/Code.gs` and paste it
4. Update the `DRIVE_FOLDER_ID` in the CONFIG object:
   ```javascript
   const CONFIG = {
     DRIVE_FOLDER_ID: 'YOUR_FOLDER_ID_HERE', // Paste your folder ID
     ...
   };
   ```
5. Click **Save** (💾 icon)
6. Name your project: **"Receipt Manager Backend"**

---

## Step 4: Deploy as Web App

1. In Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Description**: "Receipt Manager API"
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
5. Click **Deploy**
6. **Authorize** the app when prompted
   - Click "Review Permissions"
   - Choose your Google account
   - Click "Advanced" → "Go to Receipt Manager Backend (unsafe)"
   - Click "Allow"
7. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/ABC123.../exec
   ```
8. **Save this URL** - you'll need it in the frontend

---

## Step 5: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google Identity Services**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google Identity"
   - Enable it
4. Create OAuth 2.0 Client ID:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Name: "Receipt Manager"
   - **Authorized JavaScript origins**:
     - `http://localhost` (for local testing)
     - `file://` (for local file testing)
     - Add your domain if hosting online
   - **Authorized redirect URIs**: (leave empty for now)
   - Click **Create**
5. **Copy the Client ID** - it will look like:
   ```
   123456789-abc123xyz.apps.googleusercontent.com
   ```
6. **Save this Client ID** - you'll need it in the frontend

---

## Step 6: Configure Frontend

1. Open `config.js` in your project
2. Update the configuration:
   ```javascript
   const CONFIG = {
     SCRIPT_URL: 'YOUR_APPS_SCRIPT_URL_HERE', // From Step 4
     GOOGLE_CLIENT_ID: 'YOUR_GOOGLE_CLIENT_ID_HERE', // From Step 5
     DRIVE_FOLDER_ID: 'YOUR_DRIVE_FOLDER_ID_HERE', // From Step 1
     ...
   };
   ```
3. Save the file

---

## Step 7: Create First Admin User

Since you need to be logged in to create users, we'll create the first admin manually:

1. Go to your Google Sheet "Receipt Manager DB"
2. Click on the **Users** sheet (it will be created automatically on first API call)
3. If the sheet doesn't exist, create it with these headers:
   ```
   userId | email | name | role | createdAt | lastLogin | active
   ```
4. Add your admin user manually:
   - **userId**: Generate a random ID (e.g., `admin-001`)
   - **email**: Your Google account email
   - **name**: Your name
   - **role**: `Management`
   - **createdAt**: Current date/time
   - **lastLogin**: (leave empty)
   - **active**: `TRUE`

Example row:
```
admin-001 | yourname@gmail.com | Your Name | Management | 2025-11-29T16:00:00 | | TRUE
```

---

## Step 8: Test the Application

1. Open `index.html` in your browser
2. You should see the login page
3. Click "Sign in with Google"
4. Sign in with the email you added in Step 7
5. You should be redirected to the dashboard

---

## Step 9: Add More Users (Optional)

Now that you're logged in as Management:

1. Click the **"Users"** navigation button (visible only to Management)
2. Click **"Add User"**
3. Fill in the details:
   - Email (must be a Google account)
   - Name
   - Role (Management, Operations Lead, or Store Manager)
4. Click **Save**
5. The new user can now log in with their Google account

---

## Troubleshooting

### "Unauthorized user" error
- Make sure you added your email to the Users sheet in Step 7
- Check that the email matches exactly (including case)
- Verify the `active` column is set to `TRUE`

### "Script not found" error
- Verify the SCRIPT_URL in `config.js` is correct
- Make sure you deployed the Apps Script as a Web App
- Check that "Who has access" is set to "Anyone"

### Google Sign-In not working
- Verify GOOGLE_CLIENT_ID in `config.js` is correct
- Check that you enabled Google Identity Services in Cloud Console
- Make sure authorized origins include your testing domain

### Images not uploading
- Verify DRIVE_FOLDER_ID in both `Code.gs` and `config.js`
- Check folder permissions (should be accessible by your account)
- Ensure the Apps Script has Drive permissions

---

## Security Notes

🔒 **Important Security Considerations:**

1. **Production Deployment**: 
   - Change "Who has access" to "Only myself" in Apps Script deployment
   - Implement proper authentication tokens
   - Add your production domain to authorized origins

2. **Data Privacy**:
   - All receipt images are stored in your private Google Drive
   - Only authorized users can access the data
   - Activity log tracks all actions

3. **User Management**:
   - Only Management role can create/edit/delete users
   - Regularly review active users
   - Deactivate users who no longer need access

---

## Next Steps

✅ Backend deployed and running
✅ First admin user created
✅ Application tested

**Ready to use!** You can now:
- Add more users
- Start uploading receipts
- Manage suppliers
- View analytics

---

## Support

If you encounter any issues:
1. Check the Apps Script logs: **Executions** tab in Apps Script editor
2. Check browser console for frontend errors
3. Verify all configuration values are correct
4. Ensure all Google services are enabled

---

## Future Enhancements

When ready to scale:
- Enable multi-restaurant support in `config.js`
- Add email notifications
- Implement data export features
- Deploy to a web server for better performance
