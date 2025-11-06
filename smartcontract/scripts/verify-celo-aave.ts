import { createPublicClient, http, formatEther } from 'viem';
import { celo } from 'viem/chains';

async function verifyCeloAaveAddresses() {
  console.log('🔍 Verifying Aave V3 addresses on Celo mainnet...');
  
  const publicClient = createPublicClient({
    chain: celo,
    transport: http('https://forno.celo.org'),
  });
  
  // Aave V3 Pool address for Celo mainnet
  const AAVE_POOL = '0xf13Fd4951485f54462de0fb534851d9687d1ADea';
  const CUSD_ADDRESS = '0x765de816845861e75a25fca122bb6898b8b1282a'; // cUSD on Celo mainnet
  
  console.log(`🔍 Checking Aave Pool: ${AAVE_POOL}`);
  
  try {
    const code = await publicClient.getCode({ address: AAVE_POOL as `0x${string}` });
    
    if (code && code.length > 2) {
      console.log(`✅ Aave Pool contract found!`);
      
      // Try to get reserves list
      try {
        const reserves = await publicClient.readContract({
          address: AAVE_POOL as `0x${string}`,
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
        
        console.log(`📊 Total reserves: ${reserves.length}`);
        
        // Check if cUSD is in the reserves
        let cUSDFound = false;
        let aTokenAddress = '';
        
        for (let i = 0; i < reserves.length; i++) {
          const reserve = reserves[i];
          console.log(`   Reserve ${i}: ${reserve}`);
          
          if (reserve.toLowerCase() === CUSD_ADDRESS.toLowerCase()) {
            console.log(`   🎯 Found cUSD reserve!`);
            cUSDFound = true;
            
            // Get reserve data to find aToken address
            try {
              const reserveData = await publicClient.readContract({
                address: AAVE_POOL as `0x${string}`,
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
              console.log(`   🆔 Reserve ID: ${reserveData.id}`);
              
              console.log('\n🎉 SUCCESS! Found Aave V3 on Celo mainnet:');
              console.log(`   Pool: ${AAVE_POOL}`);
              console.log(`   cUSD: ${CUSD_ADDRESS}`);
              console.log(`   aToken: ${aTokenAddress}`);
              
              return {
                pool: AAVE_POOL,
                cUSD: CUSD_ADDRESS,
                aToken: aTokenAddress,
              };
              
            } catch (error) {
              console.log(`   ❌ Could not get reserve data: ${error}`);
            }
          }
        }
        
        if (!cUSDFound) {
          console.log(`   ❌ cUSD not found in reserves`);
          console.log(`   Available reserves: ${reserves.length}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Could not call getReservesList: ${error}`);
      }
    } else {
      console.log(`❌ Aave Pool contract not found`);
    }
  } catch (error) {
    console.log(`❌ Error checking Aave Pool: ${error}`);
  }
  
  return null;
}

verifyCeloAaveAddresses()
  .then((result) => {
    if (result) {
      console.log('\n✅ Found Aave addresses! You can now deploy your vault with these addresses.');
      console.log('\n📋 Contract addresses for your deployment:');
      console.log(`   CUSD_ADDRESS = "${result.cUSD}"`);
      console.log(`   ACUSD_ADDRESS = "${result.aToken}"`);
      console.log(`   AAVE_POOL = "${result.pool}"`);
    } else {
      console.log('\n❌ No Aave V3 found on Celo mainnet.');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
