import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, CircularProgress, Card, CardContent, Grid, Avatar, CardHeader } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function JobBoardPage() {
  const { user } = useContext(AuthContext);
  const isAlumni = user?.role === 'alumni';
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editPost, setEditPost] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', company: '', link: '' });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/jobs/');
      setPosts(res.data.results || res.data);
    } catch (err) {
      let msg = 'Failed to fetch posts';
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
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleOpen = (post = null) => {
    setEditPost(post);
    setForm(post ? { ...post } : { title: '', description: '', company: '', link: '' });
    setFormError('');
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (editPost) {
        await api.put(`/jobs/${editPost.id}/`, form);
      } else {
        await api.post('/jobs/', form);
      }
      setOpen(false);
      fetchPosts();
    } catch (err) {
      let msg = 'Failed to save post';
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        msg += ': ' + (err.response.data.detail || JSON.stringify(err.response.data));
      } else if (err.message) {
        msg += ': ' + err.message;
      }
      setFormError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/jobs/${id}/`);
      fetchPosts();
    } catch (err) {
      let msg = 'Failed to delete post';
      if (err.response && err.response.data && typeof err.response.data === 'object') {
        msg += ': ' + (err.response.data.detail || JSON.stringify(err.response.data));
      } else if (err.message) {
        msg += ': ' + err.message;
      }
      setError(msg);
    }
  };

  return (
    <Container sx={{ mt: 8, minHeight: '80vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4, borderRadius: 3 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Job Board
      </Typography>
      {isAlumni && (
        <Box sx={{ maxWidth: 900, mx: 'auto', mb: 2 }}>
          <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpen()}>Create Post</Button>
        </Box>
      )}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && posts.length === 0 && <Box sx={{ textAlign: 'center', mt: 4 }}><Typography variant="h6">No job posts yet.</Typography><Typography variant="body2" color="text.secondary">Be the first to post a job opportunity!</Typography></Box>}
      <Grid container spacing={2} sx={{ mt: 2, maxWidth: 900, mx: 'auto' }}>
        {posts.map(post => (
          <Grid item xs={12} md={6} key={post.id}>
            <Card sx={{ cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }} onClick={() => navigate(`/jobs/${post.id}`)}>
              <CardHeader
                avatar={<Avatar>{post.company ? post.company[0].toUpperCase() : '?'}</Avatar>}
                title={post.title}
                subheader={post.company}
              />
              <CardContent>
                <Typography variant="body2" sx={{ mt: 1 }}>{post.description.slice(0, 100)}...</Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>Posted by: {post.created_by?.username}</Typography>
                {isAlumni && post.created_by?.id === user.id && (
                  <Box sx={{ mt: 1 }}>
                    <Button size="small" onClick={e => { e.stopPropagation(); handleOpen(post); }}>Edit</Button>
                    <Button size="small" color="error" onClick={e => { e.stopPropagation(); handleDelete(post.id); }}>Delete</Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editPost ? 'Edit Post' : 'Create Post'}</DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error">{formError}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, minWidth: 350 }}>
            <TextField label="Title" name="title" value={form.title} onChange={handleFormChange} fullWidth margin="normal" required />
            <TextField label="Description" name="description" value={form.description} onChange={handleFormChange} fullWidth margin="normal" required multiline rows={3} />
            <TextField label="Company" name="company" value={form.company} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField label="Link" name="link" value={form.link} onChange={handleFormChange} fullWidth margin="normal" />
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">Save</Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
}

export default JobBoardPage; 