import { useState, useEffect } from "react";
import { Clock, GraduationCap, ChevronDown, Bell } from "lucide-react";

interface TopAppBarProps {
  onNotifyClick?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function TopAppBar({ onNotifyClick, activeTab, setActiveTab }: TopAppBarProps) {
  const [timeRemaining, setTimeRemaining] = useState({ days: 14, hours: 4, mins: 56, secs: 32 });

  // Elegant live countdown simulation for Fall 2024 semester startup
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev.secs > 0) {
          return { ...prev, secs: prev.secs - 1 };
        } else if (prev.mins > 0) {
          return { ...prev, mins: prev.mins - 1, secs: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const headerTabs = [
    { id: "dashboard", label: "概览" },
    { id: "degree_audit", label: "毕业要求核算" },
    { id: "transcripts", label: "成绩单评估" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#111317]/50 backdrop-blur-xl border-b border-white/10">
      <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
        
        {/* Left side: Brand Title and Sub Navigation */}
        <div className="flex items-center gap-8">
          <span className="font-display text-xl font-bold tracking-tight text-white md:hidden">
            CoursePilot
          </span>
          <nav className="hidden md:flex gap-6">
            {headerTabs.map((tab) => (
              <button
                id={`header-tab-${tab.id.toLowerCase().replace(" ", "-")}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`transition-all duration-300 font-sans text-xs uppercase tracking-wider py-1 border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? "text-[#b0c6ff] border-[#b0c6ff] font-bold"
                    : "text-on-surface-variant hover:text-[#b0c6ff] border-transparent hover:border-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right side: Countdown and User Profile info */}
        <div className="flex items-center gap-6">
          
          {/* Live countdown timer badge */}
          <div className="hidden sm:flex items-center gap-2 bg-[#1a1c20] px-3.5 py-1.5 rounded-full border border-white/5 shadow-inner">
            <Clock className="w-4 h-4 text-[#00dce6] animate-pulse" />
            <span className="font-sans text-[11px] text-[#c2c6d7]">
              学期倒计时: <span className="text-[#00dce6] font-bold">{timeRemaining.days}天 {formatNumber(timeRemaining.hours)}时 {formatNumber(timeRemaining.mins)}分</span>
            </span>
          </div>

          {/* Quick notification bubble */}
          <button 
            id="btn-notifications"
            onClick={onNotifyClick}
            className="p-1.5 rounded-full hover:bg-white/5 text-on-surface-variant hover:text-white transition-colors relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#00dce6] rounded-full"></div>
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="font-display text-xs font-bold text-on-surface">Alex Rivera</p>
              <p className="font-sans text-[10px] text-on-surface-variant/60">计算机大三学生</p>
            </div>
            <div className="relative group cursor-pointer">
              <img
                alt="Alex Rivera Code Pilot Profile avatar"
                className="w-10 h-10 rounded-full border border-[#b0c6ff]/35 group-hover:border-[#b0c6ff] transition-all object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDECMmJTrOG1TBTKoyst7dhqwjNXJnxjE_5rScIlZmO722ptfp9cMsz_dKMp1l-SBPGz-iJ9VgpDS8KiM8fyPc3-U5QKtm5kRlbdclE6vQKY1sAYVqAkXnTAxD3jbmV_UjkgrAPkMn87edLHk_b3m4aXIdekPDneiCKHrsUcltvZIYxi1W2mal9mMyy7tqVbl6Qst41P-HiTFPZNEd4nq-UsBzMAMoPYxNj47otxKMbZaI6bciBYRzu9Znl1mgkag10ABCryFjKqrs"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-1.5 border-[#111317]"></span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
