"use client";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";

function SideNav({ isOpen, activeRoute }) {
  const router = useRouter();

  const handleNavigation = (route) => {
    router.push(route);
  };

  // Active route highlight style
  const activeStyle = {
    backgroundColor: "#374151",
    borderRadius: "8px",
  };

  // Hover effect style
  const hoverStyle = {
    "&:hover": {
      background: "linear-gradient(to right, #0f2027, #203a43, #2c5364)",
      borderRadius: "8px",
      cursor: "pointer",
    },
  };

  return (
    <Box
      sx={{
        width: isOpen ? 200 : 80,
        transition: "width 0.3s",
        backgroundColor: "#1F2937",
        color: "white",
        display: "flex",
        flexDirection: "column",
              padding: "10px",
      }}
    >
      {/* Conditional rendering of section headers */}
      {isOpen && (
        <Typography variant="overline" sx={{ mb: 1, ml: 1 }}>
          Menu
        </Typography>
      )}
      <List>
        <ListItem
          button
          onClick={() => handleNavigation("/user/dashboard")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/dashboard" ? activeStyle : {}) }}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <Badge
              color="success"
              variant={isOpen ? "dot" : "standard"}
              invisible={activeRoute !== "/user/dashboard"}
            >
              <DashboardIcon />
            </Badge>
          </ListItemIcon>
          {isOpen && <ListItemText primary="Dashboard" />}
        </ListItem>
      </List>

      <Box sx={{ height: "20px" }} />

      {isOpen && (
        <Typography variant="overline" sx={{ mb: 1, ml: 1 }}>
          Transportation
        </Typography>
      )}
      <List>
        <ListItem
          button
          onClick={() => handleNavigation("/user/my-rides")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/my-rides" ? activeStyle : {}) }}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <DirectionsCarIcon />
          </ListItemIcon>
          {isOpen && <ListItemText primary="My Rides" />}
        </ListItem>

        <ListItem
          button
          onClick={() => handleNavigation("/user/promotions")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/promotions" ? activeStyle : {}) }}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <LocalOfferIcon />
          </ListItemIcon>
          {isOpen && <ListItemText primary="Promotions" />}
        </ListItem>
      </List>

      <Box sx={{ height: "20px" }} />

      {isOpen && (
        <Typography variant="overline" sx={{ mb: 1, ml: 1 }}>
          Management
        </Typography>
      )}
      <List>
        <ListItem
          button
          onClick={() => handleNavigation("/user/profile")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/profile" ? activeStyle : {}) }}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <PersonIcon />
          </ListItemIcon>
          {isOpen && <ListItemText primary="Profile" />}
        </ListItem>

        <ListItem
          button
          onClick={() => handleNavigation("/user/settings")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/settings" ? activeStyle : {}) }}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <SettingsIcon />
          </ListItemIcon>
          {isOpen && <ListItemText primary="Settings" />}
        </ListItem>

        <ListItem
          button
          onClick={() => handleNavigation("/user/logout")}
          sx={hoverStyle}
        >
          <ListItemIcon sx={{ color: "white" }}>
            <LogoutIcon />
          </ListItemIcon>
          {isOpen && <ListItemText primary="Logout" />}
        </ListItem>
      </List>
    </Box>
  );
}

export default SideNav;
