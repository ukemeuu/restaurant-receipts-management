// ===================================
// CONFIGURATION FILE
// ===================================

const CONFIG = {
    // Google Apps Script Web App URL
    // UPDATE THIS after deploying your Apps Script
    SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwMgNSnk9Rxst9XoxqxMu5CHGqvISNd3s3n2HxkzFftgUoga9_i-2_EtztIe4tVJCUy/exec',

    // Google OAuth Client ID
    // Get this from Google Cloud Console
    GOOGLE_CLIENT_ID: '459372830944-5nf9n55pg4c6v4eauvocva2r4nn8e7h2.apps.googleusercontent.com',

    // Google Drive Folder ID for receipts
    // This should match the folder ID in Code.gs
    DRIVE_FOLDER_ID: '1OGfKyOA3_CVkZK1wgeUZgkL_TlvOF3Ls',

    // Application settings
    APP_NAME: 'Receipt Manager',
    RESTAURANT_NAME: 'Pot of Jollof',

    // Feature flags
    FEATURES: {
        MULTI_RESTAURANT: false, // Enable when ready to scale
        EMAIL_NOTIFICATIONS: false, // Future feature
        EXPORT_DATA: true
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
