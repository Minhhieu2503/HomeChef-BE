const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const detectLabels = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Sử dụng cấu hình v1 (Stable) và thử các mô hình phổ biến nhất
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro"];
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI-DEBUG] Đang thử với v1/${modelName}`);
      
      // Ép sử dụng apiVersion v1 để tránh lỗi 404 của bản beta
      const model = genAI.getGenerativeModel(
        { model: modelName },
        { apiVersion: "v1" }
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
      
      // Nếu vẫn 404, tiếp tục thử mô hình tiếp theo
      if (error.message.includes("404") || error.message.toLowerCase().includes("not found")) {
        continue;
      }
      break;
    }
  }

  throw new Error(`[LỖI CUỐI CÙNG] Google AI phản hồi: ${lastError.message}. Gợi ý: Hãy kiểm tra xem bạn đã bật 'Generative Language API' trong Google Cloud Console chưa.`);
};

module.exports = {
  detectLabels
};
