import React, { use, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { Link as RouterLink, useNavigate } from "react-router-dom";

import { PATHS } from "@/navigation/paths";

import { apiClient } from "@/api/apiClient";

import { TOrgSignUpResponse } from "@/types/auth.types";

const MemberSignUpPage: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [tab, setTab] = useState<"normal" | "kfc">("normal");
  const [memberId, setMemberId] = useState("");
  const [email, setEmail] = useState("");
  const [memberSyncLoading, setMemberSyncLoading] = useState(false);
  const [memberSyncSuccess, setMemberSyncSuccess] = useState<string | null>(
    null,
  );
  const [memberData, setMemberData] = useState<any>(null);

  const navigate = useNavigate();

  const handleKFCMemberSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMemberSyncSuccess(null);
    setMemberSyncLoading(true);
    setMemberData(null);
    try {
      // Call the sync API
      const res = await apiClient.post<TOrgSignUpResponse>(
        "/main/v1/organization/sync/",
        {
          member_id: memberId,
          email,
        },
      );
      if (res?.status === "ok") {
        setMemberData(res?.data);
        setMemberSyncSuccess(
          `A registration link will be sent to your email if your member number is valid. Please check your inbox.`,
        );
      } else {
        setMemberSyncSuccess(
          `A registration link will be sent to your email if your member number is valid. Please check your inbox.`,
        );
      }
      setMemberId("");
      setEmail("");
      setTab("normal");
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to send registration link. Please try again.",
      );
    } finally {
      setMemberSyncLoading(false);
    }
  };

  return (
    <Box>
      <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
        <Paper elevation={4} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3 }}>
          <Box sx={{ justifyContent: "center", display: "flex", mb: 3 }}>
            <Box component="img" src="/images/logo.png" alt="logo" sx={{ height: 70 }} />
          </Box>
          <Stack spacing={3}>
            <Stack spacing={1} textAlign="center">
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                KFC Member Registration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter your KFC Member Number to receive a registration link via
                email.
              </Typography>
            </Stack>
            {memberSyncSuccess && (
              <Alert
                severity="success"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>{memberSyncSuccess}</Box>
              </Alert>
            )}
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {memberSyncSuccess && memberData ? (
              <Button
                // size="small"
                variant="outlined"
                sx={{ ml: 2 }}
                disabled={memberSyncLoading}
                onClick={() => {
                  setMemberData(null);
                  setMemberSyncSuccess(null);
                }}
              >
                Retry
              </Button>
            ) : (
              <Box
                component="form"
                onSubmit={(e) => handleKFCMemberSync(e)}
                noValidate
              >
                <Stack spacing={2}>
                  <TextField
                    label="KFC Member Number"
                    name="member_id"
                    required
                    fullWidth
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    disabled={memberSyncLoading}
                  />
                  <TextField
                    label="Primary Email"
                    name="email"
                    type="email"
                    required
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={memberSyncLoading}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={memberSyncLoading || !memberId || !email}
                  >
                    {memberSyncLoading
                      ? "Sending..."
                      : "Send Registration Link"}
                  </Button>
                </Stack>
              </Box>
            )}

            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 2 }}
            >
              Already have an account?{" "}
              <Link component={RouterLink} to={PATHS.LOGIN} underline="hover">
                Sign in
              </Link>
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{ mt: 2 }}
            >
              Not a KFC member?{" "}
              <Link
                component={RouterLink}
                to={PATHS.USER_SIGN_UP}
                underline="hover"
              >
                Sign up as an individual
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default MemberSignUpPage;
