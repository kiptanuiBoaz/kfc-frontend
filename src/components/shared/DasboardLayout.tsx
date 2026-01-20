import React from "react";
import {
  AppBar,
  Avatar,
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
        {/* <AppBar
          position="sticky"
          color="inherit"
          elevation={0}
          sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
        >
          <Toolbar sx={{ px: 3 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {actions}
          </Toolbar>
        </AppBar> */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>{renderContent()}</Box>
      </Box>
    </Box>
  );
};
