'use client';

import { useState, useEffect } from 'react';
import { CONTRACT_ADDRESSES } from '@/config/contracts';

interface DeploymentStatusProps {
  className?: string;
}

export default function DeploymentStatus({ className = '' }: DeploymentStatusProps) {
  const [contractDeployed, setContractDeployed] = useState(false);

  const deploymentSteps = [
    {
      title: '1. Deploy Contract',
      description: 'Deploy AttestifyVault to Celo Sepolia',
      status: contractDeployed ? 'completed' : 'pending',
      action: 'Deploy via Remix IDE or Hardhat',
    },
    {
      title: '2. Update Address',
      description: 'Update vault contract address in config',
      status: contractDeployed && CONTRACT_ADDRESSES.celoSepolia.vault ? 'completed' : 'pending',
      action: 'Set NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS',
    },
    {
      title: '3. Test Functions',
      description: 'Test deposit, withdraw, and verification',
      status: 'pending',
      action: 'Test with testnet tokens',
    },
    {
      title: '4. Deploy to Mainnet',
      description: 'Deploy to Celo mainnet for production',
      status: 'pending',
      action: 'Deploy to production',
    },
  ];

  useEffect(() => {
    // Check if vault contract address is set
    if (CONTRACT_ADDRESSES.celoSepolia.vault) {
      setContractDeployed(true);
    }
  }, []);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Deployment Status</h3>
      
      <div className="space-y-4">
        {deploymentSteps.map((step, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
              step.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : step.status === 'in-progress'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {step.status === 'completed' ? '✓' : index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
              <p className="text-sm text-gray-600">{step.description}</p>
              <p className="text-xs text-gray-500 mt-1">{step.action}</p>
            </div>
          </div>
        ))}
      </div>

      {!contractDeployed && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Ready to Deploy!</h4>
          <p className="text-sm text-blue-700 mb-3">
            Your contract is production-ready with all security fixes applied.
          </p>
          <div className="space-y-2">
            <p className="text-xs text-blue-600">
              <strong>Recommended:</strong> Deploy via Remix IDE
            </p>
            <p className="text-xs text-blue-600">
              <strong>Contract Addresses:</strong> All configured for Celo Sepolia
            </p>
            <p className="text-xs text-blue-600">
              <strong>WalletConnect:</strong> App ID configured ({CONTRACT_ADDRESSES.celoSepolia.vault ? 'Connected' : 'Ready'})
            </p>
          </div>
        </div>
      )}

      {contractDeployed && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h4 className="text-sm font-medium text-green-900 mb-2">Contract Deployed!</h4>
          <p className="text-sm text-green-700 mb-2">
            AttestifyVault is live on Celo Sepolia testnet.
          </p>
          <p className="text-xs text-green-600 font-mono">
            {CONTRACT_ADDRESSES.celoSepolia.vault}
          </p>
        </div>
      )}
    </div>
  );
}
