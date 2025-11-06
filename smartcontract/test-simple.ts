import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem';
import { celoAlfajores } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

async function testDeposit() {
  console.log('🧪 Testing deposit function directly...');
  
  // Contract addresses
  const VAULT_ADDRESS = '0x02929f7b33e39acA574BE268552181370f728980';
  const CUSD_ADDRESS = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';
  
  // Get private key from environment
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found in environment');
    return;
  }
  
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  console.log('Using account:', account.address);
  
  // Create clients
  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http('https://alfajores-forno.celo-testnet.org'),
  });
  
  const walletClient = createWalletClient({
    account,
    chain: celoAlfajores,
    transport: http('https://alfajores-forno.celo-testnet.org'),
  });
  
  // Check ETH balance for gas
  const ethBalance = await publicClient.getBalance({ address: account.address });
  console.log('ETH balance:', formatEther(ethBalance), 'ETH');
  
  // Check cUSD balance
  const cusdBalance = await publicClient.readContract({
    address: CUSD_ADDRESS,
    abi: [
      {
        inputs: [{ name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'balanceOf',
    args: [account.address],
  });
  console.log('cUSD balance:', formatEther(cusdBalance), 'cUSD');
  
  // Check if user is verified
  const isVerified = await publicClient.readContract({
    address: VAULT_ADDRESS,
    abi: [
      {
        inputs: [{ name: 'user', type: 'address' }],
        name: 'isVerified',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'isVerified',
    args: [account.address],
  });
  console.log('Is verified:', isVerified);
  
  if (!isVerified) {
    console.log('❌ User not verified. Attempting to verify...');
    try {
      const tx = await walletClient.writeContract({
        address: VAULT_ADDRESS,
        abi: [
          {
            inputs: [
              { name: 'proof', type: 'bytes' },
              { name: 'data', type: 'bytes' }
            ],
            name: 'verifySelfProof',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        functionName: 'verifySelfProof',
        args: ['0x', '0x'],
      });
      console.log('✅ Verification successful, tx:', tx);
    } catch (error: any) {
      console.error('❌ Verification failed:', error.message);
      return;
    }
  }
  
  // Check minimum deposit
  const minDeposit = await publicClient.readContract({
    address: VAULT_ADDRESS,
    abi: [
      {
        inputs: [],
        name: 'MIN_DEPOSIT',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'MIN_DEPOSIT',
  });
  console.log('Minimum deposit:', formatEther(minDeposit), 'cUSD');
  
  // Check if contract is paused
  const isPaused = await publicClient.readContract({
    address: VAULT_ADDRESS,
    abi: [
      {
        inputs: [],
        name: 'paused',
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'paused',
  });
  console.log('Contract paused:', isPaused);
  
  if (isPaused) {
    console.log('❌ Contract is paused. Cannot deposit.');
    return;
  }
  
  // Check allowance
  const allowance = await publicClient.readContract({
    address: CUSD_ADDRESS,
    abi: [
      {
        inputs: [
          { name: 'owner', type: 'address' },
          { name: 'spender', type: 'address' }
        ],
        name: 'allowance',
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'allowance',
    args: [account.address, VAULT_ADDRESS],
  });
  console.log('Current allowance:', formatEther(allowance), 'cUSD');
  
  const depositAmount = parseEther('1'); // 1 cUSD
  console.log('Attempting to deposit:', formatEther(depositAmount), 'cUSD');
  
  // Check if approval is needed
  if (allowance < depositAmount) {
    console.log('🔐 Approving cUSD...');
    try {
      const tx = await walletClient.writeContract({
        address: CUSD_ADDRESS,
        abi: [
          {
            inputs: [
              { name: 'spender', type: 'address' },
              { name: 'amount', type: 'uint256' }
            ],
            name: 'approve',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        functionName: 'approve',
        args: [VAULT_ADDRESS, depositAmount],
      });
      console.log('✅ Approval successful, tx:', tx);
    } catch (error: any) {
      console.error('❌ Approval failed:', error.message);
      return;
    }
  }
  
  // Attempt deposit
  try {
    console.log('💰 Attempting deposit...');
    const tx = await walletClient.writeContract({
      address: VAULT_ADDRESS,
      abi: [
        {
          inputs: [{ name: 'assets', type: 'uint256' }],
          name: 'deposit',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'nonpayable',
          type: 'function',
        },
      ],
      functionName: 'deposit',
      args: [depositAmount],
      gas: 500000n,
    });
    console.log('Transaction hash:', tx);
    
    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: tx });
    console.log('✅ Deposit successful!');
    console.log('Gas used:', receipt.gasUsed.toString());
    
    // Check new balance
    const newBalance = await publicClient.readContract({
      address: VAULT_ADDRESS,
      abi: [
        {
          inputs: [{ name: 'user', type: 'address' }],
          name: 'balanceOf',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'balanceOf',
      args: [account.address],
    });
    console.log('New vault balance:', formatEther(newBalance), 'cUSD');
    
  } catch (error: any) {
    console.error('❌ Deposit failed:', error.message);
    
    // Try to decode the error
    if (error.cause?.data) {
      console.log('Error data:', error.cause.data);
    }
  }
}

testDeposit()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
