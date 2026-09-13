# Local Table Search

A Search & Discovery mini-app. It searches a local catalog, filters and sorts results, and enriches each product with simulated live availability, price and delivery information.

## Tech Stack

- Node.js 18+
- Express
- TypeScript with `strict: true`
- Vanilla JavaScript
- HTML & CSS
- Vitest


## Requirements

- Node.js 18 or newer
- npm

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
npm start
```

The production server runs `dist/server.js` and serves the static frontend from `public/`.

## Tests

```bash
npm test
```



## API Documentation

### `GET /api/search`

Example:

```http
GET /api/search?q=burger&category=Burgers&sort=popularity-desc
```

Query parameters:

| Parameter | Required | Description                                                                                   |
| --- | --- |-----------------------------------------------------------------------------------------------|
| `q` | No | Free-text query. Whitespace is trimmed.                                                       |
| `category` | No | Category filter. Not case-sensitive                                                           |
| `sort` | No | One of `relevance`, `popularity-desc`, `popularity-asc`, `name-asc`. Defaults to `relevance`. |

Successful response:

```json
{
  "data": {
    "items": [
      {
        "id": "item-001",
        "name": "Classic Beef Burger",
        "description": "Flame grilled beef patty with lettuce, tomato, pickles and house sauce.",
        "category": "Burgers",
        "basePrice": 89.99,
        "popularity": 94,
        "imageUrl": "/images/food-placeholder.svg",
        "enrichment": {
          "status": "available",
          "available": true,
          "price": 94.99,
          "deliveryEstimateMinutes": 25
        }
      }
    ],
    "meta": {
      "query": "burger",
      "category": "Burgers",
      "sort": "popularity-desc",
      "total": 1,
      "enrichmentFailures": 0,
      "durationMs": 486,
      "categories": ["Burgers", "Chicken", "Desserts", "Drinks", "Grocery", "Pizza"]
    }
  }
}
```

Possible enrichment states:

- `available`: live price and delivery estimate are present.
- `unavailable`: live provider responded, but the item is not currently available.
- `live-info-unavailable`: live provider failed for that item, so the catalog result is still returned without live price.

Error response:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "sort must be one of: relevance, popularity-desc, popularity-asc, name-asc."
  }
}
```
