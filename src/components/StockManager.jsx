"use client";
import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  addDoc, 
  serverTimestamp,
  orderBy,
  limit,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../app/lib/firebase';
import { 
  Package, 
  Check, 
  X, 
  AlertTriangle, 
  Mail, 
  Clock, 
  Send,
  Eye,
  User,
  Phone,
  MapPin,
  Calendar,
  Search,
  RefreshCw,
  Truck,
  Users,
  FileText,
  Settings,
  Download,
  Filter,
  ChevronDown,
  Plus,
  Minus,
  Edit,
  Save,
  Copy,
  Printer,
  HelpCircle
} from 'lucide-react';

// Default email configuration
const DEFAULT_EMAILS = {
  hod: 'hod@company.com',
  dispatch: 'dispatch@company.com',
  sales: 'sales@company.com'
};

const StockManager = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showHodModal, setShowHodModal] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [stockLevels, setStockLevels] = useState({});
  const [dispatchNote, setDispatchNote] = useState('');
  const [hodMessage, setHodMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('pending');
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailConfig, setEmailConfig] = useState(DEFAULT_EMAILS);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    hodPending: 0,
    rejected: 0
  });
  const [indexStatus, setIndexStatus] = useState('checking'); // 'checking', 'ready', 'needed'

  // Load saved emails from localStorage
  useEffect(() => {
    const savedEmails = localStorage.getItem('stockManagerEmails');
    if (savedEmails) {
      setEmailConfig(JSON.parse(savedEmails));
    }
  }, []);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, [filter]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchStockLevels(),
        fetchEmailLogsWithFallback()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders based on filter
  const fetchOrders = async () => {
    try {
      let q;
      if (filter === 'all') {
        q = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'orders'),
          where('status', '==', filter),
          orderBy('createdAt', 'desc')
        );
      }
      
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          verifiedAt: data.verifiedAt?.toDate?.() || null,
          hodNotifiedAt: data.hodNotifiedAt?.toDate?.() || null
        };
      });
      
      setOrders(ordersData);
      
      // Update stats
      const allOrders = await getAllOrders();
      setStats({
        total: allOrders.length,
        pending: allOrders.filter(o => o.status === 'pending_verification').length,
        verified: allOrders.filter(o => o.status === 'verified').length,
        hodPending: allOrders.filter(o => o.status === 'hod_pending').length,
        rejected: allOrders.filter(o => o.status === 'rejected').length
      });
      
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Get all orders for stats
  const getAllOrders = async () => {
    const snapshot = await getDocs(collection(db, 'orders'));
    return snapshot.docs.map(doc => doc.data());
  };

  // Fetch stock levels
  const fetchStockLevels = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'inventory'));
      const stock = {};
      snapshot.docs.forEach(doc => {
        stock[doc.data().productName] = doc.data().quantity;
      });
      setStockLevels(stock);
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  };

  // Fetch email logs with fallback for index
  const fetchEmailLogsWithFallback = async () => {
    try {
      let logs = [];
      
      // Try with index first
      try {
        const q = query(
          collection(db, 'email_logs'),
          where('triggeredBy', '==', 'stock_manager'),
          orderBy('sentAt', 'desc'),
          limit(20)
        );
        
        const snapshot = await getDocs(q);
        logs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          sentAt: doc.data().sentAt?.toDate?.() || new Date()
        }));
        
        setIndexStatus('ready');
        console.log('✅ Index working properly');
        
      } catch (indexError) {
        // Check if it's index error
        if (indexError.code === 'failed-precondition' || indexError.message?.includes('index')) {
          setIndexStatus('needed');
          console.log('⚠️ Index needed, using fallback query');
          
          // Fallback: Get all and filter client-side
          const fallbackQuery = query(
            collection(db, 'email_logs'),
            orderBy('sentAt', 'desc'),
            limit(100)
          );
          
          const snapshot = await getDocs(fallbackQuery);
          const allLogs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            sentAt: doc.data().sentAt?.toDate?.() || new Date()
          }));
          
          // Client-side filter
          logs = allLogs.filter(log => log.triggeredBy === 'stock_manager').slice(0, 20);
          
        } else {
          // Other error
          throw indexError;
        }
      }
      
      setEmailLogs(logs);
      
    } catch (error) {
      console.error('Error in email logs:', error);
      setEmailLogs([]);
    }
  };

  // Initialize collections if they don't exist
  const initializeCollections = async () => {
    try {
      // Check if email_logs collection exists by trying to add a test document
      const testRef = collection(db, 'email_logs');
      const testDoc = await addDoc(testRef, {
        test: true,
        createdAt: serverTimestamp(),
        triggeredBy: 'system'
      });
      
      // Delete test document
      await deleteDoc(doc(db, 'email_logs', testDoc.id));
      
      console.log('✅ Collections initialized');
      
    } catch (error) {
      console.error('Error initializing collections:', error);
    }
  };

  // Call initialization on mount
  useEffect(() => {
    initializeCollections();
  }, []);

  // Send email function
  const sendEmail = async ({ to, cc = [], subject, message, type, orderId }) => {
    try {
      // Ensure email_logs collection exists by adding document
      const emailData = {
        to,
        cc,
        subject,
        message,
        type,
        orderId,
        status: 'sent',
        sentAt: serverTimestamp(),
        triggeredBy: 'stock_manager',
        opens: 0,
        metadata: {
          timestamp: new Date().toISOString(),
          from: 'Stock Manager'
        }
      };
      
      // Add to Firebase - collection auto-create hoga
      const docRef = await addDoc(collection(db, 'email_logs'), emailData);
      console.log(`📧 Email sent to ${to}:`, docRef.id);
      
      // Also save to localStorage for backup
      const localEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
      localEmails.push({
        id: docRef.id,
        ...emailData,
        sentAt: new Date().toISOString()
      });
      localStorage.setItem('sentEmails', JSON.stringify(localEmails.slice(-50)));
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Email error:', error);
      
      // Save to localStorage as fallback
      const localEmails = JSON.parse(localStorage.getItem('sentEmails') || '[]');
      localEmails.push({
        id: 'local-' + Date.now(),
        to,
        cc,
        subject,
        type,
        orderId,
        status: 'sent (local)',
        sentAt: new Date().toISOString(),
        triggeredBy: 'stock_manager'
      });
      localStorage.setItem('sentEmails', JSON.stringify(localEmails.slice(-50)));
      
      return { success: false, error, local: true };
    }
  };

  // Handle send to dispatch
  const handleSendToDispatch = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      // Update order status
      const orderRef = doc(db, 'orders', selectedOrder.id);
      await updateDoc(orderRef, {
        status: 'verified',
        verifiedBy: 'stock_manager',
        verifiedAt: serverTimestamp(),
        dispatchNote: dispatchNote || 'Stock verified offline',
        timeline: [...(selectedOrder.timeline || []), {
          status: 'Stock Verified',
          timestamp: new Date().toISOString(),
          note: `✅ Stock verified offline - Sent to Dispatch`,
          by: 'stock_manager',
          note: dispatchNote || 'No additional notes'
        }]
      });

      // Send email to Dispatch
      await sendEmail({
        to: emailConfig.dispatch,
        cc: [emailConfig.hod],
        subject: `✅ Order Verified: ${selectedOrder.orderId} - ${selectedOrder.customerName}`,
        message: generateDispatchEmail(selectedOrder, dispatchNote),
        type: 'dispatch_notification',
        orderId: selectedOrder.id
      });

      setShowOrderModal(false);
      setShowDispatchModal(false);
      setDispatchNote('');
      alert('✅ Order sent to Dispatch! Email sent successfully.');
      fetchAllData();
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error processing order: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Generate dispatch email HTML
  const generateDispatchEmail = (order, note) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Order Verified</h1>
          <p style="color: #d1fae5; margin: 5px 0 0;">Ready for Dispatch</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 18px;">📋 Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 40%;">Order ID:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #111827;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Customer:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Product:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.productName} x ${order.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Installation Date:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.installationDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Address:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.customerAddress}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 18px;">📞 Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.customerEmail}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 18px;">📝 Note from Stock Manager</h2>
            <p style="color: #4b5563; margin: 0;">${note || 'Stock verified offline. Ready for dispatch.'}</p>
          </div>

          <div style="background: #dbeafe; padding: 20px; border-radius: 8px;">
            <p style="color: #1e40af; margin: 0; font-weight: bold; text-align: center;">
              ⚡ Action Required: Please assign installation team and approve for dispatch.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              This is an automated email from StockPro System<br>
              Sent by Stock Manager at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // Handle notify HOD
  const handleNotifyHod = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      // Send email to HOD
      await sendEmail({
        to: emailConfig.hod,
        cc: [emailConfig.dispatch],
        subject: `🚨 Stock Required: ${selectedOrder.orderId} - ${selectedOrder.productName}`,
        message: generateHodEmail(selectedOrder, hodMessage, stockLevels),
        type: 'hod_notification',
        orderId: selectedOrder.id
      });

      // Update order status
      const orderRef = doc(db, 'orders', selectedOrder.id);
      await updateDoc(orderRef, {
        status: 'hod_pending',
        hodNotified: true,
        hodNotifiedAt: serverTimestamp(),
        hodMessage: hodMessage,
        timeline: [...(selectedOrder.timeline || []), {
          status: 'HOD Notified',
          timestamp: new Date().toISOString(),
          note: `⏳ Stock unavailable - HOD notified`,
          by: 'stock_manager',
          message: hodMessage || 'Stock required'
        }]
      });

      setShowOrderModal(false);
      setShowHodModal(false);
      setHodMessage('');
      alert('📧 HOD notified! Email sent successfully.');
      fetchAllData();
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error notifying HOD: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Generate HOD email HTML
  const generateHodEmail = (order, message, stock) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Stock Required</h1>
          <p style="color: #fef3c7; margin: 5px 0 0;">Urgent Approval Needed</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 18px;">📋 Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Customer:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Product:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.productName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Required Quantity:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Current Stock:</td>
                <td style="padding: 8px 0; font-weight: bold; color: #ef4444;">
                  ${stock[order.productName] || 0} units
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 18px;">📝 Message from Stock Manager</h2>
            <p style="color: #4b5563; margin: 0;">${message || 'Please approve additional stock for this order'}</p>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px;">
            <p style="color: #92400e; margin: 0; font-weight: bold; text-align: center;">
              ⚡ Action Required: Please approve stock purchase.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              This is an automated email from StockPro System<br>
              Sent by Stock Manager at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // Handle order rejection
  const handleRejectOrder = async (order) => {
    if (!confirm('Are you sure you want to reject this order?')) return;
    
    setProcessing(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: 'rejected',
        rejectedBy: 'stock_manager',
        rejectedAt: serverTimestamp(),
        timeline: [...(order.timeline || []), {
          status: 'Order Rejected',
          timestamp: new Date().toISOString(),
          note: `❌ Order rejected by Stock Manager`,
          by: 'stock_manager'
        }]
      });

      // Send email to Sales
      await sendEmail({
        to: emailConfig.sales,
        subject: `❌ Order Rejected: ${order.orderId}`,
        message: generateRejectionEmail(order),
        type: 'rejection_notification',
        orderId: order.id
      });

      alert('❌ Order rejected!');
      fetchAllData();
      
    } catch (error) {
      console.error('Error:', error);
      alert('Error rejecting order');
    } finally {
      setProcessing(false);
    }
  };

  // Generate rejection email HTML
  const generateRejectionEmail = (order) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">❌ Order Rejected</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 18px;">📋 Order Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Customer:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Product:</td>
                <td style="padding: 8px 0; font-weight: bold;">${order.productName} x ${order.quantity}</td>
              </tr>
            </table>
          </div>

          <p style="color: #6b7280; margin: 20px 0; text-align: center;">
            Please contact customer for alternatives.
          </p>
        </div>
      </div>
    `;
  };

  // Save email settings
  const saveEmailSettings = () => {
    localStorage.setItem('stockManagerEmails', JSON.stringify(emailConfig));
    setShowEmailSettings(false);
    alert('✅ Email settings saved!');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending_verification':
        return { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30', text: '⏳ Pending' };
      case 'verified':
        return { color: 'bg-green-600/20 text-green-400 border-green-500/30', text: '✅ Verified' };
      case 'hod_pending':
        return { color: 'bg-purple-600/20 text-purple-400 border-purple-500/30', text: '👔 HOD Pending' };
      case 'rejected':
        return { color: 'bg-red-600/20 text-red-400 border-red-500/30', text: '❌ Rejected' };
      default:
        return { color: 'bg-slate-600/20 text-slate-400 border-slate-500/30', text: status };
    }
  };

  // Create index link
  const getIndexLink = () => {
    return 'https://console.firebase.google.com/v1/r/project/attendence-tracker-90940/firestore/indexes?create_composite=Cltwcm9qZWN0cy9hdHRlbmRlbmNlLXRyYWNrZXItOTA5NDAvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2VtYWlsX2xvZ3MvaW5kZXhlcy9fEAEaDwoLdHJpZ2dlcmVkQnkQARoKCgZzZW50QXQQAhoMCghfX25hbWVfXxAC';
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📦 Stock Manager</h1>
            <p className="text-slate-400">Offline stock verification & dispatch management</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Index Status Indicator */}
            {indexStatus === 'needed' && (
              <a
                href={getIndexLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-600/30 flex items-center gap-2"
              >
                <AlertTriangle size={16} />
                Create Index
              </a>
            )}
            
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              title="Help"
            >
              <HelpCircle size={20} />
            </button>
            
            <button
              onClick={() => setShowEmailSettings(true)}
              className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white flex items-center gap-2"
            >
              <Settings size={16} /> Email Settings
            </button>
            
            <button
              onClick={fetchAllData}
              className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4">
            <Package size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-sm text-blue-100">Total Orders</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-4">
            <Clock size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
            <p className="text-sm text-yellow-100">Pending</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4">
            <Check size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.verified}</p>
            <p className="text-sm text-green-100">Verified</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
            <Users size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.hodPending}</p>
            <p className="text-sm text-purple-100">HOD Pending</p>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4">
            <X size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.rejected}</p>
            <p className="text-sm text-red-100">Rejected</p>
          </div>
        </div>

        {/* Active Email Config */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="text-slate-400">📧 Dispatch:</span>
            <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded">{emailConfig.dispatch}</span>
            <span className="text-slate-400">| HOD:</span>
            <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded">{emailConfig.hod}</span>
            <span className="text-slate-400">| Sales:</span>
            <span className="text-white font-mono bg-slate-800 px-2 py-1 rounded">{emailConfig.sales}</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="🔍 Search by customer, order ID, product, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white"
            >
              <option value="pending">⏳ Pending Orders</option>
              <option value="verified">✅ Verified</option>
              <option value="hod_pending">👔 HOD Pending</option>
              <option value="rejected">❌ Rejected</option>
              <option value="all">📋 All Orders</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-slate-400">No orders found</div>
          ) : (
            orders.filter(order => 
              order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.customerPhone?.includes(searchTerm)
            ).map((order) => {
              const status = getStatusBadge(order.status);
              const stockAvailable = stockLevels[order.productName] || 0;
              
              return (
                <div key={order.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6 hover:border-blue-500/30 transition-all">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{order.customerName}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">Order ID</p>
                          <p className="text-white font-mono text-xs">{order.orderId}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Product</p>
                          <p className="text-white">{order.productName} x {order.quantity}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Installation</p>
                          <p className="text-white">{order.installationDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Stock</p>
                          <p className={`${stockAvailable >= order.quantity ? 'text-green-400' : 'text-red-400'}`}>
                            {stockAvailable} units
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone size={12} /> {order.customerPhone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail size={12} /> {order.customerEmail}
                        </span>
                      </div>

                      {order.dispatchNote && (
                        <div className="mt-2 text-xs text-blue-400 bg-blue-600/10 p-2 rounded">
                          📝 Note: {order.dispatchNote}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600/30 flex items-center gap-1 text-sm"
                      >
                        <Eye size={16} /> View
                      </button>
                      
                      {order.status === 'pending_verification' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowDispatchModal(true);
                            }}
                            className="px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-600/30 flex items-center gap-1 text-sm"
                          >
                            <Truck size={16} /> Send to Dispatch
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowHodModal(true);
                            }}
                            className="px-3 py-2 bg-yellow-600/20 border border-yellow-500/30 rounded-lg text-yellow-400 hover:bg-yellow-600/30 flex items-center gap-1 text-sm"
                          >
                            <Users size={16} /> Notify HOD
                          </button>
                          
                          <button
                            onClick={() => handleRejectOrder(order)}
                            className="p-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600/30"
                            title="Reject Order"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Email Logs */}
        <div className="mt-8 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Mail size={16} className="text-blue-400" />
              Recent Email Logs
            </h3>
            {indexStatus === 'needed' && (
              <span className="text-xs text-yellow-400 bg-yellow-600/20 px-2 py-1 rounded">
                ⚡ Using client-side filter
              </span>
            )}
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {emailLogs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No emails sent yet</p>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="text-sm text-slate-400 flex items-center justify-between p-2 hover:bg-slate-800/50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="truncate max-w-md">{log.subject}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500">→ {log.to}</span>
                    <span className="text-slate-600">{log.sentAt.toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-lg w-full border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="text-blue-400" size={20} />
                Help & Information
              </h3>
              <button onClick={() => setShowHelpModal(false)}>
                <X size={20} className="text-slate-400 hover:text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">📧 Email System</h4>
                <p className="text-sm text-slate-300">
                  Emails are saved in Firebase and localStorage. Collections auto-create hote hain.
                </p>
              </div>

              <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">⚡ Index Required</h4>
                <p className="text-sm text-slate-300 mb-3">
                  For better performance, create a composite index:
                </p>
                <a
                  href={getIndexLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Create Index <AlertTriangle size={16} />
                </a>
              </div>

              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">✅ Collections Auto-Create</h4>
                <p className="text-sm text-slate-300">
                  • orders - Auto creates<br />
                  • email_logs - Auto creates<br />
                  • inventory - Auto creates<br />
                  • notifications - Auto creates
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Settings Modal */}
      {showEmailSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-md w-full border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">📧 Email Settings</h3>
              <button onClick={() => setShowEmailSettings(false)}>
                <X size={20} className="text-slate-400 hover:text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Dispatch Team Email</label>
                <input
                  type="email"
                  value={emailConfig.dispatch}
                  onChange={(e) => setEmailConfig({...emailConfig, dispatch: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="dispatch@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">HOD Email</label>
                <input
                  type="email"
                  value={emailConfig.hod}
                  onChange={(e) => setEmailConfig({...emailConfig, hod: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="hod@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Sales Team Email</label>
                <input
                  type="email"
                  value={emailConfig.sales}
                  onChange={(e) => setEmailConfig({...emailConfig, sales: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="sales@company.com"
                />
              </div>
              
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-400">
                  ℹ️ These emails will be saved in your browser. Set once and use forever.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveEmailSettings}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowEmailSettings(false)}
                  className="flex-1 bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
              <h2 className="text-xl font-bold text-white">Order Details</h2>
              <button onClick={() => setShowOrderModal(false)}>
                <X size={20} className="text-slate-400 hover:text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Customer Info */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Name</p>
                    <p className="text-white">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-white">{selectedOrder.customerPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-white">{selectedOrder.customerEmail}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400">Address</p>
                    <p className="text-white">{selectedOrder.customerAddress}</p>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Order ID</p>
                    <p className="text-white font-mono">{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Product</p>
                    <p className="text-white">{selectedOrder.productName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Quantity</p>
                    <p className="text-white">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Installation Date</p>
                    <p className="text-white">{selectedOrder.installationDate}</p>
                  </div>
                </div>
              </div>

              {/* Stock Info */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Stock Information</h3>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Available Stock:</span>
                  <span className={`font-bold ${stockLevels[selectedOrder.productName] >= selectedOrder.quantity ? 'text-green-400' : 'text-red-400'}`}>
                    {stockLevels[selectedOrder.productName] || 0} units
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-slate-400">Required:</span>
                  <span className="text-white font-bold">{selectedOrder.quantity} units</span>
                </div>
              </div>

              {/* Timeline */}
              {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">Timeline</h3>
                  <div className="space-y-2">
                    {selectedOrder.timeline.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Clock size={14} className="text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-white">{item.status}</p>
                          <p className="text-xs text-slate-500">{item.timestamp}</p>
                          {item.note && (
                            <p className="text-xs text-slate-400 mt-1">{item.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send to Dispatch Modal */}
      {showDispatchModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-md w-full border border-slate-800">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Truck className="text-green-400" size={20} />
                Send to Dispatch
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-sm text-slate-300">
                  Order will be sent to: <span className="text-white font-mono">{emailConfig.dispatch}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">CC: {emailConfig.hod}</p>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Instructions (optional)</label>
                <textarea
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                  rows="3"
                  placeholder="Add any notes for Dispatch team..."
                />
              </div>
              
              <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-sm text-yellow-400 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Stock will be marked as verified offline
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSendToDispatch}
                  disabled={processing}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? 'Sending...' : 'Send to Dispatch'} <Send size={16} />
                </button>
                <button
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notify HOD Modal */}
      {showHodModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-md w-full border border-slate-800">
            <div className="p-6 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="text-yellow-400" size={20} />
                Notify HOD
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-sm text-slate-300">
                  Will be sent to: <span className="text-white font-mono">{emailConfig.hod}</span>
                </p>
              </div>
              
              <div className="bg-red-600/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-400 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Stock: {stockLevels[selectedOrder.productName] || 0} available, {selectedOrder.quantity} required
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Message to HOD</label>
                <textarea
                  value={hodMessage}
                  onChange={(e) => setHodMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white"
                  rows="3"
                  placeholder="Why is additional stock needed?"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleNotifyHod}
                  disabled={processing}
                  className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? 'Notifying...' : 'Notify HOD'} <Send size={16} />
                </button>
                <button
                  onClick={() => setShowHodModal(false)}
                  className="flex-1 bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManager;