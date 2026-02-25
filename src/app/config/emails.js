// config/emails.js
// 🔥 YAHAN APNI REAL EMAIL IDs DALO

export const EMAIL_CONFIG = {
  // 📨 HOD (Head of Department)
  HOD: {
    email: 'dharmsharma201@gmail.com',        // 👈 YAHAN HOD KA EMAIL DALO
    name: 'HOD - StockPro',
    cc: [''],      // 👈 CC mein kisko rakhna hai
    bcc: []                                // 👈 BCC mein kisko rakhna hai
  },

  // 📨 DISPATCH TEAM
  DISPATCH: {
    email: 'dispatch@yourcompany.com',     // 👈 YAHAN DISPATCH KA EMAIL DALO
    name: 'Dispatch Team',
    cc: ['hod@yourcompany.com'],           // 👈 HOD ko CC rakhega
    bcc: []
  },

  // 📨 STOCK MANAGER (khud ko bhi CC kar sakte ho)
  STOCK: {
    email: 'stock@yourcompany.com',        // 👈 YAHAN STOCK MANAGER KA EMAIL DALO
    name: 'Stock Manager',
    cc: [],
    bcc: []
  },

  // 📨 SALES TEAM
  SALES: {
    email: 'sales@yourcompany.com',        // 👈 YAHAN SALES TEAM KA EMAIL DALO
    name: 'Sales Team',
    cc: [],
    bcc: []
  },

  // 📨 INSTALLATION TEAM
  INSTALLATION: {
    email: 'installation@yourcompany.com', // 👈 YAHAN INSTALLATION KA EMAIL DALO
    name: 'Installation Team',
    cc: [],
    bcc: []
  },

  // 📨 CUSTOMER (dynamic hai, yahan mat dalo)
  CUSTOMER: {
    // Ye order form se lega
  }
};