import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, TextField, Button, Alert, Box, Paper, Link,
  FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import api from '../utils/api';

function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
    phone: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!formData.first_name || !/^[A-Za-z ]+$/.test(formData.first_name)) {
      errors.first_name = 'First name should only contain letters and spaces.';
    }
    if (!formData.last_name || !/^[A-Za-z ]+$/.test(formData.last_name)) {
      errors.last_name = 'Last name should only contain letters and spaces.';
    }
    if (formData.phone && !/^(97|98)\d{8}$/.test(formData.phone)) {
      errors.phone = 'Phone must start with 97 or 98 and be exactly 10 digits.';
    }
    if (formData.password !== formData.password2) {
      errors.password2 = "Passwords don't match.";
    }
    return errors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the errors above.');
      return;
    }
    try {
      await api.post('/users/register/', formData);
      setSuccess('Registration successful! Please log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        const newFieldErrors = {};
        let genericError = '';
        Object.entries(errorData).forEach(([key, value]) => {
          if (formData.hasOwnProperty(key)) {
            newFieldErrors[key] = Array.isArray(value) ? value.join(' ') : value;
          } else {
            genericError += (Array.isArray(value) ? value.join(' ') : value) + ' ';
          }
        });
        setFieldErrors(newFieldErrors);
        setError(genericError.trim() || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Paper 
        elevation={6}
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Create an Account
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2, width: '100%' }}>{success}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} fullWidth required error={!!fieldErrors.first_name} helperText={fieldErrors.first_name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} fullWidth required error={!!fieldErrors.last_name} helperText={fieldErrors.last_name} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Username" name="username" value={formData.username} onChange={handleChange} fullWidth required error={!!fieldErrors.username} helperText={fieldErrors.username} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} fullWidth required error={!!fieldErrors.email} helperText={fieldErrors.email} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} fullWidth error={!!fieldErrors.phone} helperText={fieldErrors.phone} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>I am a...</InputLabel>
                <Select name="role" value={formData.role} label="I am a..." onChange={handleChange}>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="alumni">Alumni</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} fullWidth required error={!!fieldErrors.password} helperText={fieldErrors.password} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Confirm Password" name="password2" type="password" value={formData.password2} onChange={handleChange} fullWidth required error={!!fieldErrors.password2} helperText={fieldErrors.password2} />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2, py: 1.5 }}>
                Register
              </Button>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link href="/login" variant="body2">
                  Sign In
                </Link>
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default RegisterPage; 