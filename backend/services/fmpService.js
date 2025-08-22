const axios = require("axios");
const CompanyInput = require("../models/CompanyInput");

require("dotenv").config();
const BASE_URL = "https://financialmodelingprep.com/api/v3";
const API_KEY = process.env.FMP_API_KEY || "YYOQ5axXSSy9r8IIKVa5OBN6PIQ6TDcM";

/**
 * Fetch symbol from company name
 */
async function getSymbolFromName(companyName) {
  try {
    const res = await axios.get(
      `${BASE_URL}/search?query=${encodeURIComponent(companyName)}&limit=1&apikey=${API_KEY}`
    );
    if (!res.data.length) throw new Error("Company not found");
    return res.data[0].symbol;
  } catch (error) {
    console.error("Error fetching symbol:", error.message);
    throw error;
  }
}

/**
 * Fetch financial data from FMP API
 */
async function getCompanyDataByName(companyName) {
  try {
    const symbol = await getSymbolFromName(companyName);

    const [profileRes, ratiosRes, balanceRes, cfRes, keyMetricsRes] = await Promise.all([
      axios.get(`${BASE_URL}/profile/${symbol}?apikey=${API_KEY}`),
      axios.get(`${BASE_URL}/ratios/${symbol}?limit=1&apikey=${API_KEY}`),
      axios.get(`${BASE_URL}/balance-sheet-statement/${symbol}?limit=1&apikey=${API_KEY}`),
      axios.get(`${BASE_URL}/cash-flow-statement/${symbol}?limit=1&apikey=${API_KEY}`),
      axios.get(`${BASE_URL}/key-metrics/${symbol}?limit=1&apikey=${API_KEY}`),
    ]);

    const profile = profileRes.data[0];
    const ratios = ratiosRes.data[0];
    const balanceSheet = balanceRes.data[0];
    const cashFlow = cfRes.data[0];
    const keyMetrics = keyMetricsRes.data[0];

    // ---- Calculations ----
    const debtRatio = balanceSheet.totalLiabilities / balanceSheet.totalAssets;
    const freeCashFlowOperatingCashFlowRatio =
      cashFlow.freeCashFlow / cashFlow.operatingCashFlow;
    const freeCashFlowPerShare = keyMetrics.freeCashFlowPerShare
      ? keyMetrics.freeCashFlowPerShare
      : cashFlow.freeCashFlow / keyMetrics.sharesOutstanding;

    const operatingCashFlowSalesRatio =
      cashFlow.operatingCashFlow && profile?.mktCap
        ? cashFlow.operatingCashFlow / profile.mktCap
        : null;

    // ---- Prepare object to save ----
    const companyData = {
      CompanyName: profile.companyName,
      Symbol: profile.symbol,
      Sector: profile.sector,
      Year: new Date().getFullYear(),
      netProfitMargin: ratios.netProfitMargin,
      returnOnAssets: ratios.returnOnAssets,
      debtRatio: parseFloat(debtRatio.toFixed(2)),
      freeCashFlowOperatingCashFlowRatio: parseFloat(
        freeCashFlowOperatingCashFlowRatio.toFixed(2)
      ),
      freeCashFlowPerShare: parseFloat(freeCashFlowPerShare.toFixed(2)),
      operatingCashFlowSalesRatio: operatingCashFlowSalesRatio
        ? parseFloat(operatingCashFlowSalesRatio.toFixed(2))
        : null,
    };

    // Save to MongoDB
    const companyDoc = new CompanyInput(companyData);
    await companyDoc.save();
    console.log(`✅ Company data for ${companyName} saved in MongoDB`);

    return companyDoc;
  } catch (error) {
    console.error("FMP Service Error:", error.message);
    throw error;
  }
}

module.exports = { getCompanyDataByName };
