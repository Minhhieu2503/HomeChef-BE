const fetch = require("node-fetch");

// Prompt yêu cầu Gemini trả kết quả tiếng Việt + emoji phù hợp
const GEMINI_PROMPT = `Hãy nhận diện tất cả nguyên liệu thực phẩm trong hình ảnh này.
Trả về kết quả dưới dạng JSON với format sau:
{
  "ingredients": [
    {"name": "Tên tiếng Việt", "quantity": 1, "unit": "đơn vị phù hợp", "emoji": "emoji phù hợp", "category": "Danh mục"}
  ]
}

Quy tắc:
- "name": Tên nguyên liệu bằng TIẾNG VIỆT (ví dụ: "Cà chua", "Thịt bò", "Hành tây")
- "unit": Đơn vị phù hợp (quả, kg, bó, gói, hộp, chai, lon, lát, miếng, con, bịch, trái)
- "emoji": Emoji phù hợp với từng nguyên liệu (🍅🥕🧅🥩🍗🐟🥚🧀🥛🍋🌶️🧄🥒🍆🥦🥬🍌🍎🫑🥔🌽🍄🥜🫘🍞🍚🧈🫒🥫🍯)
- "category": Một trong các danh mục: "Rau củ", "Trái cây", "Thịt", "Hải sản", "Gia vị", "Sữa & Trứng", "Ngũ cốc", "Đồ uống", "Đồ hộp", "Khác"

CHỈ trả về JSON, không giải thích thêm.`;

// Bảng dịch Anh -> Việt + emoji cho Cloud Vision fallback
const TRANSLATION_MAP = {
  // Rau củ
  "tomato": { name: "Cà chua", emoji: "🍅", category: "Rau củ", unit: "quả" },
  "cherry tomatoes": { name: "Cà chua bi", emoji: "🍅", category: "Rau củ", unit: "quả" },
  "carrot": { name: "Cà rốt", emoji: "🥕", category: "Rau củ", unit: "củ" },
  "onion": { name: "Hành tây", emoji: "🧅", category: "Rau củ", unit: "củ" },
  "garlic": { name: "Tỏi", emoji: "🧄", category: "Gia vị", unit: "củ" },
  "potato": { name: "Khoai tây", emoji: "🥔", category: "Rau củ", unit: "củ" },
  "cucumber": { name: "Dưa leo", emoji: "🥒", category: "Rau củ", unit: "quả" },
  "lettuce": { name: "Rau xà lách", emoji: "🥬", category: "Rau củ", unit: "bó" },
  "cabbage": { name: "Bắp cải", emoji: "🥬", category: "Rau củ", unit: "cái" },
  "broccoli": { name: "Bông cải xanh", emoji: "🥦", category: "Rau củ", unit: "cái" },
  "bell pepper": { name: "Ớt chuông", emoji: "🫑", category: "Rau củ", unit: "quả" },
  "corn": { name: "Bắp ngô", emoji: "🌽", category: "Rau củ", unit: "trái" },
  "mushroom": { name: "Nấm", emoji: "🍄", category: "Rau củ", unit: "gói" },
  "eggplant": { name: "Cà tím", emoji: "🍆", category: "Rau củ", unit: "quả" },
  "asparagus": { name: "Măng tây", emoji: "🌿", category: "Rau củ", unit: "bó" },
  "parsnip": { name: "Củ cải vàng", emoji: "🥕", category: "Rau củ", unit: "củ" },
  "celery": { name: "Cần tây", emoji: "🌿", category: "Rau củ", unit: "bó" },
  "spinach": { name: "Rau chân vịt", emoji: "🥬", category: "Rau củ", unit: "bó" },
  "pumpkin": { name: "Bí đỏ", emoji: "🎃", category: "Rau củ", unit: "quả" },
  "zucchini": { name: "Bí ngòi", emoji: "🥒", category: "Rau củ", unit: "quả" },
  // Trái cây
  "lemon": { name: "Chanh vàng", emoji: "🍋", category: "Trái cây", unit: "quả" },
  "lime": { name: "Chanh xanh", emoji: "🍋", category: "Trái cây", unit: "quả" },
  "apple": { name: "Táo", emoji: "🍎", category: "Trái cây", unit: "quả" },
  "banana": { name: "Chuối", emoji: "🍌", category: "Trái cây", unit: "quả" },
  "orange": { name: "Cam", emoji: "🍊", category: "Trái cây", unit: "quả" },
  "grape": { name: "Nho", emoji: "🍇", category: "Trái cây", unit: "chùm" },
  "watermelon": { name: "Dưa hấu", emoji: "🍉", category: "Trái cây", unit: "quả" },
  "mango": { name: "Xoài", emoji: "🥭", category: "Trái cây", unit: "quả" },
  "pineapple": { name: "Dứa", emoji: "🍍", category: "Trái cây", unit: "quả" },
  "strawberry": { name: "Dâu tây", emoji: "🍓", category: "Trái cây", unit: "quả" },
  "avocado": { name: "Bơ", emoji: "🥑", category: "Trái cây", unit: "quả" },
  "coconut": { name: "Dừa", emoji: "🥥", category: "Trái cây", unit: "quả" },
  "peach": { name: "Đào", emoji: "🍑", category: "Trái cây", unit: "quả" },
  // Thịt & Hải sản
  "meat": { name: "Thịt", emoji: "🥩", category: "Thịt", unit: "kg" },
  "beef": { name: "Thịt bò", emoji: "🥩", category: "Thịt", unit: "kg" },
  "pork": { name: "Thịt heo", emoji: "🥩", category: "Thịt", unit: "kg" },
  "chicken": { name: "Thịt gà", emoji: "🍗", category: "Thịt", unit: "kg" },
  "fish": { name: "Cá", emoji: "🐟", category: "Hải sản", unit: "con" },
  "salmon": { name: "Cá hồi", emoji: "🐟", category: "Hải sản", unit: "miếng" },
  "shrimp": { name: "Tôm", emoji: "🦐", category: "Hải sản", unit: "kg" },
  "crab": { name: "Cua", emoji: "🦀", category: "Hải sản", unit: "con" },
  "squid": { name: "Mực", emoji: "🦑", category: "Hải sản", unit: "con" },
  // Sữa & Trứng
  "egg": { name: "Trứng", emoji: "🥚", category: "Sữa & Trứng", unit: "quả" },
  "milk": { name: "Sữa", emoji: "🥛", category: "Sữa & Trứng", unit: "hộp" },
  "cheese": { name: "Phô mai", emoji: "🧀", category: "Sữa & Trứng", unit: "miếng" },
  "butter": { name: "Bơ lạt", emoji: "🧈", category: "Sữa & Trứng", unit: "hộp" },
  "yogurt": { name: "Sữa chua", emoji: "🥛", category: "Sữa & Trứng", unit: "hộp" },
  // Gia vị
  "pepper": { name: "Tiêu", emoji: "🌶️", category: "Gia vị", unit: "gói" },
  "black pepper": { name: "Tiêu đen", emoji: "🌶️", category: "Gia vị", unit: "gói" },
  "black peppercorns": { name: "Hạt tiêu đen", emoji: "🌶️", category: "Gia vị", unit: "gói" },
  "chili": { name: "Ớt", emoji: "🌶️", category: "Gia vị", unit: "quả" },
  "salt": { name: "Muối", emoji: "🧂", category: "Gia vị", unit: "gói" },
  "sugar": { name: "Đường", emoji: "🍬", category: "Gia vị", unit: "gói" },
  "ginger": { name: "Gừng", emoji: "🫚", category: "Gia vị", unit: "củ" },
  "bay leaves": { name: "Lá nguyệt quế", emoji: "🌿", category: "Gia vị", unit: "gói" },
  "cinnamon": { name: "Quế", emoji: "🌿", category: "Gia vị", unit: "thanh" },
  "basil": { name: "Húng quế", emoji: "🌿", category: "Gia vị", unit: "bó" },
  "parsley": { name: "Rau mùi tây", emoji: "🌿", category: "Gia vị", unit: "bó" },
  // Ngũ cốc & Khác
  "rice": { name: "Gạo", emoji: "🍚", category: "Ngũ cốc", unit: "kg" },
  "bread": { name: "Bánh mì", emoji: "🍞", category: "Ngũ cốc", unit: "ổ" },
  "noodle": { name: "Mì", emoji: "🍜", category: "Ngũ cốc", unit: "gói" },
  "pasta": { name: "Nui", emoji: "🍝", category: "Ngũ cốc", unit: "gói" },
  "flour": { name: "Bột mì", emoji: "🌾", category: "Ngũ cốc", unit: "kg" },
  "tofu": { name: "Đậu hũ", emoji: "🧊", category: "Khác", unit: "miếng" },
  "soy sauce": { name: "Nước tương", emoji: "🫗", category: "Gia vị", unit: "chai" },
  "oil": { name: "Dầu ăn", emoji: "🫒", category: "Gia vị", unit: "chai" },
  "honey": { name: "Mật ong", emoji: "🍯", category: "Gia vị", unit: "chai" },
  "vinegar": { name: "Giấm", emoji: "🫗", category: "Gia vị", unit: "chai" },
};

// Hàm dịch kết quả Cloud Vision sang tiếng Việt
const translateToVietnamese = (englishName) => {
  const key = englishName.toLowerCase().trim();
  
  // Tìm chính xác
  if (TRANSLATION_MAP[key]) return TRANSLATION_MAP[key];
  
  // Tìm theo từ khóa chứa trong tên
  for (const [engKey, viData] of Object.entries(TRANSLATION_MAP)) {
    if (key.includes(engKey) || engKey.includes(key)) return viData;
  }
  
  // Không tìm thấy -> trả về tên gốc với emoji mặc định
  return { name: englishName, emoji: "🥘", category: "Khác", unit: "cái" };
};

const detectLabels = async (imageBuffer) => {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const VISION_KEY = process.env.VISION_API_KEY || GEMINI_KEY;

  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY is missing in environment variables");

  const tryAIs = [
    // 1. Gemini 2.5 Flash (Stable, widely available)
    {
      name: "Gemini 2.5 Flash",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      getBody: (base64) => ({
        contents: [{ parts: [{ text: GEMINI_PROMPT }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }]
      }),
      parser: (data) => {
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error("Gemini 2.5 Flash returned empty content");
        const match = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not parse JSON from Gemini 2.5 Flash response");
        return JSON.parse(match[0]);
      }
    },
    // 2. Gemini 2.0 Flash (Fallback)
    {
      name: "Gemini 2.0 Flash",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      getBody: (base64) => ({
        contents: [{ parts: [{ text: GEMINI_PROMPT }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }]
      }),
      parser: (data) => {
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error("Gemini 2.0 Flash returned empty content");
        const match = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not parse JSON from Gemini 2.0 Flash response");
        return JSON.parse(match[0]);
      }
    },
    // 3. Cloud Vision (uses separate VISION_API_KEY if available) + dịch sang tiếng Việt
    {
      name: "Cloud Vision",
      url: `https://vision.googleapis.com/v1/images:annotate?key=${VISION_KEY}`,
      getBody: (base64) => ({
        requests: [{
          image: { content: base64 },
          features: [{ type: "LABEL_DETECTION", maxResults: 15 }]
        }]
      }),
      parser: (data) => {
        if (!data.responses || !data.responses[0]) throw new Error("Invalid Cloud Vision response format");
        if (data.responses[0].error) throw new Error(`Cloud Vision API Error: ${data.responses[0].error.message}`);
        
        const labels = data.responses[0].labelAnnotations || [];
        if (labels.length === 0) throw new Error("Cloud Vision found no labels");
        
        return {
          ingredients: labels.map(l => {
            const vi = translateToVietnamese(l.description);
            return { name: vi.name, quantity: 1, unit: vi.unit, emoji: vi.emoji, category: vi.category };
          })
        };
      }
    }
  ];

  let errors = [];
  for (const ai of tryAIs) {
    try {
      console.log(`[AI] Đang thử nhận diện với ${ai.name}...`);
      const response = await fetch(ai.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ai.getBody(imageBuffer.toString("base64")))
      });

      const data = await response.json();
      if (data.error) throw new Error(`${ai.name} trả về lỗi: ${data.error.message}`);

      const result = ai.parser(data);
      console.log(`[AI] ${ai.name} thành công!`);
      return { type: "food_image", ...result };
    } catch (error) {
      console.warn(`[AI] ${ai.name} thất bại:`, error.message);
      errors.push(`${ai.name}: ${error.message}`);
    }
  }

  throw new Error(`TẤT CẢ DỊCH VỤ AI ĐỀU THẤT BẠI.\nChi tiết:\n- ${errors.join("\n- ")}\n\nGợi ý: Kiểm tra API Key và đảm bảo Cloud Vision API / Generative Language API đã được bật.`);
};

module.exports = { detectLabels };
