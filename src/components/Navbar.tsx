import React from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { PATHS } from "@/navigation/paths";
import { isAuthUrl } from "@/utils/isAuth";
import { useAuth, useUser, useIsAuthenticated } from "@/hooks/useAuth";
import { logout } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
import { Notify } from "notiflix";
import { UserProfileMenu } from "./UserProfileMenu";
import { CustomContainer } from "@/components/shared/CustomContainer";

const publicNavItems = [
  { label: "Home", variant: "text" as const, to: PATHS.HOME },
  { label: "Course Catalog", variant: "text" as const, to: PATHS.COURSES },
];

const authNavItems = [
  // ...publicNavItems,
  { label: "Login", variant: "text" as const, to: PATHS.LOGIN },
  { label: "Sign Up", variant: "contained" as const, to: PATHS.SIGN_UP },
];

const baseNavItems = [
  ...publicNavItems,
  {
    label: "My Learning",
    variant: "text" as const,
    to: PATHS.MY_COURSES,
  },
];

const instructorNavItems = [
  ...publicNavItems,

  // {
  //   label: "Dashboard",
  //   variant: "text" as const,
  //   to: PATHS.INSTRUCTOR_DASHBOARD,
  // },
  {
    label: "My Courses",
    variant: "text" as const,
    to: PATHS.INSTRUCTOR_COURSE_LIST,
  },
];

const adminNavItems = [
  ...publicNavItems,

  {
    label: "Admin Dashboard",
    variant: "text" as const,
    to: PATHS.ADMIN_DASHBOARD,
  },
];

const studentNavItems = baseNavItems;

const Navbar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  const isAdmin = user?.role?.name?.toLowerCase() === "admin";
  const isInstructor = user?.role?.name?.toLowerCase() === "instructor";
  const isUser = user?.role?.name?.toLowerCase() === "user";

  const toggleDrawer = (nextOpen: boolean) => () => {
    setIsDrawerOpen(nextOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const getMainNavItems = () => {
    if (!isAuthenticated) return publicNavItems;
    if (isAdmin) return adminNavItems;
    if (isInstructor) return instructorNavItems;
    if (isUser) return studentNavItems;
  };

  const getNavItems = () => {
    if (!isAuthenticated) return [...publicNavItems, ...authNavItems];
    if (isAdmin) return adminNavItems;
    if (isInstructor) return instructorNavItems;
    if (isUser) return studentNavItems;
  };

  const renderDesktopNav = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        justifyContent: "space-between",
      }}
    >
      {/* Navigation Links - Centered */}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
        <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
          {getMainNavItems().map((item) => {
            const linkProps = item.to
              ? { component: RouterLink, to: item.to }
              : {};

            return (
              <Button
                key={item.label}
                color="inherit"
                variant="text"
                {...linkProps}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      </Box>

      {/* Auth Section - Right Aligned */}
      {isAuthenticated ? (
        <UserProfileMenu
          anchorEl={anchorEl}
          onClose={handleProfileMenuClose}
          onOpen={handleProfileMenuOpen}
        />
      ) : (
        <Stack direction="row" spacing={2}>
          {authNavItems.map((item) => {
            const linkProps = item.to
              ? { component: RouterLink, to: item.to }
              : {};

            return (
              <Button
                key={item.label}
                color={item.variant === "contained" ? "primary" : "inherit"}
                variant={item.variant === "contained" ? "contained" : "text"}
                {...linkProps}
              >
                {item.label}
              </Button>
            );
          })}
        </Stack>
      )}
    </Box>
  );

  const renderMobileNav = () => (
    <React.Fragment>
      {/* Mobile Profile/Menu Button */}
      {isAuthenticated ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UserProfileMenu
            anchorEl={anchorEl}
            onClose={handleProfileMenuClose}
            onOpen={handleProfileMenuOpen}
            size="small"
          />
          <IconButton
            edge="end"
            color="inherit"
            aria-label="open navigation"
            onClick={toggleDrawer(true)}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      ) : (
        <IconButton
          edge="end"
          color="inherit"
          aria-label="open navigation"
          onClick={toggleDrawer(true)}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
        ModalProps={{ keepMounted: true }}
      >
        <Box
          role="presentation"
          sx={{ width: 280, py: 2, px: 2 }}
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Menu
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5}>
            {getNavItems().map((item) => {
              const linkProps = item.to
                ? { component: RouterLink, to: item.to }
                : {};

              return (
                <Button
                  key={item.label}
                  color={item.variant === "contained" ? "primary" : "inherit"}
                  variant={item.variant === "contained" ? "contained" : "text"}
                  sx={{ justifyContent: "flex-start" }}
                  fullWidth
                  {...linkProps}
                >
                  {item.label}
                </Button>
              );
            })}

            {/* Mobile Auth Actions for Authenticated Users */}
            {isAuthenticated && (
              <>
                <Divider sx={{ my: 1 }} />
                <Button
                  onClick={() => {
                    toggleDrawer(false)();
                    // Navigate to profile page when available
                    console.log("Navigate to profile");
                  }}
                  sx={{ justifyContent: "flex-start" }}
                  fullWidth
                  startIcon={<AccountCircleIcon />}
                >
                  View Profile
                </Button>
                <Button
                  onClick={() => {
                    toggleDrawer(false)();
                    dispatch(logout());
                    Notify.success("Logged out successfully");
                    navigate(PATHS.HOME);
                  }}
                  sx={{ justifyContent: "flex-start" }}
                  fullWidth
                  color="error"
                  startIcon={<LogoutIcon />}
                >
                  Sign Out
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Drawer>
    </React.Fragment>
  );
  if (isAuthUrl(window.location.pathname)) return <></>;
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <CustomContainer>
        <Toolbar
          disableGutters
          sx={{
            // py: 1,
            display: "flex",
            alignItems: "center",
            width: "100%",
            justifyContent: { xs: "space-between", md: "flex-start" },
            columnGap: { md: 1 },
          }}
        >
          <Box href="/" component={Link} sx={{ display: "inline-flex" }}>
            <img
              src={
                isMobile
                  ? "/images/logo.png"
                  : "/images/logos/horizontal_logo.jpeg"
              }
              alt="logo"
              style={{ height: 80, width: "auto" }}
            />
          </Box>

          {isMobile ? renderMobileNav() : renderDesktopNav()}
        </Toolbar>
      </CustomContainer>
    </AppBar>
  );
};

export default Navbar;
