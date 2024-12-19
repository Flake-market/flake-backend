import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import fs from 'fs';
import path from 'path';
import { Flake } from '../artifacts/flake';
import { getPrice, lamports } from '../lib/utils';
const PROGRAM_ID = new PublicKey("8rT4b7dXQJxXpumCq45UCekRTwXiRBjJG5kVXnqvd4bd");
const RPC_URL = "https://api.devnet.solana.com";
// const RPC_URL = "http://127.0.0.1:8899"; // local validator URL

const DATA_FILE = path.join(__dirname, '..' ,'data' ,'markets_data.json');

interface PairInfo {
  pairId: string;
  pairKey: string;
  creator: string;
  attentionToken: string;
  // basePrice: string;
  name?: string;
  ticker?: string;
  description?: string;
  tokenImage?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
  requests?: { price: string; description: string }[];
  createdAt: string;
  // added fields
  price?: number;
  buys?: number;
  sells?: number;
  supply?: number;
  marketCap?: number;
  volume?: number;
}

async function loadWallet(): Promise<Wallet> {
  const keyPath = path.join(__dirname, '..', 'keypair.json');
  if (!fs.existsSync(keyPath)) {
    throw new Error('Wallet key file not found. Please place id2.json in the script directory.');
  }
  const rawKey = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
  const keypair = Keypair.fromSecretKey(new Uint8Array(rawKey));
  return new Wallet(keypair);
}

async function getProgram(wallet: Wallet): Promise<Program<Flake>> {
  const connection = new Connection(RPC_URL, { commitment: "confirmed" });
  const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
  anchor.setProvider(provider);

  const idlPath = path.join(__dirname, '..', 'artifacts', 'flake.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
  return new Program<Flake>(idl as Flake, provider);
}



async function readPairsData(): Promise<PairInfo[]> {
  try {
    const data = await fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return an empty array
    return [];
  }
}

async function writePairsData(pairs: PairInfo[]): Promise<void> {
  await fs.writeFileSync(DATA_FILE, JSON.stringify(pairs, null, 2));
}

async function fetchPairDetails(program: Program<Flake>, pairAddress: PublicKey): Promise<Partial<PairInfo>> {
  const pair = await program.account.pair.fetch(pairAddress);
  return {
    attentionToken: pair.attentionTokenMint.toBase58(),
    name: pair.name,
    ticker: pair.ticker,
    description: pair.description,
    tokenImage: pair.tokenImage,
    twitter: pair.twitter,
    telegram: pair.telegram,
    website: pair.website,
    requests: pair.requests.map((r: any) => ({
      price: r.price.toString(),
      description: r.description
    })),
    price: pair.pmin.toNumber(),
    buys: 0,
    sells: 0,
    supply: 0,
    marketCap: 0,
    volume: 0,
  };
}


async function startIndexing() {
    const wallet = await loadWallet();
    const program = await getProgram(wallet);

  // Listen for new PairCreated events
  program.addEventListener('pairCreated', async (event, slot) => {
    const { pairId, pairKey, creator, basePrice } = event;
    
    const pairAddress = new PublicKey(pairKey);
    const additionalDetails = await fetchPairDetails(program, pairAddress);

    const newPair: PairInfo = {
      pairId: pairId.toString(),
      pairKey: pairKey.toBase58(),
      creator: creator.toBase58(),
      attentionToken: additionalDetails.attentionToken!,
      createdAt: new Date().toISOString(),
      supply: additionalDetails.supply!,
      ...additionalDetails,
    };
    // Read existing data
    const pairs = await readPairsData();

    // Add new pair to the beginning of the array
    pairs.unshift(newPair);

    // Write updated data back to file
    await writePairsData(pairs);
    console.log(`Indexed new pair: ${pairId}`);
    console.log('Pair details:', newPair);
  });

  program.addEventListener('swapExecuted', async (event, slot) => {
    const { isBuy, amountIn, amountOut, user, pairKey, attentionTokenMint } = event;
    
    // Read existing data
    const pairs = await readPairsData();
    
    // Find the pair in our data
    const pairIndex = pairs.findIndex(p => p.pairKey === pairKey.toBase58());
    
    if (pairIndex !== -1) {
      // Ensure all numeric values are numbers, not strings
      const pair = pairs[pairIndex];
      pair.supply = Number(pair.supply || 0);
      pair.volume = Number(pair.volume || 0);
      pair.buys = Number(pair.buys || 0);
      pair.sells = Number(pair.sells || 0);
      
      // Update stats
      if (isBuy) {
        pair.buys++;
        pair.supply += Number(amountOut);
        pair.volume += Number(amountIn);
      } else {
        pair.sells++;
        pair.supply -= Number(amountIn);
        pair.volume += Number(amountOut);
      }
      
      // Calculate price and market cap
      pair.price = getPrice(pair.supply);
      pair.marketCap = pair.price * pair.supply / lamports;
      
      // Write updated data back to file
      await writePairsData(pairs);
      console.log(`Indexed swap for pair: ${pairKey.toBase58()}`);
      console.log('Swap details:', {
        isBuy,
        amountIn: amountIn.toString(),
        amountOut: amountOut.toString(),
        user: user.toBase58(),
        attentionTokenMint: attentionTokenMint.toBase58()
      });
    }
  });

  console.log('Indexer started');


}

startIndexing().catch(console.error);