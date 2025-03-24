import { generateId } from "ai";
import {
  index,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  primaryKey,
  vector,
  integer,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const ROLE_ENUM = pgEnum("role", ["USER", "ADMIN"]);

export const users = pgTable("user", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  name: text("name"),
  email: text("email").unique(),
  password: text("password"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: ROLE_ENUM("role").default("USER"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const fileStorage = pgTable("file_storage", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  users: varchar("users_id", { length: 191 }).references(() => users.id),
  fileUrl: text("file_url").notNull(),
  fileName: text("file_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => generateId()),
  file_storage: varchar("file_storage_id", { length: 191 }).references(
    () => fileStorage.id
  ),
  content: json("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable(
  "documents",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => generateId()),
    file_storage: varchar("file_storage_id", { length: 191 }).references(
      () => fileStorage.id
    ),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 384 }),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    embeddingIndex: index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops")
    ),
  })
);
