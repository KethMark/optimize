import { db } from "@/db/index";
import { documents } from "@/db/schema";
import { desc, eq, gt, sql, and, innerProduct } from "drizzle-orm";
import { groq } from "@ai-sdk/groq";
import {
  generateObject,
  generateText,
  LanguageModelV1Middleware,
} from "ai";
import { z } from "zod";
import { pipeline } from "@xenova/transformers";

const selectionSchema = z.object({
  files: z.object({
    chatId: z.string(),
  }),
});

export const Middleware: LanguageModelV1Middleware = {
  transformParams: async ({ params }) => {
    const { prompt: messages, providerMetadata } = params;

    const { success, data } = selectionSchema.safeParse(providerMetadata);

    if (!success) {
      return params;
    }

    const documentsId = data.files.chatId;

    const recentMessage = messages.pop();

    if (!recentMessage || recentMessage.role !== "user") {
      if (recentMessage) {
        messages.push(recentMessage);
      }
      return params;
    }

    const lastUserMessageContent = recentMessage.content
      .filter((content) => content.type === "text")
      .map((content) => content.text)
      .join("\n");

    const { object: classification } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      output: "enum",
      enum: ["question", "statement", "other"],
      system: "classify the user message as a question, statement, or other",
      prompt: lastUserMessageContent,
    });

    if (classification !== "question") {
      console.log("Not equal to question");
      messages.push(recentMessage);
      return params;
    }

    const { text: hypotheticalAnswer } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: "Answer the user question:",
      prompt: lastUserMessageContent,
    });

    const pipe = await pipeline("feature-extraction", "Supabase/gte-small");

    const output = await pipe(hypotheticalAnswer, {
      pooling: "mean",
      normalize: true,
    });

    const hypotheticalAnswerEmbedding = Array.from(output.data);

    const similarity = sql<number>`(${innerProduct(
      documents.embedding,
      hypotheticalAnswerEmbedding
    )}) * -1`;

    const similarGuides = await db
      .select({ name: documents.content, similarity })
      .from(documents)
      .where(and(gt(similarity, 0.7), eq(documents.file_storage, documentsId)))
      .orderBy((t) => desc(t.similarity))
      .limit(60);

    console.log("I'm done similar Guides", similarGuides);

    messages.push({
      role: "user",
      content: [
        ...recentMessage.content,
        {
          type: "text",
          text: "Here is some relevant information that you can only use to answer the specific question:",
        },
        ...similarGuides.map((document) => ({
          type: "text" as const,
          text: document.name,
        })),
        {
          type: "text",
          text: `
            If no relevant answer documents are found, Try to respond accurately without sensitive information that are related only in the documents.
            Don't make any response that are not related in the documents or else you are being ask to include the information in your document knowledge.
            If no related answer in the document or you are not being ask to include the information in your current knowledge, just response: "Try any different related question."
          `,
        },
      ],
    });

    return { ...params, prompt: messages };
  },
};
