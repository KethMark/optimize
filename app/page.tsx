
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const authUser = await auth()

  return (
    <div className="flex items-center h-screen justify-center">
      <Link href='/upload'>
        <Button>
          {authUser? 'Upload' : 'Login'}
        </Button>
      </Link>
    </div>
  );
}