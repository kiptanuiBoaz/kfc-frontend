import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  TextField,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Chip,
  useMediaQuery,
} from "@mui/material";
import {
  CheckCircle,
  CreditCard,
  Smartphone,
  ArrowLeft,
  Lock,
  Copy,
  Percent,
  Check,
  RotateCw,
  Shield,
  Zap,
  AlertCircle,
  Clock,
  Award,
  Gift,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { TCourse } from "@/types/course.types";
import { CustomContainer } from "@/components/shared/CustomContainer";
import { Notify } from "notiflix";
import { useUser, useIsAuthenticated } from "@/hooks/useAuth";
import { PATHS } from "@/navigation/paths";
import { toSentenceCase } from "@/utils/toSentenceCase";

const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || "";

export const EnrollCourse = () => {
  const { courseGuid } = useParams<{ courseGuid: string }>();
  const navigate = useNavigate();
  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Navigation / Tabs state
  const [paymentTab, setPaymentTab] = useState(0); // 0 = M-Pesa, 1 = Card
  const [mpesaMethod, setMpesaMethod] = useState<"stk" | "paybill">("stk");

  // Input states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Card input states
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Animation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");

  const {
    data: course,
    isLoading: isCourseLoading,
    isError: isCourseError,
  } = useQuery<TCourse | undefined>({
    queryKey: ["courseDetails", courseGuid],
    enabled: !!courseGuid,
    queryFn: async () => await apiClient.get<TCourse>(`/main/v1/courses/${courseGuid}/`),
  });

  if (!courseGuid) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Missing course identifier in the URL</Alert>
      </Container>
    );
  }

  if (isCourseLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack alignItems="center" py={8} spacing={2}>
          <CircularProgress size={50} />
          <Typography variant="h6" color="text.secondary">
            Loading checkout details...
          </Typography>
        </Stack>
      </Container>
    );
  }

  if (isCourseError || !course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack alignItems="center" py={8} spacing={2}>
          <AlertCircle size={48} color={theme.palette.error.main} />
          <Typography variant="h6" fontWeight={700}>
            Unable to Load Course
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            We couldn't load the course details. Please refresh and try again.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{ mt: 2 }}
          >
            Refresh Page
          </Button>
        </Stack>
      </Container>
    );
  }

  // Calculate pricing dynamics
  const rawPrice = course.isPaid && course.amount ? parseFloat(course.amount) : 0;
  const currentTotal = Math.max(0, rawPrice - discountAmount);

  // Handle mock promo codes
  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === "KFC50" || code === "WELCOME") {
      const discount = rawPrice * 0.5; // 50% discount
      setDiscountAmount(discount);
      setPromoApplied(true);
      Notify.success("✨ 50% discount applied successfully!");
    } else if (code === "FREEPASS") {
      setDiscountAmount(rawPrice);
      setPromoApplied(true);
      Notify.success("🎉 100% discount applied successfully!");
    } else {
      Notify.failure("Invalid promo code. Try KFC50 or WELCOME.");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Notify.success("Copied to clipboard!");
  };

  // Simulate payment processing flow
  const handleEnrollment = async () => {
    if (!isAuthenticated) {
      Notify.failure("Please log in to complete your enrollment.");
      navigate(PATHS.LOGIN);
      return;
    }

    if (!user) {
      Notify.failure("Please log in to complete your enrollment.");
      return;
    }

    // Check if course is paid and validate payment method
    if (course.isPaid && rawPrice > 0) {
      if (paymentTab === 0 && mpesaMethod === "stk") {
        if (!phoneNumber.match(/^(?:254|\+254|0)?(7|1)\d{8}$/)) {
          Notify.failure("Please enter a valid Kenyan phone number.");
          return;
        }
      } else if (paymentTab === 1) {
        if (
          cardNumber.replace(/\s/g, "").length < 16 ||
          cardName.length < 3 ||
          cardExpiry.length < 5 ||
          cardCvv.length < 3
        ) {
          Notify.failure("Please fill in all credit card details correctly.");
          return;
        }
      }
    }

    setIsProcessing(true);

    try {
      if (course.isPaid && rawPrice > 0) {
        if (paymentTab === 0 && mpesaMethod === "stk") {
          setProcessingStep("Initiating M-Pesa STK Push...");
          await new Promise((r) => setTimeout(r, 1500));
          setProcessingStep("Waiting for user to enter PIN on mobile...");
          await new Promise((r) => setTimeout(r, 2000));
          setProcessingStep("Confirming transaction with Safaricom...");
          await new Promise((r) => setTimeout(r, 1500));
        } else if (paymentTab === 1) {
          setProcessingStep("Securing connection with payment gateway...");
          await new Promise((r) => setTimeout(r, 1500));
          setProcessingStep("Authorizing card payment...");
          await new Promise((r) => setTimeout(r, 2000));
          setProcessingStep("Processing transaction...");
          await new Promise((r) => setTimeout(r, 1000));
        } else {
          setProcessingStep("Verifying Manual Paybill transaction...");
          await new Promise((r) => setTimeout(r, 2000));
        }
      } else {
        setProcessingStep("Processing free course enrollment...");
        await new Promise((r) => setTimeout(r, 1000));
      }

      await apiClient.post(`/main/v1/enroll/`, {
        course: course.guid,
        user: user.guid,
      });

      Notify.success("🎉 Enrollment successful! Welcome to the course.");
      setTimeout(() => {
        navigate(PATHS.MY_COURSES);
      }, 1500);
    } catch (error) {
      Notify.failure(
        "Enrollment failed. Please check your information and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to format Card Number with spaces
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
    setCardNumber(formatted);
  };

  // Format expiry MM/YY
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardExpiry(value);
  };

  const courseImage = (() => {
    if (!course.image) return "/images/logos/horizontal_logo.png";
    if (course.image.startsWith("http") || course.image.startsWith("/")) {
      return course.image;
    }
    return `${MEDIA_BASE_URL}${course.image}`;
  })();

  return (
    <CustomContainer>
      {/* Step Stepper Navigation */}
      <Box sx={{ mb: 5, mt: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={3}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              mr: 1,
              color: theme.palette.primary.main,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              Complete Your Enrollment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Secure checkout in 3 simple steps
            </Typography>
          </Box>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: isMobile ? 1.5 : 2,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            background: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: "blur(10px)",
          }}
        >
          <Grid container spacing={isMobile ? 1 : 2} justifyContent="center" alignItems="center">
            <Grid item xs={4}>
              <Stack
                direction="row"
                spacing={isMobile ? 0.5 : 1.5}
                alignItems="center"
                justifyContent="center"
              >
                <Box
                  sx={{
                    width: isMobile ? 24 : 28,
                    height: isMobile ? 24 : 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "success.light",
                    color: "success.contrastText",
                    flexShrink: 0,
                  }}
                >
                  <Check size={isMobile ? 12 : 16} />
                </Box>
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  fontWeight={600}
                  color="text.secondary"
                  sx={{ display: isMobile ? "none" : "block" }}
                >
                  Review
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={4}>
              <Stack
                direction="row"
                spacing={isMobile ? 0.5 : 1.5}
                alignItems="center"
                justifyContent="center"
              >
                <Box
                  sx={{
                    width: isMobile ? 24 : 28,
                    height: isMobile ? 24 : 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 700,
                    fontSize: isMobile ? "0.65rem" : "1rem",
                    flexShrink: 0,
                  }}
                >
                  2
                </Box>
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  fontWeight={700}
                  color="primary"
                  sx={{ display: isMobile ? "none" : "block" }}
                >
                  Checkout
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={4}>
              <Stack
                direction="row"
                spacing={isMobile ? 0.5 : 1.5}
                alignItems="center"
                justifyContent="center"
              >
                <Box
                  sx={{
                    width: isMobile ? 24 : 28,
                    height: isMobile ? 24 : 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.text.disabled, 0.1),
                    color: "text.disabled",
                    fontWeight: 700,
                    fontSize: isMobile ? "0.65rem" : "1rem",
                    flexShrink: 0,
                  }}
                >
                  3
                </Box>
                <Typography
                  variant={isMobile ? "caption" : "body2"}
                  fontWeight={600}
                  color="text.disabled"
                  sx={{ display: isMobile ? "none" : "block" }}
                >
                  Access
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Main Checkout Grid */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {/* Left Column: Payment Portal */}
        <Grid item xs={12} md={7} lg={8}>
          <Paper
            elevation={2}
            sx={{
              p: isMobile ? 2.5 : 4,
              borderRadius: 4,
              border: `1px solid ${theme.palette.divider}`,
              minHeight: 520,
              position: "relative",
            }}
          >
            {isProcessing && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  bgcolor: alpha(theme.palette.background.paper, 0.95),
                  zIndex: 10,
                  borderRadius: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  backdropFilter: "blur(4px)",
                }}
              >
                <CircularProgress
                  size={isMobile ? 48 : 64}
                  thickness={4}
                  sx={{ mb: 3 }}
                />
                <Typography
                  variant="h6"
                  fontWeight={700}
                  textAlign="center"
                  gutterBottom
                >
                  Processing Secure Payment
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mb: 2 }}
                >
                  {processingStep}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  Please do not close or refresh this tab.
                </Typography>
              </Box>
            )}

            {!course.isPaid ? (
              // Free Course Enrollment
              <Stack spacing={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto",
                      mb: 2,
                    }}
                  >
                    <Gift size={36} color={theme.palette.success.main} />
                  </Box>
                  <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                    Free Course
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This course is free! Complete your enrollment to get instant access to all course materials.
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
                    What You'll Get:
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          color: "primary.main",
                          mt: 0.5,
                          display: "flex",
                          flexShrink: 0,
                        }}
                      >
                        <CheckCircle size={20} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Instant Access
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Get access to all course modules and topics immediately
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          color: "primary.main",
                          mt: 0.5,
                          display: "flex",
                          flexShrink: 0,
                        }}
                      >
                        <Award size={20} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Certificate of Completion
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Earn a certificate when you complete the course
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box
                        sx={{
                          color: "primary.main",
                          mt: 0.5,
                          display: "flex",
                          flexShrink: 0,
                        }}
                      >
                        <Clock size={20} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Learn at Your Pace
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Study whenever and wherever you want
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Box>

                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleEnrollment}
                  disabled={isProcessing}
                  sx={{
                    py: 2,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    borderRadius: 3,
                    boxShadow: theme.shadows[4],
                  }}
                >
                  {isProcessing ? (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <CircularProgress size={20} color="inherit" />
                      <span>Enrolling...</span>
                    </Stack>
                  ) : (
                    "Enroll Now for Free"
                  )}
                </Button>
              </Stack>
            ) : (
              // Paid Course - Payment Options
              <>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Choose Payment Method
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Select your preferred secure payment portal below to complete checkout.
                </Typography>

                <Tabs
                  value={paymentTab}
                  onChange={(_, val) => setPaymentTab(val)}
                  variant="fullWidth"
                  sx={{
                    mb: 4,
                    borderBottom: 1,
                    borderColor: "divider",
                    "& .MuiTab-root": {
                      py: isMobile ? 1.5 : 2,
                      textTransform: "none",
                      fontSize: isMobile ? "0.9rem" : "1rem",
                    },
                  }}
                >
                  <Tab
                    icon={<Smartphone size={18} />}
                    iconPosition="start"
                    label={isMobile ? "M-Pesa" : "M-Pesa Mobile Money"}
                  />
                  <Tab
                    icon={<CreditCard size={18} />}
                    iconPosition="start"
                    label={isMobile ? "Card" : "Credit / Debit Card"}
                  />
                </Tabs>

                {/* TAB 1: M-PESA */}
                {paymentTab === 0 && (
                  <Stack spacing={4}>
                    <Stack
                      direction={isMobile ? "column" : "row"}
                      spacing={2}
                      justifyContent="center"
                    >
                      <Button
                        variant={mpesaMethod === "stk" ? "contained" : "outlined"}
                        onClick={() => setMpesaMethod("stk")}
                        fullWidth
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          py: 1.2,
                        }}
                      >
                        Direct STK Push Prompt
                      </Button>
                      <Button
                        variant={mpesaMethod === "paybill" ? "contained" : "outlined"}
                        onClick={() => setMpesaMethod("paybill")}
                        fullWidth
                        sx={{
                          textTransform: "none",
                          borderRadius: 2,
                          py: 1.2,
                        }}
                      >
                        Manual Paybill Guide
                      </Button>
                    </Stack>

                    {mpesaMethod === "stk" ? (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          Enter your Safaricom active mobile number. We will send an
                          instant direct STK prompt to your phone to enter your M-Pesa
                          PIN.
                        </Typography>

                        <Stack spacing={3}>
                          <TextField
                            fullWidth
                            label="M-Pesa Phone Number"
                            placeholder="e.g., 0712345678 or 254712345678"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            variant="outlined"
                            disabled={isProcessing}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Smartphone
                                    size={20}
                                    color={theme.palette.text.secondary}
                                  />
                                </InputAdornment>
                              ),
                            }}
                          />

                          <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleEnrollment}
                            disabled={
                              !phoneNumber || isProcessing || currentTotal <= 0
                            }
                            sx={{
                              py: 1.8,
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              borderRadius: 3,
                              boxShadow: theme.shadows[4],
                            }}
                          >
                            {isProcessing ? (
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                justifyContent="center"
                              >
                                <CircularProgress
                                  size={20}
                                  color="inherit"
                                />
                                <span>Processing...</span>
                              </Stack>
                            ) : (
                              "Request Direct M-Pesa Prompt"
                            )}
                          </Button>
                        </Stack>
                      </Box>
                    ) : (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 3 }}
                        >
                          Follow these steps to pay manually using Safaricom Paybill:
                        </Typography>

                        <Card
                          variant="outlined"
                          sx={{
                            p: isMobile ? 2 : 3,
                            borderRadius: 3,
                            bgcolor: alpha(
                              theme.palette.background.paper,
                              0.4
                            ),
                            mb: 3,
                          }}
                        >
                          <Stack spacing={2.5}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  BUSINESS PAYBILL NUMBER
                                </Typography>
                                <Typography
                                  variant="h5"
                                  fontWeight={800}
                                  sx={{ letterSpacing: 1 }}
                                >
                                  123456
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => copyToClipboard("123456")}
                                title="Copy"
                              >
                                <Copy size={16} />
                              </IconButton>
                            </Stack>

                            <Divider />

                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ACCOUNT NUMBER (COURSE REF)
                                </Typography>
                                <Typography
                                  variant="h5"
                                  fontWeight={800}
                                  sx={{ letterSpacing: 1 }}
                                >
                                  {course.guid?.slice(0, 8).toUpperCase() ||
                                    "COURSE001"}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  copyToClipboard(
                                    course.guid?.slice(0, 8).toUpperCase() ||
                                      "COURSE001"
                                  )
                                }
                                title="Copy"
                              >
                                <Copy size={16} />
                              </IconButton>
                            </Stack>

                            <Divider />

                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  TOTAL AMOUNT PAYABLE
                                </Typography>
                                <Typography
                                  variant="h5"
                                  fontWeight={800}
                                  color="primary"
                                >
                                  {course.currency || "USD"}{" "}
                                  {currentTotal.toFixed(2)}
                                </Typography>
                              </Box>
                            </Stack>
                          </Stack>
                        </Card>

                        <Alert
                          severity="info"
                          sx={{ mb: 3, borderRadius: 2 }}
                          icon={<AlertCircle size={20} />}
                        >
                          <Typography variant="body2">
                            Open M-Pesa Menu → Lipa na M-Pesa → Pay Bill →
                            Enter Business No. <strong>123456</strong> → Enter
                            Account No.{" "}
                            <strong>
                              {course.guid?.slice(0, 8).toUpperCase() ||
                                "COURSE001"}
                            </strong>{" "}
                            → Enter exact Amount → Complete.
                          </Typography>
                        </Alert>

                        <Button
                          variant="contained"
                          size="large"
                          fullWidth
                          onClick={handleEnrollment}
                          disabled={isProcessing}
                          sx={{
                            py: 1.8,
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            borderRadius: 3,
                          }}
                        >
                          {isProcessing ? (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <CircularProgress
                                size={20}
                                color="inherit"
                              />
                              <span>Processing...</span>
                            </Stack>
                          ) : (
                            "I Have Completed the Manual Payment"
                          )}
                        </Button>
                      </Box>
                    )}
                  </Stack>
                )}

                {/* TAB 2: CREDIT CARD */}
                {paymentTab === 1 && (
                  <Stack spacing={4}>
                    {/* Elegant 3D Flip Credit Card CSS Mockup */}
                    {!isMobile && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          perspective: "1000px",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            width: 320,
                            height: 190,
                            position: "relative",
                            transformStyle: "preserve-3d",
                            transition:
                              "transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                            transform: isCardFlipped
                              ? "rotateY(180deg)"
                              : "rotateY(0deg)",
                            borderRadius: 4,
                            boxShadow:
                              "0 15px 35px rgba(0,0,0,0.2)",
                          }}
                        >
                    {/* Front Face */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                        borderRadius: 4,
                        p: 3,
                        color: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ width: 44, height: 32, bgcolor: alpha("#fff", 0.2), borderRadius: 1 }} />
                        <Typography variant="body2" fontWeight={800} sx={{ opacity: 0.8 }}>
                          SECURE VISA
                        </Typography>
                      </Stack>

                      <Typography
                        variant="h5"
                        fontWeight={700}
                        sx={{ letterSpacing: 3, textAlign: "center", my: 1, fontFamily: "monospace" }}
                      >
                        {cardNumber || "•••• •••• •••• ••••"}
                      </Typography>

                      <Stack direction="row" justifyContent="space-between">
                        <Box>
                          <Typography variant="caption" sx={{ fontSize: "0.65rem", opacity: 0.6 }}>
                            CARD HOLDER
                          </Typography>
                          <Typography variant="body2" fontWeight={600} sx={{ textTransform: "uppercase" }}>
                            {cardName || "YOUR NAME HERE"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ fontSize: "0.65rem", opacity: 0.6 }}>
                            EXPIRES
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {cardExpiry || "MM/YY"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* Back Face */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        background: "linear-gradient(135deg, #2a5298 0%, #1e3c72 100%)",
                        borderRadius: 4,
                        p: 3,
                        color: "#fff",
                        transform: "rotateY(180deg)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ width: "100%", height: 38, bgcolor: "#111", mx: -3, mt: 1 }} />

                      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mt: 2 }}>
                        <Box
                          sx={{
                            width: "70%",
                            height: 28,
                            bgcolor: alpha("#fff", 0.9),
                            borderRadius: 1,
                            mr: 2,
                            backgroundImage: "repeating-linear-gradient(45deg, #ccc, #ccc 10px, #eee 10px, #eee 20px)",
                          }}
                        />
                        <Box
                          sx={{
                            width: "20%",
                            height: 28,
                            bgcolor: alpha("#fff", 0.2),
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography variant="body2" fontWeight={800} color="#fff">
                            {cardCvv || "CVV"}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="caption" sx={{ fontSize: "0.55rem", opacity: 0.5, textAlign: "center", mb: 0.5 }}>
                        Authorized Signature. Not transferable. Secured checkout by Safepay.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                    )}

                    {/* Form fields */}
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Cardholder Full Name"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        variant="outlined"
                        disabled={isProcessing}
                        onFocus={() => setIsCardFlipped(false)}
                      />

                      <TextField
                        fullWidth
                        label="Card Number"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        variant="outlined"
                        disabled={isProcessing}
                        onFocus={() => setIsCardFlipped(false)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CreditCard size={20} color={theme.palette.text.secondary} />
                            </InputAdornment>
                          ),
                        }}
                      />

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Expiry Date"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            variant="outlined"
                            disabled={isProcessing}
                            onFocus={() => setIsCardFlipped(false)}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Security CVV"
                            placeholder="123"
                            type="password"
                            value={cardCvv}
                            onChange={(e) =>
                              setCardCvv(
                                e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 3)
                              )
                            }
                            variant="outlined"
                            disabled={isProcessing}
                            onFocus={() => setIsCardFlipped(true)}
                            onBlur={() => setIsCardFlipped(false)}
                          />
                        </Grid>
                      </Grid>

                      <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        onClick={handleEnrollment}
                        disabled={isProcessing || currentTotal <= 0}
                        sx={{
                          py: 1.8,
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          borderRadius: 3,
                        }}
                      >
                        {isProcessing ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <CircularProgress
                              size={20}
                              color="inherit"
                            />
                            <span>Processing...</span>
                          </Stack>
                        ) : (
                          `Pay ${course.currency || "USD"} ${currentTotal.toFixed(
                            2
                          )} Securely`
                        )}
                      </Button>
                    </Stack>
                  </Stack>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Sticky Summary & Guarantees */}
        <Grid item xs={12} md={5} lg={4}>
          <Stack spacing={3} sx={{ position: "sticky", top: 24 }}>
            {/* Sticky summary paper */}
            <Paper
              elevation={2}
              sx={{
                p: isMobile ? 2.5 : 3,
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 2.5 }}
              >
                Order Summary
              </Typography>

              {/* Course details card preview */}
              <Card
                sx={{
                  display: "flex",
                  mb: 3,
                  borderRadius: 2,
                  overflow: "hidden",
                  elevation: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <CardMedia
                  component="img"
                  sx={{
                    width: isMobile ? "100%" : 100,
                    height: isMobile ? 150 : 100,
                    objectFit: "cover",
                  }}
                  image={courseImage}
                  alt={course.title}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    p: 1.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    gutterBottom
                    sx={{ lineHeight: 1.2 }}
                  >
                    {course.title.length > 40
                      ? `${course.title.slice(0, 40)}...`
                      : course.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {course.description}
                  </Typography>
                  {course.expertise_level && (
                    <Chip
                      label={toSentenceCase(course.expertise_level)}
                      size="small"
                      sx={{ mt: 1, width: "fit-content" }}
                      variant="outlined"
                    />
                  )}
                </Box>
              </Card>

              {/* Promo input field */}
              {course.isPaid && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                    Promo Code
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied || isProcessing}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Percent size={16} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            onClick={handleApplyPromo}
                            disabled={
                              !promoCode || promoApplied || isProcessing
                            }
                            size="small"
                            sx={{
                              textTransform: "none",
                              minWidth: 60,
                            }}
                          >
                            {promoApplied ? "Applied" : "Apply"}
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                  {promoApplied && (
                    <Typography
                      variant="caption"
                      color="success.main"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      ✓ Promo Applied! You save {course.currency || "USD"}{" "}
                      {discountAmount.toFixed(2)}
                    </Typography>
                  )}
                </Box>
              )}

              {course.isPaid && <Divider sx={{ my: 2 }} />}

              {/* Price Breakdown */}
              {course.isPaid && (
                <Stack spacing={2} sx={{ mb: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Course Price
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {course.currency || "USD"} {rawPrice.toFixed(2)}
                    </Typography>
                  </Box>

                  {discountAmount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="success.main">
                        Promo Discount
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="success.main"
                      >
                        -{course.currency || "USD"} {discountAmount.toFixed(2)}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">
                      Processing Fee
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color="success.main"
                    >
                      FREE
                    </Typography>
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      Total Amount
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="primary">
                      {course.currency || "USD"} {currentTotal.toFixed(2)}
                    </Typography>
                  </Box>
                </Stack>
              )}
            </Paper>

            {/* Guarantees Box */}
            <Paper
              elevation={0}
              sx={{
                p: isMobile ? 2.5 : 3,
                borderRadius: 4,
                border: `1px solid ${theme.palette.divider}`,
                background: alpha(theme.palette.background.paper, 0.4),
              }}
            >
              <Stack spacing={2.5}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ color: "primary.main", mt: 0.3, flexShrink: 0 }}>
                    <Lock size={18} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      SSL Secured Checkout
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Your information is protected by industry standard 256-bit encryption.
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ color: "primary.main", mt: 0.3, flexShrink: 0 }}>
                    <CheckCircle size={18} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Instant Course Access
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Access all modules and topics immediately after transaction approval.
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box sx={{ color: "primary.main", mt: 0.3, flexShrink: 0 }}>
                    <Zap size={18} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Learn Anytime, Anywhere
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Access your courses on any device, online or offline.
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </CustomContainer>
  );
};
