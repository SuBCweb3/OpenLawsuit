import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-001",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

function createUnauthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

// Mock database functions
vi.mock("./db", () => {
  const casesStore: any[] = [];
  let caseIdCounter = 1;
  const docsStore: any[] = [];
  let docIdCounter = 1;
  const notifsStore: any[] = [];
  let notifIdCounter = 1;

  return {
    createCase: vi.fn(async (data: any) => {
      const id = caseIdCounter++;
      casesStore.push({ id, ...data, createdAt: new Date(), updatedAt: new Date() });
      return id;
    }),
    getCasesByUserId: vi.fn(async (userId: number) => {
      return casesStore.filter((c) => c.userId === userId);
    }),
    getCaseById: vi.fn(async (id: number, userId: number) => {
      return casesStore.find((c) => c.id === id && c.userId === userId) || null;
    }),
    updateCase: vi.fn(async (id: number, userId: number, data: any) => {
      const idx = casesStore.findIndex((c) => c.id === id && c.userId === userId);
      if (idx >= 0) Object.assign(casesStore[idx], data);
    }),
    deleteCase: vi.fn(async (id: number, userId: number) => {
      const idx = casesStore.findIndex((c) => c.id === id && c.userId === userId);
      if (idx >= 0) casesStore.splice(idx, 1);
    }),
    createDocument: vi.fn(async (data: any) => {
      const id = docIdCounter++;
      docsStore.push({ id, ...data, createdAt: new Date(), updatedAt: new Date() });
      return id;
    }),
    getDocumentsByCaseId: vi.fn(async (caseId: number, userId: number) => {
      return docsStore.filter((d) => d.caseId === caseId && d.userId === userId);
    }),
    getDocumentById: vi.fn(async (id: number, userId: number) => {
      return docsStore.find((d) => d.id === id && d.userId === userId) || null;
    }),
    updateDocument: vi.fn(async () => {}),
    deleteDocument: vi.fn(async (id: number, userId: number) => {
      const idx = docsStore.findIndex((d) => d.id === id && d.userId === userId);
      if (idx >= 0) docsStore.splice(idx, 1);
    }),
    createNotification: vi.fn(async (data: any) => {
      const id = notifIdCounter++;
      notifsStore.push({ id, ...data, isRead: false, createdAt: new Date() });
      return id;
    }),
    getNotificationsByUserId: vi.fn(async (userId: number) => {
      return notifsStore.filter((n) => n.userId === userId);
    }),
    markNotificationRead: vi.fn(async () => {}),
    markAllNotificationsRead: vi.fn(async () => {}),
    getUnreadNotificationCount: vi.fn(async (userId: number) => {
      return notifsStore.filter((n) => n.userId === userId && !n.isRead).length;
    }),
  };
});

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [
      {
        message: {
          content: "# 民事起诉状\n\n这是一份自动生成的民事起诉状。",
        },
      },
    ],
  })),
}));

// Mock voice transcription
vi.mock("./_core/voiceTranscription", () => ({
  transcribeAudio: vi.fn(async () => ({
    text: "这是语音转写的文字内容",
    language: "zh",
  })),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn(async () => true),
}));

describe("cases router", () => {
  it("creates a case and returns an id", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.cases.create({
      title: "张三与李四借贷纠纷",
      caseType: "借贷纠纷",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("lists cases for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const cases = await caller.cases.list();
    expect(Array.isArray(cases)).toBe(true);
  });

  it("updates a case", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { id } = await caller.cases.create({
      title: "测试案件",
      caseType: "合同纠纷",
    });

    const result = await caller.cases.update({
      id,
      plaintiffName: "张三",
      defendantName: "李四",
      claims: "判令被告偿还借款",
    });

    expect(result).toEqual({ success: true });
  });

  it("deletes a case", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { id } = await caller.cases.create({
      title: "待删除案件",
      caseType: "其他",
    });

    const result = await caller.cases.delete({ id });
    expect(result).toEqual({ success: true });
  });

  it("rejects unauthenticated access", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.cases.list()).rejects.toThrow();
  });
});

describe("documents router", () => {
  it("generates a complaint document", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { id: caseId } = await caller.cases.create({
      title: "文书生成测试",
      caseType: "借贷纠纷",
    });

    const result = await caller.documents.generate({
      caseId,
      docType: "complaint",
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("content");
    expect(typeof result.content).toBe("string");
    expect(result.content.length).toBeGreaterThan(0);
  });

  it("generates an evidence list document", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { id: caseId } = await caller.cases.create({
      title: "证据清单测试",
      caseType: "侵权纠纷",
    });

    const result = await caller.documents.generate({
      caseId,
      docType: "evidence_list",
    });

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("content");
  });

  it("lists documents by case", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const { id: caseId } = await caller.cases.create({
      title: "文档列表测试",
      caseType: "合同纠纷",
    });

    const docs = await caller.documents.listByCase({ caseId });
    expect(Array.isArray(docs)).toBe(true);
  });
});

describe("ai router", () => {
  it("returns a chat reply", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.chat({
      message: "借钱不还怎么起诉？",
    });

    expect(result).toHaveProperty("reply");
    expect(typeof result.reply).toBe("string");
  });

  it("extracts structured info from description", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.ai.extractInfo({
      description: "我叫张三，2024年3月借给李四5万元，约定6个月后归还，到期后李四一直不还钱",
    });

    expect(result).toBeDefined();
  });
});

describe("notifications router", () => {
  it("lists notifications for user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const notifs = await caller.notifications.list();
    expect(Array.isArray(notifs)).toBe(true);
  });

  it("returns unread count", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const count = await caller.notifications.unreadCount();
    expect(typeof count).toBe("number");
  });

  it("marks all notifications as read", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.notifications.markAllRead();
    expect(result).toEqual({ success: true });
  });
});

describe("voice router", () => {
  it("transcribes audio", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.voice.transcribe({
      audioUrl: "https://example.com/test-audio.webm",
    });

    expect(result).toHaveProperty("text");
    expect(typeof result.text).toBe("string");
  });
});
