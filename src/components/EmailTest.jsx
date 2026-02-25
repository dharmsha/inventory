"use client";
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../app/lib/firebase';
import { Mail, Send, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const EmailTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [emailLogs, setEmailLogs] = useState([]);
  const [testEmail, setTestEmail] = useState('test@example.com');

  // 📧 Direct email send function (bypassing complex stuff)
  const sendTestEmail = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Direct Firebase entry
      const emailData = {
        to: testEmail,
        from: 'stockpro@system.com',
        subject: '🧪 Test Email from StockPro',
        message: `
          This is a test email from StockPro system.
          
          Time: ${new Date().toLocaleString()}
          Status: Test successful!
          
          If you're seeing this, email system is working.
        `,
        type: 'test',
        status: 'sent',
        sentAt: serverTimestamp(),
        opens: 0,
        testId: 'TEST-' + Date.now()
      };

      const docRef = await addDoc(collection(db, 'email_logs'), emailData);
      
      setResult({
        success: true,
        message: '✅ Test email logged successfully!',
        id: docRef.id,
        data: emailData
      });

      // Fetch updated logs
      fetchEmailLogs();
      
    } catch (error) {
      console.error('Test email error:', error);
      setResult({
        success: false,
        message: '❌ Error: ' + error.message,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  // 📋 Fetch email logs
  const fetchEmailLogs = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'email_logs'));
      const logs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEmailLogs(logs.slice(0, 5)); // Last 5 emails
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">📧 Email System Test</h1>

        {/* Test Form */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Send Test Email</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white"
                placeholder="Enter email address"
              />
            </div>

            <button
              onClick={sendTestEmail}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className={`mt-4 p-4 rounded-xl ${
              result.success 
                ? 'bg-green-600/20 border border-green-500/30 text-green-400' 
                : 'bg-red-600/20 border border-red-500/30 text-red-400'
            }`}>
              <p className="font-medium">{result.message}</p>
              {result.id && (
                <p className="text-sm mt-2 text-slate-400">Email ID: {result.id}</p>
              )}
            </div>
          )}
        </div>

        {/* Email Logs */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Recent Email Logs</h2>
            <button
              onClick={fetchEmailLogs}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {emailLogs.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No emails sent yet</p>
          ) : (
            <div className="space-y-3">
              {emailLogs.map((log) => (
                <div key={log.id} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-medium">{log.subject}</p>
                      <p className="text-sm text-slate-400 mt-1">To: {log.to}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        Type: {log.type} • Status: {log.status}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {log.sentAt?.toDate?.().toLocaleString() || 'Just now'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Check Instructions */}
        <div className="mt-8 bg-blue-600/10 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-3">🔍 Quick Checks:</h3>
          <ul className="space-y-2 text-slate-300">
            <li>✓ Check Firebase Console → email_logs collection</li>
            <li>✓ Check Browser Console (F12) for errors</li>
            <li>✓ Verify email service configuration</li>
            <li>✓ Check if collection has proper permissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmailTest;