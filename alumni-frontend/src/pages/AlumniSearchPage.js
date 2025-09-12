import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Alert, CircularProgress, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import api from '../utils/api';
import AlumniCard from '../components/AlumniCard';

function AlumniSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [skill, setSkill] = useState('');
  const [company, setCompany] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const params = { q: query };
      if (skill) params.skill = skill;
      if (company) params.company = company;
      if (gradYear) params.graduation_year = gradYear;
      if (location) params.location = location;
      const res = await api.get('/users/alumni/search/', { params });
      setResults(res.data);
    } catch (err) {
      setError('Failed to fetch alumni.');
    } finally {
      setLoading(false);
    }
  };

  // Add a fetchResults function for AlumniCard to call after connection changes
  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { q: query };
      if (skill) params.skill = skill;
      if (company) params.company = company;
      if (gradYear) params.graduation_year = gradYear;
      if (location) params.location = location;
      const res = await api.get('/users/alumni/search/', { params });
      setResults(res.data);
    } catch (err) {
      setError('Failed to fetch alumni.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Search Alumni
      </Typography>
      <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Skill"
              value={skill}
              onChange={e => setSkill(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Company"
              value={company}
              onChange={e => setCompany(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Graduation Year"
              value={gradYear}
              onChange={e => setGradYear(e.target.value.replace(/[^0-9]/g, ''))}
              fullWidth
              inputProps={{ maxLength: 4 }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Location"
              value={location}
              onChange={e => setLocation(e.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
        <TextField
          label="Search by name, skill, company..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" disabled={loading || !query.trim() && !skill && !company && !gradYear && !location}>
          {loading ? <CircularProgress size={20} /> : 'Search'}
        </Button>
      </form>
      {searched && (error ? (
        <Alert severity="error">{error}</Alert>
      ) : results.length > 0 ? (
        results.map(alumni => (
          <AlumniCard key={alumni.id} alumni={alumni} onConnectionChange={fetchResults} />
        ))
      ) : (
        <Typography>No alumni found.</Typography>
      ))}
    </Container>
  );
}

export default AlumniSearchPage; 