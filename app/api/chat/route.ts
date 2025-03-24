import { wrappedLanguageModel } from "@/ai/index";
import { db } from "@/db/index";
import { conversations } from "@/db/schema";
import { convertToCoreMessages, smoothStream, streamText, appendResponseMessages  } from "ai"
import { eq } from "drizzle-orm";
// import { Ratelimit } from "@upstash/ratelimit"
// import { Redis } from "@upstash/redis"

export const maxDuration = 30;

export function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  // const ratelimit = new Ratelimit({
  //   redis: Redis.fromEnv(),
  //   limiter: Ratelimit.fixedWindow(12, "2h"),
  // });

  // const { success } = await ratelimit.limit(chatId);

  // if (!success) {
  //   return new Response('You have reached your request limit', {status: 429});
  // }

  const result = streamText({
    model: wrappedLanguageModel,
    system: `
      You are a "Optimize" assistant . Check your knowledge base before answering any questions.
      Don't make any response that are not related in the documents, instead Just make a suggestion that are related only in the documents. 
      Don't share any information/insight that are not related documents.
    `,
    experimental_transform: smoothStream(),
    messages: convertToCoreMessages(messages),
    experimental_providerMetadata: {
      files: {
        chatId: chatId,
      },
    },
    onFinish: async ({ response }) => {
      const activeFile = await db
        .select()
        .from(conversations)
        .where(eq(conversations.file_storage, chatId));

      if (activeFile.length > 0) {
        await db
          .update(conversations)
          .set({
            content: appendResponseMessages({
              messages,
              responseMessages: response.messages
            }),
          })
          .where(eq(conversations.file_storage, chatId));
      } else {
        await db
          .insert(conversations)
          .values({
          createdAt: new Date(),
            content: appendResponseMessages({
              messages,
              responseMessages: response.messages
            }),
            file_storage: chatId,
        });
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  result.consumeStream();

  return result.toDataStreamResponse({
    getErrorMessage: errorHandler
  });
}
