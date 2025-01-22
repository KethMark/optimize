import { db } from "@/db/index";
import { conversations } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { chatId } = await req.json();

  if (!chatId) {
    return NextResponse.json({ error: "ChatId is missing" });
  }

  const [conversation] = await db
    .select({content: conversations.content})
    .from(conversations)
    .where(eq(conversations.file_storage, chatId))
    .orderBy(desc(conversations.createdAt))
    .limit(1)

    if(!conversation) {
      return NextResponse.json([])
    }

    return NextResponse.json(conversation.content)
}
