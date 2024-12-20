import express, { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';

const app = express();

// Use /tmp directory in production, otherwise use the project's data directory
const DATA_DIR = process.env.NODE_ENV === 'production' ? os.tmpdir() : path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'markets_data.json');

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

export function startServer(port:any = 3000) {
  port = process.env.PORT || 3000;
  return new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(`API server running on port ${port}`);
      resolve();
    });
  });
}