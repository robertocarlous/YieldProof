import { ethers } from 'ethers';

async function checkVault() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const vaultAddress = '0xaD763D1E1AAe6a467c7072390DC76b56D032b827';
  const userAddress = '0x34C775FB2fe2b8383B5659B3f7Fc1E721Ca04A3a';
  
  const vaultABI = [
    'function balanceOf(address user) external view returns (uint256)',
    'function totalAssets() external view returns (uint256)',
    'function totalShares() external view returns (uint256)',
    'function shares(address user) external view returns (uint256)',
    'function getVaultStats() external view returns (uint256, uint256, uint256, uint256, uint256, uint256)'
  ];
  
  const vault = new ethers.Contract(vaultAddress, vaultABI, provider);
  
  try {
    const balance = await vault.balanceOf(userAddress);
    const shares = await vault.shares(userAddress);
    const totalAssets = await vault.totalAssets();
    const totalShares = await vault.totalShares();
    const stats = await vault.getVaultStats();
    
    console.log('🔍 Vault State Analysis:');
    console.log('User Balance:', ethers.formatEther(balance), 'cUSD');
    console.log('User Shares:', ethers.formatEther(shares), 'shares');
    console.log('Total Assets:', ethers.formatEther(totalAssets), 'cUSD');
    console.log('Total Shares:', ethers.formatEther(totalShares), 'shares');
    console.log('Vault Stats:', stats.map(s => ethers.formatEther(s)));
    
    if (totalShares > 0) {
      const calculatedBalance = (shares * totalAssets) / totalShares;
      console.log('Calculated Balance:', ethers.formatEther(calculatedBalance), 'cUSD');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkVault();
