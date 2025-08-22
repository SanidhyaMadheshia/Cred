# Credit Rating ML Prediction Pipeline

The core machine learning pipeline for corporate credit rating predictions with news sentiment analysis.

## 📁 Files Overview

- **`prediction.py`** - Main prediction pipeline with SHAP explanations
- **`news_fetcher.py`** - News fetching and FinBERT sentiment analysis
- **`requirements.txt`** - Python dependencies
- **`validation_data.csv`** - Background data for SHAP explainer

## 🔧 Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Set News API key (optional)
set NEWS_API_KEY=your_api_key_here
```

## 🚀 Usage

### Direct Python Usage:
```bash
python prediction.py
```

### Programmatic Usage:
```python
from prediction import predict_final

sample_data = {
    "Symbol": "AAPL",
    "Sector": "Technology",
    "CompanyName": "Apple Inc",
    "Year": 2024,
    "netProfitMargin": 0.22,
    "returnOnAssets": 0.18,
    "debtRatio": 0.56,
    "freeCashFlowOperatingCashFlowRatio": 0.65,
    "freeCashFlowPerShare": 8.1,
    "operatingCashFlowSalesRatio": 0.33
}

# Full prediction with SHAP explanations
result = predict_final(sample_data)

# Fast prediction without SHAP
result = predict_final(sample_data, include_shap=False)
```

## ⚡ Performance Features

- **Lazy Loading**: Models load only when needed
- **Parallel Processing**: Base prediction + news fetching run simultaneously  
- **Optimized Data**: 500 samples for SHAP, 20 articles for sentiment
- **Caching**: Models stay loaded for subsequent predictions

## 🎯 Output

```json
{
  "symbol": "AAPL",
  "sector": "Technology",
  "base": {
    "predicted_rating": "Low Risk",
    "probabilities": {...},
    "top_features": [...]
  },
  "news": {
    "sentiment_7d": 0.320,
    "n_articles_7d": 20,
    "top_headlines": [...]
  },
  "after_news": {
    "predicted_rating": "Low Risk", 
    "probabilities": {...}
  }
}
```

## 📊 Required Model Files (in parent directory)

- `model_LR.pkl` - Trained logistic regression model
- `transformer.pkl` - Feature scaler
- `encoder.pkl` - Category encoder

## 🌐 News API

Get free API key from: https://newsapi.org/
- Without key: Uses dummy sentiment (system still works)
- With key: Real-time news sentiment analysis

## 🔍 Features

- **4 Risk Categories**: High Risk, Highest Risk, Low Risk, Medium Risk
- **SHAP Explanations**: Top 3 feature contributions
- **FinBERT Sentiment**: Financial domain-specific sentiment analysis
- **News Integration**: 7-day weighted sentiment with negative event detection
