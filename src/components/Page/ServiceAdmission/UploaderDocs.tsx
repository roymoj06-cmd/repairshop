import Button from "@/components/common/Button";
import Loading from "@/components/common/Loading";
import {
  getFilesByReceptionId,
  uploadFileRepairReceptionFile,
} from "@/service/repairReceptionFile/repairReceptionFile.service";
import {
  CameraAlt,
  FolderOpen,
  Image,
  Videocam,
  VideoLibrary,
} from "@mui/icons-material";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { FC, useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import FilePreviewGrid from "./FilePreviewGrid";
type UploadModalProps = {
  repairReceptionId?: number | string;
  onClickAction?: (files: Array<File & { id: number }>) => void;
};
const UploaderDocs: FC<UploadModalProps> = ({
  repairReceptionId,
  onClickAction,
}) => {
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
    mutateAsync: mutateAsyncUploadFileToServerFile,
    isPending: isLoadingUploadFileToServerFile,
  } = useMutation({
    mutationFn: uploadFileRepairReceptionFile,
    onSuccess: () => {
      setProgressMap({});
    },
  });
  const removeFile = (fileId: number) => {
    setFiles(files.filter((file) => file?.id !== fileId));
  };

  return (
    <div className="w-full">
      {isLoadingFiles && <Loading />}
      <List
        sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}
        component="nav"
        aria-labelledby="nested-list-subheader"
      >
        <ListItemButton onClick={openImagePicker}>
          <ListItemIcon>
            <Image />
          </ListItemIcon>
          <ListItemText primary="تصاویر" />
        </ListItemButton>
        <ListItemButton onClick={openVideoPicker}>
          <ListItemIcon>
            <VideoLibrary />
          </ListItemIcon>
          <ListItemText primary="فیلم ها" />
        </ListItemButton>
        <ListItemButton onClick={openCamera}>
          <ListItemIcon>
            <CameraAlt />
          </ListItemIcon>
          <ListItemText primary="دوربین" />
        </ListItemButton>
        <ListItemButton onClick={openVideoCamera}>
          <ListItemIcon>
            <Videocam />
          </ListItemIcon>
          <ListItemText primary="فیلمبرداری" />
        </ListItemButton>
        <ListItemButton onClick={openDocPicker}>
          <ListItemIcon>
            <FolderOpen />
          </ListItemIcon>
          <ListItemText primary="فایل" />
        </ListItemButton>
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
      <FilePreviewGrid
        files={files ?? []}
        progressMap={progressMap}
        removeFile={removeFile}
        isLoading={isLoadingUploadFileToServerFile}
      />
      {files.length > 0 && (
        <div className="flex w-full my-3 justify-center">
          <Button
            label="ثبت"
            onClick={() => {
              if (onClickAction) {
                onClickAction?.(files);
              }
            }}
            variant="contained"
            className="w-full"
            color="secondary"
          />
        </div>
      )}
    </div>
  );
};

export default UploaderDocs;
