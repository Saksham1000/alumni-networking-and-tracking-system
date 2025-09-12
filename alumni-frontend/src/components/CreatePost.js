import React, { useState, useContext } from 'react';
import { 
  Card, 
  TextField, 
  Button, 
  Box, 
  Avatar, 
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

function CreatePost({ onPostCreated }) {
  const { user } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      await api.post('/users/feed/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setContent('');
      setImage(null);
      setPreview('');
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
        <Avatar src={user?.profile_picture} sx={{ width: 48, height: 48, mr: 2 }} />
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder={`What's on your mind, ${user?.first_name}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
            },
          }}
        />
      </Box>

      {preview && (
        <Box sx={{ mb: 2, position: 'relative' }}>
          <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px' }} />
          <IconButton
            onClick={() => { setImage(null); setPreview(''); }}
            sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <IconButton color="primary" component="label">
          <ImageIcon />
          <input type="file" accept="image/*" hidden onChange={handleImageChange} />
        </IconButton>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Post'}
        </Button>
      </Box>
    </Card>
  );
}

export default CreatePost; 