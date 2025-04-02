import 'server-only';
import { db } from "./index";
import { conversations } from "./schema";
import { asc, eq } from "drizzle-orm";

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.file_storage, id))
      .orderBy(asc(conversations.createdAt));
  } catch (error) {
    console.error('Failed to get messages by chat id from database', error);
    throw error;
  }
}