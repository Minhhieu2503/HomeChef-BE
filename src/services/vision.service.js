const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const detectLabels = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Try multiple models in case one is restricted in the server's region
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"];
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Attempting AI analysis with model: ${modelName}`);
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
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];
      
      return JSON.parse(text);
    } catch (error) {
      console.warn(`Model ${modelName} failed:`, error.message);
      lastError = error;
      // If it's a 404 or support error, try the next model
      if (error.message.includes("404") || error.message.includes("not found") || error.message.includes("not supported")) {
        continue;
      }
      // If it's another error (like 429), break and show it
      break;
    }
  }

  // If we get here, all tried models failed
  throw new Error(`Lỗi AI: ${lastError.message}. Hãy kiểm tra API Key hoặc Region của Server.`);
};

module.exports = {
  detectLabels
};
