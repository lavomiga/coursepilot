import React, { useState } from "react";
import { Course, WorkloadLevel, ClassCategory } from "../types";
import { Plus, Trash2, AlertCircle, Calendar, Sparkles, Circle } from "lucide-react";

interface RoadmapViewProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  onRemoveCourse: (id: string) => void;
  onUpdateCourseTerm: (id: string, newTerm: string) => void;
  onUpdateCourseStatus: (id: string, status: "In Progress" | "Planned" | "Completed" | "Locked") => void;
}

export default function RoadmapView({
  courses,
  onAddCourse,
  onRemoveCourse,
  onUpdateCourseTerm,
  onUpdateCourseStatus,
}: RoadmapViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCredits, setNewCredits] = useState(3);
  const [newWorkload, setNewWorkload] = useState<WorkloadLevel>("Medium");
  const [newCategory, setNewCategory] = useState<ClassCategory>("Computer Science");
  const [newTerm, setNewTerm] = useState("Fall 2024");

  const semesters = [
    "Completed / History",
    "Spring 2024 (Current)",
    "Fall 2024",
    "Spring 2025",
    "Future Elective Pool"
  ];

  const categories: ClassCategory[] = ["Computer Science", "Humanities", "Math", "Major Req", "Core Req", "Elective"];
  const workloads: WorkloadLevel[] = ["Low", "Medium", "High", "Intense"];

  // Helper mappings for Chinese display
  const categoryNamesDisplay: Record<ClassCategory, string> = {
    "Computer Science": "计算机科学与工程",
    "Humanities": "人文社科学科",
    "Math": "数学与高等理论",
    "Major Req": "专业核心必修",
    "Core Req": "通识基础必修",
    "Elective": "自由拓展选修",
  };

  const workloadNamesDisplay: Record<WorkloadLevel, string> = {
    "Low": "修读轻松",
    "Medium": "中等载荷",
    "High": "偏高挑战",
    "Intense": "高难度极高强度",
  };

  const statusNamesDisplay: Record<"In Progress" | "Planned" | "Completed" | "Locked", string> = {
    "Completed": "已修完完课",
    "In Progress": "当前修读中",
    "Planned": "计划修读",
    "Locked": "未解锁前置",
  };

  const getSemesterDisplayName = (sem: string) => {
    if (sem === "Completed / History") return "已修完 / 历史学期";
    if (sem === "Spring 2024 (Current)") return "Spring 2024 (当前学期)";
    if (sem === "Future Elective Pool") return "未来自由选修储备池";
    return sem;
  };

  // Total credit tally calculations
  const completedCredits = courses
    .filter((c) => c.status === "Completed" || c.term.includes("Completed"))
    .reduce((sum, c) => sum + c.credits, 0);

  const planningCredits = courses
    .filter((c) => c.status !== "Completed" && !c.term.includes("Completed"))
    .reduce((sum, c) => sum + c.credits, 0);

  const totalCompletedGoal = 120;
  const progressPercent = Math.min(100, Math.round(((completedCredits + planningCredits) / totalCompletedGoal) * 100));

  // Prerequisite validity checker
  const checkPrerequisites = (course: Course): { met: boolean; missing: string[] } => {
    if (!course.prerequisites || course.prerequisites.length === 0) {
      return { met: true, missing: [] };
    }

    const completedOrInProgressCodes = courses
      .filter((c) => c.status === "Completed" || c.status === "In Progress" || c.term.includes("Spring 2024"))
      .map((c) => c.code.toLowerCase());

    const missing = course.prerequisites.filter(
      (prereq) => !completedOrInProgressCodes.includes(prereq.toLowerCase())
    );

    return {
      met: missing.length === 0,
      missing,
    };
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName) return;

    const courseToAdd: Course = {
      id: `custom_${Date.now()}`,
      code: newCode.toUpperCase(),
      name: newName,
      credits: newCredits,
      workload: newWorkload,
      term: newTerm,
      match: 99,
      description: "手动添加的自定义课程条目，已加入您的学业规划轨迹。",
      category: newCategory,
      status: newTerm.includes("Completed") ? "Completed" : newTerm.includes("Spring 2024") ? "In Progress" : "Planned",
      difficultyScore: newWorkload === "Intense" ? 9 : newWorkload === "High" ? 7 : newWorkload === "Medium" ? 5 : 3,
    };

    onAddCourse(courseToAdd);
    // Reset form fields
    setNewCode("");
    setNewName("");
    setNewCredits(3);
    setShowAddForm(false);
  };

  return (
    <div className="space-y-12">
      {/* 4-Year Credit Progress Banner */}
      <section className="glass-panel p-6 rounded-3xl bg-surface-container-low/30 border-white/5 relative overflow-hidden">
        <div className="absolute -right-24 -top-24 w-48 h-48 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-1.5">
            <span className="font-sans text-[10px] text-secondary tracking-widest font-bold uppercase block">
              毕业达成度监控轨道
            </span>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              毕业学位总学分统计器
            </h2>
            <p className="font-sans text-xs text-on-surface-variant">
              学生: Alex Rivera &bull; 计算机科学学士 (BS) &bull; 人工智能 (AI) 专业方向
            </p>
          </div>
          
          <div className="flex flex-wrap gap-8 items-center">
            <div className="text-left">
              <span className="font-sans text-[10px] text-on-surface-variant/60 block uppercase">已修读 / 历史</span>
              <span className="font-display text-xl font-bold text-emerald-400">{completedCredits} / 120 学分</span>
            </div>
            <div className="text-left font-mono">
              <span className="font-sans text-[10px] text-on-surface-variant/60 block uppercase">计划中功课载荷</span>
              <span className="font-display text-xl font-bold text-[#b0c6ff]">{planningCredits} 学分</span>
            </div>
            <div className="text-left font-mono">
              <span className="font-sans text-[10px] text-on-surface-variant/60 block uppercase">学业航线总达成度</span>
              <span className="font-display text-xl font-semibold text-white">{progressPercent}% 已达成</span>
            </div>
          </div>
        </div>

        {/* Dynamic Horizontal Progress Bar */}
        <div className="w-full bg-white/5 h-2 rounded-full mt-6 overflow-hidden">
          <div 
            style={{ width: `${progressPercent}%` }}
            className="bg-gradient-to-r from-emerald-500 via-primary to-secondary h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(176,198,255,0.4)]"
          ></div>
        </div>
      </section>

      {/* Action buttons and headers */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            学业规划航线大纲
          </h3>
          <p className="font-sans text-xs text-on-surface-variant">在此科学自主分配各学期学分，规避前置限制盲区，平摊能量消耗</p>
        </div>

        <button
          id="btn-trigger-custom-add"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-primary text-[#001944] hover:bg-[#d9e2ff] font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          手动录入新课程
        </button>
      </section>

      {/* Slideout Adding Form Drawer Overlay */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="glass-panel p-6 rounded-3xl bg-surface-container-high/60 border-primary/20 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4.5 h-4.5 text-secondary animate-pulse" />
              录入自定义学业条目
            </h4>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-on-surface-variant hover:text-white font-sans text-xs uppercase"
            >
              取消
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-sans text-[10px] text-on-surface-variant/70 uppercase mb-2">课程代码 (Course Code)</label>
              <input
                id="input-add-code"
                type="text"
                required
                placeholder="例如: CS 525"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                className="w-full bg-[#111317] border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary outline-none text-white white-placeholder"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-sans text-[10px] text-on-surface-variant/70 uppercase mb-2">课程名称 (Course Name)</label>
              <input
                id="input-add-name"
                type="text"
                required
                placeholder="例如: 机器人系统中的深度学习应用"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-[#111317] border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary outline-none text-white white-placeholder"
              />
            </div>
            <div>
              <label className="block font-sans text-[10px] text-on-surface-variant/70 uppercase mb-2">课程学分 (Credits)</label>
              <select
                id="select-add-credits"
                value={newCredits}
                onChange={(e) => setNewCredits(parseInt(e.target.value))}
                className="w-full bg-[#111317] border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary outline-none text-white"
              >
                <option value={1} className="bg-[#111317]">1 学分</option>
                <option value={2} className="bg-[#111317]">2 学分</option>
                <option value={3} className="bg-[#111317]">3 学分</option>
                <option value={4} className="bg-[#111317]">4 学分</option>
              </select>
            </div>
            <div>
              <label className="block font-sans text-[10px] text-on-surface-variant/70 uppercase mb-2">课业载荷分级 (Workload)</label>
              <select
                id="select-add-workload"
                value={newWorkload}
                onChange={(e) => setNewWorkload(e.target.value as WorkloadLevel)}
                className="w-full bg-[#111317] border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary outline-none text-white"
              >
                {workloads.map((wl) => (
                  <option key={wl} value={wl} className="bg-[#111317]">{workloadNamesDisplay[wl]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-sans text-[10px] text-on-surface-variant/70 uppercase mb-2">学科类别 (Category)</label>
              <select
                id="select-add-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ClassCategory)}
                className="w-full bg-[#111317] border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary outline-none text-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#111317]">{categoryNamesDisplay[cat]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-sans text-[10px] text-on-surface-variant/70 uppercase mb-2">分配至各学期 (Semester)</label>
              <select
                id="select-add-term"
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                className="w-full bg-[#111317] border border-white/10 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-primary outline-none text-white"
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem} className="bg-[#111317]">{getSemesterDisplayName(sem)}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            id="btn-submit-add-course"
            type="submit"
            className="px-6 py-2 bg-primary text-[#001944] font-sans text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
          >
            立即部署课程
          </button>
        </form>
      )}

      {/* Multi-semester Dashboard Columns */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {semesters.map((semName) => {
          const semCourses = courses.filter((c) => {
            if (semName === "Completed / History") {
              return c.status === "Completed" || c.term.toLowerCase().startsWith("completed");
            }
            if (semName === "Future Elective Pool") {
              return c.term.toLowerCase().includes("pool") || c.term.toLowerCase().includes("future") || c.term.toLowerCase() === "elective pool";
            }
            return c.term.toLowerCase().startsWith(semName.split(" ")[0].toLowerCase());
          });

          const totalSemCredits = semCourses.reduce((sum, c) => sum + c.credits, 0);

          return (
            <div 
              key={semName} 
              className="flex flex-col bg-[#16181d] border border-white/5 rounded-3xl p-4 min-h-[460px] max-h-[640px] overflow-hidden shadow-inner"
            >
              {/* Header column title */}
              <div className="pb-3 border-b border-white/5 mb-4">
                <h4 className="font-display font-bold text-xs text-white truncate max-w-full">
                  {getSemesterDisplayName(semName)}
                </h4>
                <div className="flex justify-between items-center mt-1 text-[10px] font-sans">
                  <span className="text-on-surface-variant/60">{semCourses.length} 门课程</span>
                  <span className="text-primary font-bold">{totalSemCredits} 学分</span>
                </div>
              </div>

              {/* Scrollable list of cards */}
              <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar pb-4 animate-fadeIn">
                {semCourses.map((course) => {
                  const prereqCheck = checkPrerequisites(course);
                  return (
                    <div 
                      key={course.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        !prereqCheck.met && course.status !== "Completed"
                          ? "bg-amber-500/[0.03] border-amber-500/20 hover:border-amber-500/40"
                          : course.status === "Completed"
                            ? "bg-emerald-500/[0.01] border-emerald-500/10 hover:border-emerald-500/20"
                            : "bg-[#212328]/40 border-white/5 hover:border-white/10"
                      }`}
                    >
                      {/* Code, credits & removal action wrapper */}
                      <div className="flex justify-between items-start gap-1">
                        <div>
                          <span className="font-mono text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-white/5 text-on-surface-variant/80 border border-white/5">
                            {course.code}
                          </span>
                          <span className="font-sans text-[9px] text-on-surface-variant/60 ml-1">
                            {course.credits} 学分
                          </span>
                        </div>
                        <button
                          id={`btn-remove-${course.id}`}
                          onClick={() => onRemoveCourse(course.id)}
                          className="text-on-surface-variant/30 hover:text-red-400 p-0.5 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Course Title name */}
                      <h5 className="font-display text-xs font-bold text-white tracking-tight mt-2 line-clamp-1">
                        {course.name}
                      </h5>

                      {/* Alert warnings for invalid chain pre-req */}
                      {!prereqCheck.met && course.status !== "Completed" && (
                        <div className="flex items-start gap-1 p-2 rounded-lg bg-amber-500/5 border border-amber-500/20 mt-2">
                          <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-[9px] text-amber-300 font-sans leading-normal">
                            尚缺前置: {prereqCheck.missing.join(", ")}
                          </p>
                        </div>
                      )}

                      {/* Sub footer controls and semester shifting controls */}
                      <div className="space-y-2 mt-3 pt-2.5 border-t border-white/5">
                        
                        {/* Status cycling toggler chip */}
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-sans text-[9px] text-on-surface-variant/50">当前状态</span>
                          <select
                            id={`select-status-${course.id}`}
                            value={course.status}
                            onChange={(e) => onUpdateCourseStatus(course.id, e.target.value as any)}
                            className="bg-transparent border-none text-[9px] text-[#00dce6] font-sans focus:ring-0 cursor-pointer text-right outline-none p-0"
                          >
                            {Object.entries(statusNamesDisplay).map(([val, label]) => (
                              <option key={val} value={val} className="bg-[#111317] text-white">
                                {label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Dropdown transfer mechanism */}
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-sans text-[9px] text-on-surface-variant/50">转移学期</span>
                          <select
                            id={`select-move-${course.id}`}
                            value={semName}
                            onChange={(e) => onUpdateCourseTerm(course.id, e.target.value)}
                            className="bg-transparent border-none text-[9px] text-[#b0c6ff] font-sans focus:ring-0 cursor-pointer text-right outline-none p-0"
                          >
                            <option value="" disabled className="bg-[#111317] text-white">请选择学季</option>
                            {semesters.map((s) => (
                              <option key={s} value={s} className="bg-[#111317] text-white">
                                {s.split(" ")[0] === "Completed" ? "历史已修" : s.split(" ")[0] === "Spring" ? "春季" : s.split(" ")[0] === "Fall" ? "秋季" : "储备池"}
                              </option>
                            ))}
                          </select>
                        </div>

                      </div>

                    </div>
                  );
                })}

                {semCourses.length === 0 && (
                  <div className="h-40 flex flex-col items-center justify-center text-center opacity-40 border border-dashed border-white/5 rounded-2xl p-4">
                    <Circle className="w-6 h-6 text-on-surface-variant mb-1" />
                    <span className="font-sans text-[9px] uppercase tracking-wider">暂无安排面</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>

    </div>
  );
}
