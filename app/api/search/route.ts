import { db } from "@/db";
import { fileStorage, users } from "@/db/schema";
import { z } from "zod";
import { and, count, eq, ilike } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const QuerySchema = z.object({
  search: z.string().optional(),
  offset: z.string().transform(Number).optional(),
});

export async function GET(req: Request) {
  try {
    const data = await auth()

    if(
      !data || 
      !data.user ||
      !data.user.id
    ) {
      return NextResponse.json({ error: 'User not authenticated'}, { status: 500})
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, data.user.id))

    const { searchParams } = new URL(req.url);
    const query = QuerySchema.parse({
      search: searchParams.get("search"),
      offset: searchParams.get("offset") ?? '0',
    });

    if (query.search) {
      const searchResults = await db
        .select()
        .from(fileStorage)
        .where(and(ilike(fileStorage.fileName, `%${query.search}%`), eq(fileStorage.users, user[0].id)))
        .limit(1000);

      return NextResponse.json({
        fileStorage: searchResults,
        newOffset: null,
        totalFileStorage: 0,
      });
    }

    if (query.offset === null || query.offset === undefined) {
      return NextResponse.json({
        fileStorage: [],
        newOffset: null,
        totalFileStorage: 0,
      });
    }

    const [totalCount] = await db
      .select({ count: count() })
      .from(fileStorage)
      .where(eq(fileStorage.users, user[0].id))

    const paginatedFileStorage = await db
      .select()
      .from(fileStorage)
      .where(eq(fileStorage.users, user[0].id))
      .limit(5)
      .offset(query.offset);
      
    const newOffset =
      paginatedFileStorage.length >= 5 ? query.offset + 5 : null;

    return NextResponse.json({
      fileStorage: paginatedFileStorage,
      newOffset,
      totalFileStorage: totalCount.count,
    });

  } catch (error) {
    console.error("FileStorage API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch fileStorage" },
      { status: 500 }
    );
  }
}
