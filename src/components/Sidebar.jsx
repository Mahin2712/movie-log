import { useEffect, useState } from "react";

const STORAGE_KEY = "movieLog_v2_sidebar";

export default function Sidebar({ activeTab, setActiveTab }) {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={`h-screen bg-zinc-950 text-zinc-200 transition-all duration-300
    ${collapsed ? "w-16" : "w-56"}
    flex flex-col
  `}
    >

      {/* Top / Logo */}
      <div className="flex items-center justify-between p-4">
        <span className="text-lg font-bold">
          {collapsed ? "🎬" : "Movie-Log"}
        </span>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-zinc-400 hover:text-white"
        >
          {collapsed ? "➡️" : "⬅️"}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6 flex flex-col gap-1 px-2">
        <NavItem
          icon="🏠"
          label="All"
          active={activeTab === "all"}
          collapsed={collapsed}
          onClick={() => setActiveTab("all")}
        />

        <NavItem
          icon="📋"
          label="Watchlist"
          active={activeTab === "watchlist"}
          collapsed={collapsed}
          onClick={() => setActiveTab("watchlist")}
        />

        <NavItem
          icon="💖"
          label="Wishlist"
          active={activeTab === "wishlist"}
          collapsed={collapsed}
          onClick={() => setActiveTab("wishlist")}
        />

        <NavItem
          icon="📊"
          label="Insights"
          active={activeTab === "insights"}
          collapsed={collapsed}
          onClick={() => setActiveTab("insights")}
        />

      </nav>

      {/* Bottom */}
      <div className="mt-auto pb-4 flex flex-col gap-1 px-2">
        <NavItem icon="⚙️" label="Settings" collapsed={collapsed} />
        <NavItem icon="👤" label="Profile" collapsed={collapsed} />
      </div>
    </aside>
  );
}

function NavItem({ icon, label, collapsed, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
    flex items-center gap-3
    rounded-md px-3 py-2
    cursor-pointer select-none
    transition-colors
    ${active
          ? "bg-zinc-800 text-white"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
        }
  `}
    >


      <span className="text-lg">{icon}</span>
      {!collapsed && <span className="text-sm">{label}</span>}
    </div>
  );
}

