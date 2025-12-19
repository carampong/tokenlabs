
export enum BlockchainNetwork {
  SOLANA = 'SOLANA',
  ETHEREUM = 'ETHEREUM',
  XRP = 'XRP'
}

export interface AdminSettings {
  solanaWallet: string;
  ethereumWallet: string;
  xrpWallet: string;
  serviceFee: number; // base fee (e.g. 0.01)
}

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  description: string;
  network: BlockchainNetwork;
  logoUrl?: string;
}

export interface DeploymentStatus {
  step: 'setup' | 'payment' | 'minting' | 'success';
  txHash?: string;
  contractAddress?: string;
  paymentTxHash?: string; // The hash the user provides after paying the fee
}

export interface AIAnalysis {
  viabilityScore: number;
  marketAnalysis: string;
  suggestedImprovements: string[];
  riskWarnings: string[];
}
