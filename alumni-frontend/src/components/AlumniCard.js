import React, { useContext, useState, useEffect } from 'react';
import { Card, CardContent, Typography, Chip, Box, Avatar, CardHeader, Button, CircularProgress, Tooltip, IconButton } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import VisibilityIcon from '@mui/icons-material/Visibility';

function AlumniCard({ alumni, onConnectionChange }) {
  const { token, user } = useContext(AuthContext);
  const [connectionStatus, setConnectionStatus] = useState(null); // 'none', 'pending', 'accepted', 'rejected'
  const [loading, setLoading] = useState(false);
  const [connectionId, setConnectionId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.id === alumni.id) return;
    setLoading(true);
    api.get(`/users/connections/`)
      .then(res => {
        // Check for any connection between user and alumni (bidirectional)
        const req = res.data.find(r =>
          (r.to_user.id === alumni.id && r.from_user.id === user.id) ||
          (r.from_user.id === alumni.id && r.to_user.id === user.id)
        );
        if (req) {
          setConnectionStatus(req.status);
          setConnectionId(req.id);
        } else {
          setConnectionStatus('none');
          setConnectionId(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setConnectionStatus('none');
        setConnectionId(null);
        setLoading(false);
      });
  }, [alumni.id, token, user]);

  const handleConnect = async () => {
    setLoading(true);
    setFeedback('');
    // Prevent duplicate requests if already connected or pending
    if (connectionStatus === 'pending' || connectionStatus === 'accepted') {
      setLoading(false);
      return;
    }
    try {
      const res = await api.post('/users/connections/', { to_user_id: alumni.id });
      setConnectionStatus('pending');
      setConnectionId(res.data.id);
      setFeedback('Connection request sent!');
      if (onConnectionChange) onConnectionChange();
    } catch (err) {
      let msg = 'Could not send request';
      if (err.response) {
        if (typeof err.response.data === 'string' && err.response.data.startsWith('<')) {
          msg += ': Server error or permission denied.';
        } else if (typeof err.response.data === 'object') {
          msg += ': ' + (err.response.data.detail || JSON.stringify(err.response.data));
        }
      } else if (err.message) {
        msg += ': ' + err.message;
      }
      setFeedback(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!connectionId) return;
    setLoading(true);
    setFeedback('');
    try {
      await api.delete(`/users/connections/${connectionId}/`);
      setConnectionStatus('none');
      setConnectionId(null);
      setFeedback('Connection removed.');
      if (onConnectionChange) onConnectionChange();
    } catch (err) {
      setFeedback('Failed to remove connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!connectionId) return;
    setLoading(true);
    setFeedback('');
    try {
      await api.delete(`/users/connections/${connectionId}/`);
      setConnectionStatus('none');
      setConnectionId(null);
      setFeedback('Request cancelled.');
      if (onConnectionChange) onConnectionChange();
    } catch (err) {
      setFeedback('Failed to cancel request.');
    } finally {
      setLoading(false);
    }
  };

  let button = null;
  let statusLabel = null;
  if (connectionStatus === 'pending') {
    button = <Button variant="outlined" color="warning" onClick={handleCancel} disabled={loading}>Cancel Request</Button>;
    statusLabel = <Chip label="Pending" color="warning" size="small" sx={{ ml: 1 }} />;
  } else if (connectionStatus === 'accepted') {
    button = <Button variant="outlined" color="error" onClick={handleRemove} disabled={loading}>Remove Connection</Button>;
    statusLabel = <Chip label="Connected" color="primary" size="small" sx={{ ml: 1 }} />;
  } else if (connectionStatus === 'rejected') {
    button = <Button variant="outlined" color="error" disabled>Rejected</Button>;
    statusLabel = <Chip label="Rejected" color="error" size="small" sx={{ ml: 1 }} />;
  } else {
    button = <Button variant="contained" onClick={handleConnect} disabled={loading}>Connect</Button>;
  }

  const handleProfileClick = () => {
    navigate(`/profile/${alumni.id}`);
  };

  return (
    <Card sx={{ 
      height: '100%',
      borderRadius: 4, 
      boxShadow: 3, 
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': { 
        transform: 'translateY(-8px)',
        boxShadow: 8,
        '& .profile-avatar': {
          transform: 'scale(1.1)'
        }
      }
    }}>
      {/* Role-based gradient header */}
      <Box sx={{
        height: 80,
        background: alumni.role === 'alumni' 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : alumni.role === 'student' 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="20" cy="20" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3
        }
      }} />

      <CardContent sx={{ p: 3, pt: 6 }}>
        {/* Profile Avatar */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Avatar 
            src={alumni.profile_picture || undefined} 
            onClick={handleProfileClick} 
            className="profile-avatar"
            sx={{ 
              cursor: 'pointer',
              width: 80,
              height: 80,
              border: '4px solid white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              position: 'absolute',
              top: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              transition: 'transform 0.3s ease',
              bgcolor: alumni.role === 'alumni' ? 'primary.main' : alumni.role === 'student' ? 'secondary.main' : 'warning.main'
            }}
          >
            {alumni.username[0].toUpperCase()}
          </Avatar>
        </Box>

        {/* User Info */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
            {alumni.first_name} {alumni.last_name}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            @{alumni.username}
          </Typography>
          
          {/* Role and Graduation Chips */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={alumni.role === 'alumni' ? 'Alumni' : alumni.role === 'student' ? 'Student' : 'Admin'}
              color={alumni.role === 'alumni' ? 'primary' : alumni.role === 'student' ? 'secondary' : 'warning'}
              size="small"
              sx={{ fontWeight: 600 }}
            />
            {alumni.graduation_year && (
              <Chip 
                icon={<SchoolIcon />}
                label={`Class of ${alumni.graduation_year}`}
                variant="outlined"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>

          {/* Job Title */}
          {alumni.job_title && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mb: 2 }}>
              <WorkIcon fontSize="small" color="primary" />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {alumni.job_title} {alumni.company && `@ ${alumni.company}`}
              </Typography>
            </Box>
          )}

          {/* Location */}
          {alumni.location && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              📍 {alumni.location}
            </Typography>
          )}

          {/* Skills */}
          {alumni.skills && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                Skills:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                {alumni.skills.split(',').slice(0, 3).map((skill, index) => (
                  <Chip 
                    key={index}
                    label={skill.trim()} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
                {alumni.skills.split(',').length > 3 && (
                  <Chip 
                    label={`+${alumni.skills.split(',').length - 3} more`}
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', fontStyle: 'italic' }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Bio */}
          {alumni.bio && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textAlign: 'left',
                lineHeight: 1.5
              }}
            >
              {alumni.bio}
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        {user && user.id !== alumni.id && (
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Tooltip title="View Profile">
              <IconButton 
                onClick={handleProfileClick}
                sx={{ 
                  bgcolor: 'primary.50',
                  '&:hover': { bgcolor: 'primary.100' }
                }}
              >
                <VisibilityIcon color="primary" />
              </IconButton>
            </Tooltip>
            
            {button}
            
            {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
            {statusLabel}
          </Box>
        )}

        {/* Feedback Message */}
        {feedback && (
          <Typography 
            variant="caption" 
            color={feedback.includes('sent') || feedback.includes('removed') || feedback.includes('cancelled') ? 'primary.main' : 'error.main'}
            sx={{ 
              display: 'block', 
              textAlign: 'center', 
              mt: 1,
              fontWeight: 500
            }}
          >
            {feedback}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default AlumniCard; 