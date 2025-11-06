// Simple script to check contract state
const { createPublicClient, http, formatEther } = require('viem');
const { celoAlfajores } = require('viem/chains');

async function checkContract() {
  console.log('🔍 Checking contract state...');
  
  const VAULT_ADDRESS = '0x02929f7b33e39acA574BE268552181370f728980';
  const CUSD_ADDRESS = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';
  
  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http('https://forno.celo-sepolia.celo-testnet.org'),
  });
  
  try {
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
    console.log('✅ Contract paused:', isPaused);
    
    // Check total assets
    const totalAssets = await publicClient.readContract({
      address: VAULT_ADDRESS,
      abi: [
        {
          inputs: [],
          name: 'totalAssets',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'totalAssets',
    });
    console.log('✅ Total assets:', formatEther(totalAssets), 'cUSD');
    
    // Check max TVL
    const maxTVL = await publicClient.readContract({
      address: VAULT_ADDRESS,
      abi: [
        {
          inputs: [],
          name: 'MAX_TVL',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'MAX_TVL',
    });
    console.log('✅ Max TVL:', formatEther(maxTVL), 'cUSD');
    
    console.log('\n📊 Contract Summary:');
    console.log('- Min deposit: 1 cUSD');
    console.log('- Contract paused:', isPaused);
    console.log('- Current TVL:', formatEther(totalAssets), 'cUSD');
    console.log('- Max TVL:', formatEther(maxTVL), 'cUSD');
    console.log('- Available capacity:', formatEther(maxTVL - totalAssets), 'cUSD');
    
  } catch (error) {
    console.error('❌ Error checking contract:', error.message);
  }
}

checkContract();
