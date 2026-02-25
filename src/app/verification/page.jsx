"use client";
import React, { useState } from 'react';
import { AlertTriangle, Check, X, FileText } from 'lucide-react';
import Link from 'next/link';

export default function VerificationPage() {
  const [orders] = useState([
    {
      id: 'ORD-001',
      customer: 'Rahul Sharma',
      product: 'AC Installation',
      date: '2024-03-15',
      status: 'pending'
    },
    {
      id: 'ORD-002',
      customer: 'Priya Patel',
      product: 'Water Purifier',
      date: '2024-03-14',
      status: 'verified'
    }
  ]);

  return (
    <main className="min-h-screen bg-slate-950 pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <AlertTriangle className="text-yellow-500" size={32} />
          <h1 className="text-3xl font-bold text-white">Verification Queue</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-2">5</h3>
            <p className="text-yellow-400">Pending Verification</p>
          </div>
          <div className="bg-green-600/20 border border-green-500/30 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-2">12</h3>
            <p className="text-green-400">Verified Today</p>
          </div>
          <div className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-white mb-2">3</h3>
            <p className="text-blue-400">In Progress</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-white">{order.id}</td>
                    <td className="px-6 py-4 text-white">{order.customer}</td>
                    <td className="px-6 py-4 text-slate-300">{order.product}</td>
                    <td className="px-6 py-4 text-slate-300">{order.date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'verified' 
                          ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                          : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 bg-green-600/20 rounded-lg text-green-400 hover:bg-green-600/30">
                          <Check size={18} />
                        </button>
                        <button className="p-2 bg-red-600/20 rounded-lg text-red-400 hover:bg-red-600/30">
                          <X size={18} />
                        </button>
                        <button className="p-2 bg-blue-600/20 rounded-lg text-blue-400 hover:bg-blue-600/30">
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}