'use client';

import React, {useState, useEffect} from 'react';
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
import {addDoc, collection, doc, getDoc, serverTimestamp, updateDoc} from 'firebase/firestore';
import {db} from '@/server/db/fireStore';
import {toast} from 'sonner';
import {statesAndLGAs} from "@/utils/data";
import {useRouter} from 'next/navigation';
import {ArrowBack as ArrowBackIcon} from "@mui/icons-material";
import TipTapEditor from "@/components/TipTapEditor/TipTapEditor";
import {NotificationManager} from '@/utils/notificationManager';
import {useSearchParams} from 'next/navigation';
import LazyLoading from "@/components/LazyLoading/LazyLoading";

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

    // Add edit mode support
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const [loading, setLoading] = useState(!!editId);

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

    // State for polls
    const [pollData, setPollData] = useState({
        question: '',
        options: []
    });
    const [newOption, setNewOption] = useState('');

    // State for alerts
    const [alertContent, setAlertContent] = useState({
        mainMessage: '',
        preventionMeasures: '',
        symptoms: '',
        emergencyInstructions: ''
    });

    // State for events
    const [eventData, setEventData] = useState({
        purpose: '',
        dateTime: '',
        location: '',
        registrationDetails: '',
        additionalInfo: ''
    });

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

    const renderAdviceForm = () => (
        <>
            <Grid size={{xs: 12}}>
                <TipTapEditor
                    value={adviceContent.introduction}
                    onChange={(value) => setAdviceContent(prev => ({...prev, introduction: value}))}
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

    const renderPollForm = () => (
        <Grid container spacing={3}>
            <Grid size={{xs: 12}}>
                <TextField
                    fullWidth
                    label="Poll Question"
                    value={pollData.question}
                    onChange={(e) => setPollData(prev => ({...prev, question: e.target.value}))}
                    required
                />
            </Grid>

            <Grid size={{xs: 12}}>
                <Box sx={{mb: 2}}>
                    <TextField
                        fullWidth
                        label="Add Option"
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                if (newOption.trim()) {
                                    setPollData(prev => ({
                                        ...prev,
                                        options: [...prev.options, { text: newOption.trim(), votes: 0 }]
                                    }));
                                    setNewOption('');
                                }
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <Button
                                    onClick={() => {
                                        if (newOption.trim()) {
                                            setPollData(prev => ({
                                                ...prev,
                                                options: [...prev.options, { text: newOption.trim(), votes: 0 }]
                                            }));
                                            setNewOption('');
                                        }
                                    }}
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
                    {pollData.options.map((option, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={option.text} />
                            <ListItemSecondaryAction>
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => {
                                        setPollData(prev => ({
                                            ...prev,
                                            options: prev.options.filter((_, i) => i !== index)
                                        }));
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Grid>
        </Grid>
    );

    const renderAlertForm = () => (
        <Grid container spacing={3}>
            <Grid size={{xs: 12}}>
                <TextField
                    fullWidth
                    label="Main Alert Message"
                    value={alertContent.mainMessage}
                    onChange={(e) => setAlertContent(prev => ({...prev, mainMessage: e.target.value}))}
                    multiline
                    rows={4}
                    required
                />
            </Grid>

            <Grid size={{xs: 12}}>
                <TextField
                    fullWidth
                    label="Prevention/Safety Measures"
                    value={alertContent.preventionMeasures}
                    onChange={(e) => setAlertContent(prev => ({...prev, preventionMeasures: e.target.value}))}
                    multiline
                    rows={4}
                    helperText="Use markdown format. Example: 1. Measure one\n2. Measure two"
                />
            </Grid>

            <Grid size={{xs: 12}}>
                <TextField
                    fullWidth
                    label="Symptoms to Watch"
                    value={alertContent.symptoms}
                    onChange={(e) => setAlertContent(prev => ({...prev, symptoms: e.target.value}))}
                    multiline
                    rows={3}
                    helperText="Use markdown format. Example: - Symptom one\n- Symptom two"
                />
            </Grid>

            <Grid size={{xs: 12}}>
                <TextField
                    fullWidth
                    label="Emergency Instructions"
                    value={alertContent.emergencyInstructions}
                    onChange={(e) => setAlertContent(prev => ({...prev, emergencyInstructions: e.target.value}))}
                    multiline
                    rows={3}
                    required
                />
            </Grid>
        </Grid>
    );

    const renderEventForm = () => (
        <Grid container spacing={3}>
            <Grid size={{xs: 12}}>
                <TextField
                    fullWidth
                    label="Event Purpose"
                    value={eventData.purpose}
                    onChange={(e) => setEventData(prev => ({...prev, purpose: e.target.value}))}
                    multiline
                    rows={2}
                    required
                />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
                <TextField
                    fullWidth
                    label="Date and Time"
                    type="datetime-local"
                    value={eventData.dateTime}
                    onChange={(e) => setEventData(prev => ({...prev, dateTime: e.target.value}))}
                    InputLabelProps={{
                        shrink: true,
                    }}
                    required
                />
            </Grid>

            <Grid size={{xs: 12, sm: 6}}>
                <TextField
                    fullWidth
                    label="Location"
                    value={eventData.location}
                    onChange={(e) => setEventData(prev => ({...prev, location: e.target.value}))}
                    required
                />
            </Grid>

            <Grid size={{xs: 12}}>
                <TextField
                    fullWidth
                    label="Registration Details"
                    value={eventData.registrationDetails}
                    onChange={(e) => setEventData(prev => ({...prev, registrationDetails: e.target.value}))}
                    multiline
                    rows={2}
                />
            </Grid>

            <Grid size={{xs: 12}}>
                <TextField
                    fullWidth
                    label="Additional Information"
                    value={eventData.additionalInfo}
                    onChange={(e) => setEventData(prev => ({...prev, additionalInfo: e.target.value}))}
                    multiline
                    rows={3}
                />
            </Grid>
        </Grid>
    );

    // Load initial data if in edit mode
    useEffect(() => {
        const fetchFeedForEdit = async () => {
            if (editId) {
                try {
                    const docRef = doc(db, 'feeds', editId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Set all the form fields
                        setTitle(data.title || '');
                        setSnippet(data.snippet || '');
                        setType(data.type || 'advice');
                        setState(data.scope?.state || '');
                        setLGA(data.scope?.lga || '');
                        setCountry(data.scope?.country || 'Nigeria');
                        setAlternativeNames(data.alternativeNames || []);

                        if (data.type === 'advice' && data.content) {
                            setAdviceContent({
                                introduction: data.content.introduction || '',
                                causes: data.content.causes || [],
                                riskFactors: data.content.riskFactors || [],
                                symptoms: data.content.symptoms || [],
                                examsTests: data.content.examsTests || [],
                                treatment: data.content.treatment || [],
                                prevention: data.content.prevention || [],
                                outlook: data.content.outlook || [],
                                supportGroups: data.content.supportGroups || '',
                                references: data.content.references || []
                            });

                            // Set common types if they exist
                            if (data.content.commonTypes) {
                                setCommonTypes(data.content.commonTypes);
                            }
                        } else if (data.type === 'polls' && data.content) {
                            setPollData({
                                question: data.content.poll.question || '',
                                options: data.content.poll.options || []
                            });
                        } else if (data.type === 'alerts' && data.content) {
                            setAlertContent({
                                mainMessage: data.content.split('\n### Prevention Measures:\n')[0],
                                preventionMeasures: data.content.split('\n### Prevention Measures:\n')[1].split('\n### Symptoms to Watch:\n')[0],
                                symptoms: data.content.split('\n### Symptoms to Watch:\n')[1].split('\n### Emergency Instructions:\n')[0],
                                emergencyInstructions: data.content.split('\n### Emergency Instructions:\n')[1]
                            });
                        } else if (data.type === 'events' && data.content) {
                            setEventData({
                                purpose: data.content.purpose || '',
                                dateTime: data.content.dateTime || '',
                                location: data.content.location || '',
                                registrationDetails: data.content.registrationDetails || '',
                                additionalInfo: data.content.additionalInfo || ''
                            });
                        }
                    }
                } catch (error) {
                    console.error('Error fetching feed for edit:', error);
                    toast.error('Failed to load feed for editing');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchFeedForEdit();
    }, [editId]);

    // Update handleSubmit to handle different feed types
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !snippet.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        // Validate type-specific required fields
        if (type === 'polls' && (!pollData.question || pollData.options.length < 2)) {
            toast.error('Please add a question and at least two options for the poll');
            return;
        }

        if (type === 'alerts' && (!alertContent.mainMessage || !alertContent.emergencyInstructions)) {
            toast.error('Please fill in the main alert message and emergency instructions');
            return;
        }

        if (type === 'events' && (!eventData.purpose || !eventData.dateTime || !eventData.location)) {
            toast.error('Please fill in all required event details');
            return;
        }

        setIsSubmitting(true);
        try {
            let content;
            switch (type) {
                case 'advice':
                    content = adviceContent;
                    break;
                case 'polls':
                    content = {
                        poll: {
                            question: pollData.question,
                            options: pollData.options
                        }
                    };
                    break;
                case 'alerts':
                    content = `
${alertContent.mainMessage}

### Prevention Measures:
${alertContent.preventionMeasures}

### Symptoms to Watch:
${alertContent.symptoms}

### Emergency Instructions:
${alertContent.emergencyInstructions}
                    `.trim();
                    break;
                case 'events':
                    content = {
                        purpose: eventData.purpose,
                        dateTime: eventData.dateTime,
                        location: eventData.location,
                        registrationDetails: eventData.registrationDetails,
                        additionalInfo: eventData.additionalInfo
                    };
                    break;
            }

            const feedData = {
                title: title.trim(),
                snippet: snippet.trim(),
                content,
                type,
                scope: { lga, state, country },
                alternativeNames,
                status: 'published'
            };

            if (editId) {
                const feedRef = doc(db, 'feeds', editId);
                await updateDoc(feedRef, {
                    ...feedData,
                    updatedAt: serverTimestamp()
                });
                toast.success('Feed updated successfully');
            } else {
                const feedRef = collection(db, 'feeds');
                const feedDoc = await addDoc(feedRef, {
                    ...feedData,
                    timestamp: serverTimestamp(),
                    createdAt: serverTimestamp()
                });

                // Create notification for new feed
                await NotificationManager.createFeedNotification(
                    {
                        id: feedDoc.id,
                        title: feedData.title,
                        type: feedData.type,
                        snippet: feedData.snippet
                    },
                    {
                        lga,
                        state,
                        country
                    },
                    {
                        id: healthWorkerProfile._id,
                        name: `${healthWorkerProfile.firstName} ${healthWorkerProfile.lastName}`,
                        role: 'HealthWorker'
                    }
                );
                toast.success('Feed published successfully');
            }

            router.push('/health-worker/info-hub/feeds');
        } catch (error) {
            console.error('Error publishing feed:', error);
            toast.error(editId ? 'Failed to update feed' : 'Failed to publish feed');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <LazyLoading />;
    }

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
                        <ArrowBackIcon sx={{color: '#81c784', fontSize: '40px'}}/>
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
                        {editId ? 'Edit Feed' : 'Create New Feed'}
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
                        {type === 'polls' && renderPollForm()}
                        {type === 'alerts' && renderAlertForm()}
                        {type === 'events' && renderEventForm()}

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
                                        {editId ? 'Updating...' : 'Publishing...'}
                                    </>
                                ) : (
                                    editId ? 'Update Feed' : 'Publish Feed'
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
