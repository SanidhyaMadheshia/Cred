import Navbar from "./components/Navbar";
import RiskRating from "./components/dashboard/RiskRating";
import FactorCard from "./components/dashboard/FactorCard";
import NewsFeed from "./components/dashboard/NewsFeed";
import CompanyProfile from "./components/dashboard/CompanyProfile";
import Footer from "./components/Footer";

import { useState } from "react";

const mockData = {
  success: true,
  companyData: {
    CompanyName: "NVIDIA Corporation",
    Symbol: "NVD.F",
    Sector: "Technology",
    Year: 2025,
    netProfitMargin: 0.5584802715771244,
    returnOnAssets: 0.6530407433625147,
    debtRatio: 0.29,
    freeCashFlowOperatingCashFlowRatio: 0.95,
    freeCashFlowPerShare: 2.48,
    operatingCashFlowSalesRatio: 0.4911147382698453,
    _id: "68a740a8a1e9a56637751053",
    createdAt: "2025-08-21T15:52:08.030Z",
    updatedAt: "2025-08-21T15:52:08.030Z",
    __v: 0,
  },
  predictionResult: {
    timestamp: "2025-08-21T10:22:08.275Z",
    prediction: {
      symbol: "NVD.F",
      sector: "Technology",
      base: {
        predicted_rating: "High Risk",
        probabilities: {
          proba_High_Risk: 0.01,
          proba_Highest_Risk: 0.001,
          proba_Low_Risk: 0.8,
          proba_Medium_Risk: 0.19,
        },
        top_features: [
          {
            Feature: "freeCashFlowPerShare",
            Contribution: 1000,
            _id: "68a740a8a1e9a56637751056",
          },
          {
            Feature: "netProfitMargin",
            Contribution: -5,
            _id: "68a740a8a1e9a56637751057",
          },
          {
            Feature: "debtRatio",
            Contribution: 0.8,
            _id: "68a740a8a1e9a56637751058",
          },
        ],
      },
      news: {
        sentiment_7d: 0.65,
        n_articles_7d: 3,
        neg_event_spike: false,
        top_headlines: [
          {
            publishedAt: "2025-08-20T10:00:00.000Z",
            title: "Sample news headline",
            compound: 0.5,
            _id: "68a740a8a1e9a56637751059",
          },
          {
            publishedAt: "2025-08-20T10:00:00.000Z",
            title: "Sample news headline",
            compound: 0.5,
            _id: "68a740a8a1e9a56637751059",
          },
          {
            publishedAt: "2025-08-20T10:00:00.000Z",
            title: "Sample news headline",
            compound: 0.5,
            _id: "68a740a8a1e9a56637751059",
          },
          {
            publishedAt: "2025-08-20T10:00:00.000Z",
            title: "Sample news headline",
            compound: 0.5,
            _id: "68a740a8a1e9a56637751059",
          },
          {
            publishedAt: "2025-08-20T10:00:00.000Z",
            title: "Sample news headline",
            compound: 0.5,
            _id: "68a740a8a1e9a56637751059",
          },
          {
            publishedAt: "2025-08-20T10:00:00.000Z",
            title: "Sample news headline",
            compound: 0.5,
            _id: "68a740a8a1e9a56637751059",
          },
        ],
      },
      after_news: {
        predicted_rating: "High Risk",
        probabilities: {
          proba_High_Risk: 0.009,
          proba_Highest_Risk: 0.0009,
          proba_Low_Risk: 0.82,
          proba_Medium_Risk: 0.17,
        },
        debug: {
          news_adj: 0.65,
          alpha: 0.2,
          gamma: 1.2,
          neg_event_spike: false,
          n_articles_7d: 3,
        },
      },
    },
    metadata: {
      backend_version: "1.0.0",
      processing_time_included: true,
    },
    _id: "68a740a8a1e9a56637751055",
    createdAt: "2025-08-21T15:52:08.303Z",
    updatedAt: "2025-08-21T15:52:08.303Z",
    __v: 0,
  },
};

// Descriptions now mapped by feature name for correct access
const factorsDescription = {
  freeCashFlowPerShare:
    "A financial metric that measures a company's financial flexibility.",
  netProfitMargin:
    "A key profitability ratio that measures how much net income is generated as a percentage of revenue.",
  debtRatio:
    "A solvency ratio that measures the extent of a company's leverage.",
};

const App = () => {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);

  const handelSearch = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/prediction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            companyName: query
          })
        }
      );
      const result = await response.json();
      if (result.success) {
        // Transform backend response to match frontend structure
        const transformedData = {
          success: true,
          companyData: {
            CompanyName: result.data.prediction.symbol, // Using symbol as company name for now
            Symbol: result.data.prediction.symbol,
            Sector: result.data.prediction.sector,
            Year: new Date().getFullYear(),
            // Add dummy financial data since we don't get this from prediction endpoint
            netProfitMargin: 0.5,
            returnOnAssets: 0.3,
            debtRatio: 0.4,
            freeCashFlowOperatingCashFlowRatio: 0.8,
            freeCashFlowPerShare: 50,
            operatingCashFlowSalesRatio: 0.6,
            createdAt: result.data.timestamp,
            updatedAt: result.data.timestamp
          },
          predictionResult: result.data
        };
        setData(transformedData);
      } else {
        alert("Company not found");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d141c] text-gray-100 font-sans">
      <Navbar onSearch={handelSearch} loading={loading}></Navbar>
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6">
            <RiskRating
              // CORRECTED: Use the 'data' state variable
              rating={
                data.predictionResult.prediction.after_news.predicted_rating
              }
              factors={data.predictionResult.prediction.base.top_features}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* CORRECTED: Loop over the 'data' state variable */}
              {data.predictionResult.prediction.base.top_features.map(
                (factor, index) => (
                  <FactorCard
                    key={index}
                    name={factor.Feature}
                    contribution={factor.Contribution}
                    // CORRECTED: Get the correct description by feature name
                    description={factorsDescription[factor.Feature]}
                    variant={index % 3}
                  />
                )
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* CORRECTED: Use the 'data' state variable */}
            <NewsFeed news={data.predictionResult.prediction.news} />
            <CompanyProfile company={data.companyData} />
          </div>
        </div>
      </main>
      <Footer></Footer>
    </div>
  );
};

export default App;
