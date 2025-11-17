import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Avatar, Chip, Button, Card, CardContent, CardHeader, Divider, Grid, Paper, Alert, CircularProgress, IconButton, Tooltip, Tabs, Tab } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import PostCard from '../components/PostCard';
import SchoolIcon from '@mui/icons-material/School';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

function PublicProfilePage() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [connectionId, setConnectionId] = useState(null);
  const [incomingRequest, setIncomingRequest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState('');
  const [msgLoading, setMsgLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [respondLoading, setRespondLoading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/users/public-profile/${id}/`);
        setProfile(res.data);
        
        if (user && user.id !== parseInt(id)) {
          try {
            const connRes = await api.get(`/users/connections/`);
            const profileId = parseInt(id);
            const userId = user.id;
            
            const req = connRes.data.find(r =>
              (r.from_user.id === userId && r.to_user.id === profileId) ||
              (r.to_user.id === userId && r.from_user.id === profileId)
            );
            
            if (req) {
              setConnectionStatus(req.status);
              setConnectionId(req.id);
              setIncomingRequest(req.to_user.id === userId);
            } else {
              setConnectionStatus('none');
              setConnectionId(null);
              setIncomingRequest(false);
            }
          } catch (connErr) {
            console.error('Error fetching connections:', connErr);
            setConnectionStatus('none');
            setIncomingRequest(false);
          }
        }
      } catch (err) {
        setError('Could not load profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      setPostsLoading(true);
      try {
        const res = await api.get(`/users/posts/user/${id}/`);
        setUserPosts(res.data);
      } catch (err) {
        // Error loading user posts - handled silently
      } finally {
        setPostsLoading(false);
      }
    };

    fetchProfile();
    fetchUserPosts();
  }, [id, user]);

  const handlePostDeleted = (deletedPostId) => {
    setUserPosts(userPosts.filter(post => post.id !== deletedPostId));
  };

  const handleConnect = async () => {
    setMsgLoading(true);
    try {
      if (connectionStatus === 'pending' || connectionStatus === 'accepted') {
        setMsgLoading(false);
        return;
      }
      
      const response = await api.post('/users/connections/', { to_user_id: parseInt(id) });
      setConnectionStatus('pending');
      setConnectionId(response.data.id);
      setIncomingRequest(false);
      // No notification - just UI update
    } catch (err) {
      // Silent error handling - no notification
    } finally {
      setMsgLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!connectionId) return;
    
    setCancelLoading(true);
    try {
      await api.delete(`/users/connections/${connectionId}/`);
      setConnectionStatus('none');
      setConnectionId(null);
      setIncomingRequest(false);
      // No notification - just UI update
    } catch (err) {
      // Silent error handling - no notification
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRespondToRequest = async (action) => {
    if (!connectionId) return;

    setRespondLoading(true);
    try {
      await api.post(`/users/connections/${connectionId}/${action}/`);
      if (action === 'accept') {
        setConnectionStatus('accepted');
      } else {
        setConnectionStatus('none');
        setConnectionId(null);
      }
      setIncomingRequest(false);
    } catch (err) {
      // Silent error handling - no notification
    } finally {
      setRespondLoading(false);
    }
  };

  if (loading) return <Container sx={{ mt: 8 }}><CircularProgress /></Container>;
  if (error || !profile) return <Container sx={{ mt: 8 }}><Alert severity="error">{error || 'Profile not found'}</Alert></Container>;

  const skills = (profile?.skills || '').split(',').map(s => s.trim()).filter(Boolean);
  const isOwnProfile = user && profile && user.id === profile.id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          background: profile?.role === 'alumni' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : profile?.role === 'student' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }
        }}
      >
        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Avatar 
            src={profile?.profile_picture} 
            sx={{ 
              width: 120, 
              height: 120, 
              mx: 'auto', 
              mb: 3,
              border: '6px solid white',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
            }} 
            alt="Profile picture" 
          />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            {profile?.first_name} {profile?.last_name}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            @{profile?.username}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Chip 
              label={profile?.role === 'alumni' ? 'Alumni' : profile?.role === 'student' ? 'Student' : 'Admin'}
              color={profile?.role === 'alumni' ? 'primary' : profile?.role === 'student' ? 'secondary' : 'warning'}
              sx={{ fontWeight: 600, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
            />
            {profile?.graduation_year && (
              <Chip 
                icon={<SchoolIcon />}
                label={`Class of ${profile.graduation_year}`}
                variant="outlined"
                sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)' }}
              />
            )}
          </Box>
          {profile?.job_title && (
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              {profile.job_title} {profile.company && `@ ${profile.company}`}
            </Typography>
          )}
          {profile?.location && (
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              📍 {profile.location}
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Tabs for different sections */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              minHeight: 48
            },
            '& .Mui-selected': {
              color: profile?.role === 'alumni' ? 'primary.main' : profile?.role === 'student' ? 'secondary.main' : 'warning.main'
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              background: profile?.role === 'alumni' 
                ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                : profile?.role === 'student' 
                ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
            }
          }}
        >
          <Tab label="About" />
          <Tab label="Skills" />
          <Tab label="Posts" />
        </Tabs>
      </Box>

      {/* About Tab */}
      {activeTab === 0 && (
        <Grid container spacing={4}>
          {/* Left Column - Profile Info */}
          <Grid item xs={12} md={4}>
          {/* Contact Info Card */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
            <CardHeader 
              title="Contact Information" 
              sx={{ 
                background: profile?.role === 'alumni' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : profile?.role === 'student' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '12px 12px 0 0'
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <EmailIcon color="primary" />
                <Typography 
                  variant="body2"
                  sx={{ 
                    wordBreak: 'break-all',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}
                >
                  <strong>Email:</strong> {profile?.email}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="primary" />
                <Typography variant="body2">
                  <strong>Graduation Year:</strong> {profile?.graduation_year || 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Connection Actions */}
          {user && !isOwnProfile && (
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Connect & Network
                </Typography>
                
                {connectionStatus === 'pending' ? (
                  incomingRequest ? (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {profile?.first_name || profile?.username || 'This user'} sent you a connection request.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleRespondToRequest('accept')}
                          disabled={respondLoading}
                          sx={{ minWidth: '150px', fontWeight: 600 }}
                        >
                          {respondLoading ? 'Updating...' : 'Accept'}
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<CloseIcon />}
                          onClick={() => handleRespondToRequest('reject')}
                          disabled={respondLoading}
                          sx={{ minWidth: '150px', fontWeight: 600 }}
                        >
                          {respondLoading ? 'Updating...' : 'Decline'}
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                        <Button 
                          variant="outlined" 
                          color="warning"
                          startIcon={<CancelIcon />}
                          onClick={handleCancelRequest}
                          disabled={cancelLoading}
                          sx={{ 
                            minWidth: '180px',
                            fontWeight: 600
                          }}
                        >
                          {cancelLoading ? 'Cancelling...' : 'Cancel Request'}
                        </Button>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Request sent. Waiting for {profile?.first_name || profile?.username || 'the user'} to respond.
                      </Typography>
                    </Box>
                  )
                ) : connectionStatus === 'accepted' ? (
                  // CONNECTED STATE - Show Connected button and Message option
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                      <Button 
                        variant="contained" 
                        color="success"
                        disabled
                        sx={{ 
                          minWidth: '120px',
                          fontWeight: 600
                        }}
                      >
                        Connected
                      </Button>
                      <Tooltip title="Send Message">
                        <IconButton 
                          sx={{ 
                            bgcolor: 'secondary.50',
                            '&:hover': { bgcolor: 'secondary.100' }
                          }}
                          onClick={() => navigate('/messages')}
                        >
                          <MessageIcon color="secondary" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                ) : (
                  // NO CONNECTION STATE - Show Connect button
                  <Box>
                    <Button 
                      variant="contained" 
                      onClick={handleConnect}
                      disabled={msgLoading}
                      sx={{ 
                        bgcolor: profile?.role === 'alumni' ? 'primary.main' : profile?.role === 'student' ? 'secondary.main' : 'warning.main',
                        '&:hover': {
                          bgcolor: profile?.role === 'alumni' ? 'primary.dark' : profile?.role === 'student' ? 'secondary.dark' : 'warning.dark'
                        },
                        minWidth: '120px',
                        fontWeight: 600
                      }}
                    >
                      {msgLoading ? 'Sending...' : 'Connect'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Right Column - Profile Details */}
        <Grid item xs={12} md={8}>
          {/* About Section */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
            <CardHeader 
              title="About" 
              sx={{ 
                background: profile?.role === 'alumni' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : profile?.role === 'student' 
                  ? 'linear-gradient(135deg,#667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '12px 12px 0 0'
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {profile?.bio || 'No bio available.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Experience Section */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
            <CardHeader 
              title="Experience" 
              sx={{ 
                background: profile?.role === 'alumni' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : profile?.role === 'student' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '12px 12px 0 0'
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {profile?.experience || 'No experience listed.'}
              </Typography>
            </CardContent>
          </Card>

          {/* Education Section */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
            <CardHeader 
              title="Education" 
              sx={{ 
                background: profile?.role === 'alumni' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : profile?.role === 'student' 
                  ? 'linear-gradient(135deg,#667eea 0%, #764ba2 100%)'
                  : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                borderRadius: '12px 12px 0 0'
              }}
            />
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {profile?.education || 'No education listed.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      )}

      {/* Skills Tab */}
      {activeTab === 1 && (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
              <CardHeader 
                title="Skills" 
                sx={{ 
                  background: profile?.role === 'alumni' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : profile?.role === 'student' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  borderRadius: '12px 12px 0 0'
                }}
              />
              <CardContent sx={{ p: 3 }}>
                {skills.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skills.map(skill => (
                      <Chip key={skill} label={skill} color="primary" variant="outlined" sx={{ mb: 1 }} />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">No skills listed.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Posts Tab */}
      {activeTab === 2 && (
        <Box>
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
            <CardHeader 
              title={`${profile?.first_name}'s Posts`}
              titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
              subheader="Posts shared with the alumni community"
            />
            <CardContent>
              {postsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : userPosts.length > 0 ? (
                <Box>
                  {userPosts.map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onDelete={handlePostDeleted} 
                    />
                  ))}
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No posts yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profile?.first_name} hasn't shared any posts yet.
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}

export default PublicProfilePage;