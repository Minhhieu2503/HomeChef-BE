const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo AI - ép sử dụng phiên bản API v1 (Stable)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const detectLabels = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  try {
    console.log("[AI] Đang gọi Google AI v1 (Stable)...");
    
    // Sử dụng mã định danh mô hình chính xác nhất cho bản Stable
    const model = genAI.getGenerativeModel(
      { model: "gemini-1.5-flash" },
      { apiVersion: "v1" } // Ép dùng v1 thay vì v1beta
    );

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
    let text = response.text();
    
    // Trích xuất JSON từ phản hồi
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];
    
    console.log("[AI] Phân tích thành công.");
    return JSON.parse(text);
  } catch (error) {
    console.error("[AI ERROR]:", error.message);
    
    // Nếu vẫn lỗi 404, thử mô hình pro-vision (bản cũ nhưng ổn định ở một số vùng)
    if (error.message.includes("404")) {
      try {
        console.log("[AI] Thử lại với mô hình pro-vision...");
        const oldModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        const result = await oldModel.generateContent([
          "Extract food as JSON: {\"ingredients\":[{\"name\":\"..\"}]}",
          { inlineData: { data: imageBuffer.toString("base64"), mimeType: "image/jpeg" } }
        ]);
        const response = await result.response;
        return JSON.parse(response.text().match(/\{[\s\S]*\}/)[0]);
      } catch (e) {
        throw new Error(`Google AI vẫn chưa sẵn sàng cho Server này (Lỗi: ${error.message}). Bạn hãy kiểm tra lại mã API Key trên AI Studio xem đã được kích hoạt 'Pay-as-you-go' chưa nhé (miễn phí vẫn dùng được).`);
      }
    }
    throw error;
  }
};

module.exports = { detectLabels };
