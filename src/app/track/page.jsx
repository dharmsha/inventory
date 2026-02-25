"use client";
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase'; 
import { Mail, Eye, Clock, CheckCircle, XCircle, RefreshCw, Search } from 'lucide-react';
import ProtectedRoute from "@/components/ProtectedRoute";

function EmailTrackingContent() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'email_logs'),
        orderBy('sentAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const emailData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        sentAt: doc.data().sentAt?.toDate?.() || new Date()
      }));
      setEmails(emailData);
    } catch (error) {
      console.error('Error fetching emails:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const filteredEmails = emails.filter(email => 
    email.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.orderId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📧 Email Tracking</h1>
            <p className="text-slate-400">Track all emails sent from the system</p>
          </div>
          
          <button
            onClick={fetchEmails}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-slate-300 hover:text-white"
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email, subject, order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{emails.length}</p>
            <p className="text-sm text-slate-400">Total Emails</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-400">
              {emails.filter(e => e.status === 'sent').length}
            </p>
            <p className="text-sm text-slate-400">Sent</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-400">
              {emails.filter(e => e.opens > 0).length}
            </p>
            <p className="text-sm text-slate-400">Opened</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-400">
              {new Set(emails.map(e => e.orderId)).size}
            </p>
            <p className="text-sm text-slate-400">Orders</p>
          </div>
        </div>

        {/* Email List */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">To</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Subject</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Sent</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Opens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                      Loading emails...
                    </td>
                  </tr>
                ) : filteredEmails.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-400">
                      No emails found
                    </td>
                  </tr>
                ) : (
                  filteredEmails.map((email) => (
                    <tr key={email.id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        {email.opens > 0 ? (
                          <Eye size={18} className="text-green-400" />
                        ) : (
                          <Clock size={18} className="text-yellow-400" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white text-sm">{email.to}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white text-sm">{email.subject}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full">
                          {email.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-blue-400">{email.orderId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {email.sentAt.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white">{email.opens}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmailTrackingPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'hod']}>
      <EmailTrackingContent />
    </ProtectedRoute>
  );
}