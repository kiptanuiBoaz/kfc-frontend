import React from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

const socialLinks = [
  { label: "Facebook", icon: <FacebookIcon />, href: "https://facebook.com" },
  { label: "Twitter", icon: <TwitterIcon />, href: "https://twitter.com" },
  {
    label: "Instagram",
    icon: <InstagramIcon />,
    href: "https://instagram.com",
  },
  { label: "LinkedIn", icon: <LinkedInIcon />, href: "https://linkedin.com" },
];

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isDashboardOrOrg = 
    location.pathname.startsWith("/org") || 
    location.pathname.startsWith("/dashboard") || 
    location.pathname.startsWith("/instructor");

  return (
    <Box
      component="footer"
      sx={{ 
        bgcolor: "grey.100", 
        mt: 8, 
        pt: 4, 
        px: 0, 
        pb: 2,
        pl: isDashboardOrOrg ? { xs: 0, md: "260px" } : 0,
        transition: "padding-left 0.3s ease",
      }}
    >
      <Container maxWidth="lg">
        <Divider
          flexItem
          sx={{ display: { xs: "none", md: "block" }, my: 2 }}
        />
        <Stack
          direction="column"
          spacing={2.5}
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 3, textAlign: "center" }}
        >
          <Stack spacing={0.5} alignItems="center">
            <Typography variant="body1" fontWeight={600} textAlign="center">
              The KFC Training Academy is supported by the Import Promotion Desk
              (IPD)
            </Typography>
          </Stack>
          <Box
            component="img"
            src="/images/ipd.png"
            alt="Import Promotion Desk (IPD)"
            sx={{ height: 64, width: "auto" }}
          />
        </Stack>

        <Stack 
          direction="column" 
          alignItems="center" 
          justifyContent="center" 
          spacing={1.5}
        >
          <Typography
            textAlign="center"
            variant="body2"
            color="text.secondary"
          >
            © {currentYear} KFC. All rights reserved.
          </Typography>{" "}
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
          >
            {socialLinks.map((social) => (
              <IconButton
                size="small"
                key={social.label}
                component="a"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                aria-label={social.label}
              >
                {social.icon}
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
