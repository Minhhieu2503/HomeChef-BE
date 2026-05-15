const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Nutrition = require('./src/models/Nutrition');

dotenv.config();

const bulkData = [
  // POULTRY
  { name: 'ức gà', calories: 1.65, category: 'meat', protein: 0.31, fat: 0.04, carbs: 0, unit: 'g' },
  { name: 'đùi gà', calories: 2.09, category: 'meat', protein: 0.26, fat: 0.11, carbs: 0, unit: 'g' },
  { name: 'cánh gà', calories: 2.03, category: 'meat', protein: 0.27, fat: 0.10, carbs: 0, unit: 'g' },
  { name: 'gà nguyên con', calories: 2.15, category: 'meat', protein: 0.27, fat: 0.12, carbs: 0, unit: 'g' },
  { name: 'lườn gà', calories: 1.10, category: 'meat', protein: 0.23, fat: 0.01, carbs: 0, unit: 'g' },
  { name: 'gan gà', calories: 1.19, category: 'meat', protein: 0.17, fat: 0.05, carbs: 0.01, unit: 'g' },
  { name: 'thịt vịt', calories: 3.37, category: 'meat', protein: 0.19, fat: 0.28, carbs: 0, unit: 'g' },
  { name: 'thịt ngan', calories: 1.58, category: 'meat', protein: 0.21, fat: 0.08, carbs: 0, unit: 'g' },
  { name: 'thịt ngỗng', calories: 2.38, category: 'meat', protein: 0.23, fat: 0.16, carbs: 0, unit: 'g' },
  { name: 'thịt chim cút', calories: 1.34, category: 'meat', protein: 0.22, fat: 0.05, carbs: 0, unit: 'g' },

  // PORK
  { name: 'thịt lợn nạc', calories: 2.42, category: 'meat', protein: 0.27, fat: 0.14, carbs: 0, unit: 'g' },
  { name: 'ba chỉ lợn', calories: 5.18, category: 'meat', protein: 0.09, fat: 0.53, carbs: 0, unit: 'g' },
  { name: 'sườn lợn', calories: 2.47, category: 'meat', protein: 0.18, fat: 0.19, carbs: 0, unit: 'g' },
  { name: 'giò heo', calories: 2.30, category: 'meat', protein: 0.20, fat: 0.16, carbs: 0, unit: 'g' },
  { name: 'nạc vai lợn', calories: 2.15, category: 'meat', protein: 0.22, fat: 0.13, carbs: 0, unit: 'g' },
  { name: 'thăn lợn', calories: 1.43, category: 'meat', protein: 0.26, fat: 0.03, carbs: 0, unit: 'g' },
  { name: 'chả lụa', calories: 2.70, category: 'meat', protein: 0.14, fat: 0.19, carbs: 0.05, unit: 'g' },
  { name: 'xúc xích', calories: 3.01, category: 'meat', protein: 0.11, fat: 0.27, carbs: 0.03, unit: 'g' },
  { name: 'gan lợn', calories: 1.35, category: 'meat', protein: 0.21, fat: 0.04, carbs: 0.04, unit: 'g' },
  { name: 'lòng lợn', calories: 0.97, category: 'meat', protein: 0.17, fat: 0.03, carbs: 0, unit: 'g' },
  { name: 'dạ dày lợn', calories: 1.54, category: 'meat', protein: 0.18, fat: 0.09, carbs: 0, unit: 'g' },
  { name: 'tai lợn', calories: 2.56, category: 'meat', protein: 0.21, fat: 0.18, carbs: 0, unit: 'g' },
  { name: 'chân giò', calories: 2.10, category: 'meat', protein: 0.19, fat: 0.13, carbs: 0, unit: 'g' },

  // BEEF
  { name: 'thịt bò thăn', calories: 2.50, category: 'meat', protein: 0.26, fat: 0.15, carbs: 0, unit: 'g' },
  { name: 'bắp bò', calories: 2.01, category: 'meat', protein: 0.34, fat: 0.06, carbs: 0, unit: 'g' },
  { name: 'thịt bò nạc', calories: 1.98, category: 'meat', protein: 0.31, fat: 0.07, carbs: 0, unit: 'g' },
  { name: 'thịt bò xay', calories: 2.54, category: 'meat', protein: 0.26, fat: 0.15, carbs: 0, unit: 'g' },
  { name: 'gầu bò', calories: 3.40, category: 'meat', protein: 0.21, fat: 0.28, carbs: 0, unit: 'g' },
  { name: 'nạm bò', calories: 2.60, category: 'meat', protein: 0.24, fat: 0.16, carbs: 0, unit: 'g' },
  { name: 'xương bò', calories: 1.20, category: 'meat', protein: 0.10, fat: 0.09, carbs: 0, unit: 'g' },
  { name: 'lưỡi bò', calories: 2.72, category: 'meat', protein: 0.19, fat: 0.20, carbs: 0, unit: 'g' },
  { name: 'thịt trâu', calories: 1.74, category: 'meat', protein: 0.31, fat: 0.04, carbs: 0, unit: 'g' },

  // SEAFOOD
  { name: 'tôm tươi', calories: 0.99, category: 'meat', protein: 0.24, fat: 0.01, carbs: 0, unit: 'g' },
  { name: 'tôm sú', calories: 1.06, category: 'meat', protein: 0.22, fat: 0.02, carbs: 0, unit: 'g' },
  { name: 'tôm khô', calories: 2.95, category: 'meat', protein: 0.63, fat: 0.04, carbs: 0, unit: 'g' },
  { name: 'mực', calories: 0.92, category: 'meat', protein: 0.16, fat: 0.01, carbs: 0.03, unit: 'g' },
  { name: 'bạch tuộc', calories: 0.82, category: 'meat', protein: 0.15, fat: 0.01, carbs: 0.02, unit: 'g' },
  { name: 'cua biển', calories: 0.87, category: 'meat', protein: 0.18, fat: 0.01, carbs: 0, unit: 'g' },
  { name: 'cua đồng', calories: 0.76, category: 'meat', protein: 0.12, fat: 0.03, carbs: 0, unit: 'g' },
  { name: 'cá hồi', calories: 2.08, category: 'meat', protein: 0.20, fat: 0.13, carbs: 0, unit: 'g' },
  { name: 'cá ngừ', calories: 1.32, category: 'meat', protein: 0.28, fat: 0.01, carbs: 0, unit: 'g' },
  { name: 'cá basa', calories: 1.11, category: 'meat', protein: 0.18, fat: 0.05, carbs: 0, unit: 'g' },
  { name: 'cá chép', calories: 1.27, category: 'meat', protein: 0.18, fat: 0.06, carbs: 0, unit: 'g' },
  { name: 'cá lóc', calories: 0.84, category: 'meat', protein: 0.19, fat: 0.01, carbs: 0, unit: 'g' },
  { name: 'hàu', calories: 0.69, category: 'meat', protein: 0.09, fat: 0.02, carbs: 0.04, unit: 'g' },
  { name: 'nghêu', calories: 0.74, category: 'meat', protein: 0.13, fat: 0.01, carbs: 0.03, unit: 'g' },
  { name: 'ốc', calories: 0.90, category: 'meat', protein: 0.16, fat: 0.01, carbs: 0.02, unit: 'g' },

  // EGGS
  { name: 'trứng gà', calories: 70, category: 'meat', protein: 6, fat: 5, carbs: 0.4, unit: 'unit' },
  { name: 'trứng vịt', calories: 130, category: 'meat', protein: 9, fat: 10, carbs: 1, unit: 'unit' },
  { name: 'trứng cút', calories: 14, category: 'meat', protein: 1.2, fat: 1, carbs: 0.04, unit: 'unit' },
  { name: 'trứng vịt lộn', calories: 182, category: 'meat', protein: 13, fat: 12, carbs: 3, unit: 'unit' },

  // CARBS
  { name: 'cơm trắng', calories: 1.30, category: 'carb', carbs: 0.28, protein: 0.03, fat: 0, unit: 'g' },
  { name: 'gạo lứt', calories: 1.11, category: 'carb', carbs: 0.23, protein: 0.03, fat: 0, unit: 'g' },
  { name: 'bún tươi', calories: 1.10, category: 'carb', carbs: 0.25, protein: 0.02, fat: 0, unit: 'g' },
  { name: 'phở tươi', calories: 1.23, category: 'carb', carbs: 0.28, protein: 0.03, fat: 0, unit: 'g' },
  { name: 'mì tôm', calories: 4.50, category: 'carb', carbs: 0.60, fat: 0.18, protein: 0.09, unit: 'g' },
  { name: 'mì ý', calories: 1.58, category: 'carb', carbs: 0.31, protein: 0.06, fat: 0.01, unit: 'g' },
  { name: 'bánh mì', calories: 2.65, category: 'carb', carbs: 0.49, protein: 0.09, fat: 0.03, unit: 'g' },
  { name: 'khoai tây', calories: 0.77, category: 'carb', carbs: 0.17, protein: 0.02, fat: 0, unit: 'g' },
  { name: 'khoai lang', calories: 0.86, category: 'carb', carbs: 0.20, protein: 0.02, fat: 0, unit: 'g' },
  { name: 'yến mạch', calories: 3.89, category: 'carb', carbs: 0.66, protein: 0.17, fat: 0.07, unit: 'g' },
  { name: 'ngô', calories: 0.86, category: 'carb', carbs: 0.19, protein: 0.03, fat: 0.01, unit: 'g' },
  { name: 'bánh chưng', calories: 2.50, category: 'carb', carbs: 0.30, protein: 0.09, fat: 0.10, unit: 'g' },
  { name: 'bánh cuốn', calories: 1.80, category: 'carb', carbs: 0.35, protein: 0.05, fat: 0.01, unit: 'g' },
  { name: 'miến dong', calories: 3.40, category: 'carb', carbs: 0.83, protein: 0.01, fat: 0, unit: 'g' },

  // VEGETABLES
  { name: 'xà lách', calories: 0.15, category: 'vegetable', carbs: 0.03, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'súp lơ xanh', calories: 0.34, category: 'vegetable', carbs: 0.07, protein: 0.03, fat: 0, unit: 'g' },
  { name: 'cà rốt', calories: 0.41, category: 'vegetable', carbs: 0.10, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'cà chua', calories: 0.18, category: 'vegetable', carbs: 0.04, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'dưa chuột', calories: 0.15, category: 'vegetable', carbs: 0.04, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'rau muống', calories: 0.19, category: 'vegetable', carbs: 0.03, protein: 0.03, fat: 0, unit: 'g' },
  { name: 'rau cải', calories: 0.22, category: 'vegetable', carbs: 0.04, protein: 0.02, fat: 0, unit: 'g' },
  { name: 'giá đỗ', calories: 0.30, category: 'vegetable', carbs: 0.06, protein: 0.03, fat: 0, unit: 'g' },
  { name: 'nấm hương', calories: 0.34, category: 'vegetable', carbs: 0.07, protein: 0.03, fat: 0, unit: 'g' },
  { name: 'bí đỏ', calories: 0.26, category: 'vegetable', carbs: 0.06, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'ớt chuông', calories: 0.26, category: 'vegetable', carbs: 0.06, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'hành tây', calories: 0.40, category: 'vegetable', carbs: 0.09, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'tỏi', calories: 1.49, category: 'vegetable', carbs: 0.33, protein: 0.06, fat: 0, unit: 'g' },
  { name: 'gừng', calories: 0.80, category: 'vegetable', carbs: 0.18, protein: 0.02, fat: 0, unit: 'g' },

  // FRUITS
  { name: 'bơ', calories: 1.60, category: 'fruit', fat: 0.15, carbs: 0.09, protein: 0.02, unit: 'g' },
  { name: 'chuối', calories: 0.89, category: 'fruit', carbs: 0.23, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'táo', calories: 0.52, category: 'fruit', carbs: 0.14, protein: 0, fat: 0, unit: 'g' },
  { name: 'xoài', calories: 0.60, category: 'fruit', carbs: 0.15, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'dưa hấu', calories: 0.30, category: 'fruit', carbs: 0.08, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'cam', calories: 0.47, category: 'fruit', carbs: 0.12, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'sầu riêng', calories: 1.47, category: 'fruit', carbs: 0.27, fat: 0.05, protein: 0.02, unit: 'g' },
  { name: 'thanh long', calories: 0.60, category: 'fruit', carbs: 0.13, protein: 0.01, fat: 0, unit: 'g' },
  { name: 'ổi', calories: 0.68, category: 'fruit', carbs: 0.14, protein: 0.03, fat: 0.01, unit: 'g' },

  // DAIRY
  { name: 'sữa tươi', calories: 0.62, category: 'dairy', protein: 0.03, fat: 0.03, carbs: 0.05, unit: 'g' },
  { name: 'sữa chua', calories: 0.59, category: 'dairy', protein: 0.04, fat: 0.01, carbs: 0.08, unit: 'g' },
  { name: 'phô mai', calories: 4.02, category: 'dairy', protein: 0.25, fat: 0.33, carbs: 0.01, unit: 'g' },
  { name: 'bơ lạt', calories: 7.17, category: 'dairy', protein: 0.01, fat: 0.81, carbs: 0.01, unit: 'g' },

  // SPICES
  { name: 'dầu ăn', calories: 120, category: 'spice', fat: 14, carbs: 0, protein: 0, unit: 'spoon' },
  { name: 'đường', calories: 45, category: 'spice', carbs: 12, protein: 0, fat: 0, unit: 'spoon' },
  { name: 'nước mắm', calories: 15, category: 'spice', protein: 2, carbs: 1, fat: 0, unit: 'spoon' },
  { name: 'xì dầu', calories: 10, category: 'spice', protein: 1, carbs: 1, fat: 0, unit: 'spoon' },
  { name: 'tương ớt', calories: 20, category: 'spice', carbs: 4, protein: 0, fat: 0, unit: 'spoon' },
  { name: 'dầu hào', calories: 25, category: 'spice', carbs: 5, protein: 1, fat: 0, unit: 'spoon' },
  { name: 'mật ong', calories: 60, category: 'spice', carbs: 17, protein: 0, fat: 0, unit: 'spoon' },
  { name: 'sốt mè rang', calories: 55, category: 'spice', fat: 5, protein: 1, carbs: 2, unit: 'spoon' },
  { name: 'mayonnaise', calories: 90, category: 'spice', fat: 10, protein: 0, carbs: 0, unit: 'spoon' },

  // OTHERS
  { name: 'đậu phụ', calories: 0.76, category: 'other', protein: 0.08, fat: 0.04, carbs: 0.02, unit: 'g' },
  { name: 'đậu phộng', calories: 5.67, category: 'other', protein: 0.26, fat: 0.49, carbs: 0.16, unit: 'g' },
  { name: 'hạt điều', calories: 5.53, category: 'other', protein: 0.18, fat: 0.44, carbs: 0.30, unit: 'g' },
  { name: 'hạt chia', calories: 4.86, category: 'other', protein: 0.17, fat: 0.31, carbs: 0.42, unit: 'g' }
];

async function seedBulkNutrition() {
  try {
    const uri = process.env.MONGODB_URI;
    await mongoose.connect(uri);
    console.log('Connected to Atlas for final bulk seeding');

    await Nutrition.deleteMany({});
    
    const count = await Nutrition.insertMany(bulkData);
    console.log(`✅ Success! Seeded ${count.length} comprehensive nutritional items.`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
}

seedBulkNutrition();
