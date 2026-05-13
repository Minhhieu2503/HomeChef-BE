/**
 * Quick test to verify Google Cloud Vision API service account works
 */
const vision = require("@google-cloud/vision");
const path = require("path");

const keyFilePath = path.join(__dirname, "homechef-495504-a3e6383817e6.json");

async function testVisionAPI() {
  try {
    console.log("🔄 Testing Google Cloud Vision API connection...\n");

    // Create client with service account key
    const client = new vision.ImageAnnotatorClient({
      keyFilename: keyFilePath,
    });

    // Test with a sample food image URL
    const testImageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=60";

    console.log("📸 Analyzing image:", testImageUrl);
    const [result] = await client.labelDetection(testImageUrl);
    const labels = result.labelAnnotations;

    if (labels && labels.length > 0) {
      console.log("\n✅ Vision API is WORKING! Detected labels:\n");
      labels.forEach((label) => {
        console.log(`   • ${label.description} (${(label.score * 100).toFixed(1)}%)`);
      });
    } else {
      console.log("⚠️ API responded but no labels detected.");
    }

    console.log("\n🎉 Service account is valid and Vision API is active!");
  } catch (error) {
    console.error("\n❌ Vision API test FAILED:");
    console.error(`   Error: ${error.message}`);

    if (error.code === 7) {
      console.error("   → Vision API is NOT enabled for this project.");
      console.error("   → Go to: https://console.cloud.google.com/apis/library/vision.googleapis.com");
    } else if (error.code === 16) {
      console.error("   → Service account credentials are INVALID or EXPIRED.");
    } else if (error.message.includes("ENOTFOUND")) {
      console.error("   → No internet connection.");
    }
  }
}

testVisionAPI();
