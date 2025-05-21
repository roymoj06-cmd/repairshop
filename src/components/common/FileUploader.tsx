import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { FC, ChangeEvent, useRef } from "react";
import {
  Grid2 as Grid,
  IconButton,
  Typography,
  ListItem,
  List,
  Box,
  Chip,
  Button,
} from "@mui/material";

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void;
  helperText?: string;
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  error?: boolean;
  label?: string;
  files: File[];
}

const FileUploader: FC<FileUploaderProps> = ({
  multiple = true,
  helperText = "",
  onFilesChange,
  error = false,
  maxFiles = 10,
  accept = "*",
  label = "فایل‌های مربوط به خودرو را انتخاب کنید",
  files = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const fileList = Array.from(e.target.files);
    const newFiles = multiple
      ? [...files, ...fileList].slice(0, maxFiles)
      : [fileList[0]];

    onFilesChange(newFiles);

    // Reset the input value so the same file can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveFile = (indexToRemove: number) => {
    onFilesChange(files.filter((_, index) => index !== indexToRemove));
  };

  const formatFileSize = (size: number): string => {
    if (size < 1024) return size + " B";
    else if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    else return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Box className="w-full">
      <Box
        className={`p-4 border-2 border-dashed rounded-md ${
          error ? "border-red-500" : "border-gray-300"
        } hover:border-blue-500 transition-colors`}
      >
        <Box className="flex flex-col items-center justify-center">
          <UploadFileIcon className="text-gray-400 mb-2" fontSize="large" />
          <Typography variant="body1" className="mb-2">
            {label}
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => fileInputRef.current?.click()}
          >
            انتخاب فایل
          </Button>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={accept}
            multiple={multiple}
          />
          {helperText && (
            <Typography
              variant="caption"
              color={error ? "error" : "textSecondary"}
              className="mt-1"
            >
              {helperText}
            </Typography>
          )}
        </Box>
      </Box>

      {files.length > 0 && (
        <List className="mt-2 p-0">
          {files.map((file, index) => (
            <ListItem
              key={`${file.name}-${index}`}
              className="py-1 px-2 hover:bg-gray-50 rounded-md"
              secondaryAction={
                <IconButton
                  edge="end"
                  color="error"
                  size="small"
                  onClick={() => handleRemoveFile(index)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <Grid container alignItems="center" spacing={1}>
                <Grid size={{ xs: 2 }}>
                  <Chip
                    label={formatFileSize(file.size)}
                    size="small"
                    color="primary"
                    variant="outlined"
                    className="ml-2"
                  />
                </Grid>
                <Grid size={{ xs: 10 }}>
                  <Typography variant="body2" className="truncate">
                    {file.name}
                  </Typography>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FileUploader;
