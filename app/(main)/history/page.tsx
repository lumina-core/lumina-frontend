"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  Trash2, 
  Star,
  StarOff,
  MoreHorizontal,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatHistory {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  messageCount: number;
  starred: boolean;
}

const mockHistory: ChatHistory[] = [
  {
    id: "1",
    title: "新能源汽车行业分析",
    preview: "最近有哪些关于新能源汽车的重要新闻？特别是关于电池技术...",
    createdAt: "2024-01-20",
    messageCount: 12,
    starred: true,
  },
  {
    id: "2",
    title: "低空经济发展趋势",
    preview: "分析一下低空经济的发展趋势，特别是无人机配送领域...",
    createdAt: "2024-01-19",
    messageCount: 8,
    starred: false,
  },
  {
    id: "3",
    title: "AI 芯片竞争格局",
    preview: "目前 AI 芯片市场的竞争格局如何？英伟达的优势在哪里...",
    createdAt: "2024-01-18",
    messageCount: 15,
    starred: true,
  },
  {
    id: "4",
    title: "光伏产业链分析",
    preview: "光伏产业链上下游的最新动态，特别是硅料价格走势...",
    createdAt: "2024-01-17",
    messageCount: 6,
    starred: false,
  },
];

type FilterType = "all" | "starred";

export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [history, setHistory] = useState(mockHistory);

  const filteredHistory = history.filter((item) => {
    const matchesFilter = filter === "all" || (filter === "starred" && item.starred);
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const toggleStar = (id: string) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, starred: !item.starred } : item
    ));
  };

  const deleteItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border-default bg-bg-secondary/50 px-6 py-4">
        <h1 className="text-xl font-semibold text-text-primary mb-4">历史记录</h1>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="搜索对话..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border-default bg-bg-primary text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary"
            />
          </div>
          
          {/* Filter */}
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              全部
            </Button>
            <Button
              variant={filter === "starred" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter("starred")}
            >
              <Star className="w-4 h-4 mr-1" />
              收藏
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-text-tertiary" />
            </div>
            <p className="text-text-secondary mb-2">暂无历史记录</p>
            <p className="text-sm text-text-tertiary">开始新对话后，记录将显示在这里</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="group p-4 rounded-xl border border-border-default bg-bg-secondary hover:border-border-hover transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-primary truncate">
                        {item.title}
                      </h3>
                      {item.starred && (
                        <Star className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                      {item.preview}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.createdAt}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {item.messageCount} 条消息
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(item.id);
                      }}
                      className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                      title={item.starred ? "取消收藏" : "收藏"}
                    >
                      {item.starred ? (
                        <StarOff className="w-4 h-4 text-text-tertiary" />
                      ) : (
                        <Star className="w-4 h-4 text-text-tertiary" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }}
                      className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-text-tertiary hover:text-error" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
