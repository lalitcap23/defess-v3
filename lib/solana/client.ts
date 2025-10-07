/**
 * Solana Client - Connects to your deployed NFT minting program
 * 
 * This handles:
 * 1. Connection to Solana RPC
 * 2. Loading your deployed program
 * 3. Managing authority wallet
 * 4. Building and sending transactions
 */

import { 
  Connection, 
  PublicKey, 
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';

// Your program's types (we'll create a simple version)
interface DefessNftMintingProgram {
  // Program methods will be added here
}

export class SolanaClient {
  private connection: Connection;
  private programId: PublicKey;
  private authorityKeypair: Keypair;

  constructor() {
    // Initialize Solana connection
    this.connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );

    // Your deployed program ID
    this.programId = new PublicKey(
      process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '8QYJMZkM5fExjczQxJa567F9c8fu5PqR8rN5jeR5MNFM'
    );

    // Load authority wallet from environment
    const privateKeyArray = JSON.parse(process.env.SOLANA_AUTHORITY_PRIVATE_KEY || '[]');
    if (privateKeyArray.length !== 64) {
      throw new Error('SOLANA_AUTHORITY_PRIVATE_KEY must be a 64-byte array');
    }
    this.authorityKeypair = Keypair.fromSecretKey(new Uint8Array(privateKeyArray));

    console.log('🔗 Solana client initialized');
    console.log(`📡 RPC: ${this.connection.rpcEndpoint}`);
    console.log(`📋 Program ID: ${this.programId.toString()}`);
    console.log(`👤 Authority: ${this.authorityKeypair.publicKey.toString()}`);
  }

  /**
   * Get PDA for collection account
   */
  getCollectionPDA(): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('collection')],
      this.programId
    );
  }

  /**
   * Get PDA for winner account
   */
  getWinnerPDA(periodTimestamp: number): [PublicKey, number] {
    const timestampBuffer = Buffer.alloc(8);
    timestampBuffer.writeBigInt64LE(BigInt(periodTimestamp));
    
    return PublicKey.findProgramAddressSync(
      [Buffer.from('winner'), timestampBuffer],
      this.programId
    );
  }

  /**
   * Get PDA for NFT account
   */
  getNFTPDA(postId: string): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from('nft'), Buffer.from(postId)],
      this.programId
    );
  }

  /**
   * Check if collection is initialized
   */
  async isCollectionInitialized(): Promise<boolean> {
    try {
      const [collectionPDA] = this.getCollectionPDA();
      const accountInfo = await this.connection.getAccountInfo(collectionPDA);
      return accountInfo !== null;
    } catch (error) {
      console.error('Error checking collection:', error);
      return false;
    }
  }

  /**
   * Initialize NFT collection (run once)
   */
  async initializeCollection(): Promise<string> {
    console.log('🚀 Initializing NFT collection...');

    try {
      const [collectionPDA, collectionBump] = this.getCollectionPDA();

      // Check if already initialized
      const isInitialized = await this.isCollectionInitialized();
      if (isInitialized) {
        console.log('⚠️ Collection already initialized');
        return 'already_initialized';
      }

      // Build transaction manually (since we don't have the full Anchor setup)
      const transaction = new Transaction();

      // Calculate space needed for collection account (from your Rust code)
      const COLLECTION_SPACE = 8 + 32 + 4 + 32 + 8 + 8 + 8 + 1; // discriminator + authority + name + counters + bump

      // Create collection account
      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: this.authorityKeypair.publicKey,
        newAccountPubkey: collectionPDA,
        lamports: await this.connection.getMinimumBalanceForRentExemption(COLLECTION_SPACE),
        space: COLLECTION_SPACE,
        programId: this.programId,
      });

      transaction.add(createAccountIx);

      // Send transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.authorityKeypair],
        { commitment: 'confirmed' }
      );

      console.log('✅ Collection initialized!');
      console.log(`🔗 Transaction: ${signature}`);
      console.log(`📦 Collection PDA: ${collectionPDA.toString()}`);

      return signature;

    } catch (error) {
      console.error('❌ Failed to initialize collection:', error);
      throw error;
    }
  }

  /**
   * Select period winner (calls your Solana program)
   */
  async selectPeriodWinner(
    periodTimestamp: number,
    winnerUsername: string,
    postId: string,
    likeCount: number
  ): Promise<string> {
    console.log(`🏆 Selecting period winner: ${winnerUsername} with ${likeCount} likes`);

    try {
      const [collectionPDA] = this.getCollectionPDA();
      const [winnerPDA, winnerBump] = this.getWinnerPDA(periodTimestamp);

      // For now, we'll build a simple transaction
      // In a full implementation, you'd use the Anchor program interface
      
      // This is a placeholder - you'll need to implement the actual instruction
      // based on your program's instruction format
      
      console.log(`📅 Period timestamp: ${periodTimestamp}`);
      console.log(`👤 Winner: ${winnerUsername}`);
      console.log(`📝 Post ID: ${postId}`);
      console.log(`💝 Likes: ${likeCount}`);
      console.log(`🎯 Winner PDA: ${winnerPDA.toString()}`);

      // For now, return a placeholder
      // You'll need to implement the actual instruction call
      throw new Error('select_period_winner instruction not yet implemented - needs Anchor program interface');

    } catch (error) {
      console.error('❌ Failed to select period winner:', error);
      throw error;
    }
  }

  /**
   * Mint NFT to winner (calls your Solana program)
   */
  async mintWinnerNFT(
    periodTimestamp: number,
    winnerWalletAddress: string
  ): Promise<string> {
    console.log(`🎨 Minting NFT for period ${periodTimestamp}`);

    try {
      const [collectionPDA] = this.getCollectionPDA();
      const [winnerPDA] = this.getWinnerPDA(periodTimestamp);
      const winnerWallet = new PublicKey(winnerWalletAddress);

      // This is a placeholder - you'll need to implement the actual instruction
      console.log(`🎯 Winner PDA: ${winnerPDA.toString()}`);
      console.log(`👤 Winner wallet: ${winnerWallet.toString()}`);

      // For now, return a placeholder
      throw new Error('mint_winner_nft instruction not yet implemented - needs Anchor program interface');

    } catch (error) {
      console.error('❌ Failed to mint winner NFT:', error);
      throw error;
    }
  }

  /**
   * Get winner account data
   */
  async getWinnerData(periodTimestamp: number): Promise<any> {
    try {
      const [winnerPDA] = this.getWinnerPDA(periodTimestamp);
      const accountInfo = await this.connection.getAccountInfo(winnerPDA);
      
      if (!accountInfo) {
        return null;
      }

      // Parse account data (would need to match your Rust struct)
      // This is a placeholder - you'd need to deserialize properly
      return {
        exists: true,
        address: winnerPDA.toString(),
        // Add proper deserialization here
      };

    } catch (error) {
      console.error('Error getting winner data:', error);
      return null;
    }
  }

  /**
   * Get collection stats
   */
  async getCollectionStats(): Promise<any> {
    try {
      const [collectionPDA] = this.getCollectionPDA();
      const accountInfo = await this.connection.getAccountInfo(collectionPDA);
      
      if (!accountInfo) {
        return null;
      }

      // Parse collection data (would need to match your Rust struct)
      return {
        exists: true,
        address: collectionPDA.toString(),
        // Add proper deserialization here
      };

    } catch (error) {
      console.error('Error getting collection stats:', error);
      return null;
    }
  }

  /**
   * Check account balance
   */
  async getAuthorityBalance(): Promise<number> {
    const balance = await this.connection.getBalance(this.authorityKeypair.publicKey);
    return balance / 1000000000; // LAMPORTS_PER_SOL
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    connected: boolean;
    programExists: boolean;
    authorityBalance: number;
    collectionInitialized: boolean;
  }> {
    try {
      // Check connection
      const latestBlockhash = await this.connection.getLatestBlockhash();
      const connected = !!latestBlockhash;

      // Check if program exists
      const programAccount = await this.connection.getAccountInfo(this.programId);
      const programExists = programAccount !== null;

      // Check authority balance
      const authorityBalance = await this.getAuthorityBalance();

      // Check if collection is initialized
      const collectionInitialized = await this.isCollectionInitialized();

      return {
        connected,
        programExists,
        authorityBalance,
        collectionInitialized
      };

    } catch (error) {
      console.error('Health check failed:', error);
      return {
        connected: false,
        programExists: false,
        authorityBalance: 0,
        collectionInitialized: false
      };
    }
  }
}

// Export singleton instance
export const solanaClient = new SolanaClient();