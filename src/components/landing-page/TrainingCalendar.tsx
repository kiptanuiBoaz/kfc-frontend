import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import timelinePlugin from "@fullcalendar/timeline";
import {
  Box,
  Container,
  Paper,
  Typography,
  Chip,
  Link as MuiLink,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { useRef, useState } from "react";
import { TCourse } from "@/types/course.types";
import { apiClient } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { CustomContainer } from "@/components/shared/CustomContainer";

const TrainingCalendar = () => {
  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery<TCourse[]>({
    queryKey: ["adminCourses"],
    queryFn: () => apiClient.get<TCourse[]>("/main/v1/public/courses/"),
  });

  // Filter only physical courses with a valid training_date
  const physicalCourses = courses.filter(
    (course) => course.learning_mode === "PHYSICAL" && course.training_date,
  );
  console.log("Physical Courses for Calendar:", physicalCourses);
  // Map to FullCalendar event format
  const events = physicalCourses.map((course) => ({
    id: course.guid || course.id,
    title: course.title + (course.venue ? ` @ ${course.venue}` : ""),
    start: new Date(course.training_date),
    allDay: true,
    extendedProps: {
      description: course.description,
      venue: course.venue,
    },
  }));

  const calendarRef = useRef(null);
  const [view, setView] = useState("dayGridMonth");
  const theme = useTheme();

  return (
    <Paper elevation={1} sx={{ py: [2, 4, 6], p: 3, borderRadius: 3 }}>
      <CustomContainer>
        <Typography
          color="primary"
          gutterBottom
          textAlign={"center"}
          variant="h3"
        >
          Trainings Calendar
        </Typography>
        <Typography textAlign={"center"} variant="body1" color="text.secondary">
          Stay updated with our upcoming physical training sessions.
        </Typography>
        <Box>
          <FullCalendar
            ref={calendarRef}
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              listPlugin,
              timelinePlugin,
              interactionPlugin,
            ]}
            initialView={view}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,listWeek",
            }}
            // @ts-ignore
            events={events}
            eventContent={(arg) => {
              // Determine if event is past or upcoming
              const now = new Date();
              const eventDate = new Date(arg.event.start as Date);
              // @ts-ignore
              const isPast = eventDate < now.setHours(0, 0, 0, 0);
              // Style chips

              // Clamp styles
              const clampStyle = {
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                fontWeight: 700,
                fontSize: 15,
                mb: 0.2,
                maxWidth: 220,
                border: "none",
              };
              const descClampStyle = {
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                fontSize: 12,
                color: "#666",
                maxWidth: 220,
                border: "none",
              };
              // Link to course preview
              const courseGuid = arg.event.id;
              return (
                <MuiLink
                  component={RouterLink}
                  to={`/courses/preview/${courseGuid}`}
                  underline="none"
                  sx={{
                    backgroundColor: "#f9f9f9",
                    display: "block",
                    cursor: "pointer",
                    "&:hover": { opacity: 0.8 },
                    p: 1,
                    borderRadius: 1.5,
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
                    <div style={descClampStyle}>
                      {arg.event.extendedProps.description}
                    </div>
                  )}
                </MuiLink>
              );
            }}
            height={600}
            noEventsContent={
              <Typography color="text.secondary">
                No upcoming physical trainings.
              </Typography>
            }
          />
        </Box>
      </CustomContainer>
    </Paper>
  );
};

export default TrainingCalendar;
