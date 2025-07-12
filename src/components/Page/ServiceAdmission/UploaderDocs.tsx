import { FC, useCallback, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import {
  VideoLibrary,
  FolderOpen,
  Audiotrack,
  CameraAlt,
  Videocam,
  Image,
  Mic,
} from "@mui/icons-material";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
} from "@mui/material";

import {
  deleteFileRepairReceptionFile,
  uploadFileRepairReceptionFile,
  getFilesByReceptionId,
} from "@/service/repairReceptionFile/repairReceptionFile.service";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import { useTheme } from "@/context/ThemeContext";
import FilePreviewGrid from "./FilePreviewGrid";
import { Loading } from "@/components";

type UploadModalProps = {
  repairReceptionId?: number | string;
};

const UploaderDocs: FC<UploadModalProps> = ({ repairReceptionId }) => {
  const { mode } = useTheme();
  const [files, setFiles] = useState<Array<File & { id: number }>>([]);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});

  const handleFileUpload = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        const response = await mutateAsyncUploadFileToServerFile({
          file: file,
          repairReceptionId: repairReceptionId,
          onProgress: (progress) => {
            // Create a temporary ID for tracking progress before the file has a server ID
            const tempId = file.name + "_" + file.size + "_" + Date.now();
            setProgressMap((prev) => ({ ...prev, [tempId]: progress }));
          },
        });
        const newFile = Object.assign(file, { id: response });
        setFiles((prev) => [...prev, newFile]);
        mutateAsyncGetFilesByReceptionId();
      } catch (error) {
        console.error("Error uploading file", error);
      }
    }
  }, []);
  const {
    isPending: isLoadingFiles,
    mutateAsync: mutateAsyncGetFilesByReceptionId,
  } = useMutation({
    mutationFn: () => getFilesByReceptionId(repairReceptionId ?? ""),
    onSuccess: (data) => {
      setFiles(data?.data);
    },
  });
  const { isPending: isLoadingDeleteFile, mutateAsync: mutateAsyncDeleteFile } =
    useMutation({
      mutationFn: deleteFileRepairReceptionFile,
      onSuccess: () => {
        mutateAsyncGetFilesByReceptionId();
      },
    });
  useEffect(() => {
    if (repairReceptionId) {
      mutateAsyncGetFilesByReceptionId();
    }
  }, [repairReceptionId]);
  const onDropImage = useCallback(handleFileUpload, []);
  const onDropDoc = useCallback(handleFileUpload, []);
  const onDropVideo = useCallback(handleFileUpload, []);
  const onDropCamera = useCallback(handleFileUpload, []);
  const onDropVideoCamera = useCallback(handleFileUpload, []);
  const onDropAudio = useCallback(handleFileUpload, []);
  const onDropAudioRecording = useCallback(handleFileUpload, []);
  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    open: openImagePicker,
  } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDrop: onDropImage,
  });

  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
    open: openVideoPicker,
  } = useDropzone({
    multiple: true,
    noClick: true,
    noKeyboard: true,
    accept: { "video/*": [] },
    onDrop: onDropVideo,
  });
  const {
    getRootProps: getDocRootProps,
    getInputProps: getDocInputProps,
    open: openDocPicker,
  } = useDropzone({
    accept: {},
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDrop: onDropDoc,
  });
  const {
    getRootProps: getCameraRootProps,
    getInputProps: getCameraInputProps,
    open: openCamera,
  } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "video/*": [],
    },
    multiple: false,
    onDrop: onDropCamera,
  });
  const {
    getRootProps: getVideoCameraRootProps,
    getInputProps: getVideoCameraInputProps,
    open: openVideoCamera,
  } = useDropzone({
    multiple: false,
    noClick: true,
    noKeyboard: true,
    accept: { "video/*": [] },
    onDrop: onDropVideoCamera,
  });
  const {
    getRootProps: getAudioRootProps,
    getInputProps: getAudioInputProps,
    open: openAudioPicker,
  } = useDropzone({
    accept: { "audio/*": [] },
    multiple: true,
    noClick: true,
    noKeyboard: true,
    onDrop: onDropAudio,
  });
  const {
    getRootProps: getAudioRecordingRootProps,
    getInputProps: getAudioRecordingInputProps,
    open: openAudioRecording,
  } = useDropzone({
    accept: { "audio/*": [] },
    multiple: false,
    noClick: true,
    noKeyboard: true,
    onDrop: onDropAudioRecording,
  });
  const {
    mutateAsync: mutateAsyncUploadFileToServerFile,
    isPending: isLoadingUploadFileToServerFile,
  } = useMutation({
    mutationFn: uploadFileRepairReceptionFile,
    onSuccess: () => {
      setProgressMap({});
    },
  });
  const removeFile = useCallback(
    (fileId: number) => {
      mutateAsyncDeleteFile(fileId);
    },
    [mutateAsyncDeleteFile]
  );

  return (
    <div className="w-full">
      {isLoadingFiles || (isLoadingDeleteFile && <Loading />)}
      <List
        sx={{
          width: "100%",
          maxWidth: 360,
          bgcolor: mode === "dark" ? "#222e3c" : "background.paper",
          borderRadius: 1,
          overflow: "hidden",
        }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        <AccessGuard accessId={ACCESS_IDS.DOCUMENTS}>
          <ListItemButton
            onClick={openImagePicker}
            sx={{
              "&:hover": {
                bgcolor:
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemIcon>
              <Image
                sx={{
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="تصاویر"
              sx={{
                "& .MuiListItemText-primary": {
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                },
              }}
            />
          </ListItemButton>
        </AccessGuard>
        <AccessGuard accessId={ACCESS_IDS.DOCUMENTS}>
          <ListItemButton
            onClick={openVideoPicker}
            sx={{
              "&:hover": {
                bgcolor:
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemIcon>
              <VideoLibrary
                sx={{
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="فیلم ها"
              sx={{
                "& .MuiListItemText-primary": {
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                },
              }}
            />
          </ListItemButton>
        </AccessGuard>
        <AccessGuard accessId={ACCESS_IDS.DOCUMENTS}>
          <ListItemButton
            onClick={openCamera}
            sx={{
              "&:hover": {
                bgcolor:
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemIcon>
              <CameraAlt
                sx={{
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="دوربین"
              sx={{
                "& .MuiListItemText-primary": {
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                },
              }}
            />
          </ListItemButton>
        </AccessGuard>
        <AccessGuard accessId={ACCESS_IDS.DOCUMENTS}>
          <ListItemButton
            onClick={openVideoCamera}
            sx={{
              "&:hover": {
                bgcolor:
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemIcon>
              <Videocam
                sx={{
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="فیلمبرداری"
              sx={{
                "& .MuiListItemText-primary": {
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                },
              }}
            />
          </ListItemButton>
        </AccessGuard>
        <AccessGuard accessId={ACCESS_IDS.DOCUMENTS}>
          <ListItemButton
            onClick={openDocPicker}
            sx={{
              "&:hover": {
                bgcolor:
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemIcon>
              <FolderOpen
                sx={{
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="فایل"
              sx={{
                "& .MuiListItemText-primary": {
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                },
              }}
            />
          </ListItemButton>
        </AccessGuard>
        <AccessGuard accessId={ACCESS_IDS.DOCUMENTS}>
          <ListItemButton
            onClick={openAudioPicker}
            sx={{
              "&:hover": {
                bgcolor:
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemIcon>
              <Audiotrack
                sx={{
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="فایل صدا"
              sx={{
                "& .MuiListItemText-primary": {
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                },
              }}
            />
          </ListItemButton>
        </AccessGuard>
        <AccessGuard accessId={ACCESS_IDS.DOCUMENTS}>
          <ListItemButton
            onClick={openAudioRecording}
            sx={{
              "&:hover": {
                bgcolor:
                  mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemIcon>
              <Mic
                sx={{
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary="ضبط صدا"
              sx={{
                "& .MuiListItemText-primary": {
                  color:
                    mode === "dark" ? "rgba(255, 255, 255, 0.8)" : undefined,
                },
              }}
            />
          </ListItemButton>
        </AccessGuard>
      </List>
      <div {...getImageRootProps({ className: "hidden" })}>
        <input {...getImageInputProps()} accept="image/*" />
      </div>
      <div {...getVideoRootProps({ className: "hidden" })}>
        <input {...getVideoInputProps()} accept="video/*" />
      </div>
      <div {...getDocRootProps({ className: "hidden" })}>
        <input {...getDocInputProps()} />
      </div>
      <div {...getCameraRootProps({ className: "hidden" })}>
        <input
          {...getCameraInputProps()}
          capture="environment"
          accept="image/*"
        />
      </div>
      <div {...getVideoCameraRootProps({ className: "hidden" })}>
        <input
          {...getVideoCameraInputProps()}
          accept="video/*"
          capture="environment"
        />
      </div>
      <div {...getAudioRootProps({ className: "hidden" })}>
        <input {...getAudioInputProps()} accept="audio/*" />
      </div>
      <div {...getAudioRecordingRootProps({ className: "hidden" })}>
        <input
          {...getAudioRecordingInputProps()}
          accept="audio/*"
          capture="user"
        />
      </div>
      <FilePreviewGrid
        files={files ?? []}
        progressMap={progressMap}
        removeFile={removeFile}
        isLoading={isLoadingUploadFileToServerFile}
      />
    </div>
  );
};

export default UploaderDocs;
