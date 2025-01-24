import { auth } from "@/auth";
import { db } from "@/db/index";
import { fileStorage, users } from "@/db/schema";
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const data = await auth()

  if (
    !data ||
    !data.user ||
    !data.user.id
  ) {
    return NextResponse.json({ error: 'User not authenticated'}, { status: 500})
  }

  const profile = await db
    .select()
    .from(users)
    .where(eq(users.id, data.user.id))

  const documents = await db
    .select()
    .from(fileStorage)
    .where(eq(fileStorage.users, profile[0].id))
    .orderBy(desc(fileStorage.createdAt))

  return NextResponse.json(documents)
}