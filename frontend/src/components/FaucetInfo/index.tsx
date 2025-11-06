'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Coins } from 'lucide-react';

export default function FaucetInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8"
    >
      <div className="flex items-start gap-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="flex-shrink-0"
        >
          <Coins className="h-8 w-8 text-blue-600" />
        </motion.div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Need Sepolia USDC for Testing?
          </h3>
          <p className="text-gray-700 mb-4">
            Get free test USDC tokens from Aave's official faucet. These tokens work with our vault and can be used to test all features.
          </p>
          
          <motion.a
            href="https://app.aave.com/faucet/"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Get Free Test USDC
          </motion.a>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-blue-200">
        <p className="text-sm text-gray-600">
          💡 <strong>Note:</strong> Testnet tokens have no real value. They're only for testing the YieldProof vault on Sepolia.
        </p>
      </div>
    </motion.div>
  );
}


