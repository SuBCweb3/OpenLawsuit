import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import {
  Scale,
  FileText,
  Shield,
  Mic,
  Brain,
  Bell,
  ArrowRight,
  BookOpen,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { useLocation } from "wouter";

const features = [
  {
    icon: FileText,
    title: "智能文书生成",
    desc: "基于案件信息自动生成规范的民事起诉状、证据清单等法律文书，符合法院格式要求。",
  },
  {
    icon: Brain,
    title: "AI 法律咨询",
    desc: "集成大语言模型，帮助您理解法律条文、完善案件陈述、优化诉讼请求表述。",
  },
  {
    icon: Mic,
    title: "语音录入",
    desc: "支持语音描述案件事实和证据，自动转写为文字并填充到表单中，提升录入效率。",
  },
  {
    icon: Briefcase,
    title: "案件管理",
    desc: "创建、管理多个案件及相关文书，随时查看案件进度，一站式管理您的诉讼事务。",
  },
  {
    icon: Shield,
    title: "隐私保护",
    desc: "所有敏感信息加密传输，严格保护您的个人隐私和案件数据安全。",
  },
  {
    icon: Bell,
    title: "智能通知",
    desc: "文书生成完成、案件状态更新时自动通知，重要节点及时提醒处理。",
  },
];

const steps = [
  { num: "01", title: "创建案件", desc: "填写基本信息，选择案由类型" },
  { num: "02", title: "完善信息", desc: "通过引导式表单录入原被告信息、诉讼请求和事实理由" },
  { num: "03", title: "生成文书", desc: "AI 自动生成规范的法律文书" },
  { num: "04", title: "下载使用", desc: "编辑、导出并提交至法院" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Scale className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold tracking-tight">OpenLawsuit</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => setLocation("/guide")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              起诉攻略
            </button>
            <button onClick={() => setLocation("/knowledge")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              法律知识库
            </button>
            {user ? (
              <Button size="sm" onClick={() => setLocation("/dashboard")}>
                进入工作台
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
                登录
              </Button>
            )}
          </nav>
          {/* Mobile nav */}
          <div className="md:hidden flex items-center gap-2">
            {user ? (
              <Button size="sm" onClick={() => setLocation("/dashboard")}>
                工作台
              </Button>
            ) : (
              <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
                登录
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/10" />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm text-muted-foreground">
              <Scale className="h-3.5 w-3.5" />
              开源法律维权辅助平台
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              让法律维权
              <span className="text-primary">不再困难</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              OpenLawsuit 是一个智能起诉辅助平台，通过 AI 技术帮助您自动生成法律文书、
              管理案件信息，降低法律维权门槛，让每个人都能拿起法律武器保护自己。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              {user ? (
                <Button size="lg" onClick={() => setLocation("/dashboard")} className="text-base px-8">
                  进入工作台
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button size="lg" onClick={() => (window.location.href = getLoginUrl())} className="text-base px-8">
                  免费开始使用
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              <Button size="lg" variant="outline" onClick={() => setLocation("/guide")} className="text-base px-8">
                <BookOpen className="mr-2 h-4 w-4" />
                查看起诉攻略
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">核心功能</h2>
            <p className="mt-3 text-muted-foreground text-lg">
              从案件创建到文书生成，全流程智能辅助
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="border bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold tracking-tight">四步完成起诉准备</h2>
            <p className="mt-3 text-muted-foreground text-lg">
              简单的引导式流程，帮助您快速完成起诉文书准备
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative text-center">
                <div className="text-5xl font-bold text-primary/15 mb-3">{s.num}</div>
                <h3 className="font-semibold text-lg mb-1.5">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ChevronRight className="hidden md:block absolute top-8 -right-3 h-5 w-5 text-muted-foreground/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            开始您的法律维权之路
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            无需法律专业知识，OpenLawsuit 将引导您完成起诉准备的每一步。
          </p>
          {user ? (
            <Button size="lg" variant="secondary" onClick={() => setLocation("/dashboard")} className="text-base px-8">
              进入工作台
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button size="lg" variant="secondary" onClick={() => (window.location.href = getLoginUrl())} className="text-base px-8">
              免费注册使用
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <span className="font-semibold">OpenLawsuit</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              免责声明：本平台提供的内容仅供参考，不构成正式法律意见。实际操作中请咨询专业律师。
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
