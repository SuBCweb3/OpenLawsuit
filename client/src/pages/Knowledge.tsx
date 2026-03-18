import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Scale,
  ArrowLeft,
  BookOpen,
  Search,
  ExternalLink,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";

type LawEntry = {
  category: string;
  title: string;
  articles: { num: string; content: string }[];
};

const lawEntries: LawEntry[] = [
  {
    category: "诉讼时效",
    title: "《民法典》诉讼时效相关条文",
    articles: [
      { num: "第188条", content: "向人民法院请求保护民事权利的诉讼时效期间为三年。法律另有规定的，依照其规定。诉讼时效期间自权利人知道或者应当知道权利受到损害以及义务人之日起计算。" },
      { num: "第189条", content: "当事人约定同一债务分期履行的，诉讼时效期间自最后一期履行期限届满之日起计算。" },
      { num: "第192条", content: "诉讼时效期间届满的，义务人可以提出不履行义务的抗辩。诉讼时效期间届满后，义务人同意履行的，不得以诉讼时效期间届满为由抗辩。" },
    ],
  },
  {
    category: "合同纠纷",
    title: "《民法典》合同编核心条文",
    articles: [
      { num: "第465条", content: "依法成立的合同，受法律保护。依法成立的合同，仅对当事人具有法律约束力，但是法律另有规定的除外。" },
      { num: "第577条", content: "当事人一方不履行合同义务或者履行合同义务不符合约定的，应当承担继续履行、采取补救措施或者赔偿损失等违约责任。" },
      { num: "第584条", content: "当事人一方不履行合同义务或者履行合同义务不符合约定，造成对方损失的，损失赔偿额应当相当于因违约所造成的损失。" },
    ],
  },
  {
    category: "侵权责任",
    title: "《民法典》侵权责任编核心条文",
    articles: [
      { num: "第1165条", content: "行为人因过错侵害他人民事权益造成损害的，应当承担侵权责任。" },
      { num: "第1179条", content: "侵害他人造成人身损害的，应当赔偿医疗费、护理费、交通费、营养费、住院伙食补助费等为治疗和康复支出的合理费用，以及因误工减少的收入。" },
      { num: "第1182条", content: "侵害他人人身权益造成财产损失的，按照被侵权人因此受到的损失或者侵权人因此获得的利益赔偿。" },
    ],
  },
  {
    category: "借贷纠纷",
    title: "《民法典》借款合同相关条文",
    articles: [
      { num: "第667条", content: "借款合同是借款人向贷款人借款，到期返还借款并支付利息的合同。" },
      { num: "第680条", content: "禁止高利放贷，借款的利率不得违反国家有关规定。借款合同对支付利息没有约定的，视为没有利息。" },
    ],
  },
  {
    category: "消费者权益",
    title: "《消费者权益保护法》核心条文",
    articles: [
      { num: "第7条", content: "消费者在购买、使用商品和接受服务时享有人身、财产安全不受损害的权利。" },
      { num: "第55条", content: "经营者提供商品或者服务有欺诈行为的，应当按照消费者的要求增加赔偿其受到的损失，增加赔偿的金额为消费者购买商品的价款或者接受服务的费用的三倍。" },
    ],
  },
  {
    category: "民事诉讼",
    title: "《民事诉讼法》起诉相关条文",
    articles: [
      { num: "第122条", content: "起诉必须符合下列条件：（一）原告是与本案有直接利害关系的公民、法人和其他组织；（二）有明确的被告；（三）有具体的诉讼请求和事实、理由；（四）属于人民法院受理民事诉讼的范围和受诉人民法院管辖。" },
      { num: "第126条", content: "人民法院应当保障当事人依照法律规定享有的起诉权利。对符合本法第一百二十二条的起诉，必须受理。符合起诉条件的，应当在七日内立案。" },
    ],
  },
];

export default function Knowledge() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return lawEntries;
    const q = searchQuery.toLowerCase();
    return lawEntries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.articles.some((a) => a.content.toLowerCase().includes(q) || a.num.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Scale className="h-5 w-5 text-primary" />
            <span className="font-semibold">法律知识库</span>
          </div>
        </div>
      </header>

      <div className="container py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
            <BookOpen className="h-3.5 w-3.5" />
            常用法律条文速查
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">法律知识库</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            快速查阅起诉相关的法律条文，为您的维权提供法律依据
          </p>
        </div>

        {/* Search */}
        <div className="max-w-lg mx-auto mb-10 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索法律条文、案由类型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Law entries */}
        <div className="space-y-6">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              未找到匹配的法律条文，请尝试其他关键词
            </div>
          )}
          {filtered.map((entry) => (
            <Card key={entry.title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{entry.title}</CardTitle>
                  <span className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1">
                    {entry.category}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {entry.articles.map((article) => (
                  <div key={article.num} className="border-l-2 border-primary/20 pl-4">
                    <p className="text-sm font-medium text-primary mb-1">{article.num}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{article.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* External resources */}
        <Card className="mt-10">
          <CardHeader>
            <CardTitle className="text-lg">更多法律资源</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: "中国裁判文书网", url: "https://wenshu.court.gov.cn/" },
                { name: "中国法院网", url: "https://www.chinacourt.org/" },
                { name: "国家法律法规数据库", url: "https://flk.npc.gov.cn/" },
                { name: "中国移动微法院", url: "https://www.court.gov.cn/" },
              ].map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{r.name}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
