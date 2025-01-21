import { signIn } from "@/auth"
import { NextResponse } from "next/server"
import { CustomError } from "@/auth"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    await signIn('credentials', {
      email,
      password,
      redirect: false
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Signin successfully'
    })

  } catch (error: any) {
    if (error instanceof CustomError) {
      return NextResponse.json({ 
        success: false, 
        message: error.message 
      }, {status: 500})
    }
  }
}