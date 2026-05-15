const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const detectLabels = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // List of models to try in order of preference
  const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-vision"];
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting vision analysis with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = `Return a JSON object of food items found in this image. 
      Rules: Extract name (VN), quantity (num), unit, emoji, category (Meat|Vegetable|Fruit|Dairy|Spice|Other). If bill, food only.
      Output JSON format: {"type":"bill"|"food_image","ingredients":[{"name":"..","quantity":0,"unit":"..","emoji":"..","category":".."}]}`;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: "image/jpeg"
          }
        }
      ]);

      const response = await result.response;
      let text = response.text();
      console.log(`Gemini ${modelName} Response:`, text);
      
      // Clean markdown if present
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // Continue to next model if it's a 404, 429 (Quota), or support error
      if (
        error.message.includes("404") || 
        error.message.includes("429") || 
        error.message.includes("not supported") ||
        error.message.includes("Quota")
      ) {
        continue;
      } else {
        // If it's a different error (like invalid API Key), break early
        break;
      }
    }
  }

  console.error("All Gemini models failed. Last error:", lastError);
  throw new Error(lastError ? lastError.message : "Failed to process image with Gemini AI");
};

module.exports = {
  detectLabels
};
