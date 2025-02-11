"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Loader2, Trash2 } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";

export const Documents = ({
  search,
  offset,
}: {
  search: string;
  offset: string;
}) => {
  const queryClient = useQueryClient();

  const { data: Search } =
    useQuery<FileStorageSearch>({
      queryKey: ["Search", search, offset ?? 0],
      queryFn: async () => {
        const response = await axios.get<FileStorageSearch>(
          `/api/search?search=${search}&offset=${offset}`
        );
        return response.data;
      },
      enabled: !!search,
    });

  const { data: RecentDocument, isLoading } = useQuery({
    queryKey: ["Recent"],
    queryFn: async (): Promise<documentsList[]> => {
      const response = await axios.get("/api/recent");
      return response.data;
    },
    enabled: !search,
  });

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-CA");
  };

  const { mutateAsync, isPending } = useMutation({
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
    onSuccess: (data) => {
      RecentDocument?.filter((docs: documentsList) => docs.id !== data.id);
      queryClient.invalidateQueries({ queryKey: ["DocumentList"] });
      queryClient.invalidateQueries({ queryKey: ["Recent"] });
    },
  });

  const documentsToShow = search ? Search?.fileStorage : RecentDocument;

  return (
    <div className="mt-10 space-y-4">
      {isLoading ? (
        <div className="flex items-center justify-center mt-72 transition-opacity ">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <>
          {documentsToShow &&
            documentsToShow.map((data) => (
              <div
                className="flex flex-col gap-2 border rounded-md group hover:bg-gray-50"
                key={data.id}
              >
                <div className="relative p-4 space-y-2">
                  <Button
                    onClick={() =>
                      mutateAsync({ id: data.id, fileName: data.fileName })
                    }
                    className="absolute end-2 opacity-0 group-hover:opacity-100 bg-gray-50 transition-opacity"
                    size="icon"
                    variant="ghost"
                  >
                    {isPending ? (
                      <Loader2 className="h-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5" />
                    )}
                  </Button>
                  <p className="text-lg truncate">{data.fileName}</p>
                  <p className="text-sm">{formatDate(data.createdAt)}</p>
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
};
