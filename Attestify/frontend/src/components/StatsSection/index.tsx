'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { TrendingUp, DollarSign, Shield, Users } from 'lucide-react';

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    {
      icon: TrendingUp,
      value: '3-15%',
      label: 'APY Returns',
      description: 'Competitive yields',
      color: 'green',
      delay: 0.1,
    },
    {
      icon: DollarSign,
      value: '$0',
      label: 'Platform Fees',
      description: 'No hidden costs',
      color: 'green',
      delay: 0.2,
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Privacy Protected',
      description: 'Zero-knowledge proofs',
      color: 'blue',
      delay: 0.3,
    },
    {
      icon: Users,
      value: '24/7',
      label: 'AI Support',
      description: 'Always available',
      color: 'purple',
      delay: 0.4,
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-green-100',
          icon: 'text-green-600',
        };
      case 'blue':
        return {
          bg: 'bg-blue-100',
          icon: 'text-blue-600',
        };
      case 'purple':
        return {
          bg: 'bg-purple-100',
          icon: 'text-purple-600',
        };
      default:
        return {
          bg: 'bg-gray-100',
          icon: 'text-gray-600',
        };
    }
  };

  return (
    <section ref={ref} className="py-16 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-400 to-blue-400" />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-0 left-0 w-64 h-64 bg-green-300 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => {
            const colorClasses = getColorClasses(stat.color);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ 
                  duration: 0.6, 
                  delay: stat.delay,
                  ease: 'easeOut'
                }}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses.bg} mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  <stat.icon className={`h-6 w-6 ${colorClasses.icon}`} />
                </motion.div>
                
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ 
                    duration: 0.5, 
                    delay: stat.delay + 0.2,
                    ease: 'backOut'
                  }}
                  className="text-4xl font-bold text-gray-900 mb-1"
                >
                  {stat.value}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ 
                    duration: 0.4, 
                    delay: stat.delay + 0.4
                  }}
                  className="text-sm font-semibold text-gray-900 mb-1"
                >
                  {stat.label}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ 
                    duration: 0.4, 
                    delay: stat.delay + 0.6
                  }}
                  className="text-sm text-gray-600"
                >
                  {stat.description}
                </motion.div>

                {/* Hover Effect */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full origin-center"
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-10 right-10 w-20 h-20 border-2 border-green-200 rounded-full opacity-20"
        />
        
        <motion.div
          animate={{
            rotate: [360, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-10 left-10 w-16 h-16 border-2 border-blue-200 rounded-full opacity-20"
        />
      </div>
    </section>
  );
}
