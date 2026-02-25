"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  AlertTriangle, 
  Clock,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Download,
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  UserCheck,
  UserX,
  Zap,
  BarChart3
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('today');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock data - Replace with Firebase data
  const [activities, setActivities] = useState([
    {
      id: 1,
      action: 'New Order Created',
      user: 'Rahul Sharma (Sales)',
      timestamp: '2024-03-15 10:30 AM',
      details: 'AC Installation - Order #ORD-001',
      status: 'pending',
      role: 'sales'
    },
    {
      id: 2,
      action: 'Stock Verified',
      user: 'Amit Kumar (Stock Manager)',
      timestamp: '2024-03-15 11:15 AM',
      details: 'Stock available - Forwarded to Dispatch',
      status: 'completed',
      role: 'stock'
    },
    {
      id: 3,
      action: 'Dispatch Approved',
      user: 'Priya Singh (Dispatch)',
      timestamp: '2024-03-15 11:45 AM',
      details: 'Assigned to Rajesh (Installer)',
      status: 'completed',
      role: 'dispatch'
    },
    {
      id: 4,
      action: 'Installation Completed',
      user: 'Rajesh Kumar (Installer)',
      timestamp: '2024-03-15 02:30 PM',
      details: 'Installation done without charges',
      status: 'completed',
      role: 'installer'
    },
    {
      id: 5,
      action: 'Stock Request',
      user: 'Amit Kumar (Stock Manager)',
      timestamp: '2024-03-15 03:00 PM',
      details: 'Additional stock needed for AC Units',
      status: 'pending',
      role: 'hod'
    }
  ]);

  const [stats, setStats] = useState({
    totalOrders: 156,
    pendingOrders: 23,
    completedToday: 12,
    activeInstallers: 8,
    avgCompletionTime: '2.5 hrs',
    satisfactionRate: '98%',
    stockAlerts: 3,
    pendingApprovals: 5
  });

  const [recentOrders, setRecentOrders] = useState([
    {
      id: 'ORD-001',
      customer: 'Rahul Sharma',
      product: 'AC Installation',
      status: 'installed',
      timeline: [
        { stage: 'Order Created', time: '10:30 AM', by: 'Sales' },
        { stage: 'Stock Verified', time: '11:15 AM', by: 'Stock' },
        { stage: 'Dispatch Approved', time: '11:45 AM', by: 'Dispatch' },
        { stage: 'Installed', time: '02:30 PM', by: 'Installer' }
      ]
    },
    {
      id: 'ORD-002',
      customer: 'Priya Patel',
      product: 'Water Purifier',
      status: 'dispatch_approved',
      timeline: [
        { stage: 'Order Created', time: '09:15 AM', by: 'Sales' },
        { stage: 'Stock Verified', time: '10:00 AM', by: 'Stock' },
        { stage: 'Dispatch Approved', time: '11:30 AM', by: 'Dispatch' }
      ]
    }
  ]);

  // ✅ FIXED: Function defined BEFORE useEffect
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Firebase se data fetch karein
      // const orders = await getOrders(timeFilter);
      // const activities = await getActivities(timeFilter);
      // setStats(calculateStats(orders));
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update with real data here
      console.log('Fetching data for:', timeFilter);
      
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [timeFilter]); // ✅ timeFilter as dependency

  // ✅ useEffect now comes AFTER function declaration
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // ✅ fetchDashboardData as dependency

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-400 bg-green-600/20 border-green-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-600/20 border-yellow-500/30';
      case 'rejected': return 'text-red-400 bg-red-600/20 border-red-500/30';
      default: return 'text-blue-400 bg-blue-600/20 border-blue-500/30';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'sales': return <Users size={16} className="text-blue-400" />;
      case 'stock': return <Package size={16} className="text-green-400" />;
      case 'dispatch': return <Truck size={16} className="text-purple-400" />;
      case 'installer': return <UserCheck size={16} className="text-orange-400" />;
      case 'hod': return <BarChart3 size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-slate-400" />;
    }
  };

  // Rest of the component remains the same...
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 px-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={40} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Monitor all processes and team activities</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Time Filter */}
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
            
            <button className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-white">
              <Download size={20} />
            </button>
            
            <button 
              onClick={fetchDashboardData}
              className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 hover:text-white"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <LayoutDashboard size={24} className="text-white/80" />
              <span className="text-xs text-white/60">Total Orders</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.totalOrders}</h3>
            <p className="text-sm text-blue-100">+12% from last month</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock size={24} className="text-white/80" />
              <span className="text-xs text-white/60">Pending</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.pendingOrders}</h3>
            <p className="text-sm text-purple-100">{stats.pendingApprovals} need approval</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle size={24} className="text-white/80" />
              <span className="text-xs text-white/60">Completed Today</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.completedToday}</h3>
            <p className="text-sm text-green-100">Avg time: {stats.avgCompletionTime}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users size={24} className="text-white/80" />
              <span className="text-xs text-white/60">Active Installers</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stats.activeInstallers}</h3>
            <p className="text-sm text-orange-100">{stats.satisfactionRate} satisfaction</p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mb-8">
          <div className="border-b border-slate-800">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
                { id: 'activities', label: 'Live Activities', icon: <Zap size={18} />, badge: activities.filter(a => a.status === 'pending').length },
                { id: 'orders', label: 'Order Timeline', icon: <Clock size={18} /> },
                { id: 'alerts', label: 'Stock Alerts', icon: <AlertTriangle size={18} />, badge: stats.stockAlerts }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.badge > 0 && (
                    <span className="ml-2 bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-1">Stock Alerts</p>
                    <p className="text-2xl font-bold text-red-400">{stats.stockAlerts}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-1">Pending Approvals</p>
                    <p className="text-2xl font-bold text-yellow-400">{stats.pendingApprovals}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-1">Active Installers</p>
                    <p className="text-2xl font-bold text-green-400">{stats.activeInstallers}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4">
                    <p className="text-sm text-slate-400 mb-1">Avg Completion</p>
                    <p className="text-2xl font-bold text-blue-400">{stats.avgCompletionTime}</p>
                  </div>
                </div>

                {/* Recent Activities Preview */}
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  {activities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-3 bg-slate-800/30 rounded-xl">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        {getRoleIcon(activity.role)}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.action}</p>
                        <p className="text-sm text-slate-400">{activity.details}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-500">{activity.user}</span>
                          <span className="text-xs text-slate-600">•</span>
                          <span className="text-xs text-slate-500">{activity.timestamp}</span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Activities Tab */}
            {activeTab === 'activities' && (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      {getRoleIcon(activity.role)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-white font-medium">{activity.action}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{activity.details}</p>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-500">{activity.user}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500">{activity.timestamp}</span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                      <Eye size={16} className="text-slate-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Order Timeline Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {recentOrders.map((order) => (
                  <div key={order.id} className="bg-slate-800/30 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-white font-medium">{order.customer}</h4>
                        <p className="text-sm text-slate-400">{order.product} • Order {order.id}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    {/* Timeline */}
                    <div className="relative">
                      {order.timeline.map((step, index) => (
                        <div key={index} className="flex items-start gap-3 pb-4 last:pb-0">
                          <div className="relative">
                            <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            </div>
                            {index < order.timeline.length - 1 && (
                              <div className="absolute top-6 left-3 w-0.5 h-8 bg-slate-700"></div>
                            )}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{step.stage}</p>
                            <p className="text-xs text-slate-400">{step.time} • by {step.by}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock Alerts Tab */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                <div className="bg-red-600/20 border border-red-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="text-white font-medium mb-1">Low Stock Alert: AC Units</h4>
                      <p className="text-sm text-slate-400 mb-2">Only 5 units remaining. Reorder soon.</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-red-400">Critical</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">Requested by: Stock Manager</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">2 hours ago</span>
                      </div>
                    </div>
                    <button className="ml-auto bg-red-600/30 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-600/40">
                      Order Now
                    </button>
                  </div>
                </div>

                <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Package className="text-yellow-400 flex-shrink-0" size={20} />
                    <div>
                      <h4 className="text-white font-medium mb-1">Water Purifier Filters</h4>
                      <p className="text-sm text-slate-400 mb-2">Running low: 12 units left</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-yellow-400">Medium</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">Auto-generated</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-500">5 hours ago</span>
                      </div>
                    </div>
                    <button className="ml-auto bg-yellow-600/30 text-yellow-400 px-4 py-2 rounded-lg text-sm hover:bg-yellow-600/40">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Performance Section */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Team Performance</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sales Team */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Users className="text-blue-400" size={20} />
                </div>
                <h3 className="text-white font-medium">Sales Team</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Orders Today</span>
                  <span className="text-white font-medium">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pending Verification</span>
                  <span className="text-yellow-400 font-medium">3</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Conversion Rate</span>
                  <span className="text-green-400 font-medium">94%</span>
                </div>
              </div>
            </div>

            {/* Stock Team */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-600/20 rounded-lg">
                  <Package className="text-green-400" size={20} />
                </div>
                <h3 className="text-white font-medium">Stock Team</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Verified Today</span>
                  <span className="text-white font-medium">12</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pending Verification</span>
                  <span className="text-yellow-400 font-medium">5</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avg Response Time</span>
                  <span className="text-blue-400 font-medium">15 min</span>
                </div>
              </div>
            </div>

            {/* Installation Team */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <Truck className="text-purple-400" size={20} />
                </div>
                <h3 className="text-white font-medium">Installation Team</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Completed Today</span>
                  <span className="text-white font-medium">7</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">In Progress</span>
                  <span className="text-blue-400 font-medium">4</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avg Installation Time</span>
                  <span className="text-green-400 font-medium">2.1 hrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;