import { useMemo, useState } from "react";
import { Course, ClassCategory } from "../types";
import { 
  GraduationCap, CheckCircle2, AlertCircle, Calendar, Plus, 
  BookOpen, AlertTriangle, Sparkles, Award, Star, ListChecks, ArrowUpRight
} from "lucide-react";

interface DegreeAuditViewProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
}

// Pre-defined graduation curriculum structures for Computer Science & AI track
const CURRICULUM_REQUIREMENTS = [
  {
    category: "Core Req" as ClassCategory,
    displayName: "通识与核心基础必修 (Core Req)",
    requiredCredits: 12,
    description: "构建计算机科学骨干知识。涵盖核心数据结构、算法分析基础、人工智能导论课程。",
    courses: [
      { id: "cs301", code: "CS 301", name: "数据结构基础", credits: 4, category: "Core Req", workload: "High", term: "Spring 2024 (当前学期)", match: 100, description: "核心基础数据结构，包括树、图、排序、散列表以及算法复杂度分析。", status: "In Progress", difficultyScore: 7 },
      { id: "cs420", code: "CS 420", name: "人工智能导论", credits: 3, category: "Core Req", workload: "Medium", term: "Fall 2024", match: 98, description: "人工智能核心算法：启发式搜索、知识表示、神经网络导论。", status: "Planned", difficultyScore: 6 },
      { id: "cs411", code: "CS 411", name: "现代数据库工程", credits: 3, category: "Core Req", workload: "Medium", term: "Future Elective Pool", match: 82, description: "关系型数据建模、PostgreSQL高级查询优化、并发控制事务ACID特性。", status: "Planned", difficultyScore: 5 }
    ]
  },
  {
    category: "Major Req" as ClassCategory,
    displayName: "学术方向专业必修 (Major Req)",
    requiredCredits: 16,
    description: "高级科研分支课程要求。覆盖硬核控制工程、体系结构、以及软硬件协同实验室课。",
    courses: [
      { id: "cs510", code: "CS 510", name: "高级机器人学", credits: 4, category: "Major Req", workload: "Intense", term: "Spring 2025", match: 85, description: "移动及多关节机械臂系统的感知、轨迹规划与反馈控制算法，数学计算极其繁重。", status: "Locked", difficultyScore: 9 }
    ]
  },
  {
    category: "Computer Science" as ClassCategory,
    displayName: "专业深专自选课 (Computer Science Electives)",
    requiredCredits: 12,
    description: "AI与前沿计算领域选修。如计算机视觉、深度学习大模型实战、全球分布式容错系统架构设计。",
    courses: [
      { id: "cs460", code: "CS 460", name: "计算机视觉", credits: 3, category: "Computer Science", workload: "High", term: "Fall 2024", match: 98, description: "图像分类、目标检测、三维空间映射以及维CNN/ViT大模型最前沿视觉架构。", status: "Planned", difficultyScore: 8 },
      { id: "cs530", code: "CS 530", name: "分布式系统架构", credits: 4, category: "Computer Science", workload: "Intense", term: "Spring 2025", match: 89, description: "高容错横跨全球多数据中心的高可用通信模式与共识存储算法研发。", status: "Planned", difficultyScore: 9 },
      { id: "cs485", code: "CS 485", name: "深度学习实验课", credits: 4, category: "Computer Science", workload: "High", term: "Future Elective Pool", match: 96, description: "高强度GPU编程，涵盖Transformer注意力机制、自回归扩散模型与多模态大模型实战。", status: "Planned", difficultyScore: 8 },
      { id: "cs495", code: "CS 495", name: "VR虚拟现实设计", credits: 3, category: "Computer Science", workload: "Medium", term: "Future Elective Pool", match: 87, description: "面向头显设备的空间交互、物理碰撞检测、以及GPU实时着色器渲染。", status: "Planned", difficultyScore: 6 }
    ]
  },
  {
    category: "Math" as ClassCategory,
    displayName: "数学与理论科学 (Math & Theory)",
    requiredCredits: 10,
    description: "大模型研究和科学分析的基础。涵盖线性代数高级变换、随机过程以及数值计算背景。",
    courses: [
      { id: "math335", code: "MATH 335", name: "应用线性代数", credits: 3, category: "Math", workload: "High", term: "Spring 2024 (当前学期)", match: 90, description: "向量空间、矩阵理论、特异值分解，极其强化人工智能参数拟合基础。", status: "Planned", difficultyScore: 7 },
      { id: "math402", code: "MATH 402", name: "应用随机过程", credits: 4, category: "Math", workload: "High", term: "Future Elective Pool", match: 78, description: "马尔可夫链、泊松流分布与布朗运动，学习随机干扰的数学建模解析。", status: "Planned", difficultyScore: 8 }
    ]
  },
  {
    category: "Humanities" as ClassCategory,
    displayName: "跨学科人文与社科通识 (Humanities)",
    requiredCredits: 6,
    description: "人文社科素质拓宽学分。聚焦于产品工程社会学伦理挑战、暗黑交互模式反思与交互式叙事流程设计。",
    courses: [
      { id: "phil220", code: "PHIL 220", name: "产品设计学伦理", credits: 3, category: "Humanities", workload: "Low", term: "Fall 2024", match: 92, description: "围绕现代人机交互系统、算法信息茧房、AI 隐私侵占等伦理问题展开批判探讨。", status: "Planned", difficultyScore: 4 },
      { id: "lit310", code: "LIT 310", name: "UX 叙事结构设计", credits: 3, category: "Humanities", workload: "Low", term: "Future Elective Pool", match: 94, description: "将虚构叙事模式融入软硬件交互交互逻辑、关卡探索和品牌设计中。", status: "Planned", difficultyScore: 3 }
    ]
  }
];

export default function DegreeAuditView({ courses, onAddCourse }: DegreeAuditViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "missing" | "completed">("all");

  // Dynamic Credit calculation helper
  // We classify courses into Completed, In Progress, or Planned based on standard state
  const aggregatedStats = useMemo(() => {
    let completed = 0;
    let planned = 0; 
    let inProgress = 0;

    // We can also count credits by academic area
    const categoryCredits: Record<ClassCategory, { completed: number; total: number }> = {
      "Core Req": { completed: 0, total: 0 },
      "Major Req": { completed: 0, total: 0 },
      "Computer Science": { completed: 0, total: 0 },
      "Math": { completed: 0, total: 0 },
      "Humanities": { completed: 0, total: 0 },
      "Elective": { completed: 0, total: 0 },
    };

    courses.forEach((c) => {
      const creds = c.credits;
      const status = c.status;

      // Classify total stats
      if (status === "Completed") {
        completed += creds;
      } else if (status === "In Progress") {
        inProgress += creds;
      } else {
        planned += creds;
      }

      // Category level stats
      if (categoryCredits[c.category]) {
        if (status === "Completed") {
          categoryCredits[c.category].completed += creds;
        }
        // Total active (completed + planned + in progress)
        categoryCredits[c.category].total += creds;
      }
    });

    const totalGraduationRequirement = 56; // Tailored standard required total for our curated list
    const currentActiveCredits = completed + inProgress + planned;
    const progressPercent = Math.min(100, Math.round((currentActiveCredits / totalGraduationRequirement) * 100));

    return {
      completed,
      planned,
      inProgress,
      totalActive: currentActiveCredits,
      totalRequired: totalGraduationRequirement,
      progressPercent,
      categoryCredits
    };
  }, [courses]);

  // Check if a course is already added in the roadmap
  const isCourseAdded = (code: string) => {
    return courses.some((c) => c.code.toLowerCase() === code.toLowerCase());
  };

  // Get active status of a course in the user's roadmap
  const getCourseStatusInRoadmap = (code: string) => {
    const found = courses.find((c) => c.code.toLowerCase() === code.toLowerCase());
    return found ? found.status : null;
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* 1. Dashboard Overview Banner */}
      <section className="p-8 rounded-3xl bg-gradient-to-br from-[#1a1d24] via-[#15171a] to-[#121316] border border-white/5 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <GraduationCap className="w-64 h-64 text-[#b0c6ff]" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#558dff]/10 border border-[#558dff]/30 text-xs font-bold text-[#b0c6ff]">
              <Sparkles className="w-3.5 h-3.5" />
              学位毕业资格智能核算组件
            </div>
            <h2 className="font-display font-black text-2xl tracking-tight text-white sm:text-3xl">
              Alex Rivera 毕业毕业条件核查
            </h2>
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed text-opacity-80">
              当前毕业计划已通过智能核查，正在对标<strong>计算机科学（AI 领航与自主机器人研究方向）</strong>理学学士学位大纲。系统已自动关联历时成绩单与未来路线安排。
            </p>
          </div>

          {/* Graphical Progress Circle Indicator */}
          <div className="flex items-center gap-6 bg-[#000]/20 p-5 rounded-2xl border border-white/5 w-full lg:w-auto">
            <div className="relative w-16 h-16 flex items-center justify-center">
              {/* Outer stroke line */}
              <svg className="absolute w-full h-full transform -rotate-90">
                <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-white/5" strokeWidth="4" fill="transparent" />
                <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-primary" strokeWidth="4" fill="transparent" 
                        strokeDasharray={175} strokeDashoffset={175 - (175 * aggregatedStats.progressPercent) / 100} strokeLinecap="round" />
              </svg>
              <span className="font-display font-bold text-sm text-white">{aggregatedStats.progressPercent}%</span>
            </div>
            <div>
              <span className="font-sans text-[10px] text-on-surface-variant block uppercase tracking-widest leading-none">
                综合学业进度 (毕业对标)
              </span>
              <span className="font-display font-black text-xl text-white block mt-1 tracking-tight">
                {aggregatedStats.totalActive} / {aggregatedStats.totalRequired} <span className="text-xs font-normal text-on-surface-variant">学分</span>
              </span>
              <p className="font-sans text-[10px] text-[#00dce6] mt-0.5">
                已达标: {aggregatedStats.completed} 学分 | 进行中: {aggregatedStats.inProgress} 学分 | 计划: {aggregatedStats.planned} 学分
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive KPI Row for Academic Requirements */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {CURRICULUM_REQUIREMENTS.map((req) => {
          const stats = aggregatedStats.categoryCredits[req.category] || { completed: 0, total: 0 };
          const completedRate = Math.min(100, Math.round((stats.total / req.requiredCredits) * 100));

          return (
            <div key={req.category} className="glass-panel p-5 rounded-2xl bg-[#1e2024]/20 border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between h-42">
              <div className="space-y-1">
                <span className="font-sans text-[10px] text-on-surface-variant/70 font-bold block uppercase truncate">
                  {req.category} 分支
                </span>
                <h4 className="font-display font-bold text-[13px] text-white tracking-tight line-clamp-1">
                  {req.displayName.split(" (")[0]}
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end text-xs font-sans">
                  <span className="text-on-surface-variant/60">当前已排课:</span>
                  <span className="font-bold text-white font-mono">{stats.total} / {req.requiredCredits} 学分</span>
                </div>
                {/* Micro Progress slider */}
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${
                    completedRate >= 100 ? "bg-emerald-400" : completedRate > 40 ? "bg-primary" : "bg-amber-400"
                  }`} style={{ width: `${completedRate}%` }}></div>
                </div>
                <div className="flex justify-between items-center text-[9px] font-sans">
                  <span className="text-on-surface-variant/40">学分满足率:</span>
                  <span className={completedRate >= 100 ? "text-emerald-400 font-bold" : "text-on-surface-variant"}>{completedRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 3. Detailed Curriculum Requirement Checker Workspace */}
      <section className="glass-panel p-8 rounded-3xl bg-surface-container-low/20 border-white/5 space-y-8">
        
        {/* Inner header controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              模块化前置与加选审核状态
            </h3>
            <p className="font-sans text-xs text-on-surface-variant">
              核对您学位所需的精品大纲课程库，检查是已完成、已规划还是亟待导入。
            </p>
          </div>

          {/* Quick tab filters */}
          <div className="flex items-center p-1 bg-[#111317] border border-white/10 rounded-xl">
            <button
              id="btn-audit-filter-all"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-all ${
                activeTab === "all" ? "bg-white/10 text-white" : "text-on-surface-variant hover:text-white"
              }`}
            >
              全部条目
            </button>
            <button
              id="btn-audit-filter-missing"
              onClick={() => setActiveTab("missing")}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-all ${
                activeTab === "missing" ? "bg-white/10 text-white" : "text-on-surface-variant hover:text-white"
              }`}
            >
              未加选补课 ({
                CURRICULUM_REQUIREMENTS.flatMap(r => r.courses).filter(c => !isCourseAdded(c.code)).length
              })
            </button>
            <button
              id="btn-audit-filter-completed"
              onClick={() => setActiveTab("completed")}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs font-medium transition-all ${
                activeTab === "completed" ? "bg-white/10 text-white" : "text-on-surface-variant hover:text-white"
              }`}
            >
              规划中/已部署
            </button>
          </div>
        </div>

        {/* Categories of syllabus audit stack */}
        <div className="space-y-10">
          {CURRICULUM_REQUIREMENTS.map((categoryGroup) => {
            // Apply current UI filter list
            const filteredCourses = categoryGroup.courses.filter((course) => {
              const isAdded = isCourseAdded(course.code);
              if (activeTab === "missing") return !isAdded;
              if (activeTab === "completed") return isAdded;
              return true;
            });

            if (filteredCourses.length === 0) return null;

            return (
              <div key={categoryGroup.category} className="space-y-4">
                {/* Header for block category */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-l-2 border-[#558dff] pl-4">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white">
                      {categoryGroup.displayName}
                    </h4>
                    <p className="font-sans text-[11px] text-on-surface-variant/80 mt-0.5 leading-relaxed">
                      {categoryGroup.description}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-secondary bg-secondary-container/10 border border-secondary/35 px-2 py-0.5 rounded-full whitespace-nowrap uppercase">
                    最低要求: {categoryGroup.requiredCredits} 学分
                  </span>
                </div>

                {/* Sub row items catalog list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCourses.map((course) => {
                    const isAdded = isCourseAdded(course.code);
                    const roadStatus = getCourseStatusInRoadmap(course.code);

                    return (
                      <div 
                        key={course.id} 
                        className={`p-5 rounded-2xl bg-[#1d1f24]/35 hover:bg-[#1d1f24]/85 border transition-all flex justify-between gap-4 items-start ${
                          isAdded 
                            ? "border-emerald-500/10 hover:border-emerald-500/20 shadow-[-3px_0_0_rgba(16,185,129,0.5)] bg-emerald-500/2" 
                            : "border-white/5 hover:border-white/10 shadow-[-3px_0_0_rgba(239,68,68,0.2)]"
                        }`}
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold text-primary">{course.code}</span>
                            <span className="text-on-surface-variant/30 font-mono text-[8px]">&bull;</span>
                            <span className="font-mono text-[10px] text-on-surface-variant">{course.credits} 学分</span>
                            {course.difficultyScore && (
                              <>
                                <span className="text-on-surface-variant/30 font-mono text-[8px]">&bull;</span>
                                <span className="font-mono text-[9px] text-[#00dce6]">难度: {course.difficultyScore}/10</span>
                              </>
                            )}
                          </div>

                          <h5 className="font-display font-bold text-xs sm:text-sm text-white">{course.name}</h5>
                          <p className="font-sans text-xs text-on-surface-variant/80 line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                        </div>

                        {/* Status / Button element */}
                        <div className="shrink-0 pt-0.5">
                          {isAdded ? (
                            <div className="flex flex-col items-end gap-1.5">
                              {/* Show mapped display status check */}
                              {roadStatus === "Completed" ? (
                                <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-2 py-1 rounded-lg text-[9px] uppercase font-mono tracking-wider">
                                  <CheckCircle2 className="w-3 h-3" />
                                  已修毕
                                </span>
                              ) : roadStatus === "In Progress" ? (
                                <span className="inline-flex items-center gap-1 bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold px-2 py-1 rounded-lg text-[9px] uppercase font-mono tracking-wider animate-pulse">
                                  <ArrowUpRight className="w-3 h-3" />
                                  学季中
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-medium px-2 py-1 rounded-lg text-[9px] uppercase font-mono tracking-wider">
                                  <Calendar className="w-3 h-3" />
                                  规划中
                                </span>
                              )}
                              <span className="font-mono text-[8px] text-on-surface-variant/40 block text-right mt-1">
                                {course.term.split(" ")[0]}
                              </span>
                            </div>
                          ) : (
                            <button
                              id={`btn-import-audit-${course.id}`}
                              onClick={() => {
                                // Add logic to convert back default properties properly
                                const c: Course = {
                                  ...course,
                                  workload: course.workload as any,
                                  category: categoryGroup.category,
                                  status: "Planned"
                                };
                                onAddCourse(c);
                              }}
                              className="px-3 py-1.5 bg-[#558dff]/10 hover:bg-primary hover:text-[#001944] border border-[#558dff]/30 text-[#b0c6ff] rounded-lg text-xs font-sans font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer outline-none active:scale-95 text-center whitespace-nowrap"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              导入规划
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Warning and Advisor recommendations summary sheet */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl bg-surface-container-low/10 border-[#b0c6ff]/10 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
              <Star className="w-4 h-4 text-primary" />
              计算机工程 & 自动导航导师建议
            </h4>
            <div className="space-y-3 font-sans text-xs text-on-surface-variant text-justify leading-relaxed">
              <p>
                您的专业大纲审核显示您目前在<strong>学术方向专业必修 (Major Req)</strong>部分排设较为薄弱，仅安排了《高级机器人学》，这对于应对高度跨学科前沿领域具有较高学术风险。
              </p>
              <p>
                我们强烈推荐您继续补充 <strong className="text-white">CS 411 (现代数据库工程)</strong> 或者 <strong className="text-white">MATH 402 (应用随机过程)</strong>，以此弥补处理异构遥测流式记录和感知信号过滤时的工程硬基础。
              </p>
            </div>
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant/40 pt-2 border-t border-white/5">
            审查标准数据：ACM/IEEE CS-Curriculum 2023 权威大纲自适应对照。
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl bg-amber-500/2 border border-amber-500/20 space-y-4">
          <h4 className="font-display text-sm font-bold text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            学位合规异常警告 (Academic Flags)
          </h4>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            检测到 <strong className="text-white">1 个学位拓扑链阻碍警告</strong>：
          </p>

          <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10 text-xs font-sans space-y-1">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <AlertCircle className="w-4 h-4" />
              前置硬约束未解封警告
            </div>
            <p className="text-[11px] text-on-surface-variant font-sans leading-snug">
              《高级机器人学》的前置解锁强制关联了《人工智能导论》与《数据结构》。虽然《数据结构》(CS 301) 目前正在选修中，但《人工智能导论》在当前未修毕之前，无法直接注册机器人系统高阶课。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
