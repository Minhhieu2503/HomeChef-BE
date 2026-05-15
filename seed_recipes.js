const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Recipe = require('./src/models/Recipe');

dotenv.config();

const recipes = [
  {
    title: "Sườn Xào Chua Ngọt",
    description: "Món ăn quốc hồn quốc túy với vị chua ngọt hài hòa, sườn mềm thấm vị.",
    category: "main",
    cookTime: 45,
    difficulty: "Medium",
    calories: 450,
    image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?w=800",
    ingredients: [
      { name: "Sườn non", quantity: "500g" },
      { name: "Hành khô", quantity: "2 củ" },
      { name: "Giấm táo", quantity: "3 muỗng" },
      { name: "Đường", quantity: "2 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Rửa sạch sườn, chần qua nước sôi để khử mùi hôi.",
        image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Rán sườn vàng đều các mặt.",
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400",
        video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      },
      {
        order: 3,
        instruction: "Pha nước sốt chua ngọt và đun cùng sườn đến khi sệt lại.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Salad Ức Gà Healthy",
    description: "Bữa ăn nhẹ nhàng, giàu protein và chất xơ cho người tập gym.",
    category: "breakfast",
    cookTime: 20,
    difficulty: "Easy",
    calories: 280,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    ingredients: [
      { name: "Ức gà", quantity: "200g" },
      { name: "Xà lách", quantity: "100g" },
      { name: "Cà chua bi", quantity: "50g" },
      { name: "Sốt mè rang", quantity: "2 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Áp chảo ức gà với một ít muối và tiêu cho đến khi chín vàng.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Cắt nhỏ rau củ và trộn đều cùng nước sốt.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Đậu Phụ Tứ Xuyên (Chay)",
    description: "Vị cay nồng đặc trưng, đậu phụ mềm mịn tan trong miệng.",
    category: "vegetarian",
    cookTime: 25,
    difficulty: "Medium",
    calories: 220,
    image: "https://images.unsplash.com/photo-1546069901-e516a667d697?w=800",
    ingredients: [
      { name: "Đậu phụ non", quantity: "300g" },
      { name: "Nấm hương", quantity: "50g" },
      { name: "Sa tế chay", quantity: "1 muỗng" },
      { name: "Hành lá", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Cắt đậu phụ thành khối vuông nhỏ vừa ăn.",
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Xào thơm nấm và gia vị, sau đó cho đậu phụ vào đun nhỏ lửa.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Sinh Tố Bơ Hạt Chia",
    description: "Thức uống bổ dưỡng, cung cấp chất béo tốt và năng lượng.",
    category: "drink",
    cookTime: 10,
    difficulty: "Easy",
    calories: 320,
    image: "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=800",
    ingredients: [
      { name: "Bơ chín", quantity: "1 quả" },
      { name: "Sữa tươi", quantity: "150ml" },
      { name: "Hạt chia", quantity: "1 muỗng" },
      { name: "Mật ong", quantity: "1 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Cho bơ, sữa và mật ong vào máy xay sinh tố xay nhuyễn.",
        image: "https://images.unsplash.com/photo-1610970881699-44a5586930b2?w=400",
        video: "https://www.youtube.com/watch?v=kYv9yYVq2rU"
      },
      {
        order: 2,
        instruction: "Rắc hạt chia lên trên và thưởng thức lạnh.",
        image: "https://images.unsplash.com/photo-1594910357426-91f3459b15d1?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Chè Dưỡng Nhan",
    description: "Món tráng miệng thanh mát, giúp đẹp da và bồi bổ sức khỏe.",
    category: "dessert",
    cookTime: 60,
    difficulty: "Hard",
    calories: 180,
    image: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=800",
    ingredients: [
      { name: "Kỷ tử", quantity: "10g" },
      { name: "Táo đỏ", quantity: "20g" },
      { name: "Nhựa đào", quantity: "10g" },
      { name: "Đường phèn", quantity: "50g" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Ngâm nhựa đào qua đêm cho nở hoàn toàn.",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Nấu táo đỏ và kỷ tử trước, sau đó cho nhựa đào vào đun thêm 15 phút.",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },

  // ================================================================
  // MÓN CHÍNH (MAIN DISHES)
  // ================================================================
  {
    title: "Phở Bò Hà Nội",
    description: "Tô phở truyền thống với nước dùng trong vắt, thịt bò mềm và bánh phở dai ngon.",
    category: "main",
    cookTime: 180,
    difficulty: "Hard",
    calories: 520,
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800",
    ingredients: [
      { name: "Xương bò", quantity: "1kg" },
      { name: "Thịt bò thăn", quantity: "300g" },
      { name: "Bánh phở tươi", quantity: "400g" },
      { name: "Hành tây", quantity: "2 củ" },
      { name: "Gừng", quantity: "50g" },
      { name: "Quế, hồi, thảo quả", quantity: "1 gói" },
      { name: "Hành lá, ngò rí", quantity: "1 ít" },
      { name: "Nước mắm", quantity: "3 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Chần xương bò qua nước sôi, rửa sạch rồi cho vào nồi đun với 3 lít nước.",
        image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Nướng hành tây và gừng cho thơm rồi cho vào nồi nước dùng cùng gói gia vị.",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Hầm nước dùng ít nhất 3 tiếng, nêm nước mắm và muối vừa ăn.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      },
      {
        order: 4,
        instruction: "Trụng bánh phở, xếp thịt bò thái mỏng lên trên, chan nước dùng sôi và rắc hành lá.",
        image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Bún Bò Huế",
    description: "Tô bún đậm đà với nước dùng cay nồng đặc trưng của xứ Huế.",
    category: "main",
    cookTime: 150,
    difficulty: "Hard",
    calories: 580,
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=800",
    ingredients: [
      { name: "Xương bò", quantity: "500g" },
      { name: "Giò heo", quantity: "500g" },
      { name: "Thịt bò", quantity: "300g" },
      { name: "Bún tươi", quantity: "400g" },
      { name: "Sả", quantity: "3 cây" },
      { name: "Mắm ruốc", quantity: "2 muỗng" },
      { name: "Ớt sa tế", quantity: "2 muỗng" },
      { name: "Hành tây, hành lá", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Hầm xương bò và giò heo lấy nước dùng trong khoảng 2 tiếng.",
        image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Phi thơm sả băm, cho mắm ruốc và sa tế vào xào rồi đổ vào nồi nước dùng.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Trụng bún, xếp thịt và giò heo vào tô, chan nước dùng nóng hổi lên trên.",
        image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Cơm Tấm Sườn Bì Chả",
    description: "Đặc sản Sài Gòn với sườn nướng thơm lừng, bì giòn và chả trứng béo ngậy.",
    category: "main",
    cookTime: 60,
    difficulty: "Medium",
    calories: 650,
    image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800",
    ingredients: [
      { name: "Gạo tấm", quantity: "300g" },
      { name: "Sườn non", quantity: "400g" },
      { name: "Bì heo", quantity: "100g" },
      { name: "Trứng gà", quantity: "3 quả" },
      { name: "Nước mắm", quantity: "3 muỗng" },
      { name: "Đường", quantity: "2 muỗng" },
      { name: "Sả, tỏi", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Ướp sườn với nước mắm, đường, sả và tỏi băm trong 30 phút.",
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Nướng sườn trên bếp than hoặc lò nướng đến khi vàng thơm.",
        image: "https://images.unsplash.com/photo-1544124499-58912cbddaad?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Hấp chả trứng và nấu cơm tấm. Dọn ra đĩa cùng bì và đồ chua.",
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Cá Kho Tộ",
    description: "Cá kho đậm đà trong nồi đất, thịt cá chắc thơm ngon ăn với cơm trắng.",
    category: "main",
    cookTime: 50,
    difficulty: "Easy",
    calories: 380,
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
    ingredients: [
      { name: "Cá lóc hoặc cá trê", quantity: "500g" },
      { name: "Nước mắm", quantity: "3 muỗng" },
      { name: "Đường", quantity: "2 muỗng" },
      { name: "Nước dừa", quantity: "200ml" },
      { name: "Tỏi, ớt", quantity: "1 ít" },
      { name: "Tiêu", quantity: "1 muỗng cà phê" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Làm sạch cá, ướp với nước mắm, đường, tỏi và tiêu trong 15 phút.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Thắng một ít đường cho đến khi chuyển màu caramel vàng.",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Cho cá vào nồi đất, đổ nước dừa vào và kho trên lửa nhỏ khoảng 30 phút.",
        image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Thịt Kho Trứng",
    description: "Món kho quen thuộc ngày Tết với thịt ba chỉ mềm béo và trứng vịt đậm đà.",
    category: "main",
    cookTime: 90,
    difficulty: "Easy",
    calories: 520,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    ingredients: [
      { name: "Thịt ba chỉ", quantity: "500g" },
      { name: "Trứng vịt", quantity: "6 quả" },
      { name: "Nước dừa", quantity: "300ml" },
      { name: "Nước mắm", quantity: "3 muỗng" },
      { name: "Đường", quantity: "2 muỗng" },
      { name: "Tỏi, hành khô", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Cắt thịt thành miếng vừa ăn, ướp với nước mắm, đường, tỏi trong 20 phút.",
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Luộc trứng vịt chín, bóc vỏ để riêng.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Phi hành tỏi thơm, cho thịt vào xào săn rồi đổ nước dừa vào kho lửa nhỏ 60 phút. Cho trứng vào kho cùng thêm 15 phút.",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Canh Chua Cá",
    description: "Canh chua cá đặc trưng miền Nam với vị chua thanh từ cà chua và thơm.",
    category: "main",
    cookTime: 30,
    difficulty: "Easy",
    calories: 290,
    image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800",
    ingredients: [
      { name: "Cá lóc", quantity: "400g" },
      { name: "Cà chua", quantity: "2 quả" },
      { name: "Dứa", quantity: "100g" },
      { name: "Giá đỗ", quantity: "50g" },
      { name: "Đậu bắp", quantity: "3 quả" },
      { name: "Me", quantity: "30g" },
      { name: "Nước mắm", quantity: "2 muỗng" },
      { name: "Hành lá, ngò om", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Nấu nước me lấy nước chua, nêm nước mắm và đường vừa ăn.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Cho cà chua và dứa vào nồi nước chua đun sôi, rồi thả cá vào nấu chín.",
        image: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Cho giá, đậu bắp vào, tắt bếp và rắc hành lá cùng ngò om lên trên.",
        image: "https://images.unsplash.com/photo-1547592180089-23c63e1d1c5a?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Gà Kho Gừng",
    description: "Món gà kho đậm đà, thơm nồng mùi gừng, ăn kèm cơm trắng rất ngon.",
    category: "main",
    cookTime: 40,
    difficulty: "Easy",
    calories: 410,
    image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800",
    ingredients: [
      { name: "Gà chặt miếng", quantity: "600g" },
      { name: "Gừng", quantity: "50g" },
      { name: "Nước mắm", quantity: "3 muỗng" },
      { name: "Đường", quantity: "1 muỗng" },
      { name: "Tỏi, hành khô", quantity: "1 ít" },
      { name: "Tiêu", quantity: "1 muỗng cà phê" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Ướp gà với nước mắm, đường, gừng thái sợi và tiêu trong 20 phút.",
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Phi hành tỏi thơm, cho gà vào xào đến khi săn mặt.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Kho lửa nhỏ thêm 20 phút cho gà thấm gia vị và nước sốt sệt lại.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Bò Lúc Lắc",
    description: "Thịt bò mềm xào lúc lắc thơm ngon, ăn kèm cơm chiên dương châu hoặc bánh mì.",
    category: "main",
    cookTime: 20,
    difficulty: "Medium",
    calories: 480,
    image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800",
    ingredients: [
      { name: "Thịt bò thăn", quantity: "400g" },
      { name: "Hành tây", quantity: "1 củ" },
      { name: "Ớt chuông đỏ và xanh", quantity: "1 quả mỗi loại" },
      { name: "Xì dầu", quantity: "2 muỗng" },
      { name: "Dầu hào", quantity: "1 muỗng" },
      { name: "Tỏi", quantity: "3 tép" },
      { name: "Dầu ăn", quantity: "2 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Cắt bò thành khối vuông nhỏ, ướp với xì dầu, dầu hào và tỏi băm trong 15 phút.",
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Làm nóng chảo với lửa lớn, cho bò vào áp chảo nhanh tay cho vàng mặt ngoài.",
        image: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Cho hành tây và ớt chuông vào xào cùng, đảo đều tay trong 2 phút rồi dọn ra.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Tôm Rang Muối",
    description: "Tôm rang giòn thơm phức, ăn cả vỏ được vì giòn tan trong miệng.",
    category: "main",
    cookTime: 20,
    difficulty: "Easy",
    calories: 320,
    image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800",
    ingredients: [
      { name: "Tôm sú", quantity: "500g" },
      { name: "Tỏi", quantity: "5 tép" },
      { name: "Sả", quantity: "2 cây" },
      { name: "Ớt", quantity: "2 quả" },
      { name: "Muối", quantity: "1 muỗng cà phê" },
      { name: "Đường", quantity: "1 muỗng cà phê" },
      { name: "Dầu ăn", quantity: "2 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Rửa sạch tôm, dùng kéo cắt bớt râu và chân.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Phi thơm tỏi và sả băm, cho tôm vào rang trên lửa lớn.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Nêm muối, đường và ớt. Rang đến khi tôm khô và vỏ giòn vàng.",
        image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Lẩu Thái Hải Sản",
    description: "Nồi lẩu chua cay nồng nàn, đầy ắp hải sản tươi ngon.",
    category: "main",
    cookTime: 45,
    difficulty: "Medium",
    calories: 450,
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800",
    ingredients: [
      { name: "Tôm tươi", quantity: "300g" },
      { name: "Mực", quantity: "200g" },
      { name: "Nghêu", quantity: "300g" },
      { name: "Nấm kim châm", quantity: "100g" },
      { name: "Cà chua", quantity: "3 quả" },
      { name: "Sả", quantity: "3 cây" },
      { name: "Gói gia vị lẩu Thái", quantity: "1 gói" },
      { name: "Nước cốt chanh", quantity: "2 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Nấu nước dùng từ xương hoặc viên súp, thêm sả đập dập và cà chua.",
        image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Hòa tan gói gia vị lẩu Thái vào nồi nước dùng, nêm nếm vừa ăn.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Nhúng hải sản và rau nấm vào nồi lẩu sôi, ăn kèm bún hoặc mì.",
        image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Cơm Chiên Dương Châu",
    description: "Cơm chiên thập cẩm với trứng, tôm, xúc xích và rau thơm ngon.",
    category: "main",
    cookTime: 20,
    difficulty: "Easy",
    calories: 490,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    ingredients: [
      { name: "Cơm nguội", quantity: "400g" },
      { name: "Trứng gà", quantity: "3 quả" },
      { name: "Tôm tươi", quantity: "100g" },
      { name: "Xúc xích", quantity: "2 cây" },
      { name: "Cà rốt", quantity: "50g" },
      { name: "Hành lá", quantity: "1 ít" },
      { name: "Xì dầu", quantity: "2 muỗng" },
      { name: "Dầu ăn", quantity: "3 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Đập trứng vào chảo dầu nóng, khuấy nhẹ tạo thành trứng bác.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Cho tôm, xúc xích và cà rốt vào xào cùng.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Cho cơm nguội vào đảo đều với lửa lớn, nêm xì dầu và rắc hành lá.",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },

  // ================================================================
  // MÓN CHAY (VEGETARIAN)
  // ================================================================
  {
    title: "Canh Rau Củ Chay",
    description: "Canh rau củ thanh đạm, ngọt nước và bổ dưỡng.",
    category: "vegetarian",
    cookTime: 20,
    difficulty: "Easy",
    calories: 120,
    image: "https://images.unsplash.com/photo-1547592180089-23c63e1d1c5a?w=800",
    ingredients: [
      { name: "Cà rốt", quantity: "100g" },
      { name: "Su hào", quantity: "100g" },
      { name: "Đậu bắp", quantity: "5 quả" },
      { name: "Nấm rơm", quantity: "50g" },
      { name: "Bột nêm chay", quantity: "1 muỗng" },
      { name: "Hành lá", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Sơ chế và cắt nhỏ tất cả rau củ thành miếng vừa ăn.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Đun sôi 500ml nước, cho rau củ vào nấu chín, nêm bột nêm chay vừa ăn.",
        image: "https://images.unsplash.com/photo-1547592180089-23c63e1d1c5a?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Đậu Phụ Sốt Cà Chua",
    description: "Đậu phụ chiên giòn quyện trong sốt cà chua chua ngọt hấp dẫn.",
    category: "vegetarian",
    cookTime: 25,
    difficulty: "Easy",
    calories: 240,
    image: "https://images.unsplash.com/photo-1546069901-e516a667d697?w=800",
    ingredients: [
      { name: "Đậu phụ", quantity: "300g" },
      { name: "Cà chua", quantity: "3 quả" },
      { name: "Hành tây", quantity: "1 củ" },
      { name: "Tương cà", quantity: "1 muỗng" },
      { name: "Đường", quantity: "1 muỗng" },
      { name: "Dầu ăn", quantity: "3 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Cắt đậu phụ thành miếng chữ nhật, chiên vàng giòn hai mặt.",
        image: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Xào hành tây và cà chua đến khi nhừ, thêm tương cà và đường.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Cho đậu phụ chiên vào đảo nhẹ với sốt, nêm vừa ăn và dọn ra.",
        image: "https://images.unsplash.com/photo-1546069901-e516a667d697?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Rau Muống Xào Tỏi",
    description: "Món rau quen thuộc đơn giản mà ngon, tỏi phi thơm lừng.",
    category: "vegetarian",
    cookTime: 10,
    difficulty: "Easy",
    calories: 110,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
    ingredients: [
      { name: "Rau muống", quantity: "400g" },
      { name: "Tỏi", quantity: "5 tép" },
      { name: "Dầu ăn", quantity: "2 muỗng" },
      { name: "Nước mắm", quantity: "1 muỗng" },
      { name: "Muối, đường", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Nhặt rau muống lấy phần ngọn và thân non, rửa sạch.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Phi thơm tỏi trong dầu nóng, cho rau vào xào lửa lớn nhanh tay đến khi chín mềm.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Cơm Chiên Chay Ngũ Sắc",
    description: "Cơm chiên rau củ đầy màu sắc, bổ dưỡng và ngon miệng.",
    category: "vegetarian",
    cookTime: 20,
    difficulty: "Easy",
    calories: 360,
    image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800",
    ingredients: [
      { name: "Cơm nguội", quantity: "400g" },
      { name: "Cà rốt", quantity: "50g" },
      { name: "Ngô ngọt", quantity: "50g" },
      { name: "Đậu hà lan", quantity: "50g" },
      { name: "Trứng gà", quantity: "2 quả" },
      { name: "Xì dầu", quantity: "2 muỗng" },
      { name: "Dầu mè", quantity: "1 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Luộc sơ cà rốt, ngô và đậu hà lan.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Xào trứng bác trước, sau đó cho cơm và rau vào đảo đều trên lửa lớn.",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Nêm xì dầu, dầu mè vào đảo đều và dọn ra đĩa.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },

  // ================================================================
  // BỮA SÁNG (BREAKFAST)
  // ================================================================
  {
    title: "Bánh Mì Trứng Ốp La",
    description: "Bữa sáng nhanh gọn với bánh mì giòn, trứng ốp la và rau tươi.",
    category: "breakfast",
    cookTime: 10,
    difficulty: "Easy",
    calories: 380,
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=800",
    ingredients: [
      { name: "Bánh mì", quantity: "1 ổ" },
      { name: "Trứng gà", quantity: "2 quả" },
      { name: "Xà lách", quantity: "30g" },
      { name: "Cà chua", quantity: "1 quả" },
      { name: "Dầu ăn", quantity: "1 muỗng" },
      { name: "Muối, tiêu", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Đập trứng vào chảo dầu nóng, chiên ốp la theo độ chín yêu thích.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Xẻ đôi bánh mì, kẹp xà lách, cà chua thái lát và trứng vào.",
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Yến Mạch Chuối Mật Ong",
    description: "Bữa sáng healthy giàu chất xơ và vitamin, no lâu và tốt cho tiêu hóa.",
    category: "breakfast",
    cookTime: 10,
    difficulty: "Easy",
    calories: 310,
    image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800",
    ingredients: [
      { name: "Yến mạch", quantity: "80g" },
      { name: "Sữa tươi", quantity: "200ml" },
      { name: "Chuối", quantity: "1 quả" },
      { name: "Mật ong", quantity: "1 muỗng" },
      { name: "Hạt chia", quantity: "1 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Nấu yến mạch với sữa tươi trên lửa nhỏ, khuấy đều đến khi đặc sánh.",
        image: "https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Cho ra tô, xếp chuối thái lát lên trên, rưới mật ong và rắc hạt chia.",
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Cháo Gà",
    description: "Bát cháo gà nóng hổi, thơm ngon bổ dưỡng, thích hợp cho mọi lứa tuổi.",
    category: "breakfast",
    cookTime: 60,
    difficulty: "Easy",
    calories: 280,
    image: "https://images.unsplash.com/photo-1547592180089-23c63e1d1c5a?w=800",
    ingredients: [
      { name: "Gạo tẻ", quantity: "100g" },
      { name: "Ức gà", quantity: "200g" },
      { name: "Gừng", quantity: "20g" },
      { name: "Hành lá, ngò rí", quantity: "1 ít" },
      { name: "Nước mắm", quantity: "1 muỗng" },
      { name: "Tiêu", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Luộc ức gà với gừng đến chín, vớt ra xé nhỏ. Giữ lại nước luộc.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Vo gạo rồi cho vào nồi nước luộc gà nấu cháo trên lửa nhỏ khoảng 45 phút.",
        image: "https://images.unsplash.com/photo-1547592180089-23c63e1d1c5a?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Cho thịt gà xé vào cháo, nêm nước mắm, rắc hành lá và tiêu lên trên.",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Bánh Mì Bơ Kẹp Trứng",
    description: "Bữa sáng kiểu Tây nhanh và ngon với bánh mì sandwich giòn.",
    category: "breakfast",
    cookTime: 10,
    difficulty: "Easy",
    calories: 420,
    image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800",
    ingredients: [
      { name: "Bánh mì sandwich", quantity: "2 lát" },
      { name: "Trứng gà", quantity: "2 quả" },
      { name: "Bơ lạt", quantity: "10g" },
      { name: "Phô mai con bò cười", quantity: "2 miếng" },
      { name: "Xúc xích", quantity: "1 cây" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Nướng bánh mì sandwich đến vàng giòn.",
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Chiên trứng và xúc xích với bơ.",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Kẹp phô mai, trứng và xúc xích vào giữa hai lát bánh mì.",
        image: "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },

  // ================================================================
  // ĐỒ UỐNG (DRINKS)
  // ================================================================
  {
    title: "Sinh Tố Chuối Sữa",
    description: "Thức uống nhanh giàu năng lượng, thơm béo và ngọt tự nhiên.",
    category: "drink",
    cookTime: 5,
    difficulty: "Easy",
    calories: 250,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800",
    ingredients: [
      { name: "Chuối chín", quantity: "2 quả" },
      { name: "Sữa tươi", quantity: "200ml" },
      { name: "Đường", quantity: "1 muỗng" },
      { name: "Đá viên", quantity: "5 viên" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Cho chuối, sữa, đường và đá vào máy xay sinh tố.",
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Xay nhuyễn và rót ra ly, thưởng thức ngay.",
        image: "https://images.unsplash.com/photo-1610970881699-44a5586930b2?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Nước Ép Cà Rốt Cam",
    description: "Nước ép giàu vitamin C và beta-carotene, đẹp da và tăng đề kháng.",
    category: "drink",
    cookTime: 10,
    difficulty: "Easy",
    calories: 140,
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800",
    ingredients: [
      { name: "Cà rốt", quantity: "200g" },
      { name: "Cam", quantity: "2 quả" },
      { name: "Gừng", quantity: "10g" },
      { name: "Mật ong", quantity: "1 muỗng" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Gọt vỏ cà rốt, vắt nước cam và gừng.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Xay cà rốt và gừng, lọc lấy nước rồi kết hợp với nước cam. Thêm mật ong vào khuấy đều.",
        image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Trà Sữa Trân Châu",
    description: "Ly trà sữa béo ngậy với trân châu dai dẻo, thức uống giới trẻ yêu thích.",
    category: "drink",
    cookTime: 30,
    difficulty: "Medium",
    calories: 420,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ingredients: [
      { name: "Trân châu đen", quantity: "50g" },
      { name: "Trà đen", quantity: "2 gói" },
      { name: "Sữa đặc", quantity: "3 muỗng" },
      { name: "Sữa tươi", quantity: "150ml" },
      { name: "Đường nâu", quantity: "2 muỗng" },
      { name: "Đá viên", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Nấu trân châu theo hướng dẫn trên bao bì, sau đó ngâm vào nước đường nâu.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Pha trà đen đặc, để nguội và kết hợp với sữa đặc và sữa tươi.",
        image: "https://images.unsplash.com/photo-1512058560366-cd242d4536ee?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Cho trân châu vào ly, đổ đá và rót hỗn hợp trà sữa vào.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Sinh Tố Dâu Sữa Chua",
    description: "Ly sinh tố mát lạnh, chua ngọt dịu dàng và rất tốt cho tiêu hóa.",
    category: "drink",
    cookTime: 5,
    difficulty: "Easy",
    calories: 190,
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800",
    ingredients: [
      { name: "Dâu tây", quantity: "150g" },
      { name: "Sữa chua không đường", quantity: "100g" },
      { name: "Mật ong", quantity: "1 muỗng" },
      { name: "Đá viên", quantity: "5 viên" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Rửa sạch dâu tây, bỏ cuống.",
        image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Cho tất cả nguyên liệu vào máy xay, xay nhuyễn và thưởng thức.",
        image: "https://images.unsplash.com/photo-1610970881699-44a5586930b2?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },

  // ================================================================
  // TRÁNG MIỆNG (DESSERTS)
  // ================================================================
  {
    title: "Chè Đậu Xanh",
    description: "Bát chè đậu xanh ngọt mát, thêm nước cốt dừa béo ngậy thật hấp dẫn.",
    category: "dessert",
    cookTime: 60,
    difficulty: "Easy",
    calories: 220,
    image: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=800",
    ingredients: [
      { name: "Đậu xanh tách vỏ", quantity: "200g" },
      { name: "Đường", quantity: "80g" },
      { name: "Nước cốt dừa", quantity: "100ml" },
      { name: "Lá dứa", quantity: "3 lá" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Ngâm đậu xanh 2 tiếng rồi nấu nhừ với lá dứa.",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Thêm đường vào khuấy tan, dọn ra bát và rưới nước cốt dừa lên trên.",
        image: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Bánh Chuối Nướng",
    description: "Bánh chuối thơm ngậy với nước cốt dừa, ăn nóng hay lạnh đều ngon.",
    category: "dessert",
    cookTime: 50,
    difficulty: "Medium",
    calories: 290,
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800",
    ingredients: [
      { name: "Chuối sứ", quantity: "5 quả" },
      { name: "Bột năng", quantity: "50g" },
      { name: "Nước cốt dừa", quantity: "200ml" },
      { name: "Đường", quantity: "60g" },
      { name: "Muối", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Hòa tan bột năng, đường, muối và nước cốt dừa thành hỗn hợp đặc.",
        image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Cắt chuối đôi theo chiều dọc, xếp vào khuôn. Đổ hỗn hợp nước cốt dừa lên trên.",
        image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Nướng ở 180 độ trong 35–40 phút đến khi mặt bánh vàng đẹp.",
        image: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Sữa Chua Dầm Hoa Quả",
    description: "Món tráng miệng mát lạnh và tươi ngon, kết hợp sữa chua với trái cây nhiều màu sắc.",
    category: "dessert",
    cookTime: 10,
    difficulty: "Easy",
    calories: 180,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",
    ingredients: [
      { name: "Sữa chua", quantity: "200g" },
      { name: "Xoài", quantity: "100g" },
      { name: "Dâu tây", quantity: "50g" },
      { name: "Việt quất", quantity: "30g" },
      { name: "Mật ong", quantity: "1 muỗng" },
      { name: "Granola", quantity: "20g" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Cắt nhỏ xoài và dâu tây thành miếng vừa ăn.",
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Múc sữa chua ra bát, xếp hoa quả lên trên, rắc granola và rưới mật ong.",
        image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  },
  {
    title: "Chè Bưởi",
    description: "Chè bưởi thanh mát với tép bưởi trắng trong, nước cốt dừa béo ngậy.",
    category: "dessert",
    cookTime: 60,
    difficulty: "Hard",
    calories: 200,
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    ingredients: [
      { name: "Bưởi", quantity: "1 quả" },
      { name: "Bột năng", quantity: "100g" },
      { name: "Đường phèn", quantity: "80g" },
      { name: "Nước cốt dừa", quantity: "150ml" },
      { name: "Màu thực phẩm (tùy chọn)", quantity: "1 ít" }
    ],
    steps: [
      {
        order: 1,
        instruction: "Tách tép bưởi, ngâm nước muối loãng rồi vắt ráo, tẩm bột năng đều.",
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
        video: ""
      },
      {
        order: 2,
        instruction: "Luộc tép bưởi đã bọc bột đến khi bột trong, vớt ra ngâm nước lạnh.",
        image: "https://images.unsplash.com/photo-1547592180089-23c63e1d1c5a?w=400",
        video: ""
      },
      {
        order: 3,
        instruction: "Nấu nước đường phèn, cho tép bưởi vào. Dọn ra với nước cốt dừa.",
        image: "https://images.unsplash.com/photo-1495147466023-ac5c588e2e94?w=400",
        video: ""
      }
    ],
    author: "6a044c1d6382209014d6428a",
    status: "approved"
  }
];

async function seedRecipes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing recipes for this author
    await Recipe.deleteMany({ author: "6a044c1d6382209014d6428a" });

    await Recipe.insertMany(recipes);
    console.log(`✅ Seeded ${recipes.length} diverse recipes successfully!`);
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding recipes:', err);
    process.exit(1);
  }
}

seedRecipes();