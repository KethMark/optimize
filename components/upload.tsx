"use client";

import React, { useCallback, useState } from "react";
import { Input } from "./ui/input";
import { useDropzone } from "react-dropzone";
import { CircleX, File } from "lucide-react";
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
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [uploadFileSize, setUploadFileSize] = useState<number | null>(null);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);

  const uploadFileToSupabase = async (file: File) => {
    setSupaIsUploading(true);
    supabaseUploadProgress(0);
    const fileName = file.name;
    const blob = new Blob([file], { type: "application/json" });
    const formData = new FormData();
    formData.append("cacheControl", "3600");
    formData.append("file", blob);

    const controller = new AbortController();
    setAbortController(controller);
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
          signal: controller.signal,
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
      toast.loading(`Preparing your document files....`);
    },
    onSuccess: (data) => {
      router.push(`/chat/${data.id}`);
      queryClient.invalidateQueries({ queryKey: ["DocumentList"] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorMessage = error.response.data.message;
        toast.error(errorMessage);
      } else {
        toast.error("Something Wrong..");
      }
    },
    onSettled: () => {
      toast.dismiss();
    },
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error("Uploaded file exceeds maximum size of 1 MB");
        continue;
      }
      setUploadFileName(file.name);
      setUploadFileSize(file.size / 1024 / 1024);
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

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="sm:mx-auto sm:max-w-lg w-full mt-32">
      <h3 className="text-tremor-title font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong">
        File Upload
      </h3>
      <div
        {...getRootProps()}
        className="mt-4 flex justify-center rounded-tremor-default border border-dashed border-gray-300 px-6 py-16 dark:border-dark-tremor-border"
      >
        <div>
          <Input
            {...getInputProps()}
            id="dropzone-file"
            accept="application/pdf"
            type="file"
            className="hidden"
          />
          <File
            className="mx-auto h-12 w-12 text-tremor-content-subtle dark:text-dark-tremor-content"
            aria-hidden={true}
          />
          <div className="mt-4 flex text-tremor-default leading-6 text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
            <p>Drag and drop or</p>
            <label
              htmlFor="file-upload-5"
              className="relative cursor-pointer rounded-tremor-small pl-1 font-medium text-tremor-brand hover:underline hover:underline-offset-4 dark:text-dark-tremor-brand"
            >
              <span>choose file</span>
            </label>
            <p className="pl-1">to upload</p>
          </div>
          <p className="text-center text-tremor-label leading-5 text-tremor-content dark:text-dark-tremor-content">
            PDF up to 1MB
          </p>
        </div>
      </div>
      {isSupaUploading && (
        <>
          <h4 className="mt-6 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            In Progress
          </h4>
          <div className="mt-2">
            <div className="block py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <File
                    className="h-7 w-7 shrink-0 text-tremor-content dark:text-dark-tremor-content"
                    aria-hidden={true}
                  />
                  <div>
                    <p className="text-tremor-label font-medium text-tremor-content-strong dark:text-dark-tremor-content-strong truncate max-w-md">
                      {uploadFileName}
                    </p>
                    <p className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                      {uploadFileSize?.toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => abortController?.abort()}
                  className="text-tremor-content-subtle hover:text-tremor-content dark:text-dark-tremor-content-subtle hover:dark:text-dark-tremor-content"
                  aria-label="Cancel"
                >
                  <CircleX className="size-5 shrink-0" aria-hidden={true} />
                </button>
              </div>
              <div className="mt-2 flex items-center space-x-3">
                <Progress value={supabaseProgress} className="[&>*]:h-1.5" />
                <span className="text-tremor-label text-tremor-content dark:text-dark-tremor-content">
                  {Math.round(supabaseProgress)}%
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
