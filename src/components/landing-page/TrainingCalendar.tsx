import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import timelinePlugin from "@fullcalendar/timeline";
import { Box, Paper, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { TCourse } from "@/types/course.types";
import { apiClient } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { CustomContainer } from "@/components/shared/CustomContainer";
import Event from "@/components/calendar/Event";
import { GlobalStyles } from "@/components/calendar/GlobalStyles";
import LoadingPage from "@/components/shared/LoadingPage";
import { max } from "date-fns";

export const TrainingCalendar = () => {
  const {
    data: courses = [],
    isLoading,
    isError,
  } = useQuery<TCourse[]>({
    queryKey: ["public-courses"],
    queryFn: () =>
      apiClient
        .get<TCourse[]>("/main/v1/public/courses/")
        .then((res) => res ?? []),
    enabled: true,
  });

  // Filter only physical courses with a valid training_date
  const physicalCourses = (courses as TCourse[]).filter(
    (course: TCourse) => course.learning_mode === "PHYSICAL" && course.training_date,
  );

  // Map to FullCalendar event format
  const events = physicalCourses.map((course: TCourse) => ({
    id: course.guid || course.id.toString(),
    title: course.title + (course.venue ? ` @ ${course.venue}` : ""),
    start: course.training_date ? new Date(course.training_date) : new Date(),
    allDay: true,
    extendedProps: {
      description: course.description,
      venue: course.venue,
    },
  }));

  const calendarRef = useRef(null);
  const [view, setView] = useState("dayGridMonth");
  if (isLoading) return <LoadingPage />;

  return (
    <Box id="calendar">
      <GlobalStyles />
      <Paper elevation={1}>
        <CustomContainer
          sx={{
            py: [2, 4, 6],
            p: 3,
            borderRadius: 3,
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          <Typography
            color="primary"
            gutterBottom
            textAlign={"center"}
            variant="h3"
          >
            Trainings Calendar
          </Typography>
          <Typography
            textAlign={"center"}
            variant="body1"
            color="text.secondary"
            gutterBottom
          >
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
                // Find the course for this event
                const course = physicalCourses.find(
                  (c: TCourse) => (c.guid || c.id.toString()) === arg.event.id,
                );
                if (!course) return null;
                return <Event course={course} arg={arg} />;
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
    </Box>
  );
};
