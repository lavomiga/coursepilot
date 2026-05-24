import React, { useState, useRef, useEffect } from "react";
import { Message, Course } from "../types";
import { ChevronDown, ChevronUp, Bot, Send } from "lucide-react";

interface AiMentorChatDockProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
}

export default function AiMentorChatDock({ courses, onAddCourse }: AiMentorChatDockProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "dock_init",
      sender: "ai",
      text: "您好 Alex！我检测到您对精前沿《高级机器人学 (CS 510)》很有兴趣。需要我帮您直接将它部署到您的 Spring 2025 学业路线吗？它能与您在 Fall 2024 规划修读的《人工智能导论》完好配对、平稳起跑。",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendDockMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput("");

    const userMsg: Message = {
      id: `dock_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
          history: messages,
          currentRoadmap: courses
        })
      });

      const data = await response.json();
      
      const aiReply: Message = {
        id: `dock_ai_${Date.now()}`,
        sender: "ai",
        text: data.reply || "系统网络偶遇波动，可以请您换种词句重复问题吗？",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error("Dock Chat error:", err);
      // Fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `dock_err_${Date.now()}`,
          sender: "ai",
          text: "系统主网延迟。为了 Alex 顺利过渡 Fall 2024 高难度学期，让我们精调功课载荷分配吧！建议合理选配计算机技术与人文美育精品课。",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleShortcutAddRobotics = () => {
    // Advanced Robotics specification catalog item
    const roboticsCourse: Course = {
      id: "cs510",
      code: "CS 510",
      name: "高级机器人学",
      credits: 4,
      workload: "Intense",
      term: "Spring 2025",
      match: 85,
      description: "Sensing, planning, and control algorithms for mobile and multi-jointed robotic systems. Heavy mathematical workload.",
      category: "Major Req",
      status: "Locked",
      prerequisites: ["CS 301", "CS 420"],
    };

    onAddCourse(roboticsCourse);

    // Notify inside chat
    setMessages((prev) => [
      ...prev,
      {
        id: `shortcut_add_${Date.now()}`,
        sender: "ai",
        text: "🚨 部署通知：高级机器人学 (CS 510) 已加选至您的 Spring 2025 学季！请务必注意：其前置关联科目 CS 301 与 CS 420 须提前修完，或与本科目同步并行加学。",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 w-80 sm:w-96 glass-panel rounded-3xl shadow-2xl border-[#558dff]/25 transition-all duration-300 z-50 overflow-hidden ${
        isOpen ? "translate-y-0" : "translate-y-[calc(100%-60px)]"
      }`}
    >
      {/* Header bar toggle */}
      <div 
        id="dock-header"
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-container/80 cursor-pointer hover:bg-surface-container-high/60 select-none pb-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 bg-[#00dce6] rounded-full animate-ping"></div>
          <div className="w-2.5 h-2.5 bg-[#00dce6] rounded-full absolute"></div>
          <span className="font-display font-extrabold text-sm text-white tracking-tight">AI 领航顾问实时诊断</span>
        </div>
        <button className="text-on-surface-variant hover:text-white p-1 rounded cursor-pointer">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Chat scroll logs */}
      {isOpen && (
        <>
          <div className="p-6 space-y-4 max-h-76 overflow-y-auto no-scrollbar bg-surface-container-lowest/80">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div key={m.id} className="space-y-1.5 animate-fadeIn">
                  <div className={`p-4 font-sans text-xs sm:text-sm leading-relaxed ${
                    isUser 
                      ? "bg-[#558dff] text-[#001944] font-medium rounded-2xl rounded-tr-none ml-8 shadow-md" 
                      : "bg-[#1d1f24] text-on-surface border border-white/5 rounded-2xl rounded-tl-none mr-8 shadow-sm"
                  }`}>
                    {m.text}
                  </div>
                  
                  {/* Shortcut prompt buttons layout (Only shown for first model item) */}
                  {m.id === "dock_init" && !courses.some(c => c.code === "CS 510") && (
                    <div className="flex gap-2 pt-2 scroll-mt-2 font-mono text-[10px]">
                      <button 
                        id="btn-confirm-add-robotics"
                        onClick={handleShortcutAddRobotics}
                        className="flex-1 py-2 bg-[#558dff]/15 hover:bg-[#558dff]/35 border border-[#558dff]/30 text-white rounded-xl font-bold transition-all cursor-pointer"
                      >
                        好的，立刻部署
                      </button>
                      <button 
                        id="btn-decline-add-robotics"
                        onClick={() => {
                          setMessages((p) => [...p, { id: `decl_${Date.now()}`, sender: "ai", text: "收到您的指令。随时欢迎提问我来为您探索前沿课程！", timestamp: "" }]);
                        }}
                        className="flex-1 py-2 bg-white/5 border border-white/5 text-on-surface-variant hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                      >
                        暂时不用
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2 items-center text-xs text-on-surface-variant/70 animate-pulse font-sans mr-8">
                <Bot className="w-4 h-4 text-[#00dce6]" />
                <span>思维精算中...</span>
              </div>
            )}

            <div ref={scrollRef} />
          </div>

          {/* Form input controls */}
          <form onSubmit={handleSendDockMessage} className="p-3 bg-surface-container border-t border-white/5 flex gap-2">
            <input
              id="input-dock-chat-box"
              type="text"
              placeholder="我想精微调排..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-surface-container-lowest border border-white/10 rounded-xl py-2 px-3 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary font-sans"
            />
            <button
              id="btn-send-dock-chat"
              type="submit"
              className="p-2.5 bg-primary hover:bg-[#d9e2ff] text-[#001944] rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all outline-none"
            >
              <Send className="w-3.5 h-3.5 font-bold" />
            </button>
          </form>
        </>
      )}

    </div>
  );
}
export { AiMentorChatDock };
