import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Users / Profiles
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatar: text("avatar"),
  role: text("role").default("user").notNull(),
  plan: text("plan").default("free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// Books
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description"),
  categoryId: integer("category_id"),
  coverUrl: text("cover_url"),
  isPremium: boolean("is_premium").default(false).notNull(),
  status: text("status").default("published").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Chapters
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Community Stories
export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),

  userId: uuid("user_id").notNull(),

  title: text("title").notNull(),

  categoryId: integer("category_id"),

  content: text("content"),

  // Story publishing status
  status: text("status").default("draft").notNull(),

  // AI moderation information
  moderationStatus: text("moderation_status")
    .default("pending")
    .notNull(),

  moderationReason: text("moderation_reason"),

  moderationScore: integer("moderation_score"),

  reviewedAt: timestamp("reviewed_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),

  userId: uuid("user_id").notNull(),

  storyId: integer("story_id"),

  title: text("title").notNull(),

  message: text("message").notNull(),

  type: text("type").default("info").notNull(),

  isRead: boolean("is_read").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// My Library
export const library = pgTable("library", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reading Progress
export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  bookId: integer("book_id").notNull(),
  chapterId: integer("chapter_id"),
  progress: integer("progress").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});