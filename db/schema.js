import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// =====================================================
// USERS / PROFILES
// =====================================================

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),

  name: text("name").notNull(),

  email: text("email").notNull().unique(),

  avatar: text("avatar"),

  role: text("role")
    .default("user")
    .notNull(),

  // free / premium
  plan: text("plan")
    .default("free")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});


// =====================================================
// CATEGORIES
// =====================================================

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),

  name: text("name")
    .notNull()
    .unique(),
});


// =====================================================
// BOOKS
// =====================================================

export const books = pgTable("books", {
  id: serial("id").primaryKey(),

  title: text("title")
    .notNull(),

  author: text("author")
    .notNull(),

  description: text("description"),

  categoryId: integer("category_id"),

  coverUrl: text("cover_url"),

  // true = Premium book
  // false = Free book
  isPremium: boolean("is_premium")
    .default(false)
    .notNull(),

  status: text("status")
    .default("published")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});


// =====================================================
// CHAPTERS
// =====================================================

export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),

  bookId: integer("book_id")
    .notNull(),

  chapterNumber: integer("chapter_number")
    .notNull(),

  title: text("title")
    .notNull(),

  content: text("content")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});


// =====================================================
// COMMUNITY STORIES
// =====================================================

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),

  userId: uuid("user_id")
    .notNull(),

  title: text("title")
    .notNull(),

  categoryId: integer("category_id"),

  // Cover image uploaded by the writer
  coverUrl: text("cover_url"),

  content: text("content"),

  // draft / published
  status: text("status")
    .default("draft")
    .notNull(),

  // AI moderation information
  moderationStatus: text("moderation_status")
    .default("pending")
    .notNull(),

  moderationReason: text("moderation_reason"),

  moderationScore: integer("moderation_score"),

  reviewedAt: timestamp("reviewed_at"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});


// =====================================================
// NOTIFICATIONS
// =====================================================

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),

  userId: uuid("user_id")
    .notNull(),

  storyId: integer("story_id"),

  title: text("title")
    .notNull(),

  message: text("message")
    .notNull(),

  type: text("type")
    .default("info")
    .notNull(),

  isRead: boolean("is_read")
    .default(false)
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});


// =====================================================
// MY LIBRARY
// =====================================================

export const library = pgTable("library", {
  id: serial("id").primaryKey(),

  userId: uuid("user_id").notNull(),

  bookId: integer("book_id"),

  storyId: integer("story_id"),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});
// =====================================================
// READING PROGRESS
// =====================================================

export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),

  userId: uuid("user_id").notNull(),

  bookId: integer("book_id"),

  storyId: integer("story_id"),

  chapterId: integer("chapter_id"),

  progress: integer("progress").default(0).notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// =====================================================
// PREMIUM PAYMENTS
// =====================================================
//
// This table stores payment attempts and successful
// Premium payments.
//
// Payment provider:
// eSewa
//
// Status examples:
// PENDING
// COMPLETE
// FAILED
// CANCELLED
// =====================================================

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),

  // Readora user who is making the payment
  userId: uuid("user_id")
    .notNull(),

  // Unique transaction ID generated by Readora
  transactionUuid: text("transaction_uuid")
    .notNull()
    .unique(),

  // Amount paid
  amount: text("amount")
    .notNull(),

  // eSewa product code
  productCode: text("product_code")
    .notNull(),

  // Payment status
  status: text("status")
    .default("PENDING")
    .notNull(),

  // eSewa reference/transaction ID
  referenceId: text("reference_id"),

  // Transaction code returned by payment provider
  transactionCode: text("transaction_code"),

  // Payment provider
  paymentMethod: text("payment_method")
    .default("esewa")
    .notNull(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),
});