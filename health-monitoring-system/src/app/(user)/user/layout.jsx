"use client";
import TopNav from "@/components/UserComponents/TopNav/TopNav";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect, useCallback } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import SideNav from "@/components/UserComponents/SideNav/SideNav";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";
import LazyLoading from "@/components/LazyLoading/LazyLoading";

function UserLayout({ children }) {
  const router = useRouter();
  const theme = useTheme();

  const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [navState, setNavState] = useState("full"); // "full", "icon", "hidden"

  const queryClient = useQueryClient();
  const { userProfile } = queryClient.getQueryData(["UserData"]) || {};

  const { data, isLoading, isError } = useQuery({
    queryKey: ["UserData"],
    queryFn: AdminUtils.userProfile,
    staleTime: Infinity,
    enabled: !userProfile,
  });

  const effectiveUserData = userProfile || data;

  const encryptAndStoreData = useCallback(async () => {
    try {
      if (effectiveUserData) {
        await AdminUtils.encryptAndStoreProfile(effectiveUserData);
      }
    } catch (error) {
      console.error("Encryption Error:", error);
    }
  }, [effectiveUserData]);

  useEffect(() => {
    encryptAndStoreData();
  }, [encryptAndStoreData]);

  if (isLoading) {
    return <LazyLoading />;
  }

  if (isError || !data) {
    router.push("/error/e401");
  }

  const sideNavWidth = navState === "full" ? 250 : navState === "icon" ? 80 : 0;

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden", // Prevent horizontal scrolling
        position: "relative",
      }}
    >
      {/* Side Navigation */}
      <Box
        sx={{
          width: sideNavWidth,
          transition: "width 0.3s",
          background: "linear-gradient(to bottom, #1e3c72, #2a5298)",
          overflow: "hidden",
          flexShrink: 0, // Prevent shrinking of the side navigation
        }}
      >
        <SideNav navState={navState} activeRoute={router.pathname} />
      </Box>

      {/* Main Content Wrapper */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0, // Prevent content overflow
          overflow: "hidden",
        }}
      >
        {/* Top Navigation */}
        <Box
          sx={{
            flexShrink: 0,
            background: "#2a5298",
            zIndex: 10,
          }}
        >
          <TopNav
            onToggleSideNav={() =>
              setNavState((prevState) =>
                prevState === "full"
                  ? "icon"
                  : prevState === "icon"
                  ? "hidden"
                  : "full"
              )
            }
            userProfile={effectiveUserData}
          />
        </Box>

        {/* Main Content Area */}
        <Box
          sx={{
            flex: 1,
            padding: "2px",
            overflowY: "auto", // Vertical scrolling for the main content
            background: "Linear-gradient(to right, #1e3c72, #2a5298)",
            display: "flex",
            flexDirection: "column",
            gap: "4px", // Add space between children
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default UserLayout;
