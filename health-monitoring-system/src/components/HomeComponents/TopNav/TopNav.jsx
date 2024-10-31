"use client";
import React, { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function TopNav({ onToggleSideNav, clientProfile }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
                backgroundColor: "white",
                color: "text.primary",
            }}
        >
            {/* Left Section: Icon + Text + Toggle Button */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                    src="/logo.png"
                    alt="Naviroq Logo"
                    sx={{ width: 40, height: 40 }}
                />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Health Monitoring System
                </Typography>
                <IconButton onClick={onToggleSideNav}>
                    <MenuIcon />
                </IconButton>
            </Box>

            {/* Right Section: Avatar + Name + Dropdown Menu */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1}}>
                <Avatar
                    src={
                        clientProfile.profilePicture
                            ? clientProfile.profilePicture
                            : "/av-1.svg"
                    }
                    alt="User Avatar"
                    sx={{ width: 50, height: 50 }}
                />
                <Box sx={{ textAlign: "left" }}>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {clientProfile.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Profile
                    </Typography>
                </Box>
                <IconButton onClick={handleMenuOpen}>
                    <ArrowDropDownIcon />
                </IconButton>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleMenuClose}
                    PaperProps={{
                        elevation: 3,
                        sx: { mt: 1.5, overflow: "visible" },
                    }}
                >
                    <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                            <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        Profile
                    </MenuItem>
                    <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon>
                            <LogoutIcon fontSize="small" />
                        </ListItemIcon>
                        Logout
                    </MenuItem>
                </Menu>
            </Box>
        </Box>
    );
}

export default TopNav;
