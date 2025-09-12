import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Button, TextField, Alert, CircularProgress, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

function JobPostDetailPage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/jobs/${id}/`);
      setPost(res.data);
    } catch (err) {
      let msg = 'Failed to fetch job details';
      if (err.response) {
        if (typeof err.response.data === 'string' && err.response.data.startsWith('<')) {
          msg += ': Server error or permission denied.';
        } else if (typeof err.response.data === 'object') {
          msg += ': ' + (err.response.data.detail || JSON.stringify(err.response.data));
        }
      } else if (err.message) {
        msg += ': ' + err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { 
    fetchPost();
  }, [fetchPost]);

  useEffect(() => {
    if (post) {
      setLikeCount(post.like_count || 0);
      setLiked(post.liked_by_user || false);
    }
  }, [post]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError('');
    try {
      await api.post(`/jobs/${id}/comments/`, { text: comment });
      setComment('');
      fetchPost();
    } catch {
      setCommentError('Failed to add comment');
    }
  };

  const handleDeleteComment = async (cid) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/jobs/comments/${cid}/`);
      fetchPost();
    } catch {}
  };

  const handleLike = async () => {
    if (!user) return;
    setLikeLoading(true);
    try {
      const res = await api.post(`/jobs/${id}/like/`);
      setLiked(res.data.liked);
      setLikeCount(res.data.like_count);
    } catch {}
    setLikeLoading(false);
  };

  if (loading) return <Container sx={{ mt: 8 }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 8 }}><Alert severity="error">{error}</Alert></Container>;
  if (!post) return null;

  return (
    <Container sx={{ mt: 8 }}>
      <Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
      <Card>
        <CardContent>
          <Typography variant="h5">{post.title}</Typography>
          <Typography variant="subtitle1" color="text.secondary">{post.company}</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>{post.description}</Typography>
          {post.link && <Typography variant="body2" sx={{ mt: 1 }}><a href={post.link} target="_blank" rel="noopener noreferrer">More Info</a></Typography>}
          <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Posted by: {post.created_by?.username}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <IconButton onClick={handleLike} disabled={!user || likeLoading} color={liked ? 'error' : 'default'}>
              {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="body2">{likeCount}</Typography>
          </Box>
        </CardContent>
      </Card>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Comments</Typography>
        <List>
          {post.comments.map(c => (
            <ListItem key={c.id} secondaryAction={user && c.user?.id === user.id ? (
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteComment(c.id)}><DeleteIcon /></IconButton>
            ) : null}>
              <ListItemText primary={c.text} secondary={`by ${c.user?.username} on ${new Date(c.created_at).toLocaleString()}`} />
            </ListItem>
          ))}
        </List>
        {(user?.role === 'student' || user?.role === 'alumni') && (
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 2 }}>
            <TextField label="Add a comment" value={comment} onChange={e => setComment(e.target.value)} fullWidth required multiline rows={2} />
            {commentError && <Alert severity="error" sx={{ mt: 1 }}>{commentError}</Alert>}
            <Button type="submit" variant="contained" sx={{ mt: 1 }}>Post Comment</Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default JobPostDetailPage; 