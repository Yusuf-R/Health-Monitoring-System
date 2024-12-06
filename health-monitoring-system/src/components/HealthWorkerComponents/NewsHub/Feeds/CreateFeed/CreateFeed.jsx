'use client';

import React, {useState} from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';
import {db} from '@/server/db/fireStore';
import {toast} from 'sonner';
import {statesAndLGAs} from "@/utils/data";
import {useRouter} from 'next/navigation';
import {ArrowBack as ArrowBackIcon} from "@mui/icons-material";
import TipTapEditor from "@/components/TipTapEditor/TipTapEditor"

const FEED_TYPES = ['advice', 'alerts', 'events', 'polls'];

function CreateFeed({healthWorkerProfile}) {
    // Basic feed fields
    const [title, setTitle] = useState('');
    const [snippet, setSnippet] = useState('');
    const [type, setType] = useState('advice');
    const [state, setState] = useState('');
    const [lga, setLGA] = useState('');
    const [country, setCountry] = useState("Nigeria")
    const [alternativeNames, setAlternativeNames] = useState([]);
    const [newAltName, setNewAltName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    // Advice type specific fields
    const [adviceContent, setAdviceContent] = useState({
        introduction: '',
        causes: [],
        riskFactors: [],
        symptoms: [],
        examsTests: [],
        treatment: [],
        prevention: [],
        outlook: [],
        supportGroups: '',
        references: []
    });
    const [newItemText, setNewItemText] = useState('');
    const [newReference, setNewReference] = useState({
        title: '',
        source: '',
        author: ''
    });
    const [newTreatment, setNewTreatment] = useState({
        type: '',
        description: '',
        details: []
    });

    // Common Types fields for advice
    const [commonTypes, setCommonTypes] = useState({
        nga: {
            men: [],
            women: []
        },
        worldwide: {
            mostCommon: [],
            regionalVariations: ''
        },
        otherTypes: []
    });

    // Separate state for each text input
    const [newMenType, setNewMenType] = useState('');
    const [newWomenType, setNewWomenType] = useState('');
    const [newWorldwideType, setNewWorldwideType] = useState('');
    const [newOtherType, setNewOtherType] = useState('');

    // States for list sections
    const [newCauseText, setNewCauseText] = useState('');
    const [newRiskFactorText, setNewRiskFactorText] = useState('');
    const [newSymptomText, setNewSymptomText] = useState('');
    const [newExamText, setNewExamText] = useState('');
    const [newPreventionText, setNewPreventionText] = useState('');
    const [newOutlookText, setNewOutlookText] = useState('');

    // // State of Origin
    const getStateOptions = () => {
        return Object.keys(statesAndLGAs).map((stateName) => (
            <MenuItem key={stateName} value={stateName}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}>
                {stateName}
            </MenuItem>
        ));
    };
    const handleStateChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setState(event.target.value)
        setLGA('');
    };

    // LGA
    const getLGAOptions = () => {
        if (!state) {
            return [];
        }
        return statesAndLGAs[state].map((lgaName) => (
            <MenuItem key={lgaName} value={lgaName}
                      sx={{color: 'white', '&:hover': {backgroundColor: '#051935'}}}> {lgaName} </MenuItem>
        ));
    };
    const handleLGAChange = (event) => {
        // prevent default action of submitting the form
        event.preventDefault();
        setLGA(event.target.value)
    };

    const handleAddAlternativeName = () => {
        if (newAltName.trim() && !alternativeNames.includes(newAltName.trim())) {
            setAlternativeNames([...alternativeNames, newAltName.trim()]);
            setNewAltName('');
        }
    };

    const handleRemoveAlternativeName = (nameToRemove) => {
        setAlternativeNames(alternativeNames.filter(name => name !== nameToRemove));
    };

    const handleAddListItem = (field, newText) => {
        if (newText.trim()) {
            setAdviceContent(prev => ({
                ...prev,
                [field]: [...prev[field], newText.trim()]
            }));
            switch (field) {
                case 'causes':
                    setNewCauseText('');
                    break;
                case 'riskFactors':
                    setNewRiskFactorText('');
                    break;
                case 'symptoms':
                    setNewSymptomText('');
                    break;
                case 'examsTests':
                    setNewExamText('');
                    break;
                case 'prevention':
                    setNewPreventionText('');
                    break;
                case 'outlook':
                    setNewOutlookText('');
                    break;
                default:
                    setNewItemText('');
            }
        }
    };

    const handleRemoveListItem = (field, index) => {
        setAdviceContent(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleAddReference = () => {
        if (newReference.title && newReference.source) {
            setAdviceContent(prev => ({
                ...prev,
                references: [...prev.references, {...newReference}]
            }));
            setNewReference({title: '', source: '', author: ''});
        }
    };

    const handleAddTreatment = () => {
        if (newTreatment.type && (newTreatment.description || newTreatment.details.length > 0)) {
            setAdviceContent(prev => ({
                ...prev,
                treatment: [...prev.treatment, {...newTreatment}]
            }));
            setNewTreatment({type: '', description: '', details: []});
        }
    };

    const handleAddCommonType = (category, subCategory, newText) => {
        if (newText.trim()) {
            setCommonTypes(prev => {
                if (subCategory) {
                    return {
                        ...prev,
                        [category]: {
                            ...prev[category],
                            [subCategory]: [...prev[category][subCategory], newText.trim()]
                        }
                    };
                } else {
                    return {
                        ...prev,
                        [category]: [...prev[category], newText.trim()]
                    };
                }
            });
            switch (category) {
                case 'nga':
                    if (subCategory === 'men') {
                        setNewMenType('');
                    } else if (subCategory === 'women') {
                        setNewWomenType('');
                    }
                    break;
                case 'worldwide':
                    if (subCategory === 'mostCommon') {
                        setNewWorldwideType('');
                    }
                    break;
                case 'otherTypes':
                    setNewOtherType('');
                    break;
                default:
                    setNewItemText('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !snippet.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (type === 'advice' && !adviceContent.introduction) {
            toast.error('Please add an introduction for the advice');
            return;
        }

        setIsSubmitting(true);
        try {
            const feedData = {
                title: title.trim(),
                snippet: snippet.trim(),
                type,
                scope: {lga, state, country},
                timestamp: new Date().toISOString(),
                alternativeNames: alternativeNames.length > 0 ? alternativeNames : undefined,
                content: type === 'advice' ? {
                    ...adviceContent,
                    commonTypes
                } : '',
                author: {
                    id: healthWorkerProfile._id,
                    name: healthWorkerProfile.firstName,
                    role: 'HealthWorker'
                }
            };

            const docRef = await addDoc(collection(db, 'feeds'), feedData);

            // Create notification
            const notificationData = {
                type: 'new_feed',
                title: 'New Feed Published',
                message: `A new ${type} feed "${title}" has been published`,
                feedId: docRef.id,
                feedType: type,
                status: 'unread',
                actionUrl: `/info-hub/feeds/${docRef.id}`,
                createdAt: serverTimestamp(),
                userId: healthWorkerProfile._id,
                contentId: docRef.id,
                contentType: 'feed',
                author: {
                    id: healthWorkerProfile._id,
                    name: healthWorkerProfile.firstName,
                    role: 'HealthWorker'
                },
                scope: {
                    lga,
                    state,
                    country
                }
            };

            await addDoc(collection(db, 'notifications'), notificationData);
            toast.success('Feed published successfully!');

            // Reset form
            setTitle('');
            setSnippet('');
            setType('advice');
            setState('');
            setLGA('');
            setCountry('Nigeria');
            setAlternativeNames([]);
            setAdviceContent({
                introduction: '',
                causes: [],
                riskFactors: [],
                symptoms: [],
                examsTests: [],
                treatment: [],
                prevention: [],
                outlook: [],
                supportGroups: '',
                references: []
            });
            setCommonTypes({
                nga: {men: [], women: []},
                worldwide: {mostCommon: [], regionalVariations: ''},
                otherTypes: []
            });

        } catch (error) {
            console.error('Error publishing feed:', error);
            setIsSubmitting(false);
            toast.error('Failed to publish feed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderAdviceForm = () => (
        <>
            {/*<Grid size={{xs: 12}}>*/}
            {/*    <TextField*/}
            {/*        fullWidth*/}
            {/*        label="Introduction"*/}
            {/*        value={adviceContent.introduction}*/}
            {/*        onChange={(e) => setAdviceContent(prev => ({...prev, introduction: e.target.value}))}*/}
            {/*        multiline*/}
            {/*        rows={3}*/}
            {/*        required*/}
            {/*    />*/}
            {/*</Grid>*/}

            <Grid size={{ xs: 12 }}>
                <TipTapEditor
                    value={adviceContent.introduction}
                    onChange={(value) => setAdviceContent(prev => ({ ...prev, introduction: value }))}
                />
            </Grid>

            {/* Common Types Section */}
            <Grid size={{xs: 12}}>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography>Common Types</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            {/* USA Section */}
                            <Grid size={{xs: 12}}>
                                <Typography variant="subtitle2" gutterBottom>NIGERIA Common Types</Typography>
                                <Grid container spacing={2}>
                                    {/* Men's Common Types */}
                                    <Grid size={{xs: 12, md: 6}}>
                                        <Box sx={{mb: 2}}>
                                            <TextField
                                                fullWidth
                                                label="Add Common Type for Men"
                                                value={newMenType}
                                                onChange={(e) => setNewMenType(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddCommonType('nga', 'men', newMenType);
                                                    }
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <Button
                                                            onClick={() => handleAddCommonType('nga', 'men', newMenType)}
                                                            variant="contained"
                                                            size="small"
                                                            sx={{ml: 1}}
                                                        >
                                                            Add
                                                        </Button>
                                                    ),
                                                }}
                                            />
                                            <List dense>
                                                {commonTypes.nga.men.map((type, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemText primary={type}/>
                                                        <ListItemSecondaryAction>
                                                            <IconButton
                                                                edge="end"
                                                                aria-label="delete"
                                                                onClick={() => {
                                                                    setCommonTypes(prev => ({
                                                                        ...prev,
                                                                        nga: {
                                                                            ...prev.nga,
                                                                            men: prev.nga.men.filter((_, i) => i !== index)
                                                                        }
                                                                    }));
                                                                }}
                                                            >
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    </Grid>

                                    {/* Women's Common Types */}
                                    <Grid size={{xs: 12, md: 6}}>
                                        <Box sx={{mb: 2}}>
                                            <TextField
                                                fullWidth
                                                label="Add Common Type for Women"
                                                value={newWomenType}
                                                onChange={(e) => setNewWomenType(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddCommonType('nga', 'women', newWomenType);
                                                    }
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <Button
                                                            onClick={() => handleAddCommonType('nga', 'women', newWomenType)}
                                                            variant="contained"
                                                            size="small"
                                                            sx={{ml: 1}}
                                                        >
                                                            Add
                                                        </Button>
                                                    ),
                                                }}
                                            />
                                            <List dense>
                                                {commonTypes.nga.women.map((type, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemText primary={type}/>
                                                        <ListItemSecondaryAction>
                                                            <IconButton
                                                                edge="end"
                                                                aria-label="delete"
                                                                onClick={() => {
                                                                    setCommonTypes(prev => ({
                                                                        ...prev,
                                                                        nga: {
                                                                            ...prev.nga,
                                                                            women: prev.nga.women.filter((_, i) => i !== index)
                                                                        }
                                                                    }));
                                                                }}
                                                            >
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Worldwide Section */}
                            <Grid xs={12}>
                                <Typography variant="subtitle2" gutterBottom>Worldwide Common Types</Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{xs: 12}}>
                                        <Box sx={{mb: 2}}>
                                            <TextField
                                                fullWidth
                                                label="Add Most Common Type Worldwide"
                                                value={newWorldwideType}
                                                onChange={(e) => setNewWorldwideType(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddCommonType('worldwide', 'mostCommon', newWorldwideType);
                                                    }
                                                }}
                                                InputProps={{
                                                    endAdornment: (
                                                        <Button
                                                            onClick={() => handleAddCommonType('worldwide', 'mostCommon', newWorldwideType)}
                                                            variant="contained"
                                                            size="small"
                                                            sx={{ml: 1}}
                                                        >
                                                            Add
                                                        </Button>
                                                    ),
                                                }}
                                            />
                                            <List dense>
                                                {commonTypes.worldwide.mostCommon.map((type, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemText primary={type}/>
                                                        <ListItemSecondaryAction>
                                                            <IconButton
                                                                edge="end"
                                                                aria-label="delete"
                                                                onClick={() => {
                                                                    setCommonTypes(prev => ({
                                                                        ...prev,
                                                                        worldwide: {
                                                                            ...prev.worldwide,
                                                                            mostCommon: prev.worldwide.mostCommon.filter((_, i) => i !== index)
                                                                        }
                                                                    }));
                                                                }}
                                                            >
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </ListItemSecondaryAction>
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    </Grid>

                                    <Grid xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Regional Variations"
                                            value={commonTypes.worldwide.regionalVariations}
                                            onChange={(e) => setCommonTypes(prev => ({
                                                ...prev,
                                                worldwide: {
                                                    ...prev.worldwide,
                                                    regionalVariations: e.target.value
                                                }
                                            }))}
                                            multiline
                                            rows={2}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Other Types */}
                            <Grid size={{xs: 12}}>
                                <Typography variant="subtitle2" gutterBottom>Other Types</Typography>
                                <Box sx={{mb: 2}}>
                                    <TextField
                                        fullWidth
                                        label="Add Other Type"
                                        value={newOtherType}
                                        onChange={(e) => setNewOtherType(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddCommonType('otherTypes', '', newOtherType);
                                            }
                                        }}
                                        InputProps={{
                                            endAdornment: (
                                                <Button
                                                    onClick={() => handleAddCommonType('otherTypes', '', newOtherType)}
                                                    variant="contained"
                                                    size="small"
                                                    sx={{ml: 1}}
                                                >
                                                    Add
                                                </Button>
                                            ),
                                        }}
                                    />
                                    <List dense>
                                        {commonTypes.otherTypes.map((type, index) => (
                                            <ListItem key={index}>
                                                <ListItemText primary={type}/>
                                                <ListItemSecondaryAction>
                                                    <IconButton
                                                        edge="end"
                                                        aria-label="delete"
                                                        onClick={() => {
                                                            setCommonTypes(prev => ({
                                                                ...prev,
                                                                otherTypes: prev.otherTypes.filter((_, i) => i !== index)
                                                            }));
                                                        }}
                                                    >
                                                        <DeleteIcon/>
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            </Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>
            </Grid>

            {/* Lists with add/remove functionality */}
            {['causes', 'riskFactors', 'symptoms', 'examsTests', 'prevention', 'outlook'].map((field) => (

                <Grid size={{xs: 12}} key={field}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                            <Typography>
                                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Box sx={{mb: 2}}>
                                <TextField
                                    fullWidth
                                    label={`Add ${field}`}
                                    value={field === 'causes' ? newCauseText : field === 'riskFactors' ? newRiskFactorText : field === 'symptoms' ? newSymptomText : field === 'examsTests' ? newExamText : field === 'prevention' ? newPreventionText : newOutlookText}
                                    onChange={(e) => {
                                        switch (field) {
                                            case 'causes':
                                                setNewCauseText(e.target.value);
                                                break;
                                            case 'riskFactors':
                                                setNewRiskFactorText(e.target.value);
                                                break;
                                            case 'symptoms':
                                                setNewSymptomText(e.target.value);
                                                break;
                                            case 'examsTests':
                                                setNewExamText(e.target.value);
                                                break;
                                            case 'prevention':
                                                setNewPreventionText(e.target.value);
                                                break;
                                            case 'outlook':
                                                setNewOutlookText(e.target.value);
                                                break;
                                            default:
                                                setNewItemText(e.target.value);
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddListItem(field, field === 'causes' ? newCauseText : field === 'riskFactors' ? newRiskFactorText : field === 'symptoms' ? newSymptomText : field === 'examsTests' ? newExamText : field === 'prevention' ? newPreventionText : newOutlookText);
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <Button
                                                onClick={() => handleAddListItem(field, field === 'causes' ? newCauseText : field === 'riskFactors' ? newRiskFactorText : field === 'symptoms' ? newSymptomText : field === 'examsTests' ? newExamText : field === 'prevention' ? newPreventionText : newOutlookText)}
                                                variant="contained"
                                                size="small"
                                                sx={{ml: 1}}
                                            >
                                                Add
                                            </Button>
                                        ),
                                    }}
                                />
                            </Box>
                            <List dense>
                                {adviceContent[field].map((item, index) => (
                                    <ListItem key={index}>
                                        <ListItemText primary={item}/>
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={() => handleRemoveListItem(field, index)}
                                            >
                                                <DeleteIcon/>
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            ))}

            {/* Treatment Section */}
            <Grid size={{xs: 12}}>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography>Treatment Options</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    label="Treatment Type"
                                    value={newTreatment.type}
                                    onChange={(e) => setNewTreatment(prev => ({
                                        ...prev,
                                        type: e.target.value
                                    }))}
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    value={newTreatment.description}
                                    onChange={(e) => setNewTreatment(prev => ({
                                        ...prev,
                                        description: e.target.value
                                    }))}
                                    multiline
                                    rows={2}
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <Button
                                    variant="contained"
                                    onClick={handleAddTreatment}
                                    disabled={!newTreatment.type || (!newTreatment.description && !newTreatment.details.length)}
                                >
                                    Add Treatment
                                </Button>
                            </Grid>
                        </Grid>
                        <List dense>
                            {adviceContent.treatment.map((treatment, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={treatment.type}
                                        secondary={treatment.description}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => handleRemoveListItem('treatment', index)}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            </Grid>

            {/* Support Groups */}
            <Grid size={{xs: 12}}>
                <TextField
                    fullWidth
                    label="Support Groups Information"
                    value={adviceContent.supportGroups}
                    onChange={(e) => setAdviceContent(prev => ({
                        ...prev,
                        supportGroups: e.target.value
                    }))}
                    multiline
                    rows={2}
                />
            </Grid>

            {/* References Section */}
            <Grid size={{xs: 12}}>
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                        <Typography>References</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    label="Reference Title"
                                    value={newReference.title}
                                    onChange={(e) => setNewReference(prev => ({
                                        ...prev,
                                        title: e.target.value
                                    }))}
                                />
                            </Grid>
                            <Grid size={{xs: 12, sm: 6}}>
                                <TextField
                                    fullWidth
                                    label="Source"
                                    value={newReference.source}
                                    onChange={(e) => setNewReference(prev => ({
                                        ...prev,
                                        source: e.target.value
                                    }))}
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <TextField
                                    fullWidth
                                    label="Author"
                                    value={newReference.author}
                                    onChange={(e) => setNewReference(prev => ({
                                        ...prev,
                                        author: e.target.value
                                    }))}
                                />
                            </Grid>
                            <Grid size={{xs: 12}}>
                                <Button
                                    variant="contained"
                                    onClick={handleAddReference}
                                    disabled={!newReference.title || !newReference.source}
                                >
                                    Add Reference
                                </Button>
                            </Grid>
                        </Grid>
                        <List dense>
                            {adviceContent.references.map((ref, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        primary={ref.title}
                                        secondary={`${ref.source} - ${ref.author}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            aria-label="delete"
                                            onClick={() => {
                                                setAdviceContent(prev => ({
                                                    ...prev,
                                                    references: prev.references.filter((_, i) => i !== index)
                                                }));
                                            }}
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionDetails>
                </Accordion>
            </Grid>
        </>
    );

    return (
        <>
            <Paper elevation={3} sx={{p: 3, maxWidth: '800px', mx: 'auto', my: 4}}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                        backgroundColor: '#3949ab', // Slightly lighter shade for better contrast
                        color: 'white',
                        padding: '5px 5px', // Increased padding for better spacing
                        borderRadius: 2, // Smaller, subtle corner radius
                        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)', // Softer shadow for a modern feel
                    }}
                >
                    <IconButton
                        onClick={handleBack}
                        sx={{
                            '&:hover': {
                                transform: 'scale(1.1)',
                                backgroundColor: 'rgba(0, 0, 0, 0.1)', // Subtle hover effect
                            },
                            transition: 'transform 0.2s ease-in-out', // Smooth hover animation
                        }}
                    >
                        <ArrowBackIcon sx={{ color: '#81c784', fontSize: '40px' }} />
                    </IconButton>

                    <Typography
                        variant="h5" // Larger and bolder for prominence
                        gutterBottom
                        sx={{
                            fontWeight: 600, // Make the text bold
                            textAlign: 'center', // Center align the text
                            flexGrow: 1, // Ensure it takes up the remaining space
                            color: '#ffffff', // White for contrast
                        }}
                    >
                        Create New Feed
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid size={{xs: 12}}>
                            <TextField
                                fullWidth
                                label="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </Grid>

                        <Grid size={{xs: 12}}>
                            <TextField
                                fullWidth
                                label="Snippet"
                                value={snippet}
                                onChange={(e) => setSnippet(e.target.value)}
                                multiline
                                rows={2}
                                required
                                helperText="A brief summary of the feed content"
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 6}}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    label="Type"
                                >
                                    {FEED_TYPES.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {type === 'advice' && renderAdviceForm()}

                        <Grid size={{xs: 12, sm: 6}}>
                            <TextField
                                fullWidth
                                label="Country"
                                value={country}
                                readOnly
                            />
                        </Grid>

                        <Grid size={{xs: 12, sm: 6}}>
                            <FormControl fullWidth>
                                <InputLabel>State</InputLabel>
                                <Select
                                    value={state}
                                    onChange={handleStateChange}
                                    variant="filled"
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                                backgroundColor: '#134357',
                                            }
                                        },
                                    }}
                                    sx={{
                                        backgroundColor: '#FFF',
                                        color: '#000',
                                        overflow: 'auto',
                                    }}

                                >
                                    {getStateOptions()}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{xs: 12, sm: 6}}>
                            <FormControl fullWidth>
                                <InputLabel>LGA</InputLabel>
                                <Select
                                    value={lga}
                                    onChange={handleLGAChange}
                                    variant="filled"
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                                backgroundColor: '#134357',
                                            }
                                        },
                                    }}
                                    sx={{
                                        backgroundColor: '#FFF',
                                        color: '#000',
                                        overflow: 'auto',
                                    }}
                                >
                                    {getLGAOptions()}
                                </Select>
                            </FormControl>
                        </Grid>


                        <Grid size={{xs: 12}}>
                            <Box sx={{mb: 2}}>
                                <TextField
                                    fullWidth
                                    label="Add Alternative Names"
                                    value={newAltName}
                                    onChange={(e) => setNewAltName(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddAlternativeName();
                                        }
                                    }}
                                    InputProps={{
                                        endAdornment: (
                                            <Button
                                                onClick={handleAddAlternativeName}
                                                variant="contained"
                                                size="small"
                                                sx={{ml: 1}}
                                            >
                                                Add
                                            </Button>
                                        ),
                                    }}
                                />
                            </Box>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
                                {alternativeNames.map((name, index) => (
                                    <Chip
                                        key={index}
                                        label={name}
                                        onDelete={() => handleRemoveAlternativeName(name)}
                                    />
                                ))}
                            </Box>
                        </Grid>

                        <Grid size={{xs: 12}}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={isSubmitting}
                                sx={{mt: 2}}
                            >
                                {isSubmitting ? (
                                    <>
                                        <CircularProgress size={24} sx={{mr: 1}}/>
                                        Publishing...
                                    </>
                                ) : (
                                    'Publish Feed'
                                )}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </>
    );
}

export default CreateFeed;
