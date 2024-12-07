import React, { useState, useEffect } from 'react';
import {
    Paper,
    Grid,
    TextField,
    Button,
    Typography,
    MenuItem,
    Box,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'sonner';
import { collection, doc, addDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { NotificationManager } from '@/utils/notificationManager';
import LazyLoading from "@/components/LazyLoading/LazyLoading";
import { useRouter, useSearchParams } from 'next/navigation';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
    LocalHospital as HealthIcon,
    Warning as EmergencyIcon,
    Lightbulb as LifestyleIcon,
    Psychology as MentalHealthIcon,
    People as CommunityIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

const categories = [
    {
        value: "Health Tips",
        label: "Health Tips",
        icon: <HealthIcon sx={{ color: '#4caf50' }} />,
        color: '#4caf50'
    },
    {
        value: "Emergency Guides",
        label: "Emergency Guides",
        icon: <EmergencyIcon sx={{ color: '#f44336' }} />,
        color: '#f44336'
    },
    {
        value: "Lifestyle Recommendations",
        label: "Lifestyle Recommendations",
        icon: <LifestyleIcon sx={{ color: '#2196f3' }} />,
        color: '#2196f3'
    },
    {
        value: "Mental Health and Well-being",
        label: "Mental Health and Well-being",
        icon: <MentalHealthIcon sx={{ color: '#9c27b0' }} />,
        color: '#9c27b0'
    },
    {
        value: "Community-Focused Guides",
        label: "Community-Focused Guides",
        icon: <CommunityIcon sx={{ color: '#ff9800' }} />,
        color: '#ff9800'
    }
];

export default function CreateTipsAndGuides({ healthWorkerProfile }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const [loading, setLoading] = useState(!!editId);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form States
    const [title, setTitle] = useState('');
    const [snippet, setSnippet] = useState('');
    const [category, setCategory] = useState('');
    const [introduction, setIntroduction] = useState('');

    // State for Health Tips
    const [benefits, setBenefits] = useState([]);
    const [newBenefit, setNewBenefit] = useState('');
    const [healthBenefits, setHealthBenefits] = useState([]);
    const [newHealthBenefit, setNewHealthBenefit] = useState('');

    // State for Emergency Guides
    const [types, setTypes] = useState([]);
    const [newType, setNewType] = useState('');
    const [steps, setSteps] = useState([]);
    const [newStep, setNewStep] = useState('');

    // State for Lifestyle Recommendations
    const [recipes, setRecipes] = useState([]);
    const [newRecipe, setNewRecipe] = useState('');
    const [stretches, setStretches] = useState([]);
    const [newStretch, setNewStretch] = useState('');

    // State for Mental Health and Well-being
    const [meditationSteps, setMeditationSteps] = useState([]);
    const [newMeditationStep, setNewMeditationStep] = useState('');

    // State for Community-Focused Guides
    const [tips, setTips] = useState([]);
    const [newTip, setNewTip] = useState('');

    // Load data if in edit mode
    useEffect(() => {
        const fetchTipForEdit = async () => {
            if (editId) {
                try {
                    const docRef = doc(db, 'tipsAndGuides', editId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setTitle(data.title || '');
                        setSnippet(data.snippet || '');
                        setCategory(data.category || '');
                        setIntroduction(data.content?.introduction || '');

                        // Load category-specific data
                        switch (data.category) {
                            case 'Health Tips':
                                setBenefits(data.content?.benefits || []);
                                setHealthBenefits(data.content?.healthBenefits || []);
                                break;
                            case 'Emergency Guides':
                                setTypes(data.content?.types || []);
                                setSteps(data.content?.steps || []);
                                break;
                            case 'Lifestyle Recommendations':
                                setRecipes(data.content?.recipes || []);
                                setStretches(data.content?.stretches || []);
                                break;
                            case 'Mental Health and Well-being':
                                setMeditationSteps(data.content?.steps || []);
                                break;
                            case 'Community-Focused Guides':
                                setTips(data.content?.tips || []);
                                break;
                        }
                    }
                } catch (error) {
                    console.error('Error fetching tip for edit:', error);
                    toast.error('Failed to load tip for editing');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchTipForEdit();
    }, [editId]);

    const handleAddListItem = (setter, newItem, resetInput) => {
        if (newItem.trim()) {
            setter(prev => [...prev, newItem.trim()]);
            resetInput('');
        }
    };

    const handleRemoveListItem = (setter, index) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !snippet.trim() || !category || !introduction.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            let content = {
                introduction: introduction.trim()
            };

            // Add category-specific content
            switch (category) {
                case 'Health Tips':
                    content = {
                        ...content,
                        benefits,
                        healthBenefits
                    };
                    break;
                case 'Emergency Guides':
                    content = {
                        ...content,
                        types,
                        steps
                    };
                    break;
                case 'Lifestyle Recommendations':
                    content = {
                        ...content,
                        recipes,
                        stretches
                    };
                    break;
                case 'Mental Health and Well-being':
                    content = {
                        ...content,
                        steps: meditationSteps
                    };
                    break;
                case 'Community-Focused Guides':
                    content = {
                        ...content,
                        tips
                    };
                    break;
            }

            const tipData = {
                title: title.trim(),
                snippet: snippet.trim(),
                category,
                content,
                author: {
                    id: healthWorkerProfile._id,
                    name: `${healthWorkerProfile.firstName} ${healthWorkerProfile.lastName}`,
                    role: 'HealthWorker'
                }
            };

            if (editId) {
                const tipRef = doc(db, 'tipsAndGuides', editId);
                await updateDoc(tipRef, {
                    ...tipData,
                    updatedAt: serverTimestamp()
                });
                toast.success('Tip updated successfully');
            } else {
                const tipRef = collection(db, 'tipsAndGuides');
                const tipDoc = await addDoc(tipRef, {
                    ...tipData,
                    createdAt: serverTimestamp(),
                    timeStamp: serverTimestamp(),
                });

                await NotificationManager.createTipNotification(
                    {
                        id: tipDoc.id,
                        title: tipData.title,
                        category: tipData.category,
                        snippet: tipData.snippet
                    },
                    {
                        id: healthWorkerProfile._id,
                        name: `${healthWorkerProfile.firstName} ${healthWorkerProfile.lastName}`,
                        role: 'HealthWorker'
                    }
                );
                toast.success('Tip published successfully');
            }

            router.push('/health-worker/info-hub/tips-guides');
        } catch (error) {
            console.error('Error publishing tip:', error);
            toast.error(editId ? 'Failed to update tip' : 'Failed to publish tip');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderListSection = (title, items, newItem, setNewItem, handleAdd, handleRemove) => (
        <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
                {title}
            </Typography>
            <Box sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    label={`Add ${title}`}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <Button
                                onClick={handleAdd}
                                variant="contained"
                                size="small"
                                sx={{ ml: 1 }}
                                startIcon={<AddIcon />}
                            >
                                Add
                            </Button>
                        ),
                    }}
                />
            </Box>
            <List dense>
                {items.map((item, index) => (
                    <ListItem key={index}>
                        <ListItemText primary={item} />
                        <ListItemSecondaryAction>
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleRemove(index)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Grid>
    );

    const renderHealthTipsForm = () => (
        <>
            {renderListSection(
                'Benefits',
                benefits,
                newBenefit,
                setNewBenefit,
                () => handleAddListItem(setBenefits, newBenefit, setNewBenefit),
                (index) => handleRemoveListItem(setBenefits, index)
            )}
            {renderListSection(
                'Health Benefits',
                healthBenefits,
                newHealthBenefit,
                setNewHealthBenefit,
                () => handleAddListItem(setHealthBenefits, newHealthBenefit, setNewHealthBenefit),
                (index) => handleRemoveListItem(setHealthBenefits, index)
            )}
        </>
    );

    const renderEmergencyGuidesForm = () => (
        <>
            {renderListSection(
                'Types',
                types,
                newType,
                setNewType,
                () => handleAddListItem(setTypes, newType, setNewType),
                (index) => handleRemoveListItem(setTypes, index)
            )}
            {renderListSection(
                'Steps',
                steps,
                newStep,
                setNewStep,
                () => handleAddListItem(setSteps, newStep, setNewStep),
                (index) => handleRemoveListItem(setSteps, index)
            )}
        </>
    );

    const renderLifestyleRecommendationsForm = () => (
        <>
            {renderListSection(
                'Recipes',
                recipes,
                newRecipe,
                setNewRecipe,
                () => handleAddListItem(setRecipes, newRecipe, setNewRecipe),
                (index) => handleRemoveListItem(setRecipes, index)
            )}
            {renderListSection(
                'Stretches',
                stretches,
                newStretch,
                setNewStretch,
                () => handleAddListItem(setStretches, newStretch, setNewStretch),
                (index) => handleRemoveListItem(setStretches, index)
            )}
        </>
    );

    const renderMentalHealthForm = () => (
        <>
            {renderListSection(
                'Steps',
                meditationSteps,
                newMeditationStep,
                setNewMeditationStep,
                () => handleAddListItem(setMeditationSteps, newMeditationStep, setNewMeditationStep),
                (index) => handleRemoveListItem(setMeditationSteps, index)
            )}
        </>
    );

    const renderCommunityGuidesForm = () => (
        <>
            {renderListSection(
                'Tips',
                tips,
                newTip,
                setNewTip,
                () => handleAddListItem(setTips, newTip, setNewTip),
                (index) => handleRemoveListItem(setTips, index)
            )}
        </>
    );

    const getCategoryForm = () => {
        switch (category) {
            case 'Health Tips':
                return renderHealthTipsForm();
            case 'Emergency Guides':
                return renderEmergencyGuidesForm();
            case 'Lifestyle Recommendations':
                return renderLifestyleRecommendationsForm();
            case 'Mental Health and Well-being':
                return renderMentalHealthForm();
            case 'Community-Focused Guides':
                return renderCommunityGuidesForm();
            default:
                return null;
        }
    };

    if (loading) {
        return <LazyLoading />;
    }

    const handleBack = () => {
        router.back();
    };

    return (
        <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto', my: 4 }}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    backgroundColor: '#3949ab',
                    color: 'white',
                    padding: '5px 5px',
                    borderRadius: 2,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                }}
            >
                <IconButton
                    onClick={handleBack}
                    sx={{
                        '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        },
                        transition: 'transform 0.2s ease-in-out',
                    }}
                >
                    <ArrowBackIcon sx={{ color: '#81c784', fontSize: '40px' }} />
                </IconButton>

                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        textAlign: 'center',
                        flexGrow: 1,
                        color: '#ffffff',
                    }}
                >
                    {editId ? 'Edit Tip/Guide' : 'Create New Tip/Guide'}
                </Typography>
            </Box>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Short Description"
                            value={snippet}
                            onChange={(e) => setSnippet(e.target.value)}
                            multiline
                            rows={2}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            select
                            label="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                            SelectProps={{
                                renderValue: (selected) => {
                                    const selectedCategory = categories.find(cat => cat.value === selected);
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {selectedCategory?.icon}
                                            <Typography>{selectedCategory?.label}</Typography>
                                        </Box>
                                    );
                                }
                            }}
                        >
                            {categories.map((cat) => (
                                <MenuItem
                                    key={cat.value}
                                    value={cat.value}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        '&:hover': {
                                            backgroundColor: alpha(cat.color, 0.1)
                                        }
                                    }}
                                >
                                    {cat.icon}
                                    <Typography>{cat.label}</Typography>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Introduction"
                            value={introduction}
                            onChange={(e) => setIntroduction(e.target.value)}
                            multiline
                            rows={4}
                            required
                        />
                    </Grid>

                    {/* Render category-specific form */}
                    {category && getCategoryForm()}

                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={isSubmitting}
                            fullWidth
                        >
                            {isSubmitting
                                ? 'Publishing...'
                                : editId
                                    ? 'Update Tip/Guide'
                                    : 'Publish Tip/Guide'}
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
}
