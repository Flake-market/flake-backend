## Flake Backend

- Run `pnpm i`
- Run `pnpm run listener` to start the indexer
- Run `pnpm run server` to start the api server
- API endpoint to fetch markets: `http://localhost:3000/api/markets`

##### Sample response

```json
{
  "pairs": [
    {
      "pairId": "3",
      "pairKey": "ErinYMSXEFmqUK8ab4Aq1d8sxjyYHPnpmhrsMRAWzhyE",
      "creator": "AQ7ychWRirqNgcwEpxgk2HsWbvnyzyFNzjhdWRuu5T7u",
      "basePrice": "2000000000",
      "createdAt": "2024-12-16T09:04:09.945Z",
      "name": "New Token",
      "ticker": "NEW",
      "description": "Another token created from existing factory",
      "tokenImage": "https://example.com/newtoken.png",
      "twitter": "@newtoken",
      "telegram": "@newtokentelegram",
      "website": "https://newtoken.com",
      "requests": [
        {
          "price": "5000000000",
          "description": "Special promo tweet"
        }
      ]
    }
  ],
  "totalPages": 1,
  "currentPage": 1
}
```