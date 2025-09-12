import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import AlumniCard from '../components/AlumniCard';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';

function RecommendationsPage() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/recommendations/');
      setAlumni(res.data);
    } catch {
      setError('Failed to fetch recommendations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
        Recommended Alumni For You
      </Typography>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!loading && !error && alumni.length === 0 && (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
          No recommendations found. Try updating your profile for better matches!
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {alumni.map(a => <AlumniCard key={a.id} alumni={a} onConnectionChange={fetchRecommendations} />)}
      </Box>
    </Container>
  );
}

export default RecommendationsPage; 