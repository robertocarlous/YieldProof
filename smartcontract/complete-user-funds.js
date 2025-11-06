import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

async function checkAndCompleteUserFunds() {
  const provider = new ethers.JsonRpcProvider('https://forno.celo-sepolia.celo-testnet.org');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  const userWallet = '0x34C775FB2fe2b8383B5659B3f7Fc1E721Ca04A3a';
  const cUSDAddress = '0xdE9e4C3ce781b4bA68120d6261cbad65ce0aB00b';
  
  const cUSDABI = [
    'function balanceOf(address account) external view returns (uint256)',
    'function transfer(address to, uint256 amount) external returns (bool)'
  ];
  
  const cUSD = new ethers.Contract(cUSDAddress, cUSDABI, wallet);
  
  try {
    console.log('💰 Checking and completing user funds...');
    
    // Check current balances
    const userBalance = await cUSD.balanceOf(userWallet);
    const ourBalance = await cUSD.balanceOf(wallet.address);
    
    console.log('Current user balance:', ethers.formatEther(userBalance), 'cUSD');
    console.log('Our wallet balance:', ethers.formatEther(ourBalance), 'cUSD');
    
    // The user should have at least 1.0 cUSD for testing
    const targetBalance = ethers.parseEther('1.0');
    
    if (userBalance < targetBalance) {
      const amountToSend = targetBalance - userBalance;
      console.log(`📤 Sending ${ethers.formatEther(amountToSend)} cUSD to complete user funds...`);
      
      if (ourBalance >= amountToSend) {
        const transferTx = await cUSD.transfer(userWallet, amountToSend);
        console.log('Transfer transaction:', transferTx.hash);
        await transferTx.wait();
        console.log('✅ Transfer successful');
        
        const finalUserBalance = await cUSD.balanceOf(userWallet);
        console.log('Final user balance:', ethers.formatEther(finalUserBalance), 'cUSD');
        
        if (finalUserBalance >= targetBalance) {
          console.log('🎉 User now has sufficient funds for testing!');
        }
      } else {
        console.log('❌ Insufficient balance in our wallet');
        console.log('💡 Need to get more cUSD from faucet');
        
        // Try to get from faucet
        console.log('🔄 Attempting to get cUSD from faucet...');
        try {
          const response = await fetch('https://faucet.celo.org/request', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: wallet.address,
              amount: 10
            })
          });
          
          if (response.ok) {
            console.log('✅ Faucet request successful');
            console.log('⏳ Waiting for funds to arrive...');
            
            // Wait a bit and check balance again
            await new Promise(resolve => setTimeout(resolve, 10000));
            
            const newOurBalance = await cUSD.balanceOf(wallet.address);
            console.log('New our balance:', ethers.formatEther(newOurBalance), 'cUSD');
            
            if (newOurBalance >= amountToSend) {
              console.log('📤 Now sending funds to user...');
              const transferTx = await cUSD.transfer(userWallet, amountToSend);
              console.log('Transfer transaction:', transferTx.hash);
              await transferTx.wait();
              console.log('✅ Transfer successful');
              
              const finalUserBalance = await cUSD.balanceOf(userWallet);
              console.log('Final user balance:', ethers.formatEther(finalUserBalance), 'cUSD');
            }
          } else {
            console.log('❌ Faucet request failed');
          }
        } catch (faucetError) {
          console.log('❌ Faucet error:', faucetError.message);
        }
      }
    } else {
      console.log('✅ User already has sufficient funds');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAndCompleteUserFunds();
