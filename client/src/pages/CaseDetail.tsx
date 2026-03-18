import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Save,
  FileText,
  Loader2,
  Wand2,
  Mic,
  MicOff,
  Trash2,
  Download,
  Eye,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";


type FormData = {
  title: string;
  caseType: string;
  plaintiffType: "natural" | "legal";
  plaintiffName: string;
  plaintiffGender: string;
  plaintiffEthnicity: string;
  plaintiffBirthDate: string;
  plaintiffIdNumber: string;
  plaintiffAddress: string;
  plaintiffPhone: string;
  defendantType: "natural" | "legal";
  defendantName: string;
  defendantGender: string;
  defendantEthnicity: string;
  defendantBirthDate: string;
  defendantIdNumber: string;
  defendantAddress: string;
  defendantPhone: string;
  claims: string;
  factsAndReasons: string;
  evidenceList: string;
  courtName: string;
  disputeAmount: string;
};

export default function CaseDetail() {
  return (
    <DashboardLayout>
      <CaseDetailContent />
    </DashboardLayout>
  );
}

function CaseDetailContent() {
  const params = useParams<{ id: string }>();
  const caseId = Number(params.id);
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("plaintiff");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingField, setRecordingField] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; content: string } | null>(null);

  const caseQuery = trpc.cases.getById.useQuery({ id: caseId });
  const docsQuery = trpc.documents.listByCase.useQuery({ caseId });
  const updateMutation = trpc.cases.update.useMutation({
    onSuccess: () => toast.success("保存成功"),
    onError: (err) => toast.error(err.message),
  });
  const generateMutation = trpc.documents.generate.useMutation({
    onSuccess: () => {
      docsQuery.refetch();
      caseQuery.refetch();
      toast.success("文书生成成功");
    },
    onError: (err) => toast.error("生成失败：" + err.message),
  });
  const deleteDocMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      docsQuery.refetch();
      toast.success("文书已删除");
    },
  });
  const transcribeMutation = trpc.voice.transcribe.useMutation({
    onSuccess: (data) => {
      if (recordingField && data.text) {
        setForm((prev) => ({
          ...prev,
          [recordingField]: prev[recordingField as keyof FormData]
            ? prev[recordingField as keyof FormData] + "\n" + data.text
            : data.text,
        }));
        toast.success("语音转写完成");
      }
    },
    onError: () => toast.error("语音转写失败"),
  });
  const extractMutation = trpc.ai.extractInfo.useMutation({
    onSuccess: (data) => {
      if (data && !data.error) {
        setForm((prev) => ({
          ...prev,
          ...(data.caseType && { caseType: data.caseType }),
          ...(data.plaintiffName && { plaintiffName: data.plaintiffName }),
          ...(data.defendantName && { defendantName: data.defendantName }),
          ...(data.claims && { claims: data.claims }),
          ...(data.factsAndReasons && { factsAndReasons: data.factsAndReasons }),
          ...(data.disputeAmount && { disputeAmount: data.disputeAmount }),
          ...(data.evidenceDescription && { evidenceList: data.evidenceDescription }),
        }));
        toast.success("信息提取完成，已自动填充到表单");
      }
    },
    onError: () => toast.error("信息提取失败"),
  });

  const [form, setForm] = useState<FormData>({
    title: "",
    caseType: "",
    plaintiffType: "natural",
    plaintiffName: "",
    plaintiffGender: "",
    plaintiffEthnicity: "",
    plaintiffBirthDate: "",
    plaintiffIdNumber: "",
    plaintiffAddress: "",
    plaintiffPhone: "",
    defendantType: "natural",
    defendantName: "",
    defendantGender: "",
    defendantEthnicity: "",
    defendantBirthDate: "",
    defendantIdNumber: "",
    defendantAddress: "",
    defendantPhone: "",
    claims: "",
    factsAndReasons: "",
    evidenceList: "",
    courtName: "",
    disputeAmount: "",
  });

  useEffect(() => {
    if (caseQuery.data) {
      const c = caseQuery.data;
      setForm({
        title: c.title || "",
        caseType: c.caseType || "",
        plaintiffType: (c.plaintiffType as "natural" | "legal") || "natural",
        plaintiffName: c.plaintiffName || "",
        plaintiffGender: c.plaintiffGender || "",
        plaintiffEthnicity: c.plaintiffEthnicity || "",
        plaintiffBirthDate: c.plaintiffBirthDate || "",
        plaintiffIdNumber: c.plaintiffIdNumber || "",
        plaintiffAddress: c.plaintiffAddress || "",
        plaintiffPhone: c.plaintiffPhone || "",
        defendantType: (c.defendantType as "natural" | "legal") || "natural",
        defendantName: c.defendantName || "",
        defendantGender: c.defendantGender || "",
        defendantEthnicity: c.defendantEthnicity || "",
        defendantBirthDate: c.defendantBirthDate || "",
        defendantIdNumber: c.defendantIdNumber || "",
        defendantAddress: c.defendantAddress || "",
        defendantPhone: c.defendantPhone || "",
        claims: c.claims || "",
        factsAndReasons: c.factsAndReasons || "",
        evidenceList: c.evidenceList || "",
        courtName: c.courtName || "",
        disputeAmount: c.disputeAmount || "",
      });
    }
  }, [caseQuery.data]);

  const handleSave = () => {
    updateMutation.mutate({ id: caseId, ...form });
  };

  const handleField = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Voice recording
  const startRecording = useCallback(async (field: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size > 16 * 1024 * 1024) {
          toast.error("录音文件过大，请缩短录音时长");
          return;
        }
        // Upload to S3 then transcribe
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);
          const resp = await fetch("/api/trpc/voice.transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          // Use a simpler approach - convert to base64 and use a data URL
          // Actually, we need to upload to storage first
          toast.info("正在上传录音...");
          const formData = new FormData();
          formData.append("file", blob, "recording.webm");
          const uploadResp = await fetch("/api/upload-audio", {
            method: "POST",
            body: formData,
          });
          if (uploadResp.ok) {
            const { url } = await uploadResp.json();
            transcribeMutation.mutate({ audioUrl: url });
          } else {
            toast.error("录音上传失败");
          }
        } catch {
          toast.error("处理录音失败");
        }
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingField(field);
      toast.info("开始录音...");
    } catch {
      toast.error("无法访问麦克风，请检查权限设置");
    }
  }, [transcribeMutation]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("录音结束，正在转写...");
    }
  }, []);

  const VoiceButton = ({ field }: { field: string }) => (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="shrink-0"
      onClick={() => {
        if (isRecording && recordingField === field) {
          stopRecording();
        } else if (!isRecording) {
          startRecording(field);
        }
      }}
      disabled={isRecording && recordingField !== field}
      title={isRecording && recordingField === field ? "停止录音" : "语音录入"}
    >
      {isRecording && recordingField === field ? (
        <MicOff className="h-4 w-4 text-destructive" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );

  if (caseQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!caseQuery.data) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground mb-4">案件不存在或无权访问</p>
        <Button onClick={() => setLocation("/dashboard")}>返回案件列表</Button>
      </div>
    );
  }

  const tabSteps = [
    { value: "plaintiff", label: "原告信息" },
    { value: "defendant", label: "被告信息" },
    { value: "claims", label: "诉讼请求" },
    { value: "facts", label: "事实与理由" },
    { value: "evidence", label: "证据" },
    { value: "documents", label: "文书管理" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{form.title || "案件详情"}</h1>
            <p className="text-sm text-muted-foreground">{form.caseType}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            保存
          </Button>
        </div>
      </div>

      {/* AI Extract */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Wand2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium mb-2">AI 智能填充</p>
              <p className="text-xs text-muted-foreground mb-3">
                用自然语言描述您的案件情况，AI 将自动提取关键信息并填充到表单中
              </p>
              <div className="flex gap-2">
                <Textarea
                  id="ai-extract-input"
                  placeholder="例如：我叫张三，2024年3月借给李四5万元，约定6个月后归还，到期后李四一直不还钱..."
                  className="text-sm bg-background"
                  rows={2}
                />
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    disabled={extractMutation.isPending}
                    onClick={() => {
                      const el = document.getElementById("ai-extract-input") as HTMLTextAreaElement;
                      if (el?.value.trim()) {
                        extractMutation.mutate({ description: el.value.trim() });
                      }
                    }}
                  >
                    {extractMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "提取"}
                  </Button>
                  <VoiceButton field="ai-extract" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guided Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          {tabSteps.map((s) => (
            <TabsTrigger key={s.value} value={s.value} className="text-xs md:text-sm">
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Plaintiff */}
        <TabsContent value="plaintiff">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">原告信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>主体类型</Label>
                <Select value={form.plaintiffType} onValueChange={(v) => handleField("plaintiffType", v as "natural" | "legal")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">自然人</SelectItem>
                    <SelectItem value="legal">法人/组织</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{form.plaintiffType === "legal" ? "名称" : "姓名"}</Label>
                  <Input value={form.plaintiffName} onChange={(e) => handleField("plaintiffName", e.target.value)} />
                </div>
                {form.plaintiffType === "natural" && (
                  <div className="space-y-2">
                    <Label>性别</Label>
                    <Select value={form.plaintiffGender} onValueChange={(v) => handleField("plaintiffGender", v)}>
                      <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="男">男</SelectItem>
                        <SelectItem value="女">女</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {form.plaintiffType === "natural" && (
                  <div className="space-y-2">
                    <Label>民族</Label>
                    <Input value={form.plaintiffEthnicity} onChange={(e) => handleField("plaintiffEthnicity", e.target.value)} placeholder="例如：汉族" />
                  </div>
                )}
                {form.plaintiffType === "natural" && (
                  <div className="space-y-2">
                    <Label>出生日期</Label>
                    <Input type="date" value={form.plaintiffBirthDate} onChange={(e) => handleField("plaintiffBirthDate", e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{form.plaintiffType === "legal" ? "统一社会信用代码" : "身份证号码"}</Label>
                  <Input value={form.plaintiffIdNumber} onChange={(e) => handleField("plaintiffIdNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>联系电话</Label>
                  <Input value={form.plaintiffPhone} onChange={(e) => handleField("plaintiffPhone", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{form.plaintiffType === "legal" ? "住所地" : "住址"}</Label>
                <Input value={form.plaintiffAddress} onChange={(e) => handleField("plaintiffAddress", e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setActiveTab("defendant")}>
                  下一步：被告信息 <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Defendant */}
        <TabsContent value="defendant">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">被告信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>主体类型</Label>
                <Select value={form.defendantType} onValueChange={(v) => handleField("defendantType", v as "natural" | "legal")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="natural">自然人</SelectItem>
                    <SelectItem value="legal">法人/组织</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{form.defendantType === "legal" ? "名称" : "姓名"}</Label>
                  <Input value={form.defendantName} onChange={(e) => handleField("defendantName", e.target.value)} />
                </div>
                {form.defendantType === "natural" && (
                  <div className="space-y-2">
                    <Label>性别</Label>
                    <Select value={form.defendantGender} onValueChange={(v) => handleField("defendantGender", v)}>
                      <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="男">男</SelectItem>
                        <SelectItem value="女">女</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {form.defendantType === "natural" && (
                  <div className="space-y-2">
                    <Label>民族</Label>
                    <Input value={form.defendantEthnicity} onChange={(e) => handleField("defendantEthnicity", e.target.value)} placeholder="例如：汉族" />
                  </div>
                )}
                {form.defendantType === "natural" && (
                  <div className="space-y-2">
                    <Label>出生日期</Label>
                    <Input type="date" value={form.defendantBirthDate} onChange={(e) => handleField("defendantBirthDate", e.target.value)} />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>{form.defendantType === "legal" ? "统一社会信用代码" : "身份证号码"}</Label>
                  <Input value={form.defendantIdNumber} onChange={(e) => handleField("defendantIdNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>联系电话</Label>
                  <Input value={form.defendantPhone} onChange={(e) => handleField("defendantPhone", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{form.defendantType === "legal" ? "住所地" : "住址"}</Label>
                <Input value={form.defendantAddress} onChange={(e) => handleField("defendantAddress", e.target.value)} />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("plaintiff")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> 上一步
                </Button>
                <Button onClick={() => setActiveTab("claims")}>
                  下一步：诉讼请求 <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claims */}
        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">诉讼请求与法院</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>受理法院</Label>
                  <Input value={form.courtName} onChange={(e) => handleField("courtName", e.target.value)} placeholder="例如：北京市朝阳区人民法院" />
                </div>
                <div className="space-y-2">
                  <Label>争议金额</Label>
                  <Input value={form.disputeAmount} onChange={(e) => handleField("disputeAmount", e.target.value)} placeholder="例如：50000元" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>诉讼请求</Label>
                  <VoiceButton field="claims" />
                </div>
                <Textarea
                  value={form.claims}
                  onChange={(e) => handleField("claims", e.target.value)}
                  placeholder={"请逐条列出您的诉讼请求，例如：\n1. 判令被告偿还借款本金人民币50000元；\n2. 判令被告支付逾期利息；\n3. 本案诉讼费用由被告承担。"}
                  rows={6}
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("defendant")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> 上一步
                </Button>
                <Button onClick={() => setActiveTab("facts")}>
                  下一步：事实与理由 <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facts */}
        <TabsContent value="facts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">事实与理由</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>事实与理由</Label>
                  <VoiceButton field="factsAndReasons" />
                </div>
                <Textarea
                  value={form.factsAndReasons}
                  onChange={(e) => handleField("factsAndReasons", e.target.value)}
                  placeholder={"请按时间顺序详细描述案件事实经过，包括：\n- 双方关系及背景\n- 事件发生的时间、地点、经过\n- 造成的损害或损失\n- 引用的法律依据"}
                  rows={12}
                />
                <p className="text-xs text-muted-foreground">
                  提示：可以点击麦克风按钮使用语音录入，AI 将自动转写为文字
                </p>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("claims")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> 上一步
                </Button>
                <Button onClick={() => setActiveTab("evidence")}>
                  下一步：证据 <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence */}
        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">证据清单</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>证据描述</Label>
                  <VoiceButton field="evidenceList" />
                </div>
                <Textarea
                  value={form.evidenceList}
                  onChange={(e) => handleField("evidenceList", e.target.value)}
                  placeholder={"请描述您拥有的证据，例如：\n1. 借条原件一份，证明借贷关系成立\n2. 微信转账记录截图，证明实际出借金额\n3. 微信聊天记录截图，证明多次催还未果"}
                  rows={8}
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveTab("facts")}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> 上一步
                </Button>
                <Button onClick={() => { handleSave(); setActiveTab("documents"); }}>
                  保存并查看文书 <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          <div className="space-y-4">
            {/* Generate buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">生成法律文书</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  请确保已保存案件信息后再生成文书。AI 将根据您填写的信息自动生成规范的法律文书。
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => { handleSave(); generateMutation.mutate({ caseId, docType: "complaint" }); }}
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    生成民事起诉状
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { handleSave(); generateMutation.mutate({ caseId, docType: "evidence_list" }); }}
                    disabled={generateMutation.isPending}
                  >
                    {generateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                    生成证据清单
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Document list */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">已生成文书</CardTitle>
              </CardHeader>
              <CardContent>
                {docsQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : !docsQuery.data?.length ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    暂无文书，请先生成法律文书
                  </p>
                ) : (
                  <div className="space-y-3">
                    {docsQuery.data.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{doc.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(doc.createdAt).toLocaleString("zh-CN")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPreviewDoc({ title: doc.title, content: doc.content || "" })}
                            title="预览"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm("确定删除此文书？")) deleteDocMutation.mutate({ id: doc.id });
                            }}
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-background rounded-lg shadow-xl max-w-3xl w-full max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">{previewDoc.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setPreviewDoc(null)}>
                关闭
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-6 prose prose-sm max-w-none">
              <Streamdown>{previewDoc.content}</Streamdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
