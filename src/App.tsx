import { useState, useEffect } from "react";
import SideNavBar from "./components/SideNavBar";
import TopAppBar from "./components/TopAppBar";
import DashboardView from "./components/DashboardView";
import RoadmapView from "./components/RoadmapView";
import DiscoveryView from "./components/DiscoveryView";
import WorkloadLabView from "./components/WorkloadLabView";
import AiMentorDashboard from "./components/AiMentorDashboard";
import AiMentorChatDock from "./components/AiMentorChatDock";
import DegreeAuditView from "./components/DegreeAuditView";
import TranscriptsView from "./components/TranscriptsView";
import { Course } from "./types";
import { AlertCircle, CheckCircle2, Bot, Sparkles, X } from "lucide-react";

const INITIAL_PLAN: Course[] = [
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

const PREBUILT_RECOMMENDATIONS: Course[] = [
  {
    id: "cs460",
    code: "CS 460",
    name: "计算机视觉",
    credits: 3,
    workload: "High",
    term: "Fall 2024",
    match: 98,
    description: "学习图像分类、目标检测、三维场景重建以及最新的 CNN/ViT 深度视觉网络大模型架构。",
    category: "Computer Science",
    status: "Planned",
    difficultyScore: 8,
  },
  {
    id: "phil220",
    code: "PHIL 220",
    name: "产品设计伦理学",
    credits: 3,
    workload: "Low",
    term: "Fall 2024",
    match: 92,
    description: "以哲学视角剖析黑客式诱导设计、AI 数据偏见以及现代产品用户体验中的人本主义底线。",
    category: "Humanities",
    status: "Planned",
    difficultyScore: 4,
  },
  {
    id: "cs530",
    code: "CS 530",
    name: "分布式系统工程",
    credits: 4,
    workload: "Intense",
    term: "Spring 2025",
    match: 89,
    description: "在高网络颤抖和云服务器故障多发环境下设计强一致性、高吞吐的集群共识系统。",
    category: "Computer Science",
    status: "Planned",
    difficultyScore: 9,
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("course_pilot_roadmap");
    return saved ? JSON.parse(saved) : INITIAL_PLAN;
  });
  
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>(PREBUILT_RECOMMENDATIONS);
  const [isLoadingRecs, setIsLoadingRecs] = useState<boolean>(false);

  // Premium UI Toast system alerts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "warning">("success");

  useEffect(() => {
    localStorage.setItem("course_pilot_roadmap", JSON.stringify(courses));
  }, [courses]);

  const showToast = (message: string, type: "success" | "warning" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Add course handler
  const handleAddCourse = (courseToAdd: Course) => {
    const exists = courses.some((c) => c.code.toLowerCase() === courseToAdd.code.toLowerCase());
    if (exists) {
      showToast(`提示：该课程 ${courseToAdd.code} 已经部署在您的个人学期航行图中了！`, "warning");
      return;
    }

    setCourses((prev) => [...prev, courseToAdd]);
    showToast(`成功将 ${courseToAdd.code} (${courseToAdd.name}) 规划并部署至您 ${courseToAdd.term} 的课表内！`, "success");
    
    // Automatically transition to the active semester roadmap tab so they can see the change
    setActiveTab("roadmap");
  };

  // Delete course handler
  const handleRemoveCourse = (id: string) => {
    const course = courses.find((c) => c.id === id);
    if (!course) return;

    setCourses((prev) => prev.filter((c) => c.id !== id));
    showToast(`课程 ${course.code} 已成功从您的学业路线图中清除。`, "warning");
  };

  // Update semester assignment for course (Shifting)
  const handleUpdateCourseTerm = (id: string, newTerm: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, term: newTerm } : c))
    );
    const course = courses.find((c) => c.id === id);
    if (course) {
      showToast(`成功将 ${course.code} 平移至 ${newTerm}。`, "success");
    }
  };

  // Cycle course status (Completed, Planned, In Progress)
  const handleUpdateCourseStatus = (id: string, newStatus: "In Progress" | "Planned" | "Completed" | "Locked") => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );
    const course = courses.find((c) => c.id === id);
    if (course) {
      showToast(`已成功将 ${course.code} 的学业状态变更为 '${newStatus === "In Progress" ? "进行中" : newStatus === "Completed" ? "已完成" : "计划中"}'。`, "success");
    }
  };

  // Recommend courses based on real-time prompt search
  const handleRecommendForInterest = async (interest: string) => {
    setIsLoadingRecs(true);
    try {
      const res = await fetch("/api/mentor/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interest,
          currentRoadmap: courses,
        }),
      });
      const data = await res.json();
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendedCourses(data.recommendations);
        showToast(`AI 已成功围绕您的特定兴趣 “${interest}” 演算出新一批高适配课程！`, "success");
      }
    } catch (err) {
      console.error("Failed to generate recommendations:", err);
      showToast("网络数据稍显拥堵，已自动为您展示本地储备的精品选修推荐！", "warning");
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleOpenMentorSession = () => {
    setActiveTab("mentor");
    showToast("正在开启实时 AI 学术控制舱会话...", "success");
  };

  return (
    <div className="flex min-h-screen bg-[#111317]">
      
      {/* 1. Global Interactive Floating Toasts alerts */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-[#1a1c20] border font-display text-xs font-bold text-white shadow-2xl animate-bounce leading-none max-w-sm sm:max-w-lg truncate boder-opacity-90">
          {toastType === "success" ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4.5 h-4.5 text-amber-400 shrink-0" />
          )}
          <span className="flex-1 truncate">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-on-surface-variant/40 hover:text-white ml-2 p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2. SideNavBar Component Panel */}
      <SideNavBar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenMentorSession={handleOpenMentorSession}
      />

      {/* 3. Main Frame layout */}
      <main className="flex-1 md:ml-64 relative min-h-screen pb-20">
        
        {/* Header Appbar */}
        <TopAppBar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onNotifyClick={() => showToast("系统状态监测处于安全区间。各传感器运行平稳。", "success")} 
        />

        {/* Dynamic Inner Tab Router */}
        <div className="max-w-7xl mx-auto px-6 py-10">
          {activeTab === "dashboard" && (
            <DashboardView
              courses={courses}
              recommendedCourses={recommendedCourses}
              isLoadingRecs={isLoadingRecs}
              onAddCourse={handleAddCourse}
              onRecommendForInterest={handleRecommendForInterest}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === "roadmap" && (
            <RoadmapView
              courses={courses}
              onAddCourse={handleAddCourse}
              onRemoveCourse={handleRemoveCourse}
              onUpdateCourseTerm={handleUpdateCourseTerm}
              onUpdateCourseStatus={handleUpdateCourseStatus}
            />
          )}

          {activeTab === "discovery" && (
            <DiscoveryView
              courses={courses}
              onAddCourse={handleAddCourse}
            />
          )}

          {activeTab === "workload" && (
            <WorkloadLabView
              courses={courses}
            />
          )}

          {activeTab === "mentor" && (
            <AiMentorDashboard
              courses={courses}
              onAddCourseFromAi={handleAddCourse}
            />
          )}

          {activeTab === "degree_audit" && (
            <DegreeAuditView
              courses={courses}
              onAddCourse={handleAddCourse}
            />
          )}

          {activeTab === "transcripts" && (
            <TranscriptsView
              courses={courses}
            />
          )}
        </div>

        {/* 4. Docked chat bubble on bottom-right (shown layout except on full Mentor page) */}
        {activeTab !== "mentor" && (
          <AiMentorChatDock 
            courses={courses}
            onAddCourse={handleAddCourse}
          />
        )}

      </main>
    </div>
  );
}
