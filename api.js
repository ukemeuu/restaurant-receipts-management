// ===================================
// API CLIENT FOR RECEIPT MANAGER
// ===================================

class API {
    constructor(scriptUrl) {
        this.scriptUrl = scriptUrl;
        this.userEmail = null;
    }

    setUserEmail(email) {
        this.userEmail = email;
    }

    async request(action, data = {}) {
        try {
            const payload = {
                action: action,
                data: data,
                userEmail: this.userEmail
            };

            const response = await fetch(this.scriptUrl, {
                method: 'POST',
                mode: 'no-cors', // Required for Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            // Note: no-cors mode doesn't allow reading response
            // We'll need to use a different approach
            return await this.requestWithRedirect(action, data);
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Alternative method using form submission for Apps Script
    async requestWithRedirect(action, data = {}) {
        return new Promise((resolve, reject) => {
            const payload = {
                action: action,
                data: data,
                userEmail: this.userEmail
            };

            // Create hidden iframe for request
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.name = 'api-frame';
            document.body.appendChild(iframe);

            // Create form
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = this.scriptUrl;
            form.target = 'api-frame';

            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'payload';
            input.value = JSON.stringify(payload);
            form.appendChild(input);

            document.body.appendChild(form);
            form.submit();

            // Listen for response
            iframe.onload = () => {
                try {
                    const response = JSON.parse(iframe.contentDocument.body.textContent);
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);

                    if (response.success) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response.message));
                    }
                } catch (error) {
                    document.body.removeChild(form);
                    document.body.removeChild(iframe);
                    reject(error);
                }
            };

            setTimeout(() => {
                document.body.removeChild(form);
                document.body.removeChild(iframe);
                reject(new Error('Request timeout'));
            }, 30000);
        });
    }

    // Simplified fetch for modern browsers with CORS proxy
    async simpleFetch(action, data = {}) {
        const payload = {
            action: action,
            data: data,
            userEmail: this.userEmail
        };

        const response = await fetch(this.scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain', // Use text/plain to avoid preflight
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        return result.data;
    }

    // Authentication
    async login(email) {
        return this.simpleFetch('login', { email });
    }

    async getCurrentUser() {
        return this.simpleFetch('getCurrentUser', {});
    }

    // Users
    async createUser(userData) {
        return this.simpleFetch('createUser', userData);
    }

    async getUsers() {
        return this.simpleFetch('getUsers', {});
    }

    async updateUser(userId, updates) {
        return this.simpleFetch('updateUser', { userId, ...updates });
    }

    async deleteUser(userId) {
        return this.simpleFetch('deleteUser', { userId });
    }

    // Receipts
    async getReceipts() {
        return this.simpleFetch('getReceipts', {});
    }

    async getReceipt(receiptId) {
        return this.simpleFetch('getReceipt', { receiptId });
    }

    async createReceipt(receiptData) {
        return this.simpleFetch('createReceipt', receiptData);
    }

    async updateReceipt(receiptId, updates) {
        return this.simpleFetch('updateReceipt', { receiptId, ...updates });
    }

    async deleteReceipt(receiptId) {
        return this.simpleFetch('deleteReceipt', { receiptId });
    }

    async uploadImage(imageData, filename, mimeType) {
        return this.simpleFetch('uploadImage', {
            image: imageData,
            filename: filename,
            mimeType: mimeType
        });
    }

    // Suppliers
    async getSuppliers() {
        return this.simpleFetch('getSuppliers', {});
    }

    async createSupplier(supplierData) {
        return this.simpleFetch('createSupplier', supplierData);
    }

    async updateSupplier(supplierId, updates) {
        return this.simpleFetch('updateSupplier', { supplierId, ...updates });
    }

    async deleteSupplier(supplierId) {
        return this.simpleFetch('deleteSupplier', { supplierId });
    }

    // Analytics
    async getDashboardStats() {
        return this.simpleFetch('getDashboardStats', {});
    }

    async getTopSuppliers() {
        return this.simpleFetch('getTopSuppliers', {});
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
