"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, SkeletonHistoryList, AnimatePresence, motion } from "@/components/ui";
import { api } from "@/lib/api";
import type { ChatSession } from "@/types";
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  Trash2, 
  Star,
  StarOff,
  Share2,
  Link as LinkIcon,
  Check,
} from "lucide-react";

type FilterType = "all" | "starred";

export default function HistoryPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["chatSessions", filter, debouncedSearch],
    queryFn: () => api.getChatSessions({
      starred: filter === "starred",
      search: debouncedSearch || undefined,
    }),
  });

  const toggleStarMutation = useMutation({
    mutationFn: ({ id, starred }: { id: number; starred: boolean }) =>
      api.updateChatSession(id, { starred }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteChatSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
    },
  });

  const shareMutation = useMutation({
    mutationFn: (id: number) => api.shareSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
    },
  });

  const unshareMutation = useMutation({
    mutationFn: (id: number) => api.unshareSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatSessions"] });
    },
  });

  const toggleStar = useCallback((session: ChatSession) => {
    toggleStarMutation.mutate({ id: session.id, starred: !session.starred });
  }, [toggleStarMutation]);

  const deleteItem = useCallback((id: number) => {
    if (confirm("确定要删除这个对话吗？")) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleShare = useCallback(async (session: ChatSession) => {
    if (session.is_public && session.share_url) {
      await navigator.clipboard.writeText(session.share_url);
      setCopiedId(session.id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      const result = await shareMutation.mutateAsync(session.id);
      await navigator.clipboard.writeText(result.share_url);
      setCopiedId(session.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, [shareMutation]);

  const handleUnshare = useCallback((id: number) => {
    if (confirm("确定要取消分享吗？取消后链接将失效。")) {
      unshareMutation.mutate(id);
    }
  }, [unshareMutation]);

  const openSession = useCallback((sessionId: number) => {
    router.push(`/chat?session=${sessionId}`);
  }, [router]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN");
  };

  const sessions = data?.items || [];

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
        {isLoading ? (
          <div className="max-w-3xl mx-auto">
            <SkeletonHistoryList count={5} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-error mb-2">加载失败</p>
            <p className="text-sm text-text-tertiary">{error instanceof Error ? error.message : "请稍后重试"}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-text-tertiary" />
            </div>
            <p className="text-text-secondary mb-2">暂无历史记录</p>
            <p className="text-sm text-text-tertiary">开始新对话后，记录将显示在这里</p>
          </div>
        ) : (
          <motion.div 
            className="max-w-3xl mx-auto space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
            }}
          >
            <AnimatePresence mode="popLayout">
            {sessions.map((item) => (
              <motion.div
                key={item.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0 },
                }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                whileHover={{ y: -2 }}
                onClick={() => openSession(item.id)}
                className="group p-4 rounded-xl border border-border-default bg-bg-secondary hover:border-border-hover hover:shadow-lg transition-shadow cursor-pointer"
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
                    {item.preview && (
                      <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                        {item.preview}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {item.message_count} 条消息
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(item);
                      }}
                      disabled={shareMutation.isPending}
                      className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors disabled:opacity-50"
                      title={item.is_public ? "复制分享链接" : "分享"}
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : item.is_public ? (
                        <LinkIcon className="w-4 h-4 text-brand-primary" />
                      ) : (
                        <Share2 className="w-4 h-4 text-text-tertiary" />
                      )}
                    </button>
                    {item.is_public && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnshare(item.id);
                        }}
                        disabled={unshareMutation.isPending}
                        className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors disabled:opacity-50 text-xs text-text-tertiary hover:text-error"
                        title="取消分享"
                      >
                        取消
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(item);
                      }}
                      disabled={toggleStarMutation.isPending}
                      className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors disabled:opacity-50"
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
                      disabled={deleteMutation.isPending}
                      className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors disabled:opacity-50"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-text-tertiary hover:text-error" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
