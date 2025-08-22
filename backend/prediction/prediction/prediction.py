import numpy as np
import pandas as pd
import pickle
import warnings
import shap
import json
import datetime as dt
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor
from news_fetcher import fetch_news

warnings.filterwarnings("ignore", category=UserWarning)

# === Load models & artifacts ===
with open("../model_LR.pkl", "rb") as f: model = pickle.load(f)
with open("../transformer.pkl", "rb") as f: scaler = pickle.load(f)
with open("../encoder.pkl", "rb") as f: ohe = pickle.load(f)

LABELS = ["High Risk","Highest Risk","Low Risk","Medium Risk"]
NUM_COLS = [
    "Year","netProfitMargin","returnOnAssets","debtRatio",
    "freeCashFlowOperatingCashFlowRatio","freeCashFlowPerShare","operatingCashFlowSalesRatio"
]
CAT_COLS = ["Symbol","Sector"]

# SHAP explainer - Lazy loading for better performance
_explainer = None
_background_data = None

def _get_shap_explainer():
    """Lazy load SHAP explainer - only loads when first needed"""
    global _explainer, _background_data
    
    if _explainer is None:
        print("Loading SHAP explainer (first use only)...")
        
        # Load and process background data
        df_bg = pd.read_csv("validation_data.csv")
        
        # Use smaller sample for faster initialization (first 500 rows instead of all)
        df_bg_sample = df_bg.sample(n=min(500, len(df_bg)), random_state=42)
        
        X_num_bg = df_bg_sample[NUM_COLS].replace([np.inf, -np.inf], np.nan).fillna(df_bg_sample[NUM_COLS].median(numeric_only=True))
        X_cat_bg = df_bg_sample[CAT_COLS].astype("string").copy()
        Xn_bg = scaler.transform(X_num_bg)
        Xc_bg = ohe.transform(X_cat_bg)
        if hasattr(Xc_bg,"toarray"): 
            Xc_bg = Xc_bg.toarray()
        _background_data = np.hstack([Xn_bg, Xc_bg])
        
        # Initialize SHAP explainer
        _explainer = shap.Explainer(model, _background_data, feature_names=list(NUM_COLS)+list(ohe.get_feature_names_out(CAT_COLS)))
        print("SHAP explainer loaded successfully!")
    
    return _explainer

def proba_dict(probs):
    return {f"proba_{k.replace(' ','_')}":float(p) for k,p in zip(LABELS, probs)}

def apply_news_tilt(base_probs, sentiment_7d, neg_event_spike=False, n_articles_7d=None,
                    min_articles=3, alpha=0.2, gamma=1.2, spike_boost=0.25):
    base_probs = np.asarray(base_probs,dtype=float)
    if n_articles_7d is not None and n_articles_7d<min_articles:
        return base_probs, {"skipped":"too_few_articles"}
    adj = float(sentiment_7d) - (spike_boost if neg_event_spike else 0.0)
    adj = max(-1.0,min(1.0,adj))
    tilt = np.array([np.exp(-gamma*adj), np.exp(-gamma*adj), np.exp(gamma*adj), np.exp(0.5*gamma*adj)],dtype=float)
    tilted = base_probs*tilt
    tilted/=tilted.sum()
    final=(1-alpha)*base_probs + alpha*tilted
    final/=final.sum()
    dbg = {"news_adj":adj,"alpha":alpha,"gamma":gamma,"neg_event_spike":bool(neg_event_spike),"n_articles_7d":n_articles_7d}
    return final, dbg

def get_base_prediction(X_final, sample, include_shap=True):
    """Get base prediction and optionally SHAP explanation"""
    base_probs = model.predict_proba(X_final)[0]
    y_id = int(np.argmax(base_probs))
    
    top_features = []
    if include_shap:
        # Lazy load SHAP explainer only when needed
        explainer = _get_shap_explainer()
        shap_values = explainer(X_final)
        feature_contribs = shap_values.values[0,:,y_id]
        sorted_feats = sorted(zip(list(NUM_COLS)+list(ohe.get_feature_names_out(CAT_COLS)), feature_contribs), key=lambda x: abs(x[1]), reverse=True)
        top_features = [{"Feature":f,"Contribution":round(float(c),4)} for f,c in sorted_feats[:3]]

    return {
        "predicted_rating": LABELS[y_id],
        "probabilities": proba_dict(base_probs),
        "top_features": top_features
    }, base_probs

def predict_final(sample, include_shap=True):
    # Prepare data for prediction
    row = pd.DataFrame([sample])
    X_num = row[NUM_COLS].replace([np.inf,-np.inf],np.nan).fillna(row[NUM_COLS].median(numeric_only=True))
    X_cat = row[CAT_COLS].astype("string").fillna("Unknown")
    Xn = scaler.transform(X_num)
    Xc = ohe.transform(X_cat)
    if hasattr(Xc,"toarray"): Xc=Xc.toarray()
    X_final=np.hstack([Xn,Xc])

    # Get company name directly from input (more flexible than hardcoded mapping)
    company_name = sample.get("CompanyName", sample.get("Sector"))

    # Run base prediction and news fetching in parallel
    with ThreadPoolExecutor(max_workers=2) as executor:
        # Submit both tasks simultaneously
        base_future = executor.submit(get_base_prediction, X_final, sample, include_shap)
        news_future = executor.submit(fetch_news, sample["Symbol"], company_name)
        
        # Wait for both to complete
        base_out, base_probs = base_future.result()
        news_out = news_future.result()

    # Apply news tilt (fast operation)
    final_probs, dbg = apply_news_tilt(base_probs, news_out["sentiment_7d"], news_out["neg_event_spike"], news_out["n_articles_7d"])
    final_label = LABELS[int(np.argmax(final_probs))]
    after_news = {
        "predicted_rating": final_label,
        "probabilities": proba_dict(final_probs),
        "debug": dbg
    }

    return {
        "symbol": sample["Symbol"],
        "sector": sample["Sector"],
        "base": base_out,
        "news": news_out,
        "after_news": after_news
    }

def predict_fast(sample):
    """Ultra-fast prediction without SHAP explanations"""
    return predict_final(sample, include_shap=False)

# === Example usage ===
if __name__ == "__main__":
    sample_data = dict(
        Symbol="AAPL",
        Sector="Technology",
        CompanyName="Apple Inc",
        Year=2024,
        netProfitMargin=0.22,
        returnOnAssets=0.18,
        debtRatio=0.56,
        freeCashFlowOperatingCashFlowRatio=0.65,
        freeCashFlowPerShare=8.1,
        operatingCashFlowSalesRatio=0.33
    )

    output_json = predict_final(sample_data)
    print(json.dumps(output_json, indent=4))