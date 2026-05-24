import React, { useState } from "react";
import { Course } from "../types";
import { Verified, Brain, Lock, AlertCircle, Plus, Info, Sparkles, Wand2 } from "lucide-react";

interface DashboardViewProps {
  courses: Course[];
  recommendedCourses: Course[];
  isLoadingRecs: boolean;
  onAddCourse: (course: Course) => void;
  onRecommendForInterest: (interest: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({
  courses,
  recommendedCourses,
  isLoadingRecs,
  onAddCourse,
  onRecommendForInterest,
  setActiveTab,
}: DashboardViewProps) {
  const [customInterest, setCustomInterest] = useState("");

  // Aggregate stats based on active roadmap selection
  const activeSemesters = ["Spring 2024 (Current)", "Fall 2024", "Spring 2025"];
  
  const getCoursesForSemester = (sem: string) => {
    return courses.filter((c) => c.term.toLowerCase().startsWith(sem.split(" ")[0].toLowerCase()));
  };

  // Calculate dynamic workload study hours based on actual roadmap
  const totalCredits = courses.reduce((sum, c) => sum + (c.status !== "Completed" ? c.credits : 0), 0);
  const estimatedHours = courses.reduce((sum, c) => {
    if (c.status === "Completed") return sum;
    const factor = c.workload === "Intense" ? 15 : c.workload === "High" ? 12 : c.workload === "Medium" ? 8 : 4;
    return sum + factor;
  }, 0);

  // Core GPA prediction (derived slightly from course workloads to simulate real intelligence)
  const predictedGPA = courses.length > 0 
    ? (4.0 - courses.reduce((sum, c) => {
        const penalty = c.workload === "Intense" ? 0.15 : c.workload === "High" ? 0.08 : c.workload === "Medium" ? 0.02 : 0;
        return sum + penalty;
      }, 0) / courses.length).toFixed(2)
    : "3.85";

  const handleRecSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInterest.trim()) {
      onRecommendForInterest(customInterest.trim());
    }
  };

  return (
    <div className="space-y-16 relative">
      {/* Visual background atmospheric radial lighting */}
      <div className="absolute -top-32 -left-32 w-[450px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[400px] right-0 w-[350px] h-[350px] bg-secondary/800 opacity-[0.05] rounded-full blur-[140px] pointer-events-none"></div>

      {/* Hero Welcome Banner */}
      <section className="relative z-10 space-y-4">
        <div id="ai-optimized-chip" className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-tertiary/10 border border-tertiary/25 text-tertiary shadow-[0_0_15px_rgba(0,220,230,0.15)]">
          <Verified className="w-4 h-4 text-tertiary fill-tertiary/20" />
          <span className="font-sans text-[10px] font-semibold uppercase tracking-wider">
            AI 推荐航线已优化
          </span>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight max-w-4xl">
          早上好，Alex。您的 <span className="text-primary hover:text-[#b0c6ff] transition-colors duration-300">AI 领航导师</span> 已为您微调并优化了 Fall 2024 的路线图。
        </h2>
        <p className="font-sans text-base sm:text-lg text-on-surface-variant max-w-3xl leading-relaxed">
          我们已为您平衡了核心硬核课与选修人文课的载荷，在确保解锁前置课程链的同时，最大化绩点 (GPA) 的整体稳定性。
        </p>
      </section>

      {/* Interactive Node-Connected Roadmap */}
      <section id="interactive-roadmap-section" className="space-y-8 relative">
        <div className="flex justify-between items-end">
          <h3 className="font-display text-lg font-bold flex items-center gap-2 tracking-tight text-white">
            <span className="material-symbols-outlined text-[#b0c6ff] font-bold text-xl">route</span>
            互联路线图航路
          </h3>
          <button 
            id="expand-roadmap-btn"
            onClick={() => setActiveTab("roadmap")}
            className="text-primary hover:text-white font-sans text-xs font-semibold uppercase tracking-wider flex items-center gap-1 transition-all hover:translate-x-1 cursor-pointer"
          >
            展开完整漫游视图 &rarr;
          </button>
        </div>

        {/* Node Layout Track Container */}
        <div className="relative py-12 px-6 rounded-3xl bg-white/[0.01] border border-white/5 overflow-x-auto no-scrollbar shadow-inner">
          
          {/* Connector Line overlay */}
          <div className="absolute top-[148px] left-12 right-12 h-[2px] bg-gradient-to-r from-primary via-tertiary to-outline/15 z-0"></div>

          <div className="flex gap-10 min-w-max relative z-10 justify-between items-start px-2">
            
            {/* Spring 24 (CURRENT NODE) */}
            <div className="flex flex-col items-center gap-6 w-60">
              <span className="font-sans text-[10px] text-primary font-bold uppercase tracking-widest bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                Spring 2024 (当前学期)
              </span>
              <div className="glass-panel p-5 rounded-2xl w-full border-primary/40 shadow-[0_0_20px_rgba(176,198,255,0.15)] transform scale-102 ring-1 ring-primary/20 bg-surface-container/60">
                <div className="flex justify-between items-start mb-3">
                  <span className="p-1 px-2.5 rounded-md font-sans text-[10px] bg-primary/10 text-primary border border-primary/20">
                    修读中
                  </span>
                  <span className="material-symbols-outlined text-primary text-lg">engineering</span>
                </div>
                <h4 className="font-display text-sm font-bold text-white tracking-tight mb-1">
                  数据结构
                </h4>
                <p className="font-mono text-[11px] text-on-surface-variant/70 mb-1">
                  CS 301 &bull; 4 学分
                </p>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-primary h-full w-[85%] rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Hub Intermediary Point 1 */}
            <div className="flex items-center h-full pt-[144px]">
              <div className="w-4 h-4 rounded-full bg-primary border-4 border-[#111317] ring-2 ring-primary/40 neo-glow z-20"></div>
            </div>

            {/* Fall 24 NODE */}
            <div className="flex flex-col items-center gap-6 w-72">
              <span className="font-sans text-[10px] text-tertiary-fixed font-bold uppercase tracking-widest px-3 py-1 bg-tertiary/10 border border-tertiary/25 rounded-full">
                Fall 2024
              </span>
              <div className="flex flex-col gap-3 w-full">
                {/* Find fall 24 courses in catalog */}
                {getCoursesForSemester("Fall 2024").length > 0 ? (
                  getCoursesForSemester("Fall 2024").map((course) => (
                    <div key={course.id} className="glass-panel p-5 rounded-2xl w-full border-tertiary/20 hover:border-tertiary/50 bg-[#1e2024]/40 hover:bg-[#1e2024]/60 relative group">
                      <div className="flex justify-between mb-3">
                        <span className="p-1 px-2.5 rounded-md font-mono text-[10px] bg-tertiary/10 text-tertiary border border-tertiary/20">
                          {course.match}% 适配关联值
                        </span>
                        <Brain className="w-4 h-4 text-tertiary" />
                      </div>
                      <h4 className="font-display text-sm font-bold text-white tracking-tight mb-1">
                        {course.name}
                      </h4>
                      <p className="font-mono text-[11px] text-on-surface-variant/70">
                        {course.code} &bull; {course.credits} 学分
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="glass-panel p-5 rounded-2xl w-full border-dashed border-white/10 flex flex-col items-center text-center justify-center py-8">
                    <span className="text-on-surface-variant/40 text-xs font-sans">该学期尚未安排修读课程</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hub Intermediary Point 2 */}
            <div className="flex items-center h-full pt-[144px]">
              <div className="w-3 h-3 rounded-full bg-outline border-2 border-[#111317] z-20"></div>
            </div>

            {/* Spring 25 NODE */}
            <div className="flex flex-col items-center gap-6 w-60">
              <span className="font-sans text-[10px] text-on-surface-variant/40 uppercase tracking-widest">
                Spring 2025
              </span>
              <div className="flex flex-col gap-3 w-full">
                {getCoursesForSemester("Spring 2025").map((course) => (
                  <div key={course.id} className="glass-panel p-5 rounded-2xl w-full opacity-65 hover:opacity-100 transition-opacity bg-surface-container/30 border-white/5">
                    <div className="flex justify-between mb-3">
                      <span className="p-1 px-2.5 rounded-md font-sans text-[10px] bg-white/5 text-on-surface-variant/80 border border-white/5">
                        未解锁 (锁定中)
                      </span>
                      <Lock className="w-3.5 h-3.5 text-on-surface-variant" />
                    </div>
                    <h4 className="font-display text-sm font-bold text-white tracking-tight mb-1">
                      {course.name}
                    </h4>
                    <p className="font-mono text-[11px] text-on-surface-variant/70">
                      {course.code} &bull; {course.credits} 学分
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-[10px] text-amber-300 font-sans">
                      <AlertCircle className="w-3 h-3 text-amber-400" />
                      先修要求: CS 301, 420
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Middle Tier: Bar analysis chart and radial GPA Gauge widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Workload Analysis visual panel */}
        <div id="workload-analysis-card" className="lg:col-span-2 glass-panel p-8 rounded-3xl space-y-8 bg-surface-container-low/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-tight">学业功课载荷分析</h3>
              <p className="font-sans text-xs text-on-surface-variant">计划修读总学分 vs. 推算每周自主课外研统时长</p>
            </div>
            {/* Chart Legend */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-md bg-[#558dff]"></div>
                <span className="font-sans text-[10px] text-on-surface-variant">计划修读学分</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-md bg-[#ddb7ff]"></div>
                <span className="font-sans text-[10px] text-on-surface-variant">每周预估功课学时</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Mock Representation using CSS clip-path */}
          <div className="h-60 flex items-end justify-between px-4 pb-4 border-b border-l border-white/15 relative">
            <div className="absolute inset-x-0 bottom-0 top-12 bg-gradient-to-t from-primary/5 to-transparent opacity-40 rounded-lg pointer-events-none"></div>
            
            {/* Semester Bar Columns */}
            {activeSemesters.map((sem, idx) => {
              const termCourses = getCoursesForSemester(sem);
              const termCredits = termCourses.reduce((sum, c) => sum + c.credits, 0);
              const termStudyHours = termCourses.reduce((sum, c) => {
                const fac = c.workload === "Intense" ? 15 : c.workload === "High" ? 12 : c.workload === "Medium" ? 8 : 4;
                return sum + fac;
              }, 0);

              // Percentage calculators for graph columns
              const creditColH = Math.max(15, Math.min(95, termCredits * 7));
              const studyColH = Math.max(15, Math.min(95, termStudyHours * 3));

              return (
                <div key={sem} className="flex-1 flex justify-around items-end h-full px-2 max-w-44 group relative">
                  {/* Label tooltip on group hover */}
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-[#1a1c20] border border-white/10 px-2.5 py-1.5 rounded-lg text-center z-30 pointer-events-none">
                    <p className="font-display font-bold text-[10px] text-white">
                      {sem.split(" ")[0]}
                    </p>
                    <p className="font-mono text-[9px] text-[#00dce6]">
                      {termCredits} 学分 &bull; 每周 {termStudyHours} 小时
                    </p>
                  </div>

                  {/* Credits Bar */}
                  <div 
                    style={{ height: `${creditColH}%` }}
                    className="w-4 sm:w-6 bg-gradient-to-t from-[#558dff]/40 to-[#b0c6ff] hover:to-white hover:from-[#558dff] rounded-t-lg transition-all duration-300 relative cursor-pointer shadow-md"
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-on-surface opacity-80">
                      {termCredits}
                    </span>
                  </div>

                  {/* Study Hours Bar */}
                  <div 
                    style={{ height: `${studyColH}%` }}
                    className="w-4 sm:w-6 bg-gradient-to-t from-secondary-container/40 to-secondary hover:to-white hover:from-secondary-container rounded-t-lg transition-all duration-300 relative cursor-pointer shadow-md"
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 font-mono text-[9px] font-bold text-on-surface opacity-80">
                      {termStudyHours}
                    </span>
                  </div>

                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-sans text-[10px] text-on-surface-variant/70 text-center uppercase tracking-tighter whitespace-nowrap">
                   {sem.split(" ")[0] === "Spring" ? "春系" : sem.split(" ")[0] === "Fall" ? "秋系" : sem.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="pt-2">
            <p className="font-sans text-[10px] text-[#00dce6] flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              航行控制提示：大三阶段最佳学分区间为 12-16 学分，每周功课消化时长应稳定在 30 小时以内，以确保学业轨道平妥安全。
            </p>
          </div>
        </div>

        {/* GPA Prediction visual widget */}
        <div id="gpa-prediction-card" className="glass-panel p-8 rounded-3xl flex flex-col items-center justify-between text-center bg-surface-container-low/40">
          <h3 className="font-display text-lg font-bold text-white tracking-tight w-full text-left">绩点 GPA 推算预估</h3>
          
          <div className="relative w-44 h-44 flex items-center justify-center my-4 select-none">
            {/* Circular Gauge Ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle 
                className="text-white/5" 
                cx="88" 
                cy="88" 
                fill="transparent" 
                r="74" 
                stroke="currentColor" 
                strokeWidth="11"
              />
              <circle 
                className="text-[#00dce6] drop-shadow-[0_0_12px_rgba(0,220,230,0.5)] transition-all duration-1000" 
                cx="88" 
                cy="88" 
                fill="transparent" 
                r="74" 
                stroke="currentColor" 
                strokeWidth="11" 
                strokeDasharray="464.7" 
                strokeDashoffset={464.7 - (464.7 * (parseFloat(predictedGPA) / 4.0))}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-display text-4xl font-extrabold text-white tracking-tight flex items-baseline">
                {predictedGPA}
              </div>
              <span className="font-sans text-[9px] text-[#00dce6] font-semibold uppercase tracking-widest mt-1">
                预估 GPA
              </span>
            </div>
          </div>

          <div className="space-y-4 w-full">
            <p className="font-sans text-xs text-on-surface-variant leading-normal">
              根据路线图中课程的历史绩点难度指数与每周课时载荷深度拟合估算。
            </p>
            <button 
              id="gpa-details-btn"
              onClick={() => setActiveTab("workload")}
              className="w-full py-2.5 bg-white/5 border border-white/5 rounded-xl text-white font-sans text-[10px] font-bold uppercase tracking-wider hover:bg-white/10 hover:border-white/10 active:scale-97 transition-all cursor-pointer shadow-sm"
            >
              在功课载荷实验室进行模拟
            </button>
          </div>
        </div>

      </div>

      {/* Recommended for You list containing AI recommendations and manual prompt generation */}
      <section id="recommendations-container" className="space-y-8 pb-12 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-display text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ddb7ff] text-xl">auto_awesome</span>
              为您量身推荐的精品选修
            </h3>
            <p className="font-sans text-xs text-on-surface-variant">AI 依据您的学术背景自适应演算推荐的优质选修课程</p>
          </div>
          
          {/* Real-time Interest recommendation Query input */}
          <form onSubmit={handleRecSearch} className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                id="recommendation-interest-input"
                type="text"
                placeholder="键入希望研讨的主题(如: 深度学习、系统)..."
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                className="w-full bg-[#1c1d22] text-[#e2e2e8] placeholder:text-on-surface-variant/40 border border-white/8 rounded-xl py-2 px-3 pl-8 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-sans"
              />
              <Wand2 className="w-3.5 h-3.5 text-on-surface-variant/60 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              id="recommendation-submit-btn"
              type="submit"
              disabled={isLoadingRecs}
              className="px-4 py-2 bg-secondary-container/30 border border-secondary/40 text-secondary hover:text-white rounded-xl font-sans text-[10px] font-bold tracking-wider hover:bg-secondary-container/45 active:scale-95 transition-all outline-none flex items-center gap-1 shrink-0 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {isLoadingRecs ? "智能演算中..." : "开始演算"}
            </button>
          </form>
        </div>

        {/* Catalog Grid Cards */}
        {isLoadingRecs ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel p-6 rounded-3xl h-64 flex flex-col justify-between border-dashed animate-pulse bg-white/[0.01]">
                <div className="h-6 w-1/3 bg-white/10 rounded"></div>
                <div className="h-4 w-3/4 bg-white/10 rounded mt-4"></div>
                <div className="h-10 w-full bg-[#1e2024]/20 rounded-xl mt-8"></div>
              </div>
            ))}
          </div>
        ) : recommendedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((course) => (
              <div 
                key={course.id} 
                className="glass-panel group p-6 rounded-3xl hover:border-primary/50 bg-[#1e2024]/20 hover:bg-[#1e2024]/40 flex flex-col justify-between h-80 shadow-md relative"
              >
                <div className="space-y-4">
                  {/* Header metadata */}
                  <div className="flex justify-between items-start">
                    <span className="p-1 px-2.5 font-sans text-[10px] bg-secondary-container/10 border border-secondary/35 text-secondary font-bold rounded-full shadow-inner">
                      {course.match}% 适配配对值
                    </span>
                    <span className="font-sans text-[9px] text-[#00dce6] font-semibold bg-[#00dce6]/10 border border-[#00dce6]/25 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {course.category === "Computer Science" ? "计算机科学" 
                       : course.category === "Humanities" ? "人文社科"
                       : course.category === "Math" ? "数学体系"
                       : course.category === "Elective" ? "选修"
                       : course.category === "Major Req" ? "专业核心" 
                       : course.category === "Core Req" ? "必修核心" : course.category}
                    </span>
                  </div>

                  {/* Course Titles */}
                  <div>
                    <span className="font-mono text-[10px] text-on-surface-variant/60 font-semibold uppercase">{course.code} &bull; {course.credits} 学分</span>
                    <h4 className="font-display text-[18px] font-bold text-white tracking-tight mt-0.5 group-hover:text-primary transition-colors">
                      {course.name}
                    </h4>
                  </div>

                  {/* Course Description */}
                  <p className="font-sans text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Sub info chips and active actions */}
                <div className="space-y-4 mt-4">
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className={`px-2 py-0.5 rounded-md font-sans text-[9px] border font-bold uppercase ${
                      course.workload === "Intense" 
                        ? "bg-red-400/5 text-red-400 border-red-400/20" 
                        : course.workload === "High" 
                          ? "bg-amber-400/5 text-amber-400 border-amber-400/20" 
                          : "bg-green-400/5 text-green-400 border-green-400/10"
                    }`}>
                      载荷: {course.workload === "Intense" ? "极高强度" : course.workload === "High" ? "高难度" : course.workload === "Medium" ? "中等负载" : "轻松负载"}
                    </span>
                  </div>

                  <button 
                    id={`btn-add-roadmap-${course.id}`}
                    onClick={() => onAddCourse(course)}
                    className="w-full py-2.5 bg-primary text-[#001944] hover:bg-[#d9e2ff] font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(176,198,255,0.3)] hover:scale-[1.01] active:scale-97 transition-all cursor-pointer font-medium"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    部署至学业路线
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center text-on-surface-variant text-sm rounded-3xl border-dashed">
            未能寻得适配的推荐选修。请在上方输入其他兴趣方向重试！
          </div>
        )}
      </section>

    </div>
  );
}
