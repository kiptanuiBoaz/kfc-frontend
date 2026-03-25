import { useMyCourses } from "@/hooks/useMyCourses";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import timeGridPlugin from "@fullcalendar/timegrid";
import timelinePlugin from "@fullcalendar/timeline";

import React, { useRef } from "react";
import { Box, Dialog, Typography } from "@mui/material";
import Event from "@/components/calendar/Event";
import { GlobalStyles } from "@/components/calendar/GlobalStyles";

export const UserCalendar = ({ isCalendarOpen, setIsCalendarOpen }) => {
  const calendarRef = useRef(null);

  const { data: myCourses = [] } = useMyCourses();
  // Filter only physical trainings
  const myPhysicalCourses = (myCourses || []).filter(
    (course) => course.learning_mode === "PHYSICAL" && course.training_date,
  );
  // Map to FullCalendar event format
  const myEvents = myPhysicalCourses.map((course) => ({
    id: course.guid,
    title: course.title + (course.venue ? ` @ ${course.venue}` : ""),
    start: new Date(course.training_date),
    allDay: true,
    extendedProps: {
      description: course.description,
      venue: course.venue,
    },
  }));
  return (
    <>
      <Dialog
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography
            variant="h5"
            textAlign="center"
            color="primary"
            gutterBottom
          >
            My Physical Trainings
          </Typography>
          <Typography
            textAlign="center"
            variant="body2"
            color="text.secondary"
            mb={2}
          >
            View your upcoming and past physical training sessions.
          </Typography>
          <Box>
            <GlobalStyles />
            <FullCalendar
              ref={calendarRef}
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                listPlugin,
                timelinePlugin,
                interactionPlugin,
              ]}
              initialView={"dayGridMonth"}
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,listWeek",
              }}
              events={myEvents}
              eventContent={(arg) => {
                // Find the course for this event
                const course = myPhysicalCourses.find(
                  (c) => c.guid === arg.event.id,
                );
                if (!course) return null;
                // @ts-ignore
                return (
                  <Event
                    onClick={() => setIsCalendarOpen(false)}
                    // @ts-ignore
                    course={course}
                    arg={arg}
                  />
                );
              }}
              height={500}
              noEventsContent={
                <Typography color="text.secondary" textAlign="center">
                  No physical trainings found in your courses.
                </Typography>
              }
            />
          </Box>
        </Box>
      </Dialog>
    </>
  );
};
