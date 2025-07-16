import { 
  Close, 
  FolderOpen, 
  Visibility, 
  VideoFile, 
  AudioFile, 
  PictureAsPdf, 
  Description, 
  TableChart, 
  Slideshow, 
  Archive, 
  InsertDriveFile, 
  Image
} from "@mui/icons-material";
import { Dialog } from "@mui/material";
import { useState } from "react";

import { CircularProgressWithLabel, ConfirmDeleteDialog } from "@/components";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import FileDetail from "@/components/common/FileDetail";
import { useTheme } from "@/context/ThemeContext";

interface FilePreviewGridProps {
  progressMap?: Record<number, number>;
  files: Array<File & { id: number }>;
  removeFile: (id: number) => void;
  isLoading?: boolean;
}

// تابع برای تشخیص نوع فایل و برگرداندن ایکون مناسب
const getFileIcon = (fileType: string, mode: string) => {
  const iconColor = mode === "dark" ? "rgba(255, 255, 255, 0.8)" : "#1976d2";
  const iconSize = "large";

  if (fileType.startsWith("video/")) {
    return <VideoFile fontSize={iconSize} sx={{ color: "#ff5722" }} />;
  } else if (fileType.startsWith("audio/")) {
    return <AudioFile fontSize={iconSize} sx={{ color: "#9c27b0" }} />;
  } else if (fileType === "application/pdf") {
    return <PictureAsPdf fontSize={iconSize} sx={{ color: "#d32f2f" }} />;
  } else if (
    fileType === "application/msword" ||
    fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <Description fontSize={iconSize} sx={{ color: "#1976d2" }} />;
  } else if (
    fileType === "application/vnd.ms-excel" ||
    fileType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return <TableChart fontSize={iconSize} sx={{ color: "#388e3c" }} />;
  } else if (
    fileType === "application/vnd.ms-powerpoint" ||
    fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    return <Slideshow fontSize={iconSize} sx={{ color: "#f57c00" }} />;
  } else if (
    fileType === "application/zip" ||
    fileType === "application/x-zip-compressed" ||
    fileType === "application/x-rar-compressed"
  ) {
    return <Archive fontSize={iconSize} sx={{ color: "#795548" }} />;
  } else {
    return <Image fontSize={iconSize} sx={{ color: iconColor }} />;
  }
};

const FilePreviewGrid: React.FC<FilePreviewGridProps> = ({
  files,
  removeFile,
  progressMap,
  isLoading,
}) => {
  const { mode } = useTheme();
  const [modalDetail, setModalDetail] = useState<IModalGlobal>({
    show: false,
  });
  if (files?.length || isLoading) {
    return (
      <div
        className={`flex justify-start gap-2 w-full p-2 overflow-x-auto ${mode === "dark" ? "bg-gray-800" : "bg-white"
          }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading && (
          <div
            className={`relative w-[80px] min-w-[80px] h-[80px] flex items-center justify-center border rounded-md ${mode === "dark" ? "border-gray-600" : "border-gray-300"
              }`}
          >
            <div
              className={`w-full h-full relative flex items-center justify-center ${mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                }`}
            >
              {progressMap && Object.keys(progressMap).length > 0 && (
                <CircularProgressWithLabel
                  value={Object.values(progressMap)[0]}
                />
              )}
            </div>
          </div>
        )}
        {files?.map((fileObj: File | any) => {
          const isImage = fileObj?.type?.startsWith("image/");
          const fileProgress = progressMap?.[fileObj.id] ?? 0;

          return (
            <div
              key={fileObj.id}
              className={`relative w-[80px] min-w-[80px] h-[80px] flex items-center justify-center border rounded-md ${mode === "dark" ? "border-gray-600" : "border-gray-300"
                }`}
            >
              {isImage || fileObj.downloadUrl ? (
                <img
                  src={
                    fileObj instanceof File
                      ? URL?.createObjectURL(fileObj)
                      : fileObj.downloadUrl
                  }
                  alt={fileObj?.name}
                  className="w-full h-full object-cover"
                  onLoad={(e) =>
                    URL?.revokeObjectURL((e.target as HTMLImageElement).src)
                  }
                />
              ) : (
                <div
                  className={`w-full h-full relative flex items-center justify-center ${mode === "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                >
                  <FolderOpen
                    fontSize="small"
                    sx={{
                      color:
                        mode === "dark"
                          ? "rgba(255, 255, 255, 0.8)"
                          : undefined,
                    }}
                  />
                  <pre
                    className={`absolute bottom-0 font-8 is-word-break text-xs w-16 text-center px-1 ${mode === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                  >
                    {fileObj?.name}
                  </pre>
                </div>
              )}

              {fileProgress > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-black bg-opacity-50" />
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-12 h-12 mb-2">
                      <CircularProgressWithLabel
                        value={fileProgress}
                        className="transition-all duration-300 ease-in-out"
                      />
                    </div>
                    <span className="text-white text-sm font-medium transition-all duration-300">
                      {fileProgress}%
                    </span>
                  </div>
                </div>
              )}

              <AccessGuard accessId={ACCESS_IDS.DOCUMENTS}>
                <Close
                  fontSize="small"
                  onClick={() =>
                    setModalDetail({
                      show: true,
                      type: "delete",
                      data: fileObj,
                    })
                  }
                  className="absolute top-0 right-0 bg-secondary-main text-white p-1 shadow"
                />
              </AccessGuard>
              <div
                onClick={() =>
                  setModalDetail({
                    show: true,
                    type: "detail",
                    data: fileObj,
                  })
                }
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow ${mode === "dark" ? "text-gray-300" : "text-primary-light"
                  }`}
              >
                {isImage ? (
                  <Visibility fontSize="medium" />
                ) : (
                  getFileIcon(fileObj.type || fileObj.mimeType, mode)
                )}
              </div>
            </div>
          );
        })}
        <Dialog
          open={modalDetail?.show && modalDetail?.type === "detail"}
          onClose={() =>
            setModalDetail({
              show: false,
            })
          }
        >
          <FileDetail
            file={modalDetail?.data}
            onClose={() =>
              setModalDetail({
                show: false,
              })
            }
            removeFile={() => removeFile(modalDetail?.data?.id)}
          />
        </Dialog>
        {modalDetail?.type === "delete" && modalDetail?.show && (
          <ConfirmDeleteDialog
            onClose={() => setModalDetail({ show: false })}
            onConfirm={() => {
              removeFile(modalDetail?.data?.id);
              setModalDetail({ show: false });
            }}
            open={modalDetail?.show}
            title={`حذف فایل `}
            content={`آیا از حذف فایل ${modalDetail?.data?.fileName} مطمئن هستید؟`}
          />
        )}
      </div>
    );
  } else {
    return <></>;
  }
};

export default FilePreviewGrid;
