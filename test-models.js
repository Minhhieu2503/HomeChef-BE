
require("dotenv").config();
const fetch = require("node-fetch");

async function checkModels() {
  const GEMINI_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_KEY) {
    console.error("No API key");
    return;
  }
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEY}`);
    const data = await res.json();
    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => console.log(m.name, m.supportedGenerationMethods));
    } else {
      console.log("Response:", data);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

checkModels();
