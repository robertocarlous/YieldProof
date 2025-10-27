import { createPublicClient, http, formatEther } from 'viem';
import { celo } from 'viem/chains';

async function findRealAaveAddresses() {
  console.log('🔍 Finding real Aave V3 addresses on Celo mainnet...');
  
  const publicClient = createPublicClient({
    chain: celo,
    transport: http('https://forno.celo.org'),
  });
  
  // Common Aave V3 Pool addresses (try different networks)
  const possibleAddresses = [
    '0x794a61358D6845594F94dc1DB02A252b5b4814aD', // Common across networks
    '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // Another common one
    '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951', // Celo-specific
  ];
  
  const cUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a'; // cUSD on Celo mainnet
  
  for (const address of possibleAddresses) {
    try {
      console.log(`\n🔍 Checking ${address}...`);
      const code = await publicClient.getCode({ address: address as `0x${string}` });
      
      if (code && code.length > 2) {
        console.log(`✅ Found contract at: ${address}`);
        
        // Try to get reserves list
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
          
          console.log(`   📊 Total reserves: ${reserves.length}`);
          
          // Check if cUSD is in the reserves
          let cUSDFound = false;
          let aTokenAddress = '';
          
          for (let i = 0; i < reserves.length; i++) {
            const reserve = reserves[i];
            console.log(`   Reserve ${i}: ${reserve}`);
            
            if (reserve.toLowerCase() === cUSD_ADDRESS.toLowerCase()) {
              console.log(`   🎯 Found cUSD reserve!`);
              cUSDFound = true;
              
              // Get reserve data to find aToken address
              try {
                const reserveData = await publicClient.readContract({
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
                  args: [reserve as `0x${string}`],
                });
                
                aTokenAddress = reserveData.aTokenAddress;
                console.log(`   🎯 aToken address: ${aTokenAddress}`);
                console.log(`   📈 Current liquidity rate: ${reserveData.currentLiquidityRate}`);
                console.log(`   💰 Liquidity index: ${reserveData.liquidityIndex}`);
                
              } catch (error) {
                console.log(`   ❌ Could not get reserve data: ${error}`);
              }
            }
          }
          
          if (cUSDFound) {
            console.log('\n🎉 SUCCESS! Found Aave V3 on Celo mainnet:');
            console.log(`   Pool: ${address}`);
            console.log(`   cUSD: ${cUSD_ADDRESS}`);
            console.log(`   aToken: ${aTokenAddress}`);
            
            return {
              pool: address,
              cUSD: cUSD_ADDRESS,
              aToken: aTokenAddress,
            };
          } else {
            console.log(`   ❌ cUSD not found in reserves`);
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
  
  console.log('\n💡 Aave V3 might not be deployed on Celo mainnet yet.');
  console.log('   Consider checking Aave governance or using a different approach.');
  
  return null;
}

findRealAaveAddresses()
  .then((result) => {
    if (result) {
      console.log('\n✅ Found Aave addresses! You can now deploy your vault with these addresses.');
    } else {
      console.log('\n❌ No Aave V3 found on Celo mainnet.');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
