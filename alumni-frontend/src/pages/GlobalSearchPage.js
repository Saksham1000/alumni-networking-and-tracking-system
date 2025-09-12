import React, { useEffect, useState, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import { Container, Typography, Box, CircularProgress, Alert, Paper, Grid, Chip } from '@mui/material';
import AlumniCard from '../components/AlumniCard';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';

function GlobalSearchPage() {
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = searchParams.get('q');

  useEffect(() => {
    if (!query) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/users/search/', { params: { q: query } });
        // Filter out the current user from the results
        const filteredResults = res.data.filter(result => result.id !== user.id);
        setResults(filteredResults);
      } catch (err) {
        setError('Failed to fetch search results.');
        // Error during search - handled silently
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, user.id]);

  // Add a fetchResults function for AlumniCard to call after connection changes
  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/users/search/', { params: { q: query } });
      const filteredResults = res.data.filter(result => result.id !== user.id);
      setResults(filteredResults);
    } catch (err) {
      setError('Failed to fetch search results.');
      // Error during search - handled silently
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          background: user?.role === 'alumni' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : user?.role === 'student' 
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
          <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Search Results
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
            Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<PeopleIcon />}
              label={`${results.filter(r => r.role === 'alumni').length} Alumni`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
            />
            <Chip 
              icon={<PeopleIcon />}
              label={`${results.filter(r => r.role === 'student').length} Students`}
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Results Section */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} sx={{ color: user?.role === 'alumni' ? 'primary.main' : user?.role === 'student' ? 'secondary.main' : 'warning.main' }} />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 3, 
            p: 3,
            fontSize: '1.1rem',
            '& .MuiAlert-icon': { fontSize: '2rem' }
          }}
        >
          {error}
        </Alert>
      ) : results.length > 0 ? (
        <Grid container spacing={3}>
          {results.map(alumni => (
            <Grid item xs={12} sm={6} md={4} key={alumni.id}>
              <AlumniCard alumni={alumni} onConnectionChange={fetchResults} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper 
          elevation={3}
          sx={{ 
            p: 8, 
            textAlign: 'center', 
            borderRadius: 4,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
          }}
        >
          <SearchIcon sx={{ fontSize: 96, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
          <Typography variant="h4" color="text.secondary" sx={{ mb: 2, fontWeight: 600 }}>
            No users found
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto' }}>
            We couldn't find any users matching "{query}". Try adjusting your search terms or browse all users.
          </Typography>
        </Paper>
      )}
    </Container>
  );
}

export default GlobalSearchPage; 