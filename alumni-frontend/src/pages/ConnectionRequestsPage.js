import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';
import api from '../utils/api';
import { Card, CardContent, Typography, Button, Box, Alert, Container } from '@mui/material';

export let pendingRequestCount = 0;

function ConnectionRequestsPage() {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/connections/');
      setRequests(res.data);
    } catch (err) {
      let msg = 'Failed to fetch connection requests';
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

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    setActionError(null);
    try {
      await api.post(`/users/connections/${id}/${action}/`);
      setRequests(reqs => reqs.filter(r => r.id !== id));
    } catch (err) {
      let msg = 'Failed to update request';
      if (err.response) {
        if (typeof err.response.data === 'string' && err.response.data.startsWith('<')) {
          msg += ': Server error or permission denied.';
        } else if (typeof err.response.data === 'object') {
          msg += ': ' + (err.response.data.detail || JSON.stringify(err.response.data));
        }
      } else if (err.message) {
        msg += ': ' + err.message;
      }
      setActionError(msg);
    }
  };

  const pending = requests.filter(r => r.to_user === user.id && r.status === 'pending');
  pendingRequestCount = pending.length;

  return (
    <Container sx={{ mt: 8, minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Card sx={{ width: '100%', maxWidth: 500, boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Pending Connection Requests
          </Typography>
          {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box> :
            error ? <Alert severity="error">{error}</Alert> :
            pending.length === 0 ? <Typography align="center">No pending requests.</Typography> : (
              <>
                {actionError && <Alert severity="error">{actionError}</Alert>}
                {pending.map(req => (
                  <Box key={req.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, p: 1, borderRadius: 2, bgcolor: '#f5f7fa' }}>
                    <Typography sx={{ fontWeight: 500 }}>{req.from_user_username}</Typography>
                    <Box>
                      <Button variant="contained" color="primary" size="small" sx={{ mr: 1 }} onClick={() => handleAction(req.id, 'accept')}>Accept</Button>
                      <Button variant="outlined" color="error" size="small" onClick={() => handleAction(req.id, 'reject')}>Reject</Button>
                    </Box>
                  </Box>
                ))}
              </>
            )}
        </CardContent>
      </Card>
    </Container>
  );
}

export default ConnectionRequestsPage; 