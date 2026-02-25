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
  limit
} from 'firebase/firestore';
import { db } from '../app/lib/firebase';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Camera, 
  FileText,
  MapPin,
  Clock,
  User,
  Mail,
  Send,
  Image,
  Upload,
  Trash2,
  Plus,
  Star,
  MessageSquare,
  Phone,
  Home,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Check,
  X,
  Eye,
  Edit,
  Save,
  Download,
  Printer,
  HelpCircle,
  Settings,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging,
  Thermometer,
  Wind,
  Droplets,
  Zap,
  Search,           // ✅ YEH IMPORT ADD KIYA
  Filter,
  ChevronDown
} from 'lucide-react';

// Default email configuration
const DEFAULT_EMAILS = {
  hod: 'hod@company.com',
  dispatch: 'dispatch@company.com',
  customer: ''
};

const InstallationDashboard = () => {
  // State management
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInstallationForm, setShowInstallationForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [emailConfig, setEmailConfig] = useState(DEFAULT_EMAILS);
  const [emailLogs, setEmailLogs] = useState([]);
  const [stats, setStats] = useState({
    assigned: 0,
    completed: 0,
    pending: 0,
    today: 0
  });

  // Installation form data
  const [formData, setFormData] = useState({
    // Product Details
    productName: '',
    productModel: '',
    productSerial: '',
    productQuantity: 1,
    productType: 'AC',
    
    // Installation Details
    installationDate: '',
    installationTime: '',
    completionTime: '',
    duration: '',
    
    // Location
    location: '',
    landmark: '',
    city: '',
    pincode: '',
    latitude: '',
    longitude: '',
    
    // Installer Details
    installerName: '',
    installerId: '',
    installerPhone: '',
    
    // Technical Details
    voltage: '',
    current: '',
    pressure: '',
    temperature: '',
    remarks: '',
    challenges: '',
    recommendations: '',
    
    // Images
    beforeImages: [],
    duringImages: [],
    afterImages: [],
    
    // Charges
    anyCharges: false,
    chargeAmount: 0,
    chargeReason: '',
    
    // Customer Feedback
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerRating: 5,
    customerSatisfied: true,
    customerFeedback: '',
    
    // Signatures
    customerSignature: null,
    installerSignature: null,
    
    // Status
    status: 'pending'
  });

  // Load saved emails from localStorage
  useEffect(() => {
    const savedEmails = localStorage.getItem('installerEmails');
    if (savedEmails) {
      setEmailConfig(JSON.parse(savedEmails));
    }
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAssignedOrders(),
        fetchCompletedOrders(),
        fetchEmailLogs()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch assigned orders
  const fetchAssignedOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('status', '==', 'dispatched'),
        orderBy('dispatchedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dispatchedAt: data.dispatchedAt?.toDate?.() || new Date()
        };
      });
      
      setAssignedOrders(orders);
      
    } catch (error) {
      console.error('Error fetching assigned orders:', error);
    }
  };

  // Fetch completed orders
  const fetchCompletedOrders = async () => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('status', '==', 'installed'),
        orderBy('installedAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const orders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          installedAt: data.installedAt?.toDate?.() || new Date()
        };
      });
      
      setCompletedOrders(orders);
      
    } catch (error) {
      console.error('Error fetching completed orders:', error);
    }
  };

  // Fetch email logs
  const fetchEmailLogs = async () => {
    try {
      const q = query(
        collection(db, 'email_logs'),
        where('triggeredBy', '==', 'installer'),
        orderBy('sentAt', 'desc'),
        limit(20)
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
      
      // Fallback if index not ready
      try {
        const fallbackQuery = query(
          collection(db, 'email_logs'),
          orderBy('sentAt', 'desc'),
          limit(50)
        );
        
        const snapshot = await getDocs(fallbackQuery);
        const allLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          sentAt: doc.data().sentAt?.toDate?.() || new Date()
        }));
        
        const filteredLogs = allLogs.filter(log => log.triggeredBy === 'installer');
        setEmailLogs(filteredLogs.slice(0, 20));
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  };

  // Update stats
  useEffect(() => {
    const today = new Date().toDateString();
    const todayCompleted = completedOrders.filter(order => 
      order.installedAt?.toDateString() === today
    ).length;

    setStats({
      assigned: assignedOrders.length,
      completed: completedOrders.length,
      pending: assignedOrders.length,
      today: todayCompleted
    });
  }, [assignedOrders, completedOrders]);

  // Handle select order
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setFormData({
      ...formData,
      productName: order.productName || '',
      productQuantity: order.quantity || 1,
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      customerEmail: order.customerEmail || '',
      location: order.customerAddress?.split(',')[0] || '',
      city: order.customerAddress?.split(',')[1]?.trim() || '',
      installerName: order.assignedInstaller?.name || '',
      installerId: order.assignedInstaller?.id || '',
      installerPhone: order.assignedInstaller?.phone || '',
      installationDate: new Date().toISOString().split('T')[0],
      installationTime: new Date().toLocaleTimeString()
    });
    setShowInstallationForm(true);
  };

  // Handle image upload (simulated)
  const handleImageUpload = (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = (e) => {
      const files = Array.from(e.target.files);
      const newImages = files.map(file => ({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        timestamp: new Date().toISOString()
      }));
      
      setFormData({
        ...formData,
        [type]: [...formData[type], ...newImages]
      });
    };
    
    input.click();
  };

  // Remove image
  const removeImage = (type, index) => {
    const newImages = [...formData[type]];
    URL.revokeObjectURL(newImages[index].url);
    newImages.splice(index, 1);
    setFormData({
      ...formData,
      [type]: newImages
    });
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          });
          
          // Reverse geocode to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`)
            .then(res => res.json())
            .then(data => {
              if (data.display_name) {
                setFormData({
                  ...formData,
                  location: data.address?.road || '',
                  city: data.address?.city || data.address?.town || '',
                  pincode: data.address?.postcode || ''
                });
              }
            })
            .catch(err => console.error('Geocode error:', err));
            
          alert('📍 Location captured!');
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation not supported');
    }
  };

  // Calculate duration
  const calculateDuration = () => {
    if (formData.installationTime && formData.completionTime) {
      const start = new Date(`2000-01-01T${formData.installationTime}`);
      const end = new Date(`2000-01-01T${formData.completionTime}`);
      const diff = (end - start) / (1000 * 60); // minutes
      
      const hours = Math.floor(diff / 60);
      const minutes = diff % 60;
      
      setFormData({
        ...formData,
        duration: `${hours}h ${minutes}m`
      });
    }
  };

  // Send email function
  const sendEmail = async ({ to, cc = [], subject, message, type, orderId }) => {
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
        triggeredBy: 'installer',
        opens: 0,
        metadata: {
          customerName: formData.customerName,
          productName: formData.productName,
          installationDate: formData.installationDate
        }
      };
      
      const docRef = await addDoc(collection(db, 'email_logs'), emailData);
      console.log(`📧 Email sent to ${to}:`, docRef.id);
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Email error:', error);
      return { success: false, error };
    }
  };

  // Generate installation report email
  const generateInstallationReport = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 15px 15px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Installation Complete</h1>
          <p style="color: #d1fae5; margin: 10px 0 0;">Order #${selectedOrder?.orderId}</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <!-- Customer Info -->
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">👤 Customer Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Name:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Phone:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.customerPhone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Email:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.customerEmail}</td>
              </tr>
            </table>
          </div>

          <!-- Product Info -->
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📦 Product Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Product:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.productName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Model:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.productModel || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Serial Number:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.productSerial || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Quantity:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.productQuantity}</td>
              </tr>
            </table>
          </div>

          <!-- Installation Details -->
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">🔧 Installation Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.installationDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Start Time:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.installationTime}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">End Time:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.completionTime || 'N/A'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Duration:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.duration || 'N/A'}</td>
              </tr>
            </table>
          </div>

          <!-- Location -->
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📍 Location</h2>
            <p style="color: #4b5563; margin: 0;">${formData.location}, ${formData.city} - ${formData.pincode}</p>
            ${formData.latitude && formData.longitude ? `
            <p style="color: #6b7280; font-size: 12px; margin-top: 10px;">
              Coordinates: ${formData.latitude}, ${formData.longitude}
            </p>
            ` : ''}
          </div>

          <!-- Technical Details -->
          {(formData.voltage || formData.temperature) && (
            <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin-top: 0; font-size: 20px;">⚡ Technical Readings</h2>
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                ${formData.voltage ? `<div><span style="color: #6b7280;">Voltage:</span> ${formData.voltage}V</div>` : ''}
                ${formData.current ? `<div><span style="color: #6b7280;">Current:</span> ${formData.current}A</div>` : ''}
                ${formData.pressure ? `<div><span style="color: #6b7280;">Pressure:</span> ${formData.pressure} PSI</div>` : ''}
                ${formData.temperature ? `<div><span style="color: #6b7280;">Temperature:</span> ${formData.temperature}°C</div>` : ''}
              </div>
            </div>
          )}

          <!-- Images -->
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📸 Images Captured</h2>
            <ul style="color: #4b5563; margin: 0;">
              <li>Before: ${formData.beforeImages.length} images</li>
              <li>During: ${formData.duringImages.length} images</li>
              <li>After: ${formData.afterImages.length} images</li>
            </ul>
          </div>

          <!-- Remarks -->
          {formData.remarks && (
            <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #374151; margin-top: 0; font-size: 20px;">📝 Remarks</h2>
              <p style="color: #4b5563; margin: 0;">${formData.remarks}</p>
            </div>
          )}

          <!-- Challenges -->
          {formData.challenges && (
            <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #92400e; margin-top: 0; font-size: 20px;">⚠️ Challenges Faced</h2>
              <p style="color: #92400e; margin: 0;">${formData.challenges}</p>
            </div>
          )}

          <!-- Recommendations -->
          {formData.recommendations && (
            <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">💡 Recommendations</h2>
              <p style="color: #1e40af; margin: 0;">${formData.recommendations}</p>
            </div>
          )}

          <!-- Charges -->
          {formData.anyCharges && (
            <div style="background: #fee2e2; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #991b1b; margin-top: 0; font-size: 20px;">💰 Additional Charges</h2>
              <p style="color: #991b1b; margin: 0;">Amount: ₹${formData.chargeAmount}</p>
              <p style="color: #991b1b; margin: 5px 0 0;">Reason: ${formData.chargeReason}</p>
            </div>
          )}

          <!-- Customer Feedback -->
          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #374151; margin-top: 0; font-size: 20px;">⭐ Customer Feedback</h2>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span style="color: #6b7280;">Rating:</span>
              <span style="color: #f59e0b; font-size: 18px;">
                {'★'.repeat(formData.customerRating)}${'☆'.repeat(5 - formData.customerRating)}
              </span>
            </div>
            <p style="color: #4b5563; margin: 0;">
              Satisfaction: ${formData.customerSatisfied ? '✅ Satisfied' : '❌ Not Satisfied'}
            </p>
            ${formData.customerFeedback ? `
            <p style="color: #4b5563; margin-top: 10px;">${formData.customerFeedback}</p>
            ` : ''}
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Report generated by ${formData.installerName} at ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // Generate customer thank you email
  const generateCustomerThankYou = () => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; border-radius: 15px 15px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Thank You!</h1>
          <p style="color: #bfdbfe; margin: 10px 0 0;">Your installation is complete</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Dear ${formData.customerName},
          </p>
          
          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Thank you for choosing StockPro! Your installation has been completed successfully.
          </p>

          <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0; font-size: 18px;">📋 Installation Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Product:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.productName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Installer:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.installerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Date:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.installationDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Duration:</td>
                <td style="padding: 8px 0; font-weight: bold;">${formData.duration || 'N/A'}</td>
              </tr>
            </table>
          </div>

          ${formData.anyCharges ? `
          <div style="background: #fee2e2; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="color: #991b1b; margin: 0;">
              <strong>Additional Charges:</strong> ₹${formData.chargeAmount} (${formData.chargeReason})
            </p>
          </div>
          ` : ''}

          <div style="background: #dbeafe; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="color: #1e40af; margin: 0; font-weight: bold; text-align: center;">
              ⭐ We'd love your feedback! Please rate your experience.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              For any queries, contact us at support@stockpro.com
            </p>
          </div>
        </div>
      </div>
    `;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedOrder) return;
    
    setProcessing(true);
    try {
      // Calculate duration if not set
      if (!formData.duration && formData.completionTime) {
        calculateDuration();
      }

      // Prepare installation report
      const installationReport = {
        ...formData,
        completedAt: serverTimestamp(),
        reportId: `RPT-${Date.now()}`,
        images: {
          before: formData.beforeImages.length,
          during: formData.duringImages.length,
          after: formData.afterImages.length
        }
      };

      // Update order in Firebase
      const orderRef = doc(db, 'orders', selectedOrder.id);
      await updateDoc(orderRef, {
        status: 'installed',
        installedAt: serverTimestamp(),
        installationReport: installationReport,
        timeline: [...(selectedOrder.timeline || []), {
          status: 'Installation Completed',
          timestamp: new Date().toISOString(),
          note: formData.anyCharges ? 
            `💰 Additional charges: ₹${formData.chargeAmount}` : 
            '✅ Installation completed',
          by: 'installer',
          installerName: formData.installerName,
          duration: formData.duration
        }]
      });

      // 📧 Send email to HOD
      await sendEmail({
        to: emailConfig.hod,
        cc: [emailConfig.dispatch],
        subject: `✅ Installation Complete: Order #${selectedOrder.orderId}`,
        message: generateInstallationReport(),
        type: 'installation_report',
        orderId: selectedOrder.id
      });

      // 📧 Send thank you email to customer
      await sendEmail({
        to: formData.customerEmail,
        subject: `🎉 Installation Complete - Thank You!`,
        message: generateCustomerThankYou(),
        type: 'customer_thankyou',
        orderId: selectedOrder.id
      });

      alert('✅ Installation completed! Reports sent to HOD and Customer.');
      
      // Reset form
      setShowInstallationForm(false);
      setSelectedOrder(null);
      setFormData({
        productName: '',
        productModel: '',
        productSerial: '',
        productQuantity: 1,
        productType: 'AC',
        installationDate: '',
        installationTime: '',
        completionTime: '',
        duration: '',
        location: '',
        landmark: '',
        city: '',
        pincode: '',
        latitude: '',
        longitude: '',
        installerName: '',
        installerId: '',
        installerPhone: '',
        voltage: '',
        current: '',
        pressure: '',
        temperature: '',
        remarks: '',
        challenges: '',
        recommendations: '',
        beforeImages: [],
        duringImages: [],
        afterImages: [],
        anyCharges: false,
        chargeAmount: 0,
        chargeReason: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerRating: 5,
        customerSatisfied: true,
        customerFeedback: '',
        customerSignature: null,
        installerSignature: null,
        status: 'pending'
      });
      
      fetchAllData();
      
    } catch (error) {
      console.error('Error completing installation:', error);
      alert('Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Save email settings
  const saveEmailSettings = () => {
    localStorage.setItem('installerEmails', JSON.stringify(emailConfig));
    setShowSettingsModal(false);
    alert('✅ Email settings saved!');
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🔧 Installation Dashboard</h1>
            <p className="text-slate-400">Complete installations and generate reports</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Live Clock */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 px-4 py-2">
              <p className="text-blue-400 font-mono">
                {currentTime.toLocaleTimeString()}
              </p>
            </div>

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4">
            <Package size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.assigned}</p>
            <p className="text-sm text-blue-100">Assigned Orders</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4">
            <CheckCircle size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.completed}</p>
            <p className="text-sm text-green-100">Completed</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-4">
            <Clock size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
            <p className="text-sm text-yellow-100">Pending</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
            <Calendar size={20} className="text-white/80 mb-2" />
            <p className="text-2xl font-bold text-white">{stats.today}</p>
            <p className="text-sm text-purple-100">Completed Today</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="🔍 Search orders by customer, order ID, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white"
            />
          </div>
        </div>

        {/* Assigned Orders */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Assigned Orders List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">📋 My Assigned Orders</h2>
            
            {loading ? (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center text-slate-400">
                Loading...
              </div>
            ) : assignedOrders.length === 0 ? (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center text-slate-400">
                No orders assigned
              </div>
            ) : (
              assignedOrders
                .filter(order => 
                  order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  order.productName?.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(order => (
                  <div
                    key={order.id}
                    className={`bg-slate-900 rounded-xl border p-6 cursor-pointer transition-all ${
                      selectedOrder?.id === order.id
                        ? 'border-blue-500 bg-blue-600/10'
                        : 'border-slate-800 hover:border-blue-500/30'
                    }`}
                    onClick={() => handleSelectOrder(order)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                        <Package className="text-blue-400" size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{order.customerName}</h3>
                        <p className="text-sm text-slate-400">{order.productName} x {order.quantity}</p>
                        <p className="text-xs text-slate-500 mt-2">{order.customerAddress}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Phone size={12} /> {order.customerPhone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} /> {order.installationDate || 'TBD'}
                          </span>
                        </div>
                        {order.assignedInstaller && (
                          <div className="mt-2 text-xs text-green-400">
                            Installer: {order.assignedInstaller.name}
                          </div>
                        )}
                      </div>
                      {selectedOrder?.id === order.id && (
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))
            )}

            {/* Completed Orders */}
            <div className="mt-8">
              <h2 className="text-xl font-bold text-white mb-4">✅ Completed Orders</h2>
              <div className="space-y-2">
                {completedOrders.slice(0, 5).map(order => (
                  <div key={order.id} className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-white text-sm">{order.customerName}</p>
                    <p className="text-xs text-slate-400">{order.productName}</p>
                    <p className="text-xs text-green-400 mt-1">
                      ✓ Completed {order.installedAt?.toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Installation Form */}
          {showInstallationForm && selectedOrder && (
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Installation Form</h2>
                <button
                  onClick={() => setShowInstallationForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2">
                {/* Product Details */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Package size={16} className="text-blue-400" />
                    Product Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-slate-400 mb-1">Product Name *</label>
                      <input
                        type="text"
                        value={formData.productName}
                        onChange={(e) => setFormData({...formData, productName: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        placeholder="e.g., AC, Water Purifier"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Model</label>
                      <input
                        type="text"
                        value={formData.productModel}
                        onChange={(e) => setFormData({...formData, productModel: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        placeholder="Model number"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Serial Number</label>
                      <input
                        type="text"
                        value={formData.productSerial}
                        onChange={(e) => setFormData({...formData, productSerial: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        placeholder="Serial #"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={formData.productQuantity}
                        onChange={(e) => setFormData({...formData, productQuantity: parseInt(e.target.value)})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Product Type</label>
                      <select
                        value={formData.productType}
                        onChange={(e) => setFormData({...formData, productType: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="AC">Air Conditioner</option>
                        <option value="Water Purifier">Water Purifier</option>
                        <option value="Geyser">Geyser</option>
                        <option value="Chimney">Chimney</option>
                        <option value="Inverter">Inverter</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Time Tracking */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-yellow-400" />
                    Time Tracking
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={formData.installationTime}
                        onChange={(e) => {
                          setFormData({...formData, installationTime: e.target.value});
                          setTimeout(calculateDuration, 100);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">End Time</label>
                      <input
                        type="time"
                        value={formData.completionTime}
                        onChange={(e) => {
                          setFormData({...formData, completionTime: e.target.value});
                          setTimeout(calculateDuration, 100);
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    
                    {formData.duration && (
                      <div className="col-span-2">
                        <p className="text-sm text-green-400">Duration: {formData.duration}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-red-400" />
                    Location
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm text-slate-400 mb-1">Location/Area</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                          placeholder="Sector, Area"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Landmark</label>
                        <input
                          type="text"
                          value={formData.landmark}
                          onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                          placeholder="Near..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({...formData, city: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Pincode</label>
                        <input
                          type="text"
                          value={formData.pincode}
                          onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <button
                          onClick={getCurrentLocation}
                          className="w-full px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-600/30 flex items-center justify-center gap-2"
                        >
                          <MapPin size={16} /> Get Current Location
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Readings */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Zap size={16} className="text-purple-400" />
                    Technical Readings (Optional)
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Voltage (V)</label>
                      <input
                        type="number"
                        value={formData.voltage}
                        onChange={(e) => setFormData({...formData, voltage: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        placeholder="220"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Current (A)</label>
                      <input
                        type="number"
                        value={formData.current}
                        onChange={(e) => setFormData({...formData, current: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        placeholder="15"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Pressure (PSI)</label>
                      <input
                        type="number"
                        value={formData.pressure}
                        onChange={(e) => setFormData({...formData, pressure: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        placeholder="120"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Temperature (°C)</label>
                      <input
                        type="number"
                        value={formData.temperature}
                        onChange={(e) => setFormData({...formData, temperature: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        placeholder="24"
                      />
                    </div>
                  </div>
                </div>

                {/* Images */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Camera size={16} className="text-green-400" />
                    Installation Images
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Before */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-slate-400">Before Installation</label>
                        <button
                          onClick={() => handleImageUpload('beforeImages')}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Plus size={14} /> Add Images
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.beforeImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img src={img.url} alt="Before" className="w-full h-20 object-cover rounded-lg" />
                            <button
                              onClick={() => removeImage('beforeImages', index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* During */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-slate-400">During Installation</label>
                        <button
                          onClick={() => handleImageUpload('duringImages')}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Plus size={14} /> Add Images
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.duringImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img src={img.url} alt="During" className="w-full h-20 object-cover rounded-lg" />
                            <button
                              onClick={() => removeImage('duringImages', index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* After */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-slate-400">After Installation</label>
                        <button
                          onClick={() => handleImageUpload('afterImages')}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          <Plus size={14} /> Add Images
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {formData.afterImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img src={img.url} alt="After" className="w-full h-20 object-cover rounded-lg" />
                            <button
                              onClick={() => removeImage('afterImages', index)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={12} className="text-white" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Remarks */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <FileText size={16} className="text-orange-400" />
                    Installation Notes
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Remarks</label>
                      <textarea
                        value={formData.remarks}
                        onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        rows="2"
                        placeholder="Any observations..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Challenges Faced</label>
                      <textarea
                        value={formData.challenges}
                        onChange={(e) => setFormData({...formData, challenges: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        rows="2"
                        placeholder="Any difficulties..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Recommendations</label>
                      <textarea
                        value={formData.recommendations}
                        onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        rows="2"
                        placeholder="Future recommendations..."
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Charges */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.anyCharges}
                      onChange={(e) => setFormData({...formData, anyCharges: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-white">Any additional charges?</span>
                  </label>

                  {formData.anyCharges && (
                    <div className="mt-4 space-y-3">
                      <input
                        type="number"
                        placeholder="Amount (₹)"
                        value={formData.chargeAmount}
                        onChange={(e) => setFormData({...formData, chargeAmount: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Reason for charges"
                        value={formData.chargeReason}
                        onChange={(e) => setFormData({...formData, chargeReason: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Customer Feedback */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Star size={16} className="text-yellow-400" />
                    Customer Feedback
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Rating</label>
                      <div className="flex gap-2">
                        {[1,2,3,4,5].map(star => (
                          <button
                            key={star}
                            onClick={() => setFormData({...formData, customerRating: star})}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              formData.customerRating >= star 
                                ? 'text-yellow-400' 
                                : 'text-slate-600'
                            }`}
                          >
                            <Star size={20} fill={formData.customerRating >= star ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={formData.customerSatisfied}
                          onChange={(e) => setFormData({...formData, customerSatisfied: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <span className="text-white">Customer satisfied with installation</span>
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Customer Feedback</label>
                      <textarea
                        value={formData.customerFeedback}
                        onChange={(e) => setFormData({...formData, customerFeedback: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        rows="2"
                        placeholder="What customer said..."
                      />
                    </div>
                  </div>
                </div>

                {/* Email Settings */}
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Mail size={16} className="text-blue-400" />
                    Email Recipients
                  </h3>
                  
                  <div className="space-y-3">
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
                      <label className="block text-sm text-slate-400 mb-1">Dispatch Email</label>
                      <input
                        type="email"
                        value={emailConfig.dispatch}
                        onChange={(e) => setEmailConfig({...emailConfig, dispatch: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Customer Email</label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-medium hover:from-green-700 hover:to-green-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {processing ? 'Processing...' : 'Complete Installation & Send Reports'}
                  {!processing && <Send size={18} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Email Logs */}
        <div className="mt-8 bg-slate-900 rounded-xl border border-slate-800 p-4">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Mail size={16} className="text-blue-400" />
            Recent Email Reports
          </h3>
          <div className="space-y-2">
            {emailLogs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No emails sent yet</p>
            ) : (
              emailLogs.map(log => (
                <div key={log.id} className="text-sm text-slate-400 flex items-center justify-between p-2 hover:bg-slate-800/50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>{log.subject}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">→ {log.to}</span>
                    <span className="text-xs text-slate-600">
                      {log.sentAt.toLocaleTimeString()}
                    </span>
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
                <label className="block text-sm text-slate-400 mb-1">HOD Email</label>
                <input
                  type="email"
                  value={emailConfig.hod}
                  onChange={(e) => setEmailConfig({...emailConfig, hod: e.target.value})}
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
                <h4 className="text-white font-medium mb-2">📋 Installation Steps</h4>
                <ol className="text-sm text-slate-300 list-decimal list-inside space-y-1">
                  <li>Select an order from the list</li>
                  <li>Fill product details manually</li>
                  <li>Track start and end time</li>
                  <li>Capture location or enter manually</li>
                  <li>Add installation images</li>
                  <li>Get customer feedback</li>
                  <li>Submit to send reports</li>
                </ol>
              </div>

              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">📧 Email Reports</h4>
                <p className="text-sm text-slate-300">
                  After submission, emails go to:
                </p>
                <ul className="text-sm text-slate-300 list-disc list-inside mt-2">
                  <li>HOD - Complete installation report</li>
                  <li>Customer - Thank you email</li>
                  <li>Dispatch - Update (CC)</li>
                </ul>
              </div>

              <div className="bg-yellow-600/10 border border-yellow-500/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">⚠️ Important Notes</h4>
                <ul className="text-sm text-slate-300 list-disc list-inside">
                  <li>All fields marked * are required</li>
                  <li>Images are optional but recommended</li>
                  <li>Charges will be added to final bill</li>
                  <li>Customer feedback is important</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallationDashboard;