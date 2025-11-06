const { createPublicClient, http, formatEther } = require('viem');
const { celoAlfajores } = require('viem/chains');

async function debugContract() {
  console.log('🔍 Debugging contract state...');
  
  const VAULT_ADDRESS = '0x02929f7b33e39acA574BE268552181370f728980';
  
  const publicClient = createPublicClient({
    chain: celoAlfajores,
    transport: http('https://forno.celo-sepolia.celo-testnet.org'),
  });
  
  try {
    // Check basic contract info
    console.log('\n📊 Contract State:');
    
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
    console.log('✅ Min deposit:', formatEther(minDeposit), 'cUSD');
    
    const maxDeposit = await publicClient.readContract({
      address: VAULT_ADDRESS,
      abi: [
        {
          inputs: [],
          name: 'MAX_DEPOSIT',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
          type: 'function',
        },
      ],
      functionName: 'MAX_DEPOSIT',
    });
    console.log('✅ Max deposit:', formatEther(maxDeposit), 'cUSD');
    
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
    
    // Try to get total assets - this might be the issue
    try {
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
    } catch (error) {
      console.log('❌ Total assets call failed:', error.message);
      console.log('   This suggests the Aave integration is broken!');
    }
    
    console.log('\n🔍 Analysis:');
    console.log('- Min deposit (1 cUSD) should be fine');
    console.log('- Max deposit and TVL limits should allow 1 cUSD');
    console.log('- If totalAssets() is failing, the Aave integration is broken');
    console.log('\n💡 Solution: The issue is likely in the totalAssets() function');
    console.log('   which calls Aave contracts. This is causing the revert.');
    
  } catch (error) {
    console.error('❌ Error debugging contract:', error.message);
  }
}

debugContract();
