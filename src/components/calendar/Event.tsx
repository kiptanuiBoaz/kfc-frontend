import { useTheme } from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { TCourse } from "@/types/course.types";
import { clampStyle, descClampStyle } from "@/components/calendar/styles";

interface EventProps {
  course: TCourse;
  arg: any;
  onClick?: () => void;
}
const Event = ({ course, arg, onClick }: EventProps) => {
  const theme = useTheme();
  const isPast = new Date(course.training_date) < new Date();
  return (
    <MuiLink
      component={RouterLink}
      to={`/courses/preview/${course.guid}`}
      underline="none"
      onClick={() => onClick?.()}
      sx={{
        backgroundColor: "#f9f9f9",
        display: "block",
        cursor: "pointer",
        "&:hover": { opacity: 0.8 },
        p: 1,
        borderRadius: 1.5,
        color: isPast ? theme.palette.warning.main : theme.palette.primary.main,
        borderColor: isPast
          ? theme.palette.warning.main
          : theme.palette.primary.main,
        borderWidth: 1,
        borderStyle: "solid",
      }}
    >
      {/* @ts-ignore */}
      <div style={clampStyle}>{arg.event.title}</div>
      {arg.event.extendedProps.description && (
        // @ts-ignore
        <div style={descClampStyle}>{arg.event.extendedProps.description}</div>
      )}
    </MuiLink>
  );
};

export default Event;
