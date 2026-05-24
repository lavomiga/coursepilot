import { useState, useMemo } from "react";
import { Course, ClassCategory, WorkloadLevel } from "../types";
import { Search, ArrowUpDown, Plus, Check } from "lucide-react";

interface DiscoveryViewProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
}

// Complete static catalog database representations translated into Chinese
const CATALOG_DATABASE: Course[] = [
  {
    id: "cs301",
    code: "CS 301",
    name: "数据结构基础",
    credits: 4,
    workload: "High",
    term: "Spring 2024 (Current)",
    match: 100,
    description: "核心基础数据结构，包括树、图、排序排序、散列表以及基础算法复杂度分析。",
    category: "Core Req",
    status: "In Progress",
    difficultyScore: 7,
  },
  {
    id: "cs420",
    code: "CS 420",
    name: "人工智能导论",
    credits: 3,
    workload: "Medium",
    term: "Fall 2024",
    match: 98,
    description: "人工智能核心算法：启发式搜索、知识表示、神经网络基础与提示词工程。",
    category: "Core Req",
    status: "Planned",
    difficultyScore: 6,
  },
  {
    id: "cs460",
    code: "CS 460",
    name: "计算机视觉",
    credits: 3,
    workload: "High",
    term: "Fall 2024",
    match: 98,
    description: "探索图像识别、空间映射与 CNN/ViT 卷积及 Transformer 视觉大模型的最新前沿架构。",
    category: "Computer Science",
    status: "Planned",
    difficultyScore: 8,
  },
  {
    id: "phil220",
    code: "PHIL 220",
    name: "产品设计学伦理",
    credits: 3,
    workload: "Low",
    term: "Fall 2024",
    match: 92,
    description: "从哲学及社会学维度探讨暗黑模式、产品理念冲突与现代人机交互中的 AI 偏差伦理。",
    category: "Humanities",
    status: "Planned",
    difficultyScore: 4,
  },
  {
    id: "cs530",
    code: "CS 530",
    name: "分布式系统架构",
    credits: 4,
    workload: "Intense",
    term: "Spring 2025",
    match: 89,
    description: "学习实现横跨全球集群的高扇出低延迟架构、分布式共识算法 (Raft/Paxos) 以及高可用系统设计。",
    category: "Computer Science",
    status: "Planned",
    difficultyScore: 9,
  },
  {
    id: "cs510",
    code: "CS 510",
    name: "高级机器人学",
    credits: 4,
    workload: "Intense",
    term: "Spring 2025",
    match: 85,
    description: "面向移动与多关节机械臂系统的感知、轨迹规划与反馈控制算法，数学计算载荷极重。",
    category: "Major Req",
    status: "Locked",
    difficultyScore: 9,
    prerequisites: ["CS 301", "CS 420"],
  },
  {
    id: "cs485",
    code: "CS 485",
    name: "深度学习实验课",
    credits: 4,
    workload: "High",
    term: "Future Elective Pool",
    match: 96,
    description: "高强度动手 GPU 编程实验，涵盖 Transformer、自回归扩散模型、语音以及视觉多模态大模型实战。",
    category: "Computer Science",
    status: "Planned",
    difficultyScore: 8,
    prerequisites: ["CS 420"],
  },
  {
    id: "math335",
    code: "MATH 335",
    name: "应用线性代数",
    credits: 3,
    workload: "High",
    term: "Spring 2024 (Current)",
    match: 90,
    description: "向量空间、线性变换、矩阵理论、特征值与特征向量，深度对接机器学习应用数学背景。",
    category: "Math",
    status: "Planned",
    difficultyScore: 7,
  },
  {
    id: "lit310",
    code: "LIT 310",
    name: "UX 叙事结构设计",
    credits: 3,
    workload: "Low",
    term: "Future Elective Pool",
    match: 94,
    description: "把文学虚构结构及创意脚本设计融入到软件交互、游戏关卡模型与视觉动态流程的叙事设计课。",
    category: "Humanities",
    status: "Planned",
    difficultyScore: 3,
  },
  {
    id: "cs411",
    code: "CS 411",
    name: "现代数据库工程",
    credits: 3,
    workload: "Medium",
    term: "Future Elective Pool",
    match: 82,
    description: "关系型数据建模、PostgreSQL 下的高级查询优化、索引、事务 ACID 特性与 NoSQL 组件原理。",
    category: "Core Req",
    status: "Planned",
    difficultyScore: 5,
  },
  {
    id: "cs495",
    code: "CS 495",
    name: "VR虚拟现实设计",
    credits: 3,
    workload: "Medium",
    term: "Future Elective Pool",
    match: 87,
    description: "面向头显设备与空间图谱的 3D 环境实时生成、物理碰撞环、以及轻量级实时光线步进着色器开发。",
    category: "Elective",
    status: "Planned",
    difficultyScore: 6,
  },
  {
    id: "math402",
    code: "MATH 402",
    name: "应用随机过程",
    credits: 4,
    workload: "High",
    term: "Future Elective Pool",
    match: 78,
    description: "马尔可夫链、泊松流分布、布朗运动，在随机参量干扰下的应用数学建模分析。",
    category: "Math",
    status: "Planned",
    difficultyScore: 8,
  }
];

export default function DiscoveryView({ courses, onAddCourse }: DiscoveryViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState<string>("All");
  const [selectedWorkload, setSelectedWorkload] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("match");

  // Determine which classes are already in active roadmap to display Added checkmarks
  const getIsAdded = (code: string) => {
    return courses.some((c) => c.code.toLowerCase() === code.toLowerCase());
  };

  // Categories list for query pill buttons
  const categoryOptions = ["All", "Computer Science", "Humanities", "Math", "Core Req", "Major Req"];
  const workloadOptions = ["All", "Low", "Medium", "High", "Intense"];

  // Display translation mapping
  const categoryDisplayNames: Record<string, string> = {
    "All": "全部科目",
    "Computer Science": "计算机科学与工程",
    "Humanities": "人文社科",
    "Math": "数学与理论",
    "Core Req": "通识基础必修",
    "Major Req": "专业核心必修",
  };

  const workloadDisplayNames: Record<string, string> = {
    "All": "全部载荷级别",
    "Low": "修读轻松",
    "Medium": "中等载荷",
    "High": "偏高挑战",
    "Intense": "高难度极高强度",
  };

  // Filter & Sort Logic via useMemo for speed
  const processedCourses = useMemo(() => {
    let result = [...CATALOG_DATABASE];

    // Typographic search matching
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    // Category filtering
    if (selectedCat !== "All") {
      result = result.filter((c) => c.category === selectedCat);
    }

    // Workload filtering
    if (selectedWorkload !== "All") {
      result = result.filter((c) => c.workload === selectedWorkload);
    }

    // Sorting parameters
    result.sort((a, b) => {
      if (sortBy === "match") return b.match - a.match;
      if (sortBy === "code") return a.code.localeCompare(b.code);
      if (sortBy === "credits") return b.credits - a.credits;
      if (sortBy === "difficulty") return (b.difficultyScore || 0) - (a.difficultyScore || 0);
      return 0;
    });

    return result;
  }, [search, selectedCat, selectedWorkload, sortBy]);

  return (
    <div className="space-y-10">
      
      {/* Visual Search Filter Strip banner */}
      <section className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 p-6 rounded-3xl bg-surface-container-low/30 border border-white/5 relative">
        <div className="flex-1 space-y-1">
          <h3 className="font-display font-bold text-base text-white">CoursePilot 学术科目数据库</h3>
          <p className="font-sans text-xs text-on-surface-variant">在此高效检索、并一键部署权威认证的学分科目至您的学业规划中。</p>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap gap-4 w-full xl:w-auto items-center">
          
          {/* Keyword Search Input */}
          <div className="relative w-full sm:w-60">
            <input
              id="input-catalog-search"
              type="text"
              placeholder="按科目代码、课名或研究主题检索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111317] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none font-sans"
            />
            <Search className="w-3.5 h-3.5 text-on-surface-variant/40 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-2 bg-[#111317] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-on-surface-variant/80">
            <ArrowUpDown className="w-3.5 h-3.5 text-on-surface-variant" />
            <select
              id="select-catalog-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent border-none p-0 focus:ring-0 outline-none text-xs cursor-pointer font-sans"
            >
              <option value="match" className="bg-[#111317] text-white">排序：AI 适配配对值</option>
              <option value="code" className="bg-[#111317] text-white">排序：按科目硬代代码</option>
              <option value="credits" className="bg-[#111317] text-white">排序：修读总学分高低</option>
              <option value="difficulty" className="bg-[#111317] text-white">排序：按课业难度评价</option>
            </select>
          </div>

        </div>
      </section>

      {/* Filter Options Blocks (Pills Lists) */}
      <section className="space-y-4">
        {/* Category Pills line */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-[10px] text-on-surface-variant/50 uppercase tracking-widest mr-2 select-none">
            特定学术板块:
          </span>
          {categoryOptions.map((cat) => (
            <button
              id={`btn-filter-cat-${cat.toLowerCase().replace(" ", "-")}`}
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-full font-sans text-xs border transition-all cursor-pointer ${
                selectedCat === cat
                  ? "bg-primary/10 border-primary/40 text-primary font-medium"
                  : "bg-transparent border-white/5 text-on-surface-variant hover:border-white/15"
              }`}
            >
              {categoryDisplayNames[cat]}
            </button>
          ))}
        </div>

        {/* Workload Pills line */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-[10px] text-on-surface-variant/50 uppercase tracking-widest mr-2 select-none">
            计划精力投入:
          </span>
          {workloadOptions.map((wl) => (
            <button
              id={`btn-filter-workload-${wl.toLowerCase()}`}
              key={wl}
              onClick={() => setSelectedWorkload(wl)}
              className={`px-3.5 py-1.5 rounded-full font-sans text-xs border transition-all cursor-pointer ${
                selectedWorkload === wl
                  ? "bg-[#00dce6]/10 border-[#00dce6]/45 text-[#00dce6] font-medium"
                  : "bg-transparent border-white/5 text-on-surface-variant hover:border-white/15"
              }`}
            >
              {workloadDisplayNames[wl]}
            </button>
          ))}
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedCourses.map((course) => {
          const isAdded = getIsAdded(course.code);
          return (
            <div 
              key={course.id} 
              className={`glass-panel p-6 rounded-3xl bg-[#1e2024]/10 hover:bg-[#1e2024]/30 flex flex-col justify-between h-80 transition-all border ${
                isAdded 
                  ? "border-[#558dff]/30 shadow-[0_0_15px_rgba(176,198,255,0.06)]" 
                  : "border-white/5"
              }`}
            >
              <div className="space-y-4">
                {/* Upper tags row */}
                <div className="flex justify-between items-start">
                  <span className="p-1 px-2.5 font-sans text-[10px] bg-secondary-container/10 border border-secondary/35 text-secondary font-bold rounded-full">
                    {course.match}% 适配关联
                  </span>
                  <span className="font-sans text-[9px] text-on-surface-variant/70 bg-white/5 px-2 py-0.5 border border-white/5 rounded-full uppercase tracking-wider">
                    {categoryDisplayNames[course.category] || course.category}
                  </span>
                </div>

                {/* Info titles */}
                <div>
                  <span className="font-mono text-[10px] text-on-surface-variant/50 uppercase">{course.code} &bull; {course.credits} 学分</span>
                  <h4 className="font-display font-bold text-base text-white tracking-tight mt-0.5 truncate">
                    {course.name}
                  </h4>
                </div>

                {/* Syllabus summaries */}
                <p className="font-sans text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Course footer info & deployment triggers */}
              <div className="space-y-4 mt-4">
                <div className="flex justify-between items-center text-[10px] font-sans">
                  <span className={`px-2 py-0.5 rounded border font-bold uppercase ${
                    course.workload === "Intense" 
                      ? "bg-red-400/5 text-red-400 border-red-400/20" 
                      : course.workload === "High" 
                        ? "bg-amber-400/5 text-amber-400 border-amber-400/20" 
                        : "bg-green-400/5 text-green-400 border-green-400/10"
                  }`}>
                    载荷: {course.workload === "Intense" ? "极高挑战" : course.workload === "High" ? "挑战度高" : course.workload === "Medium" ? "中等载荷" : "修读轻松"}
                  </span>
                  <span className="text-on-surface-variant/50 font-mono">硬核评分: {course.difficultyScore}/10</span>
                </div>

                {isAdded ? (
                  <div className="w-full py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-1.5 shadow-sm">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    已纳入航线规划中
                  </div>
                ) : (
                  <button 
                    id={`btn-deploy-${course.id}`}
                    onClick={() => onAddCourse(course)}
                    className="w-full py-2.5 bg-primary text-[#001944] hover:bg-[#d9e2ff] font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:shadow-[0_0_12px_rgba(176,198,255,0.2)] active:scale-97 transition-all cursor-pointer font-medium"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    部署至我的学业路线
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {processedCourses.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-white/5 rounded-3xl text-on-surface-variant/40 font-sans">
            科目库内未能寻得匹配的课程。请尝试在上方文本框键入其他检索词重试！
          </div>
        )}
      </section>

    </div>
  );
}
