"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Package, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Globe, 
  Circle 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* 1. Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600/20 p-1.5 rounded-lg border border-blue-500/30">
                <Package className="text-blue-500" size={20} />
              </div>
              <span className="font-bold text-white tracking-tight text-lg">
                STOCK<span className="text-blue-500">PRO</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Ek advanced inventory management solution jo aapke warehouse aur stock ko smart tareeke se handle karta hai.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
              <Circle size={8} fill="currentColor" className="animate-pulse" />
              System Status: Operational
            </div>
          </div>

          {/* 2. Quick Navigation */}
          <div>
            <h3 className="text-white font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/inventory" className="hover:text-blue-500 transition-colors">Manage Inventory</Link></li>
              <li><Link href="/reports" className="hover:text-blue-500 transition-colors">Sales Reports</Link></li>
              <li><Link href="/suppliers" className="hover:text-blue-500 transition-colors">Suppliers List</Link></li>
              <li><Link href="/settings" className="hover:text-blue-500 transition-colors">System Settings</Link></li>
            </ul>
          </div>

          {/* 3. Support & Legal */}
          <div>
            <h3 className="text-white font-semibold mb-6">Support</h3>
            <ul className="space-y-4 text-sm">
              <li><Link href="/help" className="hover:text-blue-500 transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-blue-500 transition-colors">Terms of Service</Link></li>
              <li className="flex items-center gap-2">
                <Globe size={14} /> 
                <span>Region: India (IST)</span>
              </li>
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold mb-6">Warehouse Contact</h3>
            <div className="flex items-start gap-3 text-sm">
              <MapPin size={18} className="text-blue-500 mt-0.5" />
              <span>Plot 45, Industrial Area, Phase-II, Patna, Bihar</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone size={18} className="text-blue-500" />
              <span>+91 9334461083</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail size={18} className="text-blue-500" />
              <span>support@stockpro.com</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            © {currentYear} StockPro IMS. All rights reserved. Made with ❤️ for Managers.
          </p>
          <div className="flex items-center gap-6">
            <Link href="https://github.com" className="hover:text-white transition-colors">
              <Github size={20} />
            </Link>
            <div className="text-xs bg-slate-800 px-3 py-1 rounded border border-slate-700">
              v2.4.1-stable
            </div>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;