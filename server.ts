import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client helper
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Course database (Mock data matching Lumina Academic's theme for initial display/recommendations)
const INITIAL_COURSES = [
  {
    id: "cs301",
    code: "CS 301",
    name: "数据结构",
    credits: 4,
    workload: "High",
    term: "Spring 2024 (当前学期)",
    match: 100,
    description: "基础数据结构，包括二叉树、图论基础、高级排序算法、哈希表及复杂度分析导论。",
    category: "Core Req",
    status: "In Progress",
    difficultyScore: 7,
  },
  {
    id: "cs420",
    code: "CS 420",
    name: "人工智能基础",
    credits: 3,
    workload: "Medium",
    term: "Fall 2024",
    match: 98,
    description: "人工智能核心算法：启发式搜索、博弈论、知识表示、神经网络和前沿的提示词工程。",
    category: "Core Req",
    status: "Planned",
    difficultyScore: 6,
  },
  {
    id: "cs510",
    code: "CS 510",
    name: "高级机器人学",
    credits: 4,
    workload: "Intense",
    term: "Spring 2025",
    match: 85,
    description: "多关节及移动机器人系统的传感器融合、高维路径规划与运动控制算法。数学工作载荷大。",
    category: "Major Req",
    status: "Locked",
    difficultyScore: 9,
    prerequisites: ["CS 301", "CS 420"],
  }
];

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

// 2. API: AI Mentor Chat
app.post("/api/mentor/chat", async (req, res) => {
  try {
    const { message, history, currentRoadmap } = req.body;
    if (!message) {
      return res.status(400).json({ error: "消息内容不能为空" });
    }

    try {
      const ai = getAiClient();
      
      const systemInstruction = `你是一位名为 "CoursePilot" 的 AI 学术导师，正在辅导一位优秀的计算机科学大三学生 Alex Rivera。
你负责帮助 Alex 优化他的课程工作量、完善先修课程依赖网络，并选择最适合的计算机科学与人文社科课程。
请保持回复高度专业、极具鼓舞性且结构清晰。
请结合学术与航行/驾驶舱隐喻（例如：飞行计划、路线优化、平衡载荷）。
使用 Markdown 语法书写标题、加粗文本、列表和表格。
请必须使用中文（Simplified Chinese）回复，绝对不要使用英文生成回答。

这里是 Alex 当前的课程计划状态：
${JSON.stringify(currentRoadmap || INITIAL_COURSES, null, 2)}

如果用户要求你在他们的课程计划中添加某个课程（例如：计算机视觉），请在回复中明确告知：“我已为您更新了航行计划，成功将 [课程名称] 添加至您的 [学期] 计划中！”并对该课程将如何影响他们的整体学业载荷进行专业解读。`;

      // Structure chat context
      const chatContext = [
        {
          role: "user",
          parts: [{ text: "你好！请带我了解 CoursePilot 导师功能。" }]
        },
        {
          role: "model",
          parts: [{ text: "您好，领航员 Alex Rivera。我是您的 AI 学术导师，已准备好协助您构建完整的学术轨道、优化每周功课负荷、避开关键的瓶颈课程并保持高绩点 (GPA)。让我们一起把 Fall 2024 的课表优化得完美无瑕吧。" }]
        }
      ];

      if (history && Array.isArray(history)) {
        history.forEach((m: any) => {
          chatContext.push({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }]
          });
        });
      }

      // Add actual current message
      chatContext.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContext,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text });
    } catch (apiError: any) {
      console.error("Gemini API Error:", apiError);
      // Fallback for missing/failed API keys
      res.json({ 
        reply: `### 🚀 模拟 AI 导师航行反馈\n\n我注意到您提问了：*"${message}"*\n\n*(提示：由于当前未检测到后台 active 会话，您已自动切入内置学术模拟节点。配置 GEMINI_API_KEY 可解锁全功能自适应对话机制。)* \n\n作为您的顾问控制台，我高度建议在您的选修清单里，提前部署并锁死 **计算机视觉 (CS 460)** 这门核心课程，它能够高度互补并大幅巩固您在人工智能以及后续机器人动力感知分支的研究基础，使深层网络架构设计更具保障！您希望一键添加并在 Fall 2024 中安排该课程吗？`
      });
    }
  } catch (error: any) {
    console.error("Mentor Chat Endpoint error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. API: Generate personalized course recommendations using Gemini
app.post("/api/mentor/recommend", async (req, res) => {
  try {
    const { interest, currentRoadmap } = req.body;
    
    try {
      const ai = getAiClient();
      
      const prompt = `根据用户填写的特定兴趣和学科方向： "${interest || 'AI与机器学习'}"，从学术完备角度为其提供并规划推荐3门合适且极富前景的大学选修课程。
注意：所返回推荐课程的 name (课程名称) 以及 description (大纲和课程特征) 内部文案必须全部使用中文表述。
对于每门推荐课程，输出符合以下数据模式的有效 JSON 格式：
{
  "id": "lowercase_slug",
  "code": "CS XXX" 或科目代码格式,
  "name": "中文课程名",
  "credits": 学分数 (3 或者 4),
  "workload": "Low" | "Medium" | "High" | "Intense",
  "term": "Fall 2024" | "Spring 2025" | "Future Elective Pool",
  "match": 匹配关联百分比值 (80 到 99),
  "description": "用中文对课程所研究的前沿技术、主要实践项目或重要理论节点进行深入浅出的简介",
  "category": "Computer Science" | "Humanities" | "Math" | "Elective" | "Major Req",
  "status": "Planned" | "Locked",
  "difficultyScore": 难度系数 (5 到 10)
}
仅返回纯净的 JSON 数组，包含且仅包含 3 个课程，不要在最外层或任何地方包含 markdown 的 JSON 代码块包裹符。`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                code: { type: Type.STRING },
                name: { type: Type.STRING },
                credits: { type: Type.INTEGER },
                workload: { type: Type.STRING },
                term: { type: Type.STRING },
                match: { type: Type.INTEGER },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                status: { type: Type.STRING },
                difficultyScore: { type: Type.INTEGER }
              },
              required: ["id", "code", "name", "credits", "workload", "term", "match", "description", "category", "status"]
            }
          }
        },
      });

      const parsedRecommendations = JSON.parse(response.text.trim());
      res.json({ recommendations: parsedRecommendations });
    } catch (apiError: any) {
      console.error("Gemini recommendation API error:", apiError);
      // Fallback data
      const defaultRecommendations = [
        {
          id: "cs460",
          code: "CS 460",
          name: "计算机视觉与感知深度学习",
          credits: 3,
          workload: "High",
          term: "Fall 2024",
          match: 98,
          description: "研究图像多维特征识别、空间几何坐标重建以及前沿 CNN 与 Transformer 融合的视觉体系建模方法。",
          category: "Computer Science",
          status: "Planned",
          difficultyScore: 8,
        },
        {
          id: "phil220",
          code: "PHIL 220",
          name: "产品设计伦理与人机协作哲学",
          credits: 3,
          workload: "Low",
          term: "Fall 2024",
          match: 92,
          description: "解剖当今商业黑魔法，研讨防沉迷机制、AI 数据歧视偏见以及现代软件交互设计的深层人文价值。",
          category: "Humanities",
          status: "Planned",
          difficultyScore: 4,
        },
        {
          id: "cs530",
          code: "CS 530",
          name: "分布式系统架构工程",
          credits: 4,
          workload: "Intense",
          term: "Spring 2025",
          match: 89,
          description: "在高网络抖动下对全球集群做零损一致性规划，解析 Raft、Multi-Paxos 共识算法与容错微服务落地实践。",
          category: "Computer Science",
          status: "Planned",
          difficultyScore: 9,
        }
      ];
      res.json({ recommendations: defaultRecommendations });
    }
  } catch (error: any) {
    console.error("API Recommend error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite server setup / Production builds
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CoursePilot Flight Deck server cruising smoothly at http://localhost:${PORT}`);
  });
};

startServer();
