import React, { useContext, useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardMedia, Avatar, Typography, IconButton, Menu, MenuItem, Snackbar, CircularProgress } from '@mui/material';
import { MoreVert as MoreVertIcon, Delete as DeleteIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, ChatBubbleOutline as CommentIcon, Send as SendIcon, ThumbUp as ThumbUpIcon, ThumbUpOffAlt as ThumbUpOffAltIcon } from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Collapse, Tooltip, Divider, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction } from '@mui/material';

/**
 * PostCard Component
 * Displays individual posts with like, comment, and reply functionality
 * Handles real-time interactions and user permissions
 */
function PostCard({ post, onDelete }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // UI state management
  const [anchorEl, setAnchorEl] = useState(null);           // Menu anchor for post actions
  const [showComments, setShowComments] = useState(false);  // Toggle comments visibility
  const [replyingTo, setReplyingTo] = useState(null);       // Track which comment is being replied to
  
  // Post interaction state
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [liked, setLiked] = useState(post.liked_by_user || false);
  const [likeLoading, setLikeLoading] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [deletedCommentIds, setDeletedCommentIds] = useState([]);
  
  // Reply state
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  
  // Comment likes state
  const [commentLikes, setCommentLikes] = useState({});
  
  // UI feedback state
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  
  // Permission checks
  const isAuthor = user && post.author && user.id === post.author.id;
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    handleMenuClose();
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/users/posts/${post.id}/`);
        if (onDelete) {
          onDelete(post.id);
        }
      } catch (err) {
        alert('Failed to delete post.');
      }
    }
  };

  const handleProfileClick = () => {
    if (post.author) {
      navigate(`/profile/${post.author.id}`);
    }
  };

  const handleLike = async () => {
    // Optimistically update UI
    setLiked(prev => !prev);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
    setLikeLoading(true);
    try {
      const res = await api.post(`/users/posts/${post.id}/like/`);
      // Use backend response if available
      if (typeof res.data.like_count === 'number') {
        setLikeCount(res.data.like_count);
      }
      if (typeof res.data.liked === 'boolean') {
        setLiked(res.data.liked);
      }
    } catch (err) {
      // Revert optimistic update on error
      setLiked(prev => !prev);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      const res = await api.post(`/users/posts/${post.id}/comments/`, { content: commentText });
      setComments((prev) => [...prev, res.data]);
      setCommentText('');
    } catch (err) {
      // Optionally show error
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);
    try {
      await api.delete(`/users/comments/${commentId}/`);
      setDeletedCommentIds((prev) => [...prev, commentId]);
    } catch (err) {
      // Optionally show error
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleReply = (commentId) => {
    setReplyingTo(commentId);
    setReplyText('');
  };

  const handleAddReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await api.post(`/users/posts/${post.id}/comments/`, { content: replyText, parent: parentId });
      setComments((prev) => [...prev, res.data]);
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      // Optionally show error
    } finally {
      setReplyLoading(false);
    }
  };

  const handleLikeComment = async (comment) => {
    if (!user) return;
    const isLiked = commentLikes[comment.id]?.liked;
    setLikeLoading((prev) => ({ ...prev, [comment.id]: true }));
    // Optimistic update
    setCommentLikes((prev) => ({
      ...prev,
      [comment.id]: {
        count: isLiked ? Math.max(0, (prev[comment.id]?.count || 1) - 1) : (prev[comment.id]?.count || 0) + 1,
        liked: !isLiked,
      },
    }));
    try {
      if (isLiked) {
        await api.delete(`/users/comments/${comment.id}/like/`);
      } else {
        await api.post(`/users/comments/${comment.id}/like/`);
      }
      // Refetch like state for this comment
      const res = await api.get(`/users/comments/${comment.id}/like/`);
      setCommentLikes((prev) => ({
        ...prev,
        [comment.id]: { count: res.data.count, liked: res.data.liked },
      }));
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update like. Please try again.' });
      // Rollback optimistic update
      setCommentLikes((prev) => ({
        ...prev,
        [comment.id]: {
          count: commentLikes[comment.id]?.count || 0,
          liked: commentLikes[comment.id]?.liked || false,
        },
      }));
    } finally {
      setLikeLoading((prev) => ({ ...prev, [comment.id]: false }));
    }
  };

  const topLevelComments = comments.filter(c => !c.parent);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parent) {
      acc[c.parent] = acc[c.parent] || [];
      acc[c.parent].push(c);
    }
    return acc;
  }, {});

  // Fetch like count and status for all comments and replies on mount or when comments change
  useEffect(() => {
    if (!user || !comments.length) return;
    const fetchLikes = async () => {
      const allComments = [...comments, ...comments.flatMap(c => repliesByParent[c.id] || [])];
      const likeStates = {};
      await Promise.all(
        allComments.map(async (comment) => {
          try {
            const res = await api.get(`/users/comments/${comment.id}/like/`);
            likeStates[comment.id] = { count: res.data.count, liked: res.data.liked };
          } catch {
            likeStates[comment.id] = { count: 0, liked: false };
          }
        })
      );
      setCommentLikes(likeStates);
    };
    fetchLikes();
    // eslint-disable-next-line
  }, [comments, user]);

  // Debug: likeLoading state (remove in production)

  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardHeader
          avatar={
            <Avatar 
              src={post.author?.profile_picture || undefined} 
              onClick={handleProfileClick}
              sx={{ cursor: 'pointer', width: 48, height: 48 }}
            >
              {post.author?.username[0].toUpperCase()}
            </Avatar>
          }
          action={
            isAuthor && (
              <>
                <IconButton aria-label="settings" onClick={handleMenuClick}>
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1 }} /> Delete
                  </MenuItem>
                </Menu>
              </>
            )
          }
          title={
            <Typography 
              variant="subtitle1" 
              onClick={handleProfileClick}
              sx={{ fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}
            >
              {post.author ? `${post.author.first_name} ${post.author.last_name}` : 'Anonymous'}
            </Typography>
          }
          subheader={
            <Typography variant="caption" color="text.secondary">
              @{post.author?.username || 'anonymous'} · {new Date(post.created_at).toLocaleString()}
            </Typography>
          }
          sx={{ alignItems: 'flex-start' }}
        />
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
            {post.content}
          </Typography>
        </CardContent>
        {post.image && (
          <CardMedia
            component="img"
            image={post.image}
            alt={`Posted by ${post.author?.username}`}
            sx={{ maxHeight: 500, objectFit: 'cover' }}
          />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, pb: 1 }}>
          <Tooltip title={liked ? 'Unlike' : 'Like'}>
            <span>
              <IconButton
                onClick={handleLike}
                disabled={likeLoading}
                color={liked ? 'error' : 'default'}
              >
                {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </span>
          </Tooltip>
          <Typography variant="body2" sx={{ mr: 2 }}>{likeCount}</Typography>
          <Tooltip title="Comments">
            <IconButton onClick={handleToggleComments}>
              <CommentIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="body2">{comments.length}</Typography>
        </Box>
        <Collapse in={showComments} timeout="auto" unmountOnExit>
          <Divider />
          <Box sx={{ px: 2, py: 1 }}>
            <form onSubmit={handleAddComment} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TextField
                size="small"
                placeholder="Add a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                fullWidth
                disabled={commentLoading || !user}
              />
              <Button type="submit" variant="contained" color="primary" disabled={commentLoading || !user || !commentText.trim()}>
                {commentLoading ? <CircularProgress size={20} /> : <SendIcon />}
              </Button>
            </form>
            <List dense sx={{ mt: 1 }}>
              {comments.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 1 }}>
                  No comments yet.
                </Typography>
              )}
              {topLevelComments.map((comment) => (
                <Box key={comment.id}>
                  <ListItem alignItems="flex-start" sx={{ pl: 0 }}>
                    <ListItemAvatar>
                      <Avatar>{comment.user?.username?.[0]?.toUpperCase?.() || '?'}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{comment.user?.username}</Typography>}
                      secondary={
                        deletedCommentIds.includes(comment.id) ? (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }} component="span">
                            This comment was deleted.
                          </Typography>
                        ) : <>
                          <Typography variant="body2" color="text.secondary" component="span">{comment.content}</Typography>
                          <Typography variant="caption" color="text.secondary" component="span">{new Date(comment.created_at).toLocaleString()}</Typography>
                        </>
                      }
                    />
                    <IconButton size="small" onClick={() => handleLikeComment(comment)} disabled={likeLoading[comment.id]}>
                      {likeLoading[comment.id] ? <CircularProgress size={18} /> : (commentLikes[comment.id]?.liked ? <ThumbUpIcon color="primary" fontSize="small" /> : <ThumbUpOffAltIcon fontSize="small" />)}
                    </IconButton>
                    <Typography variant="caption" sx={{ minWidth: 18, textAlign: 'center' }}>{commentLikes[comment.id]?.count || 0}</Typography>
                    <Button size="small" onClick={() => handleReply(comment.id)} sx={{ ml: 1 }}>
                      Reply
                    </Button>
                    {user && comment.user?.id === user.id && (
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteComment(comment.id)} disabled={deletingCommentId === comment.id}>
                          {deletingCommentId === comment.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                  {replyingTo === comment.id && (
                    <Box sx={{ pl: 7, pr: 2, pb: 1 }}>
                      <form onSubmit={e => handleAddReply(e, comment.id)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TextField
                          size="small"
                          placeholder="Write a reply..."
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          fullWidth
                          disabled={replyLoading || !user}
                        />
                        <Button type="submit" variant="contained" color="primary" disabled={replyLoading || !user || !replyText.trim()}>
                          {replyLoading ? <CircularProgress size={20} /> : <SendIcon />}
                        </Button>
                        <Button onClick={() => setReplyingTo(null)} size="small">Cancel</Button>
                      </form>
                    </Box>
                  )}
                  {repliesByParent[comment.id] && repliesByParent[comment.id].map(reply => (
                    <ListItem key={reply.id} alignItems="flex-start" sx={{ pl: 7 }}>
                      <ListItemAvatar>
                        <Avatar>{reply.user?.username?.[0]?.toUpperCase?.() || '?'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{reply.user?.username}</Typography>}
                        secondary={
                          deletedCommentIds.includes(reply.id) ? (
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }} component="span">
                              This comment was deleted.
                            </Typography>
                          ) : <>
                            <Typography variant="body2" color="text.secondary" component="span">{reply.content}</Typography>
                            <Typography variant="caption" color="text.secondary" component="span">{new Date(reply.created_at).toLocaleString()}</Typography>
                          </>
                        }
                      />
                      <IconButton size="small" onClick={() => handleLikeComment(reply)} disabled={likeLoading[reply.id]}>
                        {likeLoading[reply.id] ? <CircularProgress size={18} /> : (commentLikes[reply.id]?.liked ? <ThumbUpIcon color="primary" fontSize="small" /> : <ThumbUpOffAltIcon fontSize="small" />)}
                      </IconButton>
                      <Typography variant="caption" sx={{ minWidth: 18, textAlign: 'center' }}>{commentLikes[reply.id]?.count || 0}</Typography>
                      {user && reply.user?.id === user.id && (
                        <ListItemSecondaryAction>
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteComment(reply.id)} disabled={deletingCommentId === reply.id}>
                            {deletingCommentId === reply.id ? <CircularProgress size={20} /> : <DeleteIcon />}
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </Box>
              ))}
            </List>
          </Box>
        </Collapse>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </>
  );
}

export default PostCard; 