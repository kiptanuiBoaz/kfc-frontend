import React from "react";
import { Button, Pagination, Stack } from "@mui/material";

interface ServerPaginationProps {
  page: number;
  pageCount: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

const ServerPagination: React.FC<ServerPaginationProps> = ({
  page,
  pageCount,
  isLoading = false,
  onPageChange,
}) => {
  const handlePrev = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < pageCount) {
      onPageChange(page + 1);
    }
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ mt: 4 }}
    >
      <Button
        variant="text"
        color="primary"
        onClick={handlePrev}
        disabled={isLoading || page === 1}
      >
        Previous
      </Button>

      <Pagination
        count={pageCount}
        page={page}
        onChange={(_event, value) => onPageChange(value)}
        siblingCount={1}
        boundaryCount={1}
        shape="rounded"
        color="primary"
        disabled={isLoading}
      />

      <Button
        variant="text"
        color="primary"
        onClick={handleNext}
        disabled={isLoading || page === pageCount}
      >
        Next
      </Button>
    </Stack>
  );
};

export default ServerPagination;
