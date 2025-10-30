# Testing Checklist for YieldProof Frontend

## ✅ Pre-Testing Setup

- [x] Frontend development server started
- [x] Brian AI SDK error fixed (optional initialization)
- [x] All references updated (Attestify → YieldProof, cUSD → USDC, Celo → Ethereum Sepolia)
- [x] Self Protocol verification removed
- [x] Contract addresses configured for Sepolia

## 🎯 Testing Steps

### 1. Home Page (/)
- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] "Built on Ethereum" badge visible (no Self Protocol mention)
- [ ] CTA button links to dashboard
- [ ] Features section shows updated content (no verification mentions)
- [ ] How It Works section shows "Connect Wallet" (not verification)
- [ ] Footer shows YieldProof branding (no "Built on Ethereum" text)

### 2. Wallet Connection
- [ ] Connect wallet button visible in navbar
- [ ] Can switch network to Sepolia (chainId: 11155111)
- [ ] Wallet connects successfully
- [ ] User address displays in navbar
- [ ] No verification modal appears

### 3. Dashboard (/dashboard)
- [ ] Dashboard loads directly (no verification gate)
- [ ] User balance displays correctly
- [ ] USDC balance shows from wallet
- [ ] Vault balance shows from contract
- [ ] Current APY displays
- [ ] Strategy selection visible

### 4. Deposit Functionality
- [ ] Enter deposit amount in USDC
- [ ] Approve USDC transaction works
- [ ] Deposit transaction executes
- [ ] Balance updates after successful deposit
- [ ] Success message displays
- [ ] No verification errors

### 5. Withdraw Functionality
- [ ] Enter withdrawal amount
- [ ] Withdraw transaction executes
- [ ] Balance updates after successful withdrawal
- [ ] Success message displays
- [ ] Withdraws include principal + earnings

### 6. AI Chat Integration
- [ ] AI chat panel opens
- [ ] Can type messages
- [ ] Gets responses (even without API key - fallback messages)
- [ ] No SDK initialization errors in console
- [ ] Quick action buttons work (Portfolio, Strategy, Risk, etc.)

### 7. Strategy Selection
- [ ] Can view strategy options (Conservative, Balanced, Growth)
- [ ] Strategy descriptions updated (mention Aave V3, not Mock Aave)
- [ ] Can change strategy if implemented

### 8. Analytics/Stats
- [ ] Portfolio stats display
- [ ] Earnings history chart
- [ ] Performance metrics visible

## 🐛 Common Issues to Check

### Console Errors
- [ ] No SDK initialization errors
- [ ] No "Invalid API Key" errors
- [ ] No contract address errors
- [ ] No network mismatch errors

### Visual Issues
- [ ] All components render correctly
- [ ] No broken images or icons
- [ ] Responsive design works on mobile
- [ ] Dark mode handles if applicable

### Navigation
- [ ] Navbar links work
- [ ] Can navigate between home and dashboard
- [ ] Back button works
- [ ] Wallet stays connected on navigation

## 🔍 Network-Specific Checks

### Sepolia Testnet
- [ ] User can switch to Sepolia in wallet
- [ ] All contract calls use correct Sepolia addresses
- [ ] RPC URL configured correctly
- [ ] Transaction gas prices reasonable for testnet

### Contract Addresses
- [ ] Vault: `0x4A4EBc7bfb813069e5495fB36B53cc937A31b441`
- [ ] USDC: `0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8`
- [ ] Aave Pool: `0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951`

## 📝 Environment Variables

Make sure these are set in `.env.local`:
```env
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
NEXT_PUBLIC_BRIAN_API_KEY=your_key_here (optional)
```

## ✅ Success Criteria

All functionality should work without:
- ❌ Verification requirements
- ❌ Celo references
- ❌ cUSD mentions
- ❌ SDK initialization errors
- ❌ "On Ethereum" text clutter
- ❌ Self Protocol dependencies

Everything should work seamlessly on Ethereum Sepolia with USDC! 🎉

## 🚨 If Issues Found

1. Check browser console for errors
2. Check network tab for failed API calls
3. Verify wallet is on Sepolia network
4. Confirm contract addresses are correct
5. Check that user has Sepolia USDC for testing

## 📸 Screenshots to Take

- [ ] Home page
- [ ] Dashboard (no verification gate)
- [ ] Deposit flow
- [ ] Withdraw flow
- [ ] AI chat interface
- [ ] Successful transaction

---

**Note**: This is the simplified version without verification. Users can immediately deposit USDC and start earning yield! 🚀


