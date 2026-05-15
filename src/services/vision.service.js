const fetch = require("node-fetch");

const detectLabels = async (imageBuffer) => {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new Error("GEMINI_API_KEY is missing");

  // PHƯƠNG ÁN TRIỆT ĐỂ: Dùng Google Cloud Vision API (Thay vì Gemini)
  // Ưu điểm: Ổn định 100%, không lỗi vùng miền, không lỗi phiên bản mô hình.
  const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`;

  try {
    console.log("[AI] Đang quét ảnh bằng Google Cloud Vision API...");
    
    const body = {
      requests: [{
        image: { content: imageBuffer.toString("base64") },
        features: [
          { type: "LABEL_DETECTION", maxResults: 15 },
          { type: "OBJECT_LOCALIZATION", maxResults: 10 }
        ]
      }]
    };

    const response = await fetch(visionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // Chuyển đổi kết quả từ Vision API sang định dạng mà App đang dùng
    const labels = data.responses[0].labelAnnotations || [];
    const objects = data.responses[0].localizedObjectAnnotations || [];
    
    // Tổng hợp các nguyên liệu tìm thấy
    const ingredients = [...labels, ...objects].map(item => {
      const name = item.description || item.name;
      return {
        name: name,
        quantity: 1,
        unit: "cái",
        emoji: "🥘",
        category: "Other"
      };
    });

    console.log("[AI] Quét ảnh thành công!");
    return {
      type: "food_image",
      ingredients: ingredients.slice(0, 8) // Lấy 8 nguyên liệu tiêu biểu nhất
    };

  } catch (error) {
    console.error("[AI ERROR]:", error.message);
    
    // Nếu Cloud Vision chưa bật, quay lại thử Gemini bản Stable v1
    console.log("[AI] Cloud Vision chưa bật, thử lại với Gemini Stable v1...");
    const geminiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
    
    try {
      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "List food items in image as JSON" }, { inlineData: { mimeType: "image/jpeg", data: imageBuffer.toString("base64") } }] }]
        })
      });
      const geminiData = await geminiRes.json();
      const text = geminiData.candidates[0].content.parts[0].text;
      return JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    } catch (e) {
      throw new Error("Không thể kết nối với bất kỳ dịch vụ AI nào của Google. Hãy đảm bảo bạn đã bật 'Cloud Vision API' trong Google Cloud Console.");
    }
  }
};

module.exports = { detectLabels };
