
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { AppSidebar } from '@/components/sidebar';
import { ModeToggle } from '@/components/theme';

const page = async () => {
  const session = await auth()

  if(!session) redirect('/signin')

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Link href="/">Back</Link>
          </div>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        {/** data */}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default page