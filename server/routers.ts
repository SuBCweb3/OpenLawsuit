import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createCase, getCasesByUserId, getCaseById, updateCase, deleteCase,
  createDocument, getDocumentsByCaseId, getDocumentById, updateDocument, deleteDocument,
  createNotification, getNotificationsByUserId, markNotificationRead, markAllNotificationsRead, getUnreadNotificationCount,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ Case Management ============
  cases: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getCasesByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getCaseById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        caseType: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await createCase({
          userId: ctx.user.id,
          title: input.title,
          caseType: input.caseType,
          status: "draft",
        });
        await createNotification({
          userId: ctx.user.id,
          caseId: id,
          title: "案件已创建",
          message: `您的案件「${input.title}」已成功创建，请继续完善案件信息。`,
          type: "case_updated",
        });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        caseType: z.string().optional(),
        status: z.enum(["draft", "in_progress", "completed", "filed"]).optional(),
        plaintiffName: z.string().nullable().optional(),
        plaintiffGender: z.string().nullable().optional(),
        plaintiffEthnicity: z.string().nullable().optional(),
        plaintiffBirthDate: z.string().nullable().optional(),
        plaintiffIdNumber: z.string().nullable().optional(),
        plaintiffAddress: z.string().nullable().optional(),
        plaintiffPhone: z.string().nullable().optional(),
        plaintiffType: z.enum(["natural", "legal"]).optional(),
        defendantName: z.string().nullable().optional(),
        defendantGender: z.string().nullable().optional(),
        defendantEthnicity: z.string().nullable().optional(),
        defendantBirthDate: z.string().nullable().optional(),
        defendantIdNumber: z.string().nullable().optional(),
        defendantAddress: z.string().nullable().optional(),
        defendantPhone: z.string().nullable().optional(),
        defendantType: z.enum(["natural", "legal"]).optional(),
        claims: z.string().nullable().optional(),
        factsAndReasons: z.string().nullable().optional(),
        evidenceList: z.string().nullable().optional(),
        courtName: z.string().nullable().optional(),
        disputeAmount: z.string().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await updateCase(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteCase(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  // ============ Document Management ============
  documents: router({
    listByCase: protectedProcedure
      .input(z.object({ caseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getDocumentsByCaseId(input.caseId, ctx.user.id);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getDocumentById(input.id, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().optional(),
        title: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await updateDocument(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await deleteDocument(input.id, ctx.user.id);
        return { success: true };
      }),

    // Generate a legal document using LLM
    generate: protectedProcedure
      .input(z.object({
        caseId: z.number(),
        docType: z.enum(["complaint", "evidence_list"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const caseData = await getCaseById(input.caseId, ctx.user.id);
        if (!caseData) throw new Error("案件不存在");

        let prompt = "";
        let docTitle = "";

        if (input.docType === "complaint") {
          docTitle = `民事起诉状 - ${caseData.title}`;
          prompt = `你是一位资深的中国法律文书撰写专家。请根据以下案件信息，生成一份规范的民事起诉状。

案件信息：
- 案由：${caseData.caseType}
- 争议金额：${caseData.disputeAmount || "未填写"}
- 受理法院：${caseData.courtName || "未填写"}

原告信息：
- 类型：${caseData.plaintiffType === "legal" ? "法人" : "自然人"}
- 姓名/名称：${caseData.plaintiffName || "未填写"}
- 性别：${caseData.plaintiffGender || "未填写"}
- 民族：${caseData.plaintiffEthnicity || "未填写"}
- 出生日期：${caseData.plaintiffBirthDate || "未填写"}
- 身份证号：${caseData.plaintiffIdNumber || "未填写"}
- 住址：${caseData.plaintiffAddress || "未填写"}
- 联系电话：${caseData.plaintiffPhone || "未填写"}

被告信息：
- 类型：${caseData.defendantType === "legal" ? "法人" : "自然人"}
- 姓名/名称：${caseData.defendantName || "未填写"}
- 性别：${caseData.defendantGender || "未填写"}
- 民族：${caseData.defendantEthnicity || "未填写"}
- 出生日期：${caseData.defendantBirthDate || "未填写"}
- 身份证号：${caseData.defendantIdNumber || "未填写"}
- 住址：${caseData.defendantAddress || "未填写"}
- 联系电话：${caseData.defendantPhone || "未填写"}

诉讼请求：
${caseData.claims || "未填写"}

事实与理由：
${caseData.factsAndReasons || "未填写"}

请生成一份完整、规范的民事起诉状，包含标题、原被告信息、诉讼请求、事实与理由、此致、具状人和日期。使用 Markdown 格式输出。对于未填写的信息，请使用 [待补充] 标记。`;
        } else {
          docTitle = `证据清单 - ${caseData.title}`;
          prompt = `你是一位资深的中国法律文书撰写专家。请根据以下案件信息和证据描述，生成一份规范的证据清单。

案件信息：
- 案由：${caseData.caseType}
- 原告：${caseData.plaintiffName || "未填写"}
- 被告：${caseData.defendantName || "未填写"}

证据信息：
${caseData.evidenceList || "未提供证据描述"}

事实与理由（参考）：
${caseData.factsAndReasons || "未填写"}

请生成一份规范的证据清单，使用 Markdown 表格格式，包含序号、证据名称、证据来源、证据页数、证明目的等列。如果证据信息不完整，请根据案件类型和事实理由推断可能需要的证据。`;
        }

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "你是一位资深的中国法律文书撰写专家，精通各类民事法律文书的撰写规范。请严格按照中国法院的文书格式要求生成文书。" },
            { role: "user", content: prompt },
          ],
        });

        const rawContent = response.choices[0]?.message?.content;
        const content = typeof rawContent === "string" ? rawContent : "";

        const docId = await createDocument({
          caseId: input.caseId,
          userId: ctx.user.id,
          docType: input.docType,
          title: docTitle,
          content,
        });

        // Create notification
        await createNotification({
          userId: ctx.user.id,
          caseId: input.caseId,
          title: "文书已生成",
          message: `您的「${docTitle}」已自动生成，请查看并编辑。`,
          type: "document_generated",
        });

        // Update case status
        await updateCase(input.caseId, ctx.user.id, { status: "in_progress" });

        return { id: docId, content };
      }),
  }),

  // ============ AI Assistant ============
  ai: router({
    chat: protectedProcedure
      .input(z.object({
        message: z.string().min(1),
        context: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `你是"诉讼助手"，一位专业的中国法律顾问AI。你的职责是：
1. 帮助用户理解法律条文和诉讼流程
2. 协助完善案件事实陈述
3. 优化诉讼请求的表述
4. 提供法律建议和风险评估
5. 解答关于起诉流程的常见问题

请注意：
- 始终提醒用户你的建议仅供参考，不构成正式法律意见
- 引用具体的法律条文时请标明出处
- 使用通俗易懂的语言解释法律概念
- 如果问题超出你的能力范围，建议用户咨询专业律师`;

        const messages: Array<{ role: "system" | "user"; content: string }> = [
          { role: "system", content: systemPrompt },
        ];

        if (input.context) {
          messages.push({ role: "user", content: `当前案件上下文信息：\n${input.context}\n\n用户问题：${input.message}` });
        } else {
          messages.push({ role: "user", content: input.message });
        }

        const response = await invokeLLM({ messages });
        const rawContent = response.choices[0]?.message?.content;
        const reply = typeof rawContent === "string" ? rawContent : "抱歉，暂时无法回答您的问题。";
        return { reply };
      }),

    // Extract structured info from user description
    extractInfo: protectedProcedure
      .input(z.object({ description: z.string().min(1) }))
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "你是一位法律信息提取专家。请从用户的描述中提取结构化的案件信息。以JSON格式返回。",
            },
            {
              role: "user",
              content: `请从以下描述中提取案件相关信息：\n\n${input.description}\n\n请提取以下字段（如果描述中包含的话）：
- caseType: 案由类型（如合同纠纷、借贷纠纷、侵权纠纷等）
- plaintiffName: 原告姓名
- defendantName: 被告姓名
- claims: 诉讼请求
- factsAndReasons: 事实与理由
- disputeAmount: 争议金额
- evidenceDescription: 证据描述`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "case_info",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  caseType: { type: "string", description: "案由类型" },
                  plaintiffName: { type: "string", description: "原告姓名" },
                  defendantName: { type: "string", description: "被告姓名" },
                  claims: { type: "string", description: "诉讼请求" },
                  factsAndReasons: { type: "string", description: "事实与理由" },
                  disputeAmount: { type: "string", description: "争议金额" },
                  evidenceDescription: { type: "string", description: "证据描述" },
                },
                required: ["caseType", "plaintiffName", "defendantName", "claims", "factsAndReasons", "disputeAmount", "evidenceDescription"],
                additionalProperties: false,
              },
            },
          },
        });

        const extractedContent = response.choices[0]?.message?.content;
        const contentStr = typeof extractedContent === "string" ? extractedContent : "{}";
        try {
          return JSON.parse(contentStr);
        } catch {
          return { error: "无法解析提取结果" };
        }
      }),
  }),

  // ============ Voice Transcription ============
  voice: router({
    transcribe: protectedProcedure
      .input(z.object({
        audioUrl: z.string().url(),
        language: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: input.language || "zh",
        });
        if ("error" in result) {
          throw new Error(result.error);
        }
        return { text: result.text };
      }),
  }),

  // ============ Notifications ============
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getNotificationsByUserId(ctx.user.id);
    }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return getUnreadNotificationCount(ctx.user.id);
    }),

    markRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await markNotificationRead(input.id, ctx.user.id);
        return { success: true };
      }),

    markAllRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsRead(ctx.user.id);
      return { success: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
