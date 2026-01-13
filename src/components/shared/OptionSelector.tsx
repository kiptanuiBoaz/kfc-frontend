import React from "react";
import { alpha, Chip, Stack, useTheme } from "@mui/material";

interface OptionSelectorProps {
  options: string[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  selectedValue,
  onChange,
}) => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          // variant={selectedValue === option ? "filled" : "outlined"}
          onClick={() => onChange(option)}
          sx={{
            borderRadius: "20px",
            cursor: "pointer",
            fontWeight: 600,
            bgcolor:
              selectedValue === option
                ? theme.palette.primary.main
                : alpha(theme.palette.primary.main, 0.12),
            color:
              selectedValue === option
                ? theme.palette.common.white
                : theme.palette.primary.main,
          }}
        />
      ))}
    </Stack>
  );
};

export default OptionSelector;
