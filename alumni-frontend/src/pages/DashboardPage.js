import React, { useEffect, useState, useContext } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, CircularProgress, Alert, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import EventIcon from '@mui/icons-material/Event';
import WorkIcon from '@mui/icons-material/Work';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';

function DashboardPage() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        if (user?.role === 'admin') {
          const res = await api.get('/users/admin/dashboard/');
          setStats(res.data);
        } else {
          // For regular users, show basic stats
          setStats({
            total_alumni: 'View All',
            total_students: 'Connect',
            total_events: 'Explore',
            total_jobs: 'Browse'
          });
        }
      } catch (err) {
        let msg = 'Failed to fetch dashboard stats';
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
    fetchStats();
  }, [user]);

  const handleCardClick = (route) => {
    navigate(route);
  };

  return (
    <Container sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
        Welcome, {user?.first_name || user?.username}!
      </Typography>
      <Typography variant="h6" align="center" gutterBottom sx={{ color: 'text.secondary', mb: 4 }}>
        Your Alumni Network Dashboard
      </Typography>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      
      {stats && (
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                minHeight: 120, 
                boxShadow: 3, 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
              onClick={() => handleCardClick('/alumni')}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">Alumni Networking System</Typography>
                <Typography variant="h4" color="primary">{stats.total_alumni}</Typography>
              </CardContent>
              <PeopleIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                minHeight: 120, 
                boxShadow: 3, 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
              onClick={() => handleCardClick('/events')}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">Events</Typography>
                <Typography variant="h4" color="primary.main">{stats.total_events}</Typography>
              </CardContent>
              <EventIcon sx={{ fontSize: 48, color: 'primary.main', mr: 2 }} />
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card 
              sx={{ 
                minHeight: 120, 
                boxShadow: 3, 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
              onClick={() => handleCardClick('/jobs')}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6">Job Board</Typography>
                <Typography variant="h4" color="info.main">{stats.total_jobs}</Typography>
              </CardContent>
              <WorkIcon sx={{ fontSize: 48, color: 'info.main', mr: 2 }} />
            </Card>
          </Grid>
          
          {user?.role === 'admin' && (
            <Grid item xs={12} sm={6} md={3}>
              <Card 
                sx={{ 
                  minHeight: 120, 
                  boxShadow: 3, 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => handleCardClick('/admin')}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">Students</Typography>
                  <Typography variant="h4" color="secondary">{stats.total_students}</Typography>
                </CardContent>
                <SchoolIcon sx={{ fontSize: 48, color: 'secondary.main', mr: 2 }} />
              </Card>
            </Grid>
          )}
        </Grid>
      )}
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Connect with fellow alumni, discover opportunities, and stay updated with the latest events!
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/profile')}
          sx={{ mr: 2 }}
        >
          Update Profile
        </Button>
        <Button 
          variant="outlined" 
          color="secondary" 
          onClick={() => navigate('/my-connections')}
        >
          My Connections
        </Button>
      </Box>
    </Container>
  );
}

export default DashboardPage; 