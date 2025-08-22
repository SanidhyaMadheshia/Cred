const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs").promises;
const PredictionOutput = require("../models/PredictionOutput");

/**
 * Call Python prediction script and get results
 */
async function getPrediction(companyData) {
  return new Promise((resolve, reject) => {
    try {
      // Create temporary input file
      const inputData = {
        CompanyName: companyData.CompanyName,
        Symbol: companyData.Symbol,
        Sector: companyData.Sector,
        Year: companyData.Year,
        netProfitMargin: companyData.netProfitMargin,
        returnOnAssets: companyData.returnOnAssets,
        debtRatio: companyData.debtRatio,
        freeCashFlowOperatingCashFlowRatio: companyData.freeCashFlowOperatingCashFlowRatio,
        freeCashFlowPerShare: companyData.freeCashFlowPerShare,
        operatingCashFlowSalesRatio: companyData.operatingCashFlowSalesRatio,
      };

      // Path to prediction wrapper script
      const pythonScriptPath = path.join(__dirname, "../prediction/prediction/run_prediction.py");
      const tempInputPath = path.join(__dirname, "../temp_input.json");

      // Write input data to temporary file
      fs.writeFile(tempInputPath, JSON.stringify(inputData, null, 2))
        .then(() => {
          // Execute Python script with proper encoding
          const pythonProcess = spawn("python", [pythonScriptPath, tempInputPath], {
            cwd: path.join(__dirname, "../prediction/prediction"),
            env: { 
              ...process.env, 
              PYTHONIOENCODING: 'utf-8',
              PYTHONUNBUFFERED: '1'
            }
          });

          let output = "";
          let errorOutput = "";

          pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
          });

          pythonProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
          });

          pythonProcess.on("close", async (code) => {
            try {
              // Clean up temporary file
              await fs.unlink(tempInputPath).catch(() => {});

              if (code !== 0) {
                console.error("Python script error:", errorOutput);
                reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
                return;
              }

              // Extract JSON result from stdout using markers
              const startMarker = 'PREDICTION_RESULT_START';
              const endMarker = 'PREDICTION_RESULT_END';
              
              const startIndex = output.indexOf(startMarker);
              const endIndex = output.indexOf(endMarker);
              
              let jsonStr;
              if (startIndex !== -1 && endIndex !== -1) {
                // Extract JSON between markers
                jsonStr = output.substring(
                  startIndex + startMarker.length,
                  endIndex
                ).trim();
              } else {
                // Fallback: try to find JSON in the output
                const lines = output.split('\n');
                const jsonLines = [];
                let inJson = false;
                
                for (const line of lines) {
                  if (line.trim().startsWith('{')) {
                    inJson = true;
                    jsonLines.push(line);
                  } else if (inJson && line.trim().endsWith('}')) {
                    jsonLines.push(line);
                    break;
                  } else if (inJson) {
                    jsonLines.push(line);
                  }
                }
                
                jsonStr = jsonLines.join('\n');
              }
              
              if (!jsonStr) {
                console.error("No JSON found in Python output:", output);
                throw new Error('No JSON found in Python output');
              }
              
              // Parse the extracted JSON
              const result = JSON.parse(jsonStr);
              
              // Create prediction output document
              const predictionOutput = new PredictionOutput({
                prediction: {
                  symbol: result.symbol || companyData.Symbol,
                  sector: result.sector || companyData.Sector,
                  base: {
                    predicted_rating: result.base?.predicted_rating,
                    probabilities: {
                      proba_High_Risk: result.base?.probabilities?.proba_High_Risk,
                      proba_Highest_Risk: result.base?.probabilities?.proba_Highest_Risk,
                      proba_Low_Risk: result.base?.probabilities?.proba_Low_Risk,
                      proba_Medium_Risk: result.base?.probabilities?.proba_Medium_Risk,
                    },
                    top_features: result.base?.top_features || [],
                  },
                  news: {
                    sentiment_7d: result.news?.sentiment_7d,
                    n_articles_7d: result.news?.n_articles_7d,
                    neg_event_spike: result.news?.neg_event_spike,
                    top_headlines: result.news?.top_headlines || [],
                  },
                  after_news: {
                    predicted_rating: result.after_news?.predicted_rating,
                    probabilities: {
                      proba_High_Risk: result.after_news?.probabilities?.proba_High_Risk,
                      proba_Highest_Risk: result.after_news?.probabilities?.proba_Highest_Risk,
                      proba_Low_Risk: result.after_news?.probabilities?.proba_Low_Risk,
                      proba_Medium_Risk: result.after_news?.probabilities?.proba_Medium_Risk,
                    },
                    debug: {
                      news_adj: result.after_news?.debug?.news_adj,
                      alpha: result.after_news?.debug?.alpha,
                      gamma: result.after_news?.debug?.gamma,
                      neg_event_spike: result.after_news?.debug?.neg_event_spike,
                      n_articles_7d: result.after_news?.debug?.n_articles_7d,
                    },
                  },
                },
                metadata: {
                  backend_version: "1.0.0",
                  processing_time_included: true,
                },
              });

              // Save to database
              await predictionOutput.save();
              console.log(`✅ Prediction saved for ${companyData.Symbol}`);

              resolve(predictionOutput);
            } catch (parseError) {
              console.error("Error parsing Python output:", parseError);
              reject(new Error(`Failed to parse prediction result: ${parseError.message}`));
            }
          });
        })
        .catch(reject);
    } catch (error) {
      console.error("Prediction Service Error:", error);
      reject(error);
    }
  });
}

/**
 * Alternative method: Use existing input.json file
 */
async function getPredictionFromInputFile() {
  return new Promise((resolve, reject) => {
    try {
      const pythonScriptPath = path.join(__dirname, "../prediction/prediction/run_prediction.py");
      const inputFilePath = path.join(__dirname, "../input.json");

      // Execute Python script with input.json
      const pythonProcess = spawn("python", [pythonScriptPath, inputFilePath], {
        cwd: path.join(__dirname, "../prediction/prediction"),
        env: { 
          ...process.env, 
          PYTHONIOENCODING: 'utf-8',
          PYTHONUNBUFFERED: '1'
        }
      });

      let output = "";
      let errorOutput = "";

      pythonProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on("close", async (code) => {
        if (code !== 0) {
          console.error("Python script error:", errorOutput);
          reject(new Error(`Python script failed with code ${code}: ${errorOutput}`));
          return;
        }

        try {
          // Extract JSON result from stdout using markers
          const startMarker = 'PREDICTION_RESULT_START';
          const endMarker = 'PREDICTION_RESULT_END';
          
          const startIndex = output.indexOf(startMarker);
          const endIndex = output.indexOf(endMarker);
          
          let jsonStr;
          if (startIndex !== -1 && endIndex !== -1) {
            // Extract JSON between markers
            jsonStr = output.substring(
              startIndex + startMarker.length,
              endIndex
            ).trim();
          } else {
            // Fallback: try to find JSON in the output
            const lines = output.split('\n');
            const jsonLines = [];
            let inJson = false;
            
            for (const line of lines) {
              if (line.trim().startsWith('{')) {
                inJson = true;
                jsonLines.push(line);
              } else if (inJson && line.trim().endsWith('}')) {
                jsonLines.push(line);
                break;
              } else if (inJson) {
                jsonLines.push(line);
              }
            }
            
            jsonStr = jsonLines.join('\n');
          }
          
          if (!jsonStr) {
            console.error("No JSON found in Python output:", output);
            throw new Error('No JSON found in Python output');
          }
          
          // Parse the extracted JSON
          const result = JSON.parse(jsonStr);
          resolve(result);
        } catch (parseError) {
          console.error("Error parsing Python output:", parseError);
          console.error("Raw Python output:", output);
          reject(new Error(`Failed to parse prediction result: ${parseError.message}`));
        }
      });
    } catch (error) {
      console.error("Prediction Service Error:", error);
      reject(error);
    }
  });
}

module.exports = { getPrediction, getPredictionFromInputFile };
