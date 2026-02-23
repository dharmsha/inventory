"use client"; // Client-side interactivity ke liye mandatory

import React from 'react';
import { motion } from 'framer-motion';
import { Package, LineChart, BellRing, Boxes } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const HeroSection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Har child item thode gap ke baad dikhega
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const featureVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 10 } },
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-950 to-gray-900 py-20 md:py-32 overflow-hidden min-h-[calc(100vh-64px)] flex items-center justify-center">
      
      {/* Background Dots & Gradients */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 w-full h-full bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-4xl mx-auto"
        >
          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants} 
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-300"
          >
            Smart Inventory. <br className="hidden sm:inline"/> Simplified. Optimized.
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants} 
            className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
          >
            Apne stock ko real-time mein track karein, suppliers ko manage karein, aur kabhi bhi out-of-stock na ho.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/dashboard" passHref>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-colors duration-300 transform hover:-translate-y-1"
              >
                Get Started
              </motion.button>
            </Link>
            <Link href="/features" passHref>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-colors duration-300 transform hover:-translate-y-1"
              >
                Learn More
              </motion.button>
            </Link>
          </motion.div>

          {/* Feature Highlights (Animated Icons) */}
          <motion.div 
            variants={containerVariants} 
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-slate-300"
          >
            <motion.div variants={featureVariants} className="flex flex-col items-center p-6 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700 shadow-xl hover:shadow-blue-500/20 transition-all duration-300">
              <Package className="text-blue-500 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-white mb-2">Real-time Tracking</h3>
              <p className="text-sm">Stock levels ko turant dekhein aur updates paayein.</p>
            </motion.div>
            <motion.div variants={featureVariants} className="flex flex-col items-center p-6 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700 shadow-xl hover:shadow-indigo-500/20 transition-all duration-300">
              <LineChart className="text-indigo-500 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-white mb-2">Analytics & Reports</h3>
              <p className="text-sm">Detailed reports se smart business decisions lein.</p>
            </motion.div>
            <motion.div variants={featureVariants} className="flex flex-col items-center p-6 rounded-xl bg-slate-800/60 backdrop-blur-sm border border-slate-700 shadow-xl hover:shadow-emerald-500/20 transition-all duration-300">
              <BellRing className="text-emerald-500 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-white mb-2">Smart Alerts</h3>
              <p className="text-sm">Low stock aur expiry dates ke liye automatic alerts.</p>
            </motion.div>
          </motion.div>

        </motion.div>
      </div>

      {/* Hero Image (Abstract Representation) */}
      <motion.div 
        initial={{ x: '100vw', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 50 }}
        className="absolute hidden lg:block right-0 top-1/2 -translate-y-1/2 w-1/3 max-w-md pointer-events-none z-0 opacity-40"
      >
        <Boxes size={300} strokeWidth={0.5} className="text-blue-600/30 rotate-12" />
      </motion.div>

    </section>
  );
};

export default HeroSection;