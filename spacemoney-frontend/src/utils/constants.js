// Contract configuration
export const PROGRAM_ID = "Fg6Pa4H2Qv7Vu86vAisdStXVNoTMTgks9R59yQhF6P2";
export const USDT_MINT = "EPjFWaJsq4DcaRKmqsPb94k8ao64C1MwMUeFqwxDRvPj";

// Network
export const NETWORK = "devnet";
export const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Tier configurations
export const TIERS = {
  BOOT: {
    id: 0,
    name: "Boot Node",
    minStake: 1,
    multiplier: 1,
    lockDays: 30,
    dailyYield: 0.01,
    color: "#5CE1E6",
    icon: "🚀",
  },
  SYMBIOTIC: {
    id: 1,
    name: "Symbiotic Node",
    minStake: 5,
    multiplier: 2,
    lockDays: 90,
    dailyYield: 0.01,
    color: "#7B61FF",
    icon: "⚡",
    popular: true,
  },
  SPACE: {
    id: 2,
    name: "Space Node",
    minStake: 25,
    multiplier: 3,
    lockDays: 180,
    dailyYield: 0.01,
    color: "#FF6B9D",
    icon: "🌟",
  },
};

// Fee structure
export const DEPOSIT_FEE = 0.02; // 2%
export const FORCE_WITHDRAW_PENALTY = 0.20; // 20%

// UI Constants
export const COLORS = {
  PRIMARY_BG: '#05070B',
  CYAN: '#5CE1E6',
  VIOLET: '#7B61FF',
  PINK: '#FF6B9D',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#9AA4B2',
  BORDER: 'rgba(255,255,255,0.05)',
};

// Admin credentials (hardcoded for demo)
export const ADMIN_CREDENTIALS = {
  username: "Genesis@Spacemoney369",
  password: "Spacemoney@432",
};

// API endpoints
export const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Transaction options
export const TX_OPTIONS = {
  skipPreflight: false,
  commitment: 'confirmed',
  maxRetries: 3,
};

// Refresh intervals (milliseconds)
export const REFRESH_INTERVALS = {
  USER_DATA: 30000, // 30 seconds
  SOL_PRICE: 30000, // 30 seconds
  COUNTDOWN: 1000, // 1 second
};
