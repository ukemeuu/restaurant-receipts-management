// ===================================
// AUTHENTICATION MODULE
// ===================================

class Auth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    // Initialize Google Sign-In
    initGoogleAuth() {
        // Load Google Identity Services
        google.accounts.id.initialize({
            client_id: CONFIG.GOOGLE_CLIENT_ID,
            callback: this.handleCredentialResponse.bind(this)
        });

        // Render sign-in button
        google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
                theme: 'filled_black',
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular'
            }
        );

        // Also show One Tap prompt
        google.accounts.id.prompt();
    }

    // Handle Google Sign-In response
    async handleCredentialResponse(response) {
        try {
            // Decode JWT token
            const userInfo = this.parseJwt(response.credential);

            // Try to login with backend
            const result = await api.login(userInfo.email);

            if (result.user) {
                this.setUser(result.user);
                this.showApp();
            } else {
                this.showError('User not found. Please contact administrator.');
            }
        } catch (error) {
            console.error('Login failed:', error);
            this.showError('Login failed. Please try again.');
        }
    }

    // Parse JWT token
    parseJwt(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    }

    // Set current user
    setUser(user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        api.setUserEmail(user.email);

        // Store in session
        sessionStorage.setItem('currentUser', JSON.stringify(user));

        // Update UI
        this.updateUIForRole();
    }

    // Get current user
    getUser() {
        if (!this.currentUser) {
            const stored = sessionStorage.getItem('currentUser');
            if (stored) {
                this.currentUser = JSON.parse(stored);
                this.isAuthenticated = true;
                api.setUserEmail(this.currentUser.email);
            }
        }
        return this.currentUser;
    }

    // Check if user has permission
    hasPermission(action) {
        if (!this.currentUser) return false;

        const role = this.currentUser.role;

        const permissions = {
            'Management': ['all'],
            'Operations Lead': ['view_all_receipts', 'add_receipt', 'edit_receipt', 'delete_receipt', 'manage_suppliers', 'view_analytics'],
            'Store Manager': ['view_own_receipts', 'add_receipt', 'edit_own_receipt', 'view_suppliers']
        };

        const userPermissions = permissions[role] || [];

        if (userPermissions.includes('all')) return true;
        return userPermissions.includes(action);
    }

    // Update UI based on role
    updateUIForRole() {
        const role = this.currentUser.role;

        // Show/hide user management (Management only)
        const userManagementBtn = document.getElementById('user-management-btn');
        if (userManagementBtn) {
            userManagementBtn.style.display = role === 'Management' ? 'inline-flex' : 'none';
        }

        // Update welcome message
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.name;
        }

        const userRoleElement = document.getElementById('user-role');
        if (userRoleElement) {
            userRoleElement.textContent = role;
        }

        // Add role badge
        this.addRoleBadge(role);
    }

    // Add role badge to UI
    addRoleBadge(role) {
        const badge = document.createElement('span');
        badge.className = 'role-badge';
        badge.textContent = role;

        if (role === 'Management') {
            badge.style.background = 'var(--gradient-primary)';
        } else if (role === 'Operations Lead') {
            badge.style.background = 'var(--gradient-secondary)';
        } else {
            badge.style.background = 'var(--gradient-accent)';
        }

        const header = document.querySelector('.logo-text');
        if (header && !document.querySelector('.role-badge')) {
            header.appendChild(badge);
        }
    }

    // Show app (hide login)
    showApp() {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('app-view').classList.remove('hidden');

        // Load initial data
        if (window.loadAppData) {
            window.loadAppData();
        }
    }

    // Show login (hide app)
    showLogin() {
        document.getElementById('login-view').classList.remove('hidden');
        document.getElementById('app-view').classList.add('hidden');
    }

    // Logout
    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        sessionStorage.removeItem('currentUser');

        // Sign out from Google
        google.accounts.id.disableAutoSelect();

        this.showLogin();
    }

    // Show error message
    showError(message) {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';

            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Check if user is logged in on page load
    checkAuth() {
        const user = this.getUser();
        if (user) {
            this.showApp();
        } else {
            this.showLogin();
        }
    }
}

// Create global auth instance
const auth = new Auth();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Auth;
}
