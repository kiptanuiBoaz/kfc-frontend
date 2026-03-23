import { Chip } from "@mui/material";

export const renderStatusChip = (status: string) => {
  const colorMap: Record<
    string,
    "default" | "success" | "warning" | "info" | "error"
  > = {
    draft: "default",
    pending: "warning",
    published: "success",
    archived: "info",
    rejected: "error",
  };
  const key = status?.toLowerCase() || "default";

  return (
    <Chip
      size="small"
      label={status}
      color={colorMap[key] || "default"}
      sx={{ textTransform: "capitalize" }}
    />
  );
};
