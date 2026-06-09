const fetch = require("node-fetch");
require("dotenv").config();

async function testFetchModels() {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    console.error("GEMINI_API_KEY is missing");
    return;
  }

  // List of models to try
  const models = [
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-3.5-flash-latest",
    "gemini-3.1-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest",
    "gemini-pro-latest"
  ];

  const body = {
    contents: [{ parts: [{ text: "Say hello in 1 word." }] }]
  };

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
    try {
      console.log(`Testing model: ${model}`);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        console.log(`✅ SUCCESS with ${model}:`, JSON.stringify(data.candidates?.[0]?.content?.parts?.[0]?.text));
      } else {
        console.log(`❌ FAILED with ${model}: Status ${res.status}, Error: ${data.error?.message || JSON.stringify(data)}`);
      }
    } catch (err) {
      console.log(`💥 ERROR with ${model}:`, err.message);
    }
  }
}

testFetchModels();
