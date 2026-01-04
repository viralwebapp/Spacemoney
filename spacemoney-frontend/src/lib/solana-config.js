import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { NETWORK, RPC_ENDPOINT, PROGRAM_ID } from '../utils/constants';

// Import IDL (will be generated from contract)
import IDL from '../../public/idl.json';

// Create connection
export function createConnection() {
  const endpoint = RPC_ENDPOINT || clusterApiUrl(NETWORK);
  return new Connection(endpoint, {
    commitment: 'confirmed',
    confirmTransactionInitialTimeout: 60000,
  });
}

// Get program instance
export function getProgram(wallet) {
  const connection = createConnection();
  
  if (!wallet) {
    // Return read-only program
    const provider = new AnchorProvider(
      connection,
      {},
      { commitment: 'confirmed' }
    );
    return new Program(IDL, new PublicKey(PROGRAM_ID), provider);
  }
  
  const provider = new AnchorProvider(
    connection,
    wallet,
    { commitment: 'confirmed', skipPreflight: false }
  );
  
  return new Program(IDL, new PublicKey(PROGRAM_ID), provider);
}

// Derive PDAs
export function getPlatformStatePDA(programId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('platform')],
    new PublicKey(programId)
  );
}

export function getUserAccountPDA(userPubkey, programId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('user'), userPubkey.toBuffer()],
    new PublicKey(programId)
  );
}

export function getTierConfigPDA(programId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('tiers')],
    new PublicKey(programId)
  );
}

export function getVaultAuthorityPDA(programId) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('vault')],
    new PublicKey(programId)
  );
}

// Get all PDAs for a user
export function getUserPDAs(userPubkey) {
  const programId = new PublicKey(PROGRAM_ID);
  
  const [platformState] = getPlatformStatePDA(programId);
  const [userAccount] = getUserAccountPDA(userPubkey, programId);
  const [tierConfig] = getTierConfigPDA(programId);
  const [vaultAuthority] = getVaultAuthorityPDA(programId);
  
  return {
    platformState,
    userAccount,
    tierConfig,
    vaultAuthority,
    programId,
  };
}

// Check if account exists
export async function accountExists(publicKey) {
  const connection = createConnection();
  const accountInfo = await connection.getAccountInfo(new PublicKey(publicKey));
  return accountInfo !== null;
}

// Get SOL balance
export async function getSOLBalance(publicKey) {
  const connection = createConnection();
  const balance = await connection.getBalance(new PublicKey(publicKey));
  return balance / 1e9; // Convert lamports to SOL
}
