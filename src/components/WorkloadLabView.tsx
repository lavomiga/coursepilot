import { useState } from "react";
import { Course } from "../types";
import { Sliders, Flame, ShieldCheck, Gauge, Award, Info, Smile } from "lucide-react";

interface WorkloadLabViewProps {
  courses: Course[];
}

export default function WorkloadLabView({ courses }: WorkloadLabViewProps) {
  // Store study hours per course dynamically in local state initialized to standard defaults
  const [studyHours, setStudyHours] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    courses.forEach((c) => {
      initial[c.id] = c.workload === "Intense" ? 18 : c.workload === "High" ? 12 : c.workload === "Medium" ? 8 : 4;
    });
    return initial;
  });

  const activeCourses = courses.filter((c) => c.status !== "Completed" && !c.term.toLowerCase().includes("completed"));

  const handleHourChange = (id: string, value: number) => {
    setStudyHours((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Perform dynamic aggregations
  const totalCredits = activeCourses.reduce((sum, c) => sum + c.credits, 0);
  const totalStudyHours = activeCourses.reduce((sum, c) => sum + (studyHours[c.id] || 0), 0);

  // stress level indicator logic translated to Chinese
  const getStressLevel = (hours: number) => {
    if (hours < 15) return { label: "精力盈余 / 学习负荷偏轻松", color: "text-[#b0c6ff] bg-primary/10 border-primary/20", icon: Smile };
    if (hours <= 32) return { label: "黄金适宜 / 绩点安稳健康区", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: ShieldCheck };
    if (hours <= 48) return { label: "高负荷紧绷 / 脑力消耗处于临界", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Gauge };
    return { label: "极度严重超载警告 / 面临透支学业崩溃！", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: Flame };
  };

  const stress = getStressLevel(totalStudyHours);

  // Live expected GPA calculations derived from:
  // (Standard GPA targets) adjusted for course-specific study deficit penalty:
  // if hours allocated are lower than class target requirements, penalty applies.
  const calculatePredictedSemesterGPA = () => {
    if (activeCourses.length === 0) return "4.00";
    
    let penaltySum = 0;
    activeCourses.forEach((c) => {
      const requiredMin = c.workload === "Intense" ? 15 : c.workload === "High" ? 10 : c.workload === "Medium" ? 6 : 3;
      const allocated = studyHours[c.id] || 0;
      
      if (allocated < requiredMin) {
        // study deficit penalty multiplier
        penaltySum += (requiredMin - allocated) * 0.05;
      } else if (allocated > requiredMin + 5) {
        // slight bonus for over-study
        penaltySum -= Math.min(3, allocated - requiredMin) * 0.01;
      }
    });

    const gpa = Math.max(2.1, Math.min(4.0, 3.90 - penaltySum));
    return gpa.toFixed(2);
  };

  const virtualGPA = calculatePredictedSemesterGPA();

  return (
    <div className="space-y-12 animate-fadeIn">
      
      {/* Upper informational summary panel */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Dynamic Stress Indicator */}
        <div className={`glass-panel p-6 rounded-3xl border flex items-center gap-4 ${stress.color}`}>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <stress.icon className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="font-sans text-[10px] uppercase tracking-wider block opacity-75">综合课业负荷状态评测</span>
            <h4 className="font-display font-black text-sm tracking-tight mt-0.5">{stress.label}</h4>
          </div>
        </div>

        {/* Dynamic Aggregated study hours */}
        <div className="glass-panel p-6 rounded-3xl bg-surface-container-low/40 border-white/5 flex items-center gap-4 text-[#00dce6]">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <Sliders className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="font-sans text-[10px] text-[#00dce6]/60 uppercase tracking-wider block">推算每周自修总工时</span>
            <h4 className="font-display font-black text-xl tracking-tight text-white mt-0.5">每周 {totalStudyHours} 小时</h4>
          </div>
        </div>

        {/* Dynamic GPA Predictions widget */}
        <div className="glass-panel p-6 rounded-3xl bg-surface-container-low/40 border-white/5 flex items-center gap-4 text-[#ddb7ff]">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
            <Award className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <span className="font-sans text-[10px] text-[#ddb7ff]/60 uppercase tracking-wider block">推算得出的绩点(GPA)指标</span>
            <h4 className="font-display font-black text-xl tracking-tight text-white mt-0.5">{virtualGPA} / 4.00</h4>
          </div>
        </div>

      </section>

      {/* Primary Simulator Workspace Layout split-screen */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Course Sliders Controller */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-3xl bg-surface-container-low/20 space-y-8">
          <div>
            <h3 className="font-display text-lg font-bold text-white tracking-tight">大纲课程精力微调拉条</h3>
            <p className="font-sans text-xs text-on-surface-variant">动态调节您计划修读的每门课程每周预估投入的时长，以模拟绩点与精力损耗结果。</p>
          </div>

          <div className="space-y-6">
            {activeCourses.map((course) => {
              const val = studyHours[course.id] ?? 8;
              const targetMin = course.workload === "Intense" ? 15 : course.workload === "High" ? 10 : course.workload === "Medium" ? 6 : 3;
              const isBelowDeficit = val < targetMin;

              return (
                <div key={course.id} className="space-y-3 p-4 rounded-2xl bg-[#1e2024]/40 border border-white/5">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-mono text-[10px] text-primary/70">{course.code}</span>
                      <h4 className="font-display font-bold text-sm text-white tracking-tight mt-0.5">{course.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="font-sans text-xs font-bold text-white">配置 {val} 小时</span>
                      <span className="font-sans text-[9px] text-on-surface-variant/50 block">每礼拜 (每周)</span>
                    </div>
                  </div>

                  {/* Horizontal slider control */}
                  <div className="flex items-center gap-4">
                    <input
                      id={`slider-workload-${course.id}`}
                      type="range"
                      min={0}
                      max={30}
                      value={val}
                      onChange={(e) => handleHourChange(course.id, parseInt(e.target.value))}
                      className="flex-1 accent-[#00dce6] h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Deficit Warn markers */}
                  <div className="flex justify-between items-center pt-1 text-[10px] font-sans">
                    <span className="text-on-surface-variant/40">教学大纲最低建议：{targetMin} 小时</span>
                    {isBelowDeficit ? (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        警告：精力配额告急并引发 GPA 挂科危险
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold">达标：该科目分配时长富余安稳</span>
                    )}
                  </div>
                </div>
              );
            })}

            {activeCourses.length === 0 && (
              <div className="py-12 text-center text-on-surface-variant border border-dashed border-white/5 rounded-2xl text-xs font-sans">
                当前尚未在此学季安排任何课程。请前往“精品选修课程推荐”或“学术看板”规划您的 Fall 2024 等待仿真课目的课程！
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick workload guidance advice card */}
        <div className="glass-panel p-8 rounded-3xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h4 className="font-display text-sm font-bold text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#00dce6]" />
              学业精力载荷实验室专家建议
            </h4>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed text-justify">
              学术精力消耗和成果遵循严格的边际收益递减模型。科学、适度地分配自主研究时数，能确保您的大脑在建立深度长期记忆与技术直觉的同时，不发生病理性心理疲惫。
            </p>
            
            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 font-mono text-[10px]">9-12</div>
                <p className="text-xs text-on-surface-variant font-sans"><strong className="text-white">计算机必修精钻自习</strong>: 像数据结构基础 (CS 301) 这样带有高强实践的硬核必修课，每周最低需保证 10 小时以上的课外自主编程作业时间。</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-red-400/10 text-red-400 shrink-0 font-mono text-[10px]">15+</div>
                <p className="text-xs text-on-surface-variant font-sans"><strong className="text-white">极高强度前沿分支课</strong>: 高级机器人学 (CS 510) 是一门涉及极高强度矩阵数学与物理模拟的系统课。每周配置时数务必保持在 15 小时以上。</p>
              </div>
            </div>
          </div>

          <div className="bg-[#111317] border border-white/5 p-4 rounded-2xl text-[10px] text-primary font-sans leading-relaxed">
            🎓 提示：通过协调分配有难度的必修课和偏轻松的通识非核心课，探索高绩点高学分产出的科学学业平衡轨道。
          </div>
        </div>

      </section>

    </div>
  );
}
