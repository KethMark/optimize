'use client'

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { Loader, MoreHorizontal, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavMain({
  listDocument,
  isLoading,
  mutateAsync,
  chatId,
}: {
  listDocument: documentsList[] | undefined;
  isLoading: boolean;
  mutateAsync: UseMutateAsyncFunction<
    DeletePDF,
    Error,
    Pick<DeletePDF, "id" | "fileName">,
    unknown
  >;
  chatId: string | undefined;
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {isLoading ? (
          <div className="flex items-center justify-center mt-72 transition-opacity ">
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div>
            {listDocument &&
              listDocument.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={chatId === item.id}
                    key={item.id}
                    onClick={() => router.push(`/chat/${item.id}`)}
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <span className="truncate">{item.fileName}</span>{" "}
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction>
                        <MoreHorizontal className="ml-auto" />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                      className="min-w-28 rounded-lg"
                    >
                      <DropdownMenuItem
                        className="gap-2"
                        key={item.id}
                        onClick={() => {
                          mutateAsync({
                            id: item.id,
                            fileName: item.fileName,
                          });
                        }}
                      >
                        <TrashIcon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
          </div>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
