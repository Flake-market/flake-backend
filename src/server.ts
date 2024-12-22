import express, { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';

const app = express();

// Use /tmp directory in production, otherwise use the project's data directory
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
  basePrice: string;
  createdAt: string;
}

interface PaginatedResponse {
  pairs: PairInfo[];
  totalPages: number;
  currentPage: number;
}

interface RequestInfo {
  pairKey: string;
  user: string;
  requestIndex: number;
  adText: string;
  createdAt: string;
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
}

app.get('/api/markets', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);


    let data;
    try {
      data = await fs.promises.readFile(DATA_FILE, 'utf-8');
    } catch (error) {
      // If file doesn't exist, return empty array
      data = '[]';
    }
    const pairs: PairInfo[] = JSON.parse(data);

    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedPairs = pairs.slice(startIndex, endIndex);

    const response: PaginatedResponse = {
      pairs: paginatedPairs,
      totalPages: Math.ceil(pairs.length / limitNum),
      currentPage: pageNum
    };

    res.json(response);
  } catch (error) {
    console.error('Error reading pairs data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/requests', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', pairKey } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let data;
    try {
      data = await fs.promises.readFile(REQUEST_DATA_FILE, 'utf-8');
    } catch (error) {
      data = '[]';
    }
    let requests: RequestInfo[] = JSON.parse(data);

    // Filter by pairKey if provided
    if (pairKey) {
      requests = requests.filter(request => request.pairKey === pairKey);
    }

    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedRequests = requests.slice(startIndex, endIndex);

    const response = {
      requests: paginatedRequests,
      totalPages: Math.ceil(requests.length / limitNum),
      currentPage: pageNum
    };

    res.json(response);
  } catch (error) {
    console.error('Error reading requests data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/swaps', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', pairKey } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let data;
    try {
      data = await fs.promises.readFile(SWAP_DATA_FILE, 'utf-8');
    } catch (error) {
      data = '[]';
    }
    let swaps: SwapInfo[] = JSON.parse(data);

    // Filter by pairKey if provided
    if (pairKey) {
      swaps = swaps.filter(swap => swap.pairKey === pairKey);
    }

    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedSwaps = swaps.slice(startIndex, endIndex);

    const response = {
      swaps: paginatedSwaps,
      totalPages: Math.ceil(swaps.length / limitNum),
      currentPage: pageNum
    };

    res.json(response);
  } catch (error) {
    console.error('Error reading swaps data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export function startServer(port:any = 3003) {
  port = process.env.PORT || 3003;
  return new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(`API server running on port ${port}`);
      resolve();
    });
  });
}