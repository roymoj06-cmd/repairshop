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
  Send,
  Clear,
} from "@mui/icons-material";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  List,
  Button,
  Box,
  Typography,
  Chip,
} from "@mui/material";

import {
  deleteFileRepairReceptionFile,
  uploadFileRepairReceptionFile,
  getFilesByReceptionId,
  updateShowCustomer,
  sendFileLinksNotification,
} from "@/service/repairReceptionFile/repairReceptionFile.service";
import { ACCESS_IDS, AccessGuard } from "@/utils/accessControl";
import { useTheme } from "@/context/ThemeContext";
import FilePreviewGrid from "./FilePreviewGrid";
import { Loading } from "@/components";
import { CompressLevelStatic } from "@/utils/statics";

type UploadModalProps = {
  repairReceptionId?: number | string;
  readOnly?: boolean;
  showCustomerOnly?: boolean;
  enableFileSending?: boolean;
};

const UploaderDocs: FC<UploadModalProps> = ({
  repairReceptionId,
  readOnly = false,
  showCustomerOnly = false,
  enableFileSending = false,
}) => {
  const { mode } = useTheme();
  const [files, setFiles] = useState<IRepairReceptionFile[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, number>>({});
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [loadingFileIds, setLoadingFileIds] = useState<Set<number>>(new Set());

  const handleFileUpload = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      try {
        await mutateAsyncUploadFileToServerFile({
          CompressionLevel: CompressLevelStatic.GoodQuality_20,
          file: file,
          repairReceptionId: repairReceptionId,
          onProgress: (progress) => {
            // Create a temporary ID for tracking progress before the file has a server ID
            const tempId = file.name + "_" + file.size + "_" + Date.now();
            setProgressMap((prev) => ({ ...prev, [tempId]: progress }));
          },
        });
        // After successful upload, refresh the files list
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
      let filteredFiles = data?.data || [];
      if (showCustomerOnly) {
        filteredFiles = filteredFiles.filter(
          (file: IRepairReceptionFile) => file.showCustomer === true
        );
      }
      setFiles(filteredFiles);
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

  const {
    mutateAsync: mutateAsyncUpdateShowCustomer,
    isPending: isUpdatingShowCustomer,
  } = useMutation({
    mutationFn: updateShowCustomer,
    onSuccess: () => {
      mutateAsyncGetFilesByReceptionId();
    },
  });

  const {
    mutateAsync: mutateAsyncSendFileLinks,
    isPending: isSendingFileLinks,
  } = useMutation({
    mutationFn: sendFileLinksNotification,
    onSuccess: () => {
      setSelectedFiles(new Set());
    },
  });
  const removeFile = useCallback(
    (fileId: number) => {
      mutateAsyncDeleteFile(fileId);
    },
    [mutateAsyncDeleteFile]
  );

  const toggleShowCustomer = useCallback(
    async (fileId: number, currentShowCustomer: boolean) => {
      setLoadingFileIds((prev) => new Set(prev).add(fileId));
      try {
        await mutateAsyncUpdateShowCustomer({
          fileId,
          showCustomer: !currentShowCustomer,
        });
      } finally {
        setLoadingFileIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }
    },
    [mutateAsyncUpdateShowCustomer]
  );

  const toggleFileSelection = useCallback((fileId: number) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  }, []);

  const clearSelectedFiles = useCallback(() => {
    setSelectedFiles(new Set());
  }, []);

  const handleSendFileLinks = useCallback(async () => {
    if (selectedFiles.size === 0) return;

    try {
      await mutateAsyncSendFileLinks({
        fileIds: Array.from(selectedFiles),
      });
    } catch (error) {
      console.error("Error sending file links", error);
    }
  }, [selectedFiles, mutateAsyncSendFileLinks]);

  return (
    <div className="w-full">
      {(isLoadingFiles ||
        isLoadingDeleteFile ||
        isSendingFileLinks ||
        isUpdatingShowCustomer) && <Loading />}
      {!readOnly && (
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
      )}
      {!readOnly && (
        <>
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
        </>
      )}

      {/* File Selection and Send Message Section */}
      {files && files.length > 0 && (
        <Box sx={{ mt: 2, mb: 2 }}>
          {selectedFiles.size > 0 && (
            <>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color:
                    mode === "dark"
                      ? "rgba(255, 255, 255, 0.8)"
                      : "text.primary",
                }}
              >
                فایل‌های انتخابی
              </Typography>

              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.7)"
                        : "text.secondary",
                  }}
                >
                  تعداد انتخابی ({selectedFiles.size}):
                </Typography>
                {Array.from(selectedFiles).map((fileId) => {
                  const file = files.find((f) => f.id === fileId);
                  return file ? (
                    <Chip
                      key={fileId}
                      label={file.fileName}
                      size="small"
                      onDelete={() => toggleFileSelection(fileId)}
                      sx={{
                        bgcolor:
                          mode === "dark"
                            ? "rgba(33, 150, 243, 0.2)"
                            : "primary.light",
                        color:
                          mode === "dark"
                            ? "rgba(255, 255, 255, 0.8)"
                            : "primary.dark",
                        "& .MuiChip-deleteIcon": {
                          color:
                            mode === "dark"
                              ? "rgba(255, 255, 255, 0.6)"
                              : "primary.main",
                        },
                      }}
                    />
                  ) : null;
                })}
              </Box>

              <Box
                sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}
              >
                {enableFileSending && (
                  <Button
                    variant="contained"
                    startIcon={isSendingFileLinks ? undefined : <Send />}
                    onClick={handleSendFileLinks}
                    disabled={selectedFiles.size === 0 || isSendingFileLinks}
                    sx={{
                      bgcolor: "primary.main",
                      "&:hover": {
                        bgcolor: "primary.dark",
                      },
                      "&:disabled": {
                        bgcolor: "grey.400",
                      },
                    }}
                  >
                    {isSendingFileLinks ? "در حال ارسال..." : "ارسال پیام"}
                  </Button>
                )}

                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={clearSelectedFiles}
                  size="small"
                  disabled={
                    isSendingFileLinks ||
                    isUpdatingShowCustomer ||
                    isLoadingDeleteFile
                  }
                  sx={{
                    borderColor:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.3)"
                        : "text.secondary",
                    color:
                      mode === "dark"
                        ? "rgba(255, 255, 255, 0.8)"
                        : "text.secondary",
                    "&:hover": {
                      borderColor:
                        mode === "dark"
                          ? "rgba(255, 255, 255, 0.5)"
                          : "text.primary",
                      color:
                        mode === "dark"
                          ? "rgba(255, 255, 255, 1)"
                          : "text.primary",
                    },
                    "&:disabled": {
                      borderColor:
                        mode === "dark"
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(0, 0, 0, 0.12)",
                      color:
                        mode === "dark"
                          ? "rgba(255, 255, 255, 0.3)"
                          : "rgba(0, 0, 0, 0.26)",
                    },
                  }}
                >
                  پاک کردن انتخاب
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}

      <FilePreviewGrid
        files={files ?? []}
        progressMap={progressMap}
        removeFile={removeFile}
        isLoading={isLoadingUploadFileToServerFile}
        toggleShowCustomer={toggleShowCustomer}
        readOnly={readOnly}
        selectedFiles={selectedFiles}
        onFileSelectionToggle={toggleFileSelection}
        isDeleting={isLoadingDeleteFile}
        isUpdatingVisibility={isUpdatingShowCustomer}
        loadingFileIds={loadingFileIds}
      />
    </div>
  );
};

export default UploaderDocs;
