"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  AlertTriangle, 
  Search, 
  Menu, 
  X, 
  Bell,
  Settings,
  LogOut,
  User,
  ChevronDown,
  ClipboardList,
  ShieldCheck,
  Users,
  BarChart3,
  Home,
  Clock,
  CheckCircle,
  TrendingUp,
  Activity,
  Globe,
  HelpCircle,
  LogIn
} from 'lucide-react';

// Role-based navigation links
const roleLinks = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={20} />, color: 'blue', description: 'Admin Dashboard' },
    { name: 'Stock Manager', href: '/stock-manager', icon: <Package size={20} />, color: 'purple', description: 'Manage inventory' },
    { name: 'Dispatch', href: '/dispatch', icon: <Truck size={20} />, color: 'orange', description: 'Approve orders' },
    { name: 'Installation', href: '/installation', icon: <Users size={20} />, color: 'pink', description: 'Track installations' },
    { name: 'HOD Panel', href: '/hod', icon: <BarChart3 size={20} />, color: 'red', description: 'Admin approvals' },
    { name: 'New Order', href: '/order', icon: <ClipboardList size={20} />, color: 'green', description: 'Create order' },
    { name: 'Track Order', href: '/track', icon: <Search size={20} />, color: 'indigo', description: 'Track any order' }
  ],
  hod: [
    { name: 'Dashboard', href: '/hod', icon: <LayoutDashboard size={20} />, color: 'blue', description: 'HOD Dashboard' },
    { name: 'Stock Requests', href: '/hod/requests', icon: <AlertTriangle size={20} />, color: 'yellow', description: 'Pending approvals' },
    { name: 'Stock Manager', href: '/stock-manager', icon: <Package size={20} />, color: 'purple', description: 'View inventory' },
    { name: 'Dispatch', href: '/dispatch', icon: <Truck size={20} />, color: 'orange', description: 'Monitor dispatch' },
    { name: 'Installation', href: '/installation', icon: <Users size={20} />, color: 'pink', description: 'Track progress' },
    { name: 'Track Order', href: '/track', icon: <Search size={20} />, color: 'indigo', description: 'Track orders' }
  ],
  stock_manager: [
    { name: 'Dashboard', href: '/stock-manager', icon: <LayoutDashboard size={20} />, color: 'blue', description: 'Stock Dashboard' },
    { name: 'Pending Orders', href: '/stock-manager/pending', icon: <Clock size={20} />, color: 'yellow', description: 'Pending verification' },
    { name: 'Inventory', href: '/stock-manager/inventory', icon: <Package size={20} />, color: 'purple', description: 'View stock' },
    { name: 'Track Order', href: '/track', icon: <Search size={20} />, color: 'indigo', description: 'Track orders' }
  ],
  dispatch: [
    { name: 'Dashboard', href: '/dispatch', icon: <LayoutDashboard size={20} />, color: 'blue', description: 'Dispatch Dashboard' },
    { name: 'Verified Orders', href: '/dispatch/verified', icon: <CheckCircle size={20} />, color: 'green', description: 'Ready to assign' },
    { name: 'Installers', href: '/dispatch/installers', icon: <Users size={20} />, color: 'purple', description: 'Team members' },
    { name: 'Track Order', href: '/track', icon: <Search size={20} />, color: 'indigo', description: 'Track orders' }
  ],
  installer: [
    { name: 'Dashboard', href: '/installation', icon: <LayoutDashboard size={20} />, color: 'blue', description: 'My Dashboard' },
    { name: 'My Orders', href: '/installation/my-orders', icon: <Package size={20} />, color: 'green', description: 'Assigned orders' },
    { name: 'Completed', href: '/installation/completed', icon: <CheckCircle size={20} />, color: 'purple', description: 'Done' },
    { name: 'Track Order', href: '/track', icon: <Search size={20} />, color: 'indigo', description: 'Track orders' }
  ],
  sales: [
    { name: 'Dashboard', href: '/order', icon: <LayoutDashboard size={20} />, color: 'blue', description: 'Sales Dashboard' },
    { name: 'New Order', href: '/order/new', icon: <ClipboardList size={20} />, color: 'green', description: 'Create order' },
    { name: 'Track Order', href: '/track', icon: <Search size={20} />, color: 'indigo', description: 'Track orders' }
  ]
};

// Default links for non-authenticated users
const publicLinks = [
  { name: 'Home', href: '/', icon: <Home size={20} />, color: 'blue' },
  { name: 'Track Order', href: '/track', icon: <Search size={20} />, color: 'indigo' }
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New order pending verification', time: '5 min ago', read: false },
    { id: 2, text: 'Stock alert: AC Units low', time: '15 min ago', read: false },
    { id: 3, text: 'Installation completed #ORD-123', time: '1 hour ago', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const { user, userRole, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper function - sab menus band karne ke liye
  const closeAllMenus = () => {
    setIsOpen(false);
    setProfileOpen(false);
    setShowNotifications(false);
    setShowSearch(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    closeAllMenus();
  };

  // Get navigation links based on auth status and role
  const navLinks = isAuthenticated && userRole 
    ? roleLinks[userRole] || roleLinks.admin
    : publicLinks;

  const quickActions = isAuthenticated ? [
    { name: 'Create Order', icon: <ClipboardList size={16} />, href: '/order', color: 'green' },
    { name: 'Check Stock', icon: <Package size={16} />, href: '/stock-manager', color: 'purple' },
    { name: 'Track Order', icon: <Search size={16} />, href: '/track', color: 'blue' }
  ] : [];

  const isActive = (path) => {
    if (path === '/') return pathname === path;
    return pathname.startsWith(path);
  };

  const getBadgeColor = (type) => {
    switch(type) {
      case 'new': return 'bg-green-500';
      case 'alert': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      case 'progress': return 'bg-blue-500';
      case 'approval': return 'bg-purple-500';
      case 'urgent': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (color) => {
    const colors = {
      blue: 'from-blue-600 to-blue-700',
      green: 'from-green-600 to-green-700',
      purple: 'from-purple-600 to-purple-700',
      orange: 'from-orange-600 to-orange-700',
      pink: 'from-pink-600 to-pink-700',
      red: 'from-red-600 to-red-700',
      yellow: 'from-yellow-600 to-yellow-700',
      indigo: 'from-indigo-600 to-indigo-700'
    };
    return colors[color] || 'from-blue-600 to-blue-700';
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // If not authenticated, show simplified navbar with login button
  if (!isAuthenticated) {
    return (
      <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-slate-900/95 backdrop-blur-md shadow-2xl border-b border-slate-800/50' 
          : 'bg-slate-900 border-b border-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group" onClick={closeAllMenus}>
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg">
                <Package className="text-white" size={24} />
              </div>
              <span className="font-extrabold text-xl tracking-tight">
                <span className="text-white">STOCK</span>
                <span className="text-blue-500">PRO</span>
              </span>
            </Link>

            {/* Public Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {publicLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-slate-300 hover:text-white px-3 py-2 text-sm font-medium"
                  onClick={closeAllMenus}
                >
                  {link.icon}
                  <span className="ml-1">{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Login Button */}
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={closeAllMenus}
            >
              <LogIn size={18} /> Login
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  // Authenticated Navbar
  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-slate-900/95 backdrop-blur-md shadow-2xl border-b border-slate-800/50' 
        : 'bg-slate-900 border-b border-slate-800'
    }`}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group" onClick={closeAllMenus}>
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/40 transition-all group-hover:scale-105">
              <Package className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight leading-5">
                <span className="text-white">STOCK</span>
                <span className="text-blue-500">PRO</span>
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:flex items-center gap-1">
                <Activity size={10} className="text-green-400" />
                {userRole?.replace('_', ' ') || 'User'} Dashboard
              </span>
            </div>
          </Link>

          {/* Quick Actions - Desktop */}
          {quickActions.length > 0 && (
            <div className="hidden lg:flex items-center gap-1">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  href={action.href}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
                  onClick={closeAllMenus}
                >
                  <span className={`text-${action.color}-400`}>{action.icon}</span>
                  <span className="hidden xl:inline">{action.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center bg-slate-800/50 rounded-xl px-3 py-2 border border-slate-700 focus-within:border-blue-500 transition-colors w-64">
              <Search size={18} className="text-slate-400 mr-2 flex-shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, customers..." 
                className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Search Icon - Mobile */}
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="lg:hidden p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all relative"
            >
              <Search size={20} />
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white ring-2 ring-slate-900">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50">
                  <div className="p-3 border-b border-slate-700 flex items-center justify-between">
                    <h3 className="text-white font-medium">Notifications</h3>
                    <button className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-3 hover:bg-slate-700/50 cursor-pointer border-b border-slate-700 last:border-0 ${!notif.read ? 'bg-blue-600/5' : ''}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 ${notif.read ? 'bg-slate-500' : 'bg-blue-400'}`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-white">{notif.text}</p>
                            <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-t border-slate-700">
                    <button className="w-full text-center text-xs text-slate-400 hover:text-white py-1">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 md:gap-3 border-l border-slate-700 pl-2 md:pl-4 group"
              >
                <div className="relative">
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center border-2 border-blue-500/30 group-hover:border-blue-500 transition-all">
                    <span className="text-sm md:text-base font-bold text-white">
                      {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-slate-900"></span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs text-slate-400">Welcome back</p>
                  <p className="text-sm font-medium text-white flex items-center gap-1 capitalize">
                    {userRole?.replace('_', ' ') || 'User'}
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </p>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50">
                  <div className="p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user?.email}</p>
                        <p className="text-xs text-slate-400 capitalize">{userRole?.replace('_', ' ') || 'User'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-1">
                    <Link href="/profile" className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors" onClick={closeAllMenus}>
                      <User size={16} className="text-slate-400" /> My Profile
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-700 rounded-lg transition-colors" onClick={closeAllMenus}>
                      <Settings size={16} className="text-slate-400" /> Settings
                    </Link>
                  </div>
                  
                  <div className="border-t border-slate-700 p-2">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="lg:hidden p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all relative z-50"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {showSearch && (
          <div className="lg:hidden py-3 border-t border-slate-800">
            <div className="flex items-center bg-slate-800/50 rounded-xl px-3 py-2 border border-slate-700 focus-within:border-blue-500">
              <Search size={18} className="text-slate-400 mr-2 flex-shrink-0" />
              <input 
                type="text"
                placeholder="Search orders, customers..."
                className="bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none w-full"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Side Drawer */}
      <div className={`lg:hidden fixed inset-0 z-40 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
          onClick={closeAllMenus}
        />
        
        <div className="absolute right-0 w-[320px] h-full bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl border-l border-slate-800 overflow-y-auto">
          
          {/* Mobile Profile Section */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center border-2 border-blue-500/30">
                <span className="text-2xl font-bold text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold text-lg">{user?.email}</p>
                <p className="text-sm text-slate-400 capitalize">{userRole?.replace('_', ' ') || 'User'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full">Online</span>
                  <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full capitalize">{userRole || 'User'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 p-4 border-b border-slate-800">
            <div className="text-center">
              <p className="text-xl font-bold text-white">156</p>
              <p className="text-xs text-slate-400">Orders</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-green-400">12</p>
              <p className="text-xs text-slate-400">Today</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-yellow-400">5</p>
              <p className="text-xs text-slate-400">Pending</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Main Menu</p>
            
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  isActive(link.href)
                    ? `bg-gradient-to-r ${getRoleColor(link.color)}/20 border border-${link.color}-500/30`
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
                onClick={closeAllMenus}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRoleColor(link.color)} flex items-center justify-center`}>
                    {React.cloneElement(link.icon, { className: 'text-white', size: 16 })}
                  </div>
                  <div>
                    <span className="font-medium block">{link.name}</span>
                    {link.description && (
                      <span className="text-xs text-slate-500">{link.description}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="border-t border-slate-800 p-4 space-y-1 mt-auto">
            <Link href="/settings" className="flex items-center gap-4 p-3 text-slate-300 hover:bg-slate-800 rounded-xl w-full transition-all" onClick={closeAllMenus}>
              <Settings size={20} className="text-slate-400" /> 
              <span>Settings</span>
            </Link>
            <Link href="/help" className="flex items-center gap-4 p-3 text-slate-300 hover:bg-slate-800 rounded-xl w-full transition-all" onClick={closeAllMenus}>
              <HelpCircle size={20} className="text-slate-400" /> 
              <span>Help & Support</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 p-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-all"
            >
              <LogOut size={20} /> 
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Navigation Bar - Below Navbar */}
      <div className="hidden lg:block border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 py-2 overflow-x-auto">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive(link.href)
                    ? `text-${link.color}-400 bg-${link.color}-600/20`
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                onClick={closeAllMenus}
              >
                <span className={`text-${link.color}-400`}>{link.icon}</span>
                {link.name}
                {link.badge && (
                  <span className={`${getBadgeColor(link.badge.type)} text-[10px] px-1.5 py-0.5 rounded-full text-white ml-1`}>
                    {link.badge.text}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;