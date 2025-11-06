import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function transferRemainingFunds() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const userWallet = '0x34C775FB2fe2b8383B5659B3f7Fc1E721Ca04A3a';
  const vaultAddress = '0x0692a7dFb2f37632586ffFa21bE44F4E34c18dC1';
  const cUSDAddress = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b';
  
  const cUSDABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)'
  ];
  
  const cUSD = new ethers.Contract(cUSDAddress, cUSDABI, wallet);
  
  try {
    const vaultBalance = await cUSD.balanceOf(vaultAddress);
    console.log('Remaining vault balance:', ethers.formatEther(vaultBalance), 'cUSD');
    
    if (vaultBalance > 0) {
      console.log('📤 Transferring remaining funds to user...');
      const transferTx = await cUSD.transfer(userWallet, vaultBalance);
      console.log('Transfer transaction:', transferTx.hash);
      await transferTx.wait();
      console.log('✅ Transfer successful');
      
      const finalUserBalance = await cUSD.balanceOf(userWallet);
      console.log('Final user balance:', ethers.formatEther(finalUserBalance), 'cUSD');
    } else {
      console.log('✅ No remaining funds in vault');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

transferRemainingFunds();
