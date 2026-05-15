const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const detectLabels = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Thử mô hình Pro Vision với đường dẫn cũ (Đôi khi Server ở EU vẫn chạy được bản này)
  const modelName = "gemini-pro-vision";
  
  try {
    console.log(`[AI] Đang thử mô hình tương thích cao: ${modelName}`);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = `Return a JSON object of food items found in this image. 
    Rules: Extract name (VN), quantity (num), unit, emoji, category (Meat|Vegetable|Fruit|Dairy|Spice|Other). If bill, food only.
    Output JSON format: {"type":"food_image","ingredients":[{"name":"..","quantity":0,"unit":"..","emoji":"..","category":".."}]}`;

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
    return JSON.parse(response.text().match(/\{[\s\S]*\}/)[0]);
  } catch (error) {
    console.error(`[AI] Thất bại với ${modelName}, đang thử Flash 1.5 làm dự phòng...`);
    
    try {
      const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await flashModel.generateContent([
        "Phân tích ảnh này và trả về JSON nguyên liệu: {\"ingredients\":[{\"name\":\"..\"}]}",
        { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/jpeg" } }
      ]);
      const response = await result.response;
      return JSON.parse(response.text().match(/\{[\s\S]*\}/)[0]);
    } catch (flashError) {
      throw new Error(`Google AI từ chối kết nối từ Server của bạn (Lỗi: ${flashError.message}). Gợi ý: Hãy tạo lại Service trên Render và chọn vùng 'Oregon (US West)' nhé!`);
    }
  }
};

module.exports = { detectLabels };
