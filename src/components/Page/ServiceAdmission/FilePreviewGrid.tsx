import { CircularProgressWithLabel } from "@/components";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import FileDetail from "@/components/common/FileDetail";
import { Close, FolderOpen, Visibility } from "@mui/icons-material";
import { Dialog } from "@mui/material";
import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";

interface FilePreviewGridProps {
  files: Array<File & { id: number }>;
  removeFile: (id: number) => void;
  progressMap?: Record<number, number>;
  isLoading?: boolean;
}

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
        {files?.map((fileObj: File | any) => {
          const isImage = fileObj?.type?.startsWith("image/");
          const fileProgress = progressMap?.[fileObj.id] ?? 0;

          return (
            <div
              key={fileObj.id}
              className={`relative w-[80px] min-w-[80px] h-[80px] flex items-center justify-center border rounded-md ${
                mode === "dark" ? "border-gray-600" : "border-gray-300"
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
                  } // آزاد کردن حافظه
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
              <Visibility
                fontSize="medium"
                onClick={() =>
                  setModalDetail({
                    show: true,
                    type: "detail",
                    data: fileObj,
                  })
                }
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl p-1 shadow ${
                  mode === "dark" ? "text-gray-300" : "text-primary-light"
                }`}
              />
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
