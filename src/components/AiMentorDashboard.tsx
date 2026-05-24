import React, { useState, useRef, useEffect } from "react";
import { Message, Course } from "../types";
import { Sparkles, Send, Brain, Bot, Scale, GraduationCap } from "lucide-react";

interface AiMentorDashboardProps {
  courses: Course[];
  onAddCourseFromAi: (course: Course) => void;
}

export default function AiMentorDashboard({ courses, onAddCourseFromAi }: AiMentorDashboardProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "ai",
      text: "您好，领航学术航行员 Alex。我可以帮您研判并分析课程大纲要求、前置拓扑链、以及课业阻力负荷。点击左侧“快捷顾问 cockpit”中的某项微观动作来立刻听取定制建议，或通过下方对话框直接询问我关乎您毕业学位达成的任何学业疑惑！",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const presetActions = [
    { label: "精细化调平 Fall 2024 载荷", prompt: "请针对我的 Fall 2024 学期推荐一套最理想的选课均衡方案，以调平功课负荷并最大化学期绩点(GPA)的整体稳定性。", icon: Scale },
    { label: "检测 Spring 2025 前置限制", prompt: "请评估我计划在 Spring 2025 选修的《高级机器人学》课程，我需要提前修完哪些前置硬核科目？有什么建议提前预读？", icon: Brain },
    { label: "人工智能方向毕业加速大纲", prompt: "请推荐一些高分不挂科且实用的优质选修课程，加速我修满 CS 学位的学分，并重点往大语言模型与人工智能研究方向靠拢。", icon: GraduationCap },
  ];

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `m_${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/mentor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
          currentRoadmap: courses
        })
      });

      const data = await res.json();
      
      const aiMsg: Message = {
        id: `m_ai_${Date.now()}`,
        sender: "ai",
        text: data.reply || "系统中央处理有些缓慢。能否调整下提问词稍后再试？",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Mentor chat error:", err);
      const errMsg: Message = {
        id: `m_err_${Date.now()}`,
        sender: "ai",
        text: "导师与 CoursePilot 学术中央数据库连线延迟。请检查您的网络连结，或稍候再行提问！",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[500px] animate-fadeIn">
      
      {/* Micro Advisor preset panel (left sidebar) */}
      <div className="lg:col-span-1 space-y-4">
        <div className="glass-panel p-5 rounded-3xl bg-surface-container-low/40 border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#00dce6]" />
            <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">快捷顾问驾驶舱</h4>
          </div>
          <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
            点击下方专家的快捷评估微动件，即刻对您的毕业路线计划进行自适应审查和推荐调优。
          </p>

          <div className="space-y-2 pt-2">
            {presetActions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  id={`btn-preset-advising-${act.label.toLowerCase().replace(/ /g, "-")}`}
                  key={act.label}
                  onClick={() => sendMessage(act.prompt)}
                  className="w-full p-3 bg-[#1e2024]/40 hover:bg-[#1e2024]/75 hover:border-[#b0c6ff]/30 text-left border border-white/5 rounded-2xl flex items-start gap-2.5 transition-all outline-none cursor-pointer group"
                >
                  <Icon className="w-4 h-4 text-[#b0c6ff] shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="font-display font-medium text-xs text-on-surface-variant group-hover:text-white leading-snug">
                    {act.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main chat log output pane */}
      <div className="lg:col-span-3 flex flex-col glass-panel rounded-3xl bg-surface-container-low/20 border-white/5 h-[580px] overflow-hidden relative">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#181a1f]/60">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00dce6] ai-pulse-glow"></div>
            <div>
              <h4 className="font-display font-bold text-sm text-white">交互式精英 AI 航向导师</h4>
              <p className="font-mono text-[9px] text-[#00dce6]">动力源：CoursePilot AI Engine</p>
            </div>
          </div>
          <Sparkles className="w-4.5 h-4.5 text-secondary animate-pulse" />
        </div>

        {/* Scrollable logs */}
        <div className="flex-1 p-6 overflow-y-auto no-scrollbar space-y-6">
          {messages.map((m) => {
            const isUser = m.sender === "user";
            return (
              <div 
                key={m.id} 
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar icons */}
                <div className={`p-2 rounded-xl h-9 w-9 flex items-center justify-center shrink-0 border ${
                  isUser 
                    ? "bg-[#558dff]/10 border-[#558dff]/25 text-[#b0c6ff]" 
                    : "bg-[#00dce6]/10 border-[#00dce6]/25 text-[#00dce6]"
                }`}>
                  {isUser ? <Scale className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl font-sans text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                    isUser 
                      ? "bg-primary text-[#001944] font-medium rounded-tr-none shadow-md" 
                      : "bg-[#1d1f24] text-[#e2e2e8] border border-white/5 rounded-tl-none pr-8 shadow-sm"
                  }`}>
                    {m.text}
                  </div>
                  <span className="font-mono text-[8px] text-on-surface-variant/40 block text-right">
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing response loader skeleton */}
          {isTyping && (
            <div className="flex gap-3 max-w-[80%] pr-8 animate-pulse text-on-surface-variant">
              <div className="p-2 h-9 w-9 rounded-xl bg-[#00dce6]/5 border border-[#00dce6]/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#00dce6]" />
              </div>
              <div className="space-y-1">
                <div id="ai-typing-skeleton" className="p-4 bg-[#1d1f24] border border-white/5 rounded-2xl rounded-tl-none font-sans text-xs text-on-surface-variant/70">
                  <span className="inline-block animate-bounce mr-1">&bull;</span>
                  <span className="inline-block animate-bounce [animation-delay:0.2s] mr-1">&bull;</span>
                  <span className="inline-block animate-bounce [animation-delay:0.4s]">&bull;</span>
                  <span className="ml-2">正在测算学术路线空间拓扑向量...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Form bottom input field */}
        <form onSubmit={handleFormSubmit} className="p-4 border-t border-white/5 bg-[#181a1f]/60 flex gap-3">
          <input
            id="input-mentor-chat-main"
            type="text"
            placeholder="询问 AI 导师关于必修前置链、特异研究领域、修读时长、选修避坑..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#111317] border border-white/10 rounded-2xl py-3 px-4 text-xs text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans"
          />
          <button
            id="btn-send-main-chat"
            type="submit"
            className="p-3 bg-primary hover:bg-[#d9e2ff] text-[#001944] rounded-2xl shadow-md cursor-pointer outline-none transition-all active:scale-95"
          >
            <Send className="w-4.5 h-4.5 font-bold" />
          </button>
        </form>
      </div>

    </div>
  );
}
