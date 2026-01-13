import React, { useState } from "react";
import { Button, TextField, Typography, Chip, Box } from "@mui/material";
import { X, Plus, Trash2 } from "lucide-react";

interface ChipInputFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
  error?: boolean;
  helperText?: string;
}
export const ChipInputField: React.FC<ChipInputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  error,
  helperText,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        <TextField
          size="small"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          error={error}
          sx={{ flex: 1 }}
        />
        <Button
          variant="outlined"
          onClick={handleAdd}
          disabled={!inputValue.trim()}
          startIcon={<Plus size={16} />}
        >
          Add
        </Button>
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
        {value.map((item, index) => (
          <Chip
            key={index}
            color="primary"
            label={item}
            onDelete={() => handleRemove(index)}
            deleteIcon={<Trash2 size={14} />}
            size="small"
            variant="outlined"
          />
        ))}
      </Box>
      {helperText && (
        <Typography
          variant="caption"
          color={error ? "error" : "text.secondary"}
          sx={{ display: "block", mt: 0.5 }}
        >
          {helperText}
        </Typography>
      )}
    </Box>
  );
};
