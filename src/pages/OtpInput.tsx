import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useFormik } from "formik";
import { useDispatch } from "react-redux";
import { apiClient } from "@/api/apiClient";
import { OtpSchema, otpInitialValues } from "@/schemas/auth/otp.schema";
import { loginSuccess } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
import { Notify } from "notiflix";
import { LoginResponse } from "@/types/auth.types";

interface OtpInputProps {
  email: string;
  password: string;
  onSuccess: (response: LoginResponse) => void;
  onCancel: () => void;
  onResend?: () => Promise<void>;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  email,
  password,
  onSuccess,
  onCancel,
  onResend,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const formik = useFormik({
    initialValues: otpInitialValues,
    validationSchema: OtpSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setErrorMessage(null);
        setSuccessMessage(null);

        const response = await apiClient.post("/auth/2fa/login/", {
          otp: values.otp,
          email: email,
          password: password,
          is_first_time_login: false,
        });

        // Dispatch login success with user data
        dispatch(loginSuccess(response as LoginResponse));

        setSuccessMessage("2FA verification successful!");
        Notify.success("Login successful!");
        resetForm();
        onSuccess(response as LoginResponse);
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.detail ||
          "Invalid OTP. Please try again.";
        setErrorMessage(message);
        setSuccessMessage(null);
        Notify.failure(message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleResendOTP = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsResending(true);
    try {
      if (onResend) {
        await onResend();
      } else {
        await apiClient.post("/auth/resend-otp/", { email });
      }
      const message = "A new verification code has been sent to your email.";
      setSuccessMessage(message);
      Notify.success(message);
    } catch (error: any) {
      const message =
        error?.message ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to resend OTP. Please try again.";
      setErrorMessage(message);
      Notify.failure(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack spacing={1} textAlign="center">
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Verify Your Identity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We've sent a 6-digit verification code to your email address:
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          {email}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please enter the code below to complete your login.
        </Typography>
      </Stack>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}

      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing={2.5}>
          <TextField
            label="Verification Code"
            name="otp"
            required
            fullWidth
            placeholder="Enter 4-digit code"
            value={formik.values.otp}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.otp && formik.errors.otp)}
            helperText={formik.touched.otp && formik.errors.otp}
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                pattern: "[0-9]*",
                maxLength: 4,
                style: {
                  textAlign: "center",
                  fontSize: "1.2rem",
                  letterSpacing: "0.5rem",
                },
              },
            }}
            disabled={formik.isSubmitting}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={formik.isSubmitting || !formik.isValid}
          >
            {formik.isSubmitting ? "Verifying..." : "Verify & Sign In"}
          </Button>
        </Stack>
      </Box>

      <Stack
        direction={isMobile ? "column" : "row"}
        justifyContent={"space-between"}
        spacing={2}
        alignItems="center"
      >
        <Stack direction={"row"} spacing={1} alignItems="center">
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Didn't receive the code?
          </Typography>
          <Button
            variant="text"
            onClick={handleResendOTP}
            sx={{ textTransform: "none" }}
            disabled={isResending || formik.isSubmitting}
          >
            {isResending ? "Resending..." : "Resend"}
          </Button>
        </Stack>
        <Button
          variant="text"
          onClick={onCancel}
          sx={{ textTransform: "none" }}
        >
          Back to Login
        </Button>
      </Stack>
    </Stack>
  );
};
