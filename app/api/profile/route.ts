import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await auth()

  if (
    !user ||
    !user.user || 
    !user.user.id
  ) {
    return NextResponse.json({ error: "You must logged in first"}, { status: 401 })
  }

  const [res] = await db
    .select({name: users.name, email: users.email, image: users.image})
    .from(users)
    .where(eq(users.id, user.user.id));

  return NextResponse.json(res)
}