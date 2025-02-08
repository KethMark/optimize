"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { NavMain } from "./nav-main";
import { Icon } from "./ui/icon";
import Link from "next/link";

const data = {
  navSecondary: [
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
};

export function AppSidebar({
  chatId,
  ...props
}: React.ComponentProps<typeof Sidebar> & ChatId) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: ListDocument, isLoading } = useQuery({
    queryKey: ["DocumentList"],
    queryFn: async (): Promise<documentsList[]> => {
      const response = await axios.get("/api/document");
      return response.data;
    },
  });

  const { mutateAsync } = useMutation({
    mutationFn: async (
      data: Pick<DeletePDF, "fileName" | "id">
    ): Promise<DeletePDF> => {
      const response = await axios.delete("/api/delete", {
        data: {
          id: data.id,
          fileName: data.fileName,
        },
      });
      return response.data;
    },
    onMutate: (data) => {
      toast.loading(`Deleting ${data.fileName}..`);
    },
    onSuccess: (data) => {
      ListDocument?.filter((docs: documentsList) => docs.id !== data.id);
      queryClient.invalidateQueries({ queryKey: ["DocumentList"] });
      toast.success(data.text);
      toast.dismiss();
      router.push("/upload");
    },
  });

  const { data: Profile } = useQuery({
    queryKey: ["Profile"],
    queryFn: async (): Promise<profileUser> => {
      const response = await axios.get("/api/profile");
      return response.data;
    },
  });

  const { mutate } = useMutation({
    mutationFn: async () => {
      await axios.delete("/api/signout").then((res) => res.data);
    },
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg ">
              <Icon.Optimize />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Comp Scie</span>
              <span className="truncate text-xs">Optimization</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          listDocument={ListDocument}
          isLoading={isLoading}
          mutateAsync={mutateAsync}
          chatId={chatId}
        />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser profile={Profile} mutate={mutate} />
      </SidebarFooter>
    </Sidebar>
  );
}
