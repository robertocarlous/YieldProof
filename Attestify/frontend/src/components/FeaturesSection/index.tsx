'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Shield, 
  TrendingUp, 
  Zap, 
  Lock, 
  Repeat, 
  BarChart3 
} from 'lucide-react';

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const features = [
    {
      icon: Shield,
      title: 'Privacy-Preserving Verification',
      description: 'Verify your identity using Self Protocol\'s zero-knowledge proofs. Prove you\'re 18+ without revealing personal data.',
      gradient: 'from-green-500 to-emerald-600',
      delay: 0.1,
    },
    {
      icon: TrendingUp,
      title: 'Automatic Yield Generation',
      description: 'Your funds are deployed to Aave Market earning yield. Watch your balance grow with compound interest 24/7.',
      gradient: 'from-green-500 to-green-600',
      delay: 0.2,
    },
    {
      icon: Zap,
      title: 'AI-Powered Recommendations',
      description: 'Chat with your AI advisor. Get personalized strategies based on your goals and risk tolerance.',
      gradient: 'from-blue-500 to-indigo-600',
      delay: 0.3,
    },
    {
      icon: Lock,
      title: 'Bank-Grade Security',
      description: 'Audited smart contracts and battle-tested DeFi protocols. Your funds stay under your control.',
      gradient: 'from-purple-500 to-pink-600',
      delay: 0.4,
    },
    {
      icon: Repeat,
      title: 'Instant Withdrawals',
      description: 'No lock-ups, no penalties, no waiting. Withdraw anytime with one click. True financial freedom.',
      gradient: 'from-orange-500 to-red-600',
      delay: 0.5,
    },
    {
      icon: BarChart3,
      title: 'Real-Time Analytics',
      description: 'Track performance, earnings history, and projected returns. Beautiful charts at your fingertips.',
      gradient: 'from-cyan-500 to-blue-600',
      delay: 0.6,
    },
  ];

  return (
    <section ref={ref} id="features" className="py-24 bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-green-200 to-blue-200 rounded-full blur-3xl opacity-20"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Everything You Need to
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="block text-green-600"
            >
              Earn with Confidence
            </motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Professional-grade features designed for everyone
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.6, 
                delay: feature.delay,
                ease: 'easeOut'
              }}
              whileHover={{ 
                y: -8,
                scale: 1.02,
              }}
              className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-2xl`}
              />

              {/* Icon */}
              <motion.div
                whileHover={{ 
                  rotate: 360,
                  scale: 1.1,
                }}
                transition={{ duration: 0.6 }}
                className={`inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
              >
                <feature.icon className="h-7 w-7 text-white" />
              </motion.div>

              {/* Content */}
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: feature.delay + 0.2 }}
                whileHover={{ x: 5 }}
                className="text-xl font-bold text-gray-900 mb-3 relative z-10"
              >
                {feature.title}
              </motion.h3>
              
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: feature.delay + 0.4 }}
                className="text-gray-600 leading-relaxed relative z-10"
              >
                {feature.description}
              </motion.p>

              {/* Hover Border Effect */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl origin-left`}
              />

              {/* Floating Particles on Hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full opacity-60"
              />
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="absolute top-8 right-8 w-1 h-1 bg-blue-400 rounded-full opacity-60"
              />
            </motion.div>
          ))}
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute top-40 left-10 w-16 h-16 border-2 border-green-300 rounded-full opacity-20"
        />

        <motion.div
          animate={{
            y: [0, 15, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
          className="absolute bottom-20 right-20 w-12 h-12 border-2 border-blue-300 rounded-full opacity-20"
        />
      </div>
    </section>
  );
}
