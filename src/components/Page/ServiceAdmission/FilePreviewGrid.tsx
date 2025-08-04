import {
  CheckBoxOutlineBlank,
  HourglassEmpty,
  PictureAsPdf,
  Description,
  FolderOpen,
  Visibility,
  VideoFile,
  AudioFile,
  TableChart,
  Slideshow,
  Archive,
  CheckBox,
  PersonOff,
  Image,
  Person,
  Close,
} from "@mui/icons-material";
import { Dialog } from "@mui/material";
import { useState } from "react";

import { CircularProgressWithLabel, ConfirmDeleteDialog } from "@/components";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import FileDetail from "@/components/common/FileDetail";
import { useTheme } from "@/context/ThemeContext";

interface FilePreviewGridProps {
  progressMap?: Record<number, number>;
  files: IRepairReceptionFile[];
  removeFile: (id: number) => void;
  isLoading?: boolean;
  toggleShowCustomer?: (fileId: number, currentShowCustomer: boolean) => void;
  readOnly?: boolean;
  selectedFiles?: Set<number>;
  onFileSelectionToggle?: (fileId: number) => void;
  isDeleting?: boolean;
  isUpdatingVisibility?: boolean;
  loadingFileIds?: Set<number>;
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
    fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return <Description fontSize={iconSize} sx={{ color: "#1976d2" }} />;
  } else if (
    fileType === "application/vnd.ms-excel" ||
    fileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    return <TableChart fontSize={iconSize} sx={{ color: "#388e3c" }} />;
  } else if (
    fileType === "application/vnd.ms-powerpoint" ||
    fileType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
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
  toggleShowCustomer,
  readOnly = false,
  selectedFiles,
  onFileSelectionToggle,
  isDeleting = false,
  loadingFileIds,
}) => {
  const { mode } = useTheme();
  const [modalDetail, setModalDetail] = useState<IModalGlobal>({
    show: false,
  });
  if (files?.length || isLoading) {
    return (
      <div
        className={`flex justify-start gap-2 w-full p-2 overflow-x-auto ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading && (
          <div
            className={`relative w-[80px] min-w-[80px] h-[80px] flex items-center justify-center border rounded-md ${
              mode === "dark" ? "border-gray-600" : "border-gray-300"
            }`}
          >
            <div
              className={`w-full h-full relative flex items-center justify-center ${
                mode === "dark" ? "bg-gray-700" : "bg-gray-200"
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
        {files?.map((fileObj: IRepairReceptionFile) => {
          const isImage = fileObj?.mimeType?.startsWith("image/");
          const fileProgress = progressMap?.[fileObj.id] ?? 0;
          const isSelected = selectedFiles?.has(fileObj.id) ?? false;
          const showSelectionUI =
            selectedFiles !== undefined && onFileSelectionToggle !== undefined;
          const isFileLoading = loadingFileIds?.has(fileObj.id) ?? false;

          return (
            <div
              key={fileObj.id}
              className={`relative w-[120px] min-w-[120px] h-[120px] flex items-center justify-center border rounded-md ${
                isSelected
                  ? "border-blue-500 border-2"
                  : mode === "dark"
                  ? "border-gray-600"
                  : "border-gray-300"
              } ${showSelectionUI ? "cursor-pointer" : ""}`}
              onClick={
                showSelectionUI
                  ? () => onFileSelectionToggle(fileObj.id)
                  : undefined
              }
            >
              {isImage || fileObj.downloadUrl ? (
                <img
                  src={fileObj.downloadUrl}
                  alt={fileObj?.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`w-full h-full relative flex items-center justify-center ${
                    mode === "dark" ? "bg-gray-700" : "bg-gray-200"
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
                    className={`absolute bottom-0 font-8 is-word-break text-xs w-16 text-center px-1 ${
                      mode === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {fileObj?.fileName}
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

              {/* File Selection Indicator */}
              {showSelectionUI && (
                <div
                  className="absolute top-1 left-1 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileSelectionToggle(fileObj.id);
                  }}
                >
                  {isSelected ? (
                    <CheckBox          
                      fontSize="medium"
                    />
                  ) : (
                    <CheckBoxOutlineBlank
                      sx={{
                        color:
                          mode === "dark"
                            ? "rgba(255, 255, 255, 0.7)"
                            : "rgba(0, 0, 0, 0.6)",
                      }}
                      fontSize="medium"
                    />
                  )}
                </div>
              )}

              {!readOnly && (
                <AccessGuard accessId={ACCESS_IDS.DOCUMENTS}>
                  <div
                    className="absolute top-1 right-1 bg-secondary-main text-white shadow z-10 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDeleting) {
                        setModalDetail({
                          show: true,
                          type: "delete",
                          data: fileObj,
                        });
                      }
                    }}
                  >
                    {isDeleting ? (
                      <HourglassEmpty
                        fontSize="small"
                        className="animate-spin"
                      />
                    ) : (
                      <Close fontSize="small" />
                    )}
                  </div>
                </AccessGuard>
              )}

              {!readOnly && toggleShowCustomer && (
                <AccessGuard accessId={ACCESS_IDS.DOCUMENTS}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isFileLoading) {
                        toggleShowCustomer(fileObj.id, fileObj.showCustomer);
                      }
                    }}
                    className={`absolute ${
                      showSelectionUI ? "bottom-1 left-1" : "top-1 left-1"
                    } p-1 shadow cursor-pointer text-white transition-colors z-10`}
                    title={
                      fileObj.showCustomer
                        ? "قابل نمایش برای مشتری"
                        : "غیرقابل نمایش برای مشتری"
                    }
                  >
                    {fileObj.showCustomer ? (
                      <Person fontSize="medium" />
                    ) : (
                      <PersonOff fontSize="medium" />
                    )}
                  </div>
                </AccessGuard>
              )}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setModalDetail({
                    show: true,
                    type: "detail",
                    data: fileObj,
                  });
                }}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow ${
                  mode === "dark" ? "text-gray-300" : "text-primary-light"
                } z-10`}
              >
                {isImage ? (
                  <Visibility fontSize="medium" />
                ) : (
                  getFileIcon(fileObj.mimeType, mode)
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
