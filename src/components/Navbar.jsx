"use client"; // Client-side interactivity ke liye mandatory

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  LogOut
} from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll effect for glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Inventory', href: '/inventory', icon: <Package size={20} /> },
    { name: 'Suppliers', href: '/suppliers', icon: <Truck size={20} /> },
    { name: 'Low Stock', href: '/alerts', icon: <AlertTriangle size={20} />, badge: "5" },
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-slate-900/95 backdrop-blur-md shadow-xl' : 'bg-slate-900'
    } border-b border-slate-800`}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Logo Section */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
              <Package className="text-white" size={22} />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              STOCK<span className="text-blue-500">PRO</span>
            </span>
          </div>

          {/* 2. Desktop Navigation (Hidden on Mobile) */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
              >
                {link.icon}
                {link.name}
                {link.badge && (
                  <span className="bg-red-500 text-[10px] px-1.5 py-0.5 rounded-full text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* 3. Right Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors">
              <Search size={20} />
            </button>
            
            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-slate-900"></span>
            </button>

            <div className="hidden sm:flex items-center gap-3 border-l border-slate-700 ml-2 pl-4">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                <span className="text-xs font-bold">AD</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Mobile Side Drawer (Mobile Responsive) */}
      <div className={`md:hidden fixed inset-0 z-40 transform ${isOpen ? "translate-x-0" : "translate-x-full"} transition-transform duration-300 ease-in-out`}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
        
        {/* Drawer Content */}
        <div className="absolute right-0 w-[280px] h-full bg-slate-900 shadow-2xl p-6 border-l border-slate-800">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <span className="font-bold text-lg text-white">Menu</span>
              <button onClick={() => setIsOpen(false)}><X className="text-slate-400" /></button>
            </div>

            <div className="space-y-4 flex-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-600">
                    {link.icon}
                  </span>
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-slate-800 pt-6 space-y-4">
              <button className="flex items-center gap-3 text-slate-400 w-full px-2 hover:text-white">
                <Settings size={20} /> Settings
              </button>
              <button className="flex items-center gap-3 text-red-400 w-full px-2 hover:text-red-300">
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;