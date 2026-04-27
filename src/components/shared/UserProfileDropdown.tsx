import React from "react";
import { UserProfileMenu } from "@/components/UserProfileMenu";

interface UserProfileDropdownProps {
  size?: "small" | "medium";
  isScrolled?: boolean;
}

export const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  size = "medium",
  isScrolled = false,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <UserProfileMenu
      anchorEl={anchorEl}
      onClose={handleProfileMenuClose}
      onOpen={handleProfileMenuOpen}
      size={size}
      isScrolled={isScrolled}
    />
  );
};
