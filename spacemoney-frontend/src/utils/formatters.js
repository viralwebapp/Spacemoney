// Format SOL amount
export function formatSOL(lamports, decimals = 4) {
  if (typeof lamports === 'undefined' || lamports === null) return '0';
  const sol = lamports / 1e9;
  return sol.toFixed(decimals);
}

// Format large numbers with K, M, B suffixes
export function formatLargeNumber(num, decimals = 2) {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }
  return num.toFixed(decimals);
}

// Format currency
export function formatCurrency(amount, currency = 'USD', decimals = 2) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

// Format percentage
export function formatPercentage(value, decimals = 2) {
  return `${value.toFixed(decimals)}%`;
}

// Format wallet address (shortened)
export function formatAddress(address, startChars = 4, endChars = 4) {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// Format date
export function formatDate(timestamp, format = 'short') {
  const date = new Date(timestamp);
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return date.toLocaleDateString();
}

// Format time remaining
export function formatTimeRemaining({ days, hours, minutes, seconds }) {
  const parts = [];
  
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 && days === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ') || '0s';
}

// Format number with commas
export function formatNumber(num, decimals = 0) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Format transaction hash
export function formatTxHash(hash, startChars = 8, endChars = 8) {
  return formatAddress(hash, startChars, endChars);
}

// Get Solscan URL
export function getSolscanUrl(signature, cluster = 'devnet') {
  return `https://solscan.io/tx/${signature}?cluster=${cluster}`;
}

// Format USDT amount
export function formatUSDT(amount, decimals = 2) {
  if (typeof amount === 'undefined' || amount === null) return '0';
  const usdt = amount / 1e6; // USDT has 6 decimals
  return usdt.toFixed(decimals);
}
