import React, { useState, useMemo, useRef } from "react";
import { Course } from "../types";
import { 
  FileText, Upload, CheckCircle2, ChevronRight, Award, 
  TrendingUp, LineChart, FileSpreadsheet, Users, HelpCircle, 
  ArrowRight, Sparkles, RefreshCw, AlertCircle
} from "lucide-react";

interface TranscriptsViewProps {
  courses: Course[];
}

// Fixed official past academic semesters records for Alex Rivera (大一、大二)
const COMPLETED_SEMESTERS_HISTORY = [
  {
    term: "Fall 2022",
    termGpa: "3.70",
    termCredits: 11,
    courses: [
      { code: "CS 101", name: "计算机科学概论", credits: 4, grade: "A", points: 4.0 },
      { code: "MATH 151", name: "微积分 I", credits: 4, grade: "A-", points: 3.67 },
      { code: "ENG 110", name: "大学学术英文写作", credits: 3, grade: "B+", points: 3.33 },
    ]
  },
  {
    term: "Spring 2023",
    termGpa: "3.67",
    termCredits: 12,
    courses: [
      { code: "CS 201", name: "面向对象编程与建模", credits: 4, grade: "A", points: 4.0 },
      { code: "MATH 152", name: "微积分 II", credits: 4, grade: "A", points: 4.0 },
      { code: "PHYS 201", name: "大学物理学 I", credits: 4, grade: "B", points: 3.0 },
    ]
  },
  {
    term: "Fall 2023",
    termGpa: "3.63",
    termCredits: 10,
    courses: [
      { code: "CS 215", name: "离散数学结构导论", credits: 3, grade: "A", points: 4.0 },
      { code: "CS 280", name: "计算机组成原理大纲", credits: 4, grade: "B+", points: 3.33 },
      { code: "MATH 220", name: "初等线性代数", credits: 3, grade: "A-", points: 3.67 },
    ]
  }
];

export default function TranscriptsView({ courses }: TranscriptsViewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "success">("idle");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grade state predictor for currently in progress or planned courses
  const pendingCourses = useMemo(() => {
    return courses.filter((c) => c.status !== "Completed");
  }, [courses]);

  // Handle grade assignments for the simulator classes
  const [stimulatedGrades, setStimulatedGrades] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    pendingCourses.forEach((c) => {
      initial[c.id] = "A"; // Default prediction grade
    });
    return initial;
  });

  const gradePointsMap: Record<string, number> = {
    "A": 4.0, "A-": 3.67, "B+": 3.33, "B": 3.0, "B-": 2.67, "C+": 2.33, "C": 2.0, "D": 1.0, "F": 0.0
  };

  const handleGradeChange = (courseId: string, grade: string) => {
    setStimulatedGrades((prev) => ({
      ...prev,
      [courseId]: grade,
    }));
  };

  // Aggregate stats: past history and simulated pending grades
  const transcriptStats = useMemo(() => {
    let pastTotalPoints = 0;
    let pastTotalCredits = 0;

    COMPLETED_SEMESTERS_HISTORY.forEach((sem) => {
      sem.courses.forEach((course) => {
        pastTotalPoints += course.points * course.credits;
        pastTotalCredits += course.credits;
      });
    });

    const pastCumulativeGpa = pastTotalCredits ? (pastTotalPoints / pastTotalCredits) : 0;

    // Simulated stats (past + user predictions of current/future roadmap courses)
    let simTotalPoints = pastTotalPoints;
    let simTotalCredits = pastTotalCredits;

    pendingCourses.forEach((course) => {
      const predGrade = stimulatedGrades[course.id] || "A";
      const pt = gradePointsMap[predGrade] ?? 4.0;
      simTotalPoints += pt * course.credits;
      simTotalCredits += course.credits;
    });

    const simCumulativeGpa = simTotalCredits ? (simTotalPoints / simTotalCredits) : 0;

    return {
      pastCumulativeGpa: pastCumulativeGpa.toFixed(2),
      pastTotalCredits,
      simCumulativeGpa: simCumulativeGpa.toFixed(2),
      simTotalCredits,
      pendingCount: pendingCourses.length
    };
  }, [pendingCourses, stimulatedGrades]);

  // Upload actions dropzone handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf") && !file.name.toLowerCase().endsWith(".xml")) {
      alert("仅支持导入官方 .PDF 或 .XML 数据结构的电子成绩单，请核查后重试。");
      return;
    }

    setUploadedFileName(file.name);
    setUploadState("uploading");

    // Elegant simulated pipeline delay
    setTimeout(() => {
      setUploadState("success");
    }, 1800);
  };

  const resetUpload = () => {
    setUploadState("idle");
    setUploadedFileName("");
  };

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* 1. Header Overview Banner */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GPA status card */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-[#1a202c]/40 to-[#121620]/20 border-white/5 flex items-center justify-between text-[#b0c6ff] sm:col-span-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#558dff]/10 border border-[#558dff]/25 rounded-2xl">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <span className="font-sans text-[10px] text-on-surface-variant/70 uppercase tracking-widest block font-bold">
                已修完官方累计绩点 GPA
              </span>
              <h3 className="font-display font-black text-2xl text-white tracking-tight mt-0.5">
                {transcriptStats.pastCumulativeGpa} <span className="text-xs font-normal text-on-surface-variant font-mono">/ 4.00</span>
              </h3>
              <p className="font-sans text-[10px] text-emerald-400 mt-1">
                已获得官方核验学分: {transcriptStats.pastTotalCredits} 学分
              </p>
            </div>
          </div>
        </div>

        {/* Predicted Simulator GPA card */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-[#1c2c2f]/40 to-[#122022]/20 border-white/5 flex items-center justify-between text-[#00dce6] sm:col-span-1">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#00dce6]/10 border border-[#00dce6]/25 rounded-2xl">
              <LineChart className="w-6 h-6 text-[#00dce6]" />
            </div>
            <div>
              <span className="font-sans text-[10px] text-[#00dce6]/70 uppercase tracking-widest block font-bold">
                推演预估毕业累计 GPA
              </span>
              <h3 className="font-display font-black text-2xl text-white tracking-tight mt-0.5 animate-pulse">
                {transcriptStats.simCumulativeGpa} <span className="text-xs font-normal text-on-surface-variant font-mono">/ 4.00</span>
              </h3>
              <p className="font-sans text-[10px] text-[#b0c6ff] mt-1">
                含预估后累计学分: {transcriptStats.simTotalCredits} 学分
              </p>
            </div>
          </div>
        </div>

        {/* PDF Status upload summary */}
        <div className="glass-panel p-6 rounded-3xl bg-[#1e2024]/20 border-white/5 flex items-center gap-4 text-on-surface-variant sm:col-span-1">
          <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-on-surface-variant/40">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="font-sans text-[10px] text-on-surface-variant/60 uppercase tracking-widest block font-bold">
              电子成绩单核实状态
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <h4 className="font-display font-bold text-xs text-white">已连接教务注册系统官方 API</h4>
            </div>
            <p className="font-sans text-[10px] text-on-surface-variant/40 mt-1">
              最后一次实时数据库核查：今日 06:56Z
            </p>
          </div>
        </div>

      </section>

      {/* 2. Interactive Columns split workspace */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left column (3/5): Timeline & Uploader */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* A. Official Transcript Drag Drop zone */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider block">
              成绩单电子证照上传解构 (Transcript Sync)
            </h3>
            
            <div
              id="dropzone-transcript"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-48 cursor-pointer relative ${
                dragActive 
                  ? "border-[#558dff] bg-[#558dff]/5" 
                  : "border-white/10 hover:border-white/25 bg-[#181a1f]/30"
              }`}
            >
              <input
                ref={fileInputRef}
                id="input-file-transcript"
                type="file"
                multiple={false}
                accept=".pdf,.xml"
                onChange={handleFileInput}
                className="hidden"
              />

              {uploadState === "idle" && (
                <div onClick={triggerFileBrowser} className="space-y-4 w-full">
                  <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant/50 border border-white/5">
                    <Upload className="w-5 h-5 text-[#b0c6ff]" />
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-xs sm:text-sm text-white">
                      拖拽成绩单 PDF 到此处，或点击浏览文件
                    </h5>
                    <p className="font-sans text-[11px] text-on-surface-variant/60 mt-1">
                      仅支持导入由教务官网生成的官方加密电子版 PDF 成绩单，系统一秒解析生成拓扑大纲。
                    </p>
                  </div>
                </div>
              )}

              {uploadState === "uploading" && (
                <div className="space-y-4">
                  <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center animate-spin border-t-2 border-b-2 border-primary"></div>
                  <div>
                    <h5 className="font-display font-bold text-sm text-white">
                      正在解构并校对官方成绩单证书署名...
                    </h5>
                    <p className="font-sans text-[10px] text-primary mt-1">
                      正在验证签名证书并对齐大纲 CS 课程编码拓扑点...
                    </p>
                  </div>
                </div>
              )}

              {uploadState === "success" && (
                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-display font-extrabold text-sm text-[#00dce6]">
                      成绩单成功同步并解析完成
                    </h5>
                    <p className="font-mono text-[10px] text-white">
                      已验证文件：{uploadedFileName}
                    </p>
                    <p className="font-sans text-[11px] text-on-surface-variant/60 mt-0.5">
                      系统已匹配并解锁大一、大二全部已修学分，并对齐最新 AI 大纲前置条件。
                    </p>
                  </div>
                  <button
                    id="btn-reupload"
                    onClick={resetUpload}
                    className="mx-auto mt-2 px-3 py-1.5 bg-white/5 border border-white/5 text-[10px] rounded-lg text-on-surface-variant hover:text-white transition-all cursor-pointer"
                  >
                    重新导入
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* B. Official completed list semesters timeline */}
          <div className="space-y-6">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider block">
              官方认证成绩单历史 (Verified Academic Record)
            </h3>

            <div className="space-y-5 border-l border-white/5 pl-4 sm:pl-6 ml-2 sm:ml-4">
              {COMPLETED_SEMESTERS_HISTORY.map((sem, index) => (
                <div key={sem.term} className="relative space-y-3">
                  
                  {/* Timeline dot circle */}
                  <span className="absolute -left-[21px] sm:-left-[29px] top-1 w-3.5 h-3.5 rounded-full border border-[#558dff]/30 bg-[#111317] flex items-center justify-center z-10">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  </span>

                  {/* Semester SubHeader info */}
                  <div className="flex justify-between items-center bg-[#1e2024]/20 border border-white/5 px-4 py-2.5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <h4 className="font-display font-bold text-sm text-white">{sem.term}</h4>
                      <span className="text-[10px] font-sans text-on-surface-variant/40">已完成学分: {sem.termCredits} Credits</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
                      学季 GPA: {sem.termGpa}
                    </span>
                  </div>

                  {/* Course rows cards */}
                  <div className="space-y-2">
                    {sem.courses.map((course) => (
                      <div key={course.code} className="flex justify-between items-center bg-white/2 hover:bg-white/5 border border-white/5 px-4 py-3 rounded-xl transition-all">
                        <div>
                          <span className="font-mono text-[10px] text-on-surface-variant/50 font-bold block">{course.code}</span>
                          <h5 className="font-display font-bold text-xs text-white tracking-tight">{course.name}</h5>
                        </div>
                        <div className="flex items-center gap-6 text-right">
                          <span className="font-sans text-xs text-on-surface-variant">{course.credits} 学分</span>
                          <span className="font-mono text-xs font-black text-[#00dce6] bg-[#00dce6]/5 border border-[#00dce6]/20 px-2 py-0.5 rounded-md min-w-8 text-center">{course.grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column (2/5): GPA Predictor Simulator Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl bg-surface-container-low/40 border-[#b0c6ff]/10 space-y-6 flex flex-col h-full justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary animate-pulse" />
                <h4 className="font-display font-black text-sm text-white uppercase tracking-wider">
                  未来学期成绩模拟推演面板
                </h4>
              </div>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed text-justify">
                该交互沙盒允许您指涉未来加学和当前正在修读考核中的路线科目。赋予其预估等级并立即模拟得出您在毕业时的总评累计绩点等级。
              </p>

              {/* Pendings selectors slider row item list */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                {pendingCourses.map((pc) => {
                  const currentGrade = stimulatedGrades[pc.id] || "A";

                  return (
                    <div key={pc.id} className="p-4 bg-[#111317]/50 border border-white/5 rounded-2xl flex items-center justify-between gap-3">
                      <div>
                        <span className="font-mono text-[9px] text-[#558dff] font-bold block uppercase">{pc.code} &bull; {pc.credits} Credits</span>
                        <h5 className="font-display font-bold text-xs text-white tracking-tight truncate max-w-40 sm:max-w-xs">{pc.name}</h5>
                      </div>

                      {/* Dropdown grading */}
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-[10px] text-on-surface-variant/40">模拟成绩:</span>
                        <select
                          id={`select-grade-sim-${pc.id}`}
                          value={currentGrade}
                          onChange={(e) => handleGradeChange(pc.id, e.target.value)}
                          className="bg-[#181a1f] border border-white/10 rounded-lg p-1.5 focus:ring-1 focus:ring-primary outline-none font-mono text-xs text-white cursor-pointer"
                        >
                          <option value="A">A (4.00)</option>
                          <option value="A-">A- (3.67)</option>
                          <option value="B+">B+ (3.33)</option>
                          <option value="B">B (3.00)</option>
                          <option value="B-">B- (2.67)</option>
                          <option value="C+">C+ (2.33)</option>
                          <option value="C">C (2.00)</option>
                          <option value="D">D (1.00)</option>
                          <option value="F">F (0.00)</option>
                        </select>
                      </div>
                    </div>
                  );
                })}

                {pendingCourses.length === 0 && (
                  <div className="py-8 text-center text-on-surface-variant border border-dashed border-white/5 rounded-xl text-xs font-sans">
                    学业路线图中目前无计划中或进行中的课程，请先前往“课程选择器”或“仪表盘”加选。
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#111317]/80 rounded-2xl p-4.5 border border-[#00dce6]/25 mt-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-sans">
                <span className="text-[#00dce6] font-bold flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  智能推演累计 GPA:
                </span>
                <span className="font-mono font-black text-white text-base">{transcriptStats.simCumulativeGpa}</span>
              </div>
              <p className="font-sans text-[10px] text-on-surface-variant leading-relaxed opacity-75">
                此仿真结果基于完成的 {transcriptStats.pastTotalCredits} 已核实学分以及您所推算安排在后续计划中的 {transcriptStats.simTotalCredits - transcriptStats.pastTotalCredits} 预测学分合算而出。
              </p>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
}
