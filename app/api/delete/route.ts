import { db } from "@/db/index"
import { conversations, documents, fileStorage } from "@/db/schema"
import { createClient } from "@/lib/supabase/server"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function DELETE(req: Request) {
  const { id, fileName } = await req.json()

  const supabase = await createClient()

  const { error } = await supabase
    .storage
    .from('project')
    .remove([fileName])

  if(error) {
    return NextResponse.json({ error: 'Pdf not found'})
  }
  
  await db
    .delete(conversations)
    .where(eq(conversations.file_storage, id))

  await db
    .delete(documents)
    .where(eq(documents.file_storage, id))

  await db
    .delete(fileStorage)
    .where(eq(fileStorage.id, id))

  return NextResponse.json({text: 'Document deleted successfully', id})
}