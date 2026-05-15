const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo AI với mã API mới nhất
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const detectLabels = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  // Sử dụng mô hình Flash 1.5 - Mô hình tối ưu nhất cho quét ảnh
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    console.log("[AI] Đang bắt đầu phân tích ảnh...");
    
    const prompt = `Bạn là một chuyên gia ẩm thực. Hãy nhìn vào ảnh này và trả về một đối tượng JSON.
    Nếu là ảnh nguyên liệu: Liệt kê các nguyên liệu thấy được.
    Nếu là hóa đơn: Liệt kê các món ăn/nguyên liệu trong hóa đơn.
    Định dạng JSON: {"type":"food_image","ingredients":[{"name":"tên tiếng Việt","quantity":1,"unit":"cái/kg/g","emoji":"🍎","category":"Fruit"}]}`;

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
    
    // Làm sạch dữ liệu trả về để lấy đúng JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];
    
    console.log("[AI] Phân tích hoàn tất.");
    return JSON.parse(text);
  } catch (error) {
    console.error("[AI LỖI CHI TIẾT]:", error);
    
    // Thông báo lỗi thân thiện cho người dùng
    if (error.message.includes("404")) {
      throw new Error("Lỗi 404: Google không tìm thấy mô hình AI. Hãy đảm bảo bạn đã chọn vùng (Region) phù hợp trên Render.");
    }
    
    throw new Error(`Lỗi quét ảnh: ${error.message}`);
  }
};

module.exports = {
  detectLabels
};
