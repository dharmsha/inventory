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
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../app/lib/firebase';
import { 
  LayoutDashboard,
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
  Edit,
  Save,
  Copy,
  Printer,
  HelpCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Activity,
  Globe,
  Home,
  LogOut,
  Bell,
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  MinusCircle,
  PlusCircle,
  Archive,
  Trash2
} from 'lucide-react';

// Default email configuration
const DEFAULT_EMAILS = {
  hod: 'hod@company.com',
  dispatch: 'dispatch@company.com',
  stock: 'stock@company.com',
  sales: 'sales@company.com',
  installer: 'installer@company.com'
};

const HodAdminPanel = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stockRequests, setStockRequests] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [installationPersons, setInstallationPersons] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('week');
  const [emailConfig, setEmailConfig] = useState(DEFAULT_EMAILS);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    verifiedOrders: 0,
    dispatchedOrders: 0,
    installedOrders: 0,
    rejectedOrders: 0,
    stockRequests: 0,
    totalStock: 0,
    lowStock: 0,
    activeInstallers: 0,
    totalEmails: 0,
    openedEmails: 0
  });

  // Load saved emails from localStorage
  useEffect(() => {
    const savedEmails = localStorage.getItem('hodEmails');
    if (savedEmails) {
      setEmailConfig(JSON.parse(savedEmails));
    }
  }, []);

  // Fetch all data
  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchStockRequests(),
        fetchEmailLogs(),
        fetchInventory(),
        fetchInstallationPersons()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          verifiedAt: data.verifiedAt?.toDate?.() || null,
          dispatchedAt: data.dispatchedAt?.toDate?.() || null,
          installedAt: data.installedAt?.toDate?.() || null
        };
      });
      
      setOrders(ordersData);
      
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch stock requests
  const fetchStockRequests = async () => {
    try {
      const q = query(
        collection(db, 'hod_notifications'),
        orderBy('requestedAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate?.() || new Date(),
        approvedAt: doc.data().approvedAt?.toDate?.() || null
      }));
      
      setStockRequests(requests);
      
    } catch (error) {
      console.error('Error fetching stock requests:', error);
    }
  };

  // Fetch email logs
  const fetchEmailLogs = async () => {
    try {
      const q = query(
        collection(db, 'email_logs'),
        orderBy('sentAt', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate?.() || new Date()
      }));
      
      setEmailLogs(logs);
      
    } catch (error) {
      console.error('Error fetching email logs:', error);
    }
  };

  // Fetch inventory
  const fetchInventory = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'inventory'));
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInventory(items);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  // Fetch installation persons
  const fetchInstallationPersons = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'installation_team'));
      const persons = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInstallationPersons(persons);
    } catch (error) {
      console.error('Error fetching installation persons:', error);
    }
  };

  // Update stats
  useEffect(() => {
    const lowStockItems = inventory.filter(item => item.quantity < 10).length;
    const openedEmails = emailLogs.filter(log => log.opens > 0).length;
    
    setStats({
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending_verification').length,
      verifiedOrders: orders.filter(o => o.status === 'verified').length,
      dispatchedOrders: orders.filter(o => o.status === 'dispatched').length,
      installedOrders: orders.filter(o => o.status === 'installed').length,
      rejectedOrders: orders.filter(o => o.status === 'rejected').length,
      stockRequests: stockRequests.filter(r => r.status === 'pending').length,
      totalStock: inventory.reduce((sum, item) => sum + (item.quantity || 0), 0),
      lowStock: lowStockItems,
      activeInstallers: installationPersons.length,
      totalEmails: emailLogs.length,
      openedEmails: openedEmails
    });
  }, [orders, stockRequests, emailLogs, inventory, installationPersons]);

  // Handle approve stock request
  const handleApproveStock = async (request) => {
    setProcessing(true);
    try {
      const inventoryItem = inventory.find(i => i.productName === request.productName);
      const currentQuantity = inventoryItem?.quantity || 0;
      const newQuantity = currentQuantity + request.requiredQuantity;

      // Update inventory
      const inventoryRef = doc(db, 'inventory', request.productName);
      await updateDoc(inventoryRef, {
        quantity: newQuantity,
        lastUpdated: serverTimestamp(),
        lastUpdatedBy: 'hod'
      });

      // Update request status
      const requestRef = doc(db, 'hod_notifications', request.id);
      await updateDoc(requestRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: 'hod',
        previousStock: currentQuantity,
        newStock: newQuantity
      });

      // Update order status
      if (request.orderId) {
        const orderRef = doc(db, 'orders', request.orderId);
        await updateDoc(orderRef, {
          status: 'verified',
          stockApprovedByHod: true,
          hodApprovedAt: serverTimestamp(),
          timeline: [...(request.customerDetails?.timeline || []), {
            status: 'Stock Approved by HOD',
            timestamp: new Date().toISOString(),
            note: `✅ Stock approved: ${request.requiredQuantity} units added`,
            by: 'hod'
          }]
        });
      }

      // Send email to Stock Manager
      await sendEmail({
        to: emailConfig.stock,
        subject: `✅ Stock Approved: ${request.productName}`,
        message: generateStockApprovalEmail(request, currentQuantity, newQuantity),
        type: 'stock_approved',
        orderId: request.orderId,
        metadata: {
          product: request.productName,
          quantity: request.requiredQuantity
        }
      });

      alert('✅ Stock approved successfully!');
      fetchAllData();
      setShowDetailsModal(false);
      
    } catch (error) {
      console.error('Error approving stock:', error);
      alert('Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject stock request
  const handleRejectStock = async (request) => {
    if (!confirm('Are you sure you want to reject this stock request?')) return;
    
    setProcessing(true);
    try {
      const requestRef = doc(db, 'hod_notifications', request.id);
      await updateDoc(requestRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: 'hod'
      });

      // Update order status
      if (request.orderId) {
        const orderRef = doc(db, 'orders', request.orderId);
        await updateDoc(orderRef, {
          status: 'rejected',
          rejectedBy: 'hod',
          rejectedAt: serverTimestamp(),
          timeline: [...(request.customerDetails?.timeline || []), {
            status: 'Stock Request Rejected',
            timestamp: new Date().toISOString(),
            note: `❌ Stock request rejected by HOD`,
            by: 'hod'
          }]
        });
      }

      // Send email to Stock Manager
      await sendEmail({
        to: emailConfig.stock,
        subject: `❌ Stock Request Rejected: ${request.productName}`,
        message: generateStockRejectionEmail(request),
        type: 'stock_rejected',
        orderId: request.orderId
      });

      alert('❌ Request rejected!');
      fetchAllData();
      setShowDetailsModal(false);
      
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request');
    } finally {
      setProcessing(false);
    }
  };

  // Send email function
  const sendEmail = async ({ to, cc = [], subject, message, type, orderId, metadata = {} }) => {
    try {
      const emailData = {
        to,
        cc,
        subject,
        message,
        type,
        orderId,
        status: 'sent',
        sentAt: serverTimestamp(),
        triggeredBy: 'hod',
        opens: 0,
        metadata
      };
      
      const docRef = await addDoc(collection(db, 'email_logs'), emailData);
      console.log(`📧 Email sent to ${to}:`, docRef.id);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }
  };

  // Generate stock approval email
  const generateStockApprovalEmail = (request, oldStock, newStock) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 15px 15px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Stock Approved</h1>
          <p style="color: #d1fae5; margin: 10px 0 0;">Your request has been approved</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📋 Request Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Product:</td>
                <td style="padding: 10px 0; font-weight: bold;">${request.productName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Quantity Approved:</td>
                <td style="padding: 10px 0; font-weight: bold;">${request.requiredQuantity} units</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Previous Stock:</td>
                <td style="padding: 10px 0; font-weight: bold;">${oldStock} units</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">New Stock:</td>
                <td style="padding: 10px 0; font-weight: bold; color: #059669;">${newStock} units</td>
              </tr>
            </table>
          </div>

          ${request.orderId ? `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📦 Order Information</h2>
            <p style="color: #4b5563; margin: 0;">Order ID: ${request.orderId}</p>
          </div>
          ` : ''}

          <div style="background: #d1fae5; padding: 20px; border-radius: 10px;">
            <p style="color: #065f46; margin: 0; font-weight: bold; text-align: center;">
              You can now process the order with the updated stock.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Approved by HOD at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // Generate stock rejection email
  const generateStockRejectionEmail = (request) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; border-radius: 15px 15px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">❌ Stock Request Rejected</h1>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📋 Request Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Product:</td>
                <td style="padding: 10px 0; font-weight: bold;">${request.productName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Quantity Requested:</td>
                <td style="padding: 10px 0; font-weight: bold;">${request.requiredQuantity} units</td>
              </tr>
            </table>
          </div>

          <p style="color: #6b7280; margin: 20px 0; text-align: center;">
            Please contact HOD for more information.
          </p>
        </div>
      </div>
    `;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const badges = {
      'pending_verification': { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30', text: '⏳ Pending' },
      'verified': { color: 'bg-blue-600/20 text-blue-400 border-blue-500/30', text: '✅ Verified' },
      'dispatched': { color: 'bg-green-600/20 text-green-400 border-green-500/30', text: '🚚 Dispatched' },
      'installed': { color: 'bg-purple-600/20 text-purple-400 border-purple-500/30', text: '📦 Installed' },
      'hod_pending': { color: 'bg-orange-600/20 text-orange-400 border-orange-500/30', text: '👔 HOD Pending' },
      'rejected': { color: 'bg-red-600/20 text-red-400 border-red-500/30', text: '❌ Rejected' }
    };
    return badges[status] || { color: 'bg-slate-600/20 text-slate-400 border-slate-500/30', text: status };
  };

  // Get email type badge
  const getEmailTypeBadge = (type) => {
    const types = {
      'dispatch_notification': 'bg-blue-600/20 text-blue-400',
      'hod_notification': 'bg-purple-600/20 text-purple-400',
      'customer_notification': 'bg-green-600/20 text-green-400',
      'installer_notification': 'bg-orange-600/20 text-orange-400',
      'stock_approved': 'bg-emerald-600/20 text-emerald-400',
      'stock_rejected': 'bg-red-600/20 text-red-400',
      'order_created': 'bg-yellow-600/20 text-yellow-400'
    };
    return types[type] || 'bg-slate-600/20 text-slate-400';
  };

  // Save email settings
  const saveEmailSettings = () => {
    localStorage.setItem('hodEmails', JSON.stringify(emailConfig));
    setShowSettingsModal(false);
    alert('✅ Email settings saved!');
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">👔 HOD Admin Panel</h1>
            <p className="text-slate-400">Complete system overview and management</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>

            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white"
              title="Help"
            >
              <HelpCircle size={20} />
            </button>
            
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-4 py-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white flex items-center gap-2"
            >
              <Settings size={16} /> Settings
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
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4">
            <Package size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
            <p className="text-sm text-blue-100">Total Orders</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-4">
            <Clock size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.pendingOrders}</p>
            <p className="text-sm text-yellow-100">Pending</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4">
            <CheckCircle size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.verifiedOrders}</p>
            <p className="text-sm text-green-100">Verified</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
            <Truck size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.dispatchedOrders}</p>
            <p className="text-sm text-purple-100">Dispatched</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4">
            <Check size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.installedOrders}</p>
            <p className="text-sm text-indigo-100">Installed</p>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-4">
            <XCircle size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.rejectedOrders}</p>
            <p className="text-sm text-red-100">Rejected</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4">
            <AlertTriangle size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.stockRequests}</p>
            <p className="text-sm text-orange-100">Stock Requests</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4">
            <Package size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalStock}</p>
            <p className="text-sm text-emerald-100">Total Stock</p>
          </div>

          <div className="bg-gradient-to-br from-amber-600 to-amber-700 rounded-xl p-4">
            <AlertTriangle size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.lowStock}</p>
            <p className="text-sm text-amber-100">Low Stock</p>
          </div>

          <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl p-4">
            <Mail size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.totalEmails}</p>
            <p className="text-sm text-cyan-100">Emails Sent</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} className="inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={18} className="inline mr-2" />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('stockRequests')}
            className={`px-4 py-2 font-medium transition-colors relative ${
              activeTab === 'stockRequests'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle size={18} className="inline mr-2" />
            Stock Requests
            {stats.stockRequests > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                {stats.stockRequests}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'emails'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail size={18} className="inline mr-2" />
            Email Logs
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={18} className="inline mr-2" />
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('installers')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'installers'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={18} className="inline mr-2" />
            Installers
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="🔍 Search by customer, order ID, product, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white"
            />
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <p className="text-sm text-slate-400">Order Completion Rate</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalOrders > 0 
                    ? Math.round((stats.installedOrders / stats.totalOrders) * 100) 
                    : 0}%
                </p>
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <p className="text-sm text-slate-400">Email Open Rate</p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalEmails > 0 
                    ? Math.round((stats.openedEmails / stats.totalEmails) * 100) 
                    : 0}%
                </p>
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <p className="text-sm text-slate-400">Active Installers</p>
                <p className="text-2xl font-bold text-white">{stats.activeInstallers}</p>
              </div>
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
                <p className="text-sm text-slate-400">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.lowStock}</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      order.status === 'installed' ? 'bg-green-400' :
                      order.status === 'dispatched' ? 'bg-blue-400' :
                      order.status === 'verified' ? 'bg-purple-400' :
                      'bg-yellow-400'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{order.customerName}</p>
                      <p className="text-xs text-slate-400">{order.productName} x {order.quantity}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {order.status} • {order.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedItem(order);
                        setShowDetailsModal(true);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Customer</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Product</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Date</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Installer</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders
                    .filter(order => 
                      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      order.productName?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(order => {
                      const status = getStatusBadge(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-slate-800/50">
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full border ${status.color}`}>
                              {status.text}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-white font-mono text-xs">{order.orderId}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-white text-sm">{order.customerName}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-slate-300 text-sm">{order.productName} x{order.quantity}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-slate-400 text-sm">
                              {order.installationDate || 'TBD'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-slate-400 text-sm">
                              {order.assignedInstaller?.name || '-'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setSelectedItem(order);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 text-sm"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stock Requests Tab */}
        {activeTab === 'stockRequests' && (
          <div className="space-y-4">
            {stockRequests
              .filter(req => req.status === 'pending')
              .filter(req => 
                req.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(request => (
                <div key={request.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{request.productName}</h3>
                        <span className="text-xs px-2 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-500/30 rounded-full">
                          Pending
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400 text-xs">Quantity</p>
                          <p className="text-white">{request.requiredQuantity} units</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Order ID</p>
                          <p className="text-white font-mono">{request.orderId || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Requested By</p>
                          <p className="text-white">{request.requestedBy || 'Stock Manager'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Time</p>
                          <p className="text-white">{request.requestedAt.toLocaleTimeString()}</p>
                        </div>
                      </div>

                      {request.message && (
                        <div className="mt-2 text-sm text-slate-400 bg-slate-800/50 p-2 rounded">
                          📝 {request.message}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem(request);
                          setShowDetailsModal(true);
                        }}
                        className="px-3 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600/30 flex items-center gap-1"
                      >
                        <Eye size={16} /> Details
                      </button>
                      <button
                        onClick={() => handleApproveStock(request)}
                        disabled={processing}
                        className="px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-600/30 flex items-center gap-1"
                      >
                        <Check size={16} /> Approve
                      </button>
                      <button
                        onClick={() => handleRejectStock(request)}
                        disabled={processing}
                        className="px-3 py-2 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-600/30 flex items-center gap-1"
                      >
                        <X size={16} /> Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}

            {stockRequests.filter(r => r.status === 'pending').length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No pending stock requests
              </div>
            )}
          </div>
        )}

        {/* Email Logs Tab */}
        {activeTab === 'emails' && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Status</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">To</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Subject</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Type</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Triggered By</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Sent</th>
                    <th className="px-4 py-3 text-left text-xs text-slate-400">Opens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {emailLogs
                    .filter(log => 
                      log.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      log.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      log.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          {log.opens > 0 ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <Clock size={16} className="text-yellow-400" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white text-sm">{log.to}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-300 text-sm">{log.subject}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${getEmailTypeBadge(log.type)}`}>
                            {log.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-400 text-sm">{log.triggeredBy}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-blue-400 font-mono text-xs">{log.orderId || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-400 text-sm">
                            {log.sentAt.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-white text-sm">{log.opens || 0}</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inventory
              .filter(item => 
                item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(item => (
                <div key={item.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.productName}</h3>
                  <p className={`text-3xl font-bold mb-2 ${
                    item.quantity < 10 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {item.quantity}
                  </p>
                  <p className="text-sm text-slate-400">units in stock</p>
                  {item.quantity < 10 && (
                    <div className="mt-4 p-2 bg-red-600/10 border border-red-500/30 rounded-lg">
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Low stock! Reorder soon.
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Installers Tab */}
        {activeTab === 'installers' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {installationPersons
              .filter(person => 
                person.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                person.city?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(person => (
                <div key={person.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{person.name}</h3>
                      <p className="text-sm text-slate-400">{person.city}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-300 flex items-center gap-2">
                      <Phone size={14} className="text-slate-500" />
                      {person.phone}
                    </p>
                    <p className="text-slate-300 flex items-center gap-2">
                      <Mail size={14} className="text-slate-500" />
                      {person.email}
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <p className="text-xs text-slate-500">
                      Active Orders: {
                        orders.filter(o => o.assignedInstaller?.id === person.id && o.status === 'dispatched').length
                      }
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-md w-full border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">⚙️ Settings</h3>
              <button onClick={() => setShowSettingsModal(false)}>
                <X size={20} className="text-slate-400 hover:text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">HOD Email</label>
                <input
                  type="email"
                  value={emailConfig.hod}
                  onChange={(e) => setEmailConfig({...emailConfig, hod: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Stock Manager Email</label>
                <input
                  type="email"
                  value={emailConfig.stock}
                  onChange={(e) => setEmailConfig({...emailConfig, stock: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Dispatch Email</label>
                <input
                  type="email"
                  value={emailConfig.dispatch}
                  onChange={(e) => setEmailConfig({...emailConfig, dispatch: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Sales Email</label>
                <input
                  type="email"
                  value={emailConfig.sales}
                  onChange={(e) => setEmailConfig({...emailConfig, sales: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={saveEmailSettings}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-lg w-full border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">❓ Help</h3>
              <button onClick={() => setShowHelpModal(false)}>
                <X size={20} className="text-slate-400 hover:text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">📊 Dashboard</h4>
                <p className="text-sm text-slate-300">
                  View complete system statistics and recent activity.
                </p>
              </div>

              <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">📦 Stock Requests</h4>
                <p className="text-sm text-slate-300">
                  Approve or reject stock requests from Stock Manager.
                </p>
              </div>

              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">📧 Email Tracking</h4>
                <p className="text-sm text-slate-300">
                  Monitor all emails sent from the system.
                </p>
              </div>

              <div className="bg-purple-600/10 border border-purple-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">📋 Orders</h4>
                <p className="text-sm text-slate-300">
                  Track order status across all stages.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
              <h2 className="text-xl font-bold text-white">Details</h2>
              <button onClick={() => setShowDetailsModal(false)}>
                <X size={20} className="text-slate-400 hover:text-white" />
              </button>
            </div>
            
            <div className="p-6">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap">
                {JSON.stringify(selectedItem, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HodAdminPanel;