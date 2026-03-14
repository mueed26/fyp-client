"use client";

import { UserButton } from "@clerk/nextjs";
import { Plus, Briefcase, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const handleProjectsClick = () => {
    router.push("/projects");
  };

  const handleNewProject = () => {
    router.push("/projects");
  };

  return (
    <div
      className={`bg-[#1a1a1a] text-white flex flex-col transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"
        }`}
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        {!isCollapsed && (
          <h1 className="text-lg font-medium text-gray-200">Study AI Companion</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-[#252525] rounded-md transition-colors"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={16} className="text-gray-400" />
          ) : (
            <PanelLeftClose size={16} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* New Project Button */}
      <div className="px-3 pb-3">
        <button
          onClick={handleNewProject}
          className={`w-full bg-[#252525] hover:bg-[#2a2a2a] border border-gray-700 hover:border-gray-600 rounded-lg transition-colors flex items-center gap-3 ${isCollapsed ? "p-3 justify-center" : "p-3"
            }`}
        >
          <Plus size={16} className="text-gray-400" />
          {!isCollapsed && <span className="text-gray-200">New project</span>}
        </button>
      </div>

      {/* Navigation */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <nav className="space-y-1">
            <button
              onClick={handleProjectsClick}
              className={`w-full flex items-center gap-3 p-2 text-sm rounded-md transition-colors ${pathname === "/projects"
                  ? "bg-[#252525] text-gray-200 border border-gray-700"
                  : "text-gray-400 hover:bg-[#252525] hover:text-gray-200"
                }`}
            >
              <Briefcase size={16} />
              <span>Projects</span>
            </button>
          </nav>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* User Section */}
      <div className="p-3 border-t border-gray-800">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
            }`}
        >
          <UserButton />
          {!isCollapsed && (
            <span className="text-sm text-gray-400">Profile</span>
          )}
        </div>
      </div>
    </div>
  );
}
