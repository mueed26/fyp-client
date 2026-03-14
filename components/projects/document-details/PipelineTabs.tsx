interface PipelineTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Array<{
    id: string;
    name: string;
    enabled: boolean;
    icon: React.ReactNode;
  }>;
}

export function PipelineTabs({
  activeTab,
  onTabChange,
  tabs,
}: PipelineTabsProps) {
  return (
    <div className="border-b border-gray-700 bg-[#1e1e1e] px-6">
      <div className="flex space-x-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.enabled && onTabChange(tab.id)}
            disabled={!tab.enabled}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? tab.id === "completed"
                  ? "border-purple-400 text-purple-400"
                  : "border-blue-400 text-blue-400"
                : tab.enabled
                ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                : "border-transparent text-gray-600 cursor-not-allowed"
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}
