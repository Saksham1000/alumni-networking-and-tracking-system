import React, { useState, useEffect, useContext } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, Alert, CircularProgress, List, ListItem, ListItemText } from '@mui/material';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import BusinessIcon from '@mui/icons-material/Business';
import CodeIcon from '@mui/icons-material/Code';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

function AdminDashboardPage() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userTable, setUserTable] = useState([]);
  const [userTableLoading, setUserTableLoading] = useState(false);
  const [userTableError, setUserTableError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/users/admin/dashboard/');
        setStats(res.data);
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
    if (user?.role === 'admin') fetchStats();
  }, [user]);

  // Fetch all alumni for management table
  useEffect(() => {
    const fetchUsers = async () => {
      setUserTableLoading(true);
      setUserTableError('');
      try {
        const res = await api.get('/users/?role=alumni');
        setUserTable(res.data.results || res.data);
      } catch (err) {
        setUserTableError('Failed to fetch users');
      } finally {
        setUserTableLoading(false);
      }
    };
    if (user?.role === 'admin') fetchUsers();
  }, [user]);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/users/${id}/`, { approved: true });
      setUserTable(prev => prev.map(u => u.id === id ? { ...u, approved: true } : u));
    } catch {}
  };
  const handleReject = async (id) => {
    try {
      await api.patch(`/users/${id}/`, { approved: false });
      setUserTable(prev => prev.map(u => u.id === id ? { ...u, approved: false } : u));
    } catch {}
  };

  if (user?.role !== 'admin') {
    return <Container sx={{ mt: 8 }}><Alert severity="info">Only admins can view analytics.</Alert></Container>;
  }

  return (
    <Container sx={{ mt: 8, minHeight: '80vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4, borderRadius: 3, boxShadow: 4 }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: 800, letterSpacing: 1, color: '#1976d2' }}>
        Admin Analytics Dashboard
      </Typography>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>}
      {error && <Alert severity="error">{error}</Alert>}
      {stats && (
        <Box sx={{ mt: 4, maxWidth: 1200, mx: 'auto' }}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: 4, borderRadius: 3, display: 'flex', alignItems: 'center', p: 3, background: 'linear-gradient(120deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
                <PersonIcon sx={{ fontSize: 48, mr: 3, opacity: 0.8 }} />
                <Box>
                  <Typography variant="h6">Alumni</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.total_alumni}</Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: 4, borderRadius: 3, display: 'flex', alignItems: 'center', p: 3, background: 'linear-gradient(120deg, #9c27b0 0%, #e1bee7 100%)', color: 'white' }}>
                <GroupAddIcon sx={{ fontSize: 48, mr: 3, opacity: 0.8 }} />
                <Box>
                  <Typography variant="h6">Students</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.total_students}</Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: 4, borderRadius: 3, display: 'flex', alignItems: 'center', p: 3, background: 'linear-gradient(120deg, #ff9800 0%, #ffe0b2 100%)', color: 'white' }}>
                <EventIcon sx={{ fontSize: 48, mr: 3, opacity: 0.8 }} />
                <Box>
                  <Typography variant="h6">Events</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.total_events}</Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: 4, borderRadius: 3, display: 'flex', alignItems: 'center', p: 3, background: 'linear-gradient(120deg, #00bcd4 0%, #b2ebf2 100%)', color: 'white' }}>
                <CheckCircleIcon sx={{ fontSize: 48, mr: 3, opacity: 0.8 }} />
                <Box>
                  <Typography variant="h6">RSVPs</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.total_rsvps}</Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
          
          {/* Additional Analytics Cards */}
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: 4, borderRadius: 3, display: 'flex', alignItems: 'center', p: 3, background: 'linear-gradient(120deg, #4caf50 0%, #c8e6c9 100%)', color: 'white' }}>
                <TrendingUpIcon sx={{ fontSize: 48, mr: 3, opacity: 0.8 }} />
                <Box>
                  <Typography variant="h6">Connections</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.total_connections}</Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: 4, borderRadius: 3, display: 'flex', alignItems: 'center', p: 3, background: 'linear-gradient(120deg, #ff5722 0%, #ffccbc 100%)', color: 'white' }}>
                <ThumbUpIcon sx={{ fontSize: 48, mr: 3, opacity: 0.8 }} />
                <Box>
                  <Typography variant="h6">Total Likes</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.total_likes}</Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: 4, borderRadius: 3, display: 'flex', alignItems: 'center', p: 3, background: 'linear-gradient(120deg, #795548 0%, #d7ccc8 100%)', color: 'white' }}>
                <CancelIcon sx={{ fontSize: 48, mr: 3, opacity: 0.8 }} />
                <Box>
                  <Typography variant="h6">Pending</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.total_pending}</Typography>
                </Box>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ boxShadow: 4, borderRadius: 3, display: 'flex', alignItems: 'center', p: 3, background: 'linear-gradient(120deg, #607d8b 0%, #cfd8dc 100%)', color: 'white' }}>
                <EventIcon sx={{ fontSize: 48, mr: 3, opacity: 0.8 }} />
                <Box>
                  <Typography variant="h6">Posts</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.total_posts}</Typography>
                </Box>
              </Card>
          </Grid>
          </Grid>
          <Grid container spacing={4} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>User Registrations Trend</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats.user_trend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#1976d2" name="Registrations" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Event RSVP Trend</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.rsvp_trend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#9c27b0" name="RSVPs" barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {/* Skills and Company Analytics */}
          <Grid container spacing={4} sx={{ mt: 3 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    <CodeIcon sx={{ mr: 1 }} />
                    Top Skills
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.skills_data || []} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="skills" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1976d2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    <BusinessIcon sx={{ mr: 1 }} />
                    Top Companies
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.company_data || []} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="company" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#9c27b0" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Grid container spacing={4} sx={{ mt: 3 }}>
            <Grid item xs={12}>
              <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Alumni Management</Typography>
                  {userTableError && <Alert severity="error">{userTableError}</Alert>}
                  {userTableLoading ? <CircularProgress /> : (
                    <TableContainer component={Paper} sx={{ boxShadow: 0 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ background: '#f5f7fa' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {userTable.map(u => (
                            <TableRow key={u.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#e3f2fd' } }}>
                              <TableCell>{u.username}</TableCell>
                              <TableCell>{u.first_name} {u.last_name}</TableCell>
                              <TableCell>{u.email}</TableCell>
                              <TableCell>{u.approved ? <span style={{ color: '#9c27b0', fontWeight: 600 }}>Approved</span> : <span style={{ color: '#ff9800', fontWeight: 600 }}>Pending</span>}</TableCell>
                              <TableCell>
                                <IconButton color="primary" onClick={() => handleApprove(u.id)} disabled={u.approved}><CheckCircleIcon /></IconButton>
                                <IconButton color="error" onClick={() => handleReject(u.id)} disabled={!u.approved}><CancelIcon /></IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Container>
  );
}

export default AdminDashboardPage; 