'use client';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useEffect, useState, useRef } from "react";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Image from "next/image";
import NotInterestedIcon from "@mui/icons-material/NotInterested";
import CropIcon from "@mui/icons-material/Crop";
import SendIcon from "@mui/icons-material/Send";
import Modal from "@mui/material/Modal";
import { Cropper, CropperPreview } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css';
import useMediaQuery from "@mui/material/useMediaQuery";
import Divider from "@mui/material/Divider";
import { usePathname, useRouter } from "next/navigation";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "next/link";
import { toast } from "sonner";
import { CircularProgress } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AdminUtils from "@/utils/AdminUtils";

function Avatar({ userProfile }) {
    const [imgSrc, setImgSrc] = useState(userProfile.avatar || '');
    const [croppedPicture, setCroppedPicture] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [open, setOpen] = useState(false);
    const [crop, setCrop] = useState({});
    const [uploading, setUploading] = useState(false);

    const [activeTab, setActiveTab] = useState('/user/settings/profile/avatar');

    const pathname = usePathname();
    const router = useRouter();

    const cropperRef = useRef(null);
    const [aspect, setAspect] = useState(1);
    const [cropDataUrl, setCropDataUrl] = useState('');

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const handleClear = () => {
        setImgSrc(userProfile.avatar || '');
        setCroppedPicture('');
        setErrorMessage('');
        setOpen(false);
    };

    const onFileSelect = (event) => {
        handleClear();
        const file = event.target.files[0];
        const fileSize = file.size;
        const fileType = file.type;

        if (fileSize > 5000000) {
            setErrorMessage('File size exceeds 5MB');
            setImgSrc('');
            return;
        }

        if (!['image/png', 'image/jpeg', 'image/svg', 'image/svg+xml', 'image/jpg'].includes(fileType)) {
            setErrorMessage('Invalid file format');
            setImgSrc('');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setImgSrc(reader.result?.toString() || '');
            setErrorMessage('');
        };
        reader.readAsDataURL(file);
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        if (!cropperRef.current) {
            return;
        }

        const canvas = cropperRef.current.getCanvas();
        if (canvas) {
            const croppedImage = canvas.toDataURL('image/jpeg');
            setCroppedPicture(croppedImage);
            handleClose();
        }
    };

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationKey: ["UserAvatar"],
        mutationFn: AdminUtils.userAvatar
    });


    const handleSubmit = async (event) => {
        event.preventDefault();
        setUploading(true);

        const base64ToFile = async (base64String) => {
            try {
                // Get MIME type from base64 string
                const mimeType = base64String.match(/data:([^;]+);/)?.[1] || 'image/jpeg';

                // Remove data URL prefix
                const base64WithoutPrefix = base64String.includes('data:')
                    ? base64String.split(',')[1]
                    : base64String;

                // Convert base64 to binary
                const binaryString = window.atob(base64WithoutPrefix);
                const bytes = new Uint8Array(binaryString.length);

                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // Create File object (not Blob)
                return new File([bytes], 'profile-image.jpg', {
                    type: mimeType,
                    lastModified: new Date().getTime()
                });
            } catch (error) {
                console.error('Error converting base64 to file:', error);
                throw error;
            }
        };

        try {
            const imageData = croppedPicture || imgSrc;

            if (!imageData) {
                toast.error('Please select an image');
                setUploading(false);
                return;
            }

            // Convert base64 to File
            const imageFile = await base64ToFile(imageData);

            // Create FormData
            const formData = new FormData();
            formData.append('file', imageFile); // Changed from 'image' to 'file'

            mutation.mutate(formData, {
                onSuccess: () => {
                    queryClient.invalidateQueries(["UserData"]);
                    router.refresh();
                    toast.success('Image uploaded successfully');
                    router.push('/user/settings/profile');
                    setUploading(false);
                },
                onError: (error) => {
                    console.error("Upload failed:", error);
                    toast.error('Image upload failed');
                    setUploading(false);
                }
            });

        } catch (err) {
            console.error("Upload failed:", err);
            toast.error('Image upload failed');
            setUploading(false);
        }
    };

    useEffect(() => {
        // Update activeTab based on pathname
        if (pathname.includes('avatar')) {
            setActiveTab('/user/settings/profile/avatar');
        } else {
            setActiveTab('/user/settings/profile');
        }
    }, [pathname]);

    // Break Points
    const xSmall = useMediaQuery('(min-width:300px) and (max-width:389.999px)');
    const small = useMediaQuery('(min-width:390px) and (max-width:480.999px)');
    const medium = useMediaQuery('(min-width:481px) and (max-width:599.999px)');
    const large = useMediaQuery('(min-width:600px) and (max-width:899.999px)');
    const xLarge = useMediaQuery('(min-width:900px) and (max-width:1199.999px)');
    const xxLarge = useMediaQuery('(min-width:1200px) and (max-width:1439.999px)');

    const isSmallScreen = xSmall || small || medium;
    const isMediumScreen = large || xLarge;

    // Media query for responsive design
    const isXSmall = useMediaQuery('(max-width:599.99px)');


    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: "#1F2937",
                    minHeight: '100vh',
                    p: 0.5,
                    overflow: 'auto',
                }}
            >
                {/* Navigation Tabs */}
                <Stack direction='row' spacing={2} sx={{ justifyContent: 'flex-start' }}>
                    <Tabs
                        value={activeTab}
                        onChange={(e, newValue) => setActiveTab(newValue)}
                        variant={isXSmall ? "scrollable" : "standard"}
                        centered={!isXSmall}
                        sx={{
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#46F0F9',
                            },
                        }}
                    >
                        <Tab
                            label="Profile"
                            component={Link}
                            href="/user/settings/profile"
                            value="/user/settings/profile"
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
                            label="Avatar"
                            component={Link}
                            href="/user/settings/profile/avatar"
                            value="/user/settings/profile/avatar"
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

                {/* Image Section */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={{ xs: 2, sm: 3, md: 4 }}
                    alignItems="center"
                    justifyContent="center"
                    divider={<Divider orientation="vertical" flexItem
                                      sx={{ display: { xs: 'none', sm: 'block' }, border: '2px solid #FFF' }} />}
                >
                    <Typography variant="body2"
                                sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }, color: '#FFF' }}>Allowed
                        Types: PNG, JPG, JPEG</Typography>
                    <Typography variant="body2"
                                sx={{ fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' }, color: '#FFF' }}>Max
                        Size: 5MB picture</Typography>
                </Stack>
                <br />
                <Stack direction='column' spacing={2} justifyContent="center" alignItems="center">
                    <Typography variant='subtitle1' color="#FFF">Original Image</Typography>
                    <Image
                        alt="Profile Picture"
                        src={imgSrc || '/av-1.svg'}
                        width={360}
                        height={360}
                    />
                    {errorMessage && (
                        <Typography variant="subtitle1" color="error">
                            {errorMessage}
                        </Typography>
                    )}
                    {croppedPicture && (
                        <Stack direction="column" spacing={2} justifyContent="center" alignItems="center">
                            <Typography variant="subtitle1" color="#20fa94">Cropped Image</Typography>
                            <Image
                                src={croppedPicture}
                                alt="Cropped Image Preview"
                                width={360}
                                height={360}
                            />
                        </Stack>
                    )}
                </Stack>
                <br />
                <Stack direction='row' spacing={2} justifyContent='center' alignItems='center'>
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<NotInterestedIcon />}
                        onClick={handleClear}
                        color='error'
                    >
                        Clear
                    </Button>
                    <Button
                        component="label"
                        role={undefined}
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<CloudUploadIcon />}
                    >
                        Upload Picture
                        <VisuallyHiddenInput type="file" onChange={onFileSelect} />
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleOpen}
                        disabled={imgSrc === ""}
                        color='primary'
                        startIcon={<CropIcon />}
                    >
                        Crop
                    </Button>
                    <Button
                        component="label"
                        variant="contained"
                        tabIndex={-1}
                        startIcon={<SendIcon />}
                        endIcon={uploading && <CircularProgress size={20} color="blue" />}
                        disabled={imgSrc === ''}
                        color='success'
                        type='submit'
                        title='Submit'
                        onClick={handleSubmit}
                    >
                        {uploading ? 'Uploading' : 'Submit'}
                    </Button>
                </Stack>
                <br />
                <Modal open={open} onClose={handleClose} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ backgroundColor: '#1F2937', padding: 3, borderRadius: 2, maxWidth: 600, width: '100%' }}>
                        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                            Crop Image
                        </Typography>
                        <Box sx={{ height: 400, width: '100%' }}>
                            <Cropper
                                ref={cropperRef}
                                src={imgSrc}
                                onCropEnd={() => handleSave()}
                                style={{ height: '100%', width: '100%' }}
                            />
                        </Box>
                        <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
                            <Button variant="contained" onClick={handleSave} color="success">
                                Crop
                            </Button>
                            <Button variant="contained" onClick={handleClear} color="error">
                                Clear
                            </Button>
                        </Stack>
                    </Box>
                </Modal>
            </Box>

        </>
    );
}

export default Avatar;