const fetch = require("node-fetch"); // Đảm bảo đã có node-fetch hoặc dùng global fetch nếu node > 18

const detectLabels = async (imageBuffer) => {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new Error("GEMINI_API_KEY is missing");

  // Dùng trực tiếp endpoint REST của Google - Bỏ qua thư viện SDK
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  try {
    console.log("[AI] Đang gọi trực tiếp Google REST API...");
    
    const body = {
      contents: [{
        parts: [
          { text: "Return a JSON object of food items found in this image. Format: {\"ingredients\":[{\"name\":\"..\",\"quantity\":1,\"unit\":\"..\",\"emoji\":\"..\",\"category\":\"..\"}]}" },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBuffer.toString("base64")
            }
          }
        ]
      }]
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Google API Error: ${data.error.message}`);
    }

    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch (error) {
    console.error("[AI FATAL ERROR]:", error.message);
    throw new Error(`Giải pháp Gemini thất bại triệt để: ${error.message}. Khuyên dùng: Chuyển sang Google Cloud Vision API để ổn định 100%.`);
  }
};

module.exports = { detectLabels };
