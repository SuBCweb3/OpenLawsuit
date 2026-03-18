import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  CheckCheck,
  FileText,
  Briefcase,
  AlertCircle,
  Info,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const typeIcons: Record<string, typeof Bell> = {
  document_generated: FileText,
  case_updated: Briefcase,
  reminder: AlertCircle,
  system: Info,
};

export default function Notifications() {
  return (
    <DashboardLayout>
      <NotificationsContent />
    </DashboardLayout>
  );
}

function NotificationsContent() {
  const notifsQuery = trpc.notifications.list.useQuery();
  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => notifsQuery.refetch(),
  });
  const markAllMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      notifsQuery.refetch();
      toast.success("已全部标记为已读");
    },
  });

  const notifs = notifsQuery.data || [];
  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">通知中心</h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `您有 ${unreadCount} 条未读通知` : "暂无未读通知"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending}>
            <CheckCheck className="mr-2 h-4 w-4" />
            全部已读
          </Button>
        )}
      </div>

      {notifsQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : notifs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Bell className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-1">暂无通知</h3>
            <p className="text-sm text-muted-foreground">
              当您创建案件或生成文书时，将会收到通知
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <Card
                key={n.id}
                className={`transition-colors ${!n.isRead ? "bg-primary/5 border-primary/20" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${!n.isRead ? "bg-primary/10" : "bg-muted"}`}>
                      <Icon className={`h-4 w-4 ${!n.isRead ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-medium ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {new Date(n.createdAt).toLocaleString("zh-CN")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    </div>
                    {!n.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-xs"
                        onClick={() => markReadMutation.mutate({ id: n.id })}
                      >
                        标记已读
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
