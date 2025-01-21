import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { embedMany } from "ai";
import { cohere } from "@ai-sdk/cohere";
import { auth } from "@/auth";
import { db } from "@/db/index";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { documents, fileStorage, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const embeddingModel = cohere.embedding("embed-english-v3.0", {
  inputType: "search_document",
});

export async function POST(req: Request) {
  const { fileUrl, fileName } = await req.json()

  const session = await auth()
  
  if (
    !session || 
    !session.user || 
    !session.user.id
  ) {
    return NextResponse.json("You must logged in")
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))

  if (
    !user || 
    !user[0].id
  ) {
    return NextResponse.json('User not found')
  }

  const data = await db
    .insert(fileStorage)
    .values({ fileUrl, fileName, users: user[0].id })
    .returning()

  const fileStorageId = data[0].id

  const response = await fetch(fileUrl);
  const buffer = await response.blob();
  const loader = new PDFLoader(buffer);
  const docs = await loader.load();

  const text_splitters = new RecursiveCharacterTextSplitter({
    chunkSize: 350,
    chunkOverlap: 50,
  });

  const splitDocuments = await text_splitters.splitDocuments(docs);

  const chunks = splitDocuments.map((chunk) => chunk.pageContent);

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });

  const generateEmbeddings = embeddings.map((e, i) => ({
    content: chunks[i],
    embedding: e,
  }));

  await db.insert(documents).values(
    generateEmbeddings.map((embedding) => ({
      file_storage: fileStorageId,
      ...embedding,
    }))
  );

  return NextResponse.json({
    Message: "File Upload Success",
    id: fileStorageId,
  });
}
