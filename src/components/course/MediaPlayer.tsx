import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Modal,
  Paper,
} from "@mui/material";
import {
  FileText,
  PlayCircle,
  ImageIcon as Image,
  Download,
} from "lucide-react";
import { TModuleTopic } from "@/types/course.types";
import { truncateString } from "@/utils/truncateString";
import { TTopicMediaSelection } from "@/types/media.types";

interface VideoPlayerProps {
  topic?: TModuleTopic;
  onMediaSelect?: (media: TTopicMediaSelection) => void;
}

const MediaPlayer: React.FC<VideoPlayerProps> = ({ topic, onMediaSelect }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{
    type: "image" | "video";
    url: string;
  } | null>(null);
  if (!topic) {
    return (
      <Box
        sx={{
          p: 2,
          bgcolor: "grey.100",
          minHeight: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6">Select a topic to view</Typography>
      </Box>
    );
  }

  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const handleOpen = (url: string) => {
    scrollToTop();
    window.open(url, "_blank");
  };

  const handleMediaPreview = (type: "image" | "video", url: string) => {
    scrollToTop();
    if (onMediaSelect) {
      onMediaSelect({ type, url });
      return;
    }
    setModalContent({ type, url });
    setModalOpen(true);
  };

  const handleDownload = (url: string) => {
    scrollToTop();
    const link = document.createElement("a");
    link.href = url;
    link.download = url.split("/").pop() || "file";
    link.click();
  };

  const getFileType = (url: string) => {
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["mp4", "avi", "mov", "mkv"].includes(ext || "")) return "video";
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext || ""))
      return "image";
    return "other";
  };

  const renderFileItem = (url: string, type: "files" | "videos" | "images") => {
    const fileType = type === "files" ? getFileType(url) : type.slice(0, -1); // files -> file, but adjust
    let icon;
    let action;
    if (fileType === "pdf" || type === "files") {
      icon = <FileText size={20} />;
      action = () => handleOpen(url);
    } else if (fileType === "video" || type === "videos") {
      icon = <PlayCircle size={20} />;
      action = () => handleMediaPreview("video", url);
    } else if (fileType === "image" || type === "images") {
      icon = <Image size={20} />;
      action = () => handleMediaPreview("image", url);
    } else {
      icon = <Download />;
      action = () => handleDownload(url);
    }
    const fileName = url.split("/").pop() || "Unknown File";
    return (
      <ListItem
        disablePadding
        key={url}
        sx={{
          cursor: "pointer",
          "&:hover": { backgroundColor: "grey.200" },
          mb: 1,
        }}
        onClick={action}
      >
        <ListItemIcon>{icon}</ListItemIcon>
        <ListItemText primary={truncateString(fileName, 29)} />
      </ListItem>
    );
  };

  const allFiles = [
    ...(topic.files || []).map((url) => ({ url, type: "files" as const })),
    ...(topic.videos || []).map((url) => ({ url, type: "videos" as const })),
    ...(topic.images || []).map((url) => ({ url, type: "images" as const })),
  ];

  return (
    <Paper>
      {allFiles.length > 0 ? (
        <List>
          {allFiles.map(({ url, type }) => renderFileItem(url, type))}
        </List>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No files available for this topic.
        </Typography>
      )}
      {/* {topic.files_description && (
        <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
          {topic.files_description}
        </Typography>
      )}
      {topic.videos_description && (
        <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
          {topic.videos_description}
        </Typography>
      )}
      {topic.files_description && (
        <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
          {topic.files_description}
        </Typography>
      )} */}
      {!onMediaSelect && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 2,
              borderRadius: 2,
            }}
          >
            {modalContent?.type === "image" && (
              <Box
                component="img"
                src={modalContent.url}
                alt="Modal Image"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "80vh",
                  objectFit: "contain",
                }}
              />
            )}
            {modalContent?.type === "video" && (
              <Box
                component="video"
                controls
                src={modalContent.url}
                sx={{ maxWidth: "100%", maxHeight: "80vh" }}
              />
            )}
          </Box>
        </Modal>
      )}
    </Paper>
  );
};

export default MediaPlayer;
