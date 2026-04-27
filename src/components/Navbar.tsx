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
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { PATHS } from "@/navigation/paths";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Menu, { MenuProps } from "@mui/material/Menu";
import { isAuthUrl } from "@/utils/isAuth";
import { useAuth, useUser, useIsAuthenticated } from "@/hooks/useAuth";
import { logout } from "@/redux/slices/authSlice";
import { AppDispatch } from "@/redux/store";
import { Notify } from "notiflix";
import { UserProfileMenu } from "./UserProfileMenu";
import { CustomContainer } from "@/components/shared/CustomContainer";

const Navbar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [orgAnchorEl, setOrgAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const isHomePage = location.pathname === PATHS.HOME;

  const isAdmin = user?.role?.name?.toLowerCase() === "admin";
  const isInstructor = user?.role?.name?.toLowerCase() === "instructor";
  const isUser = user?.role?.name?.toLowerCase() === "user";
  const isOrgAdmin = user?.role?.name?.toLowerCase() === "org_admin";

  const publicNavItems = [
    { label: "Home", variant: "text" as const, to: PATHS.HOME },
    { label: "Course Catalog", variant: "text" as const, to: PATHS.COURSES },
    location.pathname === PATHS.HOME
      ? {
          label: "Trainings Calendar",
          variant: "text" as const,
          to: "#calendar",
          scrollTo: true,
        }
      : undefined,
  ];
  const authNavItems = [
    // ...publicNavItems,
    { label: "Login", variant: "text" as const, to: PATHS.LOGIN },
    { label: "Sign Up", variant: "contained" as const, to: PATHS.USER_SIGN_UP },
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

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDrawer = (nextOpen: boolean) => () => {
    setIsDrawerOpen(nextOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  const studentNavItems = baseNavItems;
  const getMainNavItems = () => {
    let items: any[] = [];
    if (!isAuthenticated) items = publicNavItems;
    else if (isAdmin) items = adminNavItems;
    else if (isInstructor) items = instructorNavItems;
    else if (isUser) items = studentNavItems;
    return items.filter((item) => Boolean(item));
  };

  const getNavItems = () => {
    let items: any[] = [];
    if (!isAuthenticated) items = [...publicNavItems, ...authNavItems];
    else if (isAdmin) items = adminNavItems;
    else if (isInstructor) items = instructorNavItems;
    else if (isUser) items = studentNavItems;
    return items.filter((item) => Boolean(item));
  };

  const handleOrgMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setOrgAnchorEl(event.currentTarget);
  };

  const handleOrgMenuClose = () => {
    setOrgAnchorEl(null);
  };

  const handleSmoothScroll = (e: React.MouseEvent, to: string) => {
    e.preventDefault();
    const el = document.querySelector(to);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
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
          {getMainNavItems()?.map((item, index) => {
            // If scrollTo is set, use smooth scroll handler
            if (item?.scrollTo && item?.to) {
              return (
                <Button
                  key={item?.label + index}
                  color="inherit"
                  variant="text"
                  onClick={(e) => handleSmoothScroll(e, item.to!)}
                >
                  {item.label}
                </Button>
              );
            }
            const linkProps = item?.to
              ? { component: RouterLink, to: item.to }
              : {};
            return (
              <Button
                key={item?.label || "" + index}
                color="inherit"
                variant="text"
                {...linkProps}
              >
                {item?.label}
              </Button>
            );
          })}

          {/* Organization Menu */}
          {user?.organization && (
            <React.Fragment>
              <Button
                color="inherit"
                variant="text"
                onClick={handleOrgMenuOpen}
                endIcon={<ExpandMoreIcon fontSize="small" />}
              >
                Organization
              </Button>
              <Menu
                anchorEl={orgAnchorEl}
                open={Boolean(orgAnchorEl)}
                onClose={handleOrgMenuClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
              >
                <MenuItem
                  onClick={() => {
                    handleOrgMenuClose();
                    navigate(PATHS.ORG_DASHBOARD);
                  }}
                >
                  <ListItemIcon>
                    <DashboardIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Dashboard</ListItemText>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleOrgMenuClose();
                    navigate(PATHS.ORG_USERS);
                  }}
                >
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Users</ListItemText>
                </MenuItem>
              </Menu>
            </React.Fragment>
          )}
        </Stack>
      </Box>

      {/* Auth Section - Right Aligned */}
      {isAuthenticated ? (
        <UserProfileMenu
          anchorEl={anchorEl}
          onClose={handleProfileMenuClose}
          onOpen={handleProfileMenuOpen}
          isScrolled={isScrolled}
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
            {getNavItems().map((item, index) => {
              if (!item) return null;
              const linkProps = item.to
                ? { component: RouterLink, to: item.to }
                : {};

              return (
                <Button
                  key={item?.label || "" + index}
                  color={item?.variant === "contained" ? "primary" : "inherit"}
                  variant={item?.variant === "contained" ? "contained" : "text"}
                  sx={{ justifyContent: "flex-start" }}
                  fullWidth
                  {...linkProps}
                >
                  {item?.label}
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

  const isTransparent = isHomePage && !isScrolled;

  return (
    <AppBar
      position="fixed"
      elevation={isTransparent ? 0 : 1}
      sx={{
        backgroundColor: isTransparent ? "transparent" : "background.paper",
        transition: "all 0.3s ease-in-out",
        color: isTransparent ? "white" : "text.primary",
      }}
    >
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
                  ? "/images/logos/vertical_logo.png"
                  : "/images/logos/horizontal_logo.png"
              }
              alt="logo"
              style={{ height: 80, width: "auto", padding: "10px 0" }}
            />
          </Box>

          {isMobile ? renderMobileNav() : renderDesktopNav()}
        </Toolbar>
      </CustomContainer>
    </AppBar>
  );
};

export default Navbar;
