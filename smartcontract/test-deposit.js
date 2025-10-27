const { ethers } = require('hardhat');

async function testDeposit() {
  console.log('🧪 Testing deposit function directly...');
  
  // Contract addresses (update these with your deployed addresses)
  const VAULT_ADDRESS = '0x02929f7b33e39acA574BE268552181370f728980'; // Your deployed vault
  const CUSD_ADDRESS = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1'; // cUSD on Celo Sepolia
  
  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log('Using account:', deployer.address);
  
  // Check balance
  const cusdBalance = await ethers.provider.getBalance(deployer.address);
  console.log('ETH balance:', ethers.formatEther(cusdBalance), 'ETH');
  
  // Get cUSD contract
  const cUSD = await ethers.getContractAt('IERC20', CUSD_ADDRESS);
  const cusdTokenBalance = await cUSD.balanceOf(deployer.address);
  console.log('cUSD balance:', ethers.formatEther(cusdTokenBalance), 'cUSD');
  
  // Get vault contract
  const vault = await ethers.getContractAt('AttestifyVault', VAULT_ADDRESS);
  
  // Check if user is verified
  const isVerified = await vault.isVerified(deployer.address);
  console.log('Is verified:', isVerified);
  
  if (!isVerified) {
    console.log('❌ User not verified. Attempting to verify...');
    try {
      const tx = await vault.verifySelfProof('0x', '0x');
      await tx.wait();
      console.log('✅ Verification successful');
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      return;
    }
  }
  
  // Check minimum deposit
  const minDeposit = await vault.MIN_DEPOSIT();
  console.log('Minimum deposit:', ethers.formatEther(minDeposit), 'cUSD');
  
  // Check if contract is paused
  const isPaused = await vault.paused();
  console.log('Contract paused:', isPaused);
  
  if (isPaused) {
    console.log('❌ Contract is paused. Cannot deposit.');
    return;
  }
  
  // Check allowance
  const allowance = await cUSD.allowance(deployer.address, VAULT_ADDRESS);
  console.log('Current allowance:', ethers.formatEther(allowance), 'cUSD');
  
  const depositAmount = ethers.parseEther('1'); // 1 cUSD
  console.log('Attempting to deposit:', ethers.formatEther(depositAmount), 'cUSD');
  
  // Check if approval is needed
  if (allowance < depositAmount) {
    console.log('🔐 Approving cUSD...');
    try {
      const approveTx = await cUSD.approve(VAULT_ADDRESS, depositAmount);
      await approveTx.wait();
      console.log('✅ Approval successful');
    } catch (error) {
      console.error('❌ Approval failed:', error.message);
      return;
    }
  }
  
  // Attempt deposit
  try {
    console.log('💰 Attempting deposit...');
    const depositTx = await vault.deposit(depositAmount, {
      gasLimit: 500000 // Increased gas limit
    });
    console.log('Transaction hash:', depositTx.hash);
    
    const receipt = await depositTx.wait();
    console.log('✅ Deposit successful!');
    console.log('Gas used:', receipt.gasUsed.toString());
    
    // Check new balance
    const newBalance = await vault.balanceOf(deployer.address);
    console.log('New vault balance:', ethers.formatEther(newBalance), 'cUSD');
    
  } catch (error) {
    console.error('❌ Deposit failed:', error.message);
    
    // Try to decode the error
    if (error.data) {
      console.log('Error data:', error.data);
    }
  }
}

testDeposit()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
