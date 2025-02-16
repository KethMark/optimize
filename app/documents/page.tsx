import { auth } from "@/auth";
import { Documents } from "@/components/documents";
import { SearchBar } from "@/components/search";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const page = async (props: {
  searchParams: Promise<{ q: string; offset: string }>;
}) => {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? "";
  const offset = searchParams.offset ?? 0;

  const session = await auth();
  if (!session) redirect("/signin");

  return (
    <div className="max-w-2xl p-5 mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon.Optimize />
          <p className="text-lg">Optimize</p>
        </div>
        <Button>
          <Link href="/upload">Start New Chat</Link>
        </Button>
      </div>
      <SearchBar />
      <Documents search={search} offset={offset ?? 0} />
    </div>
  );
};

export default page;
