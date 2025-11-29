# 🧾 Receipt Manager - Pot of Jollof

A modern, cloud-powered receipt management system with role-based access control, Google Drive integration, and real-time analytics.

## ✨ Features

### Core Functionality
- 📸 **Receipt Capture** - Upload photos via camera or file picker
- 👥 **Supplier Management** - Organize suppliers by category
- 💰 **Spending Analytics** - Track expenses and identify top suppliers
- 🔍 **Smart Search** - Find receipts instantly by supplier, date, or receipt number
- 📊 **Dashboard** - Real-time statistics and insights

### User Management & Security
- 🔐 **Google OAuth Login** - Secure authentication
- 👑 **Role-Based Access Control** - Three user roles with different permissions:
  - **Management** (Admin) - Full access to all features
  - **Operations Lead** - Manage receipts and suppliers, view analytics
  - **Store Manager** - Add receipts, view own receipts only
- 👤 **User Management** - Create and manage user accounts (Management only)

### Cloud Integration
- ☁️ **Google Drive Storage** - Receipt images stored securely in Google Drive
- 📊 **Google Sheets Database** - Structured data storage
- 🔄 **Real-time Sync** - All changes saved instantly
- 📱 **Access Anywhere** - Works on any device with a browser

## 🏗️ Architecture

### Frontend
- **HTML/CSS/JavaScript** - Modern, responsive web application
- **Google Identity Services** - OAuth 2.0 authentication
- **LocalStorage** - Session management

### Backend
- **Google Apps Script** - Serverless backend (FREE)
- **Google Sheets** - Database with 4 sheets:
  - Users
  - Receipts
  - Suppliers
  - Activity Log
- **Google Drive** - Image storage with organized folder structure

## 📁 Project Structure

```
Restaurant receipt manager/
├── index.html              # Main application
├── styles.css              # Complete design system
├── app.js                  # Application logic
├── api.js                  # API client for backend
├── auth.js                 # Authentication module
├── config.js               # Configuration (UPDATE THIS)
├── DEPLOYMENT_GUIDE.md     # Step-by-step deployment instructions
├── README.md               # This file
└── backend/
    └── Code.gs             # Google Apps Script backend
```

## 🚀 Quick Start

### Prerequisites
- Google Account
- Modern web browser
- Text editor (for configuration)

### Setup Steps

1. **Clone or Download** this project

2. **Follow the Deployment Guide**
   - See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions
   - Steps include:
     - Create Google Drive folder
     - Create Google Sheets database
     - Deploy Google Apps Script
     - Set up Google OAuth
     - Configure frontend

3. **Update Configuration**
   - Open `config.js`
   - Add your Google Apps Script URL
   - Add your Google OAuth Client ID
   - Add your Google Drive Folder ID

4. **Create First Admin User**
   - Manually add your email to the Users sheet
   - Set role to "Management"

5. **Open Application**
   - Open `index.html` in your browser
   - Sign in with Google
   - Start managing receipts!

## 👥 User Roles & Permissions

| Feature | Management | Operations Lead | Store Manager |
|---------|-----------|----------------|---------------|
| **User Management** | ✅ Full | ❌ No | ❌ No |
| **Add Receipts** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Edit Receipts** | ✅ All | ✅ All | ⚠️ Own only |
| **Delete Receipts** | ✅ All | ✅ All | ❌ No |
| **View Receipts** | ✅ All | ✅ All | ⚠️ Own only |
| **Supplier Management** | ✅ Full | ✅ Full | ⚠️ View only |
| **Analytics Dashboard** | ✅ Full | ✅ Full | ⚠️ Limited |

## 🎨 Design Features

- **Modern Dark Theme** - Professional and easy on the eyes
- **Glassmorphism Effects** - Beautiful frosted glass UI elements
- **Smooth Animations** - Polished micro-interactions
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Custom Gradients** - Vibrant color scheme
- **Google Fonts** - Inter font family for clean typography

## 💾 Data Storage

### Google Sheets Database Schema

**Users Sheet:**
- userId, email, name, role, createdAt, lastLogin, active

**Receipts Sheet:**
- receiptId, receiptNumber, supplier, amount, date, notes, imageUrl, uploadedBy, createdAt, restaurant

**Suppliers Sheet:**
- supplierId, name, category, contact, createdBy, createdAt

**Activity Log:**
- logId, userId, action, entityType, entityId, timestamp, details

### Google Drive Structure
```
Pot of Jollof Receipts/
  ├── 2025/
  │   ├── January/
  │   ├── February/
  │   └── ...
  └── 2024/
      └── ...
```

## 🔒 Security

- **Google OAuth** - Industry-standard authentication
- **Role-Based Access** - Granular permission control
- **Activity Logging** - All actions tracked for audit
- **Private Drive Storage** - Images only accessible to authorized users
- **Session Management** - Secure session handling

## 💰 Cost

**Total Cost: $0/month**

- Google Apps Script: FREE
- Google Drive (15GB): FREE
- Google Sheets: FREE
- Google OAuth: FREE

Perfect for small to medium restaurants!

## 🔮 Future Enhancements

When ready to scale:
- [ ] Multi-restaurant support
- [ ] Email notifications
- [ ] Data export (CSV/PDF)
- [ ] Advanced analytics and charts
- [ ] Mobile app (React Native/Flutter)
- [ ] Receipt OCR (automatic data extraction)
- [ ] Budget tracking and alerts

## 📝 Usage Examples

### Adding a Receipt
1. Click "Add Receipt"
2. Upload photo of receipt
3. Type supplier name (autocomplete suggests from list)
4. Enter receipt number, amount, and date
5. Add optional notes
6. Click "Save Receipt"

### Managing Users (Management Only)
1. Click "Users" in navigation
2. Click "Add User"
3. Enter email (must be Google account)
4. Enter name and select role
5. Click "Create User"
6. User can now log in with their Google account

### Viewing Analytics
1. Dashboard shows:
   - Total receipts count
   - Total spending amount
   - Active suppliers count
   - Top 5 suppliers by spending
   - Recent receipts

## 🐛 Troubleshooting

### "Unauthorized user" error
- Verify your email is in the Users sheet
- Check that `active` is set to `TRUE`
- Ensure email matches exactly (case-sensitive)

### Google Sign-In not working
- Verify `GOOGLE_CLIENT_ID` in `config.js`
- Check authorized origins in Google Cloud Console
- Ensure Google Identity Services is enabled

### Images not uploading
- Verify `DRIVE_FOLDER_ID` in both `Code.gs` and `config.js`
- Check folder permissions
- Ensure Apps Script has Drive access

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for more troubleshooting tips.

## 📞 Support

For issues or questions:
1. Check the Deployment Guide
2. Review the troubleshooting section
3. Check Apps Script execution logs
4. Verify all configuration values

## 📄 License

This project is created for Pot of Jollof restaurant. All rights reserved.

## 🙏 Acknowledgments

Built with:
- Google Apps Script
- Google Identity Services
- Google Drive API
- Google Sheets API
- Inter Font Family

---

**Ready to deploy?** Follow the [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) to get started!
