/**
 * Complete Example Component for AttestifyVault Integration
 * This shows a full deposit/withdrawal flow with all features
 * 
 * NOTE: This file is for reference only. Copy to your frontend project to use.
 */

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import {
  useAttestifyVault,
  useDepositPreview,
  useWithdrawalPreview,
  useApprove,
  useDeposit,
  useWithdraw,
  useYieldCalculator,
} from './useAttestifyVault';
import { SEPOLIA_ADDRESSES, formatAPY, truncateAddress } from './attestify-vault';

// ============================================================================
// CONFIGURATION
// ============================================================================

const VAULT_CONFIG = {
  vaultAddress: SEPOLIA_ADDRESSES.ATTESTIFY_VAULT,
  assetAddress: SEPOLIA_ADDRESSES.CUSD,
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AttestifyVaultDashboard() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  // Get all vault data
  const {
    stats,
    apy,
    position,
    balance,
    allowance,
    symbol,
    isPaused,
    isLoading,
    refetch,
  } = useAttestifyVault(VAULT_CONFIG);

  if (!isConnected) {
    return (
      <div className="vault-dashboard">
        <h2>Connect Wallet</h2>
        <p>Please connect your wallet to use the vault</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="vault-dashboard">
        <div className="loading">Loading vault data...</div>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="vault-dashboard">
        <div className="alert alert-warning">
          ⚠️ Vault is currently paused. Deposits are temporarily disabled.
        </div>
      </div>
    );
  }

  return (
    <div className="vault-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Attestify Vault</h1>
        <div className="user-address">
          {address && truncateAddress(address)}
        </div>
      </div>

      {/* Vault Stats */}
      <VaultStats stats={stats} apy={apy} />

      {/* User Position */}
      {position && position.shares > 0n && (
        <UserPositionCard position={position} symbol={symbol} />
      )}

      {/* Action Tabs */}
      <div className="action-tabs">
        <button
          className={activeTab === 'deposit' ? 'active' : ''}
          onClick={() => setActiveTab('deposit')}
        >
          Deposit
        </button>
        <button
          className={activeTab === 'withdraw' ? 'active' : ''}
          onClick={() => setActiveTab('withdraw')}
        >
          Withdraw
        </button>
      </div>

      {/* Action Panel */}
      <div className="action-panel">
        {activeTab === 'deposit' ? (
          <DepositPanel
            config={VAULT_CONFIG}
            balance={balance}
            allowance={allowance}
            symbol={symbol}
            onSuccess={refetch}
          />
        ) : (
          <WithdrawPanel
            config={VAULT_CONFIG}
            position={position}
            symbol={symbol}
            onSuccess={refetch}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// VAULT STATS COMPONENT
// ============================================================================

function VaultStats({ stats, apy }: { stats: any; apy: number }) {
  if (!stats) return null;

  return (
    <div className="vault-stats">
      <div className="stat-card">
        <label>Total Value Locked</label>
        <span className="value large">
          {parseFloat(formatUnits(stats.totalAssets, 18)).toLocaleString()} cUSD
        </span>
      </div>

      <div className="stat-card">
        <label>Current APY</label>
        <span className="value large success">{formatAPY(apy * 100)}</span>
      </div>

      <div className="stat-card">
        <label>Total Yield Generated</label>
        <span className="value large">
          {parseFloat(formatUnits(stats.totalYield, 18)).toLocaleString()} cUSD
        </span>
      </div>

      <div className="stat-card">
        <label>Reserve Balance</label>
        <span className="value">
          {parseFloat(formatUnits(stats.reserveBalance, 18)).toLocaleString()} cUSD
        </span>
      </div>

      <div className="stat-card">
        <label>In Aave</label>
        <span className="value">
          {parseFloat(formatUnits(stats.aaveBalance, 18)).toLocaleString()} cUSD
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// USER POSITION COMPONENT
// ============================================================================

function UserPositionCard({ position, symbol }: { position: any; symbol: string }) {
  return (
    <div className="user-position-card">
      <h3>Your Position</h3>
      
      <div className="position-stats">
        <div className="stat">
          <label>Your Balance</label>
          <span className="value large">
            {parseFloat(formatUnits(position.assets, 18)).toFixed(4)} {symbol}
          </span>
        </div>

        <div className="stat">
          <label>Your Shares</label>
          <span className="value">{parseFloat(formatUnits(position.shares, 18)).toFixed(4)}</span>
        </div>

        <div className="stat">
          <label>Pool Share</label>
          <span className="value">{position.shareOfPool.toFixed(4)}%</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// DEPOSIT PANEL COMPONENT
// ============================================================================

function DepositPanel({
  config,
  balance,
  allowance,
  symbol,
  onSuccess,
}: {
  config: any;
  balance: bigint;
  allowance: bigint;
  symbol: string;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [showYieldCalc, setShowYieldCalc] = useState(false);

  // Hooks
  const { expectedShares, expectedSharesFormatted } = useDepositPreview(config, amount);
  const yieldCalc = useYieldCalculator(config, amount);
  const { approve, approveMax, status: approveStatus, error: approveError } = useApprove(config);
  const { deposit, status: depositStatus, error: depositError } = useDeposit(config);

  // Check if approval needed
  const amountWei = amount ? parseUnits(amount, 18) : 0n;
  const needsApproval = amountWei > allowance;

  // Handle success
  useEffect(() => {
    if (approveStatus === 'success') {
      // Approval successful, can now deposit
    }
    if (depositStatus === 'success') {
      setAmount('');
      onSuccess();
    }
  }, [approveStatus, depositStatus, onSuccess]);

  const handleMaxClick = () => {
    setAmount(formatUnits(balance, 18));
  };

  const handleDeposit = () => {
    if (needsApproval) {
      approve(amount);
    } else {
      deposit(amount);
    }
  };

  const isValid = amount && parseFloat(amount) > 0 && amountWei <= balance;

  return (
    <div className="deposit-panel">
      <h3>Deposit {symbol}</h3>

      {/* Balance Display */}
      <div className="balance-display">
        <span>Available Balance:</span>
        <span className="balance">
          {parseFloat(formatUnits(balance, 18)).toFixed(4)} {symbol}
        </span>
      </div>

      {/* Amount Input */}
      <div className="input-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          disabled={approveStatus === 'pending' || depositStatus === 'pending'}
        />
        <button className="max-button" onClick={handleMaxClick}>
          MAX
        </button>
      </div>

      {/* Preview */}
      {expectedShares > 0n && (
        <div className="preview-box">
          <div className="preview-item">
            <span>You will receive:</span>
            <span className="value">{parseFloat(expectedSharesFormatted).toFixed(4)} shares</span>
          </div>
        </div>
      )}

      {/* Yield Calculator Toggle */}
      {amount && parseFloat(amount) > 0 && (
        <button
          className="yield-calc-toggle"
          onClick={() => setShowYieldCalc(!showYieldCalc)}
        >
          {showYieldCalc ? '▼' : '▶'} Expected Yield
        </button>
      )}

      {/* Yield Calculator */}
      {showYieldCalc && (
        <div className="yield-calculator">
          <div className="yield-item">
            <span>Daily:</span>
            <span>{parseFloat(yieldCalc.daily).toFixed(4)} {symbol}</span>
          </div>
          <div className="yield-item">
            <span>Weekly:</span>
            <span>{parseFloat(yieldCalc.weekly).toFixed(4)} {symbol}</span>
          </div>
          <div className="yield-item">
            <span>Monthly:</span>
            <span>{parseFloat(yieldCalc.monthly).toFixed(4)} {symbol}</span>
          </div>
          <div className="yield-item">
            <span>Yearly:</span>
            <span>{parseFloat(yieldCalc.yearly).toFixed(4)} {symbol}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        className="action-button primary"
        onClick={handleDeposit}
        disabled={
          !isValid ||
          approveStatus === 'pending' ||
          approveStatus === 'confirming' ||
          depositStatus === 'pending' ||
          depositStatus === 'confirming'
        }
      >
        {approveStatus === 'pending' || approveStatus === 'confirming'
          ? 'Approving...'
          : depositStatus === 'pending' || depositStatus === 'confirming'
          ? 'Depositing...'
          : needsApproval
          ? `Approve ${symbol}`
          : 'Deposit'}
      </button>

      {/* Approve Max Button */}
      {needsApproval && (
        <button
          className="action-button secondary"
          onClick={() => approveMax()}
          disabled={approveStatus === 'pending' || approveStatus === 'confirming'}
        >
          Approve Unlimited (Recommended)
        </button>
      )}

      {/* Error Messages */}
      {approveError && <div className="error-message">{approveError}</div>}
      {depositError && <div className="error-message">{depositError}</div>}

      {/* Success Messages */}
      {approveStatus === 'success' && (
        <div className="success-message">✅ Approval successful! You can now deposit.</div>
      )}
      {depositStatus === 'success' && (
        <div className="success-message">✅ Deposit successful!</div>
      )}
    </div>
  );
}

// ============================================================================
// WITHDRAW PANEL COMPONENT
// ============================================================================

function WithdrawPanel({
  config,
  position,
  symbol,
  onSuccess,
}: {
  config: any;
  position: any;
  symbol: string;
  onSuccess: () => void;
}) {
  const [amount, setAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState<'assets' | 'shares'>('assets');

  // Hooks
  const { preview, previewFormatted } = useWithdrawalPreview(config, amount, withdrawType);
  const { withdraw, status: withdrawStatus, error: withdrawError } = useWithdraw(config);

  // Handle success
  useEffect(() => {
    if (withdrawStatus === 'success') {
      setAmount('');
      onSuccess();
    }
  }, [withdrawStatus, onSuccess]);

  const handleMaxClick = () => {
    if (withdrawType === 'assets') {
      setAmount(formatUnits(position?.assets || 0n, 18));
    } else {
      setAmount(formatUnits(position?.shares || 0n, 18));
    }
  };

  const handleWithdraw = () => {
    withdraw(amount);
  };

  const maxAmount = withdrawType === 'assets' ? position?.assets : position?.shares;
  const amountWei = amount ? parseUnits(amount, 18) : 0n;
  const isValid = amount && parseFloat(amount) > 0 && amountWei <= (maxAmount || 0n);

  if (!position || position.shares === 0n) {
    return (
      <div className="withdraw-panel">
        <div className="empty-state">
          <p>You don't have any deposits yet.</p>
          <p>Switch to the Deposit tab to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="withdraw-panel">
      <h3>Withdraw {symbol}</h3>

      {/* Position Display */}
      <div className="position-display">
        <div className="position-item">
          <span>Your Balance:</span>
          <span className="value">
            {parseFloat(formatUnits(position.assets, 18)).toFixed(4)} {symbol}
          </span>
        </div>
        <div className="position-item">
          <span>Your Shares:</span>
          <span className="value">
            {parseFloat(formatUnits(position.shares, 18)).toFixed(4)}
          </span>
        </div>
      </div>

      {/* Withdraw Type Toggle */}
      <div className="withdraw-type-toggle">
        <button
          className={withdrawType === 'assets' ? 'active' : ''}
          onClick={() => setWithdrawType('assets')}
        >
          Withdraw Assets
        </button>
        <button
          className={withdrawType === 'shares' ? 'active' : ''}
          onClick={() => setWithdrawType('shares')}
        >
          Redeem Shares
        </button>
      </div>

      {/* Amount Input */}
      <div className="input-group">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          disabled={withdrawStatus === 'pending' || withdrawStatus === 'confirming'}
        />
        <button className="max-button" onClick={handleMaxClick}>
          MAX
        </button>
      </div>

      {/* Preview */}
      {preview > 0n && (
        <div className="preview-box">
          <div className="preview-item">
            <span>
              {withdrawType === 'assets' ? 'Shares to burn:' : 'You will receive:'}
            </span>
            <span className="value">
              {parseFloat(previewFormatted).toFixed(4)}{' '}
              {withdrawType === 'assets' ? 'shares' : symbol}
            </span>
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        className="action-button primary"
        onClick={handleWithdraw}
        disabled={
          !isValid ||
          withdrawStatus === 'pending' ||
          withdrawStatus === 'confirming'
        }
      >
        {withdrawStatus === 'pending' || withdrawStatus === 'confirming'
          ? 'Processing...'
          : 'Withdraw'}
      </button>

      {/* Error Message */}
      {withdrawError && <div className="error-message">{withdrawError}</div>}

      {/* Success Message */}
      {withdrawStatus === 'success' && (
        <div className="success-message">✅ Withdrawal successful!</div>
      )}
    </div>
  );
}

// ============================================================================
// STYLES (Example - Use your own styling solution)
// ============================================================================

const styles = `
.vault-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.vault-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.stat-card label {
  display: block;
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.stat-card .value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
}

.stat-card .value.large {
  font-size: 1.5rem;
}

.stat-card .value.success {
  color: #28a745;
}

.action-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.action-tabs button {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  background: white;
  cursor: pointer;
  border-radius: 4px;
}

.action-tabs button.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.action-panel {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.input-group input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
}

.max-button {
  padding: 0.75rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.action-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.action-button.primary {
  background: #007bff;
  color: white;
}

.action-button.secondary {
  background: #6c757d;
  color: white;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  padding: 0.75rem;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  margin-top: 1rem;
}

.success-message {
  padding: 0.75rem;
  background: #d4edda;
  color: #155724;
  border-radius: 4px;
  margin-top: 1rem;
}

.preview-box {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.yield-calculator {
  background: #e7f3ff;
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
}

.yield-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
}
`;

export default AttestifyVaultDashboard;
