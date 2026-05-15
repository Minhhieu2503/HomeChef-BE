const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const detectLabels = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Danh sách các mô hình hiện đại nhất để thử
  const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"];
  let lastError;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[AI-DEBUG] Đang thử quét với mô hình: ${modelName}`);
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
      
      // Bóc tách JSON từ phản hồi của AI
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];
      
      return JSON.parse(text);
    } catch (error) {
      console.warn(`[AI-DEBUG] Mô hình ${modelName} thất bại:`, error.message);
      lastError = error;
      
      // Nếu là lỗi không tìm thấy mô hình (404), hãy thử mô hình tiếp theo
      if (error.message.includes("404") || error.message.toLowerCase().includes("not found")) {
        continue;
      }
      // Nếu là lỗi khác (như hết hạn mức 429), dừng lại và báo lỗi luôn
      break;
    }
  }

  // Nếu tất cả đều thất bại, trả về lỗi chi tiết nhất có thể
  throw new Error(`[HỆ THỐNG AI MỚI] Lỗi: ${lastError.message}`);
};

module.exports = {
  detectLabels
};
