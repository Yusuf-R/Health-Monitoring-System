"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import PlaceIcon from '@mui/icons-material/Place';
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { toast } from "sonner";
import AdminUtils from "@/utils/AdminUtils";
import { signOut } from 'next-auth/react';
import { CircularProgress } from "@mui/material";
import ArticleIcon from '@mui/icons-material/Article';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import EmergencyIcon from '@mui/icons-material/Emergency';
import AccessibilityIcon from '@mui/icons-material/Accessibility';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';



function SideNav({ navState, activeRoute }) {
  const router = useRouter();
  const [confirmExit, setConfirmExit] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const mutation = useMutation({
    mutationKey: ['Logout'],
    mutationFn: AdminUtils.userLogout,
    onSuccess: () => {
      signOut({ callbackUrl: '/authorization/user' }); // Redirects after logout
      toast.success('Logged out successfully');
      setLoggingOut(false);
      setConfirmExit(false); // Close dialog
    },
    onError: (error) => {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
      setLoggingOut(false);
    },
  });

  const handleLogout = () => {
    try {
      setLoggingOut(true);
      mutation.mutate();
    } catch (err) {
      console.error('Logout error:', err);
      setLoggingOut(false);
      toast.error('Logout failed. Please try again.');
    }
  };

  const handleNavigation = (route) => {
    router.push(route);
  };

  const navWidth = navState === "full" ? 250 : navState === "icon" ? 80 : 0;
  const showText = navState === "full";
  const showIcons = navState !== "hidden";

  const activeStyle = {
    backgroundColor: "#374151",
    borderRadius: "8px",
  };

  const hoverStyle = {
    "&:hover": {
      background: " linear-gradient(to right, #000428, #004e92)",
      borderRadius: "8px",
      cursor: "pointer",
    },
  };

  return (
    <Box
      sx={{
        width: navWidth,
        transition: "width 0.3s",
        color: "white",
        display: navState === "hidden" ? "none" : "flex",
        flexDirection: "column",
        padding: showIcons ? "10px" : 0,
        borderRight: "1px solid grey",
        height: '100vh',
      }}
    >
      {/* Dashboard */}
      {showText && (
        <Typography variant="overline" sx={{ mb: 0, ml: 1 }}>
          Dashboard
        </Typography>
      )}
      <List>
        <ListItem
          onClick={() => handleNavigation("/user/dashboard")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/dashboard" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <DashboardIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Overview" />}
        </ListItem>
      </List>

      {/* Information Hub */}
      {showText && (
        <Typography variant="overline" sx={{ mb: 0, ml: 1 }}>
          Information Hub
        </Typography>
      )}
      <List>
        <ListItem
          onClick={() => handleNavigation("/user/info-hub/news")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/info-hub/news" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <ArticleIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="News" />}
        </ListItem>

        <ListItem
          onClick={() => handleNavigation("/user/info-hub/feeds")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/info-hub/feeds" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <RssFeedIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Feeds" />}
        </ListItem>

        <ListItem
          onClick={() => handleNavigation("/user/info-hub/tips-guides")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/info-hub/tips-guides" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <TipsAndUpdatesIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Tips & Guides" />}
        </ListItem>
      </List>

      {/* Health Tools */}
      {showText && (
        <Typography variant="overline" sx={{ mb: 0, ml: 1 }}>
          Personalized Insights
        </Typography>
      )}
      <List>
        <ListItem
          onClick={() => handleNavigation("/user/dashboard/health-check")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/dashboard/health-check" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <MonitorHeartIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Health Check" />}
        </ListItem>

        <ListItem
          onClick={() => handleNavigation("/user/dashboard/weekly-steps")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/dashboard/weekly-steps" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <DirectionsWalkIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Activity" />}
        </ListItem>

        <ListItem
          onClick={() => handleNavigation("/user/dashboard/bmi")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/dashboard/bmi" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <AccessibilityIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="BMI Insights" />}
        </ListItem>
      </List>

      {/* Tools & Resources */}
      {showText && (
        <Typography variant="overline" sx={{ mb: 0, ml: 1 }}>
          Tools & Resources
        </Typography>
      )}
      <List>
        <ListItem
          onClick={() => handleNavigation("/user/tools/symptom-checker")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/tools/symptom-checker" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <MonitorHeartIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Symptom Logger" />}
        </ListItem>

        <ListItem
          onClick={() => handleNavigation("/user/tools/nearby-clinics")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/tools/nearby-clinics" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <PlaceIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Nearby Clinics" />}
        </ListItem>

        <ListItem
          onClick={() => handleNavigation("/user/tools/emergency-contact")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/tools/emergency-contact" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <SettingsIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Contact" />}
        </ListItem>
      </List>

      {/* Community Health Trends */}
      {showText && (
        <Typography variant="overline" sx={{ mb: 0, ml: 1 }}>
          Community Trends
        </Typography>
      )}
      <List>
        <ListItem
          onClick={() => handleNavigation("/user/dashboard/health-trends")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/dashboard/health-trends" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <ArticleIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Infographics" />}
        </ListItem>
      </List>

      {/* Management */}
      {showText && (
        <Typography variant="overline" sx={{ mb: 0, ml: 1 }}>
          Management
        </Typography>
      )}
      <List>
        <ListItem
          onClick={() => handleNavigation("/user/profile")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/profile" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <PersonIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Profile" />}
        </ListItem>

        <ListItem
          onClick={() => handleNavigation("/user/settings")}
          sx={{ ...hoverStyle, ...(activeRoute === "/user/settings" ? activeStyle : {}) }}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <SettingsIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Settings" />}
        </ListItem>

        <ListItem
          onClick={() => setConfirmExit(true)} // Show confirmation dialog before logout
          sx={hoverStyle}
        >
          {showIcons && (
            <ListItemIcon sx={{ color: "white" }}>
              <LogoutIcon />
            </ListItemIcon>
          )}
          {showText && <ListItemText primary="Logout" />}
        </ListItem>
      </List>

      {/* Confirmation Dialog for Logout */}
      <Dialog open={confirmExit} onClose={() => setConfirmExit(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to logout?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmExit(false)} variant="contained" color="success">
            No
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={(e) => {
              if (loggingOut) e.preventDefault();
              else handleLogout();
            }}
            endIcon={loggingOut && <CircularProgress size={20} color="inherit" />}
            sx={{
              ...(loggingOut && {
                pointerEvents: "none", // Disable interaction while maintaining appearance
                opacity: 1,
              }),
            }}
          >
            {loggingOut ? "Logging out..." : "Yes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SideNav;
