import type { Recipe } from './types'

export const RECIPES: Recipe[] = [
  /* ════════════════════════════════════════════════════════════════
     西餐 — Western
     ════════════════════════════════════════════════════════════════ */

  {
    id: 'herb-sirloin',
    emoji: '🥩',
    accent: '#E85D3A',
    nameZh: '香草西冷牛排',
    nameEn: 'Herb Sirloin Steak',
    category: 'western',
    tags: ['牛排', '高蛋白', '经典', '铸铁锅'],
    difficulty: 'medium',
    prepTime: '30 min',
    totalKcal: 450,
    macros: { protein: 0.45, fats: 0.35, carbs: 0.20 },
    flavorProfile: { acid: 0.55, sweet: 0.35, bitter: 0.25, spicy: 0.50, salty: 0.70, umami: 0.80 },
    ingredients: [
      { id: 'steak', nameZh: '西冷牛排', nameEn: 'Sirloin Steak', amount: '200g',
        substitution: { nameZh: '肋眼牛排', nameEn: 'Ribeye', flavorDelta: { sweet: 0.05, umami: 0.08, salty: -0.03 }, tags: [{ label: '油脂更丰富', variant: 'amber' }, { label: '口感更嫩', variant: 'muted' }] } },
      { id: 'rosemary', nameZh: '迷迭香', nameEn: 'Rosemary', amount: '1支',
        substitution: { nameZh: '百里香', nameEn: 'Thyme', flavorDelta: { sweet: 0.15, bitter: 0.20, salty: -0.10, umami: -0.15 }, tags: [{ label: '木质香调减弱', variant: 'muted' }, { label: '建议晚放防焦', variant: 'amber' }] } },
      { id: 'salt', nameZh: '海盐', nameEn: 'Sea Salt', amount: '3g',
        substitution: { nameZh: '岩盐', nameEn: 'Rock Salt', flavorDelta: { bitter: 0.03, salty: -0.05 }, tags: [{ label: '矿物质感增强', variant: 'muted' }, { label: '咸度略降', variant: 'amber' }] } },
      { id: 'pepper', nameZh: '黑胡椒', nameEn: 'Black Pepper', amount: '2g',
        substitution: { nameZh: '白胡椒', nameEn: 'White Pepper', flavorDelta: { spicy: -0.05, bitter: 0.02 }, tags: [{ label: '辛辣减弱', variant: 'amber' }, { label: '泥土气息', variant: 'muted' }] } },
      { id: 'butter', nameZh: '黄油', nameEn: 'Butter', amount: '15g',
        substitution: { nameZh: '橄榄油', nameEn: 'Olive Oil', flavorDelta: { sweet: 0.05, umami: -0.08, salty: -0.02 }, tags: [{ label: '果香提升', variant: 'muted' }, { label: '奶香减弱', variant: 'amber' }] } },
      { id: 'garlic', nameZh: '大蒜', nameEn: 'Garlic', amount: '2瓣',
        substitution: { nameZh: '红葱头', nameEn: 'Shallot', flavorDelta: { spicy: -0.08, sweet: 0.05, bitter: -0.02 }, tags: [{ label: '辛辣减弱', variant: 'amber' }, { label: '甜味提升', variant: 'muted' }] } },
    ],
    steps: [
      { zh: '牛排回温', en: 'Bring to room temp', duration: '15 min', detail: '将牛排从冰箱取出，置于室温环境回温，确保煎制时受热均匀。' },
      { zh: '海盐黑胡椒腌制', en: 'Season generously', duration: '5 min', detail: '双面均匀撒上海盐与现磨黑胡椒，轻轻按压使调味料附着于肉面。' },
      { zh: '高温预热煎锅', en: 'Preheat pan', duration: '3 min', detail: '大火预热铸铁煎锅至微微冒烟。无需放油——热锅是焦脆外壳的关键。' },
      { zh: '煎制牛排', en: 'Sear the steak', duration: '6 min', detail: '放入牛排，听见嘶嘶声表示温度正确。每面煎制约3分钟，中间翻面一次，至理想熟度。' },
      { zh: '加入黄油迷迭香', en: 'Baste with aromatics', duration: '2 min', detail: '转中小火，加入黄油、迷迭香和大蒜。倾斜锅身，用勺子不断将热油浇淋在牛排表面。' },
      { zh: '静置醒肉', en: 'Rest the steak', duration: '5 min', detail: '取出牛排置于温暖盘中，盖上铝箔静置5分钟。让肉汁重新分布，每一口都鲜嫩多汁。' },
    ],
  },

  {
    id: 'caesar-salad',
    emoji: '🥗',
    accent: '#7CB342',
    nameZh: '凯撒沙拉',
    nameEn: 'Caesar Salad',
    category: 'western',
    tags: ['沙拉', '快手', '经典', '无需加热'],
    difficulty: 'easy',
    prepTime: '15 min',
    totalKcal: 320,
    macros: { protein: 0.20, fats: 0.55, carbs: 0.25 },
    flavorProfile: { acid: 0.60, sweet: 0.20, bitter: 0.15, spicy: 0.10, salty: 0.65, umami: 0.55 },
    ingredients: [
      { id: 'romaine', nameZh: '罗马生菜', nameEn: 'Romaine Lettuce', amount: '200g' },
      { id: 'parmesan', nameZh: '帕玛森芝士', nameEn: 'Parmesan', amount: '30g',
        substitution: { nameZh: '陈年切达', nameEn: 'Aged Cheddar', flavorDelta: { salty: -0.05, umami: 0.02 }, tags: [{ label: '奶香更浓', variant: 'amber' }, { label: '咸度略降', variant: 'muted' }] } },
      { id: 'croutons', nameZh: '面包丁', nameEn: 'Croutons', amount: '50g' },
      { id: 'anchovy', nameZh: '鳀鱼', nameEn: 'Anchovy', amount: '3条',
        substitution: { nameZh: '鱼露', nameEn: 'Fish Sauce', flavorDelta: { salty: 0.05, umami: 0.03 }, tags: [{ label: '咸鲜增强', variant: 'amber' }, { label: '液态调入', variant: 'muted' }] } },
      { id: 'lemon', nameZh: '柠檬汁', nameEn: 'Lemon Juice', amount: '15ml',
        substitution: { nameZh: '青柠汁', nameEn: 'Lime Juice', flavorDelta: { acid: 0.05, sweet: -0.02 }, tags: [{ label: '酸度略增', variant: 'amber' }, { label: '热带风味', variant: 'muted' }] } },
      { id: 'olive-oil', nameZh: '橄榄油', nameEn: 'Olive Oil', amount: '30ml' },
      { id: 'egg', nameZh: '鸡蛋', nameEn: 'Egg', amount: '1个' },
    ],
    steps: [
      { zh: '处理生菜', en: 'Prep lettuce', duration: '3 min', detail: '罗马生菜洗净沥干，撕成大块放入沙拉碗。叶片上的水务必甩干，否则稀释酱汁。' },
      { zh: '制作酱汁', en: 'Make dressing', duration: '3 min', detail: '鳀鱼切碎，与蛋黄、柠檬汁、橄榄油搅拌至乳化。加入现磨黑胡椒调味。' },
      { zh: '准备面包丁', en: 'Prepare croutons', duration: '2 min', detail: '面包丁用少许橄榄油和蒜末拌匀，平底锅小火烘至金黄酥脆。' },
      { zh: '组合装盘', en: 'Assemble & serve', duration: '2 min', detail: '生菜淋上酱汁拌匀，撒上面包丁和刨好的帕玛森芝士片，立即上桌。' },
    ],
  },

  {
    id: 'mushroom-soup',
    emoji: '🍄',
    accent: '#8D6E63',
    nameZh: '奶油蘑菇汤',
    nameEn: 'Cream of Mushroom Soup',
    category: 'western',
    tags: ['汤品', '暖身', '搅拌机'],
    difficulty: 'easy',
    prepTime: '25 min',
    totalKcal: 280,
    macros: { protein: 0.10, fats: 0.60, carbs: 0.30 },
    flavorProfile: { acid: 0.15, sweet: 0.30, bitter: 0.20, spicy: 0.05, salty: 0.55, umami: 0.85 },
    ingredients: [
      { id: 'mushroom', nameZh: '白蘑菇', nameEn: 'Button Mushroom', amount: '300g',
        substitution: { nameZh: '混合菌菇', nameEn: 'Mixed Mushrooms', flavorDelta: { umami: 0.08, bitter: 0.03 }, tags: [{ label: '鲜味更丰富', variant: 'amber' }, { label: '层次提升', variant: 'muted' }] } },
      { id: 'onion', nameZh: '洋葱', nameEn: 'Onion', amount: '1/2个',
        substitution: { nameZh: '红葱头', nameEn: 'Shallot', flavorDelta: { sweet: 0.05, spicy: -0.02 }, tags: [{ label: '甜味更细腻', variant: 'muted' }] } },
      { id: 'butter-soup', nameZh: '黄油', nameEn: 'Butter', amount: '20g',
        substitution: { nameZh: '橄榄油', nameEn: 'Olive Oil', flavorDelta: { sweet: 0.03, umami: -0.05 }, tags: [{ label: '奶香减弱', variant: 'amber' }, { label: '更清爽', variant: 'muted' }] } },
      { id: 'cream', nameZh: '淡奶油', nameEn: 'Heavy Cream', amount: '100ml' },
      { id: 'stock', nameZh: '鸡高汤', nameEn: 'Chicken Stock', amount: '300ml',
        substitution: { nameZh: '蔬菜高汤', nameEn: 'Vegetable Stock', flavorDelta: { umami: -0.05, sweet: 0.02 }, tags: [{ label: '素食可选', variant: 'muted' }] } },
      { id: 'thyme-soup', nameZh: '百里香', nameEn: 'Thyme', amount: '2支' },
    ],
    steps: [
      { zh: '炒洋葱蘑菇', en: 'Sauté aromatics', duration: '5 min', detail: '黄油融化，中火炒洋葱至透明，加入切片蘑菇炒至出水并微微上色。' },
      { zh: '加入高汤炖煮', en: 'Simmer with stock', duration: '10 min', detail: '加入鸡高汤和百里香，大火煮开后转小火，盖上盖子炖煮10分钟。' },
      { zh: '搅拌成泥', en: 'Blend until smooth', duration: '2 min', detail: '取出百里香枝，将汤倒入搅拌机打成顺滑泥状，再倒回锅中。' },
      { zh: '加入奶油调味', en: 'Finish with cream', duration: '3 min', detail: '倒入淡奶油搅拌均匀，小火加热至微沸。加盐和黑胡椒调味，盛碗点缀几滴奶油。' },
    ],
  },

  /* ════════════════════════════════════════════════════════════════
     中餐 — Chinese
     ════════════════════════════════════════════════════════════════ */

  {
    id: 'kung-pao-chicken',
    emoji: '🌶️',
    accent: '#D32F2F',
    nameZh: '宫保鸡丁',
    nameEn: 'Kung Pao Chicken',
    category: 'chinese',
    tags: ['鸡肉', '下饭菜', '麻辣', '经典川菜'],
    difficulty: 'medium',
    prepTime: '25 min',
    totalKcal: 420,
    macros: { protein: 0.40, fats: 0.35, carbs: 0.25 },
    flavorProfile: { acid: 0.45, sweet: 0.55, bitter: 0.15, spicy: 0.80, salty: 0.60, umami: 0.75 },
    ingredients: [
      { id: 'chicken-thigh', nameZh: '鸡腿肉', nameEn: 'Chicken Thigh', amount: '250g',
        substitution: { nameZh: '鸡胸肉', nameEn: 'Chicken Breast', flavorDelta: { umami: -0.05, sweet: -0.03 }, tags: [{ label: '口感较柴', variant: 'amber' }, { label: '低脂选择', variant: 'muted' }] } },
      { id: 'peanuts', nameZh: '花生米', nameEn: 'Peanuts', amount: '50g',
        substitution: { nameZh: '腰果', nameEn: 'Cashew', flavorDelta: { sweet: 0.05, bitter: -0.02 }, tags: [{ label: '口感更细腻', variant: 'muted' }] } },
      { id: 'dried-chili', nameZh: '干辣椒', nameEn: 'Dried Chili', amount: '8个',
        substitution: { nameZh: '鲜小米辣', nameEn: 'Bird Eye Chili', flavorDelta: { spicy: 0.10, acid: 0.02 }, tags: [{ label: '辣度增加', variant: 'amber' }, { label: '鲜辣风味', variant: 'muted' }] } },
      { id: 'sichuan-pepper', nameZh: '花椒', nameEn: 'Sichuan Peppercorn', amount: '1茶匙' },
      { id: 'scallion', nameZh: '大葱', nameEn: 'Scallion', amount: '2根' },
      { id: 'soy-sauce', nameZh: '生抽', nameEn: 'Light Soy Sauce', amount: '15ml',
        substitution: { nameZh: '椰子酱油', nameEn: 'Coconut Aminos', flavorDelta: { salty: -0.08, sweet: 0.02 }, tags: [{ label: '低钠替代', variant: 'amber' }] } },
      { id: 'vinegar', nameZh: '陈醋', nameEn: 'Black Vinegar', amount: '10ml',
        substitution: { nameZh: '香醋', nameEn: 'Balsamic', flavorDelta: { sweet: 0.05, acid: -0.02 }, tags: [{ label: '偏甜口感', variant: 'muted' }] } },
    ],
    steps: [
      { zh: '腌制鸡肉', en: 'Marinate chicken', duration: '10 min', detail: '鸡腿肉切丁，加入生抽、料酒、淀粉抓匀，腌制10分钟入味。' },
      { zh: '准备宫保汁', en: 'Mix sauce', duration: '2 min', detail: '生抽、陈醋、白糖、淀粉和少许水混合调成宫保汁备用。' },
      { zh: '炒香辣椒花椒', en: 'Fry aromatics', duration: '1 min', detail: '冷锅冷油，小火炒干辣椒和花椒至出香味，注意不要炒糊。' },
      { zh: '滑炒鸡丁', en: 'Stir-fry chicken', duration: '3 min', detail: '转大火，下腌好的鸡丁快速滑炒至变色断生，盛出备用。' },
      { zh: '合炒收汁', en: 'Combine & glaze', duration: '2 min', detail: '锅中留底油，下葱段爆香，放回鸡丁，倒入宫保汁大火翻炒收汁。加入花生米翻匀出锅。' },
    ],
  },

  {
    id: 'tomato-egg',
    emoji: '🍅',
    accent: '#EF5350',
    nameZh: '番茄炒蛋',
    nameEn: 'Tomato Egg Stir-fry',
    category: 'chinese',
    tags: ['快手', '家常', '新手入门', '下饭'],
    difficulty: 'easy',
    prepTime: '10 min',
    totalKcal: 260,
    macros: { protein: 0.25, fats: 0.40, carbs: 0.35 },
    flavorProfile: { acid: 0.50, sweet: 0.60, bitter: 0.05, spicy: 0.02, salty: 0.40, umami: 0.60 },
    ingredients: [
      { id: 'tomato', nameZh: '番茄', nameEn: 'Tomato', amount: '2个（中等）' },
      { id: 'egg2', nameZh: '鸡蛋', nameEn: 'Egg', amount: '3个' },
      { id: 'sugar', nameZh: '白糖', nameEn: 'Sugar', amount: '1茶匙',
        substitution: { nameZh: '代糖', nameEn: 'Sweetener', flavorDelta: { sweet: -0.02 }, tags: [{ label: '低卡替代', variant: 'amber' }, { label: '甜度略降', variant: 'muted' }] } },
      { id: 'salt-tomato', nameZh: '盐', nameEn: 'Salt', amount: '适量' },
      { id: 'oil', nameZh: '食用油', nameEn: 'Cooking Oil', amount: '15ml' },
      { id: 'green-onion', nameZh: '小葱', nameEn: 'Green Onion', amount: '少许（装饰）' },
    ],
    steps: [
      { zh: '准备食材', en: 'Prep ingredients', duration: '2 min', detail: '番茄切块，鸡蛋打入碗中加少许盐打散。小葱切葱花备用。' },
      { zh: '炒鸡蛋', en: 'Scramble eggs', duration: '1 min', detail: '锅中油热后倒入蛋液，快速翻炒至八分熟（仍带湿润），盛出备用。' },
      { zh: '炒番茄', en: 'Cook tomatoes', duration: '3 min', detail: '同一锅中下番茄块，中火翻炒至出汁变软。加入白糖平衡酸味。' },
      { zh: '合炒出锅', en: 'Combine & serve', duration: '1 min', detail: '倒回鸡蛋，与番茄快速翻炒均匀。加盐调味，撒葱花出锅。' },
    ],
  },

  /* ════════════════════════════════════════════════════════════════
     鸡尾酒 — Cocktail
     ════════════════════════════════════════════════════════════════ */

  {
    id: 'mojito',
    emoji: '🍃',
    accent: '#4CAF50',
    nameZh: '莫吉托',
    nameEn: 'Mojito',
    category: 'drink',
    tags: ['含酒精', '朗姆酒', '清爽', '夏日', '经典'],
    difficulty: 'easy',
    prepTime: '5 min',
    totalKcal: 160,
    macros: { protein: 0.0, fats: 0.0, carbs: 1.0 },
    flavorProfile: { acid: 0.70, sweet: 0.55, bitter: 0.10, spicy: 0.0, salty: 0.05, umami: 0.05 },
    ingredients: [
      { id: 'white-rum', nameZh: '白朗姆酒', nameEn: 'White Rum', amount: '60ml',
        substitution: { nameZh: '金朗姆', nameEn: 'Gold Rum', flavorDelta: { sweet: 0.05, bitter: 0.03 }, tags: [{ label: '更醇厚', variant: 'amber' }, { label: '焦糖风味', variant: 'muted' }] } },
      { id: 'lime', nameZh: '青柠', nameEn: 'Lime', amount: '1个',
        substitution: { nameZh: '柠檬', nameEn: 'Lemon', flavorDelta: { acid: 0.05, bitter: -0.02 }, tags: [{ label: '酸度微增', variant: 'muted' }] } },
      { id: 'mint', nameZh: '薄荷叶', nameEn: 'Fresh Mint', amount: '8-10片' },
      { id: 'sugar-syrup', nameZh: '糖浆', nameEn: 'Simple Syrup', amount: '20ml',
        substitution: { nameZh: '蜂蜜', nameEn: 'Honey', flavorDelta: { sweet: 0.05, bitter: 0.02 }, tags: [{ label: '风味更复杂', variant: 'amber' }, { label: '花香调', variant: 'muted' }] } },
      { id: 'soda', nameZh: '苏打水', nameEn: 'Soda Water', amount: '适量' },
      { id: 'ice', nameZh: '碎冰', nameEn: 'Crushed Ice', amount: '满杯' },
    ],
    steps: [
      { zh: '捣薄荷青柠', en: 'Muddle mint & lime', duration: '1 min', detail: '在高杯中放入青柠角和薄荷叶，加入糖浆，轻轻捣压释放薄荷精油。不要过度捣碎，否则变苦。' },
      { zh: '加朗姆酒和冰', en: 'Add rum & ice', duration: '1 min', detail: '倒入白朗姆酒，加入碎冰至杯口，用吧勺搅拌均匀。' },
      { zh: '苏打水补满', en: 'Top with soda', duration: '1 min', detail: '沿杯壁缓缓注入苏打水至满杯，轻轻提拉吧勺使分层融合。薄荷嫩尖装饰杯口。' },
    ],
  },

  {
    id: 'whiskey-sour',
    emoji: '🥃',
    accent: '#FF6F00',
    nameZh: '威士忌酸',
    nameEn: 'Whiskey Sour',
    category: 'drink',
    tags: ['含酒精', '威士忌', '经典', '酸甜', '摇酒壶'],
    difficulty: 'easy',
    prepTime: '5 min',
    totalKcal: 180,
    macros: { protein: 0.02, fats: 0.0, carbs: 0.98 },
    flavorProfile: { acid: 0.75, sweet: 0.45, bitter: 0.35, spicy: 0.05, salty: 0.02, umami: 0.05 },
    ingredients: [
      { id: 'bourbon', nameZh: '波本威士忌', nameEn: 'Bourbon Whiskey', amount: '60ml',
        substitution: { nameZh: '黑麦威士忌', nameEn: 'Rye Whiskey', flavorDelta: { spicy: 0.05, bitter: 0.03 }, tags: [{ label: '更辛辣', variant: 'amber' }, { label: '香料风味', variant: 'muted' }] } },
      { id: 'lemon-juice', nameZh: '柠檬汁', nameEn: 'Lemon Juice', amount: '30ml',
        substitution: { nameZh: '青柠汁', nameEn: 'Lime Juice', flavorDelta: { acid: 0.05, sweet: -0.03 }, tags: [{ label: '更酸爽', variant: 'muted' }] } },
      { id: 'simple-syrup', nameZh: '糖浆', nameEn: 'Simple Syrup', amount: '20ml',
        substitution: { nameZh: '枫糖浆', nameEn: 'Maple Syrup', flavorDelta: { sweet: 0.05, bitter: 0.02 }, tags: [{ label: '焦糖风味', variant: 'amber' }] } },
      { id: 'egg-white', nameZh: '蛋白', nameEn: 'Egg White', amount: '1个（可选）' },
      { id: 'bitters', nameZh: '苦精', nameEn: 'Angostura Bitters', amount: '2滴' },
    ],
    steps: [
      { zh: '干摇', en: 'Dry shake', duration: '1 min', detail: '将所有原料（不加冰）倒入摇酒壶，用力摇15秒。干摇能让蛋白充分发泡，形成绵密泡沫。' },
      { zh: '冰摇降温', en: 'Shake with ice', duration: '1 min', detail: '加入冰块再次摇10秒，直至壶身结霜。这一步降温并进一步乳化。' },
      { zh: '双重过滤', en: 'Double strain', duration: '1 min', detail: '用双重滤网过滤入冰过的古典杯，去除冰渣和蛋白絮状物。滴上苦精点缀。' },
    ],
  },

  /* ════════════════════════════════════════════════════════════════
     基本功 — Basics
     ════════════════════════════════════════════════════════════════ */

  {
    id: 'perfect-rice',
    emoji: '🍚',
    accent: '#C9A96E',
    nameZh: '完美米饭',
    nameEn: 'Perfect Steamed Rice',
    category: 'basic',
    tags: ['主食', '新手入门', '必备技能', '电饭煲'],
    difficulty: 'easy',
    prepTime: '35 min',
    totalKcal: 350,
    macros: { protein: 0.08, fats: 0.02, carbs: 0.90 },
    flavorProfile: { acid: 0.02, sweet: 0.20, bitter: 0.02, spicy: 0.0, salty: 0.02, umami: 0.10 },
    ingredients: [
      { id: 'rice', nameZh: '大米', nameEn: 'Rice', amount: '200g（1杯）',
        substitution: { nameZh: '糙米', nameEn: 'Brown Rice', flavorDelta: { bitter: 0.03, sweet: -0.02 }, tags: [{ label: '需增加水量', variant: 'amber' }, { label: '口感更硬', variant: 'muted' }] } },
      { id: 'water', nameZh: '水', nameEn: 'Water', amount: '220ml（1.1倍）' },
    ],
    steps: [
      { zh: '淘洗大米', en: 'Wash rice', duration: '2 min', detail: '大米放入碗中加水，用手轻轻搓洗。换水2-3次至水变清澈。切勿用力揉搓以免断米。' },
      { zh: '浸泡吸水', en: 'Soak rice', duration: '15 min', detail: '洗净的米加水浸泡15分钟，让米粒充分吸水。手指掐米粒应能轻易掐断。' },
      { zh: '上锅蒸煮', en: 'Cook rice', duration: '15 min', detail: '米和水按1:1.1比例放入电饭煲，按下煮饭键。中途不要开盖。' },
      { zh: '焖饭松散', en: 'Rest & fluff', duration: '2 min', detail: '煮好后焖2分钟，开盖用饭勺从底部翻起松散米粒，释放多余蒸汽。' },
    ],
  },

  /* ════════════════════════════════════════════════════════════════
     中餐扩展 — Chinese Extended
     ════════════════════════════════════════════════════════════════ */

  {
    id: 'mapo-tofu',
    emoji: '🫘',
    accent: '#BF360C',
    nameZh: '麻婆豆腐',
    nameEn: 'Mapo Tofu',
    category: 'chinese',
    tags: ['豆腐', '麻辣', '经典川菜', '下饭'],
    difficulty: 'easy',
    prepTime: '15 min',
    totalKcal: 320,
    macros: { protein: 0.30, fats: 0.45, carbs: 0.25 },
    flavorProfile: { acid: 0.25, sweet: 0.15, bitter: 0.10, spicy: 0.85, salty: 0.65, umami: 0.75 },
    ingredients: [
      { id: 'tofu', nameZh: '嫩豆腐', nameEn: 'Silken Tofu', amount: '300g',
        substitution: { nameZh: '中豆腐', nameEn: 'Medium Tofu', flavorDelta: { sweet: -0.03, bitter: 0.02 }, tags: [{ label: '口感更扎实', variant: 'muted' }, { label: '不易碎', variant: 'amber' }] } },
      { id: 'pork-mince', nameZh: '猪肉末', nameEn: 'Ground Pork', amount: '80g',
        substitution: { nameZh: '牛肉末', nameEn: 'Ground Beef', flavorDelta: { umami: 0.05, sweet: 0.03 }, tags: [{ label: '肉味更浓', variant: 'amber' }, { label: '油脂略增', variant: 'muted' }] } },
      { id: 'doubanjiang', nameZh: '郫县豆瓣酱', nameEn: 'Pixian Doubanjiang', amount: '15g' },
      { id: 'chili-oil', nameZh: '辣椒油', nameEn: 'Chili Oil', amount: '10ml' },
      { id: 'sichuan-pepper2', nameZh: '花椒粉', nameEn: 'Sichuan Pepper Powder', amount: '1茶匙' },
      { id: 'soy-sauce2', nameZh: '生抽', nameEn: 'Light Soy Sauce', amount: '10ml' },
      { id: 'scallion2', nameZh: '葱花', nameEn: 'Scallion', amount: '适量' },
    ],
    steps: [
      { zh: '焯豆腐', en: 'Blanch tofu', duration: '2 min', detail: '豆腐切成2cm方块，入沸水加少许盐焯1分钟，捞出沥干。这一步让豆腐更紧实不易碎。' },
      { zh: '炒肉末', en: 'Brown pork', duration: '2 min', detail: '锅中放油烧热，下猪肉末翻炒至变色出油，盛出备用。' },
      { zh: '炒酱料', en: 'Fry doubanjiang', duration: '1 min', detail: '锅中留底油，小火炒香豆瓣酱至红油析出，加入辣椒油和花椒粉炒出香味。' },
      { zh: '烧豆腐', en: 'Simmer tofu', duration: '3 min', detail: '加入适量清水或高汤，放入豆腐和肉末，小火煮3分钟让豆腐入味。轻轻推动锅子而非翻铲。' },
      { zh: '勾芡出锅', en: 'Thicken & serve', duration: '1 min', detail: '调入生抽，淋入水淀粉勾薄芡。撒上大量葱花和花椒粉，趁热上桌。' },
    ],
  },

  /* ════════════════════════════════════════════════════════════════
     西餐扩展 — Western Extended
     ════════════════════════════════════════════════════════════════ */

  {
    id: 'bolognese',
    emoji: '🍝',
    accent: '#C62828',
    nameZh: '意式肉酱面',
    nameEn: 'Spaghetti Bolognese',
    category: 'western',
    tags: ['意面', '经典', '家庭料理', '肉酱'],
    difficulty: 'easy',
    prepTime: '40 min',
    totalKcal: 520,
    macros: { protein: 0.20, fats: 0.35, carbs: 0.45 },
    flavorProfile: { acid: 0.40, sweet: 0.35, bitter: 0.15, spicy: 0.10, salty: 0.60, umami: 0.80 },
    ingredients: [
      { id: 'spaghetti', nameZh: '意大利面', nameEn: 'Spaghetti', amount: '200g' },
      { id: 'beef-mince', nameZh: '牛肉末', nameEn: 'Ground Beef', amount: '200g',
        substitution: { nameZh: '猪肉末', nameEn: 'Ground Pork', flavorDelta: { umami: -0.05, sweet: 0.03 }, tags: [{ label: '油脂更丰富', variant: 'amber' }] } },
      { id: 'tomato-can', nameZh: '番茄罐头', nameEn: 'Canned Tomatoes', amount: '400g',
        substitution: { nameZh: '新鲜番茄', nameEn: 'Fresh Tomatoes', flavorDelta: { sweet: 0.05, acid: 0.05 }, tags: [{ label: '需去皮', variant: 'amber' }, { label: '更清爽', variant: 'muted' }] } },
      { id: 'onion2', nameZh: '洋葱', nameEn: 'Onion', amount: '1个' },
      { id: 'carrot', nameZh: '胡萝卜', nameEn: 'Carrot', amount: '1根' },
      { id: 'celery', nameZh: '西芹', nameEn: 'Celery', amount: '1根' },
      { id: 'red-wine', nameZh: '红酒', nameEn: 'Red Wine', amount: '100ml',
        substitution: { nameZh: '牛肉高汤', nameEn: 'Beef Stock', flavorDelta: { umami: 0.03, acid: -0.05 }, tags: [{ label: '无酒精替代', variant: 'amber' }] } },
      { id: 'parmesan2', nameZh: '帕玛森芝士', nameEn: 'Parmesan', amount: '适量' },
    ],
    steps: [
      { zh: '准备蔬菜底', en: 'Prep soffritto', duration: '5 min', detail: '洋葱、胡萝卜、西芹切细丁。这是意式肉酱的灵魂基底——soffritto。' },
      { zh: '炒蔬菜底', en: 'Sauté soffritto', duration: '5 min', detail: '橄榄油中小火炒蔬菜丁至洋葱透明，约5分钟。不要着急上色，慢慢释放甜味。' },
      { zh: '炒牛肉末', en: 'Brown beef', duration: '3 min', detail: '加入牛肉末大火翻炒，用锅铲打散直至变色，表面微焦增加风味。' },
      { zh: '加入红酒番茄', en: 'Deglaze & simmer', duration: '25 min', detail: '倒入红酒收至几乎干，加入番茄罐头和少许水。小火慢炖25分钟，偶尔搅拌。时间越久风味越融合。' },
      { zh: '煮面装盘', en: 'Cook pasta & serve', duration: '8 min', detail: '大锅盐水煮意面至弹牙口感。沥干后拌入肉酱，刨上帕玛森芝士上桌。' },
    ],
  },

  /* ════════════════════════════════════════════════════════════════
     鸡尾酒扩展 — Cocktail Extended
     ════════════════════════════════════════════════════════════════ */

  {
    id: 'margarita',
    emoji: '🍸',
    accent: '#26C6DA',
    nameZh: '玛格丽特',
    nameEn: 'Margarita',
    category: 'drink',
    tags: ['含酒精', '龙舌兰', '经典', '酸甜', '盐口杯'],
    difficulty: 'easy',
    prepTime: '5 min',
    totalKcal: 170,
    macros: { protein: 0.0, fats: 0.0, carbs: 1.0 },
    flavorProfile: { acid: 0.80, sweet: 0.40, bitter: 0.15, spicy: 0.0, salty: 0.30, umami: 0.02 },
    ingredients: [
      { id: 'tequila', nameZh: '龙舌兰酒', nameEn: 'Tequila Blanco', amount: '50ml',
        substitution: { nameZh: '梅斯卡尔', nameEn: 'Mezcal', flavorDelta: { bitter: 0.10, spicy: 0.03 }, tags: [{ label: '烟熏风味', variant: 'amber' }, { label: '更复杂', variant: 'muted' }] } },
      { id: 'triple-sec', nameZh: '橙味利口酒', nameEn: 'Triple Sec', amount: '25ml',
        substitution: { nameZh: '君度', nameEn: 'Cointreau', flavorDelta: { sweet: 0.03, bitter: 0.02 }, tags: [{ label: '更精致的橙香', variant: 'muted' }] } },
      { id: 'lime-juice', nameZh: '青柠汁', nameEn: 'Fresh Lime Juice', amount: '25ml',
        substitution: { nameZh: '柠檬汁', nameEn: 'Lemon Juice', flavorDelta: { acid: 0.05, sweet: -0.02 }, tags: [{ label: '微调酸度', variant: 'muted' }] } },
      { id: 'salt-rim', nameZh: '盐', nameEn: 'Salt (for rim)', amount: '适量' },
    ],
    steps: [
      { zh: '准备盐口杯', en: 'Salt the rim', duration: '1 min', detail: '用青柠角沿杯口擦拭一圈，将杯口倒扣在盐盘中旋转，均匀粘上盐粒。' },
      { zh: '摇酒', en: 'Shake', duration: '1 min', detail: '龙舌兰、橙味利口酒、青柠汁加入摇酒壶，加满冰。用力摇10-15秒至壶身结霜。' },
      { zh: '双重过滤', en: 'Strain & serve', duration: '1 min', detail: '双重过滤入盐口杯，青柠片装饰。经典玛格丽特不加冰，纯饮才够味。' },
    ],
  },

  /* ════════════════════════════════════════════════════════════════
     无酒精饮品 — Mocktails
     ════════════════════════════════════════════════════════════════ */

  {
    id: 'lemon-mint-water',
    emoji: '🍋',
    accent: '#FDD835',
    nameZh: '柠檬薄荷水',
    nameEn: 'Lemon Mint Infused Water',
    category: 'drink',
    tags: ['无酒精', '无酒精', '清爽', '解暑', '快手'],
    difficulty: 'easy',
    prepTime: '5 min',
    totalKcal: 15,
    macros: { protein: 0.0, fats: 0.0, carbs: 1.0 },
    flavorProfile: { acid: 0.65, sweet: 0.20, bitter: 0.05, spicy: 0.0, salty: 0.0, umami: 0.02 },
    ingredients: [
      { id: 'lemon2', nameZh: '柠檬', nameEn: 'Lemon', amount: '1个',
        substitution: { nameZh: '青柠', nameEn: 'Lime', flavorDelta: { acid: 0.08, bitter: -0.03 }, tags: [{ label: '更酸爽', variant: 'muted' }] } },
      { id: 'mint2', nameZh: '薄荷叶', nameEn: 'Fresh Mint', amount: '6-8片' },
      { id: 'honey', nameZh: '蜂蜜', nameEn: 'Honey', amount: '15ml',
        substitution: { nameZh: '枫糖浆', nameEn: 'Maple Syrup', flavorDelta: { sweet: 0.03, bitter: 0.02 }, tags: [{ label: '风味变化', variant: 'muted' }] } },
      { id: 'water2', nameZh: '冰水', nameEn: 'Ice Water', amount: '300ml' },
    ],
    steps: [
      { zh: '准备柠檬', en: 'Prep lemon', duration: '1 min', detail: '柠檬切薄片，保留几片装饰用。去籽避免苦味。' },
      { zh: '捣薄荷', en: 'Muddle mint', duration: '1 min', detail: '玻璃杯中放入薄荷叶，轻轻捣几下释放精油。不要过度捣碎。' },
      { zh: '混合装杯', en: 'Mix & serve', duration: '1 min', detail: '加入柠檬片、蜂蜜和冰水，搅拌均匀。杯口装饰柠檬片和薄荷嫩尖。' },
    ],
  },

  {
    id: 'passion-sparkler',
    emoji: '🍊',
    accent: '#FF9800',
    nameZh: '百香果气泡饮',
    nameEn: 'Passion Fruit Sparkler',
    category: 'drink',
    tags: ['无酒精', '无酒精', '气泡', '热带', '派对'],
    difficulty: 'easy',
    prepTime: '5 min',
    totalKcal: 80,
    macros: { protein: 0.0, fats: 0.0, carbs: 1.0 },
    flavorProfile: { acid: 0.70, sweet: 0.55, bitter: 0.10, spicy: 0.0, salty: 0.0, umami: 0.05 },
    ingredients: [
      { id: 'passion-fruit', nameZh: '百香果', nameEn: 'Passion Fruit', amount: '2个',
        substitution: { nameZh: '芒果泥', nameEn: 'Mango Puree', flavorDelta: { sweet: 0.10, acid: -0.15 }, tags: [{ label: '更甜', variant: 'amber' }, { label: '口感不同', variant: 'muted' }] } },
      { id: 'sparkling-water', nameZh: '气泡水', nameEn: 'Sparkling Water', amount: '200ml',
        substitution: { nameZh: '苏打水', nameEn: 'Soda Water', flavorDelta: {}, tags: [{ label: '无差别', variant: 'muted' }] } },
      { id: 'sugar-syrup2', nameZh: '糖浆', nameEn: 'Simple Syrup', amount: '15ml',
        substitution: { nameZh: '蜂蜜', nameEn: 'Honey', flavorDelta: { sweet: 0.03, bitter: 0.02 }, tags: [{ label: '更醇厚', variant: 'muted' }] } },
      { id: 'ice2', nameZh: '冰块', nameEn: 'Ice Cubes', amount: '适量' },
    ],
    steps: [
      { zh: '取出果肉', en: 'Scoop passion fruit', duration: '1 min', detail: '百香果对半切开，用小勺将果肉和籽舀入杯中。' },
      { zh: '加入糖浆', en: 'Add syrup', duration: '1 min', detail: '加入糖浆与百香果肉搅拌均匀。可根据个人喜好调整甜度。' },
      { zh: '注入气泡水', en: 'Top with sparkling water', duration: '1 min', detail: '加入冰块，沿杯壁缓缓注入冰镇气泡水。轻搅融合分层的果肉。' },
    ],
  },

  {
    id: 'ginger-honey-tea',
    emoji: '🫖',
    accent: '#FFB300',
    nameZh: '姜汁蜂蜜茶',
    nameEn: 'Ginger Honey Tea',
    category: 'drink',
    tags: ['无酒精', '无酒精', '暖身', '养生', '冬季'],
    difficulty: 'easy',
    prepTime: '10 min',
    totalKcal: 60,
    macros: { protein: 0.0, fats: 0.0, carbs: 1.0 },
    flavorProfile: { acid: 0.10, sweet: 0.45, bitter: 0.15, spicy: 0.55, salty: 0.0, umami: 0.05 },
    ingredients: [
      { id: 'ginger', nameZh: '生姜', nameEn: 'Fresh Ginger', amount: '30g' },
      { id: 'honey2', nameZh: '蜂蜜', nameEn: 'Honey', amount: '20ml',
        substitution: { nameZh: '红糖', nameEn: 'Brown Sugar', flavorDelta: { sweet: 0.05, bitter: 0.03 }, tags: [{ label: '更浓郁', variant: 'amber' }, { label: '传统做法', variant: 'muted' }] } },
      { id: 'lemon3', nameZh: '柠檬', nameEn: 'Lemon', amount: '1/2个',
        substitution: { nameZh: '金桔', nameEn: 'Kumquat', flavorDelta: { sweet: 0.05, acid: -0.03 }, tags: [{ label: '更甜口', variant: 'muted' }] } },
      { id: 'hot-water', nameZh: '热水', nameEn: 'Hot Water', amount: '300ml' },
    ],
    steps: [
      { zh: '处理生姜', en: 'Prep ginger', duration: '1 min', detail: '生姜洗净不去皮，切成薄片或细丝。姜皮有药用价值，保留风味更浓郁。' },
      { zh: '煮姜水', en: 'Simmer ginger', duration: '5 min', detail: '姜片放入锅中加300ml水，大火煮开后转小火煮5分钟，让姜的辛辣充分释放。' },
      { zh: '调味装杯', en: 'Season & serve', duration: '1 min', detail: '姜水滤入杯中，挤入柠檬汁，加入蜂蜜搅拌融化。趁热饮用。' },
    ],
  },

  /* ════════════════════════════════════════════════════════════════
     基本功扩展 — Theory & Techniques
     ════════════════════════════════════════════════════════════════ */

  {
    id: 'knife-skills',
    emoji: '🔪',
    accent: '#78909C',
    nameZh: '基础刀工指南',
    nameEn: 'Knife Skills 101',
    category: 'basic',
    tags: ['刀工', '新手入门', '必备理论', '安全'],
    difficulty: 'easy',
    prepTime: '8 min 阅读',
    totalKcal: 0,
    macros: { protein: 0.0, fats: 0.0, carbs: 0.0 },
    flavorProfile: { acid: 0.0, sweet: 0.0, bitter: 0.0, spicy: 0.0, salty: 0.0, umami: 0.0 },
    ingredients: [],
    steps: [
      { zh: '选择刀具', en: 'Choose your knife', duration: '—', detail: '主厨刀是最通用的选择，8寸（20cm）适合大多数家庭厨房。刀身重量适中，刃口锋利是安全的前提。钝刀比快刀更危险——需要更大力度，容易打滑。' },
      { zh: '握刀姿势', en: 'The grip', duration: '—', detail: '拇指和食指捏住刀身根部（刀刃与刀柄连接处），其余三指握住刀柄。这是" pinch grip "，给刀具最大控制力。另一只手用"爪形手势"——指尖内收，指关节向前抵住刀身引导。' },
      { zh: '基本切法：直切', en: 'Basic: straight cut', duration: '—', detail: '刀尖不离砧板，刀身像跷跷板般上下运动。适用于大多数蔬菜和肉类。关键在于节奏稳定，切面整齐。' },
      { zh: '切丝与切丁', en: 'Julienne & dice', duration: '—', detail: '先切成均匀薄片，再将薄片叠起切成丝（Julienne），最后将丝横向切成丁（Dice）。均匀是刀工的灵魂——大小一致才能受热均匀。' },
      { zh: '安全第一', en: 'Safety first', duration: '—', detail: '砧板下铺湿布防滑。刀具用完立刻清洗擦干，不要泡在水槽里。递刀时刀柄朝对方。刀刃朝外放置。' },
    ],
  },

  {
    id: 'seasoning-principles',
    emoji: '🧂',
    accent: '#9E9E9E',
    nameZh: '调味法则',
    nameEn: 'Principles of Seasoning',
    category: 'basic',
    tags: ['调味', '新手入门', '必备理论', '味觉'],
    difficulty: 'easy',
    prepTime: '10 min 阅读',
    totalKcal: 0,
    macros: { protein: 0.0, fats: 0.0, carbs: 0.0 },
    flavorProfile: { acid: 0.0, sweet: 0.0, bitter: 0.0, spicy: 0.0, salty: 0.0, umami: 0.0 },
    ingredients: [],
    steps: [
      { zh: '盐是灵魂', en: 'Salt is everything', duration: '—', detail: '盐不只是"咸"，它能放大其他所有味道。炒菜时分层加盐——每加入一种主要食材就补一点盐，比最后一次性加盐层次丰富得多。尝味是最可靠的调味方式。' },
      { zh: '酸平衡油腻', en: 'Acid cuts fat', duration: '—', detail: '柠檬汁、醋、番茄的酸味能化解油腻感。炸物、红烧菜、奶油料理加一点酸立刻"活"起来。记住：如果一道菜吃起来"还差什么但说不上来"，多半是缺酸。' },
      { zh: '甜味调和', en: 'Sweetness harmonizes', duration: '—', detail: '少量糖不一定是让菜变甜——它能圆润酸味、柔化辣味、平衡咸味。川菜"鱼香"的精髓就是酸甜咸辣的四维平衡。' },
      { zh: '鲜味叠加', en: 'Umami layering', duration: '—', detail: '番茄、芝士、蘑菇、酱油、鱼露、海带——这些都是天然味精。一道菜叠加多种鲜味来源，会产生1+1>2的风味效果。这是意面肉酱和味噌汤"好喝"的秘诀。' },
      { zh: '辣味掌控', en: 'Managing heat', duration: '—', detail: '辣不是味觉而是痛觉。增辣容易降辣难——少量多次加入，每次尝味。油脂和乳制品（牛奶、酸奶）能有效缓解辣味，水反而会让辣素扩散。' },
    ],
  },
  /* ════════════════════════════════════════════════════════════════
     西餐扩展 — Western Extended
     ════════════════════════════════════════════════════════════════ */
  {id:'roast-chicken',emoji:'🍗',accent:'#D84315',nameZh:'迷迭香烤鸡',nameEn:'Rosemary Roast Chicken',category:'western',tags:['烤制','聚会','高蛋白','烤箱'],difficulty:'medium',prepTime:'60 min',totalKcal:520,macros:{protein:0.50,fats:0.35,carbs:0.15},flavorProfile:{acid:0.20,sweet:0.25,bitter:0.15,spicy:0.10,salty:0.60,umami:0.85},ingredients:[{id:'whole-chicken',nameZh:'整鸡',nameEn:'Whole Chicken',amount:'1只(1.5kg)'},{id:'rosemary2',nameZh:'迷迭香',nameEn:'Rosemary',amount:'4支',substitution:{nameZh:'百里香',nameEn:'Thyme',flavorDelta:{sweet:0.05,bitter:0.03},tags:[{label:'风味略异',variant:'muted'}]}},{id:'lemon4',nameZh:'柠檬',nameEn:'Lemon',amount:'1个'},{id:'garlic2',nameZh:'大蒜',nameEn:'Garlic',amount:'1头'},{id:'olive-oil2',nameZh:'橄榄油',nameEn:'Olive Oil',amount:'30ml'},{id:'salt-roast',nameZh:'海盐',nameEn:'Sea Salt',amount:'适量'},{id:'pepper-roast',nameZh:'黑胡椒',nameEn:'Black Pepper',amount:'适量'}],steps:[{zh:'腌制鸡肉',en:'Marinate chicken',duration:'30 min',detail:'整鸡洗净擦干，内外均匀涂抹橄榄油、盐和黑胡椒。鸡腔内塞入迷迭香、柠檬块和蒜瓣。冷藏腌制30分钟。'},{zh:'预热烤箱',en:'Preheat oven',duration:'10 min',detail:'烤箱预热至200°C。烤盘铺锡纸，放上烤架。'},{zh:'烤制',en:'Roast',duration:'40 min',detail:'整鸡胸朝上放入烤箱中层，200°C烤40分钟。中途取出刷一次鸡油。表皮金黄、用筷子戳腿肉无血水流出即熟。'},{zh:'静置',en:'Rest',duration:'10 min',detail:'取出静置10分钟再切分。让肉汁重新分布，每一块都鲜嫩多汁。'}]},
  {id:'garlic-shrimp',emoji:'🦐',accent:'#EF5350',nameZh:'蒜香橄榄油虾',nameEn:'Garlic Shrimp in Olive Oil',category:'western',tags:['海鲜','快手','下酒','西班牙风味'],difficulty:'easy',prepTime:'10 min',totalKcal:280,macros:{protein:0.45,fats:0.40,carbs:0.15},flavorProfile:{acid:0.25,sweet:0.15,bitter:0.05,spicy:0.25,salty:0.65,umami:0.75},ingredients:[{id:'shrimp',nameZh:'大虾',nameEn:'Large Shrimp',amount:'300g'},{id:'garlic3',nameZh:'大蒜',nameEn:'Garlic',amount:'6瓣',substitution:{nameZh:'蒜粉',nameEn:'Garlic Powder',flavorDelta:{spicy:-0.05,umami:-0.03},tags:[{label:'风味减弱',variant:'amber'}]}},{id:'olive-oil3',nameZh:'橄榄油',nameEn:'Olive Oil',amount:'40ml'},{id:'chili-flake',nameZh:'干辣椒碎',nameEn:'Chili Flakes',amount:'适量'},{id:'parsley',nameZh:'欧芹',nameEn:'Parsley',amount:'少许'},{id:'lemon5',nameZh:'柠檬',nameEn:'Lemon',amount:'1/2个'}],steps:[{zh:'处理虾',en:'Prep shrimp',duration:'2 min',detail:'大虾去壳留尾，背部划开去虾线，用厨房纸吸干水分。'},{zh:'制作蒜油',en:'Garlic oil',duration:'2 min',detail:'橄榄油小火加热，放入蒜片和干辣椒碎，慢慢煸至蒜片金黄、香气四溢。'},{zh:'煎虾',en:'Sear shrimp',duration:'3 min',detail:'转大火，放入大虾，每面煎约1.5分钟至变色卷曲。撒上欧芹碎，挤入柠檬汁翻匀出锅。'}]},
  {id:'pesto-pasta',emoji:'🌿',accent:'#66BB6A',nameZh:'青酱意面',nameEn:'Pesto Pasta',category:'western',tags:['意面','快手','素食可选','搅拌机'],difficulty:'easy',prepTime:'15 min',totalKcal:450,macros:{protein:0.15,fats:0.50,carbs:0.35},flavorProfile:{acid:0.35,sweet:0.20,bitter:0.20,spicy:0.05,salty:0.60,umami:0.55},ingredients:[{id:'pasta',nameZh:'意面',nameEn:'Pasta',amount:'200g'},{id:'basil',nameZh:'新鲜罗勒',nameEn:'Fresh Basil',amount:'50g',substitution:{nameZh:'菠菜叶+薄荷',nameEn:'Spinach+Mint',flavorDelta:{sweet:-0.05,bitter:0.03},tags:[{label:'风味不同',variant:'amber'}]}},{id:'pine-nuts',nameZh:'松子',nameEn:'Pine Nuts',amount:'30g',substitution:{nameZh:'核桃',nameEn:'Walnuts',flavorDelta:{bitter:0.05},tags:[{label:'风味略异',variant:'muted'}]}},{id:'parmesan3',nameZh:'帕玛森芝士',nameEn:'Parmesan',amount:'40g'},{id:'garlic4',nameZh:'大蒜',nameEn:'Garlic',amount:'2瓣'},{id:'olive-oil4',nameZh:'橄榄油',nameEn:'Olive Oil',amount:'60ml'},{id:'salt-pesto',nameZh:'盐',nameEn:'Salt',amount:'适量'}],steps:[{zh:'制作青酱',en:'Make pesto',duration:'3 min',detail:'罗勒叶、松子、蒜瓣、帕玛森芝士和橄榄油放入搅拌机，打成顺滑的绿色酱汁。加盐调味。'},{zh:'煮面',en:'Cook pasta',duration:'8 min',detail:'大锅盐水煮意面至弹牙口感。煮好后保留半杯面汤。'},{zh:'拌面装盘',en:'Toss and serve',duration:'2 min',detail:'沥干的意面与青酱混合，加入少许面汤调节稠度。装盘后可额外撒上松子和芝士碎。'}]},
  {id:'beef-stew',emoji:'🍲',accent:'#5D4037',nameZh:'红酒炖牛肉',nameEn:'Red Wine Beef Stew',category:'western',tags:['牛肉','暖身','慢炖','法式'],difficulty:'medium',prepTime:'150 min',totalKcal:550,macros:{protein:0.35,fats:0.30,carbs:0.35},flavorProfile:{acid:0.30,sweet:0.35,bitter:0.20,spicy:0.10,salty:0.65,umami:0.85},ingredients:[{id:'beef-chunk',nameZh:'牛腩',nameEn:'Beef Chuck',amount:'500g'},{id:'red-wine2',nameZh:'红酒',nameEn:'Red Wine',amount:'300ml',substitution:{nameZh:'牛肉高汤+红酒醋',nameEn:'Beef Stock+Red Wine Vinegar',flavorDelta:{acid:0.05,umami:-0.05},tags:[{label:'无酒精替代',variant:'amber'}]}},{id:'carrot2',nameZh:'胡萝卜',nameEn:'Carrot',amount:'2根'},{id:'onion3',nameZh:'洋葱',nameEn:'Onion',amount:'2个'},{id:'celery2',nameZh:'西芹',nameEn:'Celery',amount:'2根'},{id:'tomato-paste',nameZh:'番茄膏',nameEn:'Tomato Paste',amount:'30g'},{id:'bay-leaf',nameZh:'月桂叶',nameEn:'Bay Leaf',amount:'2片'},{id:'beef-stock',nameZh:'牛高汤',nameEn:'Beef Stock',amount:'500ml'}],steps:[{zh:'煎牛肉',en:'Sear beef',duration:'5 min',detail:'牛腩切大块，擦干水分。热油大火将牛肉各面煎至深棕色。盛出备用。'},{zh:'炒蔬菜',en:'Sauté vegetables',duration:'5 min',detail:'同一锅中炒洋葱、胡萝卜、西芹至微黄。加入番茄膏翻炒1分钟。'},{zh:'红酒炖煮',en:'Braise with wine',duration:'10 min',detail:'倒入红酒，大火煮至酒精挥发汤汁减半。放回牛肉，加入高汤和月桂叶。'},{zh:'慢炖',en:'Slow cook',duration:'120 min',detail:'盖上盖子转小火慢炖2小时，至牛肉酥烂用叉子可轻易撕开。中途检查水量，必要时补水。'}]},
  {id:'caprese',emoji:'🧀',accent:'#EF5350',nameZh:'卡布里沙拉',nameEn:'Caprese Salad',category:'western',tags:['沙拉','无需加热','快手','意式'],difficulty:'easy',prepTime:'5 min',totalKcal:220,macros:{protein:0.20,fats:0.60,carbs:0.20},flavorProfile:{acid:0.45,sweet:0.30,bitter:0.10,spicy:0.02,salty:0.50,umami:0.45},ingredients:[{id:'tomato2',nameZh:'番茄',nameEn:'Tomato',amount:'2个(大)'},{id:'mozzarella',nameZh:'马苏里拉芝士',nameEn:'Fresh Mozzarella',amount:'150g',substitution:{nameZh:'布拉塔芝士',nameEn:'Burrata',flavorDelta:{sweet:0.05,umami:0.05},tags:[{label:'更浓郁',variant:'amber'}]}},{id:'basil2',nameZh:'新鲜罗勒叶',nameEn:'Fresh Basil Leaves',amount:'10片'},{id:'olive-oil5',nameZh:'特级初榨橄榄油',nameEn:'Extra Virgin Olive Oil',amount:'20ml'},{id:'balsamic',nameZh:'香醋',nameEn:'Balsamic Vinegar',amount:'10ml',substitution:{nameZh:'红酒醋',nameEn:'Red Wine Vinegar',flavorDelta:{sweet:-0.05,acid:0.05},tags:[{label:'更酸',variant:'muted'}]}},{id:'salt-caprese',nameZh:'海盐片',nameEn:'Flaky Sea Salt',amount:'适量'}],steps:[{zh:'切片摆盘',en:'Slice and arrange',duration:'2 min',detail:'番茄和马苏里拉切成0.5cm厚片。交替摆放在盘中，形成红白相间的圆形排列。'},{zh:'调味',en:'Season',duration:'1 min',detail:'撒上罗勒叶，淋橄榄油和香醋。最后撒海盐片和现磨黑胡椒。'}]},
  {id:'french-onion-soup',emoji:'🧅',accent:'#8D6E63',nameZh:'法式洋葱汤',nameEn:'French Onion Soup',category:'western',tags:['汤品','法式','暖身','经典'],difficulty:'medium',prepTime:'60 min',totalKcal:320,macros:{protein:0.15,fats:0.40,carbs:0.45},flavorProfile:{acid:0.20,sweet:0.55,bitter:0.25,spicy:0.05,salty:0.65,umami:0.75},ingredients:[{id:'onion4',nameZh:'洋葱',nameEn:'Onion',amount:'4个(大)'},{id:'butter2',nameZh:'黄油',nameEn:'Butter',amount:'30g'},{id:'beef-stock2',nameZh:'牛高汤',nameEn:'Beef Stock',amount:'800ml',substitution:{nameZh:'蔬菜高汤',nameEn:'Vegetable Stock',flavorDelta:{umami:-0.10,sweet:0.03},tags:[{label:'素食版',variant:'muted'}]}},{id:'white-wine',nameZh:'白葡萄酒',nameEn:'White Wine',amount:'100ml'},{id:'baguette',nameZh:'法棍面包',nameEn:'Baguette',amount:'4片'},{id:'gruyere',nameZh:'格鲁耶尔芝士',nameEn:'Gruyère Cheese',amount:'100g',substitution:{nameZh:'瑞士芝士',nameEn:'Swiss Cheese',flavorDelta:{umami:-0.03},tags:[{label:'接近',variant:'muted'}]}}],steps:[{zh:'炒洋葱',en:'Caramelize onions',duration:'30 min',detail:'黄油融化，加入切丝的洋葱，中小火慢炒30分钟。耐心是关键———洋葱会从白色变成深金黄，释放极致甜味。'},{zh:'加入液体',en:'Add liquids',duration:'5 min',detail:'加入白葡萄酒大火收干，倒入牛高汤和月桂叶，煮开后转小火。'},{zh:'慢煮',en:'Simmer',duration:'15 min',detail:'小火煮15分钟让风味融合。用盐和黑胡椒调味。'},{zh:'焗烤',en:'Gratinée',duration:'5 min',detail:'汤分入烤碗，放上法棍片，铺满芝士丝。入200°C烤箱焗5分钟至芝士金黄冒泡。'}]},
  {id:'salmon-grill',emoji:'🐟',accent:'#FF7043',nameZh:'柠檬黄油煎三文鱼',nameEn:'Lemon Butter Salmon',category:'western',tags:['海鲜','高蛋白','快手','健康'],difficulty:'easy',prepTime:'15 min',totalKcal:380,macros:{protein:0.45,fats:0.50,carbs:0.05},flavorProfile:{acid:0.40,sweet:0.15,bitter:0.10,spicy:0.05,salty:0.60,umami:0.70},ingredients:[{id:'salmon',nameZh:'三文鱼排',nameEn:'Salmon Fillet',amount:'200g'},{id:'butter3',nameZh:'黄油',nameEn:'Butter',amount:'15g',substitution:{nameZh:'橄榄油',nameEn:'Olive Oil',flavorDelta:{sweet:0.03,umami:-0.03},tags:[{label:'更清爽',variant:'muted'}]}},{id:'lemon6',nameZh:'柠檬',nameEn:'Lemon',amount:'1/2个'},{id:'garlic5',nameZh:'大蒜',nameEn:'Garlic',amount:'2瓣'},{id:'dill',nameZh:'莳萝',nameEn:'Dill',amount:'少许',substitution:{nameZh:'欧芹',nameEn:'Parsley',flavorDelta:{sweet:-0.02},tags:[{label:'风味略异',variant:'muted'}]}},{id:'salt-salmon',nameZh:'盐',nameEn:'Salt',amount:'适量'},{id:'pepper-salmon',nameZh:'黑胡椒',nameEn:'Black Pepper',amount:'适量'}],steps:[{zh:'准备鱼排',en:'Prep salmon',duration:'2 min',detail:'三文鱼排用厨房纸吸干水分，双面撒盐和黑胡椒。皮面划两刀帮助均匀受热。'},{zh:'煎鱼',en:'Sear salmon',duration:'6 min',detail:'中高火热锅不放油，鱼皮面朝下煎4分钟至金黄酥脆。翻面再煎2分钟。加入黄油、蒜瓣和柠檬片。'},{zh:'浇淋',en:'Baste',duration:'1 min',detail:'倾斜锅身，用勺子不断将融化的黄油浇淋在鱼肉表面。挤上柠檬汁，撒莳萝出锅。'}]},
  {id:'tiramisu',emoji:'🍰',accent:'#6D4C41',nameZh:'提拉米苏',nameEn:'Tiramisu',category:'western',tags:['甜点','免烤','意式','咖啡'],difficulty:'medium',prepTime:'30 min',totalKcal:380,macros:{protein:0.08,fats:0.55,carbs:0.37},flavorProfile:{acid:0.15,sweet:0.60,bitter:0.35,spicy:0.0,salty:0.05,umami:0.15},ingredients:[{id:'mascarpone',nameZh:'马斯卡彭芝士',nameEn:'Mascarpone',amount:'250g'},{id:'egg-tiramisu',nameZh:'鸡蛋',nameEn:'Egg',amount:'3个'},{id:'sugar-tiramisu',nameZh:'细砂糖',nameEn:'Caster Sugar',amount:'60g'},{id:'ladyfingers',nameZh:'手指饼干',nameEn:'Ladyfingers',amount:'200g'},{id:'espresso',nameZh:'浓缩咖啡',nameEn:'Espresso',amount:'200ml',substitution:{nameZh:'速溶咖啡',nameEn:'Instant Coffee',flavorDelta:{bitter:-0.05},tags:[{label:'风味略弱',variant:'amber'}]}},{id:'cocoa',nameZh:'可可粉',nameEn:'Cocoa Powder',amount:'适量'},{id:'marsala',nameZh:'马沙拉酒',nameEn:'Marsala Wine',amount:'30ml',substitution:{nameZh:'朗姆酒',nameEn:'Rum',flavorDelta:{sweet:-0.03},tags:[{label:'风味变化',variant:'muted'}]}}],steps:[{zh:'制作芝士糊',en:'Make cream',duration:'5 min',detail:'蛋黄加糖打至浓稠发白，加入马斯卡彭芝士拌匀。蛋白打至硬性发泡，轻轻翻拌入芝士糊中。'},{zh:'浸泡饼干',en:'Soak ladyfingers',duration:'2 min',detail:'浓缩咖啡混合马沙拉酒。手指饼干快速蘸取咖啡液（不要泡太久），铺满容器底部一层。'},{zh:'分层组装',en:'Layer',duration:'3 min',detail:'一层饼干→一层芝士糊→重复。最后表面抹平，筛上厚厚一层可可粉。'},{zh:'冷藏定型',en:'Chill',duration:'20 min',detail:'盖上保鲜膜，冷藏至少4小时（隔夜更佳）。食用前再筛一层可可粉。'}]},

  /* ════════════════════════════════════════════════════════════════
     中餐扩展 — Chinese Extended
     ════════════════════════════════════════════════════════════════ */
  {id:'hongshao-rou',emoji:'🥘',accent:'#BF360C',nameZh:'红烧肉',nameEn:'Red Braised Pork Belly',category:'chinese',tags:['猪肉','下饭','经典','慢炖'],difficulty:'medium',prepTime:'90 min',totalKcal:580,macros:{protein:0.15,fats:0.60,carbs:0.25},flavorProfile:{acid:0.15,sweet:0.50,bitter:0.10,spicy:0.10,salty:0.70,umami:0.85},ingredients:[{id:'pork-belly',nameZh:'五花肉',nameEn:'Pork Belly',amount:'500g'},{id:'soy-sauce-dark',nameZh:'老抽',nameEn:'Dark Soy Sauce',amount:'15ml'},{id:'soy-sauce-light',nameZh:'生抽',nameEn:'Light Soy Sauce',amount:'30ml'},{id:'rock-sugar',nameZh:'冰糖',nameEn:'Rock Sugar',amount:'30g',substitution:{nameZh:'白糖',nameEn:'White Sugar',flavorDelta:{sweet:0.03,bitter:-0.02},tags:[{label:'色泽略差',variant:'amber'}]}},{id:'cooking-wine',nameZh:'料酒',nameEn:'Cooking Wine',amount:'30ml'},{id:'star-anise',nameZh:'八角',nameEn:'Star Anise',amount:'2个'},{id:'cinnamon',nameZh:'桂皮',nameEn:'Cinnamon',amount:'1小段'},{id:'ginger2',nameZh:'姜',nameEn:'Ginger',amount:'4片'}],steps:[{zh:'焯水',en:'Blanch pork',duration:'5 min',detail:'五花肉切3cm方块，冷水入锅煮开焯去血沫，捞出洗净。'},{zh:'炒糖色',en:'Caramelize sugar',duration:'3 min',detail:'锅中少许油，小火将冰糖炒化至棕红色冒小泡。下五花肉快速翻炒上色。'},{zh:'红烧',en:'Braise',duration:'70 min',detail:'加入生抽老抽料酒炒匀，加入没过肉的开水。放入八角桂皮姜片，大火煮开转小火盖盖焖70分钟。'},{zh:'收汁',en:'Reduce sauce',duration:'5 min',detail:'转大火收汁至汤汁浓稠包裹肉块。此时五花肉应能用筷子轻松插入。'}]},
  {id:'yuxiang-rousi',emoji:'🐟',accent:'#D32F2F',nameZh:'鱼香肉丝',nameEn:'Yu Xiang Shredded Pork',category:'chinese',tags:['猪肉','下饭','经典川菜','鱼香味'],difficulty:'medium',prepTime:'20 min',totalKcal:380,macros:{protein:0.25,fats:0.45,carbs:0.30},flavorProfile:{acid:0.50,sweet:0.45,bitter:0.10,spicy:0.55,salty:0.65,umami:0.70},ingredients:[{id:'pork-tenderloin',nameZh:'猪里脊',nameEn:'Pork Tenderloin',amount:'200g'},{id:'wood-ear',nameZh:'木耳',nameEn:'Wood Ear Fungus',amount:'50g'},{id:'carrot3',nameZh:'胡萝卜',nameEn:'Carrot',amount:'1根'},{id:'green-pepper',nameZh:'青椒',nameEn:'Green Pepper',amount:'1个'},{id:'doubanjiang2',nameZh:'郫县豆瓣酱',nameEn:'Doubanjiang',amount:'15g'},{id:'vinegar2',nameZh:'醋',nameEn:'Vinegar',amount:'15ml'},{id:'sugar2',nameZh:'白糖',nameEn:'Sugar',amount:'10g'},{id:'soy-sauce3',nameZh:'生抽',nameEn:'Light Soy Sauce',amount:'15ml'},{id:'garlic6',nameZh:'大蒜',nameEn:'Garlic',amount:'3瓣'},{id:'ginger3',nameZh:'姜',nameEn:'Ginger',amount:'3片'}],steps:[{zh:'切配',en:'Cut ingredients',duration:'5 min',detail:'猪里脊切细丝用料酒淀粉抓匀腌制。木耳胡萝卜青椒切丝。蒜姜切末。'},{zh:'调鱼香汁',en:'Mix sauce',duration:'1 min',detail:'生抽、醋、白糖、淀粉和少量水调成鱼香汁备用。'},{zh:'炒肉丝',en:'Stir-fry pork',duration:'2 min',detail:'热油大火滑炒肉丝至变色盛出。'},{zh:'合炒',en:'Combine',duration:'3 min',detail:'锅中炒香蒜姜末和豆瓣酱至红油析出。下蔬菜丝翻炒。倒回肉丝，淋入鱼香汁大火收汁。'}]},
  {id:'suanla-tang',emoji:'🌶️',accent:'#D32F2F',nameZh:'酸辣汤',nameEn:'Hot and Sour Soup',category:'chinese',tags:['汤品','酸辣','暖身','快手'],difficulty:'easy',prepTime:'15 min',totalKcal:180,macros:{protein:0.15,fats:0.30,carbs:0.55},flavorProfile:{acid:0.70,sweet:0.15,bitter:0.15,spicy:0.65,salty:0.60,umami:0.55},ingredients:[{id:'tofu-soup',nameZh:'嫩豆腐',nameEn:'Silken Tofu',amount:'150g'},{id:'egg-soup',nameZh:'鸡蛋',nameEn:'Egg',amount:'1个'},{id:'mushroom-soup2',nameZh:'香菇',nameEn:'Shiitake',amount:'3朵'},{id:'bamboo',nameZh:'笋丝',nameEn:'Bamboo Shoots',amount:'50g'},{id:'vinegar3',nameZh:'香醋',nameEn:'Vinegar',amount:'20ml'},{id:'white-pepper',nameZh:'白胡椒粉',nameEn:'White Pepper',amount:'1茶匙'},{id:'soy-sauce4',nameZh:'生抽',nameEn:'Light Soy Sauce',amount:'10ml'},{id:'sesame-oil',nameZh:'芝麻油',nameEn:'Sesame Oil',amount:'少许'}],steps:[{zh:'准备食材',en:'Prep',duration:'3 min',detail:'豆腐切细丝、香菇切片、笋切丝。鸡蛋打散。'},{zh:'煮汤',en:'Cook soup',duration:'8 min',detail:'高汤或水煮开，放入香菇笋丝煮3分钟。加入豆腐丝生抽煮2分钟。'},{zh:'勾芡调味',en:'Thicken and season',duration:'2 min',detail:'水淀粉勾薄芡，淋入蛋液成蛋花。关火后加醋、白胡椒粉和芝麻油。'}]},
  {id:'congyou-banmian',emoji:'🍜',accent:'#FF8F00',nameZh:'葱油拌面',nameEn:'Scallion Oil Noodles',category:'chinese',tags:['面食','快手','素','上海风味'],difficulty:'easy',prepTime:'15 min',totalKcal:350,macros:{protein:0.10,fats:0.45,carbs:0.45},flavorProfile:{acid:0.10,sweet:0.25,bitter:0.10,spicy:0.05,salty:0.65,umami:0.50},ingredients:[{id:'noodles',nameZh:'细面',nameEn:'Thin Noodles',amount:'200g'},{id:'scallion3',nameZh:'小葱',nameEn:'Scallion',amount:'8根'},{id:'oil',nameZh:'食用油',nameEn:'Cooking Oil',amount:'60ml'},{id:'soy-sauce5',nameZh:'生抽',nameEn:'Light Soy Sauce',amount:'30ml'},{id:'dark-soy',nameZh:'老抽',nameEn:'Dark Soy Sauce',amount:'10ml'},{id:'sugar-noodle',nameZh:'白糖',nameEn:'Sugar',amount:'5g'}],steps:[{zh:'熬葱油',en:'Infuse oil',duration:'10 min',detail:'小葱切段，葱白和葱绿分开。冷油入锅，先放葱白小火慢熬5分钟至微黄，再加葱绿熬5分钟至金黄酥脆。捞出葱酥留用。'},{zh:'调酱汁',en:'Mix sauce',duration:'1 min',detail:'生抽、老抽、白糖加入葱油中，小火搅拌至糖融化。'},{zh:'煮面',en:'Cook noodles',duration:'3 min',detail:'开水下面煮至劲道，捞出沥干，拌入葱油酱汁。放上炸好的葱酥。'}]},
  {id:'jidan-chaofan',emoji:'🍚',accent:'#FFB300',nameZh:'蛋炒饭',nameEn:'Egg Fried Rice',category:'chinese',tags:['主食','快手','新手入门','剩饭利用'],difficulty:'easy',prepTime:'8 min',totalKcal:400,macros:{protein:0.15,fats:0.35,carbs:0.50},flavorProfile:{acid:0.05,sweet:0.15,bitter:0.02,spicy:0.05,salty:0.55,umami:0.50},ingredients:[{id:'rice-fried',nameZh:'隔夜米饭',nameEn:'Day-old Rice',amount:'300g'},{id:'egg-fried',nameZh:'鸡蛋',nameEn:'Egg',amount:'2个'},{id:'scallion4',nameZh:'小葱',nameEn:'Scallion',amount:'2根'},{id:'oil-fried',nameZh:'食用油',nameEn:'Cooking Oil',amount:'20ml'},{id:'salt-fried',nameZh:'盐',nameEn:'Salt',amount:'适量'}],steps:[{zh:'准备',en:'Prep',duration:'1 min',detail:'米饭提前打散（隔夜饭最佳，水分少炒出来粒粒分明）。鸡蛋打散，小葱切葱花。'},{zh:'炒蛋',en:'Scramble eggs',duration:'1 min',detail:'热油倒入蛋液，快速划散至七成熟盛出。'},{zh:'炒饭',en:'Fry rice',duration:'3 min',detail:'锅中补油，大火倒入米饭，用锅铲压散翻炒至粒粒分明。倒回鸡蛋，加盐翻炒均匀。撒葱花出锅。'}]},
  {id:'tangcu-paigu',emoji:'🦴',accent:'#BF360C',nameZh:'糖醋排骨',nameEn:'Sweet and Sour Ribs',category:'chinese',tags:['猪肉','经典','宴客','江浙风味'],difficulty:'medium',prepTime:'40 min',totalKcal:480,macros:{protein:0.20,fats:0.45,carbs:0.35},flavorProfile:{acid:0.55,sweet:0.60,bitter:0.05,spicy:0.05,salty:0.55,umami:0.70},ingredients:[{id:'pork-ribs',nameZh:'猪小排',nameEn:'Pork Ribs',amount:'500g'},{id:'vinegar4',nameZh:'镇江香醋',nameEn:'Black Vinegar',amount:'30ml',substitution:{nameZh:'陈醋',nameEn:'Aged Vinegar',flavorDelta:{sweet:-0.03,acid:0.02},tags:[{label:'更酸',variant:'muted'}]}},{id:'sugar3',nameZh:'白糖',nameEn:'Sugar',amount:'40g'},{id:'soy-sauce6',nameZh:'生抽',nameEn:'Light Soy Sauce',amount:'20ml'},{id:'cooking-wine2',nameZh:'料酒',nameEn:'Cooking Wine',amount:'15ml'},{id:'ginger4',nameZh:'姜',nameEn:'Ginger',amount:'5片'}],steps:[{zh:'焯水',en:'Blanch ribs',duration:'3 min',detail:'排骨冷水下锅煮开焯出血沫，捞出洗净。'},{zh:'炒糖色',en:'Caramelize',duration:'3 min',detail:'少许油小火将白糖炒化至琥珀色。放入排骨快速翻炒上色。'},{zh:'烹醋',en:'Add vinegar',duration:'1 min',detail:'沿锅边淋入香醋，大火烹出醋香。加入生抽、料酒、姜片。'},{zh:'炖煮收汁',en:'Simmer and reduce',duration:'25 min',detail:'加入没过排骨的热水，大火煮开转小火盖盖炖20分钟。转大火收汁至汤汁浓稠挂满排骨。'}]},
  {id:'pidan-doufu',emoji:'🫘',accent:'#78909C',nameZh:'皮蛋豆腐',nameEn:'Century Egg Tofu',category:'chinese',tags:['凉菜','快手','无需加热','下酒'],difficulty:'easy',prepTime:'5 min',totalKcal:150,macros:{protein:0.30,fats:0.40,carbs:0.30},flavorProfile:{acid:0.35,sweet:0.15,bitter:0.20,spicy:0.10,salty:0.65,umami:0.55},ingredients:[{id:'silken-tofu',nameZh:'内酯豆腐',nameEn:'Silken Tofu',amount:'1盒'},{id:'century-egg',nameZh:'皮蛋',nameEn:'Century Egg',amount:'2个'},{id:'soy-sauce7',nameZh:'生抽',nameEn:'Light Soy Sauce',amount:'15ml'},{id:'sesame-oil2',nameZh:'芝麻油',nameEn:'Sesame Oil',amount:'5ml'},{id:'scallion5',nameZh:'小葱',nameEn:'Scallion',amount:'1根'},{id:'chili-oil2',nameZh:'辣椒油',nameEn:'Chili Oil',amount:'适量'}],steps:[{zh:'装盘',en:'Plate tofu',duration:'1 min',detail:'豆腐完整扣入盘中。皮蛋剥壳切瓣，围在豆腐周围。'},{zh:'调味',en:'Season',duration:'1 min',detail:'淋上生抽、芝麻油和辣椒油。撒上葱花。吃的时候用勺子将豆腐和皮蛋一起舀起。'}]},
  {id:'shuizhu-yu',emoji:'🐟',accent:'#D32F2F',nameZh:'水煮鱼',nameEn:'Sichuan Boiled Fish',category:'chinese',tags:['海鲜','麻辣','经典川菜','宴客'],difficulty:'hard',prepTime:'30 min',totalKcal:350,macros:{protein:0.40,fats:0.40,carbs:0.20},flavorProfile:{acid:0.20,sweet:0.15,bitter:0.15,spicy:0.90,salty:0.70,umami:0.75},ingredients:[{id:'fish-fillet',nameZh:'鱼片',nameEn:'Fish Fillet',amount:'300g',substitution:{nameZh:'巴沙鱼',nameEn:'Basa',flavorDelta:{umami:-0.05,sweet:0.02},tags:[{label:'口感不同',variant:'amber'}]}},{id:'bean-sprouts',nameZh:'豆芽',nameEn:'Bean Sprouts',amount:'200g'},{id:'dried-chili2',nameZh:'干辣椒',nameEn:'Dried Chili',amount:'20个'},{id:'sichuan-pepper3',nameZh:'花椒',nameEn:'Sichuan Peppercorn',amount:'2汤匙'},{id:'doubanjiang3',nameZh:'郫县豆瓣酱',nameEn:'Doubanjiang',amount:'20g'},{id:'garlic7',nameZh:'大蒜',nameEn:'Garlic',amount:'5瓣'},{id:'ginger5',nameZh:'姜',nameEn:'Ginger',amount:'5片'}],steps:[{zh:'腌鱼片',en:'Marinate fish',duration:'10 min',detail:'鱼片加料酒、盐、蛋清和淀粉抓匀腌制。'},{zh:'准备底菜',en:'Prep base',duration:'2 min',detail:'豆芽焯水铺在大碗底部。'},{zh:'炒底料',en:'Fry base',duration:'3 min',detail:'油热炒香豆瓣酱、姜蒜。加入高汤煮开。'},{zh:'汆鱼片',en:'Poach fish',duration:'2 min',detail:'鱼片逐片滑入汤中，煮至变白立即捞出铺在豆芽上。倒入汤汁。'},{zh:'泼油',en:'Oil pour',duration:'1 min',detail:'鱼片上铺满干辣椒和花椒。另起锅烧热油至冒烟，泼在辣椒上激发香气。'}]},
  {id:'suanni-xilanhua',emoji:'🥦',accent:'#66BB6A',nameZh:'蒜蓉西兰花',nameEn:'Garlic Broccoli',category:'chinese',tags:['素','快手','健康','新手入门'],difficulty:'easy',prepTime:'8 min',totalKcal:80,macros:{protein:0.20,fats:0.50,carbs:0.30},flavorProfile:{acid:0.10,sweet:0.20,bitter:0.15,spicy:0.05,salty:0.50,umami:0.40},ingredients:[{id:'broccoli',nameZh:'西兰花',nameEn:'Broccoli',amount:'300g'},{id:'garlic-broc',nameZh:'大蒜',nameEn:'Garlic',amount:'5瓣'},{id:'oil-broc',nameZh:'食用油',nameEn:'Cooking Oil',amount:'15ml'},{id:'salt-broc',nameZh:'盐',nameEn:'Salt',amount:'适量'},{id:'oyster-sauce',nameZh:'蚝油',nameEn:'Oyster Sauce',amount:'10ml',substitution:{nameZh:'生抽',nameEn:'Light Soy Sauce',flavorDelta:{umami:-0.05,salty:0.03},tags:[{label:'素食替换',variant:'amber'}]}}],steps:[{zh:'焯西兰花',en:'Blanch broccoli',duration:'2 min',detail:'西兰花掰小朵，沸水加盐焯1分钟至翠绿，捞出过凉水保持脆嫩。'},{zh:'炒蒜蓉',en:'Fry garlic',duration:'1 min',detail:'小火炒香蒜末至微黄。转大火放入西兰花快速翻炒。'},{zh:'调味出锅',en:'Season',duration:'1 min',detail:'加入蚝油和盐，快速翻炒均匀出锅。'}]},
  {id:'majiang-mian',emoji:'🍜',accent:'#8D6E63',nameZh:'麻酱面',nameEn:'Sesame Noodles',category:'chinese',tags:['面食','快手','素','北方风味'],difficulty:'easy',prepTime:'10 min',totalKcal:420,macros:{protein:0.15,fats:0.45,carbs:0.40},flavorProfile:{acid:0.15,sweet:0.25,bitter:0.10,spicy:0.10,salty:0.60,umami:0.55},ingredients:[{id:'noodles2',nameZh:'面条',nameEn:'Noodles',amount:'200g'},{id:'sesame-paste',nameZh:'芝麻酱',nameEn:'Sesame Paste',amount:'30g',substitution:{nameZh:'花生酱',nameEn:'Peanut Butter',flavorDelta:{sweet:0.05,bitter:0.02},tags:[{label:'风味不同',variant:'amber'}]}},{id:'soy-sauce8',nameZh:'生抽',nameEn:'Light Soy Sauce',amount:'15ml'},{id:'vinegar5',nameZh:'香醋',nameEn:'Vinegar',amount:'10ml'},{id:'cucumber',nameZh:'黄瓜',nameEn:'Cucumber',amount:'1根'},{id:'garlic-noodle',nameZh:'大蒜',nameEn:'Garlic',amount:'2瓣'},{id:'sesame-oil3',nameZh:'芝麻油',nameEn:'Sesame Oil',amount:'5ml'}],steps:[{zh:'调酱',en:'Mix sauce',duration:'2 min',detail:'芝麻酱用温水慢慢搅开至顺滑。加入生抽、香醋、蒜末和芝麻油调匀。'},{zh:'煮面',en:'Cook noodles',duration:'3 min',detail:'面条煮熟过凉水，沥干放入碗中。'},{zh:'拌面',en:'Toss',duration:'1 min',detail:'浇上芝麻酱，摆上切好的黄瓜丝。拌匀食用。'}]},

  /* ════════════════════════════════════════════════════════════════
     饮料扩展 — Drink Extended
     ════════════════════════════════════════════════════════════════ */
  {id:'long-island',emoji:'🍹',accent:'#FF6F00',nameZh:'长岛冰茶',nameEn:'Long Island Iced Tea',category:'drink',tags:['含酒精','经典','强劲','聚会'],difficulty:'easy',prepTime:'3 min',totalKcal:240,macros:{protein:0,fats:0,carbs:1},flavorProfile:{acid:0.55,sweet:0.50,bitter:0.25,spicy:0.05,salty:0.02,umami:0.05},ingredients:[{id:'vodka',nameZh:'伏特加',nameEn:'Vodka',amount:'20ml'},{id:'gin',nameZh:'金酒',nameEn:'Gin',amount:'20ml'},{id:'white-rum-liit',nameZh:'白朗姆酒',nameEn:'White Rum',amount:'20ml'},{id:'tequila-liit',nameZh:'龙舌兰酒',nameEn:'Tequila',amount:'20ml'},{id:'triple-sec-liit',nameZh:'橙味利口酒',nameEn:'Triple Sec',amount:'20ml'},{id:'lemon-liit',nameZh:'柠檬汁',nameEn:'Lemon Juice',amount:'30ml'},{id:'cola',nameZh:'可乐',nameEn:'Cola',amount:'适量'}],steps:[{zh:'混合烈酒',en:'Mix spirits',duration:'1 min',detail:'五种烈酒和柠檬汁倒入装满冰的高杯中，搅拌均匀。'},{zh:'注入可乐',en:'Top with cola',duration:'1 min',detail:'沿杯壁缓缓注入可乐至满杯。柠檬片装饰。'}]},
  {id:'espresso-martini',emoji:'🍸',accent:'#4E342E',nameZh:'咖啡马天尼',nameEn:'Espresso Martini',category:'drink',tags:['含酒精','咖啡','经典','餐后酒'],difficulty:'easy',prepTime:'3 min',totalKcal:180,macros:{protein:0,fats:0,carbs:1},flavorProfile:{acid:0.30,sweet:0.45,bitter:0.55,spicy:0.0,salty:0.02,umami:0.05},ingredients:[{id:'vodka-esp',nameZh:'伏特加',nameEn:'Vodka',amount:'50ml'},{id:'coffee-liqueur',nameZh:'咖啡利口酒',nameEn:'Coffee Liqueur',amount:'25ml'},{id:'espresso-shot',nameZh:'浓缩咖啡',nameEn:'Espresso Shot',amount:'30ml'},{id:'simple-syrup-esp',nameZh:'糖浆',nameEn:'Simple Syrup',amount:'10ml'}],steps:[{zh:'摇酒',en:'Shake',duration:'1 min',detail:'所有原料加冰放入摇酒壶，用力摇15秒至壶身结霜。摇得越用力泡沫越丰富。'},{zh:'过滤',en:'Strain',duration:'1 min',detail:'双重过滤入冰过的马天尼杯。表面应有一层细腻的咖啡色泡沫。三颗咖啡豆装饰。'}]},
  {id:'honey-citron-tea',emoji:'🍯',accent:'#FFAB00',nameZh:'蜂蜜柚子茶',nameEn:'Honey Citron Tea',category:'drink',tags:['无酒精','暖身','养生','韩国风味'],difficulty:'easy',prepTime:'5 min',totalKcal:80,macros:{protein:0,fats:0,carbs:1},flavorProfile:{acid:0.45,sweet:0.55,bitter:0.15,spicy:0.0,salty:0.0,umami:0.02},ingredients:[{id:'citron-marmalade',nameZh:'柚子酱',nameEn:'Citron Marmalade',amount:'30g',substitution:{nameZh:'柠檬酱',nameEn:'Lemon Marmalade',flavorDelta:{bitter:-0.05,acid:0.05},tags:[{label:'更酸',variant:'muted'}]}},{id:'honey3',nameZh:'蜂蜜',nameEn:'Honey',amount:'15ml'},{id:'hot-water2',nameZh:'热水',nameEn:'Hot Water',amount:'300ml'}],steps:[{zh:'冲泡',en:'Brew',duration:'1 min',detail:'柚子酱和蜂蜜放入杯中，倒入热水搅拌均匀。'}]},
  {id:'pina-colada',emoji:'🍍',accent:'#FFA726',nameZh:'椰林飘香',nameEn:'Piña Colada',category:'drink',tags:['含酒精','热带','搅拌机','夏日'],difficulty:'easy',prepTime:'3 min',totalKcal:260,macros:{protein:0,fats:0.10,carbs:0.90},flavorProfile:{acid:0.30,sweet:0.70,bitter:0.05,spicy:0.0,salty:0.05,umami:0.05},ingredients:[{id:'white-rum-pc',nameZh:'白朗姆酒',nameEn:'White Rum',amount:'60ml'},{id:'coconut-cream',nameZh:'椰奶',nameEn:'Coconut Cream',amount:'60ml'},{id:'pineapple-juice',nameZh:'菠萝汁',nameEn:'Pineapple Juice',amount:'90ml'},{id:'ice-pc',nameZh:'冰块',nameEn:'Ice',amount:'满杯'}],steps:[{zh:'搅拌',en:'Blend',duration:'1 min',detail:'所有原料加冰放入搅拌机，高速打至顺滑冰沙状。'},{zh:'装杯',en:'Serve',duration:'1 min',detail:'倒入飓风杯或高杯。菠萝角和樱桃装饰。'}]},
  {id:'gin-tonic',emoji:'🍋',accent:'#26C6DA',nameZh:'金汤力',nameEn:'Gin and Tonic',category:'drink',tags:['含酒精','经典','清爽','快手'],difficulty:'easy',prepTime:'2 min',totalKcal:150,macros:{protein:0,fats:0,carbs:1},flavorProfile:{acid:0.50,sweet:0.20,bitter:0.35,spicy:0.0,salty:0.02,umami:0.05},ingredients:[{id:'gin-gt',nameZh:'金酒',nameEn:'Gin',amount:'50ml',substitution:{nameZh:'伏特加',nameEn:'Vodka',flavorDelta:{bitter:-0.20,acid:-0.05},tags:[{label:'缺少植物风味',variant:'amber'}]}},{id:'tonic',nameZh:'汤力水',nameEn:'Tonic Water',amount:'150ml'},{id:'lime-gt',nameZh:'青柠',nameEn:'Lime',amount:'1/2个'}],steps:[{zh:'装杯',en:'Build',duration:'1 min',detail:'杯中加满冰。倒入金酒和汤力水，轻轻提拉吧勺使气泡均匀。青柠角挤汁后放入杯中。'}]},
  {id:'yangzhi-ganlu',emoji:'🥭',accent:'#FFB300',nameZh:'杨枝甘露',nameEn:'Mango Pomelo Sago',category:'drink',tags:['无酒精','甜点','港式','夏日'],difficulty:'easy',prepTime:'20 min',totalKcal:220,macros:{protein:0.02,fats:0.15,carbs:0.83},flavorProfile:{acid:0.35,sweet:0.65,bitter:0.05,spicy:0.0,salty:0.02,umami:0.05},ingredients:[{id:'mango',nameZh:'芒果',nameEn:'Mango',amount:'2个'},{id:'pomelo',nameZh:'柚子肉',nameEn:'Pomelo Pulp',amount:'50g',substitution:{nameZh:'葡萄柚',nameEn:'Grapefruit',flavorDelta:{bitter:0.10,acid:0.05},tags:[{label:'偏苦',variant:'amber'}]}},{id:'sago',nameZh:'西米',nameEn:'Sago',amount:'50g'},{id:'coconut-milk',nameZh:'椰浆',nameEn:'Coconut Milk',amount:'200ml'},{id:'sugar-yz',nameZh:'糖',nameEn:'Sugar',amount:'20g'}],steps:[{zh:'煮西米',en:'Cook sago',duration:'12 min',detail:'水煮开后下西米，中火煮10分钟至中心剩小白点。关火焖至全透明。过冷水沥干。'},{zh:'制作芒果泥',en:'Blend mango',duration:'1 min',detail:'一个芒果切块与椰浆、糖一起打成泥。另一个芒果切小丁备用。'},{zh:'组装',en:'Assemble',duration:'1 min',detail:'碗底铺西米，倒入芒果椰浆。放上芒果丁和撕碎的柚子肉。冷藏后食用更佳。'}]},
  {id:'hot-chocolate',emoji:'🍫',accent:'#5D4037',nameZh:'热巧克力',nameEn:'Hot Chocolate',category:'drink',tags:['无酒精','暖身','甜点','冬日'],difficulty:'easy',prepTime:'5 min',totalKcal:280,macros:{protein:0.08,fats:0.45,carbs:0.47},flavorProfile:{acid:0.05,sweet:0.60,bitter:0.25,spicy:0.0,salty:0.05,umami:0.10},ingredients:[{id:'dark-chocolate',nameZh:'黑巧克力',nameEn:'Dark Chocolate',amount:'50g',substitution:{nameZh:'可可粉+黄油',nameEn:'Cocoa+Butter',flavorDelta:{sweet:-0.05,bitter:0.05},tags:[{label:'需调整甜度',variant:'amber'}]}},{id:'milk',nameZh:'牛奶',nameEn:'Whole Milk',amount:'300ml',substitution:{nameZh:'燕麦奶',nameEn:'Oat Milk',flavorDelta:{sweet:0.03,umami:-0.02},tags:[{label:'植物基',variant:'muted'}]}},{id:'sugar-hc',nameZh:'糖',nameEn:'Sugar',amount:'10g'},{id:'cream-hc',nameZh:'淡奶油',nameEn:'Whipping Cream',amount:'30ml'}],steps:[{zh:'融化巧克力',en:'Melt chocolate',duration:'2 min',detail:'巧克力切碎。牛奶小火加热至微沸，加入巧克力搅拌至融化。'},{zh:'调味装杯',en:'Season and serve',duration:'1 min',detail:'加入糖调味。倒入杯中，顶上挤淡奶油。可撒可可粉或棉花糖装饰。'}]},
  {id:'bloody-mary',emoji:'🍅',accent:'#C62828',nameZh:'血腥玛丽',nameEn:'Bloody Mary',category:'drink',tags:['含酒精','经典','早午餐','咸味'],difficulty:'easy',prepTime:'3 min',totalKcal:130,macros:{protein:0.02,fats:0,carbs:0.98},flavorProfile:{acid:0.45,sweet:0.20,bitter:0.15,spicy:0.40,salty:0.75,umami:0.40},ingredients:[{id:'vodka-bm',nameZh:'伏特加',nameEn:'Vodka',amount:'50ml'},{id:'tomato-juice',nameZh:'番茄汁',nameEn:'Tomato Juice',amount:'120ml'},{id:'lemon-bm',nameZh:'柠檬汁',nameEn:'Lemon Juice',amount:'15ml'},{id:'worcestershire',nameZh:'伍斯特酱',nameEn:'Worcestershire Sauce',amount:'3滴'},{id:'tabasco',nameZh:'辣椒酱',nameEn:'Tabasco',amount:'适量'},{id:'celery-salt',nameZh:'芹菜盐',nameEn:'Celery Salt',amount:'少许'},{id:'black-pepper-bm',nameZh:'黑胡椒',nameEn:'Black Pepper',amount:'适量'}],steps:[{zh:'混合',en:'Mix',duration:'1 min',detail:'所有原料加入加冰的调酒杯中，用吧勺搅拌均匀。'},{zh:'装杯',en:'Serve',duration:'1 min',detail:'倒入加冰的高杯中。芹菜杆和柠檬角装饰。'}]},

  /* ════════════════════════════════════════════════════════════════
     基本功扩展 — Basics Extended
     ════════════════════════════════════════════════════════════════ */
  {id:'boiled-eggs',emoji:'🥚',accent:'#FFCC80',nameZh:'完美煮鸡蛋',nameEn:'Perfect Boiled Eggs',category:'basic',tags:['鸡蛋','新手入门','必备技能'],difficulty:'easy',prepTime:'12 min',totalKcal:140,macros:{protein:0.35,fats:0.60,carbs:0.05},flavorProfile:{acid:0.02,sweet:0.05,bitter:0.02,spicy:0.0,salty:0.10,umami:0.20},ingredients:[{id:'egg-boil',nameZh:'鸡蛋',nameEn:'Egg',amount:'2个'},{id:'water-boil',nameZh:'水',nameEn:'Water',amount:'适量'},{id:'ice-water',nameZh:'冰水',nameEn:'Ice Water',amount:'适量'}],steps:[{zh:'冷水入锅',en:'Start cold',duration:'1 min',detail:'鸡蛋冷水入锅，水量需完全没过鸡蛋。加一勺盐可防止蛋壳破裂。'},{zh:'计时煮',en:'Boil and time',duration:'7 min',detail:'大火煮沸后转中火开始计时：6分钟=溏心、8分钟=半熟、10分钟=全熟。'},{zh:'冰水冷却',en:'Ice bath',duration:'2 min',detail:'煮好后立即捞出浸入冰水中。骤冷使蛋白收缩脱离蛋壳，剥壳更容易。'}]},
  {id:'basic-stock',emoji:'🍖',accent:'#8D6E63',nameZh:'基础高汤',nameEn:'Basic Stock',category:'basic',tags:['汤底','必备技能','基础'],difficulty:'easy',prepTime:'180 min',totalKcal:30,macros:{protein:0.20,fats:0.0,carbs:0.80},flavorProfile:{acid:0.05,sweet:0.20,bitter:0.10,spicy:0.02,salty:0.15,umami:0.60},ingredients:[{id:'chicken-bones',nameZh:'鸡骨架',nameEn:'Chicken Bones',amount:'500g',substitution:{nameZh:'猪骨',nameEn:'Pork Bones',flavorDelta:{umami:0.05,sweet:-0.03},tags:[{label:'风味更浓',variant:'amber'}]}},{id:'onion5',nameZh:'洋葱',nameEn:'Onion',amount:'1个'},{id:'carrot4',nameZh:'胡萝卜',nameEn:'Carrot',amount:'1根'},{id:'celery3',nameZh:'西芹',nameEn:'Celery',amount:'1根'},{id:'bay-leaf2',nameZh:'月桂叶',nameEn:'Bay Leaf',amount:'2片'},{id:'peppercorn',nameZh:'黑胡椒粒',nameEn:'Black Peppercorns',amount:'10粒'}],steps:[{zh:'焯骨头',en:'Blanch bones',duration:'5 min',detail:'鸡骨架冷水下锅煮开，焯去血水和浮沫。捞出冲洗干净。'},{zh:'熬汤',en:'Simmer',duration:'150 min',detail:'骨架放回锅中，加入所有蔬菜和香料。加足量冷水，大火煮开后转最小火，保持微沸。中途撇去浮沫。'},{zh:'过滤',en:'Strain',duration:'2 min',detail:'熬好后用细网筛过滤。冷却后冷藏，表面凝固的油脂可刮掉。分装冷冻可保存3个月。'}]},
  {id:'vinaigrette',emoji:'🥗',accent:'#FFD54F',nameZh:'基础油醋汁',nameEn:'Basic Vinaigrette',category:'basic',tags:['沙拉','必备技能','基础'],difficulty:'easy',prepTime:'3 min',totalKcal:120,macros:{protein:0,fats:0.95,carbs:0.05},flavorProfile:{acid:0.60,sweet:0.10,bitter:0.05,spicy:0.05,salty:0.40,umami:0.05},ingredients:[{id:'olive-oil6',nameZh:'橄榄油',nameEn:'Olive Oil',amount:'45ml'},{id:'vinegar6',nameZh:'红酒醋',nameEn:'Red Wine Vinegar',amount:'15ml',substitution:{nameZh:'柠檬汁',nameEn:'Lemon Juice',flavorDelta:{acid:0.05,sweet:-0.02},tags:[{label:'更清爽',variant:'muted'}]}},{id:'dijon',nameZh:'第戎芥末',nameEn:'Dijon Mustard',amount:'5g'},{id:'honey4',nameZh:'蜂蜜',nameEn:'Honey',amount:'5ml'},{id:'salt-vin',nameZh:'盐',nameEn:'Salt',amount:'适量'},{id:'pepper-vin',nameZh:'黑胡椒',nameEn:'Black Pepper',amount:'适量'}],steps:[{zh:'混合',en:'Mix',duration:'1 min',detail:'醋、芥末、蜂蜜、盐和黑胡椒放入碗中搅拌均匀。'},{zh:'乳化',en:'Emulsify',duration:'1 min',detail:'缓慢倒入橄榄油，同时不停搅拌至酱汁乳化变稠。尝味调整酸度和咸度。'}]},
  {id:'steamed-fish',emoji:'🐠',accent:'#78909C',nameZh:'清蒸鱼基础',nameEn:'Basic Steamed Fish',category:'basic',tags:['海鲜','健康','粤式','基础'],difficulty:'medium',prepTime:'20 min',totalKcal:220,macros:{protein:0.60,fats:0.25,carbs:0.15},flavorProfile:{acid:0.15,sweet:0.25,bitter:0.05,spicy:0.05,salty:0.55,umami:0.75},ingredients:[{id:'whole-fish',nameZh:'鲜鱼',nameEn:'Whole Fresh Fish',amount:'1条(约500g)',substitution:{nameZh:'鱼片',nameEn:'Fish Fillet',flavorDelta:{umami:-0.05},tags:[{label:'蒸制时间减半',variant:'amber'}]}},{id:'ginger6',nameZh:'姜',nameEn:'Ginger',amount:'适量'},{id:'scallion6',nameZh:'葱',nameEn:'Scallion',amount:'3根'},{id:'soy-sauce-fish',nameZh:'蒸鱼豉油',nameEn:'Steamed Fish Soy Sauce',amount:'30ml'},{id:'oil-fish',nameZh:'食用油',nameEn:'Cooking Oil',amount:'30ml'}],steps:[{zh:'处理鱼',en:'Prep fish',duration:'3 min',detail:'鱼洗净，两面各划三刀。姜和葱白切片，葱绿切丝备用。'},{zh:'蒸鱼',en:'Steam',duration:'10 min',detail:'盘中铺姜片和葱段，放上鱼。水开上汽后入蒸锅，大火蒸8-10分钟（根据鱼的大小调整）。'},{zh:'淋油',en:'Oil pour',duration:'1 min',detail:'倒掉盘中蒸出的腥水。铺上葱绿丝和姜丝。烧热油至冒烟，淋在葱姜上激出香气。沿盘边淋入蒸鱼豉油。'}]},
  {id:'pasta-cooking',emoji:'🍝',accent:'#FFCC80',nameZh:'意面烹饪基础',nameEn:'Pasta Cooking Basics',category:'basic',tags:['主食','基础'],difficulty:'easy',prepTime:'5 min 阅读',totalKcal:0,macros:{protein:0,fats:0,carbs:0},flavorProfile:{acid:0,sweet:0,bitter:0,spicy:0,salty:0,umami:0},ingredients:[],steps:[{zh:'水量要够',en:'Plenty of water',duration:'—',detail:'每100g意面至少需要1升水。锅要大，水要多——这是意面不粘连的第一法则。'},{zh:'水里加盐',en:'Salt the water',duration:'—',detail:'水开后加盐，每升水加10g盐。意面煮的过程中吸收盐水，从内部调味。不要往水里加油——油会让酱汁挂不住。'},{zh:'弹牙口感',en:'Al dente',duration:'—',detail:'包装上标注的时间减1分钟开始尝。好的意面应该有一点嚼劲（al dente=咬下去有抵抗感）。煮好后保留一杯面汤，淀粉水是后期拌酱的黄金液体。'},{zh:'酱面融合',en:'Marry sauce and pasta',duration:'—',detail:'沥干的意面不要直接装盘淋酱。把面和酱一起放入炒锅，加少许面汤，中火翻拌1分钟让面充分吸收酱汁。这才是餐厅级别的秘诀。'}]},
  {id:'marinade-basics',emoji:'🧂',accent:'#9E9E9E',nameZh:'腌料基础',nameEn:'Marinade Basics',category:'basic',tags:['调味','基础'],difficulty:'easy',prepTime:'5 min 阅读',totalKcal:0,macros:{protein:0,fats:0,carbs:0},flavorProfile:{acid:0,sweet:0,bitter:0,spicy:0,salty:0,umami:0},ingredients:[],steps:[{zh:'腌料公式',en:'Marinade formula',duration:'—',detail:'万能腌料 = 咸（盐/酱油）+ 酸（醋/柠檬汁）+ 香（蒜/姜/香料）+ 油（橄榄油）。酸软化蛋白质帮助入味，油锁住水分。'},{zh:'时间原则',en:'Timing rules',duration:'—',detail:'海鲜：15-30分钟。鸡肉：30分钟-2小时。猪肉：2-4小时。牛羊肉：4-24小时。过久反而适得其反——酸性太强会使肉质变粉。'},{zh:'干腌vs湿腌',en:'Dry vs wet',duration:'—',detail:'干腌（盐+香料直接涂抹）适合需要焦脆表皮的煎烤料理。湿腌（液体腌料浸泡）适合需要均匀入味的炖煮和炒制。'},{zh:'入味技巧',en:'Deep flavor',duration:'—',detail:'肉表面划刀帮助腌料渗入。腌料中加入少许糖可以促进美拉德反应（焦化），煎出来的色泽更漂亮。'}]},
  {id:'oven-basics',emoji:'🔥',accent:'#FF7043',nameZh:'烤箱使用基础',nameEn:'Oven Basics',category:'basic',tags:['烤制','基础'],difficulty:'easy',prepTime:'5 min 阅读',totalKcal:0,macros:{protein:0,fats:0,carbs:0},flavorProfile:{acid:0,sweet:0,bitter:0,spicy:0,salty:0,umami:0},ingredients:[],steps:[{zh:'预热是关键',en:'Always preheat',duration:'—',detail:'烤箱需预热至设定温度后再放入食物。预热时间约10-15分钟。放入食物前不要在烤箱门口犹豫太久——每次开门温度下降约15°C。'},{zh:'位置决定命运',en:'Rack position',duration:'—',detail:'中层=均匀加热（适合大多数料理）。上层=表面快速上色（适合焗烤芝士）。下层=底部酥脆（适合披萨和面包）。上下火vs热风循环：热风适合多层同时烤，上下火适合单层。'},{zh:'温度换算',en:'Temperature conversion',duration:'—',detail:'180°C=350°F（温和烘烤），200°C=400°F（标准烤制），220°C=425°F（高温快烤）。实际温度可能因烤箱而偏差10-20°C，建议备一个烤箱温度计。'},{zh:'烤盘选择',en:'Pan matters',duration:'—',detail:'浅色烤盘反射热量=适合饼干和蛋糕（不易焦底）。深色烤盘吸收热量=适合蔬菜和肉类（更易上色）。玻璃烤盘导热慢需降温10°C。'}]},
  {id:'stir-fry-basics',emoji:'🍳',accent:'#FF6D00',nameZh:'炒菜基础',nameEn:'Stir-fry Basics',category:'basic',tags:['炒制','基础'],difficulty:'easy',prepTime:'5 min 阅读',totalKcal:0,macros:{protein:0,fats:0,carbs:0},flavorProfile:{acid:0,sweet:0,bitter:0,spicy:0,salty:0,umami:0},ingredients:[],steps:[{zh:'热锅凉油',en:'Hot wok cold oil',duration:'—',detail:'锅烧到冒烟再下油，油温三成热（约100°C）即可下料。这是中式炒菜不粘锅的黄金法则。不粘锅不适合大火爆炒——涂层在高温下会释放有害物质。'},{zh:'备料先行',en:'Mise en place',duration:'—',detail:'所有食材在开火前切好、调味料量好。炒菜是秒级操作，没有时间中途切菜。食材按入锅顺序排列：先炒的放近处。'},{zh:'顺序逻辑',en:'Stir-fry order',duration:'—',detail:'① 爆香（姜蒜辣椒，5-10秒）→ ② 难熟的（肉类、根茎类，1-2分钟）→ ③ 易熟的（叶菜、豆芽，30秒）→ ④ 调味酱汁 → ⑤ 勾芡出锅。'},{zh:'火候把控',en:'Heat control',duration:'—',detail:'家用燃气灶火力只有餐厅的1/3，补救办法：① 分批炒（每次少量才能保持锅温）② 蔬菜提前焯水断生 ③ 肉类提前滑油至七成熟。'}]}
] as Recipe[]