"use client";
import React, { useTransition } from "react";
import { Input } from "./ui/input";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";

export const SearchBar = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function searchAction(formData: FormData) {
    let value = formData.get("q") as string;
    let params = new URLSearchParams({ q: value });
    startTransition(() => {
      router.replace(`/documents?${params.toString()}`);
    });
  }

  return (
    <form action={searchAction} className="grid grid-cols-1 space-y-2 mt-10">
      <Input
        placeholder="Search your Filename"
        className="relative h-12 pl-10"
        name="q"
        type="search"
      />
      {isPending ? (
        <Loader2 className="absolute ml-2 top-[105] animate-spin" />
      ) : (
        <Search className="absolute ml-2 top-[105]" />
      )}
    </form>
  );
};
