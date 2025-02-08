import { wrappedLanguageModel } from "@/ai/index";
import { db } from "@/db/index";
import { conversations } from "@/db/schema";
import { convertToCoreMessages, streamText } from "ai"
import { eq } from "drizzle-orm";

export const maxDuration = 30


export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  const result = streamText({
    model: wrappedLanguageModel,
    system: `You are a "Optimize" assistant . Check your knowledge base before answering any questions.`,
    messages: convertToCoreMessages(messages),
    experimental_providerMetadata: {
      files: {
        chatId: chatId,
      },
    },
    onFinish: async ({ text }) => {
      const activeFile = await db
        .select()
        .from(conversations)
        .where(eq(conversations.file_storage, chatId));

      if (activeFile.length > 0) {
        await db
          .update(conversations)
          .set({
            content: JSON.stringify([
              ...messages,
              { role: "assistant", content: text },
            ]),
          })
          .where(eq(conversations.file_storage, chatId));
      } else {
        await db
          .insert(conversations)
          .values({
            createdAt: new Date(),
            content: JSON.stringify([
              ...messages,
              { role: "assistant", content: text },
            ]),
            file_storage: chatId,
          });
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse();
}