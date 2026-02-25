"use client";
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from "../app/lib/firebase";
import { Send, Package, User, Phone, MapPin, Mail, AlertCircle } from 'lucide-react';

// Email sending function
const sendEmailNotification = async (orderData, type, recipient) => {
  try {
    const emailData = {
      to: recipient.email,
      toName: recipient.name,
      cc: recipient.cc || [],
      bcc: recipient.bcc || [],
      subject: getEmailSubject(type, orderData),
      type: type,
      orderId: orderData.orderId,
      orderDetails: {
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        productName: orderData.productName,
        quantity: orderData.quantity,
        installationDate: orderData.installationDate,
        address: orderData.customerAddress
      },
      message: getEmailMessage(type, orderData),
      status: 'sent',
      sentAt: serverTimestamp(),
      opens: 0,
      createdAt: new Date().toISOString()
    };

    // Save to Firebase
    const docRef = await addDoc(collection(db, 'email_logs'), emailData);
    console.log(`📧 Email sent to ${recipient.email}:`, docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
};

// Email subjects based on type
const getEmailSubject = (type, order) => {
  const subjects = {
    'order_confirmation': `📦 Order Confirmed #${order.orderId} - ${order.productName}`,
    'stock_manager': `🔔 New Order #${order.orderId} - Pending Stock Verification`,
    'hod_notification': `⚠️ Stock Alert: Order #${order.orderId} - ${order.productName}`,
    'dispatch_notification': `✅ Order Verified #${order.orderId} - Ready for Dispatch`,
    'customer_scheduled': `🎉 Installation Scheduled #${order.orderId}`,
    'installer_assigned': `🔧 New Installation Assignment #${order.orderId}`,
    'rejection_notification': `❌ Order Rejected #${order.orderId}`
  };
  return subjects[type] || `StockPro Update: Order #${order.orderId}`;
};

// Email messages based on type
const getEmailMessage = (type, order) => {
  const messages = {
    'order_confirmation': `
      <h2>Order Confirmed!</h2>
      <p>Dear ${order.customerName},</p>
      <p>Your order has been successfully placed.</p>
      <h3>Order Details:</h3>
      <ul>
        <li>Order ID: <strong>${order.orderId}</strong></li>
        <li>Product: <strong>${order.productName}</strong></li>
        <li>Quantity: <strong>${order.quantity}</strong></li>
        <li>Installation Date: <strong>${order.installationDate}</strong></li>
      </ul>
      <p>Our team will verify stock and contact you soon.</p>
    `,
    
    'stock_manager': `
      <h2>New Order Pending Verification</h2>
      <p>A new order requires stock verification:</p>
      <h3>Order Details:</h3>
      <ul>
        <li>Order ID: <strong>${order.orderId}</strong></li>
        <li>Customer: <strong>${order.customerName}</strong></li>
        <li>Product: <strong>${order.productName} x ${order.quantity}</strong></li>
        <li>Installation Date: <strong>${order.installationDate}</strong></li>
        <li>Customer Contact: ${order.customerEmail} | ${order.customerPhone}</li>
      </ul>
      <p><strong>Action Required:</strong> Please verify stock availability.</p>
    `,
    
    'dispatch_notification': `
      <h2>✅ Order Verified - Ready for Dispatch</h2>
      <p>Order has been verified by Stock Manager:</p>
      <ul>
        <li>Order ID: <strong>${order.orderId}</strong></li>
        <li>Customer: <strong>${order.customerName}</strong></li>
        <li>Product: <strong>${order.productName} x ${order.quantity}</strong></li>
      </ul>
      <p><strong>Action Required:</strong> Assign installation team.</p>
    `,
    
    'hod_notification': `
      <h2>⚠️ Urgent: Stock Required</h2>
      <p>Stock Manager needs approval for additional stock:</p>
      <ul>
        <li>Order ID: <strong>${order.orderId}</strong></li>
        <li>Product: <strong>${order.productName}</strong></li>
        <li>Quantity Required: <strong>${order.quantity}</strong></li>
        <li>Customer: <strong>${order.customerName}</strong></li>
      </ul>
      <p><strong>Action Required:</strong> Approve stock purchase.</p>
    `
  };
  return messages[type] || 'StockPro System Update';
};

const OrderForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    productName: '',
    quantity: 1,
    installationDate: '',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailStatus, setEmailStatus] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailStatus([]);
    
    try {
      const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
      
      // Create order in Firebase
      const orderData = {
        ...formData,
        orderId: orderId,
        status: 'pending_verification',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: 'sales_person',
        timeline: [
          {
            status: 'Order Created',
            timestamp: new Date().toISOString(),
            note: `Order created by Sales Team`,
            by: 'sales'
          }
        ]
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Email Status Tracking
      const emailResults = [];

      // 📧 EMAIL 1: Customer Confirmation
      emailResults.push(await sendEmailNotification(
        orderData, 
        'order_confirmation', 
        { email: formData.customerEmail, name: formData.customerName }
      ));

      // 📧 EMAIL 2: Stock Manager Notification
      emailResults.push(await sendEmailNotification(
        orderData, 
        'stock_manager', 
        { 
          email: 'stock@stockpro.com', 
          name: 'Stock Manager',
          cc: ['hod@stockpro.com'] // HOD in CC
        }
      ));

      // 📧 EMAIL 3: Sales Team (for tracking)
      emailResults.push(await sendEmailNotification(
        orderData, 
        'order_confirmation', 
        { email: 'sales@stockpro.com', name: 'Sales Team' }
      ));

      setEmailStatus(emailResults);
      setSuccess(true);
      
      // Clear form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        productName: '',
        quantity: 1,
        installationDate: '',
        specialInstructions: ''
      });

      setTimeout(() => setSuccess(false), 5000);
      
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-6">New Installation Order</h2>
          
          {/* Success Message with Email Status */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="text-green-400 font-medium mb-2">✓ Order submitted successfully!</p>
              <div className="space-y-1">
                {emailStatus.map((status, index) => (
                  <p key={index} className="text-sm text-slate-300">
                    {status.success ? '📧 Email sent' : '❌ Email failed'}
                  </p>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Details */}
            <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <User size={20} className="text-blue-400" /> Customer Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500"
                    placeholder="Enter customer name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500"
                    placeholder="customer@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500"
                    placeholder="+91 98765 43210"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Address *
                  </label>
                  <textarea
                    required
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                    rows="2"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500"
                    placeholder="Complete address"
                  />
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-slate-800/50 rounded-xl p-5 space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Package size={20} className="text-blue-400" /> Product Details
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Product Name *
                  </label>
                  <select
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({...formData, productName: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500"
                  >
                    <option value="">Select Product</option>
                    <option value="AC Installation">Digital Board</option>
                    <option value="Water Purifier">4k Ptz Camera</option>
                    <option value="Geyser Installation">Pannel Light</option>
                    <option value="Chimney Installation">Server</option>
                    <option value="Inverter Installation">Mic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Installation Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.installationDate}
                    onChange={(e) => setFormData({...formData, installationDate: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Special Instructions
                  </label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
                    rows="2"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:border-blue-500"
                    placeholder="Any special instructions for installation"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Submit Order'} 
              {!loading && <Send size={18} />}
            </button>
          </form>

          {/* Email Flow Information */}
          <div className="mt-8 p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Mail size={16} className="text-blue-400" />
              Email Flow After Submission:
            </h4>
            <div className="space-y-2 text-sm text-slate-300">
              <p>1️⃣ 📧 Customer → Order Confirmation</p>
              <p>2️⃣ 📧 Stock Manager → New Order (Pending Verification)</p>
              <p>3️⃣ 📧 HOD (CC) → Order Created</p>
              <p>4️⃣ 📧 Sales Team → Copy of Order</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;