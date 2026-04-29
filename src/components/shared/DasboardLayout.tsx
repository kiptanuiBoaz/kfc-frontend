import React from "react";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/navigation/paths";
import { useUser } from "@/hooks/useAuth";
import { MenuItem } from "@/navigation/dashboard-menus";
import { UserProfileDropdown } from "@/components/shared/UserProfileDropdown";

const drawerWidth = 260;

interface DashboardLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  component?: React.ComponentType<any>;
  componentProps?: Record<string, any>;
  menuItems: MenuItem[];
  userRole: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  title,
  subtitle,
  actions,
  children,
  component: Component,
  componentProps = {},
  menuItems,
  userRole,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUser();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const isAdminRoute = location.pathname.startsWith(
    PATHS.ADMIN_DASHBOARD.replace("/*", ""),
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ p: 3 }}>
        <Typography
          component={Link}
          variant="h6"
          href="/"
          sx={{
            fontWeight: 700,
            color: theme.palette.primary.main,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box component="span" sx={{ display: "inline-flex" }}>
            <img src="/images/logo.png" alt="logo" style={{ height: 36 }} />
          </Box>
          KFC Academy
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.title} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  navigate(item.path);
                  setMobileOpen(false);
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 3 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate(PATHS.HOME)}
        >
          Back to site
        </Button>
      </Box>
    </Box>
  );

  const renderContent = () => {
    if (Component) {
      return <Component {...componentProps} />;
    }
    return children;
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.palette.grey[50],
      }}
    >
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, minHeight: "100vh" }}>
        <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{
            backgroundColor: "background.paper",
            borderBottom: `1px solid ${theme.palette.divider}`,
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <Toolbar sx={{ px: { xs: 2, md: 4 }, height: 70 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Desktop Navigation Links */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                gap: 4,
              }}
            >
              {[
                { label: "Home", path: PATHS.HOME },
                { label: "Course Catalog", path: PATHS.COURSES },
                {
                  label: isAdminRoute
                    ? user?.organization?.org_name || "Admin Dashboard"
                    : "Dashboard",
                  path: location.pathname,
                },
              ].map((link) => (
                <Typography
                  key={link.label}
                  component={Link}
                  href={link.path}
                  sx={{
                    color:
                      location.pathname === link.path
                        ? "text.primary"
                        : "text.secondary",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    transition: "color 0.2s",
                    "&:hover": { color: "primary.main" },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Box>

            <UserProfileDropdown />
          </Toolbar>
        </AppBar>
        <Box sx={{ p: { xs: 2, md: 4 } }}>{renderContent()}</Box>
      </Box>
    </Box>
  );
};
