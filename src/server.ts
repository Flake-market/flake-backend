import express, { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const app = express();
const DATA_FILE = path.join(__dirname, '..', 'data', 'markets_data.json');

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

    const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
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

app.listen(3003, () => console.log('API server running on port 3003'));
