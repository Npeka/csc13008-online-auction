import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "default" | "pills" | "underline";
  className?: string;
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = "default",
  className,
}: TabsProps) {
  return (
    <div
      className={cn(
        "flex",
        variant === "default" && "border-b border-border",
        variant === "pills" && "gap-2 rounded-lg bg-bg-secondary p-1",
        variant === "underline" && "gap-6",
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          disabled={tab.disabled}
          onClick={() => !tab.disabled && onChange(tab.id)}
          className={cn(
            "flex cursor-pointer items-center gap-2 font-medium transition-colors",
            "disabled:cursor-not-allowed disabled:opacity-50",
            // Default variant
            variant === "default" && [
              "-mb-px border-b-2 px-4 py-2",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:border-border hover:text-text",
            ],
            // Pills variant
            variant === "pills" && [
              "rounded-md px-4 py-2 text-sm",
              activeTab === tab.id
                ? "bg-bg-card text-text shadow-sm"
                : "text-text-muted hover:text-text",
            ],
            // Underline variant
            variant === "underline" && [
              "border-b-2 pb-2",
              activeTab === tab.id
                ? "border-primary text-text"
                : "border-transparent text-text-muted hover:text-text",
            ],
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Tab Panels Component
export interface TabPanelProps {
  children: React.ReactNode;
  value: string;
  activeTab: string;
  className?: string;
}

export function TabPanel({
  children,
  value,
  activeTab,
  className,
}: TabPanelProps) {
  if (value !== activeTab) return null;

  return (
    <div
      role="tabpanel"
      className={cn("animate-in fade-in duration-200", className)}
    >
      {children}
    </div>
  );
}

// Combined Tabs with Panels
export interface TabsWithPanelsProps {
  tabs: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
  }>;
  defaultTab?: string;
  variant?: "default" | "pills" | "underline";
  className?: string;
}

export function TabsWithPanels({
  tabs,
  defaultTab,
  variant = "default",
  className,
}: TabsWithPanelsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className={className}>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant={variant}
      />
      <div className="mt-4">
        {tabs.map((tab) => (
          <TabPanel key={tab.id} value={tab.id} activeTab={activeTab}>
            {tab.content}
          </TabPanel>
        ))}
      </div>
    </div>
  );
}
