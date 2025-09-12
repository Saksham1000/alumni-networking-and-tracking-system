import React, { useEffect, useState, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Card, 
  CardContent, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Alert, 
  CircularProgress, 
  Container, 
  Avatar, 
  ListItemAvatar, 
  Button, 
  Stack,
  Box,
  Chip,
  Divider,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Message as MessageIcon,
  School as SchoolIcon,
  Work as WorkIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

function MyConnectionsPage() {
  const { user } = useContext(AuthContext);
  const [pendingReceived, setPendingReceived] = useState([]);
  const [pendingSent, setPendingSent] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const fetchConnections = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/users/connections/');
      setPendingReceived(res.data.filter(req => req.status === 'pending' && req.to_user.id === user.id));
      setPendingSent(res.data.filter(req => req.status === 'pending' && req.from_user.id === user.id));
      setAccepted(res.data.filter(req => req.status === 'accepted'));
    } catch (err) {
      setError('Failed to fetch connections.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { 
    fetchConnections();
  }, [fetchConnections]);

  const handleAccept = async (id) => {
    setActionLoading(l => ({ ...l, [id]: true }));
    setFeedback('');
    try {
      await api.post(`/users/connections/${id}/accept/`);
      setFeedback('Connection accepted.');
      fetchConnections();
    } catch {
      setFeedback('Failed to accept request.');
    } finally {
      setActionLoading(l => ({ ...l, [id]: false }));
    }
  };

  const handleReject = async (id) => {
    setActionLoading(l => ({ ...l, [id]: true }));
    setFeedback('');
    try {
      await api.post(`/users/connections/${id}/reject/`);
      setFeedback('Request rejected.');
      fetchConnections();
    } catch {
      setFeedback('Failed to reject request.');
    } finally {
      setActionLoading(l => ({ ...l, [id]: false }));
    }
  };

  const handleCancel = async (id) => {
    setActionLoading(l => ({ ...l, [id]: true }));
    setFeedback('');
    try {
      await api.delete(`/users/connections/${id}/`);
      setFeedback('Request cancelled.');
      fetchConnections();
    } catch {
      setFeedback('Failed to cancel request.');
    } finally {
      setActionLoading(l => ({ ...l, [id]: false }));
    }
  };

  const handleRemove = async (id) => {
    setActionLoading(l => ({ ...l, [id]: true }));
    setFeedback('');
    try {
      await api.delete(`/users/connections/${id}/`);
      setFeedback('Connection removed.');
      fetchConnections();
    } catch {
      setFeedback('Failed to remove connection.');
    } finally {
      setActionLoading(l => ({ ...l, [id]: false }));
    }
  };

  if (loading) return <Container sx={{ mt: 4, textAlign: 'center' }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 4,
          mb: 4,
          borderRadius: 3
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              textAlign: 'center', 
              fontWeight: 700,
              textShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            My Connections
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center', 
              mt: 2, 
              opacity: 0.9,
              maxWidth: 600,
              mx: 'auto'
            }}
          >
            Manage your professional network and stay connected with fellow alumni
          </Typography>
        </Container>
      </Paper>
      
      <Container maxWidth="lg">
        {feedback && <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>{feedback}</Alert>}
        <Stack spacing={4}>
        {/* Pending Received */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              p: 3,
              color: 'white'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAddIcon />
                Pending Requests (Received)
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                {pendingReceived.length} connection request{pendingReceived.length !== 1 ? 's' : ''} waiting for your response
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
            {pendingReceived.length > 0 ? (
              <List>
                {pendingReceived.map(req => {
                  const other = req.from_user;
                  return (
                    <Card key={req.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={other.profile_picture} 
                            sx={{ 
                              width: 60, 
                              height: 60,
                              border: '3px solid',
                              borderColor: 'primary.100'
                            }}
                          >
                            {other.username[0].toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {other.first_name} {other.last_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Chip 
                                label={other.role === 'alumni' ? 'Alumni' : other.role === 'student' ? 'Student' : 'Admin'}
                                color={other.role === 'alumni' ? 'primary' : other.role === 'student' ? 'secondary' : 'warning'}
                                size="small"
                              />
                              {other.graduation_year && (
                                <Chip 
                                  icon={<SchoolIcon />}
                                  label={`Class of ${other.graduation_year}`}
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {other.job_title ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <WorkIcon fontSize="small" />
                                  {other.job_title} {other.company && `@ ${other.company}`}
                                </Box>
                              ) : `@${other.username}`}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Accept Connection">
                              <IconButton 
                                color="secondary" 
                                onClick={() => handleAccept(req.id)} 
                                disabled={actionLoading[req.id]}
                                sx={{ 
                                  bgcolor: 'secondary.50',
                                  '&:hover': { bgcolor: 'secondary.100' }
                                }}
                              >
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject Connection">
                              <IconButton 
                                color="error" 
                                onClick={() => handleReject(req.id)} 
                                disabled={actionLoading[req.id]}
                                sx={{ 
                                  bgcolor: 'error.50',
                                  '&:hover': { bgcolor: 'error.100' }
                                }}
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" variant="h6">
                  No pending requests
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  You're all caught up! 🎉
                </Typography>
              </Box>
            )}
            </Box>
          </CardContent>
        </Card>
        {/* Pending Sent */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              p: 3,
              color: 'white'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAddIcon />
                Pending Requests (Sent)
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                {pendingSent.length} connection request{pendingSent.length !== 1 ? 's' : ''} waiting for response
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
            {pendingSent.length > 0 ? (
              <List>
                {pendingSent.map(req => {
                  const other = req.to_user;
                  return (
                    <ListItem key={req.id} divider>
                      <ListItemAvatar>
                        <Avatar src={other.profile_picture}>{other.username[0].toUpperCase()}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${other.first_name} ${other.last_name}`}
                        secondary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              wordBreak: 'break-all',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: { xs: '150px', sm: '200px', md: '250px' }
                            }}
                          >
                            {other.job_title ? `${other.job_title} @ ${other.company}` : `@${other.username}`}
                          </Typography>
                        }
                      />
                      <Button variant="outlined" color="warning" size="small" onClick={() => handleCancel(req.id)} disabled={actionLoading[req.id]}>Cancel</Button>
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" variant="h6">
                  No sent requests
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Your connection requests will appear here
                </Typography>
              </Box>
            )}
            </Box>
          </CardContent>
        </Card>
        {/* Accepted Connections */}
        <Card sx={{ borderRadius: 3, boxShadow: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 3,
              color: 'white'
            }}>
              <Typography variant="h5" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon />
                Accepted Connections
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                {accepted.length} active connection{accepted.length !== 1 ? 's' : ''} in your network
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
            {accepted.length > 0 ? (
              <List>
                {accepted.map(req => {
                  const other = req.from_user.id === user.id ? req.to_user : req.from_user;
                  return (
                    <Card key={req.id} sx={{ mb: 2, borderRadius: 2, boxShadow: 1, '&:hover': { boxShadow: 3 } }}>
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar 
                            src={other.profile_picture} 
                            sx={{ 
                              width: 60, 
                              height: 60,
                              border: '3px solid',
                              borderColor: 'secondary.100'
                            }}
                          >
                            {other.username[0].toUpperCase()}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 600,
                                cursor: 'pointer',
                                color: 'primary.main',
                                '&:hover': { textDecoration: 'underline' }
                              }}
                              onClick={() => navigate(`/profile/${other.id}`)}
                            >
                              {other.first_name} {other.last_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Chip 
                                label={other.role === 'alumni' ? 'Alumni' : other.role === 'student' ? 'Student' : 'Admin'}
                                color={other.role === 'alumni' ? 'primary' : other.role === 'student' ? 'secondary' : 'warning'}
                                size="small"
                              />
                              {other.graduation_year && (
                                <Chip 
                                  icon={<SchoolIcon />}
                                  label={`Class of ${other.graduation_year}`}
                                  variant="outlined"
                                  size="small"
                                />
                              )}
                            </Box>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {other.job_title ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <WorkIcon fontSize="small" />
                                  {other.job_title} {other.company && `@ ${other.company}`}
                                </Box>
                              ) : `@${other.username}`}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Send Message">
                              <IconButton 
                                color="primary" 
                                component={Link} 
                                to={`/messages?user=${other.id}`}
                                sx={{ 
                                  bgcolor: 'primary.50',
                                  '&:hover': { bgcolor: 'primary.100' }
                                }}
                              >
                                <MessageIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove Connection">
                              <IconButton 
                                color="error" 
                                onClick={() => handleRemove(req.id)} 
                                disabled={actionLoading[req.id]}
                                sx={{ 
                                  bgcolor: 'error.50',
                                  '&:hover': { bgcolor: 'error.100' }
                                }}
                              >
                                <PersonRemoveIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </List>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary" variant="h6">
                  No connections yet
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Start building your network by connecting with fellow alumni! 🌟
                </Typography>
              </Box>
            )}
            </Box>
          </CardContent>
        </Card>
        </Stack>
      </Container>
    </Container>
  );
}

export default MyConnectionsPage; 