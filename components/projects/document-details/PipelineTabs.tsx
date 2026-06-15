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

export function PipelineTabs({ activeTab, onTabChange, tabs }: PipelineTabsProps) {
  return (
    <div className="border-b border-gray-800 bg-[#1a1a1a] px-4 flex-shrink-0">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => tab.enabled && onTabChange(tab.id)}
            disabled={!tab.enabled}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id
                ? "border-white text-white"
                : tab.enabled
                  ? "border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600"
                  : "border-transparent text-gray-700 cursor-not-allowed"
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