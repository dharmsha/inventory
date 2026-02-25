"use client";
import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Package, 
  Truck, 
  Shield, 
  Clock,
  Users,
  BarChart3,
  CheckCircle,
  Zap,
  Sparkles
} from 'lucide-react';

const HeroSection = () => {
  const features = [
    {
      icon: <Package className="text-blue-400" size={24} />,
      title: "Stock Management",
      description: "Real-time inventory tracking with automated stock alerts"
    },
    {
      icon: <Truck className="text-green-400" size={24} />,
      title: "Dispatch & Installation",
      description: "Seamless order assignment to installation team"
    },
    {
      icon: <Shield className="text-purple-400" size={24} />,
      title: "Verification System",
      description: "Multi-level order verification for accuracy"
    },
    {
      icon: <Clock className="text-orange-400" size={24} />,
      title: "Real-time Updates",
      description: "Live tracking of installation progress"
    }
  ];

  const stats = [
    { value: "500+", label: "Orders Completed", icon: <CheckCircle size={20} /> },
    { value: "50+", label: "Team Members", icon: <Users size={20} /> },
    { value: "24/7", label: "Support Available", icon: <Zap size={20} /> },
    { value: "98%", label: "Satisfaction Rate", icon: <Sparkles size={20} /> }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Order Created",
      description: "Sales person fills installation order form",
      role: "Sales Team"
    },
    {
      step: "02",
      title: "Stock Verification",
      description: "Stock manager checks product availability",
      role: "Stock Manager"
    },
    {
      step: "03",
      title: "Dispatch Approval",
      description: "Dispatch manager assigns installation team",
      role: "Dispatch Team"
    },
    {
      step: "04",
      title: "Installation Done",
      description: "Installation complete with customer sign-off",
      role: "Installation Team"
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Hero Content */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
            <Sparkles size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-blue-400">Complete Installation Management System</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6">
            Streamline Your
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent block mt-2">
              Installation Workflow
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10">
            From order creation to final installation, manage your entire process seamlessly. 
            Real-time updates, automated notifications, and complete transparency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/order"
              className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 flex items-center gap-2"
            >
              Create New Order
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/track"
              className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all border border-slate-700 flex items-center gap-2"
            >
              Track Installation
              <Clock size={20} />
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500/30 transition-all group"
            >
              <div className="flex justify-center mb-2 text-blue-400 group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              STOCKPRO
            </span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 hover:border-blue-500/30 transition-all group"
              >
                <div className="bg-slate-800/80 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600/20 transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Timeline */}
        <div className="relative mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-16">
            How It{' '}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
              Works
            </span>
          </h2>

          <div className="relative">
            {/* Connecting Line - Desktop */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600/20 via-blue-600 to-blue-600/20"></div>
            
            <div className="grid lg:grid-cols-4 gap-8">
              {workflowSteps.map((step, index) => (
                <div key={index} className="relative">
                  {/* Step Number */}
                  <div className="lg:absolute lg:-top-12 left-1/2 lg:transform lg:-translate-x-1/2 mb-4 lg:mb-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                      <span className="text-white font-bold">{step.step}</span>
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 mt-8 lg:mt-0 hover:border-blue-500/30 transition-all group">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                      <p className="text-sm text-slate-400 mb-3">{step.description}</p>
                      <span className="inline-block text-xs font-medium text-blue-400 bg-blue-600/20 px-3 py-1 rounded-full">
                        {step.role}
                      </span>
                    </div>
                  </div>

                  {/* Arrow for Desktop */}
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-8 text-slate-600">
                      <ArrowRight size={24} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Streamline Your Operations?
            </h3>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of companies using STOCKPRO for their installation management
            </p>
            <Link 
              href="/order"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all shadow-lg shadow-blue-500/30"
            >
              Get Started Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;