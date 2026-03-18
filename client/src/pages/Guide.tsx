import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Scale,
  ArrowLeft,
  FileText,
  Search,
  Gavel,
  ClipboardList,
  AlertCircle,
  Clock,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { useLocation } from "wouter";

const processSteps = [
  {
    icon: Search,
    title: "第一步：起诉前的准备",
    items: [
      { label: "明确诉讼请求", detail: "确定您希望通过诉讼达到的目的，例如要求赔偿损失、履行合同义务、返还财产等。诉讼请求必须具体、明确。" },
      { label: "收集和整理证据", detail: "证据是诉讼的基石。常见证据类型包括：书证（合同、借条、转账记录）、物证、证人证言、视听资料（录音录像）、鉴定意见等。证据必须合法取得、真实可靠、与案件相关。" },
      { label: "确定被告", detail: "明确侵犯您合法权益的一方。自然人需提供姓名、身份证号、住址；法人需提供名称、统一社会信用代码、住所地、法定代表人信息。" },
      { label: "选择管辖法院", detail: "一般由被告住所地法院管辖。合同纠纷可由合同履行地法院管辖；侵权纠纷可由侵权行为地法院管辖。" },
      { label: "注意诉讼时效", detail: "一般民事诉讼时效为三年，自知道或应当知道权利受损之日起算。超过时效将丧失胜诉权。" },
    ],
  },
  {
    icon: FileText,
    title: "第二步：撰写起诉状",
    items: [
      { label: "标题", detail: "民事起诉状" },
      { label: "原告信息", detail: "姓名、性别、民族、出生日期、住址、联系方式、身份证号码" },
      { label: "被告信息", detail: "姓名、性别、民族、出生日期、住址、联系方式、身份证号码" },
      { label: "诉讼请求", detail: "明确列出希望法院判决的内容，如「判令被告支付欠款人民币XX元」" },
      { label: "事实与理由", detail: "按时间顺序客观叙述案件事实，引用证据和法律依据" },
      { label: "证据清单", detail: "列明提交的证据名称、数量和来源" },
    ],
  },
  {
    icon: ClipboardList,
    title: "第三步：提交与立案",
    items: [
      { label: "准备材料", detail: "起诉状原件及副本、证据材料原件及复印件、身份证明、授权委托书（如有代理人）" },
      { label: "立案审查", detail: "法院审查是否有明确被告、具体诉讼请求、事实和理由，以及是否属于管辖范围" },
      { label: "缴纳诉讼费", detail: "根据案件类型和争议金额确定。经济困难可申请缓交、减交或免交" },
    ],
  },
  {
    icon: Gavel,
    title: "第四步：庭审与判决",
    items: [
      { label: "庭前准备", detail: "法院送达起诉状副本给被告，被告15日内提交答辩状。法院可能组织证据交换和调解。" },
      { label: "庭审流程", detail: "法庭调查（举证质证）→ 法庭辩论 → 最后陈述" },
      { label: "判决执行", detail: "判决生效后，对方拒不履行可申请强制执行（申请期限为两年）" },
    ],
  },
];

const faqs = [
  { q: "没有钱请律师怎么办？", a: "您可以向法律援助机构申请法律援助，或选择自行起诉。对于小额诉讼，法院提供简易程序。此外，本平台可以帮助您自动生成法律文书，降低维权成本。" },
  { q: "不确定案件能否胜诉怎么办？", a: "诉讼结果存在不确定性。建议起诉前咨询专业律师进行风险评估。您也可以使用本平台的AI法律咨询功能获取初步建议。" },
  { q: "诉讼周期一般多长？", a: "简易程序一般三个月内审结，普通程序一般六个月内审结。具体时间因案件复杂程度和法院工作效率而异。" },
  { q: "起诉需要多少费用？", a: "诉讼费用根据案件类型和争议金额确定。财产案件按争议金额比例收取，非财产案件一般50-100元。胜诉后诉讼费通常由败诉方承担。" },
  { q: "可以在网上立案吗？", a: "目前全国大部分法院支持网上立案。您可以通过中国移动微法院、各地法院官网等渠道进行网上立案。" },
  { q: "证据不充分能起诉吗？", a: "可以起诉，但证据不充分可能导致败诉。建议尽可能收集完整的证据链。本平台的AI助手可以帮助您分析现有证据是否充分。" },
];

const caseTypes = [
  { type: "合同纠纷", desc: "买卖合同、借款合同、租赁合同、服务合同等违约纠纷", statute: "《民法典》合同编" },
  { type: "侵权纠纷", desc: "人身损害、财产损害、名誉权侵害等", statute: "《民法典》侵权责任编" },
  { type: "借贷纠纷", desc: "民间借贷、金融借款等", statute: "《民法典》第六百六十七条" },
  { type: "劳动争议", desc: "工资拖欠、违法解雇、工伤赔偿等", statute: "《劳动合同法》《劳动争议调解仲裁法》" },
  { type: "消费者权益", desc: "商品质量、虚假宣传、售后服务等", statute: "《消费者权益保护法》" },
  { type: "物权纠纷", desc: "所有权、用益物权、担保物权等", statute: "《民法典》物权编" },
];

export default function Guide() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-semibold">起诉攻略指南</span>
          </div>
          <Button size="sm" onClick={() => setLocation("/dashboard")}>
            开始创建案件
          </Button>
        </div>
      </header>

      <div className="container py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            完整起诉流程指南
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            民事起诉完全攻略
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            从证据收集到判决执行，一步步教您如何通过法律途径维护自身权益
          </p>
        </div>

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50/50 mb-10">
          <CardContent className="p-5 flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900 mb-1">重要提示</p>
              <p className="text-sm text-amber-800">
                本指南仅供参考和学习，不构成正式法律意见。在实际操作中，请务必咨询专业律师。
                注意诉讼时效（一般为三年），避免因超时丧失胜诉权。
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="process" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto">
            <TabsTrigger value="process">起诉流程</TabsTrigger>
            <TabsTrigger value="cases">常见案由</TabsTrigger>
            <TabsTrigger value="faq">常见问题</TabsTrigger>
          </TabsList>

          {/* Process Tab */}
          <TabsContent value="process" className="space-y-6">
            {processSteps.map((step, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {step.items.map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary/60 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium mb-0.5">{item.label}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Timeline summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  时间节点参考
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4 font-medium">阶段</th>
                        <th className="text-left py-2 pr-4 font-medium">时间参考</th>
                        <th className="text-left py-2 font-medium">法律依据</th>
                      </tr>
                    </thead>
                    <tbody className="text-muted-foreground">
                      <tr className="border-b"><td className="py-2 pr-4">诉讼时效</td><td className="py-2 pr-4">3年</td><td className="py-2">《民法典》第188条</td></tr>
                      <tr className="border-b"><td className="py-2 pr-4">立案审查</td><td className="py-2 pr-4">7日内</td><td className="py-2">《民事诉讼法》第126条</td></tr>
                      <tr className="border-b"><td className="py-2 pr-4">被告答辩期</td><td className="py-2 pr-4">15日</td><td className="py-2">《民事诉讼法》第128条</td></tr>
                      <tr className="border-b"><td className="py-2 pr-4">简易程序审结</td><td className="py-2 pr-4">3个月内</td><td className="py-2">《民事诉讼法》第164条</td></tr>
                      <tr className="border-b"><td className="py-2 pr-4">普通程序审结</td><td className="py-2 pr-4">6个月内</td><td className="py-2">《民事诉讼法》第152条</td></tr>
                      <tr><td className="py-2 pr-4">申请强制执行</td><td className="py-2 pr-4">2年内</td><td className="py-2">《民事诉讼法》第246条</td></tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Case Types Tab */}
          <TabsContent value="cases">
            <div className="grid md:grid-cols-2 gap-4">
              {caseTypes.map((ct) => (
                <Card key={ct.type}>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-2">{ct.type}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{ct.desc}</p>
                    <div className="text-xs text-primary bg-primary/5 rounded px-2.5 py-1 inline-block">
                      {ct.statute}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`}>
                      <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
