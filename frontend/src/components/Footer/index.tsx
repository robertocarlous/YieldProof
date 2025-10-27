'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'How it Works', href: '#how-it-works' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
    resources: [
      { name: 'Self Protocol', href: 'https://docs.self.xyz', external: true },
      { name: 'Aave Market', href: 'https://docs.Aave.market', external: true },
      { name: 'Celo Network', href: 'https://docs.celo.org', external: true },
    ],
    community: [
      { name: 'Discord', href: '#', external: true },
      { name: 'Twitter', href: '#', external: true },
      { name: 'Telegram', href: '#', external: true },
    ],
  };

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: MessageCircle, href: '#', label: 'Discord' },
  ];

  return (
    <footer ref={ref} className="bg-gray-900 text-white py-12 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400 to-blue-400 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="md:col-span-1"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 mb-4"
            >
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="h-6 w-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center"
              >
                <Shield className="h-4 w-4 text-white" />
              </motion.div>
              <span className="text-xl font-bold">Attestify</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-gray-400 text-sm mb-4"
            >
              Verified savings on Celo. Earn yield while preserving your privacy.
            </motion.p>
            
            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="flex gap-3"
            >
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 bg-gray-800 hover:bg-green-600 rounded-lg transition-colors duration-200 group"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Product Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.name}
                    <motion.div
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      className="h-0.5 w-0 bg-green-500 rounded-full transition-all duration-200"
                    />
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                >
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : '_self'}
                    rel={link.external ? 'noopener noreferrer' : ''}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.name}
                    {link.external && (
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 45 }}
                        className="transition-transform duration-200"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </motion.div>
                    )}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Community Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-semibold mb-4 text-white">Community</h4>
            <ul className="space-y-2">
              {footerLinks.community.map((link, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                >
                  <a
                    href={link.href}
                    target={link.external ? '_blank' : '_self'}
                    rel={link.external ? 'noopener noreferrer' : ''}
                    className="text-sm text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.name}
                    {link.external && (
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 45 }}
                        className="transition-transform duration-200"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </motion.div>
                    )}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="border-t border-gray-800 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p
              whileHover={{ scale: 1.02 }}
              className="text-center md:text-left text-sm text-gray-400"
            >
              © 2025 Attestify. Built for Celo Proof of Ship.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="flex items-center gap-4 text-sm text-gray-400"
            >
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </motion.a>
              <span className="text-gray-600">•</span>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </motion.a>
            </motion.div>
          </div>
        </motion.div>

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
          className="absolute top-10 left-10 w-16 h-16 border border-green-500/20 rounded-full opacity-30"
        />

        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute bottom-10 right-20 w-12 h-12 border border-blue-500/20 rounded-full opacity-30"
        />
      </div>
    </footer>
  );
}
