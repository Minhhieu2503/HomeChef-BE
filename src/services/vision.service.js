const fetch = require("node-fetch");

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
        contents: [{ parts: [{ text: "List food items in image as JSON: {\"ingredients\":[{\"name\":\"..\"}]}" }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }]
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
        contents: [{ parts: [{ text: "List food items in image as JSON: {\"ingredients\":[{\"name\":\"..\"}]}" }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }]
      }),
      parser: (data) => {
        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) throw new Error("Gemini 2.0 Flash returned empty content");
        const match = data.candidates[0].content.parts[0].text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("Could not parse JSON from Gemini 2.0 Flash response");
        return JSON.parse(match[0]);
      }
    },
    // 3. Cloud Vision (uses separate VISION_API_KEY if available)
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
        
        return { ingredients: labels.map(l => ({ name: l.description, quantity: 1, unit: "cái", emoji: "🥘", category: "Other" })) };
      }
    }
  ];

  let errors = [];
  for (const ai of tryAIs) {
    try {
      console.log(`[AI] Attempting detection with ${ai.name}...`);
      const response = await fetch(ai.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ai.getBody(imageBuffer.toString("base64")))
      });

      const data = await response.json();
      if (data.error) throw new Error(`${ai.name} returned error: ${data.error.message}`);

      const result = ai.parser(data);
      console.log(`[AI] ${ai.name} succeeded!`);
      return { type: "food_image", ...result };
    } catch (error) {
      console.warn(`[AI] ${ai.name} failed:`, error.message);
      errors.push(`${ai.name}: ${error.message}`);
    }
  }

  throw new Error(`ALL AI SERVICES FAILED.\nDetails:\n- ${errors.join("\n- ")}\n\nRecommendation: Check API Key restrictions and ensure Cloud Vision API / Generative Language API are enabled.`);
};

module.exports = { detectLabels };
