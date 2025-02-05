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
      toast.loading(`Preparing your document file uploading...`);
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
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 lg:mt-32">
      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6 sm:mb-8">
        File Upload
      </h3>
      <div
        {...getRootProps()}
        className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-8 sm:py-16 dark:border-gray-600"
      >
        <div className="text-center">
          <Input
            {...getInputProps()}
            id="dropzone-file"
            accept="application/pdf"
            type="file"
            className="hidden"
          />
          <File
            className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500"
            aria-hidden={true}
          />
          <div className="mt-4 flex flex-wrap justify-center text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <p>Drag and drop or</p>
            <label
              htmlFor="file-upload-5"
              className="relative cursor-pointer rounded-md pl-1 font-medium hover:underline hover:underline-offset-4 "
            >
              <span>choose file</span>
            </label>
            <p className="pl-1">to upload</p>
          </div>
          <p className="text-center leading-5 text-tremor-content dark:text-dark-tremor-content">
            PDF up to 1MB
          </p>
        </div>
      </div>
      {isSupaUploading && (
        <div className="mt-6">
          <h4 className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
            In Progress
          </h4>
          <div className="mt-2">
            <div className="block py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <File
                    className="h-6 w-6 sm:h-7 sm:w-7 shrink-0 text-gray-500 dark:text-gray-400"
                    aria-hidden={true}
                  />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px]">
                      {uploadFileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {uploadFileSize?.toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => abortController?.abort()}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Cancel"
                >
                  <CircleX
                    className="h-5 w-5 sm:h-6 sm:w-6 shrink-0"
                    aria-hidden={true}
                  />
                </button>
              </div>
              <div className="mt-2 flex items-center space-x-3">
                <Progress
                  value={supabaseProgress}
                  className="flex-grow [&>*]:h-1.5"
                />
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 min-w-[40px] text-right">
                  {Math.round(supabaseProgress)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
