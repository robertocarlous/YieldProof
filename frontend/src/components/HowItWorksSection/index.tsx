'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, DollarSign, TrendingUp } from 'lucide-react';

export default function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const steps = [
    {
      number: '01',
      icon: Shield,
      title: 'Verify Your Identity',
      description: 'Scan your passport with your phone. Self Protocol creates a zero-knowledge proof. Your data never leaves your device.',
      time: '2 minutes',
      gradient: 'from-green-500 to-emerald-600',
      delay: 0.2,
    },
    {
      number: '02',
      icon: DollarSign,
      title: 'Deposit cUSD',
      description: 'Start with as little as 10 cUSD. Funds automatically deploy to Aave Market. Interest starts immediately.',
      time: '30 seconds',
      gradient: 'from-green-500 to-green-600',
      delay: 0.4,
    },
    {
      number: '03',
      icon: TrendingUp,
      title: 'Watch Your Money Grow',
      description: 'Check dashboard daily. Chat with AI for advice. Withdraw anytime—no fees, no lock-ups.',
      time: 'Ongoing',
      gradient: 'from-blue-500 to-indigo-600',
      delay: 0.6,
    },
  ];

  return (
    <section ref={ref} id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          animate={{
            x: [0, 200, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-400 to-blue-400 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Start Earning in
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="block text-green-600"
            >
              3 Simple Steps
            </motion.span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            From zero to earning in less than 5 minutes
          </motion.p>
        </motion.div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ 
                duration: 0.8, 
                delay: step.delay,
                ease: 'easeOut'
              }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              {/* Connection Line (except for last step) */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ duration: 1, delay: step.delay + 0.5 }}
                  className="hidden lg:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-green-300 to-blue-300 z-0"
                />
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 relative z-10 hover:shadow-2xl transition-all duration-300"
              >
                {/* Step Number */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={isInView ? { scale: 1, rotate: 0 } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: step.delay + 0.2,
                    ease: 'backOut'
                  }}
                  className="absolute -top-6 left-8"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                  >
                    {step.number}
                  </motion.div>
                </motion.div>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={isInView ? { scale: 1, rotate: 0 } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: step.delay + 0.4,
                    ease: 'backOut'
                  }}
                  whileHover={{ 
                    rotate: 360,
                    scale: 1.1,
                  }}
                  className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.gradient} mb-6 mt-8 shadow-lg`}
                >
                  <step.icon className="h-8 w-8 text-white" />
                </motion.div>

                {/* Content */}
                <motion.h3
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: step.delay + 0.6 }}
                  className="text-2xl font-bold text-gray-900 mb-3"
                >
                  {step.title}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: step.delay + 0.8 }}
                  className="text-gray-600 leading-relaxed mb-4"
                >
                  {step.description}
                </motion.p>

                {/* Time Indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ 
                    duration: 0.4, 
                    delay: step.delay + 1.0
                  }}
                  className="inline-flex items-center gap-2 text-sm font-medium text-green-600"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="h-2 w-2 rounded-full bg-green-500"
                  />
                  <span>{step.time}</span>
                </motion.div>

                {/* Floating Particles */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="absolute top-4 right-4 w-1 h-1 bg-green-400 rounded-full"
                />
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.2, 0.6, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                  }}
                  className="absolute bottom-6 right-6 w-1 h-1 bg-blue-400 rounded-full"
                />
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-20 right-20 w-24 h-24 border-2 border-green-200 rounded-full opacity-20"
        />

        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-20 left-20 w-16 h-16 border-2 border-blue-200 rounded-full opacity-20"
        />
      </div>
    </section>
  );
}
