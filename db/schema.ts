import { generateId } from "ai";
import {
  index,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

export const ROLE_ENUM = pgEnum("role", ["USER", "ADMIN"]);

export const users = pgTable("users", {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: ROLE_ENUM("role").default("USER"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const fileStorage = pgTable("file_storage", {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  users: varchar('users_id', { length: 191 }).references(() => users.id),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  file_storage: varchar('file_storage_id', { length: 191 }).references(() => fileStorage.id),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable(
  "documents",
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    file_storage: varchar('file_storage_id', { length: 191 }).references(() => fileStorage.id),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1024 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    embeddingIndex: index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);