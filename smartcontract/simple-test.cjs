const { createPublicClient, createWalletClient, http, formatEther, parseEther } = require('viem');
const { celoAlfajores } = require('viem/chains');
const { privateKeyToAccount } = require('viem/accounts');

async function simpleTest() {
  console.log('🧪 Simple contract test...');
  
  const VAULT_ADDRESS = '0x02929f7b33e39acA574BE268552181370f728980';
  
  // Use a test account (you'll need to replace this with your actual private key)
  const testAccount = privateKeyToAccount('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'); // Replace with real key
  
  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http('https://forno.celo-sepolia.celo-testnet.org'),
  });
  
  try {
    // Check if contract exists
    const code = await publicClient.getCode({ address: VAULT_ADDRESS });
    console.log('✅ Contract code length:', code.length);
    
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
    console.log('✅ Minimum deposit:', formatEther(minDeposit), 'cUSD');
    
    // Check if paused
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
    console.log('✅ Contract paused:', isPaused);
    
    console.log('\n📊 Contract is working! The issue might be:');
    console.log('1. Gas estimation problems');
    console.log('2. Aave integration issues in the contract');
    console.log('3. Frontend configuration problems');
    console.log('\n💡 Try increasing gas limit in your frontend to 500,000');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

simpleTest();
