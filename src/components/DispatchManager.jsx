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
  Timestamp
} from 'firebase/firestore';
import { db } from '../app/lib/firebase';
import { 
  Truck, 
  Check, 
  X, 
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
  Package,
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
  AlertTriangle,
  CheckCircle,
  UserCheck
} from 'lucide-react';

// Default email configuration
const DEFAULT_EMAILS = {
  hod: 'hod@company.com',
  dispatch: 'dispatch@company.com',
  sales: 'sales@company.com'
};

const DispatchManager = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [installationPersons, setInstallationPersons] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('verified');
  const [emailLogs, setEmailLogs] = useState([]);
  const [emailConfig, setEmailConfig] = useState(DEFAULT_EMAILS);
  const [emailForm, setEmailForm] = useState({
    to: {
      customer: '',
      hod: '',
      installer: ''
    },
    cc: [],
    bcc: [],
    subject: '',
    message: '',
    installationDate: '',
    installerId: '',
    installerName: '',
    installerPhone: '',
    additionalNotes: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    dispatched: 0,
    installed: 0,
    pending: 0
  });

  // Load saved emails from localStorage
  useEffect(() => {
    const savedEmails = localStorage.getItem('dispatchEmails');
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
        fetchInstallationPersons(),
        fetchEmailLogs()
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
          dispatchedAt: data.dispatchedAt?.toDate?.() || null
        };
      });
      
      setOrders(ordersData);
      
      // Update stats
      const allOrders = await getAllOrders();
      setStats({
        total: allOrders.length,
        verified: allOrders.filter(o => o.status === 'verified').length,
        dispatched: allOrders.filter(o => o.status === 'dispatched').length,
        installed: allOrders.filter(o => o.status === 'installed').length,
        pending: allOrders.filter(o => o.status === 'verified').length
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

  // Fetch email logs
  const fetchEmailLogs = async () => {
    try {
      const q = query(
        collection(db, 'email_logs'),
        where('triggeredBy', '==', 'dispatch'),
        orderBy('sentAt', 'desc'),
        limit(50)
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
      
      // Fallback query if index not ready
      if (error.code === 'failed-precondition') {
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
        
        const filteredLogs = allLogs.filter(log => log.triggeredBy === 'dispatch');
        setEmailLogs(filteredLogs.slice(0, 50));
      }
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
        triggeredBy: 'dispatch',
        opens: 0,
        metadata
      };
      
      const docRef = await addDoc(collection(db, 'email_logs'), emailData);
      console.log(`📧 Email sent to ${to}:`, docRef.id);
      
      // Save to localStorage backup
      const localEmails = JSON.parse(localStorage.getItem('dispatchEmailsLog') || '[]');
      localEmails.push({
        id: docRef.id,
        to,
        cc,
        subject,
        type,
        orderId,
        sentAt: new Date().toISOString()
      });
      localStorage.setItem('dispatchEmailsLog', JSON.stringify(localEmails.slice(-50)));
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }
  };

  // Handle send emails
  const handleSendEmails = async () => {
    if (!selectedOrder) return;
    if (!emailForm.installerId) {
      alert('Please select an installer');
      return;
    }

    setProcessing(true);
    try {
      const installer = installationPersons.find(p => p.id === emailForm.installerId);
      
      // Update order status
      const orderRef = doc(db, 'orders', selectedOrder.id);
      await updateDoc(orderRef, {
        status: 'dispatched',
        dispatchedBy: 'dispatch_manager',
        dispatchedAt: serverTimestamp(),
        assignedInstaller: {
          id: installer.id,
          name: installer.name,
          phone: installer.phone,
          email: installer.email
        },
        dispatchDetails: {
          ...emailForm,
          sentAt: new Date().toISOString()
        },
        timeline: [...(selectedOrder.timeline || []), {
          status: 'Dispatched',
          timestamp: new Date().toISOString(),
          note: `✅ Order dispatched to ${installer.name}`,
          by: 'dispatch'
        }]
      });

      // 📧 EMAIL 1: Customer
      await sendEmail({
        to: emailForm.to.customer || selectedOrder.customerEmail,
        cc: [emailForm.to.hod || emailConfig.hod],
        subject: `🎉 Installation Scheduled - Order #${selectedOrder.orderId}`,
        message: generateCustomerEmail(selectedOrder, installer, emailForm),
        type: 'customer_notification',
        orderId: selectedOrder.id,
        metadata: {
          customerName: selectedOrder.customerName,
          installerName: installer.name,
          installationDate: emailForm.installationDate
        }
      });

      // 📧 EMAIL 2: Installer
      await sendEmail({
        to: installer.email,
        cc: [emailForm.to.hod || emailConfig.hod, emailConfig.dispatch],
        subject: `🔧 New Installation Assignment - Order #${selectedOrder.orderId}`,
        message: generateInstallerEmail(selectedOrder, installer, emailForm),
        type: 'installer_notification',
        orderId: selectedOrder.id,
        metadata: {
          customerName: selectedOrder.customerName,
          installerName: installer.name,
          installationDate: emailForm.installationDate
        }
      });

      // 📧 EMAIL 3: HOD (confirmation)
      await sendEmail({
        to: emailForm.to.hod || emailConfig.hod,
        subject: `📦 Order #${selectedOrder.orderId} Dispatched`,
        message: generateHodEmail(selectedOrder, installer, emailForm),
        type: 'hod_notification',
        orderId: selectedOrder.id,
        metadata: {
          customerName: selectedOrder.customerName,
          installerName: installer.name
        }
      });

      alert('✅ Emails sent successfully to Customer, Installer, and HOD!');
      
      setShowEmailModal(false);
      setEmailForm({
        to: { customer: '', hod: '', installer: '' },
        cc: [],
        bcc: [],
        subject: '',
        message: '',
        installationDate: '',
        installerId: '',
        installerName: '',
        installerPhone: '',
        additionalNotes: ''
      });
      
      fetchAllData();
      
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Generate customer email
  const generateCustomerEmail = (order, installer, form) => {
    const date = form.installationDate || order.installationDate || 'To be confirmed';
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 15px 15px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Installation Scheduled!</h1>
          <p style="color: #bfdbfe; margin: 10px 0 0;">Your order is ready for installation</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📋 Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Product:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.productName} x ${order.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Installation Date:</td>
                <td style="padding: 10px 0; font-weight: bold; color: #2563eb;">${date}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">👤 Installation Team</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Installer:</td>
                <td style="padding: 10px 0; font-weight: bold;">${installer.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Contact:</td>
                <td style="padding: 10px 0; font-weight: bold;">${installer.phone}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📍 Installation Address</h2>
            <p style="color: #4b5563; margin: 0;">${order.customerAddress}</p>
          </div>

          ${form.additionalNotes ? `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📝 Additional Notes</h2>
            <p style="color: #4b5563; margin: 0;">${form.additionalNotes}</p>
          </div>
          ` : ''}

          <div style="background: #dbeafe; padding: 20px; border-radius: 10px;">
            <p style="color: #1e40af; margin: 0; font-weight: bold; text-align: center;">
              ⚡ Our installation team will contact you to confirm the timing.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Thank you for choosing StockPro!<br>
              For any queries, contact us at support@stockpro.com
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // Generate installer email
  const generateInstallerEmail = (order, installer, form) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 15px 15px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔧 New Installation Assignment</h1>
          <p style="color: #d1fae5; margin: 10px 0 0;">You have been assigned a new task</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📋 Installation Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Customer:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Product:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.productName} x ${order.quantity}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Installation Date:</td>
                <td style="padding: 10px 0; font-weight: bold; color: #059669;">${form.installationDate || order.installationDate || 'To be confirmed'}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📞 Customer Contact</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Name:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Phone:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Email:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.customerEmail}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📍 Installation Address</h2>
            <p style="color: #4b5563; margin: 0;">${order.customerAddress}</p>
          </div>

          ${form.additionalNotes ? `
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📝 Additional Notes</h2>
            <p style="color: #4b5563; margin: 0;">${form.additionalNotes}</p>
          </div>
          ` : ''}

          <div style="background: #d1fae5; padding: 20px; border-radius: 10px;">
            <p style="color: #065f46; margin: 0; font-weight: bold; text-align: center;">
              ⚡ Please contact customer to confirm the installation time.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Update installation status in the StockPro app after completion.
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // Generate HOD email
  const generateHodEmail = (order, installer, form) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 15px 15px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📦 Order Dispatched</h1>
          <p style="color: #ddd6fe; margin: 10px 0 0;">Installation team assigned</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📋 Dispatch Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Order ID:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Customer:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Product:</td>
                <td style="padding: 10px 0; font-weight: bold;">${order.productName} x ${order.quantity}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">👤 Assigned Installer</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Name:</td>
                <td style="padding: 10px 0; font-weight: bold;">${installer.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Phone:</td>
                <td style="padding: 10px 0; font-weight: bold;">${installer.phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6b7280;">Email:</td>
                <td style="padding: 10px 0; font-weight: bold;">${installer.email}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📧 Notifications Sent</h2>
            <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
              <li>✅ Customer: ${emailForm.to.customer || order.customerEmail}</li>
              <li>✅ Installer: ${installer.email}</li>
              <li>✅ HOD: ${emailForm.to.hod || emailConfig.hod}</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  };

  // Handle open email modal
  const handleOpenEmailModal = (order) => {
    setSelectedOrder(order);
    setEmailForm({
      to: {
        customer: order.customerEmail || '',
        hod: emailConfig.hod,
        installer: ''
      },
      cc: [emailConfig.hod],
      bcc: [],
      subject: `Installation Scheduled - Order #${order.orderId}`,
      message: '',
      installationDate: order.installationDate || '',
      installerId: '',
      installerName: '',
      installerPhone: '',
      additionalNotes: ''
    });
    setShowEmailModal(true);
  };

  // Handle installer change
  const handleInstallerChange = (installerId) => {
    const installer = installationPersons.find(p => p.id === installerId);
    setEmailForm({
      ...emailForm,
      installerId,
      installerName: installer?.name || '',
      installerPhone: installer?.phone || '',
      to: {
        ...emailForm.to,
        installer: installer?.email || ''
      }
    });
  };

  // Save email settings
  const saveEmailSettings = () => {
    localStorage.setItem('dispatchEmails', JSON.stringify(emailConfig));
    setShowSettingsModal(false);
    alert('✅ Email settings saved!');
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case 'verified':
        return { color: 'bg-blue-600/20 text-blue-400 border-blue-500/30', text: '📦 Verified' };
      case 'dispatched':
        return { color: 'bg-green-600/20 text-green-400 border-green-500/30', text: '🚚 Dispatched' };
      case 'installed':
        return { color: 'bg-purple-600/20 text-purple-400 border-purple-500/30', text: '✅ Installed' };
      case 'hod_pending':
        return { color: 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30', text: '⏳ HOD Pending' };
      case 'rejected':
        return { color: 'bg-red-600/20 text-red-400 border-red-500/30', text: '❌ Rejected' };
      default:
        return { color: 'bg-slate-600/20 text-slate-400 border-slate-500/30', text: status };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🚚 Dispatch Manager</h1>
            <p className="text-slate-400">Assign installers and notify customers</p>
          </div>
          
          <div className="flex items-center gap-3">
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4">
            <Package size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-sm text-blue-100">Total Orders</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-4">
            <Clock size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.verified}</p>
            <p className="text-sm text-yellow-100">Verified</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4">
            <Truck size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.dispatched}</p>
            <p className="text-sm text-green-100">Dispatched</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
            <CheckCircle size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.installed}</p>
            <p className="text-sm text-purple-100">Installed</p>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4">
            <Users size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{installationPersons.length}</p>
            <p className="text-sm text-indigo-100">Installers</p>
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
              <option value="verified">📦 Verified (Ready to Dispatch)</option>
              <option value="dispatched">🚚 Dispatched</option>
              <option value="installed">✅ Installed</option>
              <option value="hod_pending">⏳ HOD Pending</option>
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
                          <p className="text-white">{order.installationDate || 'TBD'}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-xs">Verified By</p>
                          <p className="text-white">{order.verifiedBy || 'Stock Manager'}</p>
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
                          📝 Stock Note: {order.dispatchNote}
                        </div>
                      )}

                      {order.assignedInstaller && (
                        <div className="mt-2 text-xs text-green-400 bg-green-600/10 p-2 rounded flex items-center gap-2">
                          <UserCheck size={12} />
                          Assigned to: {order.assignedInstaller.name} ({order.assignedInstaller.phone})
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
                      
                      {order.status === 'verified' && (
                        <button
                          onClick={() => handleOpenEmailModal(order)}
                          className="px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 hover:bg-green-600/30 flex items-center gap-1 text-sm"
                        >
                          <Mail size={16} /> Send Emails
                        </button>
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
            <span className="text-xs text-slate-400">Last 50 emails</span>
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
                <label className="block text-sm text-slate-400 mb-1">Default HOD Email</label>
                <input
                  type="email"
                  value={emailConfig.hod}
                  onChange={(e) => setEmailConfig({...emailConfig, hod: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="hod@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Dispatch Email (CC)</label>
                <input
                  type="email"
                  value={emailConfig.dispatch}
                  onChange={(e) => setEmailConfig({...emailConfig, dispatch: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                  placeholder="dispatch@company.com"
                />
              </div>
              
              <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-sm text-blue-400">
                  ℹ️ These emails will be saved in your browser.
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
                <h4 className="text-white font-medium mb-2">📧 Email Flow</h4>
                <ul className="text-sm text-slate-300 space-y-2">
                  <li>1. Select an installer</li>
                  <li>2. Enter installation date</li>
                  <li>3. Add any notes</li>
                  <li>4. Click Send - emails go to:</li>
                  <li className="pl-4">• Customer (main)</li>
                  <li className="pl-4">• Installer (assignment)</li>
                  <li className="pl-4">• HOD (CC)</li>
                </ul>
              </div>

              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">✅ Status Updates</h4>
                <ul className="text-sm text-slate-300">
                  <li>• Verified → Ready for dispatch</li>
                  <li>• Dispatched → Assigned to installer</li>
                  <li>• Installed → Completed</li>
                </ul>
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
                    <p className="text-white">{selectedOrder.installationDate || 'TBD'}</p>
                  </div>
                </div>
              </div>

              {/* Stock Manager Note */}
              {selectedOrder.dispatchNote && (
                <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-sm text-yellow-400">
                    <span className="font-medium">📝 Stock Manager Note:</span><br />
                    {selectedOrder.dispatchNote}
                  </p>
                </div>
              )}

              {/* Assigned Installer */}
              {selectedOrder.assignedInstaller && (
                <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-2">Assigned Installer</h3>
                  <p className="text-sm text-green-400">
                    {selectedOrder.assignedInstaller.name} - {selectedOrder.assignedInstaller.phone}
                  </p>
                </div>
              )}

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

      {/* Email Modal */}
      {showEmailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="text-blue-400" size={20} />
                Send Emails
              </h2>
              <button onClick={() => setShowEmailModal(false)}>
                <X size={20} className="text-slate-400 hover:text-white" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-slate-800/50 rounded-lg p-4">
                <h3 className="text-white font-medium mb-3">Order Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Order ID</p>
                    <p className="text-white font-mono">{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Customer</p>
                    <p className="text-white">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Product</p>
                    <p className="text-white">{selectedOrder.productName} x {selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Phone</p>
                    <p className="text-white">{selectedOrder.customerPhone}</p>
                  </div>
                </div>
              </div>

              {/* Email Form */}
              <div className="space-y-4">
                {/* Installer Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Installer <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={emailForm.installerId}
                    onChange={(e) => handleInstallerChange(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                    required
                  >
                    <option value="">Choose installer...</option>
                    {installationPersons.map(person => (
                      <option key={person.id} value={person.id}>
                        {person.name} - {person.city} ({person.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Installation Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Installation Date
                  </label>
                  <input
                    type="date"
                    value={emailForm.installationDate}
                    onChange={(e) => setEmailForm({...emailForm, installationDate: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                  />
                </div>

                {/* Email Recipients */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      value={emailForm.to.customer}
                      onChange={(e) => setEmailForm({
                        ...emailForm,
                        to: {...emailForm.to, customer: e.target.value}
                      })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                      placeholder={selectedOrder.customerEmail}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      HOD Email (CC)
                    </label>
                    <input
                      type="email"
                      value={emailForm.to.hod}
                      onChange={(e) => setEmailForm({
                        ...emailForm,
                        to: {...emailForm.to, hod: e.target.value}
                      })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                      placeholder={emailConfig.hod}
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={emailForm.additionalNotes}
                    onChange={(e) => setEmailForm({...emailForm, additionalNotes: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white"
                    rows="3"
                    placeholder="Any special instructions for the installer..."
                  />
                </div>

                {/* Email Preview */}
                {emailForm.installerId && (
                  <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2">📧 Emails will be sent to:</h4>
                    <ul className="text-sm text-slate-300 space-y-1">
                      <li>• Customer: {emailForm.to.customer || selectedOrder.customerEmail}</li>
                      <li>• Installer: {installationPersons.find(p => p.id === emailForm.installerId)?.email}</li>
                      <li>• HOD (CC): {emailForm.to.hod || emailConfig.hod}</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSendEmails}
                  disabled={processing || !emailForm.installerId}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? 'Sending...' : 'Send Emails'} <Send size={18} />
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
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

export default DispatchManager;