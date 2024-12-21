import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor';
import fs from 'fs';
import path from 'path';
import { Flake } from '../artifacts/flake';
import { getPrice, lamports } from '../lib/utils';
import os from 'os';
import dotenv from 'dotenv';
dotenv.config();

const RPC_URL = process.env.RPC_URL || "https://api.devnet.solana.com";

// TODO: Use a hashmap for faster querying in the future
const DATA_DIR = process.env.NODE_ENV === 'production' ? os.tmpdir() : path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'markets_data.json');
const REQUEST_DATA_FILE = path.join(DATA_DIR, 'request_data.json');
const SWAP_DATA_FILE = path.join(DATA_DIR, 'swap_data.json');
// Ensure the data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

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
  liquidity?: number;
  marketCap?: number;
  volume?: number;
}

interface RequestInfo {
  pairKey: string;
  user: string;
  creator: string;
  requestIndex: number;
  adText: string;
  createdAt: string;
  status: string;
  updatedAt: string;
}

interface SwapInfo {
  pairKey: string;
  user: string;
  isBuy: boolean;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  createdAt: string;
  averagePrice: number;
  startPrice: number;
  endPrice: number;
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

async function readRequestsData(): Promise<RequestInfo[]> {
  try {
    const data = await fs.readFileSync(REQUEST_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return an empty array
    return [];
  }
}

async function writeRequestsData(requests: RequestInfo[]): Promise<void> {
  await fs.writeFileSync(REQUEST_DATA_FILE, JSON.stringify(requests, null, 2));
}

async function writeSwapsData(swaps: SwapInfo[]): Promise<void> {
  await fs.writeFileSync(SWAP_DATA_FILE, JSON.stringify(swaps, null, 2));
}

async function readSwapsData(): Promise<SwapInfo[]> {
  try {
    const data = await fs.readFileSync(SWAP_DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
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
    liquidity: 0,
    marketCap: 0,
    volume: 0,
  };
}


export async function startIndexing() {
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
      liquidity: additionalDetails.liquidity!,
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
    const swaps = await readSwapsData();
    // Find the pair in our data
    const pairIndex = pairs.findIndex(p => p.pairKey === pairKey.toBase58());
    let startPrice = 0;
    
    if (pairIndex !== -1) {
      // Ensure all numeric values are numbers, not strings
      const pair = pairs[pairIndex];
      startPrice = getPrice(pair.supply || 0);
      pair.supply = Number(pair.supply || 0);
      pair.liquidity = Number(pair.liquidity || 0);
      pair.volume = Number(pair.volume || 0);
      pair.buys = Number(pair.buys || 0);
      pair.sells = Number(pair.sells || 0);
      
      // Update stats
      if (isBuy) {
        pair.buys++;
        pair.supply += Number(amountOut);
        pair.liquidity += Number(amountIn);
        pair.volume += Number(amountIn);
      } else {
        pair.sells++;
        pair.supply -= Number(amountIn);
        pair.liquidity -= Number(amountOut);
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

    const newSwap: SwapInfo = {
      pairKey: pairKey.toBase58(),
      user: user.toBase58(),
      isBuy: isBuy,
      tokenIn: isBuy ? 'SOL' : pairs[pairIndex].ticker!,
      tokenOut: isBuy ? pairs[pairIndex].ticker! : 'SOL',
      amountIn: Number(amountIn),
      amountOut: Number(amountOut),
      createdAt: new Date().toISOString(),
      averagePrice: isBuy ? Number(amountIn) / Number(amountOut) : Number(amountOut) / Number(amountIn),
      startPrice: startPrice,
      endPrice: getPrice(pairs[pairIndex].supply || 0),
    };

    // Add new swap to the beginning of the array
    swaps.unshift(newSwap);

    // Write updated data back to file
    await writeSwapsData(swaps);
    console.log(`Indexed new swap for pair: ${pairKey.toBase58()}`);
    console.log('Swap details:', newSwap);
  });

  program.addEventListener('requestSubmitted', async (event, slot) => {
    const { pairKey, user, requestIndex, adText } = event;
    
    // Read existing pairs data to find the creator
    const pairs = await readPairsData();
    const pair = pairs.find(p => p.pairKey === pairKey.toBase58());
    
    const newRequest: RequestInfo = {
      pairKey: pairKey.toBase58(),
      user: user.toBase58(),
      creator: pair?.creator || "", 
      requestIndex: requestIndex,
      adText: adText,
      createdAt: new Date().toISOString(),
      status: "Pending",
      updatedAt: new Date().toISOString(),
    };

    // Continue with existing logic
    const requests = await readRequestsData();
    requests.unshift(newRequest);
    await writeRequestsData(requests);
    console.log(`Indexed new request for pair: ${pairKey.toBase58()}`);
    console.log('Request details:', newRequest);
    
    // Post to webhook
    // try {
    //   const response = await fetch('http://localhost:3005/webhook/requests', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(newRequest),
    //   });

    //   if (!response.ok) {
    //     console.error('Failed to post to webhook:', response.statusText);
    //   }
    // } catch (error) {
    //   console.error('Error posting to webhook:', error);
    // }
  });

  program.addEventListener('requestAccepted', async (event, slot) => {
    const { creator, requestIndex, user, timestamp } = event;
    
    // Read existing requests data
    const requests = await readRequestsData();
    
    // Find the request that matches both the user and request_index
    // TODO: We will use a uuid on smart contract in future
    const request = requests.findIndex(r => 
      r.user === user.toBase58() && 
      r.requestIndex === requestIndex
    );

    if (request !== -1) {
      // Update the request status and timestamp
      requests[request].status = "Accepted";
      requests[request].updatedAt = new Date().toISOString();

      // Write updated data back to file
      await writeRequestsData(requests);
      console.log(`Updated request status to Accepted: User ${user.toBase58()}, Index ${requestIndex}`);
    } else {
      console.log(`Request not found: User ${user.toBase58()}, Index ${requestIndex}`);
    }
  });

  console.log('Indexer started');
}
