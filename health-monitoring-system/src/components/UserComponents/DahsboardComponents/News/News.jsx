"use client";
import React from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Card, CardContent, CardMedia, Typography, Box, Button } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";


// Full article data
const articles = [
    {
        id: 1,
        title: "Limit Sugary Drinks",
        content1: `
        Sugary drinks like sodas and sweetened teas are the primary source of added sugar. They increase the risk of heart disease, type 2 diabetes, and obesity. Opt for water, unsweetened teas, or coffee instead.
        `,
        content2: `
        Sugar-sweetened beverages are also uniquely harmful for children, as they can contribute not only to obesity in children but also to conditions that usually do not develop until adulthood.
        `,
        image: "/articleImg1.jpeg",
        link: "/articles/limit-sugary-drinks",
    },
    {
        id: 2,
        title: "Eat Nuts and Seeds",
        content1: `Nuts and seeds are packed with protein, fiber, and vitamins. They help reduce the risk of type 2 diabetes and heart disease.`,
        content2: `Additionally, a low intake of nuts and seeds was potentially linked to an increased risk of death from heart disease, stroke, or type 2 diabetes.`,
        image: "/articleImg2.jpeg",
        link: "/articles/eat-nuts-and-seeds",
    },
    {
        id: 3,
        title: "Avoid Ultra-Processed Foods",
        content1: `Ultra-processed foods are loaded with additives and low in nutrients. Avoid snacks like cakes, chips, and fast food to reduce risks of chronic diseases.`,
        content2: `Diets high in ultra-processed food can contribute to obesity, type 2 diabetes, heart disease, and other chronic conditions.`,
        image: "/articleImg3.jpeg",
        link: "/articles/avoid-ultra-processed-foods",
    },
    {
        id: 4,
        title: "Don’t Fear Coffee",
        content1: `Coffee is rich in antioxidants and may reduce the risk of diseases like Parkinson’s and Alzheimer’s. Consume in moderation to enjoy its benefits.`,
        content2: `Excessive caffeine intake may lead to health issues like insomnia and heart palpitations. Keep your intake to less than 4 cups per day.`,
        image: "/articleImg4.jpeg",
        link: "/articles/dont-fear-coffee",
    },
    {
        id: 5,
        title: "Eat Fatty Fish",
        content1: `Fatty fish like salmon are rich in omega-3 fatty acids, which support brain and heart health. Include them in your meals weekly.`,
        content2: `Studies show that people who eat fish regularly have a lower risk for several conditions, including heart disease, dementia, and inflammatory bowel disease.`,
        image: "/articleImg5.jpeg",
        link: "/articles/eat-fatty-fish",
    },
    {
        id: 6,
        title: "Get Enough Sleep",
        content1: `Sleep is crucial for mental and physical well-being. Poor sleep increases risks of obesity, diabetes, and heart disease. Aim for 7-9 hours of quality sleep each night.`,
        content2: `People who do not get enough sleep tend to make food choices that are higher in fat, sugar, and calories, potentially leading to unwanted weight gain.`,
        image: "/articleImg6.jpeg",
        link: "/articles/get-enough-sleep",
    },
    {
        id: 7,
        title: "Feed Your Gut Bacteria",
        content1: `Gut bacteria are essential for digestion and immunity. Support them by eating fermented foods, fiber-rich meals, and taking probiotics.`,
        content2: `Fiber serves as a prebiotic, or a food source for your gut bacteria, helping improve gut health and overall immunity.`,
        image: "/articleImg7.jpeg",
        link: "/articles/feed-your-gut-bacteria",
    },
];

const scrollingData = [
    "Community Health Monitor is a free, online platform for community health advocacy.",
    "Stay informed about local health initiatives.",
    "Join the Community Health Monitor community for discussions and resources.",
    "Discover new ways to prevent chronic diseases.",
    "Stay up-to-date with the latest healthcare advancements.",
    "Stay updated with community health trends.",
    "Learn mental health tips for better well-being.",
    "Discover ways to prevent chronic diseases.",
    "Latest advancements in healthcare technology.",
    "Health tips for a balanced lifestyle.",
    "Emergency preparedness for local communities.",
];

function NewsHeader() {
    return (
        <Box
            sx={{
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                background: "linear-gradient(to right, #003366, #002244)",
                color: "#FFF",
                py: 1,
                px: 2,
                borderRadius: "5px",
                boxShadow: 2,
                mb:1,
            }}
        >
            <Typography
                variant="h5"
                sx={{
                    fontWeight: "bold",
                    animation: "marquee 35s linear infinite",
                    display: "inline-block",
                    whiteSpace: "nowrap",
                }}
            >
                {scrollingData.map((item, index) => (
                    <span key={index} style={{ marginRight: "2rem" }}>
                        {item}{" "}
                    </span>
                ))}
            </Typography>
            <style jsx global>{`
                @keyframes marquee {
                    0% {
                        transform: translateX(100%);
                    }
                    100% {
                        transform: translateX(-100%);
                    }
                }
            `}</style>
        </Box>
    );
}

function News() {
    return (
        <Box
            sx={{
                py: 4,
                px: 2,
                maxHeight: "700px",
            }}
        >
            <NewsHeader />
            <Swiper
                modules={[Autoplay, Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000 }}
                loop
                style={{ padding: "2px" }}
            >
                {articles.map((article) => (
                    <SwiperSlide key={article.id}>
                        <Card
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" },
                                boxShadow: 3,
                                margin: "0 auto",
                                overflow: "hidden",
                                maxHeight: "400px", // Fixed height
                            }}
                        >
                            <CardMedia
                                component="img"
                                image={article.image}
                                alt={article.title}
                                sx={{
                                    width: { xs: "100%", md: "40%" },
                                    height: "500px", // Consistent height
                                    objectFit: "cover", // Ensures the image fits within its container
                                }}
                            />
                            <CardContent
                                sx={{
                                    flex: "1",
                                    p: 2,
                                    textAlign: "left",
                                    overflowY: "auto",
                                }}
                            >
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#000",
                                        mb: 2,
                                    }}
                                >
                                    {article.title}
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: "#555",
                                        mb: 2,
                                    }}
                                >
                                    {article.content1}
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: "#666",
                                        mb: 3,
                                    }}
                                >
                                    {article.content2}
                                </Typography>
                                <Button
                                    variant="contained"
                                    href={article.link}
                                    endIcon={<ArrowForwardIosIcon />}
                                    sx={{
                                        backgroundColor: "#003366",
                                        "&:hover": { backgroundColor: "#002244" },
                                    }}
                                >
                                    Read More
                                </Button>
                            </CardContent>
                        </Card>
                    </SwiperSlide>
                ))}
            </Swiper>
        </Box>
    );
}

export default News;
