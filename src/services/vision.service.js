const fetch = require("node-fetch");

// Prompt yêu cầu Gemini trả kết quả tiếng Việt + emoji phù hợp và sáng tạo công thức nấu ăn
const GEMINI_PROMPT = `Hãy nhận diện tất cả nguyên liệu thực phẩm trong hình ảnh này.
Từ những nguyên liệu nhận diện được, hãy sáng tạo ra 2 công thức nấu ăn phù hợp nhất. Nếu nguyên liệu là bộ phận cụ thể (đùi gà, ức gà, sườn non), hãy gợi ý các món tổng quát tương ứng (món gà, món sườn) để linh hoạt nhất.

Trả về kết quả dưới dạng JSON với format chính xác sau:
{
  "ingredients": [
    {"name": "Tên tiếng Việt", "quantity": 1, "unit": "đơn vị phù hợp", "emoji": "emoji phù hợp", "category": "Danh mục", "shelfLifeDays": 7}
  ],
  "recipes": [
    {
      "title": "Tên món ăn (Ví dụ: Đùi gà sốt tiêu đen)",
      "cookTime": 25,
      "calories": 350,
      "difficulty": "Dễ",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      "steps": [
        {"order": 1, "instruction": "Bước 1..."}
      ]
    }
  ]
}

Quy tắc:
- "name": Tên nguyên liệu bằng TIẾNG VIỆT (ví dụ: "Cà chua", "Thịt bò", "Hành tây")
- "unit": Đơn vị phù hợp (quả, kg, bó, gói, hộp, chai, lon, lát, miếng, con, bịch, trái)
- "emoji": Emoji phù hợp với từng nguyên liệu (🍅🥕🧅🥩🍗🐟🥚🧀🥛🍋🌶️🧄🥒🍆🥦🥬🍌🍎🫑🥔🌽🍄🥜🫘🍞🍚🧈🫒🥫🍯)
- "category": Một trong các danh mục: "Rau củ", "Trái cây", "Thịt", "Hải sản", "Gia vị", "Sữa & Trứng", "Ngũ cốc", "Đồ uống", "Đồ hộp", "Khác"
- "shelfLifeDays": Ước lượng số ngày bảo quản an toàn trong tủ lạnh hoặc điều kiện lưu trữ phù hợp (ví dụ: thịt tươi/hải sản: 3, rau củ: 7, sữa/trứng: 10, đồ khô/gia vị: 30)

CHỈ trả về JSON nguyên gốc, không dùng markdown code block, không giải thích thêm.`;

// Prompt dành riêng cho việc nhận diện hóa đơn/bill đi chợ
const BILL_PROMPT = `Hãy nhận diện tất cả các mặt hàng thực phẩm từ hình ảnh hóa đơn/receipt mua sắm này.
Với mỗi mặt hàng thực phẩm tìm thấy, trích xuất tên nguyên liệu, số lượng mua, đơn vị, và ước lượng số ngày bảo quản.

Trả về kết quả dưới dạng JSON với format chính xác sau:
{
  "ingredients": [
    {"name": "Tên tiếng Việt", "quantity": 1, "unit": "đơn vị phù hợp", "emoji": "emoji phù hợp", "category": "Danh mục", "shelfLifeDays": 7}
  ]
}

Quy tắc:
- "name": Tên nguyên liệu bằng TIẾNG VIỆT (ví dụ: "Sữa tươi", "Trứng gà", "Cà chua"). Bỏ qua hoàn toàn các mặt hàng tiêu dùng không ăn được (ví dụ: bột giặt, giấy vệ sinh).
- "unit": Đơn vị phù hợp (quả, cái, hộp, chai, lon, kg, g, túi, gói, bịch, lít, ml)
- "emoji": Emoji phù hợp với từng nguyên liệu
- "category": Một trong các danh mục: "Rau củ", "Trái cây", "Thịt", "Hải sản", "Gia vị", "Sữa & Trứng", "Ngũ cốc", "Đồ uống", "Đồ hộp", "Khác"
- "shelfLifeDays": Ước lượng số ngày bảo quản an toàn trong tủ lạnh (thịt tươi/hải sản: 3, rau củ: 7, sữa/trứng: 10, đồ khô/gia vị: 30)

CHỈ trả về JSON nguyên gốc, không dùng markdown code block, không giải thích thêm.`;

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

const detectLabels = async (imageBuffer, type = "fridge") => {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  const VISION_KEY = process.env.VISION_API_KEY || GEMINI_KEY;

  if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY is missing in environment variables");

  const promptText = type === "bill" ? BILL_PROMPT : GEMINI_PROMPT;

  const tryAIs = [
    // 1. Gemini 3.5 Flash (Newest, stable)
    {
      name: "Gemini 3.5 Flash",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_KEY}`,
      getBody: (base64) => ({
        contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }]
      }),
      parser: (data) => {
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error("Gemini 3.5 Flash returned empty content");
        const match = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not parse JSON from Gemini 3.5 Flash response");
        return JSON.parse(match[0]);
      }
    },
    // 2. Gemini Flash Latest (Auto-routing)
    {
      name: "Gemini Flash Latest",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_KEY}`,
      getBody: (base64) => ({
        contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }]
      }),
      parser: (data) => {
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error("Gemini Flash Latest returned empty content");
        const match = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not parse JSON from Gemini Flash Latest response");
        return JSON.parse(match[0]);
      }
    },
    // 3. Gemini 2.5 Flash
    {
      name: "Gemini 2.5 Flash",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      getBody: (base64) => ({
        contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }]
      }),
      parser: (data) => {
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error("Gemini 2.5 Flash returned empty content");
        const match = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not parse JSON from Gemini 2.5 Flash response");
        return JSON.parse(match[0]);
      }
    },
    // 4. Gemini 2.0 Flash
    {
      name: "Gemini 2.0 Flash",
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      getBody: (base64) => ({
        contents: [{ parts: [{ text: promptText }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }]
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
            let shelfLifeDays = 7;
            const cat = vi.category;
            if (cat === "Thịt" || cat === "Hải sản") {
              shelfLifeDays = 3;
            } else if (cat === "Sữa & Trứng") {
              shelfLifeDays = 10;
            } else if (cat === "Gia vị" || cat === "Ngũ cốc" || cat === "Đồ hộp") {
              shelfLifeDays = 30;
            }
            return { 
              name: vi.name, 
              quantity: 1, 
              unit: vi.unit, 
              emoji: vi.emoji, 
              category: vi.category,
              shelfLifeDays: shelfLifeDays 
            };
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
      return { type, ...result };
    } catch (error) {
      console.warn(`[AI] ${ai.name} thất bại:`, error.message);
      errors.push(`${ai.name}: ${error.message}`);
    }
  }

  throw new Error(`TẤT CẢ DỊCH VỤ AI ĐỀU THẤT BẠI.\nChi tiết:\n- ${errors.join("\n- ")}\n\nGợi ý: Kiểm tra API Key và đảm bảo Cloud Vision API / Generative Language API đã được bật.`);
};

module.exports = { detectLabels };
