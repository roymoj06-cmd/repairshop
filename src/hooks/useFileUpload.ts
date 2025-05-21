import { useState } from "react";

import { uploadFile } from "@/service/fileInfos/fileInfos.service";

interface UseFileUploadOptions {
  fileSource?: number;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
}

export const useFileUpload = (options?: UseFileUploadOptions) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const upload = async (file: File): Promise<any> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Simulate progress (since the actual API might not provide progress)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.random() * 20;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 300);

      const response = await uploadFile({
        FormFile: file,
        FileSource: options?.fileSource,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (options?.onSuccess) {
        options.onSuccess(response);
      }

      return response;
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");

      if (options?.onError) {
        options.onError(error);
      }

      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultiple = async (files: File[]): Promise<any[]> => {
    try {
      const results = [];

      for (const file of files) {
        const result = await upload(file);
        results.push(result);
      }

      return results;
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Multiple upload failed"
      );
      throw error;
    }
  };

  return {
    upload,
    uploadMultiple,
    isUploading,
    uploadProgress,
    uploadError,
    resetUploadState: () => {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadError(null);
    },
  };
};

export default useFileUpload;
