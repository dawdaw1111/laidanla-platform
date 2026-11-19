// Local examples for the task square. Replace this collection with the task API later.
const examples = [
  { title: '护肤新品主图设计 · 5张', category: '商品主图', mode: '一口价', price: 600, art: 'skincare', remaining: 62, filled: 5, capacity: 10, description: '为护肤新品制作 5 张商品主图，突出产品质感与核心卖点。保留商品外观与包装信息，以温暖、自然的光影呈现产品。', deliverables: '5 张高清商品主图，800 × 800 px，JPG / PNG 格式' },
  { title: '秋冬女装模特换装图 · 8张', category: '模特换装', mode: '比稿', price: 1200, art: 'fashion', remaining: 80, bids: 24, description: '为秋冬女装制作 8 张模特换装图。保持服装版型、颜色和细节一致，整体呈现自然、简约的时装大片风格。', deliverables: '8 张高清模特图，750 × 1000 px，JPG / PNG 格式' },
  { title: '咖啡新品推广短视频 · 15秒', category: '短视频', mode: '一口价', price: 800, art: 'coffee', remaining: 43, filled: 3, capacity: 8, description: '制作一条 15 秒咖啡新品推广短视频，围绕香气、冲泡与日常饮用场景展开，搭配简洁字幕。', deliverables: '1 条 15 秒视频，1080 × 1920 px，MP4 格式，含字幕' },
  { title: '彩妆粉饼详情页设计 · 6屏', category: '详情页', mode: '一口价', price: 900, art: 'powder', remaining: 54, filled: 4, capacity: 8, description: '为彩妆粉饼设计 6 屏电商详情页，清晰呈现产品质地、妆效、色号与使用方法，整体采用暖金色调。', deliverables: '6 屏详情页，750 px 宽，JPG / PNG 格式及可编辑源文件' },
  { title: '精华液商品主图+场景图 · 6张', category: '商品主图', mode: '一口价', price: 750, art: 'serum', remaining: 84, filled: 6, capacity: 12, description: '制作 6 张精华液商品主图及场景图，以通透、干净的画面呈现产品。保留包装与瓶身文字信息。', deliverables: '6 张高清主图与场景图，800 × 800 px，JPG / PNG 格式' },
  { title: '秋冬穿搭种草短视频 · 15秒', category: '短视频', mode: '一口价', price: 1000, art: 'autumn', remaining: 31, filled: 2, capacity: 6, description: '围绕秋冬通勤穿搭制作 15 秒种草短视频，突出面料质感和自然生活场景，节奏轻快。', deliverables: '1 条 15 秒视频，1080 × 1920 px，MP4 格式，含字幕' },
  { title: '护肤品牌上新营销文案 · 3篇', category: '营销文案', mode: '一口价', price: 300, art: 'skincare', remaining: 28, filled: 2, capacity: 5, description: '为护肤品牌撰写 3 篇上新文案，用自然的语言传达产品特色与使用体验。', deliverables: '3 篇营销文案，每篇约 300 字，各附 3 版标题' },
  { title: '通勤外套模特场景图 · 6张', category: '模特换装', mode: '比稿', price: 980, art: 'fashion', remaining: 67, bids: 16, description: '制作 6 张通勤外套模特场景图，服装版型准确，背景简洁自然。', deliverables: '6 张模特场景图，750 × 1000 px，JPG / PNG 格式' },
  { title: '精品咖啡电商主图 · 6张', category: '商品主图', mode: '一口价', price: 720, art: 'coffee', remaining: 36, filled: 3, capacity: 8, description: '制作 6 张咖啡产品主图，以温暖色调突出包装、咖啡豆和冲泡场景。', deliverables: '6 张高清主图，800 × 800 px，JPG / PNG 格式' },
  { title: '轻透底妆上新短视频 · 20秒', category: '短视频', mode: '比稿', price: 1500, art: 'powder', remaining: 96, bids: 12, description: '制作 20 秒底妆上新短视频，展示粉质细节、使用场景与自然妆效。', deliverables: '1 条 20 秒视频，1080 × 1920 px，MP4 格式' },
  { title: '精华液卖点营销文案 · 5篇', category: '营销文案', mode: '一口价', price: 450, art: 'serum', remaining: 19, filled: 1, capacity: 4, description: '围绕精华液产品卖点撰写 5 篇营销文案，遵循品牌提供的成分与功效资料。', deliverables: '5 篇文案，每篇约 200 字，各附 2 版标题' },
  { title: '秋冬针织衫详情页 · 8屏', category: '详情页', mode: '一口价', price: 1100, art: 'autumn', remaining: 73, filled: 2, capacity: 5, description: '为秋冬针织衫制作 8 屏详情页，展示面料、细节、尺寸与穿搭场景。', deliverables: '8 屏详情页，750 px 宽，JPG / PNG 格式及源文件' },
  { title: '面霜节日礼盒场景图 · 4张', category: '商品主图', mode: '比稿', price: 850, art: 'skincare', remaining: 58, bids: 9, description: '制作 4 张面霜节日礼盒场景图，以柔和暖光呈现礼盒质感。', deliverables: '4 张场景图，1200 × 1200 px，JPG / PNG 格式' },
  { title: '大衣秋冬街拍换装图 · 10张', category: '模特换装', mode: '一口价', price: 1600, art: 'fashion', remaining: 101, filled: 3, capacity: 6, description: '制作 10 张大衣街拍换装图，保持人物、服装细节与整体画风一致。', deliverables: '10 张高清换装图，750 × 1000 px，JPG / PNG 格式' },
  { title: '咖啡品牌故事文案 · 2篇', category: '营销文案', mode: '一口价', price: 500, art: 'coffee', remaining: 45, filled: 1, capacity: 3, description: '根据咖啡品牌资料撰写两篇品牌故事，用具体、自然的语言介绍产品。', deliverables: '2 篇品牌故事文案，每篇约 600 字' },
  { title: '粉饼电商商品主图 · 5张', category: '商品主图', mode: '一口价', price: 650, art: 'powder', remaining: 34, filled: 4, capacity: 7, description: '制作 5 张粉饼电商主图，突出轻透粉质与精致包装，保持产品外观准确。', deliverables: '5 张商品主图，800 × 800 px，JPG / PNG 格式' },
  { title: '护肤精华产品详情页 · 6屏', category: '详情页', mode: '比稿', price: 1300, art: 'serum', remaining: 89, bids: 18, description: '制作 6 屏护肤精华详情页，清晰呈现产品信息、使用方法和包装细节。', deliverables: '6 屏详情页，750 px 宽，JPG / PNG 格式及源文件' },
  { title: '秋日生活方式品牌视频 · 30秒', category: '短视频', mode: '比稿', price: 2000, art: 'autumn', remaining: 115, bids: 21, description: '制作 30 秒秋日生活方式视频，通过自然光影与穿搭场景表达品牌风格。', deliverables: '1 条 30 秒视频，1080 × 1920 px，MP4 格式' },
]

export const squareTasks = examples.map((task, index) => ({
  ...task,
  id: `square-${index + 1}`,
  days: 3,
  revisions: 2,
  publishedOrder: index + 1,
  image: `/assets/task-square/${task.art}.webp`,
}))
