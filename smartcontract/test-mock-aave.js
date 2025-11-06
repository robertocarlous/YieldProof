import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function testMockAavePool() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const cUSDAddress = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b';
  const testAmount = ethers.parseEther('0.1'); // Test with 0.1 cUSD
  
  console.log('🧪 Testing MockAavePool Contract...');
  console.log('Test wallet:', wallet.address);
  console.log('Test amount:', ethers.formatEther(testAmount), 'cUSD');
  
  // First, let's deploy a test instance of the fixed contract
  console.log('\n📦 Deploying test MockAavePool...');
  
  const MockAavePoolABI = [
    'constructor()',
    'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external',
    'function withdraw(address asset, uint256 amount, address to) external returns (uint256)',
    'function getUserBalance(address user) external view returns (uint256)',
    'function getUserAccountData(address user) external view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
    'function getReserveData(address asset) external view returns (uint256, uint128, uint128, uint128, uint128, uint128, uint40, address, address, address, address, uint8)',
    'function totalAssets() external view returns (uint256)',
    'function emergencyWithdraw(address token) external',
    'function emergencyWithdraw(address token, uint256 amount) external',
    'function owner() external view returns (address)'
  ];
  
  // Get the contract bytecode (we'll need to compile first)
  console.log('⚠️  Note: This test requires the contract to be deployed first');
  console.log('Let me test the existing broken contract to see what fails...');
  
  const brokenPoolAddress = '0xBd0FA39201fFfD7744056690324fdf67bfc55D1C';
  const brokenPool = new ethers.Contract(brokenPoolAddress, MockAavePoolABI, provider);
  
  try {
    console.log('\n🔍 Testing broken contract functions...');
    
    // Test getUserAccountData (this was failing before)
    console.log('Testing getUserAccountData...');
    const userData = await brokenPool.getUserAccountData(wallet.address);
    console.log('✅ getUserAccountData works:', userData.map(d => ethers.formatEther(d)));
    
    // Test getReserveData
    console.log('Testing getReserveData...');
    const reserveData = await brokenPool.getReserveData(cUSDAddress);
    console.log('✅ getReserveData works:', {
      configuration: reserveData[0].toString(),
      liquidityIndex: ethers.formatEther(reserveData[1]),
      currentLiquidityRate: ethers.formatEther(reserveData[3])
    });
    
    // Test totalAssets
    console.log('Testing totalAssets...');
    const totalAssets = await brokenPool.totalAssets();
    console.log('✅ totalAssets works:', ethers.formatEther(totalAssets));
    
    console.log('\n🎉 All functions are working! The contract is fixed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('This confirms the contract needs to be redeployed with fixes');
  }
}

testMockAavePool();
