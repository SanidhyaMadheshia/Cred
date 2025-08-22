import asyncio
import aiohttp
import datetime as dt
import math
import os
from typing import Dict, List, Optional
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import nest_asyncio

nest_asyncio.apply()

class NewsFetcher:
    def __init__(self):
        # Option 1: Use environment variable (recommended)
        # Option 2: Replace "your_actual_api_key_here" with your real API key
        self.NEWS_API_KEY = os.getenv("NEWS_API_KEY", "2955438dd1fc4181af923f8729487f2d")
        self.NEG_KEYWORDS = [
            "default", "bankruptcy", "insolvency", "liquidation",
            "downgrade", "credit watch", "going concern",
            "fraud", "restatement", "restructuring", "mass layoff",
            "covenant breach", "distress", "delisting"
        ]
        self._tokenizer = None
        self._model_finbert = None

    def _setup_finbert(self):
        if self._tokenizer is None:
            print("Loading FinBERT model (first use only)...")
            model_name = "yiyanghkust/finbert-tone"
            self._tokenizer = AutoTokenizer.from_pretrained(model_name)
            self._model_finbert = AutoModelForSequenceClassification.from_pretrained(model_name)
            self._model_finbert.eval()
            if torch.cuda.is_available():
                self._model_finbert.to("cuda")
            print("FinBERT model loaded successfully!")

    def finbert_sentiment_score(self, text: str) -> float:
        self._setup_finbert()  # Lazy loading
        inputs = self._tokenizer(text, return_tensors="pt", truncation=True, max_length=512, padding="max_length")
        if torch.cuda.is_available():
            inputs = {k: v.to("cuda") for k, v in inputs.items()}
        with torch.no_grad():
            outputs = self._model_finbert(**inputs)
            probs = F.softmax(outputs.logits, dim=-1).squeeze().cpu().numpy()
        return float(probs[1] - probs[2])  # positive - negative

    def batch_sentiment_analysis(self, texts: List[str]) -> List[float]:
        if not texts:
            return []
        results = []
        batch_size = 8
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            for text in batch:
                results.append(self.finbert_sentiment_score(text))
        return results

    async def fetch_news_async(self, symbol: str, company_name: str,
                               days: int = 7, language: str = "en", pageSize: int = 20) -> Dict:

        # Check if API key is valid (not dummy/placeholder)
        if (self.NEWS_API_KEY.startswith("PUT_") or 
            self.NEWS_API_KEY in ["8a7653142e2f47f291ebcc0da8fd219d", "your_actual_api_key_here"] or
            len(self.NEWS_API_KEY) < 10):
            print("WARNING NEWS API: Using dummy data (no valid API key provided)")
            print("   Get a free API key from: https://newsapi.org/")
            return self._empty_news_result()
        
        print(f"NEWS API: Using API key ending in ...{self.NEWS_API_KEY[-4:]}")
        
        # Query with symbol and company_name
        q = f'"{company_name}" AND (stock OR finance OR trading OR market OR investment)'

        to_dt = dt.datetime.now(dt.timezone.utc)
        from_dt = to_dt - dt.timedelta(days=days)
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": q,
            "from": from_dt.date().isoformat(),
            "to": to_dt.date().isoformat(),
            "language": language,
            "sortBy": "publishedAt",
            "pageSize": pageSize,
            "apiKey": self.NEWS_API_KEY
        }

        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=10)) as session:
            try:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"SUCCESS NEWS API: Successfully connected to NewsAPI.org")
                    elif response.status == 401:
                        print("ERROR NEWS API: Invalid API key - check your NEWS_API_KEY")
                        return self._empty_news_result()
                    elif response.status == 429:
                        print("ERROR NEWS API: Rate limit exceeded - try again later")
                        return self._empty_news_result()
                    else:
                        print(f"ERROR NEWS API: Request failed with status {response.status}")
                        return self._empty_news_result()
            except Exception as e:
                print(f"ERROR NEWS API: Connection failed - {str(e)}")
                return self._empty_news_result()

        articles = data.get("articles", []) or []
        if not articles:
            print("WARNING NEWS API: No articles found for the search query")
            return self._empty_news_result()

        # Filter relevant articles (company name in title)
        texts, article_data = [], []
        for a in articles:
            title = a.get("title") or ""
            desc = a.get("description") or ""
            text = (title + ". " + desc).strip()
            if not text or company_name.lower() not in title.lower():
                continue
            texts.append(text)
            article_data.append({
                "title": title,
                "text": text,
                "publishedAt": a.get("publishedAt") or ""
            })

        sentiment_scores = self.batch_sentiment_analysis(texts)
        
        if texts:
            print(f"INFO NEWS API: Processing {len(texts)} relevant articles with FinBERT sentiment analysis")
        else:
            print("WARNING NEWS API: No relevant articles found (company name not in headlines)")

        vals, weights, kept = [], [], []
        neg_spike = False
        for art, score in zip(article_data, sentiment_scores):
            published = art["publishedAt"]
            t = to_dt
            try:
                t = dt.datetime.fromisoformat(published.replace("Z", "+00:00"))
            except:
                pass
            delta_days = max(0.0, (to_dt - t).total_seconds() / 86400.0)
            w = math.exp(-delta_days / 7.0)
            vals.append(score * w)
            weights.append(w)
            kept.append({
                "publishedAt": published,
                "title": art["title"],
                "compound": round(score, 4)
            })
            if any(kw in art["text"].lower() for kw in self.NEG_KEYWORDS) and score <= 0:
                neg_spike = True

        sentiment_7d = (sum(vals) / sum(weights)) if weights and sum(weights) > 0 else 0.0
        sentiment_7d = max(-1.0, min(1.0, float(sentiment_7d)))

        # Success message with results
        if len(kept) > 0:
            print(f"SUCCESS NEWS API: Successfully processed {len(kept)} articles")
            print(f"   INFO Sentiment Score: {sentiment_7d:.3f} | Articles: {len(kept)} | Headlines: {len(kept[:10])}")
            if neg_spike:
                print("   WARNING: Negative event detected in recent news")
        else:
            print("WARNING NEWS API: No articles matched filtering criteria")

        return {
            "sentiment_7d": sentiment_7d,
            "n_articles_7d": len(kept),
            "neg_event_spike": neg_spike,
            "top_headlines": kept[:10]
        }

    def fetch_news_sync(self, symbol: str, company_name: str,
                        days: int = 7, language: str = "en", pageSize: int = 20) -> Dict:
        return asyncio.get_event_loop().run_until_complete(
            self.fetch_news_async(symbol, company_name, days, language, pageSize)
        )

    def _empty_news_result(self) -> Dict:
        return {
            "sentiment_7d": 0.0,
            "n_articles_7d": 0,
            "neg_event_spike": False,
            "top_headlines": []
        }

# -------------------- GENERAL USAGE FUNCTION --------------------
def get_company_news(symbol: str, company_name: str) -> Dict:
    """Fetch news for any company by passing symbol and company_name"""
    news_fetcher = NewsFetcher()
    return news_fetcher.fetch_news_sync(symbol, company_name)

# Global instance for easy import
news_fetcher = NewsFetcher()

# Convenience functions for backward compatibility
def fetch_news(symbol: str, company_name: str, days: int = 7, language: str = "en") -> Dict:
    """Fetch news synchronously with optimizations"""
    return news_fetcher.fetch_news_sync(symbol, company_name, days, language, pageSize=20)

async def fetch_news_async(symbol: str, company_name: str, days: int = 7, language: str = "en") -> Dict:
    """Fetch news asynchronously"""
    return await news_fetcher.fetch_news_async(symbol, company_name, days, language, pageSize=20)
