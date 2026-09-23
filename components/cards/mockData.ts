import type { CardSeries } from "./types";

/** Mock 数据 - 展示富文本样式能力 */
export const MOCK_SERIES: CardSeries[] = [{
  id: "knowledge-demo",
  title: "新质生产力解读",
  template: "knowledge-card",
  pages: [
    // 封面页
    {
      type: "cover",
      content: {
        title: "什么是「新质生产力」？",
        subtitle: "一分钟看懂这个高频热词",
        date: "2025年1月",
        blocks: [
          { emoji: "🔬", content: "科技创新为核心驱动" },
          { emoji: "🌱", content: "绿色低碳可持续发展" },
          { emoji: "🚀", content: "高端化智能化方向" },
        ],
        tags: ["#知识科普", "#热词解读"],
        footer: "左滑查看详情 →",
      },
    },
    // 内容页1 - 展示富文本样式
    {
      type: "content",
      content: {
        title: "📖 核心定义",
        blocks: [
          {
            heading: "官方定义",
            headingStyle: "underline",
            blockStyle: "card",
            content: [
              { text: "以" },
              { text: "科技创新", style: "highlight" },
              { text: "为核心驱动力，以" },
              { text: "高端化、智能化、绿色化", style: "bold" },
              { text: "为方向的先进生产力形态。" },
            ],
          },
          {
            heading: "三大特征",
            blockStyle: "quote",
            content: [
              { text: "① ", style: "large" },
              { text: "创新驱动", style: "circle" },
              { text: " — 原创性技术突破\n" },
              { text: "② ", style: "large" },
              { text: "高效集约", style: "circle" },
              { text: " — 要素配置优化\n" },
              { text: "③ ", style: "large" },
              { text: "绿色低碳", style: "circle" },
              { text: " — 可持续发展" },
            ],
          },
        ],
        footer: "1/2",
      },
    },
    // 内容页2
    {
      type: "content",
      content: {
        title: "🚀 重点领域",
        blocks: [
          {
            heading: "战略性新兴产业",
            content: [
              { text: "人工智能", style: "badge" },
              { text: " " },
              { text: "量子计算", style: "badge" },
              { text: " " },
              { text: "生物技术", style: "badge" },
              { text: "\n" },
              { text: "新能源", style: "box" },
              { text: " " },
              { text: "新材料", style: "box" },
              { text: " " },
              { text: "高端装备", style: "box" },
            ],
          },
          {
            heading: "发展意义",
            headingStyle: "gradient",
            blockStyle: "card",
            content: [
              { text: "推动" },
              { text: "产业升级转型", style: "underline-wavy" },
              { text: "，构建" },
              { text: "现代化产业体系", style: "highlight" },
              { text: "，实现" },
              { text: "高质量发展", style: "large" },
            ],
          },
        ],
        footer: "2/2",
      },
    },
    // 结尾页
    {
      type: "ending",
      content: {
        title: "关注 Lumina",
        subtitle: "热词解读，深入浅出",
        blocks: [
          { emoji: "📰", content: "新闻联播深度解读" },
          { emoji: "💡", content: "让知识触手可及" },
        ],
        footer: "Lumina · 让新闻更有价值",
      },
    },
  ],
},

// ========== 模板2: 行业风向标 ==========
{
  id: "industry-signal",
  title: "本周行业风向",
  template: "knowledge-card",
  pages: [
    {
      type: "cover",
      content: {
        title: "本周行业风向标",
        subtitle: "新闻联播提及次数 TOP5",
        date: "2025.01.20-01.26",
        blocks: [
          { emoji: "🔥", content: [{ text: "人工智能", style: "badge" }, { text: " 提及12次" }] },
          { emoji: "⚡", content: [{ text: "新能源", style: "badge" }, { text: " 提及9次" }] },
          { emoji: "🏭", content: [{ text: "高端制造", style: "badge" }, { text: " 提及7次" }] },
        ],
        tags: ["#行业分析", "#就业风向"],
        footer: "左滑看详细解读 →",
      },
    },
    {
      type: "content",
      content: {
        title: "🔥 人工智能",
        blocks: [
          {
            heading: "本周信号",
            blockStyle: "card",
            content: [
              { text: "国务院常务会议强调加快" },
              { text: "人工智能+", style: "highlight" },
              { text: "行动，推动AI在" },
              { text: "制造、医疗、教育", style: "bold" },
              { text: "等领域落地应用" },
            ],
          },
          {
            heading: "对你意味着什么？",
            blockStyle: "quote",
            content: [
              { text: "💼 ", style: "large" },
              { text: "求职：AI相关岗位持续扩招\n" },
              { text: "📈 ", style: "large" },
              { text: "投资：关注AI应用端企业\n" },
              { text: "📚 ", style: "large" },
              { text: "学习：提升AI工具使用能力" },
            ],
          },
        ],
        footer: "1/3",
      },
    },
    {
      type: "content",
      content: {
        title: "⚡ 新能源",
        blocks: [
          {
            heading: "本周信号",
            blockStyle: "card",
            content: [
              { text: "新能源汽车产销连续" },
              { text: "9年全球第一", style: "highlight" },
              { text: "，充电基础设施建设加速，" },
              { text: "固态电池", style: "bold" },
              { text: "技术取得突破" },
            ],
          },
          {
            heading: "相关机会",
            content: [
              { text: "储能工程师", style: "badge" },
              { text: " " },
              { text: "电池研发", style: "badge" },
              { text: " " },
              { text: "充电桩运维", style: "badge" },
            ],
          },
        ],
        footer: "2/3",
      },
    },
    {
      type: "ending",
      content: {
        title: "关注 Lumina",
        subtitle: "每周行业风向，提前布局",
        blocks: [
          { emoji: "📊", content: "数据驱动的行业洞察" },
          { emoji: "💡", content: "把政策翻译成机会" },
        ],
        footer: "Lumina · 让新闻更有价值",
      },
    },
  ],
},

// ========== 模板3: 城市机会榜 ==========
{
  id: "city-opportunity",
  title: "城市机会榜",
  template: "knowledge-card",
  pages: [
    {
      type: "cover",
      content: {
        title: "本月城市「被点名」榜",
        subtitle: "新闻联播里的城市信号",
        date: "2025年1月",
        blocks: [
          { emoji: "🥇", content: [{ text: "深圳", style: "large" }, { text: " 科技创新高地" }] },
          { emoji: "🥈", content: [{ text: "杭州", style: "large" }, { text: " 数字经济标杆" }] },
          { emoji: "🥉", content: [{ text: "合肥", style: "large" }, { text: " 新能源黑马" }] },
        ],
        tags: ["#城市选择", "#发展机会"],
        footer: "左滑看城市详情 →",
      },
    },
    {
      type: "content",
      content: {
        title: "🏆 深圳",
        blocks: [
          {
            heading: "本月关键词",
            content: [
              { text: "先行示范区", style: "badge" },
              { text: " " },
              { text: "科技自立自强", style: "badge" },
              { text: " " },
              { text: "粤港澳大湾区", style: "badge" },
            ],
          },
          {
            heading: "机会信号",
            blockStyle: "card",
            content: [
              { text: "✓ 高新技术企业数量全国第二\n" },
              { text: "✓ 人才引进政策持续加码\n" },
              { text: "✓ " },
              { text: "低空经济", style: "highlight" },
              { text: "试点城市" },
            ],
          },
        ],
        footer: "1/2",
      },
    },
    {
      type: "content",
      content: {
        title: "📍 合肥",
        blocks: [
          {
            heading: "为什么是黑马？",
            blockStyle: "quote",
            content: [
              { text: "从" },
              { text: "\"最大赌城\"", style: "bold" },
              { text: "到" },
              { text: "\"最牛风投\"", style: "bold" },
              { text: "，押中京东方、蔚来、长鑫存储" },
            ],
          },
          {
            heading: "适合人群",
            content: [
              { text: "新能源从业者", style: "box" },
              { text: " " },
              { text: "半导体工程师", style: "box" },
              { text: "\n" },
              { text: "房价洼地 + 产业红利 = ", style: "normal" },
              { text: "性价比之选", style: "highlight" },
            ],
          },
        ],
        footer: "2/2",
      },
    },
    {
      type: "ending",
      content: {
        title: "关注 Lumina",
        subtitle: "用数据选城市，少走弯路",
        blocks: [
          { emoji: "🗺️", content: "每月城市机会榜更新" },
        ],
        footer: "Lumina · 让选择更清晰",
      },
    },
  ],
},

// ========== 模板4: 政策与我 ==========
{
  id: "policy-for-me",
  title: "政策与我",
  template: "knowledge-card",
  pages: [
    {
      type: "cover",
      content: {
        title: "这条政策和你有什么关系？",
        subtitle: "住房新政速读版",
        date: "2025.01.22",
        blocks: [
          { emoji: "🏠", content: [{ text: "买房门槛", style: "large" }, { text: " 又降了" }] },
          { emoji: "💰", content: [{ text: "首付15%", style: "highlight" }, { text: " 历史最低" }] },
          { emoji: "📍", content: "一二线城市全面放开" },
        ],
        tags: ["#买房攻略", "#政策解读"],
        footer: "左滑看详细解读 →",
      },
    },
    {
      type: "content",
      content: {
        title: "💡 三句话看懂",
        blocks: [
          {
            index: "①",
            blockStyle: "card",
            content: [
              { text: "首套房首付降到" },
              { text: "15%", style: "large" },
              { text: "，100万的房只需15万首付" },
            ],
          },
          {
            index: "②",
            blockStyle: "card",
            content: [
              { text: "房贷利率" },
              { text: "不设下限", style: "highlight" },
              { text: "，部分城市已降到2.9%" },
            ],
          },
          {
            index: "③",
            blockStyle: "card",
            content: [
              { text: "除北上广深核心区，其他地方" },
              { text: "随便买", style: "bold" },
            ],
          },
        ],
        footer: "1/2",
      },
    },
    {
      type: "content",
      content: {
        title: "🎯 你该怎么做？",
        blocks: [
          {
            heading: "刚需族",
            blockStyle: "quote",
            content: [
              { text: "✓ 可以开始看房了，门槛已是历史最低\n" },
              { text: "✓ 重点关注" },
              { text: "公积金贷款", style: "highlight" },
              { text: "额度是否够用" },
            ],
          },
          {
            heading: "观望族",
            blockStyle: "quote",
            content: [
              { text: "✓ 别等\"最低点\"，政策底往往领先市场底\n" },
              { text: "✓ 关注" },
              { text: "核心地段次新房", style: "bold" },
              { text: "，抗跌性更强" },
            ],
          },
        ],
        footer: "2/2",
      },
    },
    {
      type: "ending",
      content: {
        title: "关注 Lumina",
        subtitle: "把政策翻译成人话",
        blocks: [
          { emoji: "📋", content: "每条政策都告诉你「所以呢」" },
        ],
        footer: "Lumina · 让政策不再难懂",
      },
    },
  ],
}];
