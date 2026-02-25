// Email service using EmailJS or your preferred service
export const sendEmail = async (to, subject, template, data) => {
  // Implementation with your email service
  console.log(`Sending email to ${to}: ${subject}`, data);
};

export const sendEmailToStockManager = async (order) => {
  await sendEmail(
    'stockmanager@company.com',
    'New Order Received',
    'new_order_template',
    { order }
  );
};

export const sendEmailToDispatch = async (order) => {
  await sendEmail(
    'dispatch@company.com',
    'Order Verified by Stock',
    'verified_order_template',
    { order }
  );
};

export const sendEmailToCustomer = async (order, installer) => {
  await sendEmail(
    order.customerEmail,
    'Installation Scheduled',
    'installation_scheduled',
    { 
      customerName: order.customerName,
      date: order.installationDate,
      installer: installer.name,
      installerPhone: installer.phone
    }
  );
};

export const sendInstallationCompleteEmail = async (order, installationData) => {
  await sendEmail(
    order.customerEmail,
    'Installation Complete',
    'installation_complete',
    {
      customerName: order.customerName,
      remarks: installationData.remarks,
      charges: installationData.anyCharges ? installationData.chargeAmount : 0
    }
  );
};