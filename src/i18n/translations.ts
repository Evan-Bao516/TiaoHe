export type Locale = 'zh' | 'en'

export const T: Record<string, Record<Locale, string>> = {
  /* App title */
  'app.title':          { zh: 'TiaoHe · 调和',       en: 'TiaoHe · 调和' },
  'app.subtitle':       { zh: '调和五味 · 掌控厨房', en: 'Balance Flavors · Master the Kitchen' },

  /* Tabs */
  'tab.discover':       { zh: '发现',   en: 'Discover' },
  'tab.browse':         { zh: '浏览',   en: 'Browse' },
  'tab.all':            { zh: '全部',   en: 'All' },
  'tab.chinese':        { zh: '中餐',   en: 'Chinese' },
  'tab.western':        { zh: '西餐',   en: 'Western' },
  'tab.drink':          { zh: '饮料',   en: 'Drinks' },
  'tab.basic':          { zh: '基本功', en: 'Basics' },
  'tab.journal':        { zh: '日志',   en: 'Journal' },

  /* Search */
  'search.placeholder': { zh: '搜索菜谱、食材、标签...', en: 'Search recipes, ingredients, tags...' },
  'search.history':     { zh: '最近搜索', en: 'Recent Searches' },
  'search.clear':       { zh: '清除',  en: 'Clear' },
  'search.noResults':   { zh: '没有找到匹配的菜谱', en: 'No matching recipes' },
  'search.tryOther':    { zh: '试试其他关键词或分类', en: 'Try other keywords or categories' },
  'search.results':     { zh: '搜索结果', en: 'Search Results' },

  /* Homepage sections */
  'home.scenes':        { zh: '场景推荐', en: 'Scene Picks' },
  'home.recent':        { zh: '最近看过', en: 'Recently Viewed' },
  'home.suggested':     { zh: '猜你喜欢', en: 'You Might Like' },
  'home.favorites':     { zh: '我的收藏', en: 'My Favorites' },
  'home.browseAll':     { zh: '浏览全部', en: 'Browse All' },
  'home.emptyDiscover': { zh: '浏览菜谱后这里会出现个性化推荐', en: 'Personalized recommendations will appear here after you browse recipes' },
  'home.emptyDiscoverHint': { zh: '去浏览 tab 探索菜谱吧', en: 'Go to the Browse tab to explore recipes' },

  /* Blind box */
  'blindbox.button':    { zh: '不知道吃什么？摇一摇', en: 'Not sure what to make? Shake it!' },
  'blindbox.goto':      { zh: '去看看', en: 'Check it out' },

  /* Preference picker */
  'pref.cuisine':       { zh: '菜系', en: 'Cuisine' },
  'pref.spice':         { zh: '辣度', en: 'Spice' },
  'pref.time':          { zh: '时长', en: 'Time' },
  'pref.type':          { zh: '类型', en: 'Type' },
  'pref.all':           { zh: '不限', en: 'Any' },
  'pref.chinese':       { zh: '中餐', en: 'Chinese' },
  'pref.western':       { zh: '西餐', en: 'Western' },
  'pref.drink':         { zh: '饮料', en: 'Drinks' },
  'pref.spicy':         { zh: '🌶️ 辣', en: '🌶️ Spicy' },
  'pref.mild':          { zh: '🌶 微辣', en: '🌶 Mild' },
  'pref.nospicy':       { zh: '🫑 不辣', en: '🫑 Not' },
  'pref.food':          { zh: '🍽️ 菜', en: '🍽️ Food' },
  'pref.drinkType':     { zh: '🥤 饮料', en: '🥤 Drinks' },
  'pref.reset':         { zh: '重置',   en: 'Reset' },
  'pref.random':        { zh: '随机摇一个', en: 'Random Pick' },
  'pref.noMatch':       { zh: '没有匹配的菜谱，试试放宽条件', en: 'No matches, try relaxing filters' },
  'pref.matchCount':    { zh: '道 · 点击摇一摇', en: 'matches · Tap to roll' },
  'pref.yourTaste':     { zh: '你的口味',          en: 'Your Taste' },
  'pref.resetConfirm':  { zh: '确定要重置口味学习数据吗？这将清除所有偏好。', en: 'Reset taste learning data? This clears all preferences.' },
  'pref.autoHint':      { zh: '已根据你的口味自动排序。手动设置将覆盖自动偏好。', en: 'Sorted by your taste. Manual filters will override.' },
  'pref.sortPreference':{ zh: '按口味推荐',          en: 'By Taste' },
  'pref.sortAlpha':     { zh: '按名称 A-Z',          en: 'A-Z' },
  'pref.explore':       { zh: '🌱 尝鲜',               en: '🌱 Explore' },

  /* Filters */
  'filter.quick':       { zh: '快捷筛选', en: 'Quick Filter' },
  'filter.difficulty':  { zh: '难度', en: 'Difficulty' },
  'filter.clearAll':    { zh: '✕ 清除所有筛选', en: '✕ Clear All' },
  'filter.makeable':    { zh: '我能做的', en: 'I Can Make' },

  /* Difficulty */
  'diff.easy':          { zh: '新手', en: 'Easy' },
  'diff.medium':        { zh: '进阶', en: 'Medium' },
  'diff.hard':          { zh: '硬核', en: 'Hard' },

  /* Recipe card */
  'card.subAll':        { zh: '可替换补齐', en: 'Sub OK' },
  'card.missing':       { zh: '缺', en: 'Miss' },
  'card.replenish':     { zh: '补货', en: 'Add' },
  'card.flavor.umami':  { zh: '鲜香', en: 'Savory' },
  'card.flavor.spicy':  { zh: '麻辣', en: 'Spicy' },
  'card.flavor.mildSpicy':{ zh: '微辣', en: 'Mild' },
  'card.flavor.acid':   { zh: '酸爽', en: 'Tangy' },
  'card.flavor.sweet':  { zh: '回甘', en: 'Sweet' },
  'card.flavor.salty':  { zh: '咸香', en: 'Salty' },
  'card.flavor.bitter': { zh: '微苦', en: 'Bitter' },

  /* Alcohol tags */
  'drink.alcoholic':    { zh: '含酒精', en: 'Alcoholic' },
  'drink.nonalcoholic': { zh: '无酒精', en: 'Non-Alc' },
  'drink.subAll':       { zh: '全部', en: 'All' },
  'drink.subAlcoholic': { zh: '🍸 含酒精', en: '🍸 Alcoholic' },
  'drink.subNonalcoholic':{ zh: '🍃 无酒精', en: '🍃 Non-Alc' },

  /* Scene labels */
  'scene.light':        { zh: '🥗 减脂轻食', en: '🥗 Light & Fit' },
  'scene.party':        { zh: '🎉 聚会宴客', en: '🎉 Party Time' },
  'scene.beginner':     { zh: '🌱 新手入门', en: '🌱 Beginner' },
  'scene.drinks':       { zh: '🥤 饮品时刻', en: '🥤 Drink Time' },

  /* Recipe detail */
  'detail.alchemist':   { zh: 'Alchemist Core', en: 'Alchemist Core' },
  'detail.components':  { zh: 'Components', en: 'Components' },
  'detail.protocol':    { zh: 'Protocol', en: 'Protocol' },
  'detail.totalKcal':   { zh: 'Total Kcal', en: 'Total Kcal' },
  'detail.servings':    { zh: '份量', en: 'Servings' },
  'detail.servingsUnit':{ zh: '人份', en: 'pax' },
  'detail.missing':     { zh: '冰箱中缺少此食材', en: 'Missing from inventory' },
  'detail.addToCart':   { zh: '加入购物清单', en: 'Add to Cart' },
  'detail.subResolved': { zh: '已通过替换解决 — 使用', en: 'Resolved via substitution — use' },
  'detail.subResolvedAlt':{ zh: '替代', en: 'instead' },
  'detail.subWith':     { zh: 'Substitute with', en: 'Substitute with' },
  'detail.theory':      { zh: '理论文章 · 无需食材', en: 'Knowledge Article' },
  'detail.theoryLabel': { zh: '理论文章 · 无需食材', en: 'Theory · No Ingredients' },
  'detail.start':       { zh: 'START', en: 'START' },
  'detail.startSub':    { zh: '开始调和', en: 'Start Cooking' },

  /* Status badges */
  'status.missing':     { zh: '缺', en: 'Miss' },
  'status.substituted': { zh: '已替换', en: 'Subbed' },
  'status.emptyFav':    { zh: '还没有收藏任何菜谱', en: 'No favorites yet' },
  'status.emptyFavHint':{ zh: '点进菜谱详情，点击右上角 ♡ 收藏', en: 'Open a recipe and tap ♡ to save' },
  'status.myFav':       { zh: '❤️ 我的收藏', en: '❤️ My Favorites' },
  'status.clearFilter': { zh: '✕ 清除', en: '✕ Clear' },

  /* Cart */
  'cart.title':         { zh: '购物清单', en: 'Shopping List' },
  'cart.empty':         { zh: '购物清单为空', en: 'Cart is empty' },
  'cart.emptyHint':     { zh: '在菜谱原料列表中点击 + 来添加食材', en: 'Tap + on ingredients to add' },
  'cart.summary':       { zh: '道菜谱', en: 'recipes' },
  'cart.ingredients':   { zh: '种食材', en: 'ingredients' },
  'cart.total':         { zh: '共', en: 'Total' },
  'cart.unit':          { zh: '件', en: 'items' },
  'cart.clear':         { zh: 'Clear', en: 'Clear' },
  'cart.generate':      { zh: 'Generate List', en: 'Generate List' },
  'cart.listTitle':     { zh: '采购清单', en: 'Shopping List' },

  /* Generated list */
  /* Inventory */
  'inv.title':          { zh: '冰箱库存', en: 'Fridge Inventory' },
  'inv.search':         { zh: '搜索食材...', en: 'Search ingredients...' },
  'inv.have':           { zh: '已有', en: 'Have' },
  'inv.missing':        { zh: '缺少', en: 'Missing' },
  'inv.recipeCount':    { zh: '道菜谱', en: 'recipes' },
  'inv.clear':          { zh: '清空', en: 'Clear All' },
  'inv.clearConfirm':   { zh: '确定清空全部库存？', en: 'Clear all inventory?' },

  /* Focus Mode */
  'focus.title':        { zh: 'Focus Mode', en: 'Focus Mode' },
  'focus.exit':         { zh: 'Exit', en: 'Exit' },
  'focus.paused':       { zh: '已暂停', en: 'Paused' },
  'focus.pauseHint':    { zh: '已暂停 — 点击继续', en: 'Paused — Tap to resume' },
  'focus.nextStep':     { zh: 'Next Step', en: 'Next Step' },
  'focus.complete':     { zh: 'Complete', en: 'Complete' },
  'focus.finishReading':{ zh: '完成阅读', en: 'Finish' },
  'focus.continueReading':{ zh: '继续阅读', en: 'Continue' },
  'focus.theoryReading':{ zh: '— 理论阅读 —', en: '— Reading —' },
  'focus.celebrating':  { zh: '🎉 完成!', en: '🎉 Done!' },
  'focus.confirmTitle': { zh: '确定退出吗？', en: 'Exit Focus Mode?' },
  'focus.confirmMsg':   { zh: '当前倒计时进度将丢失', en: 'Countdown progress will be lost' },
  'focus.continueCooking':{ zh: '继续烹饪', en: 'Keep Cooking' },
  'focus.confirmExit':  { zh: '退出', en: 'Exit' },
  'focus.step':         { zh: 'Step', en: 'Step' },
  'focus.rotatePrompt': { zh: '请旋转手机', en: 'Please rotate your device' },
  'focus.rotateHint':   { zh: 'Focus Mode 在横屏下体验更佳', en: 'Focus Mode works best in landscape' },

  /* Toast */
  'toast.addedCart':    { zh: '已加入购物清单 🛒', en: 'Added to cart 🛒' },
  'toast.clearedCart':  { zh: '购物清单已清空', en: 'Cart cleared' },
  'toast.favorited':    { zh: '已加入收藏 ❤️', en: 'Added to favorites ❤️' },
  'toast.unfavorited':  { zh: '已取消收藏', en: 'Removed from favorites' },

  /* Timer */
  'timer.title':        { zh: '计时器', en: 'Timer' },
  'timer.hour':         { zh: '时', en: 'h' },
  'timer.minute':       { zh: '分', en: 'm' },
  'timer.second':       { zh: '秒', en: 's' },
  'timer.start':        { zh: '开始', en: 'Start' },
  'timer.pause':        { zh: '暂停', en: 'Pause' },
  'timer.continue':     { zh: '继续', en: 'Resume' },
  'timer.reset':        { zh: '重新开始', en: 'Restart' },
  'timer.done':         { zh: '✓ 完成!', en: '✓ Done!' },
  'timer.preset':       { zh: '分', en: 'm' },

  /* Inventory */
  'inv.noMatch':        { zh: '没有找到匹配的食材', en: 'No matching ingredients' },
  'inv.emptyHint':      { zh: '勾选你冰箱里已有的食材，系统会自动匹配可制作的菜谱', en: 'Check ingredients you have, we\'ll match recipes automatically' },

  /* Cart list */
  'clist.recipes':      { zh: '📋 今日菜谱', en: '📋 Today\'s Recipes' },
  'clist.shopping':     { zh: '🛒 采购清单', en: '🛒 Shopping List' },
  'clist.servings':     { zh: '份', en: 'serv' },
  'clist.total':        { zh: '总计', en: 'Total' },
  'clist.recipesUnit':  { zh: '道菜谱', en: 'recipes' },
  'clist.itemsUnit':    { zh: '种食材', en: 'ingredients' },
  'clist.pieces':       { zh: '件', en: 'pcs' },
  'clist.perServing':   { zh: '/ 份', en: '/serv' },

  /* Favorites */
  'fav.banner':         { zh: '我的收藏', en: 'My Favorites' },

  /* Discover empty */
  'discover.empty':     { zh: '浏览菜谱后这里会出现个性化推荐', en: 'Browse recipes for personalized picks' },
  'discover.emptyHint': { zh: '去浏览 tab 探索菜谱吧', en: 'Go to Browse tab to explore' },
  'discover.recent':    { zh: '最近', en: 'Recent' },
  'discover.similar':   { zh: '相似', en: 'Similar' },
  'discover.suggested': { zh: '推荐', en: 'For You' },

  /* Misc */
  'misc.kcal':          { zh: 'Total Kcal', en: 'Total Kcal' },
  'misc.servings':      { zh: '人份', en: 'pax' },
  'misc.steps':         { zh: '步', en: 'steps' },
  'misc.items':         { zh: '种食材', en: 'items' },

  /* Cooking Journal */
  'journal.tab':            { zh: '日志', en: 'Journal' },
  'journal.empty':          { zh: '还没有烹饪记录', en: 'No cooking records yet' },
  'journal.emptyHint':      { zh: '做一道菜试试吧', en: 'Cook a recipe to get started' },
  'journal.monthly':        { zh: '本月 {n} 次 · 平均 {r}★ · 用时 {h}h{m}m', en: 'This month: {n} cooks · avg {r}★ · {h}h{m}m' },
  'journal.filter':         { zh: '筛选', en: 'Filter' },
  'journal.clearFilter':    { zh: '清除筛选', en: 'Clear filter' },
  'journal.manualAdd':      { zh: '+ 手动记录', en: '+ Log Entry' },
  'journal.delete':         { zh: '删除', en: 'Delete' },
  'journal.deleteConfirm':  { zh: '确定删除这条记录？', en: 'Delete this entry?' },
  'journal.daysAgo':        { zh: '天前', en: 'd ago' },
  'journal.yesterday':      { zh: '昨天', en: 'Yesterday' },
  'journal.today':          { zh: '今天', en: 'Today' },

  /* Entry Form */
  'entry.title':            { zh: '记录烹饪', en: 'Log Cooking' },
  'entry.rating':           { zh: '评分', en: 'Rating' },
  'entry.actualTime':       { zh: '实际用时（分钟）', en: 'Actual Time (min)' },
  'entry.notes':            { zh: '笔记（可选）', en: 'Notes (optional)' },
  'entry.tags':             { zh: '标签（回车添加）', en: 'Tags (Enter to add)' },
  'entry.photo':            { zh: '📷 拍照', en: '📷 Photo' },
  'entry.submit':           { zh: '保存记录', en: 'Save Entry' },
  'entry.cancel':           { zh: '跳过', en: 'Skip' },
  'entry.tagHint':          { zh: '输入自定义标签，回车添加', en: 'Type tag, press Enter to add' },
  'entry.notesPlaceholder': { zh: '做得怎么样？有什么调整？', en: 'How did it go? Any tweaks?' },
  'entry.tagPlaceholder':   { zh: '例如：宴客、减脂、便当', en: 'e.g. dinner party, meal prep' },
  'entry.changePhoto':      { zh: '更换照片', en: 'Change Photo' },
  'entry.photoSizeLimit':   { zh: '照片大小不能超过 5MB', en: 'Photo size must be under 5MB' },

  /* Reverse Search */
  'tab.reverseSearch':      { zh: '食材搜菜', en: 'Ingredient Search' },
  'rsearch.placeholder':    { zh: '输入食材，回车或逗号添加...', en: 'Type ingredients, press Enter to add...' },
  'rsearch.quickChips':     { zh: '常用食材', en: 'Quick Picks' },
  'rsearch.perfect':        { zh: '全齐', en: 'Perfect' },
  'rsearch.near':           { zh: '接近', en: 'Near' },
  'rsearch.partial':        { zh: '勉强', en: 'Partial' },
  'rsearch.missing':        { zh: '缺', en: 'Miss' },
  'rsearch.subOk':          { zh: '可替换', en: 'Sub OK' },
  'rsearch.addToInventory': { zh: '加入库存', en: 'Add to Fridge' },
  'rsearch.empty':          { zh: '输入食材开始搜索', en: 'Enter ingredients to start searching' },
  'rsearch.noMatch':        { zh: '没有菜谱匹配这些食材', en: 'No recipes match these ingredients' },

  /* Nutrition Dashboard */
  'tab.nutrition':          { zh: '营养',   en: 'Nutrition' },
  'nutri.title':            { zh: '营养概览', en: 'Nutrition Overview' },
  'nutri.totalKcal':        { zh: '总摄入', en: 'Total Calories' },
  'nutri.avgKcalPerDay':    { zh: '日均摄入', en: 'Daily Avg' },
  'nutri.totalCooks':       { zh: '烹饪次数', en: 'Total Cooks' },
  'nutri.avgRating':        { zh: '平均评分', en: 'Avg Rating' },
  'nutri.totalMinutes':     { zh: '总用时', en: 'Total Time' },
  'nutri.macros':           { zh: '营养构成', en: 'Macros' },
  'nutri.protein':          { zh: '蛋白质', en: 'Protein' },
  'nutri.fats':             { zh: '脂肪', en: 'Fats' },
  'nutri.carbs':            { zh: '碳水', en: 'Carbs' },
  'nutri.kcalTrend':        { zh: '热量趋势', en: 'Calorie Trend' },
  'nutri.cuisine':          { zh: '菜系分布', en: 'Cuisine Breakdown' },
  'nutri.tags':             { zh: '标签分布', en: 'Tag Breakdown' },
  'nutri.topRecipes':       { zh: '常做菜谱', en: 'Top Recipes' },
  'nutri.period':           { zh: '时间范围', en: 'Period' },
  'nutri.period7d':         { zh: '最近 7 天', en: 'Last 7 Days' },
  'nutri.period30d':        { zh: '最近 30 天', en: 'Last 30 Days' },
  'nutri.periodAll':        { zh: '全部时间', en: 'All Time' },
  'nutri.detailShow':       { zh: '查看详情', en: 'Show Details' },
  'nutri.detailHide':       { zh: '收起详情', en: 'Hide Details' },
  'nutri.empty':            { zh: '该时间段暂无烹饪记录', en: 'No records in this period' },
  'nutri.emptyHint':        { zh: '调整日期范围或开始烹饪吧', en: 'Adjust the date range or start cooking' },

  /* Meal Planner */
  'tab.planner':            { zh: '计划', en: 'Plans' },
  'planner.newPlan':        { zh: '+ 新建', en: '+ New' },
  'planner.empty':          { zh: '还没有餐食计划', en: 'No meal plans yet' },
  'planner.emptyHint':      { zh: '创建一个计划来安排本周菜单', en: 'Create a plan to organize your meals' },
  'planner.presetWeek':     { zh: '一周备餐', en: 'Weekly Plan' },
  'planner.preset3Day':     { zh: '三日精简', en: '3-Day Plan' },
  'planner.presetBlank':    { zh: '空白开始', en: 'From Scratch' },
  'planner.delete':         { zh: '删除', en: 'Delete' },
  'planner.deleteConfirm':  { zh: '确定删除这个计划？', en: 'Delete this plan?' },
  'planner.deleteSelected': { zh: '确定删除选中的{n}个计划？', en: 'Delete {n} selected plans?' },
  'planner.addDay':         { zh: '+ 添加天', en: '+ Add Day' },
  'planner.addSlot':        { zh: '+ 添加餐次', en: '+ Add Meal' },
  'planner.addRecipe':      { zh: '+ 添加菜谱', en: '+ Add Recipe' },
  'planner.generateList':   { zh: '生成采购清单', en: 'Generate Shopping List' },
  'planner.emptySlot':      { zh: '点选菜谱', en: 'Pick Recipe' },
  'planner.listGenerated':  { zh: '已生成采购清单', en: 'Shopping list generated' },
}
