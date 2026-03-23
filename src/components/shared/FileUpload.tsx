import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Stack,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  VideoFile,
  AudioFile,
  PictureAsPdf,
} from "@mui/icons-material";
import { apiClient } from "@/api/apiClient";
import Notiflix from "notiflix";
import { TFileUploadResponse } from "@/types/api.types";

type FileType = "image" | "audio" | "video" | "file";

interface FileUploadProps {
  onChange: (urls: string[]) => void;
  fileType: FileType;
  values?: string[];
  multiple?: boolean;
  maxSize?: number; // in MB
  uploadEndpoint?: string;
  label?: string;
  description?: string;
}

const FILE_TYPE_CONFIG: Record<
  FileType,
  { accept: string; description: string; label: string }
> = {
  image: {
    accept: "image/jpeg,image/jpg,image/png,image/webp",
    description: "JPEG, JPG, PNG and WEBP (max 100MB each)",
    label: "Choose image or Drag and Drop Here",
  },
  audio: {
    accept: "audio/mp3,audio/mpeg,audio/wav,audio/ogg,audio/aac",
    description: "MP3, WAV, OGG and AAC (max 100MB each)",
    label: "Choose audio or Drag and Drop Here",
  },
  video: {
    accept: "video/mp4,video/webm,video/ogg,video/quicktime",
    description: "MP4, WebM, OGG and MOV (max 100MB each)",
    label: "Choose video or Drag and Drop Here",
  },
  file: {
    accept: "application/pdf",
    description: "PDF files only (max 100MB each)",
    label: "Choose PDF or Drag and Drop Here",
  },
};

const getFileIcon = (type: FileType) => {
  switch (type) {
    case "image":
      return <ImageIcon sx={{ fontSize: 40, color: "primary.main" }} />;
    case "video":
      return <VideoFile sx={{ fontSize: 40, color: "secondary.main" }} />;
    case "audio":
      return <AudioFile sx={{ fontSize: 40, color: "info.main" }} />;
    case "file":
      return <PictureAsPdf sx={{ fontSize: 40, color: "error.main" }} />;
  }
};

const FileUpload: React.FC<FileUploadProps> = ({
  onChange,
  fileType,
  values = [],
  multiple = false,
  maxSize = 100,
  uploadEndpoint = "/main/v1/file/upload/",
  label,
  description,
}) => {
  const config = FILE_TYPE_CONFIG[fileType];
  const accept = config.accept;
  const defaultLabel = label || config.label;
  const defaultDescription = description || config.description;
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    // Validate file type
    const acceptedTypes = accept.split(",").map((type) => type.trim());
    const currentFileType = file.type;

    if (!acceptedTypes.includes(currentFileType)) {
      Notiflix.Notify.failure(
        `Invalid file type. Accepted types: ${acceptedTypes.join(", ")}`,
      );
      return false;
    }

    // Validate file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      Notiflix.Notify.failure(
        `File size exceeds ${maxSize}MB. Please choose a smaller file.`,
      );
      return false;
    }

    return true;
  };

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => validateFile(file));
    if (validFiles.length === 0) return;

    // Calculate total size of all files to be uploaded (including already uploaded)
    const totalSize = validFiles.reduce((acc, file) => acc + file.size, 0);
    // If already uploaded files exist, try to estimate their size as 0 (since we don't have the original size)
    // So only new files are counted for the limit
    if (totalSize > 100 * 1024 * 1024) {
      Notiflix.Notify.failure("Total upload size cannot exceed 100MB.");
      return;
    }

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of validFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", fileType);

        const response = await apiClient.post<TFileUploadResponse>(
          uploadEndpoint,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        if (response && response.data && response.data.url) {
          uploadedUrls.push(response.data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...values, ...uploadedUrls]);
        Notiflix.Notify.success(
          `${uploadedUrls.length} file(s) uploaded successfully!`,
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      Notiflix.Notify.failure("Failed to upload file(s). Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (urlToDelete: string) => {
    onChange(values.filter((url) => url !== urlToDelete));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fileArray = multiple ? Array.from(files) : [files[0]];
      uploadFiles(fileArray);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = multiple ? Array.from(files) : [files[0]];
      uploadFiles(fileArray);
    }
    // Reset input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const renderFilePreview = (url: string, index: number) => {
    const isImage = fileType === "image";
    const fileName = url.split("/").pop() || `File ${index + 1}`;

    return (
      <Box
        key={url}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1,
          border: "1px solid",
          borderColor: "grey.300",
          borderRadius: 1,
          backgroundColor: "background.paper",
        }}
      >
        {isImage ? (
          <Box
            component="img"
            src={url}
            alt={fileName}
            sx={{
              width: 48,
              height: 48,
              objectFit: "cover",
              borderRadius: 1,
            }}
          />
        ) : (
          getFileIcon(fileType)
        )}
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={fileName}
        >
          {fileName}
        </Typography>
        <IconButton
          size="small"
          color="error"
          onClick={() => handleDelete(url)}
          aria-label="Delete file"
        >
          <Delete fontSize="small" />
        </IconButton>
      </Box>
    );
  };

  return (
    <Box>
      {/* Single file preview (when multiple=false and file exists) */}
      {!multiple && values.length > 0 ? (
        <Box
          sx={{
            position: "relative",
            display: "inline-block",
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "grey.300",
          }}
        >
          {fileType === "image" ? (
            <Box
              component="img"
              src={values[0]}
              alt="Uploaded file"
              sx={{
                display: "block",
                maxWidth: "100%",
                maxHeight: 200,
                objectFit: "cover",
              }}
            />
          ) : (
            <Box
              sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                minWidth: 150,
              }}
            >
              {getFileIcon(fileType)}
              <Typography
                variant="body2"
                sx={{
                  maxWidth: 120,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={values[0].split("/").pop()}
              >
                {values[0].split("/").pop()}
              </Typography>
            </Box>
          )}
          <IconButton
            size="small"
            onClick={() => handleDelete(values[0])}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              backgroundColor: "error.main",
              color: "white",
              "&:hover": {
                backgroundColor: "error.dark",
              },
            }}
            aria-label="Delete file"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <>
          {/* Existing files preview (for multiple files) */}
          {multiple && values.length > 0 && (
            <Stack spacing={1} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Uploaded files ({values.length})
              </Typography>
              {values.map((url, index) => renderFilePreview(url, index))}
            </Stack>
          )}

          {/* Upload area */}
          <Box
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            sx={{
              border: "2px dashed",
              borderColor: isDragging ? "primary.main" : "grey.300",
              borderRadius: 2,
              padding: 3,
              textAlign: "center",
              backgroundColor: isDragging ? "action.hover" : "background.paper",
              transition: "all 0.3s ease",
              cursor: "pointer",
              position: "relative",
              minHeight: 150,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "action.hover",
              },
            }}
          >
            {isUploading ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Uploading...
                </Typography>
              </Box>
            ) : (
              <>
                <CloudUpload
                  sx={{
                    fontSize: 40,
                    color: "warning.main",
                    mb: 1,
                  }}
                />
                <Typography variant="body2" color="text.primary" gutterBottom>
                  {defaultLabel}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {defaultDescription}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                  disabled={isUploading}
                >
                  Browse{" "}
                  {fileType === "file"
                    ? "File"
                    : fileType.charAt(0).toUpperCase() + fileType.slice(1)}
                  {multiple ? "s" : ""}
                </Button>
              </>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileInput}
              style={{ display: "none" }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default FileUpload;
