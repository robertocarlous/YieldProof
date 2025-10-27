import { createPublicClient, http, formatEther } from 'viem';
import { celo } from 'viem/chains';

async function checkOfficialAaveAddresses() {
  console.log('🔍 Checking official Aave V3 addresses on Celo mainnet...');
  
  const publicClient = createPublicClient({
    chain: celo,
    transport: http('https://forno.celo.org'),
  });
  
  // Official Aave V3 addresses from the documentation
  const officialAddresses = {
    pool: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', // From Aave docs
    poolAddressesProvider: '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e',
    poolConfigurator: '0x64b761D848206f447Fe2dd461b0c635Ec39EbB27',
    aclManager: '0xc2aaCf6553D20d1e9d78E365AAba8032af9c85b0',
    aaveOracle: '0x54586bE62E3c3580375aE3723C145253060Ca0C2',
  };
  
  const cUSD_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a'; // cUSD on Celo mainnet
  
  console.log('📋 Checking official Aave V3 addresses...\n');
  
  for (const [name, address] of Object.entries(officialAddresses)) {
    try {
      console.log(`🔍 Checking ${name}: ${address}`);
      const code = await publicClient.getCode({ address: address as `0x${string}` });
      
      if (code && code.length > 2) {
        console.log(`✅ ${name} contract found!`);
        
        // If it's the Pool contract, try to get reserves
        if (name === 'pool') {
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
                  }
                  
                } catch (error) {
                  console.log(`   ❌ Could not get reserve data: ${error}`);
                }
              }
            }
            
            if (!cUSDFound) {
              console.log(`   ❌ cUSD not found in reserves`);
            }
            
          } catch (error) {
            console.log(`   ❌ Could not call getReservesList: ${error}`);
          }
        }
      } else {
        console.log(`❌ ${name} contract not found`);
      }
    } catch (error) {
      console.log(`❌ Error checking ${name}: ${error}`);
    }
    console.log('');
  }
  
  console.log('💡 If no contracts found, Aave V3 might not be deployed on Celo mainnet yet.');
  console.log('   The addresses in the documentation are for Ethereum mainnet.');
  
  return null;
}

checkOfficialAaveAddresses()
  .then((result) => {
    if (result) {
      console.log('\n✅ Found Aave addresses! You can now deploy your vault with these addresses.');
    } else {
      console.log('\n❌ No Aave V3 found on Celo mainnet.');
      console.log('   Consider using mock contracts or forking Ethereum mainnet instead.');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
