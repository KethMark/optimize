import { auth } from "@/auth";
import { ChatInterface } from "@/components/chat";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { db } from "@/db/index";
import { fileStorage ,users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  const { id } = await params;

  if (!session || !session.user || !session.user.id) redirect("/signin");

  const [profile] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, session.user.id));

  const document = await db
    .select()
    .from(fileStorage)
    .where(and(eq(fileStorage.id, id), eq(fileStorage.users, profile.id)));

  const documents = document[0]

  return (
    <SidebarProvider>
      <AppSidebar chatId={id} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Link href="/upload">Back</Link>
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="font-bold truncate max-w-[20ch] sm:max-w-[40ch] md:max-w-96">
              {documents.fileName}
            </span>
          </div>
          <div className="ml-auto">
          </div>
        </header>
        <div className="flex flex-col gap-4 p-4 pt-0 ">
          <ChatInterface document={documents} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default page;
