import { createPublicClient, http } from 'viem';
import { celo } from 'viem/chains';

async function findAaveAddresses() {
  console.log('🔍 Finding Aave V3 addresses on Celo mainnet...');
  
  const publicClient = createPublicClient({
    chain: celo,
    transport: http('https://forno.celo.org'),
  });
  
  // Common Aave V3 Pool addresses across different networks
  const possiblePoolAddresses = [
    '0x794a61358D6845594F94dc1DB02A252b5b4814aD', // Common Aave V3 Pool address
    '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Another common one
    '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', // Celo-specific (if different)
  ];
  
  for (const address of possiblePoolAddresses) {
    try {
      const code = await publicClient.getCode({ address: address as `0x${string}` });
      if (code && code.length > 2) {
        console.log(`✅ Found Pool contract at: ${address}`);
        
        // Try to call a simple function to verify it's an Aave Pool
        try {
          const reserves = await publicClient.readContract({
            address: address as `0x${string}`,
            abi: [
              {
                inputs: [],
                name: 'getReservesList',
                outputs: [{ name: '', type: 'address[]' }],
                stateMutability: 'view',
                type: 'function',
              },
            ],
            functionName: 'getReservesList',
          });
          
          console.log(`   Reserves count: ${reserves.length}`);
          
          // Look for cUSD in reserves
          for (let i = 0; i < reserves.length; i++) {
            const reserve = reserves[i];
            console.log(`   Reserve ${i}: ${reserve}`);
            
            // Check if this might be cUSD
            if (reserve.toLowerCase().includes('dE9e4C3ce781b4bA68120d6261cbad65ce0aB00b') || 
                reserve.toLowerCase().includes('765DE816845861e75A25fCA122bb6898B8B1282a')) {
              console.log(`   🎯 Found cUSD reserve!`);
              
              // Try to get aToken address
              try {
                const aTokenAddress = await publicClient.readContract({
                  address: address as `0x${string}`,
                  abi: [
                    {
                      inputs: [{ name: 'asset', type: 'address' }],
                      name: 'getReserveData',
                      outputs: [
                        {
                          components: [
                            { name: 'configuration', type: 'tuple' },
                            { name: 'liquidityIndex', type: 'uint128' },
                            { name: 'currentLiquidityRate', type: 'uint128' },
                            { name: 'variableBorrowIndex', type: 'uint128' },
                            { name: 'currentVariableBorrowRate', type: 'uint128' },
                            { name: 'currentStableBorrowRate', type: 'uint128' },
                            { name: 'lastUpdateTimestamp', type: 'uint40' },
                            { name: 'id', type: 'uint16' },
                            { name: 'aTokenAddress', type: 'address' },
                            { name: 'stableDebtTokenAddress', type: 'address' },
                            { name: 'variableDebtTokenAddress', type: 'address' },
                            { name: 'interestRateStrategyAddress', type: 'address' },
                            { name: 'accruedToTreasury', type: 'uint128' },
                            { name: 'unbacked', type: 'uint128' },
                            { name: 'isolationModeTotalDebt', type: 'uint128' }
                          ],
                          name: 'reserveData',
                          type: 'tuple'
                        }
                      ],
                      stateMutability: 'view',
                      type: 'function',
                    },
                  ],
                  functionName: 'getReserveData',
                  args: [reserve],
                });
                
                console.log(`   🎯 aToken address: ${aTokenAddress.aTokenAddress}`);
                console.log(`   📊 Current liquidity rate: ${aTokenAddress.currentLiquidityRate}`);
                
                return {
                  pool: address,
                  cUSD: reserve,
                  aToken: aTokenAddress.aTokenAddress,
                };
              } catch (error) {
                console.log(`   ❌ Could not get aToken address: ${error}`);
              }
            }
          }
        } catch (error) {
          console.log(`   ❌ Could not call getReservesList: ${error}`);
        }
      } else {
        console.log(`❌ No contract at: ${address}`);
      }
    } catch (error) {
      console.log(`❌ Error checking ${address}: ${error}`);
    }
  }
  
  console.log('\n💡 If no addresses found, Aave V3 might not be deployed on Celo mainnet yet.');
  console.log('   Consider using mock contracts or forking Ethereum mainnet instead.');
}

findAaveAddresses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
