'use client';

import React, { useState, useCallback } from 'react';
import { IconButton, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/server/db/fireStore';
import { toast } from 'sonner';
import { NotificationManager } from '@/utils/notificationManager';

export default function ActionMenu({ item, type, healthWorkerProfile, onDelete }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const router = useRouter();
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        handleClose();
        const editPath = type === 'news'
            ? `/health-worker/info-hub/news/create?edit=${item.id}`
            : type === 'feeds'
                ? `/health-worker/info-hub/feeds/create?edit=${item.id}`
                : `/health-worker/info-hub/tips-guides/create?edit=${item.id}`;
        router.push(editPath);
    };

    const handleDelete = () => {
        handleClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const collectionName = type === 'news'
                ? 'news'
                : type === 'feeds'
                    ? 'feeds'
                    : 'tipsAndGuides';
            await deleteDoc(doc(db, collectionName, item.id));
            setDeleteDialogOpen(false);
            toast.success(`${type === 'news'
                ? 'News article'
                : type === 'feeds'
                    ? 'Feed'
                    : 'Tip/Guide'} deleted successfully`);

            // Call the onDelete callback if provided
            if (onDelete) {
                onDelete();
            } else {
                // Fallback to default refresh behavior
                if (window.location.pathname.includes('/edit/') || window.location.pathname.includes(`/${item.id}`)) {
                    router.push(type === 'news'
                        ? '/health-worker/info-hub/news'
                        : type === 'feeds'
                            ? '/health-worker/info-hub/feeds'
                            : '/health-worker/info-hub/tips-guides');
                } else {
                    router.refresh();
                }
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete. Please try again.');
        }
    };

    // Only render if user is the author
    if (!healthWorkerProfile?._id || !item?.author?.id || item.author.id !== healthWorkerProfile._id) {
        return null;
    }

    return (
        <>
            <IconButton
                onClick={handleClick}
                aria-label="more options"
                aria-controls={open ? 'action-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{
                    color: 'white',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                }}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="action-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'action-button',
                }}
            >
                <MenuItem onClick={handleEdit}>
                    <EditIcon sx={{ mr: 1 }} />
                    Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} />
                    Delete
                </MenuItem>
            </Menu>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    {`Delete ${type === 'news'
                        ? 'News Article'
                        : type === 'feeds'
                            ? 'Feed'
                            : 'Tip/Guide'}`}
                </DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this {type === 'news'
                    ? 'news article'
                    : type === 'feeds'
                        ? 'feed'
                        : 'tip/guide'}? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
