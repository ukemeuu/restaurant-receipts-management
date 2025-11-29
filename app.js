// ===================================
// RECEIPT MANAGER - APPLICATION LOGIC
// ===================================

// ===================================
// STATE MANAGEMENT
// ===================================
let receipts = [];
let suppliers = [];
let currentView = 'dashboard';

// ===================================
// INITIALIZATION
// ===================================
// ===================================
// INITIALIZATION
// ===================================
// Exposed to be called by auth.js after successful login
window.loadAppData = async function () {
    try {
        showLoading(true);
        await Promise.all([
            fetchReceipts(),
            fetchSuppliers()
        ]);

        initializeEventListeners();
        setDefaultDate();
        renderDashboard();
        renderAllReceipts();
        renderSuppliers();
        showLoading(false);
    } catch (error) {
        console.error('Failed to load data:', error);
        showNotification('❌ Failed to load data from server');
        showLoading(false);
    }
};

// Remove default DOMContentLoaded as it's handled by auth.js
// document.addEventListener('DOMContentLoaded', () => { ... });

// ===================================
// DATA PERSISTENCE
// ===================================
// ===================================
// DATA PERSISTENCE
// ===================================
async function fetchReceipts() {
    try {
        receipts = await api.getReceipts();
    } catch (error) {
        console.error('Error fetching receipts:', error);
        receipts = [];
    }
}

async function fetchSuppliers() {
    try {
        suppliers = await api.getSuppliers();
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        suppliers = [];
    }
}

// saveData function is removed as we save to backend directly

// ===================================
// EVENT LISTENERS
// ===================================
function initializeEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            switchView(view);
        });
    });

    // Add Receipt Buttons
    document.getElementById('add-receipt-btn').addEventListener('click', openReceiptModal);
    document.getElementById('add-receipt-btn-2').addEventListener('click', openReceiptModal);

    // Add Supplier Button
    document.getElementById('add-supplier-btn').addEventListener('click', openSupplierModal);

    // Modal Close Buttons
    document.getElementById('close-receipt-modal').addEventListener('click', closeReceiptModal);
    document.getElementById('close-supplier-modal').addEventListener('click', closeSupplierModal);
    document.getElementById('close-view-receipt-modal').addEventListener('click', closeViewReceiptModal);
    document.getElementById('cancel-receipt').addEventListener('click', closeReceiptModal);
    document.getElementById('cancel-supplier').addEventListener('click', closeSupplierModal);

    // Close modals on outside click
    document.getElementById('receipt-modal').addEventListener('click', (e) => {
        if (e.target.id === 'receipt-modal') closeReceiptModal();
    });
    document.getElementById('supplier-modal').addEventListener('click', (e) => {
        if (e.target.id === 'supplier-modal') closeSupplierModal();
    });
    document.getElementById('view-receipt-modal').addEventListener('click', (e) => {
        if (e.target.id === 'view-receipt-modal') closeViewReceiptModal();
    });

    // Image Upload
    document.getElementById('image-upload-area').addEventListener('click', () => {
        document.getElementById('receipt-image').click();
    });
    document.getElementById('receipt-image').addEventListener('change', handleImageUpload);

    // Forms
    document.getElementById('receipt-form').addEventListener('submit', handleReceiptSubmit);
    document.getElementById('supplier-form').addEventListener('submit', handleSupplierSubmit);

    // Supplier Autocomplete
    document.getElementById('receipt-supplier').addEventListener('input', handleSupplierAutocomplete);
    document.getElementById('receipt-supplier').addEventListener('focus', handleSupplierAutocomplete);

    // Search
    document.getElementById('receipt-search').addEventListener('input', handleReceiptSearch);
    document.getElementById('supplier-search').addEventListener('input', handleSupplierSearch);
}

// ===================================
// VIEW MANAGEMENT
// ===================================
function switchView(view) {
    currentView = view;

    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });

    // Update views
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${view}-view`).classList.remove('hidden');

    // Refresh data
    if (view === 'dashboard') {
        renderDashboard();
    } else if (view === 'receipts') {
        renderAllReceipts();
    } else if (view === 'suppliers') {
        renderSuppliers();
    }
}

// ===================================
// MODAL MANAGEMENT
// ===================================
function openReceiptModal() {
    document.getElementById('receipt-modal').classList.add('active');
    document.getElementById('receipt-form').reset();
    setDefaultDate();
    clearImagePreview();
}

function closeReceiptModal() {
    document.getElementById('receipt-modal').classList.remove('active');
    document.getElementById('receipt-form').reset();
    clearImagePreview();
}

function openSupplierModal() {
    document.getElementById('supplier-modal').classList.add('active');
    document.getElementById('supplier-form').reset();
}

function closeSupplierModal() {
    document.getElementById('supplier-modal').classList.remove('active');
    document.getElementById('supplier-form').reset();
}

function openViewReceiptModal(receiptId) {
    const receipt = receipts.find(r => r.id === receiptId);
    if (!receipt) return;

    const modal = document.getElementById('view-receipt-modal');
    const content = document.getElementById('receipt-detail-content');

    content.innerHTML = `
    ${receipt.image ? `<img src="${receipt.image}" alt="Receipt" style="width: 100%; border-radius: var(--radius-lg); margin-bottom: var(--space-lg);">` : ''}
    
    <div style="display: grid; gap: var(--space-md);">
      <div>
        <div class="form-label">Supplier</div>
        <div style="font-size: var(--font-size-xl); font-weight: 700; color: var(--text-primary);">${receipt.supplier}</div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
        <div>
          <div class="form-label">Receipt Number</div>
          <div style="font-family: monospace; color: var(--text-primary);">${receipt.receiptNumber}</div>
        </div>
        <div>
          <div class="form-label">Amount</div>
          <div style="font-size: var(--font-size-xl); font-weight: 700; color: var(--primary);">$${receipt.amount.toFixed(2)}</div>
        </div>
      </div>
      
      <div>
        <div class="form-label">Date</div>
        <div style="color: var(--text-primary);">${formatDate(receipt.date)}</div>
      </div>
      
      ${receipt.notes ? `
        <div>
          <div class="form-label">Notes</div>
          <div style="color: var(--text-secondary); line-height: 1.6;">${receipt.notes}</div>
        </div>
      ` : ''}
    </div>
    
    <div style="margin-top: var(--space-lg); display: flex; gap: var(--space-sm);">
      <button class="btn btn-secondary" onclick="deleteReceipt('${receipt.id}')" style="flex: 1;">
        🗑️ Delete
      </button>
      <button class="btn btn-primary" onclick="closeViewReceiptModal()" style="flex: 1;">
        Close
      </button>
    </div>
  `;

    modal.classList.add('active');
}

function closeViewReceiptModal() {
    document.getElementById('view-receipt-modal').classList.remove('active');
}

// ===================================
// IMAGE HANDLING
// ===================================
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const preview = document.getElementById('image-preview');
        const placeholder = document.getElementById('upload-placeholder');
        const uploadArea = document.getElementById('image-upload-area');

        preview.src = event.target.result;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
        uploadArea.classList.add('has-image');
    };
    reader.readAsDataURL(file);
}

function clearImagePreview() {
    const preview = document.getElementById('image-preview');
    const placeholder = document.getElementById('upload-placeholder');
    const uploadArea = document.getElementById('image-upload-area');

    preview.src = '';
    preview.classList.add('hidden');
    placeholder.classList.remove('hidden');
    uploadArea.classList.remove('has-image');
    document.getElementById('receipt-image').value = '';
}

// ===================================
// SUPPLIER AUTOCOMPLETE
// ===================================
function handleSupplierAutocomplete(e) {
    const input = e.target.value.toLowerCase();
    const dropdown = document.getElementById('supplier-dropdown');

    if (input.length === 0) {
        // Show all suppliers when input is empty and focused
        const allSuppliers = suppliers.map(s => `
      <div class="autocomplete-item" data-supplier="${s.name}">
        <div style="font-weight: 600;">${s.name}</div>
        <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${s.category}</div>
      </div>
    `).join('');

        dropdown.innerHTML = allSuppliers || '<div class="autocomplete-item" style="color: var(--text-muted);">No suppliers found. Type to add new.</div>';
        dropdown.classList.remove('hidden');
    } else {
        // Filter suppliers
        const filtered = suppliers.filter(s =>
            s.name.toLowerCase().includes(input) ||
            s.category.toLowerCase().includes(input)
        );

        if (filtered.length > 0) {
            dropdown.innerHTML = filtered.map(s => `
        <div class="autocomplete-item" data-supplier="${s.name}">
          <div style="font-weight: 600;">${s.name}</div>
          <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${s.category}</div>
        </div>
      `).join('');
            dropdown.classList.remove('hidden');
        } else {
            dropdown.innerHTML = '<div class="autocomplete-item" style="color: var(--text-muted);">No matches. Press Enter to use this name.</div>';
            dropdown.classList.remove('hidden');
        }
    }

    // Add click handlers to dropdown items
    dropdown.querySelectorAll('.autocomplete-item[data-supplier]').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById('receipt-supplier').value = item.dataset.supplier;
            dropdown.classList.add('hidden');
        });
    });
}

// Hide dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.autocomplete-container')) {
        document.getElementById('supplier-dropdown').classList.add('hidden');
    }
});

// ===================================
// FORM HANDLERS
// ===================================
async function handleReceiptSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Saving...';

    try {
        const imageInput = document.getElementById('receipt-image');
        const imagePreview = document.getElementById('image-preview');
        let imageUrl = null;

        // Upload image if selected
        if (imageInput.files && imageInput.files[0]) {
            const file = imageInput.files[0];
            const reader = new FileReader();

            const base64Image = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(file);
            });

            // Extract base64 data
            const imageData = base64Image.split(',')[1];
            const mimeType = file.type;
            const filename = `receipt_${Date.now()}_${file.name}`;

            const uploadResult = await api.uploadImage(imageData, filename, mimeType);
            imageUrl = uploadResult.url;
        }

        const receiptData = {
            supplier: document.getElementById('receipt-supplier').value,
            receiptNumber: document.getElementById('receipt-number').value,
            amount: parseFloat(document.getElementById('receipt-amount').value),
            date: document.getElementById('receipt-date').value,
            notes: document.getElementById('receipt-notes').value,
            image: imageUrl
        };

        const newReceipt = await api.createReceipt(receiptData);
        receipts.unshift(newReceipt);

        closeReceiptModal();
        renderDashboard();
        renderAllReceipts();
        showNotification('✅ Receipt added successfully!');

    } catch (error) {
        console.error('Error adding receipt:', error);
        showNotification('❌ Failed to add receipt: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}


async function handleSupplierSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Saving...';

    try {
        const supplierData = {
            name: document.getElementById('supplier-name').value,
            category: document.getElementById('supplier-category').value,
            contact: document.getElementById('supplier-contact').value
        };

        const newSupplier = await api.createSupplier(supplierData);
        suppliers.push(newSupplier);

        closeSupplierModal();
        renderSuppliers();
        showNotification('✅ Supplier added successfully!');

    } catch (error) {
        console.error('Error adding supplier:', error);
        showNotification('❌ Failed to add supplier: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// ===================================
// SEARCH HANDLERS
// ===================================
function handleReceiptSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = receipts.filter(r =>
        r.supplier.toLowerCase().includes(query) ||
        r.receiptNumber.toLowerCase().includes(query) ||
        r.date.includes(query) ||
        (r.notes && r.notes.toLowerCase().includes(query))
    );
    renderReceiptGrid('all-receipts', filtered);
}

function handleSupplierSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query) ||
        (s.contact && s.contact.toLowerCase().includes(query))
    );
    renderSuppliersList(filtered);
}

// ===================================
// RENDER FUNCTIONS
// ===================================
function renderDashboard() {
    // Update stats
    document.getElementById('total-receipts').textContent = receipts.length;
    document.getElementById('total-spending').textContent = `$${calculateTotalSpending().toFixed(2)}`;
    document.getElementById('total-suppliers').textContent = suppliers.length;

    // Render top suppliers
    renderTopSuppliers();

    // Render recent receipts (last 6)
    const recentReceipts = receipts.slice(0, 6);
    renderReceiptGrid('recent-receipts', recentReceipts);
}

function renderTopSuppliers() {
    const supplierStats = calculateSupplierStats();
    const topSuppliers = supplierStats.slice(0, 5);
    const container = document.getElementById('top-suppliers-list');

    if (topSuppliers.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-muted);">No suppliers yet. Add your first receipt to get started!</p>';
        return;
    }

    container.innerHTML = topSuppliers.map((stat, index) => `
    <div class="supplier-item">
      <div class="supplier-rank">${index + 1}</div>
      <div class="supplier-info">
        <div class="supplier-name">${stat.name}</div>
        <div class="supplier-category">${stat.category}</div>
      </div>
      <div class="supplier-stats">
        <div class="supplier-amount">$${stat.total.toFixed(2)}</div>
        <div class="supplier-count">${stat.count} receipt${stat.count !== 1 ? 's' : ''}</div>
      </div>
    </div>
  `).join('');
}

function renderAllReceipts() {
    renderReceiptGrid('all-receipts', receipts);
}

function renderReceiptGrid(containerId, receiptsToRender) {
    const container = document.getElementById(containerId);

    if (receiptsToRender.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-muted);">No receipts found.</p>';
        return;
    }

    container.innerHTML = receiptsToRender.map(receipt => `
    <div class="receipt-card" onclick="openViewReceiptModal('${receipt.id}')">
      ${receipt.image ? `<img src="${receipt.image}" alt="Receipt" class="receipt-image">` : '<div class="receipt-image" style="display: flex; align-items: center; justify-content: center; font-size: 3rem;">🧾</div>'}
      <div class="receipt-details">
        <div class="receipt-supplier">${receipt.supplier}</div>
        <div class="receipt-number">Receipt #${receipt.receiptNumber}</div>
        <div class="receipt-meta">
          <div class="receipt-amount">$${receipt.amount.toFixed(2)}</div>
          <div class="receipt-date">${formatDate(receipt.date)}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function renderSuppliers() {
    renderSuppliersList(suppliers);
}

function renderSuppliersList(suppliersToRender) {
    const container = document.getElementById('suppliers-list');

    if (suppliersToRender.length === 0) {
        container.innerHTML = '<p class="text-center" style="color: var(--text-muted);">No suppliers found.</p>';
        return;
    }

    // Get receipt counts for each supplier
    const supplierCounts = {};
    receipts.forEach(r => {
        supplierCounts[r.supplier] = (supplierCounts[r.supplier] || 0) + 1;
    });

    container.innerHTML = suppliersToRender.map(supplier => {
        const count = supplierCounts[supplier.name] || 0;
        return `
      <div class="supplier-item">
        <div class="supplier-info" style="flex: 1;">
          <div class="supplier-name">${supplier.name}</div>
          <div class="supplier-category">${supplier.category}</div>
          ${supplier.contact ? `<div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">📞 ${supplier.contact}</div>` : ''}
        </div>
        <div class="supplier-stats">
          <div class="supplier-count">${count} receipt${count !== 1 ? 's' : ''}</div>
        </div>
        <button class="btn btn-icon btn-secondary" onclick="deleteSupplier('${supplier.id}')" title="Delete supplier">
          🗑️
        </button>
      </div>
    `;
    }).join('');
}

// ===================================
// DELETE FUNCTIONS
// ===================================
async function deleteReceipt(id) {
    if (confirm('Are you sure you want to delete this receipt?')) {
        try {
            await api.deleteReceipt(id);
            receipts = receipts.filter(r => r.id !== id);

            closeViewReceiptModal();
            renderDashboard();
            renderAllReceipts();
            showNotification('🗑️ Receipt deleted');
        } catch (error) {
            console.error('Error deleting receipt:', error);
            showNotification('❌ Failed to delete receipt');
        }
    }
}

async function deleteSupplier(id) {
    const supplier = suppliers.find(s => s.id === id);
    if (!supplier) return;

    // Check if supplier has receipts
    const hasReceipts = receipts.some(r => r.supplier === supplier.name);

    if (hasReceipts) {
        if (!confirm(`This supplier has receipts associated with it. Are you sure you want to delete "${supplier.name}"?`)) {
            return;
        }
    }

    if (confirm(`Are you sure you want to delete ${supplier.name}?`)) {
        try {
            await api.deleteSupplier(id);
            suppliers = suppliers.filter(s => s.id !== id);

            renderSuppliers();
            renderDashboard();
            showNotification('🗑️ Supplier deleted');
        } catch (error) {
            console.error('Error deleting supplier:', error);
            showNotification('❌ Failed to delete supplier');
        }
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('receipt-date').value = today;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function calculateTotalSpending() {
    return receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
}

function calculateSupplierStats() {
    const stats = {};

    receipts.forEach(receipt => {
        if (!stats[receipt.supplier]) {
            const supplier = suppliers.find(s => s.name === receipt.supplier);
            stats[receipt.supplier] = {
                name: receipt.supplier,
                category: supplier ? supplier.category : 'Unknown',
                total: 0,
                count: 0
            };
        }
        stats[receipt.supplier].total += receipt.amount;
        stats[receipt.supplier].count += 1;
    });

    return Object.values(stats).sort((a, b) => b.total - a.total);
}

function showNotification(message) {
    // Simple notification - could be enhanced with a toast component
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: var(--gradient-primary);
    color: white;
    padding: var(--space-md) var(--space-lg);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    z-index: 10000;
    animation: slideUp 0.3s ease;
    font-weight: 600;
  `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showLoading(isLoading) {
    // Implement a global loading overlay if needed
    // For now we just rely on button states
    if (isLoading) {
        document.body.style.cursor = 'wait';
    } else {
        document.body.style.cursor = 'default';
    }
}
