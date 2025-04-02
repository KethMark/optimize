import { db } from "@/db/index";
import { documents } from "@/db/schema";
import { desc, eq, gt, sql, and, cosineDistance } from "drizzle-orm";
import { groq } from "@ai-sdk/groq";
import { generateObject, generateText, LanguageModelV1Middleware } from "ai";
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
      model: groq("gemma2-9b-it"),
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

    // const { text: hypotheticalAnswer } = await generateText({
    //   model: groq("gemma2-9b-it"),
    //   system: "Answer the user question:",
    //   prompt: lastUserMessageContent,
    // });
    // console.log('Hypothetical Answer:', hypotheticalAnswer)

    const pipe = await pipeline("feature-extraction", "Supabase/gte-small");

    const output = await pipe(lastUserMessageContent, {
      pooling: "mean",
      normalize: true,
    });

    const hypotheticalAnswerEmbedding = Array.from(output.data);

    const similarity = sql<number>`1 - (${cosineDistance(
      documents.embedding, 
      hypotheticalAnswerEmbedding
    )})`;
    
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
          text: "Here is some relevant information from my knowledge base to help answer your question:",
        },
        ...similarGuides.map((document) => ({
          type: "text" as const,
          text: document.name,
        })),
        {
          type: "text",
          text: `
            Based on these documents and the content they contain:
            
            1. I'll provide a direct answer if the information is found in these documents.
            2. I can make suggestions or provide additional context that's directly related to the concepts, topics, or themes in these documents.
            3. If your question isn't covered in these documents, I'll suggest related topics from the documents that might be helpful.
            4. If you specifically ask me to incorporate my broader knowledge along with document information, I can do so as long as it's relevant to the document themes.
            5. For questions completely unrelated or no relevant information to the documents, I'll respond with: "I don't have specific information about that in my knowledge base. Would you like to know about [related document topics] instead?"
          `,
        },
      ],
    });

    return { ...params, prompt: messages };
  },
};
