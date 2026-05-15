const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const detectLabels = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Thử các biến thể tên mô hình Flash phổ biến nhất
  const modelsToTry = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro-latest"];
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI-DEBUG] Đang thử với v1beta/${modelName}`);
      
      // Sử dụng v1beta cho các mô hình 1.5 mới
      const model = genAI.getGenerativeModel(
        { model: modelName },
        { apiVersion: "v1beta" }
      );
      
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
      console.warn(`[AI-DEBUG] Thất bại với ${modelName}:`, error.message);
      lastError = error;
      
      if (error.message.includes("404") || error.message.toLowerCase().includes("not found")) {
        continue;
      }
      break;
    }
  }

  throw new Error(`[LỖI GOOGLE] ${lastError.message}. Nếu lỗi 404 vẫn tiếp diễn, bạn hãy thử tạo một API Key mới hoàn toàn trên Google AI Studio (aistudio.google.com) nhé!`);
};

module.exports = {
  detectLabels
};
