import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function testNewContracts() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // New deployed addresses
  const vaultAddress = '0x0692a7dFb2f37632586ffFa21bE44F4E34c18dC1';
  const mockPoolAddress = '0x04435f96c3F4E76840e08f94e0A417A4E071CEFD';
  const mockATokenAddress = '0xD400a7a679B77A041f13D12ae4A990BF16774a71';
  const cUSDAddress = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b';
  
  console.log('🧪 Testing New Deployed Contracts...');
  console.log('Vault:', vaultAddress);
  console.log('Mock Pool:', mockPoolAddress);
  console.log('Mock aToken:', mockATokenAddress);
  
  const vaultABI = [
    'function deposit(uint256 assets) external returns (uint256)',
    'function balanceOf(address user) external view returns (uint256)',
    'function totalAssets() external view returns (uint256)',
    'function getVaultStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
    'function paused() external view returns (bool)',
    'function MIN_DEPOSIT() external view returns (uint256)',
    'function MAX_DEPOSIT() external view returns (uint256)',
    'function MAX_TVL() external view returns (uint256)'
  ];
  
  const poolABI = [
    'function getUserAccountData(address user) external view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
    'function getReserveData(address asset) external view returns (uint256, uint128, uint128, uint128, uint128, uint128, uint40, address, address, address, address, uint8)',
    'function totalAssets() external view returns (uint256)',
    'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
    'function withdraw(address asset, uint256 amount, address to) external returns (uint256)'
  ];
  
  const cUSDABI = [
    'function approve(address spender, uint256 amount) external returns (bool)',
    'function balanceOf(address account) external view returns (uint256)',
    'function allowance(address owner, address spender) external view returns (uint256)'
  ];
  
  const vault = new ethers.Contract(vaultAddress, vaultABI, provider);
  const pool = new ethers.Contract(mockPoolAddress, poolABI, provider);
  const cUSD = new ethers.Contract(cUSDAddress, cUSDABI, provider);
  
  try {
    console.log('\n📊 Testing Contract Functions...');
    
    // Test MockAavePool functions
    console.log('Testing MockAavePool getUserAccountData...');
    const userData = await pool.getUserAccountData(wallet.address);
    console.log('✅ getUserAccountData works:', userData.map(d => ethers.formatEther(d)));
    
    console.log('Testing MockAavePool getReserveData...');
    const reserveData = await pool.getReserveData(cUSDAddress);
    console.log('✅ getReserveData works:', {
      configuration: reserveData[0].toString(),
      liquidityIndex: ethers.formatEther(reserveData[1]),
      currentLiquidityRate: ethers.formatEther(reserveData[3])
    });
    
    console.log('Testing MockAavePool totalAssets...');
    const poolAssets = await pool.totalAssets();
    console.log('✅ totalAssets works:', ethers.formatEther(poolAssets));
    
    // Test Vault functions
    console.log('\nTesting AttestifyVault functions...');
    const isPaused = await vault.paused();
    const minDeposit = await vault.MIN_DEPOSIT();
    const maxDeposit = await vault.MAX_DEPOSIT();
    const maxTVL = await vault.MAX_TVL();
    const totalAssets = await vault.totalAssets();
    
    console.log('✅ Vault paused:', isPaused);
    console.log('✅ Min Deposit:', ethers.formatEther(minDeposit), 'cUSD');
    console.log('✅ Max Deposit:', ethers.formatEther(maxDeposit), 'cUSD');
    console.log('✅ Max TVL:', ethers.formatEther(maxTVL), 'cUSD');
    console.log('✅ Total Assets:', ethers.formatEther(totalAssets), 'cUSD');
    
    console.log('\n🎉 All contract functions are working!');
    console.log('\n📋 New Contract Addresses:');
    console.log('- AttestifyVault:', vaultAddress);
    console.log('- MockAavePool:', mockPoolAddress);
    console.log('- MockAToken:', mockATokenAddress);
    
    return {
      vault: vaultAddress,
      pool: mockPoolAddress,
      aToken: mockATokenAddress
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

testNewContracts()
  .then((addresses) => {
    console.log('\n✅ Contract testing completed successfully!');
    console.log('Ready to update frontend with new addresses:', addresses);
  })
  .catch((error) => {
    console.error('❌ Contract testing failed:', error);
    process.exit(1);
  });
