const mongoose = require("mongoose");

const CompanyInputSchema = new mongoose.Schema({
  CompanyName: { type: String, required: true },
  Symbol: { type: String, required: true },
  Sector: { type: String },
  Year: { type: Number },
  netProfitMargin: { type: Number },
  returnOnAssets: { type: Number },
  debtRatio: { type: Number },
  freeCashFlowOperatingCashFlowRatio: { type: Number },
  freeCashFlowPerShare: { type: Number },
  operatingCashFlowSalesRatio: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model("CompanyInput", CompanyInputSchema);
