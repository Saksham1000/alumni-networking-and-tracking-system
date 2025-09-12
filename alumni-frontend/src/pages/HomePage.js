import React, { useEffect, useState, useContext } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Box, 
  Button, 
  Avatar, 
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';

/**
 * HomePage Component
 * Main landing page for the alumni networking system
 * Displays public statistics, recent alumni, events, jobs, and feed posts
 */
function HomePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State management for different data sections
  const [stats, setStats] = useState(null);           // Public statistics (alumni count, events, etc.)
  const [recentAlumni, setRecentAlumni] = useState([]); // Recent alumni profiles
  const [recentEvents, setRecentEvents] = useState([]); // Upcoming events
  const [recentJobs, setRecentJobs] = useState([]);    // Recent job postings
  const [posts, setPosts] = useState([]);              // Feed posts for all users
  const [loading, setLoading] = useState(true);        // Loading state
  const [error, setError] = useState('');              // Error messages
  const [activeTab, setActiveTab] = useState(0);       // Tab navigation (Feed/Discover)

  /**
   * Fetches all public data for the homepage
   * This includes statistics, recent alumni, events, jobs, and feed posts
   * Called once when component mounts
   */
  const fetchPublicData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch public statistics (alumni count, events count, etc.)
      const statsRes = await api.get('/users/public-stats/');
      setStats(statsRes.data);

      // Fetch recent alumni profiles for discovery
      const alumniRes = await api.get('/users/public-alumni/');
      setRecentAlumni(alumniRes.data);

      // Fetch upcoming events for public viewing
      const eventsRes = await api.get('/events/public/');
      setRecentEvents(eventsRes.data);

      // Fetch recent job postings
      const jobsRes = await api.get('/jobs/public/');
      setRecentJobs(jobsRes.data);

      // Fetch feed posts for all users
      const postsRes = await api.get('/users/feed/');
      setPosts(postsRes.data);
    } catch (err) {
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []); // Run once for all visitors

  const handlePostCreated = async () => {
    // Refetch all posts to see the new one
    try {
      const res = await api.get('/users/feed/');
      setPosts(res.data);
    } catch (err) {
      // Error refetching posts after creation - handled silently
    }
  };

  const handlePostDeleted = (deletedPostId) => {
    setPosts(posts.filter(post => post.id !== deletedPostId));
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleViewEvent = (id) => {
    navigate(`/events/${id}`);
  };

  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        mt: { xs: 2, sm: 4 }, 
        mb: { xs: 2, sm: 4 },
        px: { xs: 1, sm: 2 },
        width: '100%',
        maxWidth: '100%'
      }}
    >
      {/* Hero Section */}
      <Paper 
        elevation={6} 
        sx={{ 
          p: { xs: 2, sm: 4, md: 6 }, 
          mb: { xs: 2, sm: 4 }, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: { xs: 2, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.3
          }
        }}
      >
        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1, width: '100%' }}>
          <Typography 
            variant="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3.5rem' },
              mb: { xs: 1, sm: 2 },
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              lineHeight: 1.2,
              wordBreak: 'break-word'
            }}
          >
            Alumni Networking System
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              mb: { xs: 2, sm: 4 }, 
              opacity: 0.95,
              fontSize: { xs: '0.875rem', sm: '1rem', md: '1.2rem', lg: '1.5rem' },
              lineHeight: 1.6,
              maxWidth: { xs: '100%', sm: 600, md: 800 },
              mx: 'auto',
              px: { xs: 1, sm: 0 }
            }}
          >
            Connect with fellow graduates, discover opportunities, and stay updated with your alma mater
          </Typography>
          {!user ? (
            <Box sx={{ 
              mt: { xs: 2, sm: 4 }, 
              display: 'flex', 
              gap: { xs: 1, sm: 2 }, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center'
            }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => navigate('/register')}
                sx={{ 
                  px: { xs: 4, sm: 6 }, 
                  py: { xs: 1.5, sm: 2 }, 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.2rem' },
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  width: { xs: '100%', sm: 'auto' },
                  maxWidth: { xs: 280, sm: 'none' },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Join Now
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={() => navigate('/login')}
                sx={{ 
                  px: { xs: 4, sm: 6 }, 
                  py: { xs: 1.5, sm: 2 }, 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.2rem' },
                  fontWeight: 600,
                  color: 'white', 
                  borderColor: 'white',
                  borderRadius: 3,
                  borderWidth: 2,
                  width: { xs: '100%', sm: 'auto' },
                  maxWidth: { xs: 280, sm: 'none' },
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Sign In
              </Button>
            </Box>
          ) : (
            <Box sx={{ 
              mt: { xs: 2, sm: 4 }, 
              display: 'flex', 
              gap: { xs: 1, sm: 2 }, 
              justifyContent: 'center', 
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center'
            }}>
              <Button 
                variant="contained" 
                size="large" 
                onClick={() => navigate('/alumni')}
                sx={{ 
                  px: { xs: 4, sm: 6 }, 
                  py: { xs: 1.5, sm: 2 }, 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.2rem' },
                  fontWeight: 600,
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  width: { xs: '100%', sm: 'auto' },
                  maxWidth: { xs: 280, sm: 'none' },
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(0,0,0,0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Explore Network
              </Button>
              <Button 
                variant="outlined" 
                size="large" 
                onClick={() => navigate('/profile')}
                sx={{ 
                  px: { xs: 4, sm: 6 }, 
                  py: { xs: 1.5, sm: 2 }, 
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.2rem' },
                  fontWeight: 600,
                  color: 'white', 
                  borderColor: 'white',
                  borderRadius: 3,
                  borderWidth: 2,
                  width: { xs: '100%', sm: 'auto' },
                  maxWidth: { xs: 280, sm: 'none' },
                  '&:hover': {
                    borderWidth: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                My Profile
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Stats Section */}
      {stats && (
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 4, sm: 6 } }}>
          <Grid item xs={6} sm={6} md={3}>
            <Card 
              sx={{ 
                textAlign: 'center', 
                p: { xs: 2, sm: 3 }, 
                cursor: 'pointer',
                borderRadius: { xs: 2, sm: 3 },
                boxShadow: 2,
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1)'
                  }
                }
              }} 
              onClick={() => navigate('/alumni')}
            >
              <PeopleIcon sx={{ 
                fontSize: { xs: 40, sm: 48, md: 56 }, 
                color: 'primary.main', 
                mb: { xs: 1, sm: 2 },
                transition: 'transform 0.3s ease'
              }} />
              <Typography 
                variant="h3" 
                color="primary" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
              >
                {stats.total_alumni}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }}
              >
                Alumni Members
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card 
              sx={{ 
                textAlign: 'center', 
                p: { xs: 2, sm: 3 }, 
                cursor: 'pointer',
                borderRadius: { xs: 2, sm: 3 },
                boxShadow: 2,
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1)'
                  }
                }
              }} 
              onClick={() => navigate('/events')}
            >
              <EventIcon sx={{ 
                fontSize: { xs: 40, sm: 48, md: 56 }, 
                color: 'primary.main', 
                mb: { xs: 1, sm: 2 },
                transition: 'transform 0.3s ease'
              }} />
              <Typography 
                variant="h3" 
                color="primary.main" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
              >
                {stats.total_events}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }}
              >
                Upcoming Events
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card 
              sx={{ 
                textAlign: 'center', 
                p: { xs: 2, sm: 3 }, 
                cursor: 'pointer',
                borderRadius: { xs: 2, sm: 3 },
                boxShadow: 2,
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1)'
                  }
                }
              }} 
              onClick={() => navigate('/jobs')}
            >
              <WorkIcon sx={{ 
                fontSize: { xs: 40, sm: 48, md: 56 }, 
                color: 'info.main', 
                mb: { xs: 1, sm: 2 },
                transition: 'transform 0.3s ease'
              }} />
              <Typography 
                variant="h3" 
                color="info.main" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
              >
                {stats.total_jobs}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }}
              >
                Job Opportunities
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <Card 
              sx={{ 
                textAlign: 'center', 
                p: { xs: 2, sm: 3 },
                borderRadius: { xs: 2, sm: 3 },
                boxShadow: 2,
                transition: 'all 0.3s ease',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  '& .MuiSvgIcon-root': {
                    transform: 'scale(1.1)'
                  }
                }
              }}
            >
              <SchoolIcon sx={{ 
                fontSize: { xs: 40, sm: 48, md: 56 }, 
                color: 'secondary.main', 
                mb: { xs: 1, sm: 2 },
                transition: 'transform 0.3s ease'
              }} />
              <Typography 
                variant="h3" 
                color="secondary.main" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
              >
                {stats.total_students}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ 
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                }}
              >
                Current Students
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Main Content with Tabs */}
      {user ? (
        <Box>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)} 
            sx={{ 
              mb: 4,
              '& .MuiTab-root': {
                fontWeight: 600,
                fontSize: '1.1rem',
                textTransform: 'none',
                minHeight: 48,
                px: 4
              },
              '& .Mui-selected': {
                color: 'primary.main'
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
              }
            }}
          >
            <Tab label="Feed" />
            <Tab label="Discover" />
          </Tabs>

          {activeTab === 0 && (
            <Grid container spacing={{ xs: 2, sm: 4 }}>
              {/* Feed Column */}
              <Grid item xs={12} md={8}>
                <CreatePost onPostCreated={handlePostCreated} />
                {posts.map(post => <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />)}
              </Grid>

              {/* Sidebar */}
              <Grid item xs={12} md={4}>
                <Card sx={{ 
                  mb: 3, 
                  borderRadius: 3,
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6
                  },
                  transition: 'box-shadow 0.3s ease'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Recent Alumni
                    </Typography>
                    {recentAlumni.slice(0, 5).map((alumni) => (
                      <Box 
                        key={alumni.id} 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          p: 2, 
                          mb: 1, 
                          cursor: 'pointer',
                          borderRadius: 2,
                          border: '1px solid transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            bgcolor: 'primary.50',
                            border: '1px solid',
                            borderColor: 'primary.200',
                            transform: 'translateX(4px)'
                          }
                        }}
                        onClick={() => handleViewProfile(alumni.id)}
                      >
                        <Avatar 
                          src={alumni.profile_picture} 
                          sx={{ 
                            mr: 2, 
                            width: 40, 
                            height: 40,
                            border: '2px solid',
                            borderColor: 'primary.100'
                          }}
                        >
                          {alumni.first_name?.[0] || alumni.username[0]}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {alumni.first_name} {alumni.last_name}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {alumni.job_title} {alumni.company && `@ ${alumni.company}`}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={{ xs: 2, sm: 4 }}>
              {/* Recent Alumni */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ mr: 1 }} />
                      Recent Alumni
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {recentAlumni.length > 0 ? (
                      recentAlumni.map((alumni) => (
                        <Box 
                          key={alumni.id} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            p: 1, 
                            mb: 1, 
                            cursor: 'pointer',
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => handleViewProfile(alumni.id)}
                        >
                          <Avatar src={alumni.profile_picture} sx={{ mr: 2 }}>
                            {alumni.first_name?.[0] || alumni.username[0]}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1">
                              {alumni.first_name} {alumni.last_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {alumni.job_title} {alumni.company && `@ ${alumni.company}`}
                            </Typography>
                          </Box>
                          <Chip label={alumni.role} size="small" color="primary" />
                        </Box>
                      ))
                    ) : (
                      <Typography color="text.secondary">No recent alumni to show</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Events */}
              <Grid item xs={12} md={6}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <EventIcon sx={{ mr: 1 }} />
                      Upcoming Events
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {recentEvents.length > 0 ? (
                      recentEvents.map((event) => (
                        <Box 
                          key={event.id} 
                          sx={{ 
                            p: 1, 
                            mb: 1, 
                            cursor: 'pointer',
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => handleViewEvent(event.id)}
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(event.date).toLocaleDateString()} • {event.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {event.description?.slice(0, 100)}...
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography color="text.secondary">No upcoming events</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Job Opportunities */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ mr: 1 }} />
                      Latest Job Opportunities
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {recentJobs.length > 0 ? (
                      <Grid container spacing={2}>
                        {recentJobs.map((job) => (
                          <Grid item xs={12} sm={6} md={4} key={job.id}>
                            <Card 
                              variant="outlined" 
                              sx={{ 
                                cursor: 'pointer',
                                '&:hover': { boxShadow: 2 }
                              }}
                              onClick={() => handleViewJob(job.id)}
                            >
                              <CardContent>
                                <Typography variant="h6" gutterBottom>
                                  {job.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {job.company}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {job.location}
                                </Typography>
                                <Chip 
                                  label={job.type} 
                                  size="small" 
                                  color="primary" 
                                  sx={{ mt: 1 }}
                                />
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography color="text.secondary">No job opportunities available</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>
      ) : (
        // Public Feed View for Guests
        <Grid container spacing={{ xs: 2, sm: 4 }}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
              Recent Activity
            </Typography>
            {posts.map(post => <PostCard key={post.id} post={post} onDelete={handlePostDeleted}/>)}
            <Card sx={{ mt: 2, p: 2, textAlign: 'center' }}>
              <Typography>
                <Link to="/login">Log in</Link> to create a post, comment, and connect with alumni.
              </Typography>
            </Card>
          </Grid>
          {/* Sidebar with public content */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Alumni</Typography>
                {recentAlumni.slice(0, 5).map((alumni) => (
                  <Box 
                    key={alumni.id} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      p: 1, 
                      mb: 1, 
                      cursor: 'pointer',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                    onClick={() => handleViewProfile(alumni.id)}
                  >
                    <Avatar src={alumni.profile_picture} sx={{ mr: 2 }}>
                      {alumni.first_name?.[0] || alumni.username[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {alumni.first_name} {alumni.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {alumni.job_title} {alumni.company && `@ ${alumni.company}`}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}

export default HomePage; 