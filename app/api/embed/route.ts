import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { auth } from "@/auth";
import { db } from "@/db/index";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { documents, fileStorage, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { pipeline } from '@xenova/transformers';


export async function POST(req: Request) {
  const { fileUrl, fileName } = await req.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ message: "You don't have session " });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user || !user[0].id) {
    return NextResponse.json({ message: "User not found" });
  }

  const data = await db
    .insert(fileStorage)
    .values({ fileUrl, fileName, users: user[0].id })
    .returning();

  const fileStorageId = data[0].id;
 
  const response = await fetch(fileUrl);
  const buffer = await response.blob();
  const loader = new PDFLoader(buffer);
  const docs = await loader.load();

  const text_splitters = new RecursiveCharacterTextSplitter({
    chunkSize: 350,
  });

  const splitDocuments = await text_splitters.splitDocuments(docs);

  const chunks = splitDocuments.map((chunk) => chunk.pageContent);

  const pipe = await pipeline(
    'feature-extraction',
    'Supabase/gte-small',
  );

  const output = await pipe(JSON.stringify(chunks), {
    pooling: 'mean',
    normalize: true,
  });

  const embedding = Array.from(output.data);

  const document = chunks.map((e) => ({
    content: e,
    embedding
  }))

  await db.insert(documents).values(
    document.map((embedding) => ({
      file_storage: fileStorageId,
      ...embedding
    }))
  )
  console.log('Congrats working..')
  return NextResponse.json({
    Message: "File Upload Success",
    id: fileStorageId,
  });
}
