const fetch = require("node-fetch");

const detectLabels = async (imageBuffer) => {
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) throw new Error("GEMINI_API_KEY is missing");

  // Danh sách các mô hình và dịch vụ để thử nghiệm theo thứ tự ưu tiên
  const tryAIs = [
    // 1. Cloud Vision (Cực kỳ ổn định nếu đã bật và không bị giới hạn Key)
    {
      name: "Cloud Vision",
      url: `https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`,
      getBody: (base64) => ({
        requests: [{
          image: { content: base64 },
          features: [{ type: "LABEL_DETECTION", maxResults: 10 }]
        }]
      }),
      parser: (data) => {
        const labels = data.responses[0].labelAnnotations || [];
        return { ingredients: labels.map(l => ({ name: l.description, quantity: 1, unit: "cái", emoji: "🥘", category: "Other" })) };
      }
    },
    // 2. Gemini 1.5 Flash 8B (Bản mới nhất, cực kỳ dễ tính, ít khi bị 404)
    {
      name: "Gemini 1.5 Flash 8B",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${API_KEY}`,
      getBody: (base64) => ({
        contents: [{ parts: [{ text: "List food items in image as JSON: {\"ingredients\":[{\"name\":\"..\"}]}" }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }]
      }),
      parser: (data) => JSON.parse(data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/)[0])
    }
  ];

  let lastError;
  for (const ai of tryAIs) {
    try {
      console.log(`[AI] Đang thử với ${ai.name}...`);
      const response = await fetch(ai.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ai.getBody(imageBuffer.toString("base64")))
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const result = ai.parser(data);
      console.log(`[AI] ${ai.name} thành công!`);
      return { type: "food_image", ...result };
    } catch (error) {
      console.warn(`[AI] ${ai.name} thất bại:`, error.message);
      lastError = error;
    }
  }

  throw new Error(`TẤT CẢ DỊCH VỤ AI ĐỀU THẤT BẠI. Lỗi cuối cùng: ${lastError.message}. Gợi ý: Hãy vào Google Cloud Console -> Credentials -> API Key của bạn -> Chọn 'Don't restrict key' nhé!`);
};

module.exports = { detectLabels };
