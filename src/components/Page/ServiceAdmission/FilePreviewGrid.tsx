import { Close, FolderOpen } from "@mui/icons-material";
import { CircularProgressWithLabel } from "@/components";

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
  if (files?.length || isLoading) {
    return (
      <div
        className="flex  justify-start gap-2 w-full  p-2 bg-white  overflow-x-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading && (
          <div className="relative  w-[80px] min-w-[80px]  h-[80px] flex items-center justify-center border rounded-md ">
            <div className="w-full h-full relative flex items-center justify-center bg-gray-200">
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
              className="relative  w-[80px] min-w-[80px]  h-[80px] flex items-center justify-center border rounded-md "
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
                <div className="w-full h-full relative flex items-center justify-center bg-gray-200">
                  <FolderOpen fontSize="small" />
                  <pre className="absolute bottom-0 font-8 is-word-break text-gray-600 text-xs w-16 text-center px-1">
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
                onClick={() => removeFile(fileObj?.id)}
                className="absolute top-0 right-0 bg-secondary-main text-white p-1  shadow"
              />
            </div>
          );
        })}
      </div>
    );
  } else {
    return <></>;
  }
};

export default FilePreviewGrid;
