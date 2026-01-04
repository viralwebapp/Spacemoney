// Parse Solana transaction errors
export function parseTransactionError(error) {
  if (!error) return "Unknown error occurred";
  
  const errorString = error.toString();
  
  // User rejection
  if (errorString.includes("User rejected") || errorString.includes("User cancelled")) {
    return "Transaction cancelled by user";
  }
  
  // Insufficient balance
  if (errorString.includes("insufficient") || errorString.includes("Insufficient")) {
    return "Insufficient balance to complete transaction";
  }
  
  // Program errors
  if (errorString.includes("ProgramPaused")) {
    return "Platform is temporarily paused";
  }
  
  if (errorString.includes("StakeLocked")) {
    return "Stake is still locked. Use force withdraw or wait until lock period ends";
  }
  
  if (errorString.includes("InsufficientStakeAmount")) {
    return "Stake amount is below minimum requirement for selected tier";
  }
  
  if (errorString.includes("Unauthorized")) {
    return "You are not authorized to perform this action";
  }
  
  if (errorString.includes("InvalidTier")) {
    return "Invalid tier selected";
  }
  
  if (errorString.includes("InsufficientTreasuryBalance")) {
    return "Platform treasury has insufficient balance. Please contact support";
  }
  
  if (errorString.includes("NoRewardsAvailable")) {
    return "No rewards available to claim at this time";
  }
  
  if (errorString.includes("MaxRewardsClaimed")) {
    return "Maximum rewards already claimed for this stake";
  }
  
  // Network errors
  if (errorString.includes("429") || errorString.includes("rate limit")) {
    return "Network rate limit exceeded. Please try again in a moment";
  }
  
  if (errorString.includes("timeout") || errorString.includes("Timeout")) {
    return "Transaction timed out. Please check your connection and try again";
  }
  
  if (errorString.includes("blockhash not found")) {
    return "Transaction expired. Please try again";
  }
  
  // Wallet errors
  if (errorString.includes("Wallet not connected")) {
    return "Please connect your wallet first";
  }
  
  // Generic fallback
  if (error.message) {
    return error.message;
  }
  
  return "Transaction failed. Please try again";
}

// Get error severity (for UI styling)
export function getErrorSeverity(error) {
  const errorString = error.toString();
  
  if (errorString.includes("User rejected") || errorString.includes("cancelled")) {
    return "info";
  }
  
  if (
    errorString.includes("insufficient") ||
    errorString.includes("StakeLocked") ||
    errorString.includes("InsufficientStakeAmount")
  ) {
    return "warning";
  }
  
  return "error";
}

// Check if error is retryable
export function isRetryableError(error) {
  const errorString = error.toString();
  
  // Don't retry user rejections
  if (errorString.includes("User rejected") || errorString.includes("cancelled")) {
    return false;
  }
  
  // Don't retry validation errors
  if (
    errorString.includes("InsufficientStakeAmount") ||
    errorString.includes("Unauthorized") ||
    errorString.includes("InvalidTier")
  ) {
    return false;
  }
  
  // Retry network errors
  if (
    errorString.includes("timeout") ||
    errorString.includes("429") ||
    errorString.includes("blockhash not found") ||
    errorString.includes("Network")
  ) {
    return true;
  }
  
  return false;
}

// Retry logic with exponential backoff
export async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (!isRetryableError(error)) {
        throw error;
      }
      
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Create user-friendly error object
export function createErrorObject(error, context = {}) {
  return {
    message: parseTransactionError(error),
    severity: getErrorSeverity(error),
    retryable: isRetryableError(error),
    originalError: error,
    context,
    timestamp: Date.now(),
  };
}
