import { db } from "@/db/index";
import { conversations } from "@/db/schema";
import { UIMessage } from "ai";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { chatId } = await req.json();

  if (!chatId) {
    return NextResponse.json({ error: "ChatId is missing" });
  }
  
  const conversation = await db
    .select()
    .from(conversations)
    .where(eq(conversations.file_storage, chatId))
    .orderBy(desc(conversations.createdAt))

    if(!conversation.length) {
      return NextResponse.json([])
    }

    const initialMessage = conversation.map((message) => ({
      id: message.id,
      content: message.content as UIMessage['content'],
      role: message.role as UIMessage['role'],
      createdAt: message.createdAt
    }))

    console.log('InitialMessage:', initialMessage)

    return NextResponse.json(initialMessage)
}
