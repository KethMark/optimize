import { db } from "@/db/index";
import { users } from "@/db/schema";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fullName, email, password } = await req.json();

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: "User Email Already exist" },
        { status: 500 }
      );
    }

    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      fullName,
      email,
      password: hashedPassword,
    });

    return NextResponse.json({ message: "Signup Successfully" });
  } catch (error) {
    console.log(error, "Signup error");
    return NextResponse.json(
      { success: false, message: "Signup error" },
      { status: 500 }
    );
  }
}
