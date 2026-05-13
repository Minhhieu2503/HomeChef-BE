const { GoogleGenAI } = require("@google/genai");

const detectLabels = async (imageBuffer) => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
    throw new Error("GEMINI_API_KEY is not set in environment variables. Please update your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const prompt = `
  You are an expert chef and image analyzer. 
  1. Identify all the food ingredients visible in this image.
  2. Suggest 2 delicious recipes that primarily use these ingredients.
  
  Respond ONLY with a valid JSON object matching this schema. Do not include markdown formatting or backticks, just the raw JSON:
  {
    "ingredients": [
      { "name": "string (vietnamese)", "quantity": "string", "emoji": "string" }
    ],
    "recipes": [
      {
        "id": "string (generate a unique string like r-123)",
        "title": "string (vietnamese)",
        "cookTime": "number (minutes)",
        "calories": "number (kcal)",
        "difficulty": "string (Dễ, Trung bình, Khó)",
        "image": "string (a realistic URL from unsplash representing the dish, e.g. https://images.unsplash.com/photo-...)",
        "steps": [
          { "order": 1, "instruction": "string (vietnamese step by step)" }
        ]
      }
    ]
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        prompt,
        {
          inlineData: {
            data: imageBuffer.toString("base64"),
            mimeType: "image/jpeg"
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    // Clean possible surrounding markdown just in case SDK wrapper leaks backticks
    let text = response.text || "";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to process image with Gemini AI");
  }
};

module.exports = {
  detectLabels
};
