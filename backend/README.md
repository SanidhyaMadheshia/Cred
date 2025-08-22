# Credit Rating Prediction API

A comprehensive backend system for credit rating predictions using machine learning models with real-time financial data integration.

## Features

- 🚀 RESTful API for credit rating predictions
- 📊 Integration with Financial Modeling Prep API
- 🗄️ MongoDB database for data persistence
- 🤖 Python ML model integration
- 📈 Real-time news sentiment analysis
- 🔍 Comprehensive financial metrics analysis

## Setup Instructions

### Prerequisites

- Node.js (>=14.0.0)
- Python 3.7+
- MongoDB
- Financial Modeling Prep API key

### Installation

1. **Install Node.js dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/credit-rating-db
   FMP_API_KEY=your_fmp_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

3. **Install Python dependencies:**
   ```bash
   cd prediction/prediction
   pip install -r requirements.txt
   ```

4. **Start MongoDB:**
   ```bash
   # For Windows
   net start MongoDB
   
   # For macOS/Linux
   sudo systemctl start mongod
   ```

5. **Start the server:**
   ```bash
   cd backend
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## API Endpoints

### POST /api/prediction

Main prediction endpoint that fetches financial data and generates credit rating predictions.

**Request:**
```json
{
  "companyName": "Apple Inc."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "prediction": {
      "symbol": "AAPL",
      "sector": "Technology",
      "base": {
        "predicted_rating": "Low_Risk",
        "probabilities": {
          "proba_High_Risk": 0.15,
          "proba_Highest_Risk": 0.05,
          "proba_Low_Risk": 0.65,
          "proba_Medium_Risk": 0.15
        },
        "top_features": [
          {
            "Feature": "returnOnAssets",
            "Contribution": 0.25
          }
        ]
      },
      "news": {
        "sentiment_7d": 0.35,
        "n_articles_7d": 15,
        "neg_event_spike": false,
        "top_headlines": []
      },
      "after_news": {
        "predicted_rating": "Low_Risk",
        "probabilities": {
          "proba_High_Risk": 0.12,
          "proba_Highest_Risk": 0.04,
          "proba_Low_Risk": 0.68,
          "proba_Medium_Risk": 0.16
        }
      }
    },
    "metadata": {
      "backend_version": "1.0.0",
      "processing_time_included": true
    }
  },
  "message": "Prediction completed successfully for Apple Inc."
}
```

### GET /api/prediction/test

Test endpoint to verify API functionality.

**Response:**
```json
{
  "success": true,
  "message": "Prediction API is working!",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/prediction/health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "service": "prediction-api",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5
}
```

### GET /health

Global health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "credit-rating-api",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5,
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1048576
  }
}
```

## Database Schema

### CompanyInput Collection

```javascript
{
  CompanyName: String (required),
  Symbol: String (required),
  Sector: String,
  Year: Number,
  netProfitMargin: Number,
  returnOnAssets: Number,
  debtRatio: Number,
  freeCashFlowOperatingCashFlowRatio: Number,
  freeCashFlowPerShare: Number,
  operatingCashFlowSalesRatio: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### PredictionOutput Collection

```javascript
{
  timestamp: Date,
  prediction: {
    symbol: String,
    sector: String,
    base: { /* base prediction results */ },
    news: { /* news sentiment analysis */ },
    after_news: { /* adjusted prediction after news */ }
  },
  metadata: {
    backend_version: String,
    processing_time_included: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Error Handling

The API provides comprehensive error handling with appropriate HTTP status codes:

- **400 Bad Request**: Missing or invalid request parameters
- **404 Not Found**: Company not found in financial data sources
- **500 Internal Server Error**: Server or prediction model errors

**Error Response Format:**
```json
{
  "error": "Error type",
  "message": "Detailed error description"
}
```

## Testing

### Using cURL

```bash
# Test the API
curl -X POST http://localhost:3000/api/prediction \
     -H "Content-Type: application/json" \
     -d '{"companyName": "Microsoft"}'

# Health check
curl http://localhost:3000/health
```

### Using Postman

1. Create a new POST request to `http://localhost:3000/api/prediction`
2. Set Content-Type header to `application/json`
3. Add request body: `{"companyName": "Tesla"}`
4. Send the request

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   Express API   │────│    MongoDB      │
│   (React/HTML)  │    │   (backend/)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  FMP API        │
                       │  (Financial     │
                       │   Data)         │
                       └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Python ML      │
                       │  Pipeline       │
                       │ (prediction/)   │
                       └─────────────────┘
```

## Performance

- Average response time: 2-5 seconds (including ML processing)
- Concurrent request handling: Up to 100 requests/minute
- Database connection pooling for optimal performance
- Caching mechanisms for frequently requested companies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
