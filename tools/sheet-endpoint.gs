/**
 * =========================================================================
 * Mobile Gallery — Google Apps Script All-In-One Single Sheet Backend
 * =========================================================================
 *
 * 🎯 SINGLE SHEET ARCHITECTURE (একই শীটে A-Z+ কলামে Users, Products, Orders):
 *
 *   [COLUMNS A - G] (Cols 1 - 7)   : USERS SECTION
 *     - A: User ID
 *     - B: Registered At
 *     - C: Full Name
 *     - D: Email
 *     - E: Phone
 *     - F: Password
 *     - G: Status
 *
 *   [COLUMN H] (Col 8)             : SEPARATOR (Users ➔ Products)
 *
 *   [COLUMNS I - Y] (Cols 9 - 25)  : PRODUCTS SECTION
 *     - I: Product ID
 *     - J: Created At
 *     - K: Title
 *     - L: Brand
 *     - M: Category
 *     - N: Price
 *     - O: Old Price
 *     - P: Condition
 *     - Q: Storage
 *     - R: RAM
 *     - S: Battery
 *     - T: Chip
 *     - U: Color
 *     - V: Warranty
 *     - W: Stock
 *     - X: Description
 *     - Y: Status
 *
 *   [COLUMN Z] (Col 26)            : SEPARATOR (Products ➔ Orders)
 *
 *   [COLUMNS AA - AM] (Cols 27 - 39): ORDERS SECTION
 *     - AA: Order Ref
 *     - AB: Placed At
 *     - AC: Customer Name
 *     - AD: Customer Email
 *     - AE: Customer Phone
 *     - AF: Address
 *     - AG: Area
 *     - AH: City
 *     - AI: Payment Method
 *     - AJ: Items Count
 *     - AK: Total Amount
 *     - AL: Items Details
 *     - AM: Status (Pending / Confirmed / Delivered)
 *
 * =========================================================================
 */

// Column Offsets & Widths
var COL_USER_START = 1;      // Col A
var COL_USER_LEN   = 7;

var COL_SEP1       = 8;      // Col H

var COL_PROD_START = 9;      // Col I
var COL_PROD_LEN   = 17;

var COL_SEP2       = 26;     // Col Z

var COL_ORDER_START= 27;     // Col AA
var COL_ORDER_LEN  = 13;

var TOTAL_COLUMNS  = 39;     // Col AM

// Headers Definition
var HEADERS_USERS = [
  'User ID', 'Registered At', 'Full Name', 'Email', 'Phone', 'Password', 'User Status'
];

var HEADERS_PRODUCTS = [
  'Product ID', 'Created At', 'Title', 'Brand', 'Category', 'Price (৳)', 'Old Price (৳)',
  'Condition', 'Storage', 'RAM', 'Battery', 'Chip', 'Color', 'Warranty', 'Stock', 'Description', 'Product Status'
];

var HEADERS_ORDERS = [
  'Order Ref', 'Placed At', 'Customer Name', 'Customer Email', 'Customer Phone',
  'Address', 'Area', 'City', 'Payment Method', 'Items Count', 'Total Amount (৳)', 'Items Details', 'Order Status'
];

/**
 * Handle incoming GET requests
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';

  try {
    var sheet = getMasterSheet_();
    initSingleSheetLayout_(sheet);

    if (action === 'get_products') {
      var products = getProductsList_(sheet);
      return json_({ ok: true, products: products });
    }

    if (action === 'get_orders') {
      var orders = getOrdersList_(sheet);
      return json_({ ok: true, orders: orders });
    }

    if (action === 'get_users') {
      var users = getUsersList_(sheet);
      return json_({ ok: true, users: users });
    }

    return json_({
      ok: true,
      message: 'Mobile Gallery 1-Sheet API is active and ready.',
      sheetName: sheet.getName(),
      totalColumns: TOTAL_COLUMNS,
      supportedActions: ['register_user', 'login_user', 'add_product', 'delete_product', 'get_products', 'place_order', 'get_orders', 'update_order_status']
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/**
 * Handle incoming POST requests
 */
function doPost(e) {
  var data = {};
  try {
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
  } catch (err) {
    return json_({ ok: false, error: 'Invalid JSON payload: ' + err.message });
  }

  // Honeypot anti-spam
  if (data.website_url || data.website || data._hp) {
    return json_({ ok: true, spam: true });
  }

  var action = data.action || 'place_order';

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
  } catch (lockErr) {
    return json_({ ok: false, error: 'Sheet database is busy, please try again.' });
  }

  try {
    var sheet = getMasterSheet_();
    initSingleSheetLayout_(sheet);

    // 1. REGISTER USER (Cols A - G)
    if (action === 'register_user') {
      return registerUser_(sheet, data);
    }

    // 2. LOGIN USER (Cols A - G)
    if (action === 'login_user') {
      return loginUser_(sheet, data);
    }

    // 2.1 GET USERS LIST (Cols A - G)
    if (action === 'get_users') {
      return json_({ ok: true, users: getUsersList_(sheet) });
    }

    // 2.2 UPDATE USER STATUS (Cols A - G)
    if (action === 'update_user_status') {
      return updateUserStatus_(sheet, data);
    }

    // 3. ADD PRODUCT (Cols I - Y)
    if (action === 'add_product') {
      return addProduct_(sheet, data);
    }

    // 4. UPDATE / EDIT PRODUCT (Cols I - Y)
    if (action === 'update_product') {
      return updateProduct_(sheet, data);
    }

    // 5. DELETE PRODUCT (Cols I - Y)
    if (action === 'delete_product') {
      return deleteProduct_(sheet, data);
    }

    // 6. SEED / UPLOAD ALL BUILT-IN PRODUCTS (Cols I - Y)
    if (action === 'seed_products') {
      return seedProducts_(sheet, data);
    }

    // 7. GET PRODUCTS (Cols I - Y)
    if (action === 'get_products') {
      return json_({ ok: true, products: getProductsList_(sheet) });
    }

    // 8. PLACE ORDER (Cols AA - AM) & AUTO-DECREMENT STOCK (Col W)
    if (action === 'place_order') {
      return placeOrder_(sheet, data);
    }

    // 9. GET ORDERS (Cols AA - AM)
    if (action === 'get_orders') {
      return json_({ ok: true, orders: getOrdersList_(sheet) });
    }

    // 10. UPDATE ORDER STATUS (Cols AA - AM)
    if (action === 'update_order_status') {
      return updateOrderStatus_(sheet, data);
    }

    return json_({ ok: false, error: 'Unknown action: ' + action });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/* =========================================================================
   1. USER HANDLERS (Columns A - G)
   ========================================================================= */

function registerUser_(sheet, data) {
  var name = String(data.name || '').trim();
  var email = String(data.email || '').trim().toLowerCase();
  var phone = String(data.phone || '').trim();
  var password = String(data.password || '').trim();

  if (!email || !name || !password) {
    return json_({ ok: false, error: 'Name, Email and Password are required.' });
  }

  var lastRow = getSectionLastRow_(sheet, COL_USER_START);
  if (lastRow > 1) {
    var emails = sheet.getRange(2, 4, lastRow - 1, 1).getValues(); // Col D is Email (col 4)
    for (var i = 0; i < emails.length; i++) {
      if (String(emails[i][0] || '').trim().toLowerCase() === email) {
        return json_({ ok: false, error: 'An account with this email already exists.' });
      }
    }
  }

  var userId = 'USR-' + Utilities.getUuid().slice(0, 8).toUpperCase();
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss');
  var phoneFormatted = phone ? ("'" + phone) : '';

  var userRow = [
    userId,
    dateStr,
    name,
    email,
    phoneFormatted,
    password,
    'Active'
  ];

  appendSectionRow_(sheet, COL_USER_START, userRow);

  return json_({
    ok: true,
    message: 'User registered in sheet successfully',
    user: { id: userId, name: name, email: email, phone: phone }
  });
}

function loginUser_(sheet, data) {
  var email = String(data.email || '').trim().toLowerCase();
  var password = String(data.password || '').trim();

  if (!email || !password) {
    return json_({ ok: false, error: 'Email and password required.' });
  }

  var maxRow = Math.max(sheet.getLastRow(), getSectionLastRow_(sheet, COL_USER_START));
  if (maxRow >= 2) {
    var allUserRows = sheet.getRange(1, COL_USER_START, maxRow, COL_USER_LEN).getValues();
    for (var r = 0; r < allUserRows.length; r++) {
      var rowId = String(allUserRows[r][0] || '').trim();
      if (!rowId || rowId.toLowerCase() === 'user id' || rowId.toLowerCase().indexOf('section') > -1) {
        continue;
      }

      var rowEmail = String(allUserRows[r][3] || '').trim().toLowerCase();
      var rowPass = String(allUserRows[r][5] || '').trim();
      var status = String(allUserRows[r][6] || 'Active').trim();

      if (rowEmail === email && rowPass === password) {
        if (status.toLowerCase() === 'suspended' || status.toLowerCase() === 'inactive') {
          return json_({ ok: false, error: 'Account is ' + status + '. Please contact admin for assistance.' });
        }
        return json_({
          ok: true,
          user: {
            id: rowId,
            name: String(allUserRows[r][2] || ''),
            email: rowEmail,
            phone: String(allUserRows[r][4] || '').replace(/^'/, ''),
            status: status
          }
        });
      }
    }
  }

  return json_({ ok: false, error: 'Invalid email or password.' });
}

function getUsersList_(sheet) {
  var maxRow = Math.max(sheet.getLastRow(), getSectionLastRow_(sheet, COL_USER_START));
  var users = [];
  if (maxRow < 2) return users;

  var allUserRows = sheet.getRange(1, COL_USER_START, maxRow, COL_USER_LEN).getValues();
  for (var r = 0; r < allUserRows.length; r++) {
    var id = String(allUserRows[r][0] || '').trim();
    var email = String(allUserRows[r][3] || '').trim().toLowerCase();

    // Skip empty, banner, or header rows
    if (!id || id.toLowerCase() === 'user id' || id.toLowerCase().indexOf('section') > -1) {
      continue;
    }

    users.push({
      id: id,
      registeredAt: String(allUserRows[r][1] || ''),
      name: String(allUserRows[r][2] || ''),
      email: email,
      phone: String(allUserRows[r][4] || '').replace(/^'/, ''),
      status: String(allUserRows[r][6] || 'Active').trim()
    });
  }
  return users;
}

function updateUserStatus_(sheet, data) {
  var email = String(data.email || '').trim().toLowerCase();
  var id = String(data.id || data.userId || '').trim();
  var rawStatus = String(data.status || 'Active').trim();
  var newStatus = 'Active';
  if (rawStatus.toLowerCase() === 'inactive') newStatus = 'Inactive';
  else if (rawStatus.toLowerCase() === 'suspended') newStatus = 'Suspended';
  else newStatus = 'Active';

  if (!email && !id) {
    return json_({ ok: false, error: 'User Email or ID is required.' });
  }

  var maxRow = Math.max(sheet.getLastRow(), getSectionLastRow_(sheet, COL_USER_START));
  if (maxRow >= 2) {
    var allUserRows = sheet.getRange(1, COL_USER_START, maxRow, COL_USER_LEN).getValues();
    for (var r = 0; r < allUserRows.length; r++) {
      var rowId = String(allUserRows[r][0] || '').trim();
      var rowEmail = String(allUserRows[r][3] || '').trim().toLowerCase();

      // Skip header rows
      if (rowId.toLowerCase() === 'user id' || rowId.toLowerCase().indexOf('section') > -1) {
        continue;
      }

      if ((id && rowId.toLowerCase() === id.toLowerCase()) || (email && rowEmail === email)) {
        // Col G is User Status (Column 7 in sheet)
        var targetRow = r + 1; // 1-indexed sheet row
        sheet.getRange(targetRow, 7).setValue(newStatus);
        return json_({
          ok: true,
          message: 'User status updated to ' + newStatus + ' in Google Sheet row ' + targetRow,
          userId: rowId,
          email: rowEmail,
          status: newStatus,
          row: targetRow
        });
      }
    }
  }
  return json_({ ok: false, error: 'User not found in Google Sheet (Email: ' + email + ', ID: ' + id + ').' });
}

/* =========================================================================
   2. PRODUCT HANDLERS (Columns I - Y)
   ========================================================================= */

/**
 * Auto-calculate Status ('In Stock', 'Low Stock', 'Out of Stock') based on Stock count:
 * - Stock > 8       : 'In Stock'
 * - 1 <= Stock <= 8 : 'Low Stock'
 * - Stock <= 0      : 'Out of Stock'
 */
function getStockStatus_(stock) {
  var s = Number(stock);
  if (isNaN(s) || s <= 0) return 'Out of Stock';
  if (s <= 8) return 'Low Stock';
  return 'In Stock';
}

function addProduct_(sheet, data) {
  var title = String(data.title || '').trim();
  var price = Number(data.price || 0);

  if (!title || price <= 0) {
    return json_({ ok: false, error: 'Product title and price are required.' });
  }

  var productId = data.id || ('mg-a' + Date.now().toString(36));
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss');
  var stockVal = Number(data.stock !== undefined ? data.stock : 5);
  var statusVal = getStockStatus_(stockVal);

  var descWithImages = String(data.desc || '');
  if (Array.isArray(data.images) && data.images.length > 0) {
    descWithImages = '<!-- IMAGES:' + JSON.stringify(data.images) + ' -->\n' + descWithImages;
  }

  var prodRow = [
    productId,
    dateStr,
    title,
    data.brand || 'Other',
    data.category || 'phone',
    price,
    Number(data.oldPrice || 0),
    data.condition || 'Brand New',
    data.storage || 'N/A',
    data.ram || 'N/A',
    data.battery || 'N/A',
    data.chip || 'N/A',
    data.color || 'midnight',
    data.warranty || '1 year official',
    stockVal,
    descWithImages,
    statusVal
  ];

  appendSectionRow_(sheet, COL_PROD_START, prodRow);

  return json_({
    ok: true,
    message: 'Product added in sheet successfully',
    productId: productId
  });
}

/** Update / Edit any existing product (old or new) */
function updateProduct_(sheet, data) {
  var targetId = String(data.id || data.productId || '').trim();
  var targetTitle = String(data.title || '').trim().toLowerCase();

  if (!targetId && !targetTitle) {
    return json_({ ok: false, error: 'Product ID or title required for update.' });
  }

  var lastRow = getSectionLastRow_(sheet, COL_PROD_START);
  var foundRow = -1;

  if (lastRow > 1) {
    var prodRows = sheet.getRange(2, COL_PROD_START, lastRow - 1, COL_PROD_LEN).getValues();
    for (var i = 0; i < prodRows.length; i++) {
      var rowId = String(prodRows[i][0] || '').trim();
      var rowTitle = String(prodRows[i][2] || '').trim().toLowerCase();
      if ((targetId && rowId === targetId) || (targetTitle && rowTitle === targetTitle)) {
        foundRow = i + 2;
        targetId = rowId || targetId;
        break;
      }
    }
  }

  var stockVal = Number(data.stock !== undefined ? data.stock : 5);
  var statusVal = (String(data.status || '').toLowerCase() === 'deleted') ? 'Deleted' : getStockStatus_(stockVal);

  var descWithImages = String(data.desc || '');
  if (Array.isArray(data.images) && data.images.length > 0) {
    descWithImages = '<!-- IMAGES:' + JSON.stringify(data.images) + ' -->\n' + descWithImages;
  }

  var updatedRow = [
    targetId || ('mg-a' + Date.now().toString(36)),
    Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss'),
    String(data.title || '').trim(),
    data.brand || 'Other',
    data.category || 'phone',
    Number(data.price || 0),
    Number(data.oldPrice || 0),
    data.condition || 'Brand New',
    data.storage || 'N/A',
    data.ram || 'N/A',
    data.battery || 'N/A',
    data.chip || 'N/A',
    data.color || 'midnight',
    data.warranty || '1 year official',
    stockVal,
    descWithImages,
    statusVal
  ];

  if (foundRow > -1) {
    sheet.getRange(foundRow, COL_PROD_START, 1, COL_PROD_LEN).setValues([updatedRow]);
    return json_({ ok: true, message: 'Product updated in sheet successfully', id: targetId });
  } else {
    // If not found in sheet yet (e.g. old built-in product), append it
    appendSectionRow_(sheet, COL_PROD_START, updatedRow);
    return json_({ ok: true, message: 'Product saved and updated in sheet', id: targetId });
  }
}

function deleteProduct_(sheet, data) {
  var targetId = String(data.id || data.productId || '').trim();
  var targetTitle = String(data.title || '').trim().toLowerCase();

  if (!targetId && !targetTitle) {
    return json_({ ok: false, error: 'Product ID required.' });
  }

  var lastRow = getSectionLastRow_(sheet, COL_PROD_START);
  if (lastRow > 1) {
    var prodRows = sheet.getRange(2, COL_PROD_START, lastRow - 1, COL_PROD_LEN).getValues();
    for (var i = 0; i < prodRows.length; i++) {
      var rowId = String(prodRows[i][0] || '').trim();
      var rowTitle = String(prodRows[i][2] || '').trim().toLowerCase();
      if ((targetId && rowId === targetId) || (targetTitle && rowTitle === targetTitle)) {
        // Status is in Col Y (Col 25)
        sheet.getRange(i + 2, 25).setValue('Deleted');
        return json_({ ok: true, message: 'Product marked as deleted', id: rowId });
      }
    }
  }

  return json_({ ok: false, error: 'Product not found in sheet.' });
}

/** Seed all built-in catalogue products into the Google Sheet */
function seedProducts_(sheet, data) {
  var products = data.products || [];
  if (!Array.isArray(products) || products.length === 0) {
    return json_({ ok: false, error: 'No products provided for seeding.' });
  }

  var lastRow = getSectionLastRow_(sheet, COL_PROD_START);
  var existingIds = new Set();
  if (lastRow > 1) {
    var ids = sheet.getRange(2, COL_PROD_START, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      existingIds.add(String(ids[i][0] || '').trim());
    }
  }

  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss');
  var addedCount = 0;

  for (var k = 0; k < products.length; k++) {
    var p = products[k];
    if (existingIds.has(String(p.id).trim())) continue;

    var pStock = Number(p.stock !== undefined ? p.stock : 5);
    var pStatus = getStockStatus_(pStock);
    var pDescWithImages = p.desc || '';
    if (Array.isArray(p.images) && p.images.length > 0) {
      pDescWithImages = '<!-- IMAGES:' + JSON.stringify(p.images) + ' -->\n' + pDescWithImages;
    }

    var prodRow = [
      p.id,
      dateStr,
      p.title || '',
      p.brand || 'Other',
      p.category || 'phone',
      Number(p.price || 0),
      Number(p.oldPrice || 0),
      p.condition || 'Brand New',
      p.storage || 'N/A',
      p.ram || 'N/A',
      p.battery || 'N/A',
      p.chip || 'N/A',
      p.color || 'midnight',
      p.warranty || '1 year official',
      pStock,
      pDescWithImages,
      pStatus
    ];
    appendSectionRow_(sheet, COL_PROD_START, prodRow);
    existingIds.add(String(p.id).trim());
    addedCount++;
  }

  return json_({
    ok: true,
    message: addedCount + ' products seeded into Google Sheet',
    count: addedCount
  });
}

function getProductsList_(sheet) {
  var maxRow = Math.max(sheet.getLastRow(), getSectionLastRow_(sheet, COL_PROD_START));
  var products = [];
  if (maxRow < 2) return products;

  var rows = sheet.getRange(1, COL_PROD_START, maxRow, COL_PROD_LEN).getValues();
  for (var i = 0; i < rows.length; i++) {
    var id = String(rows[i][0] || '').trim();
    var title = String(rows[i][2] || '').trim();

    // Skip empty rows, banner, or header rows
    if (!title || id.toLowerCase() === 'product id' || id.toLowerCase().indexOf('section') > -1 || title.toLowerCase() === 'title') {
      continue;
    }

    if (!id) {
      id = 'mg-sh' + (i + 1);
    }

    var status = String(rows[i][16] || '').trim();
    if (status.toLowerCase() === 'deleted') continue;

    var stockVal = Number(rows[i][14] !== undefined && rows[i][14] !== '' ? rows[i][14] : 5);
    if (!status) {
      status = getStockStatus_(stockVal);
    }

    var rawDesc = String(rows[i][15] || '');
    var images = [];
    var cleanDesc = rawDesc;
    var imgMatch = rawDesc.match(/<!-- IMAGES:(.*?) -->/);
    if (imgMatch) {
      try {
        images = JSON.parse(imgMatch[1]);
        cleanDesc = rawDesc.replace(/<!-- IMAGES:[\s\S]*?-->\n?/, '').trim();
      } catch (_) {}
    }

    products.push({
      id: id,
      title: title,
      brand: String(rows[i][3] || 'Other'),
      category: String(rows[i][4] || 'phone'),
      price: Number(rows[i][5] || 0),
      oldPrice: Number(rows[i][6] || 0),
      condition: String(rows[i][7] || 'Brand New'),
      storage: String(rows[i][8] || 'N/A'),
      ram: String(rows[i][9] || 'N/A'),
      battery: String(rows[i][10] || 'N/A'),
      chip: String(rows[i][11] || 'N/A'),
      color: String(rows[i][12] || 'midnight'),
      warranty: String(rows[i][13] || '1 year official'),
      stock: stockVal,
      desc: cleanDesc,
      images: images,
      status: status
    });
  }
  return products;
}

/* =========================================================================
   3. ORDER HANDLERS (Columns AA - AM)
   ========================================================================= */

function placeOrder_(sheet, data) {
  var name = String(data.name || '').trim();
  var phone = String(data.phone || '').trim();
  var address = String(data.address || '').trim();

  if (!name || !phone) {
    return json_({ ok: false, error: 'Customer name and phone are required.' });
  }

  var ref = data.ref || ('MG-' + Math.random().toString(36).slice(2, 8).toUpperCase());
  var dateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Dhaka', 'yyyy-MM-dd HH:mm:ss');
  var phoneFormatted = phone ? ("'" + phone) : '';

  var details = '';
  if (Array.isArray(data.lines)) {
    details = data.lines.map(function(l) {
      return (l.qty || 1) + 'x ' + (l.title || 'Item') + ' (৳' + (l.price || 0) + ')';
    }).join('; ');
  } else if (data.details) {
    details = String(data.details);
  }

  var orderRow = [
    ref,
    dateStr,
    name,
    String(data.email || ''),
    phoneFormatted,
    address,
    String(data.area || ''),
    String(data.city || 'Dhaka'),
    String(data.payment || data.payment_method || 'Cash on delivery'),
    Number(data.items || 1),
    Number(data.total || 0),
    details,
    String(data.status || 'Pending')
  ];

  appendSectionRow_(sheet, COL_ORDER_START, orderRow);

  // 🎯 AUTO-DECREMENT PRODUCT STOCK IN GOOGLE SHEET (Column W / Col 23)
  if (Array.isArray(data.lines) && data.lines.length > 0) {
    var prodLastRow = getSectionLastRow_(sheet, COL_PROD_START);
    if (prodLastRow > 1) {
      var prodIds = sheet.getRange(2, COL_PROD_START, prodLastRow - 1, 1).getValues();
      var prodTitles = sheet.getRange(2, COL_PROD_START + 2, prodLastRow - 1, 1).getValues();

      for (var l = 0; l < data.lines.length; l++) {
        var lineItem = data.lines[l];
        var targetId = String(lineItem.id || '').trim();
        var targetTitle = String(lineItem.title || '').trim().toLowerCase();
        var qtyOrdered = Math.max(1, Number(lineItem.qty || 1));

        for (var p = 0; p < prodIds.length; p++) {
          var rowId = String(prodIds[p][0] || '').trim();
          var rowTitle = String(prodTitles[p][0] || '').trim().toLowerCase();

          if ((targetId && rowId === targetId) || (targetTitle && rowTitle === targetTitle)) {
            var stockCell = sheet.getRange(p + 2, 23); // Col W (Col 23) is Stock
            var currentStock = Number(stockCell.getValue() || 0);
            var newStock = Math.max(0, currentStock - qtyOrdered);
            stockCell.setValue(newStock);

            // 🎯 Auto-update Status column (Col Y / Col 25)
            var statusCell = sheet.getRange(p + 2, 25);
            statusCell.setValue(getStockStatus_(newStock));
            break;
          }
        }
      }
    }
  }

  return json_({
    ok: true,
    message: 'Order recorded and stock updated in sheet successfully',
    ref: ref
  });
}

function getOrdersList_(sheet) {
  var maxRow = Math.max(sheet.getLastRow(), getSectionLastRow_(sheet, COL_ORDER_START));
  var orders = [];
  if (maxRow < 2) return orders;

  var rows = sheet.getRange(1, COL_ORDER_START, maxRow, COL_ORDER_LEN).getValues();
  for (var i = 0; i < rows.length; i++) {
    var ref = String(rows[i][0] || '').trim();
    if (!ref || ref.toLowerCase() === 'order ref' || ref.toLowerCase().indexOf('section') > -1) continue;

    orders.push({
      ref: ref,
      placedAt: String(rows[i][1] || ''),
      name: String(rows[i][2] || ''),
      email: String(rows[i][3] || ''),
      phone: String(rows[i][4] || '').replace(/^'/, ''),
      address: String(rows[i][5] || ''),
      area: String(rows[i][6] || ''),
      city: String(rows[i][7] || ''),
      payment: String(rows[i][8] || 'Cash on delivery'),
      items: Number(rows[i][9] || 1),
      total: Number(rows[i][10] || 0),
      details: String(rows[i][11] || ''),
      status: String(rows[i][12] || 'Pending')
    });
  }
  return orders;
}

function updateOrderStatus_(sheet, data) {
  var ref = String(data.ref || data.orderRef || '').trim();
  var rawStatus = String(data.status || 'Confirmed').trim().toLowerCase();
  var newStatus = 'Pending';
  if (rawStatus === 'delivered') {
    newStatus = 'Delivered';
  } else if (rawStatus === 'confirmed') {
    newStatus = 'Confirmed';
  } else if (rawStatus === 'cancel' || rawStatus === 'cancelled') {
    newStatus = 'Cancel';
  } else {
    newStatus = 'Pending';
  }

  if (!ref) {
    return json_({ ok: false, error: 'Order reference required.' });
  }

  var maxRow = Math.max(sheet.getLastRow(), getSectionLastRow_(sheet, COL_ORDER_START));
  if (maxRow >= 2) {
    var rows = sheet.getRange(1, COL_ORDER_START, maxRow, 1).getValues();
    for (var r = 0; r < rows.length; r++) {
      var rowRef = String(rows[r][0] || '').trim();
      if (!rowRef || rowRef.toLowerCase() === 'order ref' || rowRef.toLowerCase().indexOf('section') > -1) {
        continue;
      }

      if (rowRef.toLowerCase() === ref.toLowerCase()) {
        var targetRow = r + 1; // 1-indexed sheet row
        // Col AM is Column 39 (Order Status in Google Sheet)
        sheet.getRange(targetRow, 39).setValue(newStatus);
        return json_({
          ok: true,
          message: 'Order ' + ref + ' status updated to ' + newStatus + ' in Google Sheet row ' + targetRow,
          ref: ref,
          status: newStatus,
          row: targetRow
        });
      }
    }
  }

  return json_({ ok: false, error: 'Order ref not found in Google Sheet: ' + ref });
}

/* =========================================================================
   SINGLE SHEET UTILITIES & FORMATTING
   ========================================================================= */

function getMasterSheet_() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) throw new Error('Active spreadsheet not found.');
  return book.getActiveSheet() || book.getSheets()[0];
}

/** Find last non-empty row in a specific column section */
function getSectionLastRow_(sheet, col) {
  var max = sheet.getLastRow();
  if (max === 0) return 0;
  var colData = sheet.getRange(1, col, max, 1).getValues();
  for (var r = colData.length - 1; r >= 0; r--) {
    var val = colData[r][0];
    if (val !== '' && val !== null && val !== undefined) {
      return r + 1;
    }
  }
  return 0;
}

/** Append a row in a specific column section without disrupting other sections */
function appendSectionRow_(sheet, startCol, values) {
  var lastRow = getSectionLastRow_(sheet, startCol);
  var nextRow = Math.max(lastRow + 1, 2); // Row 1 is header

  // Expand rows if needed
  if (nextRow > sheet.getMaxRows()) {
    sheet.insertRowsAfter(sheet.getMaxRows(), Math.max(nextRow - sheet.getMaxRows() + 10, 10));
  }
  // Expand columns if needed
  var requiredCols = startCol + values.length - 1;
  if (requiredCols > sheet.getMaxColumns()) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), requiredCols - sheet.getMaxColumns() + 5);
  }

  sheet.getRange(nextRow, startCol, 1, values.length).setValues([values]);
  return nextRow;
}

/** Format Row 1 as single master header with visual colors */
function initSingleSheetLayout_(sheet) {
  // Ensure enough columns
  if (sheet.getMaxColumns() < TOTAL_COLUMNS) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), TOTAL_COLUMNS - sheet.getMaxColumns() + 5);
  }

  var cellA1 = String(sheet.getRange(1, 1).getValue() || '').trim();
  if (cellA1 === 'User ID') {
    // Keep headers updated with ৳ indicators and ensure Bangladeshi Taka number format
    try {
      sheet.getRange(1, COL_PROD_START, 1, HEADERS_PRODUCTS.length).setValues([HEADERS_PRODUCTS]);
      sheet.getRange(1, COL_ORDER_START, 1, HEADERS_ORDERS.length).setValues([HEADERS_ORDERS]);
      sheet.getRange('N2:O').setNumberFormat('"৳"#,##0');
      sheet.getRange('AK2:AK').setNumberFormat('"৳"#,##0');

      var userRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['Active', 'Inactive', 'Suspended'], true)
        .setAllowInvalid(true)
        .build();
      sheet.getRange('G2:G').setDataValidation(userRule);

      var orderRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['Pending', 'Confirmed', 'Delivered'], true)
        .setAllowInvalid(true)
        .build();
      sheet.getRange('AM2:AM').setDataValidation(orderRule);
    } catch (_) {}
    return;
  }

  // 1. Users Headers (Cols A - G) - Navy Blue
  sheet.getRange(1, COL_USER_START, 1, HEADERS_USERS.length).setValues([HEADERS_USERS]);
  sheet.getRange(1, COL_USER_START, 1, HEADERS_USERS.length)
    .setFontWeight('bold')
    .setBackground('#1E3A8A')
    .setFontColor('#FFFFFF');

  // Separator 1 (Col H)
  sheet.getRange(1, COL_SEP1).setValue('── PRODUCTS ➔ ──');
  sheet.getRange(1, COL_SEP1).setFontWeight('bold').setBackground('#E2E8F0').setFontColor('#475569');

  // 2. Products Headers (Cols I - Y) - Forest Green
  sheet.getRange(1, COL_PROD_START, 1, HEADERS_PRODUCTS.length).setValues([HEADERS_PRODUCTS]);
  sheet.getRange(1, COL_PROD_START, 1, HEADERS_PRODUCTS.length)
    .setFontWeight('bold')
    .setBackground('#065F46')
    .setFontColor('#FFFFFF');

  // Separator 2 (Col Z)
  sheet.getRange(1, COL_SEP2).setValue('── ORDERS ➔ ──');
  sheet.getRange(1, COL_SEP2).setFontWeight('bold').setBackground('#E2E8F0').setFontColor('#475569');

  // 3. Orders Headers (Cols AA - AM) - Royal Purple
  sheet.getRange(1, COL_ORDER_START, 1, HEADERS_ORDERS.length).setValues([HEADERS_ORDERS]);
  sheet.getRange(1, COL_ORDER_START, 1, HEADERS_ORDERS.length)
    .setFontWeight('bold')
    .setBackground('#581C87')
    .setFontColor('#FFFFFF');

  // 🎯 Format Price & Total columns as Bangladeshi Taka (৳#,##0)
  // Col N: Price (14), Col O: Old Price (15), Col AK: Total Amount (37)
  try {
    sheet.getRange('N2:O').setNumberFormat('"৳"#,##0');
    sheet.getRange('AK2:AK').setNumberFormat('"৳"#,##0');
  } catch (_) {}

  // 🎯 Set Data Validation Dropdown for Column G (User Status)
  try {
    var userRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Active', 'Inactive', 'Suspended'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('G2:G').setDataValidation(userRule);
  } catch (_) {}

  // 🎯 Set Data Validation Dropdown for Column Y (Product Status)
  try {
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['In Stock', 'Low Stock', 'Out of Stock', 'Deleted'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('Y2:Y').setDataValidation(statusRule);
  } catch (_) {}

  // 🎯 Set Data Validation Dropdown for Column AM (Order Status - ONLY 3: Pending, Confirmed, Delivered)
  try {
    var orderRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pending', 'Confirmed', 'Delivered'], true)
      .setAllowInvalid(true)
      .build();
    sheet.getRange('AM2:AM').setDataValidation(orderRule);
  } catch (_) {}

  sheet.setFrozenRows(1);
}

/**
 * Auto-trigger when a cell is edited directly in the Google Sheet.
 * If Stock in Column W (Col 23) is edited manually, auto-updates Status in Column Y (Col 25).
 */
function onEdit(e) {
  if (!e || !e.range) return;
  try {
    var col = e.range.getColumn();
    var row = e.range.getRow();

    // If edited cell is Stock in Column W (Col 23) and not the header row
    if (col === 23 && row > 1) {
      var stockVal = Number(e.range.getValue());
      var sheet = e.range.getSheet();
      sheet.getRange(row, 25).setValue(getStockStatus_(stockVal));
    }
  } catch (err) {
    Logger.log('onEdit error: ' + err.message);
  }
}

/**
 * Utility to sync/recalculate Status for all existing products based on Column W
 */
function syncAllStockStatuses() {
  var sheet = getMasterSheet_();
  var lastRow = getSectionLastRow_(sheet, COL_PROD_START);
  if (lastRow <= 1) return;

  var stockValues = sheet.getRange(2, 23, lastRow - 1, 1).getValues();
  var statusRange = sheet.getRange(2, 25, lastRow - 1, 1);
  var currentStatuses = statusRange.getValues();

  var updated = [];
  for (var i = 0; i < stockValues.length; i++) {
    var cur = String(currentStatuses[i][0] || '').trim();
    if (cur.toLowerCase() === 'deleted') {
      updated.push(['Deleted']);
    } else {
      updated.push([getStockStatus_(stockValues[i][0])]);
    }
  }
  statusRange.setValues(updated);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Self-test function to initialize 1-sheet layout
 * Run in Apps Script Editor: select 'testSingleSheetSetup' and click Run.
 */
function testSingleSheetSetup() {
  var sheet = getMasterSheet_();
  initSingleSheetLayout_(sheet);
  syncAllStockStatuses();
  Logger.log('Mobile Gallery 1-Sheet Layout initialized in: ' + sheet.getName());
}
