import React from "react";
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

  return (
    <Box
      component="footer"
      sx={{ bgcolor: "grey.100", mt: 8, pt: 4, px: 0, pb: 2 }}
    >
      <Container maxWidth="lg">
        <Divider
          flexItem
          sx={{ display: { xs: "none", md: "block" }, my: 2 }}
        />
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3, textAlign: { xs: "center", md: "left" } }}
        >
          <Stack spacing={0.5}>
            <Typography variant="body1" fontWeight={600}>
              The FPC Training Academy is supported by the Import Promotion Desk
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

        <Stack direction={["column", "row"]} justifyContent={"space-between"}>
          <Typography
            textAlign={[, "center", "left"]}
            variant="body2"
            color="text.secondary"
          >
            © {currentYear} FPC Academy. All rights reserved.
          </Typography>{" "}
          <Stack
            direction="row"
            spacing={1}
            justifyContent={{ xs: "center", md: "flex-start" }}
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
