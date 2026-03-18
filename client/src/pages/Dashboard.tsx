import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ArrowRight,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  draft: { label: "草稿", icon: FileText, color: "text-muted-foreground" },
  in_progress: { label: "进行中", icon: Clock, color: "text-amber-600" },
  completed: { label: "已完成", icon: CheckCircle2, color: "text-green-600" },
  filed: { label: "已提交", icon: AlertCircle, color: "text-primary" },
};

const caseTypeOptions = [
  "合同纠纷",
  "借贷纠纷",
  "侵权纠纷",
  "劳动争议",
  "消费者权益",
  "物权纠纷",
  "婚姻家庭",
  "其他",
];

export default function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("");

  const casesQuery = trpc.cases.list.useQuery();
  const createMutation = trpc.cases.create.useMutation({
    onSuccess: (data) => {
      casesQuery.refetch();
      setDialogOpen(false);
      setNewTitle("");
      setNewType("");
      toast.success("案件已创建");
      setLocation(`/case/${data.id}`);
    },
    onError: (err) => toast.error(err.message),
  });
  const deleteMutation = trpc.cases.delete.useMutation({
    onSuccess: () => {
      casesQuery.refetch();
      toast.success("案件已删除");
    },
    onError: (err) => toast.error(err.message),
  });

  const cases = casesQuery.data || [];

  const handleCreate = () => {
    if (!newTitle.trim() || !newType) {
      toast.error("请填写案件名称和案由类型");
      return;
    }
    createMutation.mutate({ title: newTitle.trim(), caseType: newType });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">我的案件</h1>
          <p className="text-muted-foreground mt-1">
            管理您的诉讼案件，创建和生成法律文书
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新建案件
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新案件</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>案件名称</Label>
                <Input
                  placeholder="例如：张三与李四借贷纠纷"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>案由类型</Label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择案由类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {caseTypeOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "全部案件", count: cases.length, color: "text-foreground" },
          { label: "草稿", count: cases.filter((c) => c.status === "draft").length, color: "text-muted-foreground" },
          { label: "进行中", count: cases.filter((c) => c.status === "in_progress").length, color: "text-amber-600" },
          { label: "已完成", count: cases.filter((c) => c.status === "completed" || c.status === "filed").length, color: "text-green-600" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Case List */}
      {casesQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : cases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Briefcase className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-1">暂无案件</h3>
            <p className="text-sm text-muted-foreground mb-4">
              点击"新建案件"开始创建您的第一个诉讼案件
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新建案件
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cases.map((c) => {
            const status = statusMap[c.status] || statusMap.draft;
            const StatusIcon = status.icon;
            return (
              <Card
                key={c.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setLocation(`/case/${c.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="font-semibold text-lg truncate">{c.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted ${status.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{c.caseType}</span>
                        <span>创建于 {new Date(c.createdAt).toLocaleDateString("zh-CN")}</span>
                        {c.disputeAmount && <span>争议金额：{c.disputeAmount}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("确定要删除此案件吗？此操作不可撤销。")) {
                            deleteMutation.mutate({ id: c.id });
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
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
