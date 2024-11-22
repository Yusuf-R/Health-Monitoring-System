'use client'
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import News from "@/components/UserComponents/DahsboardComponents/News/News";
import HealthInsights from "@/components/UserComponents/DahsboardComponents/HealthInsights/HealthInsights";
import Tools from "@/components/UserComponents/DahsboardComponents/Tools/Tools";
import HealthTrendsInfographic from "../HealthTrendsInfographic/HealthTrendsInfographic";
import CommunityHealthHub from "@/components/UserComponents/DahsboardComponents/CommunityHealthHub/CommunityHealthHub";
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation";
import { Link } from "next/link";
import { Tab, Tabs } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';




function Dashboard() {
  const [activeTab, setActiveTab] = useState("/user/dashboard");
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();

  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md'));
  const xSmall = useMediaQuery(theme.breakpoints.down('xs'));
  const small = useMediaQuery(theme.breakpoints.down('sm'));
  const medium = useMediaQuery(theme.breakpoints.down('md'));
  const large = useMediaQuery(theme.breakpoints.down('lg'));



  useEffect(() => {
    if (pathname.includes('news')) {
      setActiveTab('/user/dashboard/news');
    } else if (pathname.includes('feeds')) {
      setActiveTab('/user/dashboard/feeds');
    } else if (pathname.includes('tips')) {
      setActiveTab('/user/dashboard/tips');
    } else {
      setActiveTab('/user/dashboard');
    }
  }, [pathname]);


  return (

    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          width: '100%',
          p: 0.5,
        }}
      >
        <Stack direction='row' spacing={2} sx={{
          justifyContent: 'flex-start',
        }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#46F0F9',
              },
            }}
          >
            <Tab
              label="Dashboard"
              component={Link}
              href="/user/dashboard"
              value="/user/dashboard"

              sx={{
                color: "#FFF",
                fontWeight: 'bold',
                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                "&.Mui-selected": {
                  color: "#46F0F9",
                },
              }}
            />
            <Tab
              label="News"
              href="/user/dashboard/news"
              value="/user/dashboard/news"
              sx={{
                color: "#FFF",
                fontWeight: 'bold',
                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                "&.Mui-selected": {
                  color: "#46F0F9",
                },
              }}
            />
            <Tab
              label="Feeds"
              component={Link}
              href="/user/dashboard/feeds"
              value="/user/dashboard/feeds"
              sx={{
                color: "#FFF",
                fontWeight: 'bold',
                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                "&.Mui-selected": {
                  color: "#46F0F9",
                },
              }}
            />
            <Tab
              label="Tips"
              component={Link}
              href="/user/dashboard/tips"
              value="/user/dashboard/tips"
              sx={{
                color: "#FFF",
                fontWeight: 'bold',
                fontSize: xSmall || small || medium || large ? '0.6rem' : '0.9rem',
                "&.Mui-selected": {
                  color: "#46F0F9",
                },
              }}
            />
          </Tabs>
        </Stack>
        {/*ParentBox*/}
        <News />
        <HealthInsights />
        <Tools />
        <br/>
        <HealthTrendsInfographic />
        <br />
        <CommunityHealthHub />
        <br />
      </Box >
    </>
  )
}

export default Dashboard;