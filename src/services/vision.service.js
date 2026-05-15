const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const detectLabels = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Use the latest stable and fast model
  const modelName = "gemini-1.5-flash";
  
  try {
    console.log(`Analyzing image with Google AI: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = `Return a JSON object of food items found in this image. 
    Rules: Extract name (VN), quantity (num), unit, emoji, category (Meat|Vegetable|Fruit|Dairy|Spice|Other). If bill, food only.
    Output JSON format: {"type":"bill"|"food_image","ingredients":[{"name":"..","quantity":0,"unit":"..","emoji":"..","category":".."}]}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBuffer.toString("base64"),
          mimeType: "image/jpeg" // Standard for photos, works for most cases
        }
      }
    ]);

    const response = await result.response;
    let text = response.text();
    console.log(`AI Response:`, text);
    
    // Clean markdown if present (sometimes AI returns ```json ... ```)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error(`AI Analysis Error (${modelName}):`, error.message);
    
    // Fallback or more specific error message
    if (error.message.includes("429")) {
      throw new Error("Dịch vụ AI đang quá tải (Hết hạn mức miễn phí). Vui lòng thử lại sau ít phút.");
    }
    if (error.message.includes("404")) {
      throw new Error("Mô hình AI không tồn tại hoặc đã bị thay thế. Vui lòng liên hệ Admin.");
    }
    
    throw new Error("Không thể phân tích ảnh bằng AI: " + error.message);
  }
};

module.exports = {
  detectLabels
};
