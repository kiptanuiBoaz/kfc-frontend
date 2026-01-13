import React from "react";
import { Box, Typography, Avatar, Paper } from "@mui/material";
import { TInstructorDetails } from "@/types/course.types";

interface InstructorBioProps {
  instructor: TInstructorDetails;
}

const InstructorBio: React.FC<InstructorBioProps> = ({ instructor }) => {
  return (
    <Paper sx={{ p: 3, borderRadius: 1, mb: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
        Instructor
      </Typography>
      <Box display="flex" alignItems="center" mb={2}>
        <Avatar src={instructor.image} sx={{ width: 56, height: 56, mr: 2 }} />
        <Box>
          <Typography variant="body1" fontWeight="bold">
            {instructor.first_name} {instructor.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {instructor.email}
          </Typography>
        </Box>
      </Box>
      {/* {instructor.bio && ( */}
      <Typography variant="body2">
        {instructor.bio ||
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor."}
      </Typography>
      {/* )} */}
    </Paper>
  );
};

export default InstructorBio;
