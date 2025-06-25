import { calculateDaysPassed } from "@/utils";
import {
  AccessTime,
  ArrowBack,
  Delete,
  Download,
  FileCopy,
  Image,
  MusicNote,
  Share,
  Storage,
  VideoLibrary,
} from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { FC, useRef, useState } from "react";
import { toast } from "react-toastify";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";

type FileDetailProps = {
  file: {
    id?: number;
    fileId?: number;
    repairReceptionId?: number;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    downloadUrl?: string;
    uploadDate?: string;
    uploadedByUserName?: string;
  };
  removeFile: (id?: number) => void;
  onClose: VoidFunction;
};

const FileDetail: FC<FileDetailProps> = ({ file, removeFile, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showModal, setShowModal] = useState<IModalGlobal>({
    show: false,
    type: "",
    data: undefined,
  });
  const handleShare = async () => {
    try {
      // Check if running on a mobile device
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (navigator.share && isMobile) {
        // Try to share using Web Share API on mobile devices
        await navigator.share({
          title: file?.fileName || "فایل",
          text: `فایل ${file?.fileName}`,
          url: file?.downloadUrl || "",
        });
      } else {
        // For desktop or when Web Share API is not available
        // Create a temporary input element to copy the path
        const tempInput = document.createElement("input");
        tempInput.value = file?.downloadUrl || "";
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);

        // Show a notification that the path was copied
        toast.success("مسیر فایل در کلیپ‌بورد کپی شد");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback to clipboard copy if sharing fails
      try {
        navigator.clipboard.writeText(file?.downloadUrl || "");
        alert("مسیر فایل در کلیپ‌بورد کپی شد");
      } catch (clipboardError) {
        console.error("Error copying to clipboard:", clipboardError);
        alert("خطا در اشتراک‌گذاری فایل");
      }
    }
  };

  const handleDownload = () => {
    try {
      if (!file?.downloadUrl) {
        toast.error("مسیر فایل در دسترس نیست");
        return;
      }

      // Create a temporary anchor element
      const downloadLink = document.createElement("a");
      downloadLink.href = file?.downloadUrl;
      downloadLink.download = file.fileName || "download";
      // Append to body, click, and remove
      document.body.appendChild(downloadLink);
      downloadLink.click();

      toast.success("دانلود فایل شروع شد");
    } catch (error) {
      console.error("Error downloading:", error);
      toast.error("خطا در دانلود فایل");
    }
  };

  const renderMediaPlayer = () => {
    if (file?.mimeType?.includes("video")) {
      return (
        <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
          {file?.downloadUrl ? (
            <video
              ref={videoRef}
              src={file.downloadUrl}
              controls
              className="w-full h-full object-contain"
              poster={file.downloadUrl}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <VideoLibrary sx={{ width: "64px", height: "64px" }} />
            </div>
          )}
        </div>
      );
    } else if (file?.mimeType?.includes("audio")) {
      return (
        <div className="w-full bg-gray-50 rounded-lg p-4 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <MusicNote sx={{ width: "48px", height: "48px" }} />
          </div>
          <audio
            ref={audioRef}
            src={file.downloadUrl}
            controls
            className="w-full"
          />
        </div>
      );
    } else if (file?.mimeType?.includes("image")) {
      return (
        <div className="w-8/12 mx-auto  bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
          {file?.downloadUrl ? (
            <img
              src={file.downloadUrl}
              alt={file.fileName}
              className="w-auto h-auto max-w-full  object-contain"
            />
          ) : (
            <img style={{ width: "64px", height: "64px" }} />
          )}
        </div>
      );
    } else {
      return (
        <div className="w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
          <FileCopy sx={{ width: "64px", height: "64px" }} />
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <IconButton size="small" className="text-gray-600" onClick={onClose}>
            <ArrowBack />
          </IconButton>
          <Typography variant="subtitle1" className="font-medium">
            جزئیات فایل
          </Typography>
        </div>
        <div className="flex gap-1">
          <IconButton
            size="small"
            className="text-gray-600"
            onClick={handleDownload}
          >
            <Download />
          </IconButton>
          <IconButton
            size="small"
            className="text-gray-600"
            onClick={handleShare}
          >
            <Share />
          </IconButton>
          <IconButton
            size="small"
            className="text-red-500"
            onClick={() =>
              setShowModal({ show: true, type: "delete", data: file })
            }
          >
            <Delete />
          </IconButton>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="flex flex-col gap-4">
          {/* File Preview */}
          <div className="w-full">{renderMediaPlayer()}</div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-12 mb-4">{file?.fileName}</div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Storage className="text-gray-500" fontSize="small" />
                <span className="text-gray-600 font-english font-12 dir-ltr">
                  {file?.fileSize}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <AccessTime className="text-gray-500" fontSize="small" />
                <span className="text-gray-600">
                  {calculateDaysPassed(file?.uploadDate ?? "")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {file?.mimeType?.includes("video") && (
                  <VideoLibrary
                    sx={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                )}
                {file?.mimeType?.includes("image") && (
                  <Image
                    sx={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                )}
                {file?.mimeType?.includes("audio") && (
                  <MusicNote
                    sx={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                )}
                {file?.mimeType?.includes("file") && (
                  <FileCopy
                    sx={{
                      width: "20px",
                      height: "20px",
                    }}
                  />
                )}
                <span className="text-gray-600">
                  {file?.mimeType?.includes("video") && "ویدیو"}
                  {file?.mimeType?.includes("image") && "تصویر"}
                  {file?.mimeType?.includes("audio") && "صوت"}
                  {file?.mimeType?.includes("file") && "سند"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showModal?.type === "delete" && showModal?.show && (
        <ConfirmDeleteDialog
          onClose={() => setShowModal({ show: false })}
          onConfirm={() => {
            removeFile(file?.id);
            onClose();
          }}
          open={showModal?.show}
          title={`حذف فایل `}
          content={`آیا از حذف فایل ${showModal?.data?.fileName} مطمئن هستید؟`}
        />
      )}
    </div>
  );
};

export default FileDetail;
