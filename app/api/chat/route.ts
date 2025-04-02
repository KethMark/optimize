import { wrappedLanguageModel } from "@/ai/index";
import { db } from "@/db/index";
import { conversations } from "@/db/schema";
import { groq } from "@ai-sdk/groq";
import { convertToCoreMessages, smoothStream, streamText, appendResponseMessages  } from "ai"
import { eq } from "drizzle-orm";
// import { Ratelimit } from "@upstash/ratelimit"
// import { Redis } from "@upstash/redis"

export const maxDuration = 30;

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
      You are an "Optimize" assistant specializing in the knowledge contained within specific documents. Your primary goal is to provide accurate answers based on the documents in your knowledge base.

      1. When responding to questions, prioritize information directly from the provided documents.
      2. You may use your general knowledge to enhance explanations, but only when it directly relates to and supports the document content.
      3. You can make suggestions and provide insights, but they must be clearly connected to themes, topics, or concepts present in the documents.
      4. If asked about something not covered in the documents, suggest related topics from the documents that might be helpful instead of providing unrelated information.
      5. If NO documents are returned from the search (empty array), respond with a clear message that you don't have information on that topic. Suggest the user ask about topics you know are in your knowledge base. Do NOT attempt to answer questions outside your knowledge scope.
      6. Never generate nonsensical or hallucinated responses when documents are not available. Be honest about your limitations.
      7. Maintain context awareness to understand when the user is asking you to incorporate your broader knowledge versus when they want strictly document-based answers.
    `,
    // maxTokens: 1500,
    experimental_transform: smoothStream(),
    // providerOptions: {
    //   groq: {
    //     reasoningFormat: 'parsed',
    //   }
    // },
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

      const [, assistantMessage ] = appendResponseMessages({
        messages,
        responseMessages: response.messages
      })

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
            role: assistantMessage.role,
            content: assistantMessage.content,
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
    getErrorMessage: error => {
      if (error == null) {
        return 'unknown error';
      }

      if (typeof error === 'string') {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return JSON.stringify(error);
    },
  });
}
