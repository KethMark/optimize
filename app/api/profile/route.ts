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
    .select({fullName: users.fullName, email: users.email})
    .from(users)
    .where(eq(users.id, user.user.id));

  const image = user.user.image

  return NextResponse.json({ profileUser: res, avatarProfile: image })
}