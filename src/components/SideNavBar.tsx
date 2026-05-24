import { LucideIcon, LayoutDashboard, Map, Compass, HardHat, Bot, Sparkles } from "lucide-react";

interface SideNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMentorSession: () => void;
}

export default function SideNavBar({ activeTab, setActiveTab, onOpenMentorSession }: SideNavBarProps) {
  const menuItems = [
    { id: "dashboard", label: "仪表盘", icon: LayoutDashboard },
    { id: "roadmap", label: "学业路线图", icon: Map },
    { id: "discovery", label: "课程选择器", icon: Compass },
    { id: "workload", label: "功课载荷模拟", icon: HardHat },
    { id: "mentor", label: "AI 领航导师", icon: Bot },
  ];

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest/70 backdrop-blur-3xl border-r border-white/10 py-4 gap-2 z-50">
      {/* Brand logo header */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary text-2xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
            flight_takeoff
          </span>
          <h1 className="font-display text-xl font-bold tracking-tight text-white">
            CoursePilot
          </h1>
        </div>
        <p className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest mt-1">
          V3.1 学术控制台
        </p>
      </div>

      {/* Main navigation list */}
      <nav className="flex-1 mt-6 space-y-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium font-display text-sm tracking-wide transition-all border duration-200 text-left ${
                isActive
                  ? "bg-primary/10 border-primary/25 text-primary shadow-[0_0_15px_rgba(176,198,255,0.15)] font-semibold"
                  : "bg-transparent border-transparent text-on-surface-variant hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 ${isActive ? "text-primary" : "text-on-surface-variant opacity-70"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Docked AI interactive button */}
      <div className="p-4 border-t border-white/5">
        <button
          id="btn-sidebar-mentor-session"
          onClick={onOpenMentorSession}
          className="w-full py-3 px-4 bg-secondary-container/15 hover:bg-secondary-container/25 border border-secondary-container/40 rounded-xl text-secondary hover:text-purple-200 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(111,0,190,0.15)] hover:shadow-[0_4px_25px_rgba(111,0,190,0.25)] transition-all cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 text-secondary group-hover:animate-bounce" />
          <span className="font-sans text-xs font-semibold uppercase tracking-wider">
            AI 导师深度会话
          </span>
        </button>
      </div>
    </aside>
  );
}
