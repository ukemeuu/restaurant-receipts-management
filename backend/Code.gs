// ===================================
// GOOGLE APPS SCRIPT - MAIN BACKEND
// Receipt Manager for Pot of Jollof
// ===================================

// Configuration - UPDATE THESE VALUES AFTER DEPLOYMENT
const CONFIG = {
  DRIVE_FOLDER_ID: '1OGfKyOA3_CVkZK1wgeUZgkL_TlvOF3Ls', // Update with your Google Drive folder ID
  SPREADSHEET_ID: '1MA62VLqFCiZCmiQ0X3-jxFl-MZOY-DxQdifqqZ2uDM8',
  ALLOWED_ORIGINS: [
    'https://script.google.com',
    'file://', // For local testing
    '*' // Remove in production, add your domain
  ]
};

// Sheet names
const SHEETS = {
  USERS: 'Users',
  RECEIPTS: 'Receipts',
  SUPPLIERS: 'Suppliers',
  ACTIVITY_LOG: 'ActivityLog'
};

// User roles
const ROLES = {
  MANAGEMENT: 'Management',
  OPERATIONS_LEAD: 'Operations Lead',
  STORE_MANAGER: 'Store Manager'
};

// ===================================
// WEB APP ENTRY POINT
// ===================================

// Run this function once to set up your Google Sheets
function setup() {
  getSheet(SHEETS.USERS);
  getSheet(SHEETS.RECEIPTS);
  getSheet(SHEETS.SUPPLIERS);
  getSheet(SHEETS.ACTIVITY_LOG);
  Logger.log('Database initialized successfully!');
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'Receipt Manager API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    const data = params.data || {};
    const userEmail = params.userEmail; // From frontend after Google OAuth
    
    // Verify user
    const user = getUserByEmail(userEmail);
    if (!user && action !== 'createUser') {
      return createResponse(false, 'Unauthorized user', 401);
    }
    
    // Route to appropriate handler
    switch (action) {
      // Authentication
      case 'login':
        return handleLogin(data);
      case 'getCurrentUser':
        return handleGetCurrentUser(userEmail);
      
      // Users
      case 'createUser':
        return handleCreateUser(data, user);
      case 'getUsers':
        return handleGetUsers(user);
      case 'updateUser':
        return handleUpdateUser(data, user);
      case 'deleteUser':
        return handleDeleteUser(data, user);
      
      // Receipts
      case 'getReceipts':
        return handleGetReceipts(user);
      case 'getReceipt':
        return handleGetReceipt(data, user);
      case 'createReceipt':
        return handleCreateReceipt(data, user);
      case 'updateReceipt':
        return handleUpdateReceipt(data, user);
      case 'deleteReceipt':
        return handleDeleteReceipt(data, user);
      case 'uploadImage':
        return handleUploadImage(data, user);
      
      // Suppliers
      case 'getSuppliers':
        return handleGetSuppliers(user);
      case 'createSupplier':
        return handleCreateSupplier(data, user);
      case 'updateSupplier':
        return handleUpdateSupplier(data, user);
      case 'deleteSupplier':
        return handleDeleteSupplier(data, user);
      
      // Analytics
      case 'getDashboardStats':
        return handleGetDashboardStats(user);
      case 'getTopSuppliers':
        return handleGetTopSuppliers(user);
      
      default:
        return createResponse(false, 'Invalid action', 400);
    }
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createResponse(false, error.toString(), 500);
  }
}

// ===================================
// AUTHENTICATION HANDLERS
// ===================================

function handleLogin(data) {
  const user = getUserByEmail(data.email);
  
  if (!user) {
    return createResponse(false, 'User not found', 404);
  }
  
  if (!user.active) {
    return createResponse(false, 'Account is inactive', 403);
  }
  
  // Update last login
  updateUserLastLogin(user.userId);
  
  return createResponse(true, 'Login successful', 200, { user });
}

function handleGetCurrentUser(email) {
  const user = getUserByEmail(email);
  
  if (!user) {
    return createResponse(false, 'User not found', 404);
  }
  
  return createResponse(true, 'User retrieved', 200, { user });
}

// ===================================
// USER HANDLERS
// ===================================

function handleCreateUser(data, currentUser) {
  // Only Management can create users
  if (currentUser && currentUser.role !== ROLES.MANAGEMENT) {
    return createResponse(false, 'Insufficient permissions', 403);
  }
  
  // Check if user already exists
  const existingUser = getUserByEmail(data.email);
  if (existingUser) {
    return createResponse(false, 'User already exists', 409);
  }
  
  const userId = generateId();
  const user = {
    userId: userId,
    email: data.email,
    name: data.name,
    role: data.role,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    active: true
  };
  
  const sheet = getSheet(SHEETS.USERS);
  sheet.appendRow([
    user.userId,
    user.email,
    user.name,
    user.role,
    user.createdAt,
    user.lastLogin,
    user.active
  ]);
  
  logActivity(currentUser ? currentUser.userId : 'SYSTEM', 'create', 'user', userId, `Created user: ${user.email}`);
  
  return createResponse(true, 'User created', 201, { user });
}

function handleGetUsers(user) {
  // Only Management can view all users
  if (user.role !== ROLES.MANAGEMENT) {
    return createResponse(false, 'Insufficient permissions', 403);
  }
  
  const users = getAllUsers();
  return createResponse(true, 'Users retrieved', 200, { users });
}

function handleUpdateUser(data, currentUser) {
  // Only Management can update users
  if (currentUser.role !== ROLES.MANAGEMENT) {
    return createResponse(false, 'Insufficient permissions', 403);
  }
  
  const sheet = getSheet(SHEETS.USERS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.userId) {
      if (data.name) sheet.getRange(i + 1, 3).setValue(data.name);
      if (data.role) sheet.getRange(i + 1, 4).setValue(data.role);
      if (data.active !== undefined) sheet.getRange(i + 1, 7).setValue(data.active);
      
      logActivity(currentUser.userId, 'update', 'user', data.userId, 'Updated user');
      
      return createResponse(true, 'User updated', 200);
    }
  }
  
  return createResponse(false, 'User not found', 404);
}

function handleDeleteUser(data, currentUser) {
  // Only Management can delete users
  if (currentUser.role !== ROLES.MANAGEMENT) {
    return createResponse(false, 'Insufficient permissions', 403);
  }
  
  // Soft delete - set active to false
  const sheet = getSheet(SHEETS.USERS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.userId) {
      sheet.getRange(i + 1, 7).setValue(false);
      logActivity(currentUser.userId, 'delete', 'user', data.userId, 'Deactivated user');
      return createResponse(true, 'User deactivated', 200);
    }
  }
  
  return createResponse(false, 'User not found', 404);
}

// ===================================
// RECEIPT HANDLERS
// ===================================

function handleGetReceipts(user) {
  const receipts = getAllReceipts();
  
  // Filter based on role
  let filteredReceipts = receipts;
  if (user.role === ROLES.STORE_MANAGER) {
    // Store Managers only see their own receipts
    filteredReceipts = receipts.filter(r => r.uploadedBy === user.userId);
  }
  
  return createResponse(true, 'Receipts retrieved', 200, { receipts: filteredReceipts });
}

function handleGetReceipt(data, user) {
  const receipt = getReceiptById(data.receiptId);
  
  if (!receipt) {
    return createResponse(false, 'Receipt not found', 404);
  }
  
  // Check permissions
  if (user.role === ROLES.STORE_MANAGER && receipt.uploadedBy !== user.userId) {
    return createResponse(false, 'Insufficient permissions', 403);
  }
  
  return createResponse(true, 'Receipt retrieved', 200, { receipt });
}

function handleCreateReceipt(data, user) {
  const receiptId = generateId();
  const receipt = {
    receiptId: receiptId,
    receiptNumber: data.receiptNumber,
    supplier: data.supplier,
    amount: data.amount,
    date: data.date,
    notes: data.notes || '',
    imageUrl: data.imageUrl || '',
    uploadedBy: user.userId,
    createdAt: new Date().toISOString(),
    restaurant: 'Pot of Jollof' // For future multi-restaurant support
  };
  
  const sheet = getSheet(SHEETS.RECEIPTS);
  sheet.appendRow([
    receipt.receiptId,
    receipt.receiptNumber,
    receipt.supplier,
    receipt.amount,
    receipt.date,
    receipt.notes,
    receipt.imageUrl,
    receipt.uploadedBy,
    receipt.createdAt,
    receipt.restaurant
  ]);
  
  logActivity(user.userId, 'create', 'receipt', receiptId, `Created receipt: ${receipt.receiptNumber}`);
  
  return createResponse(true, 'Receipt created', 201, { receipt });
}

function handleUpdateReceipt(data, user) {
  const receipt = getReceiptById(data.receiptId);
  
  if (!receipt) {
    return createResponse(false, 'Receipt not found', 404);
  }
  
  // Check permissions
  if (user.role === ROLES.STORE_MANAGER && receipt.uploadedBy !== user.userId) {
    return createResponse(false, 'Insufficient permissions', 403);
  }
  
  const sheet = getSheet(SHEETS.RECEIPTS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.receiptId) {
      if (data.receiptNumber) sheet.getRange(i + 1, 2).setValue(data.receiptNumber);
      if (data.supplier) sheet.getRange(i + 1, 3).setValue(data.supplier);
      if (data.amount) sheet.getRange(i + 1, 4).setValue(data.amount);
      if (data.date) sheet.getRange(i + 1, 5).setValue(data.date);
      if (data.notes !== undefined) sheet.getRange(i + 1, 6).setValue(data.notes);
      if (data.imageUrl) sheet.getRange(i + 1, 7).setValue(data.imageUrl);
      
      logActivity(user.userId, 'update', 'receipt', data.receiptId, 'Updated receipt');
      
      return createResponse(true, 'Receipt updated', 200);
    }
  }
  
  return createResponse(false, 'Receipt not found', 404);
}

function handleDeleteReceipt(data, user) {
  const receipt = getReceiptById(data.receiptId);
  
  if (!receipt) {
    return createResponse(false, 'Receipt not found', 404);
  }
  
  // Only Management and Operations Lead can delete
  if (user.role === ROLES.STORE_MANAGER) {
    return createResponse(false, 'Insufficient permissions', 403);
  }
  
  const sheet = getSheet(SHEETS.RECEIPTS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.receiptId) {
      sheet.deleteRow(i + 1);
      logActivity(user.userId, 'delete', 'receipt', data.receiptId, 'Deleted receipt');
      return createResponse(true, 'Receipt deleted', 200);
    }
  }
  
  return createResponse(false, 'Receipt not found', 404);
}

function handleUploadImage(data, user) {
  try {
    // data.image is base64 encoded
    const imageData = Utilities.base64Decode(data.image.split(',')[1]);
    const blob = Utilities.newBlob(imageData, data.mimeType, data.filename);
    
    // Upload to Drive
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    
    // Create year/month folder structure
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = date.toLocaleString('default', { month: 'long' });
    
    const yearFolder = getOrCreateFolder(folder, year);
    const monthFolder = getOrCreateFolder(yearFolder, month);
    
    const file = monthFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const imageUrl = file.getId(); // Store file ID, not full URL
    
    logActivity(user.userId, 'upload', 'image', file.getId(), `Uploaded image: ${data.filename}`);
    
    return createResponse(true, 'Image uploaded', 200, { 
      imageUrl: imageUrl,
      viewUrl: file.getUrl()
    });
  } catch (error) {
    Logger.log('Error uploading image: ' + error.toString());
    return createResponse(false, 'Failed to upload image: ' + error.toString(), 500);
  }
}

// ===================================
// SUPPLIER HANDLERS
// ===================================

function handleGetSuppliers(user) {
  const suppliers = getAllSuppliers();
  return createResponse(true, 'Suppliers retrieved', 200, { suppliers });
}

function handleCreateSupplier(data, user) {
  // Store Managers can only view suppliers
  if (user.role === ROLES.STORE_MANAGER) {
    return createResponse(false, 'Insufficient permissions', 403);
  }
  
  const supplierId = generateId();
  const supplier = {
    supplierId: supplierId,
    name: data.name,
    category: data.category,
    contact: data.contact || '',
    createdBy: user.userId,
    createdAt: new Date().toISOString()
  };
  
  const sheet = getSheet(SHEETS.SUPPLIERS);
  sheet.appendRow([
    supplier.supplierId,
    supplier.name,
    supplier.category,
    supplier.contact,
    supplier.createdBy,
    supplier.createdAt
  ]);
  
  logActivity(user.userId, 'create', 'supplier', supplierId, `Created supplier: ${supplier.name}`);
  
  return createResponse(true, 'Supplier created', 201, { supplier });
}

function handleUpdateSupplier(data, user) {
  if (user.role === ROLES.STORE_MANAGER) {
    return createResponse(false, 'Insufficient permissions', 403);
  }
  
  const sheet = getSheet(SHEETS.SUPPLIERS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.supplierId) {
      if (data.name) sheet.getRange(i + 1, 2).setValue(data.name);
      if (data.category) sheet.getRange(i + 1, 3).setValue(data.category);
      if (data.contact !== undefined) sheet.getRange(i + 1, 4).setValue(data.contact);
      
      logActivity(user.userId, 'update', 'supplier', data.supplierId, 'Updated supplier');
      
      return createResponse(true, 'Supplier updated', 200);
    }
  }
  
  return createResponse(false, 'Supplier not found', 404);
}

function handleDeleteSupplier(data, user) {
  if (user.role === ROLES.STORE_MANAGER) {
    return createResponse(false, 'Insufficient permissions', 403);
  }
  
  const sheet = getSheet(SHEETS.SUPPLIERS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === data.supplierId) {
      sheet.deleteRow(i + 1);
      logActivity(user.userId, 'delete', 'supplier', data.supplierId, 'Deleted supplier');
      return createResponse(true, 'Supplier deleted', 200);
    }
  }
  
  return createResponse(false, 'Supplier not found', 404);
}

// ===================================
// ANALYTICS HANDLERS
// ===================================

function handleGetDashboardStats(user) {
  const receipts = user.role === ROLES.STORE_MANAGER 
    ? getAllReceipts().filter(r => r.uploadedBy === user.userId)
    : getAllReceipts();
  
  const suppliers = getAllSuppliers();
  
  const totalReceipts = receipts.length;
  const totalSpending = receipts.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  const activeSuppliers = suppliers.length;
  
  return createResponse(true, 'Stats retrieved', 200, {
    stats: {
      totalReceipts,
      totalSpending,
      activeSuppliers
    }
  });
}

function handleGetTopSuppliers(user) {
  const receipts = user.role === ROLES.STORE_MANAGER 
    ? getAllReceipts().filter(r => r.uploadedBy === user.userId)
    : getAllReceipts();
  
  const suppliers = getAllSuppliers();
  const supplierMap = {};
  
  // Create supplier lookup
  suppliers.forEach(s => {
    supplierMap[s.name] = {
      name: s.name,
      category: s.category,
      total: 0,
      count: 0
    };
  });
  
  // Calculate totals
  receipts.forEach(r => {
    if (supplierMap[r.supplier]) {
      supplierMap[r.supplier].total += parseFloat(r.amount);
      supplierMap[r.supplier].count += 1;
    }
  });
  
  // Sort and get top 5
  const topSuppliers = Object.values(supplierMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  
  return createResponse(true, 'Top suppliers retrieved', 200, { topSuppliers });
}

// ===================================
// HELPER FUNCTIONS
// ===================================

function getSheet(sheetName) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    initializeSheet(sheet, sheetName);
  }
  
  return sheet;
}

function initializeSheet(sheet, sheetName) {
  let headers = [];
  
  switch (sheetName) {
    case SHEETS.USERS:
      headers = ['userId', 'email', 'name', 'role', 'createdAt', 'lastLogin', 'active'];
      break;
    case SHEETS.RECEIPTS:
      headers = ['receiptId', 'receiptNumber', 'supplier', 'amount', 'date', 'notes', 'imageUrl', 'uploadedBy', 'createdAt', 'restaurant'];
      break;
    case SHEETS.SUPPLIERS:
      headers = ['supplierId', 'name', 'category', 'contact', 'createdBy', 'createdAt'];
      break;
    case SHEETS.ACTIVITY_LOG:
      headers = ['logId', 'userId', 'action', 'entityType', 'entityId', 'timestamp', 'details'];
      break;
  }
  
  if (headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
}

function getUserByEmail(email) {
  const sheet = getSheet(SHEETS.USERS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][1] === email) {
      return {
        userId: values[i][0],
        email: values[i][1],
        name: values[i][2],
        role: values[i][3],
        createdAt: values[i][4],
        lastLogin: values[i][5],
        active: values[i][6]
      };
    }
  }
  
  return null;
}

function getAllUsers() {
  const sheet = getSheet(SHEETS.USERS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const users = [];
  
  for (let i = 1; i < values.length; i++) {
    users.push({
      userId: values[i][0],
      email: values[i][1],
      name: values[i][2],
      role: values[i][3],
      createdAt: values[i][4],
      lastLogin: values[i][5],
      active: values[i][6]
    });
  }
  
  return users;
}

function updateUserLastLogin(userId) {
  const sheet = getSheet(SHEETS.USERS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === userId) {
      sheet.getRange(i + 1, 6).setValue(new Date().toISOString());
      break;
    }
  }
}

function getAllReceipts() {
  const sheet = getSheet(SHEETS.RECEIPTS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const receipts = [];
  
  for (let i = 1; i < values.length; i++) {
    receipts.push({
      receiptId: values[i][0],
      receiptNumber: values[i][1],
      supplier: values[i][2],
      amount: values[i][3],
      date: values[i][4],
      notes: values[i][5],
      imageUrl: values[i][6],
      uploadedBy: values[i][7],
      createdAt: values[i][8],
      restaurant: values[i][9]
    });
  }
  
  return receipts;
}

function getReceiptById(receiptId) {
  const sheet = getSheet(SHEETS.RECEIPTS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === receiptId) {
      return {
        receiptId: values[i][0],
        receiptNumber: values[i][1],
        supplier: values[i][2],
        amount: values[i][3],
        date: values[i][4],
        notes: values[i][5],
        imageUrl: values[i][6],
        uploadedBy: values[i][7],
        createdAt: values[i][8],
        restaurant: values[i][9]
      };
    }
  }
  
  return null;
}

function getAllSuppliers() {
  const sheet = getSheet(SHEETS.SUPPLIERS);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  const suppliers = [];
  
  for (let i = 1; i < values.length; i++) {
    suppliers.push({
      supplierId: values[i][0],
      name: values[i][1],
      category: values[i][2],
      contact: values[i][3],
      createdBy: values[i][4],
      createdAt: values[i][5]
    });
  }
  
  return suppliers;
}

function logActivity(userId, action, entityType, entityId, details) {
  const sheet = getSheet(SHEETS.ACTIVITY_LOG);
  const logId = generateId();
  
  sheet.appendRow([
    logId,
    userId,
    action,
    entityType,
    entityId,
    new Date().toISOString(),
    details
  ]);
}

function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return parentFolder.createFolder(folderName);
  }
}

function generateId() {
  return Utilities.getUuid();
}

function createResponse(success, message, statusCode, data = {}) {
  const response = {
    success: success,
    message: message,
    statusCode: statusCode,
    data: data
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
