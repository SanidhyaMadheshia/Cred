const mongoose = require("mongoose");

const PredictionOutputSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },

    prediction: {
      symbol: { type: String, required: true },
      sector: { type: String },

      base: {
        predicted_rating: { type: String },
        probabilities: {
          proba_High_Risk: Number,
          proba_Highest_Risk: Number,
          proba_Low_Risk: Number,
          proba_Medium_Risk: Number,
        },
        top_features: [
          {
            Feature: String,
            Contribution: Number,
          },
        ],
      },

      news: {
        sentiment_7d: Number,
        n_articles_7d: Number,
        neg_event_spike: Boolean,
        top_headlines: [
          {
            publishedAt: Date,
            title: String,
            compound: Number,
          },
        ],
      },

      after_news: {
        predicted_rating: { type: String },
        probabilities: {
          proba_High_Risk: Number,
          proba_Highest_Risk: Number,
          proba_Low_Risk: Number,
          proba_Medium_Risk: Number,
        },
        debug: {
          news_adj: Number,
          alpha: Number,
          gamma: Number,
          neg_event_spike: Boolean,
          n_articles_7d: Number,
        },
      },
    },

    metadata: {
      backend_version: String,
      processing_time_included: Boolean,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PredictionOutput", PredictionOutputSchema);
