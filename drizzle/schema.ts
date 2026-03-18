import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Cases table - stores user lawsuit cases
 */
export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  caseType: varchar("caseType", { length: 100 }).notNull(), // e.g. 合同纠纷, 侵权纠纷, 借贷纠纷
  status: mysqlEnum("status", ["draft", "in_progress", "completed", "filed"]).default("draft").notNull(),

  // Plaintiff info
  plaintiffName: varchar("plaintiffName", { length: 100 }),
  plaintiffGender: varchar("plaintiffGender", { length: 10 }),
  plaintiffEthnicity: varchar("plaintiffEthnicity", { length: 20 }),
  plaintiffBirthDate: varchar("plaintiffBirthDate", { length: 20 }),
  plaintiffIdNumber: varchar("plaintiffIdNumber", { length: 64 }),
  plaintiffAddress: text("plaintiffAddress"),
  plaintiffPhone: varchar("plaintiffPhone", { length: 20 }),
  plaintiffType: mysqlEnum("plaintiffType", ["natural", "legal"]).default("natural"),

  // Defendant info
  defendantName: varchar("defendantName", { length: 100 }),
  defendantGender: varchar("defendantGender", { length: 10 }),
  defendantEthnicity: varchar("defendantEthnicity", { length: 20 }),
  defendantBirthDate: varchar("defendantBirthDate", { length: 20 }),
  defendantIdNumber: varchar("defendantIdNumber", { length: 64 }),
  defendantAddress: text("defendantAddress"),
  defendantPhone: varchar("defendantPhone", { length: 20 }),
  defendantType: mysqlEnum("defendantType", ["natural", "legal"]).default("natural"),

  // Case details
  claims: text("claims"), // 诉讼请求 (JSON array)
  factsAndReasons: text("factsAndReasons"), // 事实与理由
  evidenceList: text("evidenceList"), // 证据清单 (JSON array)
  courtName: varchar("courtName", { length: 200 }),
  disputeAmount: varchar("disputeAmount", { length: 50 }),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;

/**
 * Documents table - stores generated legal documents
 */
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  userId: int("userId").notNull(),
  docType: mysqlEnum("docType", ["complaint", "evidence_list", "other"]).default("complaint").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"), // Markdown/HTML content
  fileUrl: text("fileUrl"), // S3 URL for generated PDF
  fileKey: varchar("fileKey", { length: 500 }),
  version: int("version").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

/**
 * Notifications table - stores user notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  caseId: int("caseId"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["document_generated", "case_updated", "reminder", "system"]).default("system").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
