import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import fs from 'fs';
import path from 'path';
import { Flake } from '../artifacts/flake';

const PROGRAM_ID = new PublicKey("3TSDjEyy4Hu3MejRUb4AMBrEQ8nRUtAXPw5Rr3Jkn1NM");
// const RPC_URL = "https://api.devnet.solana.com";
const RPC_URL = "http://127.0.0.1:8899"; // local validator URL

const DATA_FILE = path.join(__dirname, '..' ,'data' ,'markets_data.json');

interface PairInfo {
  pairId: string;
  pairKey: string;
  creator: string;
  basePrice: string;
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
  liquidity?: number;
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
    price: 0,
    buys: 0,
    sells: 0,
    liquidity: 0,
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
      basePrice: basePrice.toString(),
      createdAt: new Date().toISOString(),
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

  console.log('Indexer started');
}

startIndexing().catch(console.error);