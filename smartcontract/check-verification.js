import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function checkVerification() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const vaultAddress = '0x0692a7dFb2f37632586ffFa21bE44F4E34c18dC1';
  
  const vaultABI = [
    'function isVerified(address user) external view returns (bool)',
    'function users(address user) external view returns (bool, uint256, uint256, uint256, uint256, uint256)'
  ];
  
  const vault = new ethers.Contract(vaultAddress, vaultABI, provider);
  
  try {
    const isVerified = await vault.isVerified(wallet.address);
    console.log('User verified:', isVerified);
    
    const userData = await vault.users(wallet.address);
    console.log('User data:', {
      isVerified: userData[0],
      verifiedAt: userData[1].toString(),
      totalDeposited: ethers.formatEther(userData[2]),
      totalWithdrawn: ethers.formatEther(userData[3]),
      lastActionTime: userData[4].toString(),
      userIdentifier: userData[5].toString()
    });
    
    if (!isVerified) {
      console.log('❌ User is not verified - this is why deposit fails');
      console.log('💡 Need to verify user first before depositing');
    } else {
      console.log('✅ User is verified');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkVerification();
