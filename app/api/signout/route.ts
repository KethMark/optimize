import { signOut } from "@/auth";
import { NextResponse } from "next/server";

export async function DELETE() {
  await signOut()

  return NextResponse.json({ success: true, message: "Logout Successfully"})
}