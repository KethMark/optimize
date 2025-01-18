import { auth } from "@/auth";
import { SignupForm } from "@/components/signup-form";
import { redirect } from "next/navigation";

export default async function SignupPage() {
  const session = await auth()

  if(session) redirect('/')

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <SignupForm />
      </div>
    </div>
  )
}