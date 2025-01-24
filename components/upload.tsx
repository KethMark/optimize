"use client";

import React, { useCallback, useState } from "react";
import { Input } from "./ui/input";
import { useDropzone } from "react-dropzone"
import { Loader, Upload } from "lucide-react";
import { Progress } from "./ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export const Uploads = () => {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [supabaseProgress, supabaseUploadProgress] = useState<number>(0);
  const [isSupaUploading, setSupaIsUploading] = useState(false);

  const uploadFileToSupabase = async (file: File) => {
    setSupaIsUploading(true);
    supabaseUploadProgress(0);
    const fileName = file.name;
    const blob = new Blob([file], { type: "application/json" });
    const formData = new FormData();
    formData.append("cacheControl", "3600");
    formData.append("file", blob);

    return axios
      .post(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/project/${fileName}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            // @ts-ignore
            ...supabase.auth.headers,
          },

          onUploadProgress: (evt) => {
            const _progress = (evt.loaded / (evt.total || Infinity)) * 100;
            console.log(_progress);
            supabaseUploadProgress(_progress);
          },
        }
      )
      .then((res) => res.data.Key)
      .catch(function (error) {
        {
          error.response && toast.error(error.response.data.message);
        }
      })
      .finally(() => setSupaIsUploading(false));
  };

  const { mutateAsync } = useMutation({
    mutationFn: async (
      data: Pick<UploadPDFParams, "fileUrl" | "fileName">
    ): Promise<UploadPDFParams> => {
      const res = await axios.post(`/api/embed`, data);
      return res.data;
    },
    onMutate: () => {
      toast.loading(`Preparing your document file...`, {
        position: "bottom-right",
      });
    },
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
      queryClient.invalidateQueries({ queryKey: ["DocumentList"] });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
    onSettled: () => {
      toast.dismiss();
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const filePath = await uploadFileToSupabase(file);
      if (!filePath) return;

      const { data } = supabase.storage
        .from("project")
        .getPublicUrl(filePath.replace("project/", ""));

      await mutateAsync({
        fileUrl: data.publicUrl,
        fileName: file.name,
      });
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="flex-grow p-4">
      <div className="max-w-2xl mx-auto mt-32">
        <h1 className="text-2xl font-bold mb-2">Upload Your files</h1>
        <p className="text-muted-foreground mb-4">
          Start to uploaded your pdf files.
        </p>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${
            isDragActive ? "border-primary" : "border-muted-foreground"
          }`}
        >
          <Input
            {...getInputProps()}
            id="dropzone-file"
            accept="application/pdf"
            type="file"
            className="hidden"
          />
          <div className="translate-x-1">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg mb-2">Drag files</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Click to upload files (files should be under 20 MB )
          </p>
        </div>
        <p className="text-center text-muted-foreground text-sm">
          Note: Unfortunately, we're unable to process images embedded within
          PDF files at this time.
        </p>
      </div>
      {isSupaUploading && (
        <div className="fixed bottom-10 right-10">
          <div className="w-full max-w-80 border rounded-lg p-4 ">
            <div className="flex items-center gap-3 mb-3">
              <Loader className="h-4 w-4 animate-spin" />
              <p className="text-sm 0">
                Processing your document for search...{" "}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Progress
                value={supabaseProgress}
                className="w-full max-w-60 ml-7"
              />
              <span className="ml-2 text-xs">
                {Math.round(supabaseProgress)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
