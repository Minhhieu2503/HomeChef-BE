const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

async function testFallback() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-vision"];
  
  for (const modelName of modelsToTry) {
    try {
      console.log(`Testing model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say hello");
      const response = await result.response;
      console.log(`SUCCESS with ${modelName}:`, response.text());
      return; // Stop after first success
    } catch (error) {
      console.warn(`FAILED with ${modelName}:`, error.message);
    }
  }
}

testFallback();
