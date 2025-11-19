import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Avatar, 
  CircularProgress, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Chip, 
  LinearProgress, 
  Box,
  IconButton,
  InputAdornment,
  Tabs,
  Tab,
  SvgIcon
} from '@mui/material';
import {
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Language as WebsiteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../utils/api';
import PostCard from '../components/PostCard';

const XIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 16 16">
    <path d="M16.444 0 10.651 6.653 15.92 14.5h-4.739l-3.529-4.76-4.03 4.76H0l5.937-6.98L0 0h4.739l3.262 4.47L11.698 0h4.746Z" />
  </SvgIcon>
);

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [pictureFile, setPictureFile] = useState(null);
  const [picturePreview, setPicturePreview] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    twitter: '',
    website: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/profile/');
        setProfile(res.data);
        setForm(res.data); // Initialize form with profile data
        setPicturePreview(res.data.profile_picture);
        
        // Initialize social links from profile data
        setSocialLinks({
          linkedin: res.data.linkedin || '',
          github: res.data.github || '',
          twitter: res.data.twitter || '',
          website: res.data.website || ''
        });
        
      } catch (err) {
        setError('Failed to fetch profile.');
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPosts = async () => {
      setPostsLoading(true);
      try {
        const res = await api.get('/users/profile/');
        const userId = res.data.id;
        const postsRes = await api.get(`/users/posts/user/${userId}/`);
        setUserPosts(postsRes.data);
      } catch (err) {
        // Error loading user posts - handled silently
        console.error('Fetch user posts error:', err);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchProfile();
    fetchUserPosts();
  }, []);

  const validate = () => {
    const errors = {};
    // Name validation (only if provided; allow empty)
    if (form.first_name && !/^[A-Za-z ]+$/.test(form.first_name)) {
      errors.first_name = 'First name should only contain letters and spaces.';
    }
    if (form.last_name && !/^[A-Za-z ]+$/.test(form.last_name)) {
      errors.last_name = 'Last name should only contain letters and spaces.';
    }
    // Phone validation
    if (form.phone && !/^(97|98)\d{8}$/.test(form.phone)) {
      errors.phone = 'Phone must start with 97 or 98 and be exactly 10 digits.';
    }
    return errors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
  };

   const handleSocialLinkChange = (platform, value) => {
     setSocialLinks({ ...socialLinks, [platform]: value });
   };

   const handlePostDeleted = (deletedPostId) => {
     setUserPosts(userPosts.filter(post => post.id !== deletedPostId));
   };

  const handlePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPictureFile(file);
      setPicturePreview(URL.createObjectURL(file));
    }
  };

  // ---------- FIXED prepareProfileData ----------
  const prepareProfileData = (form) => {
    const data = { ...form, ...socialLinks };

    // Remove fields that shouldn't be updated
    delete data.role;
    delete data.id;
    delete data.username;
    delete data.email;
    delete data.groups;
    delete data.user_permissions;
    delete data.is_active;
    delete data.is_staff;
    delete data.is_superuser;
    delete data.date_joined;
    delete data.last_login;
    delete data.approved;

    // Important: only keep profile_picture if user explicitly set it to null
    // (this signals "remove photo" to the backend). Otherwise strip it so we
    // don't send a URL string.
    if (data.profile_picture === null) {
      // keep it so backend can remove the file (sent as JSON null)
      data.profile_picture = null;
    } else {
      // remove any URL/string value (we will append file via FormData when uploading)
      delete data.profile_picture;
    }

    // Convert empty strings to null for optional fields
    const optionalFields = ['graduation_year', 'phone', 'skills', 'job_title', 'company', 'bio', 'location', 'experience', 'education', 'linkedin', 'github', 'twitter', 'website'];
    optionalFields.forEach(field => {
      if (data[field] === "") {
        data[field] = null;
      }
    });

    // Ensure graduation_year is number or null
    if (data.graduation_year !== undefined && data.graduation_year !== null && data.graduation_year !== '') {
      const num = parseInt(data.graduation_year, 10);
      data.graduation_year = isNaN(num) ? null : num;
    }

    return data;
  };

  // ---------- FIXED handleSubmit (single unified implementation) ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      setError('Please fix the errors above.');
      return;
    }

    try {
      // Prepare data (this will keep profile_picture:null if user removed photo,
      // otherwise it removes profile_picture key so we don't send a URL string)
      const data = prepareProfileData(form);

      let res;
      if (pictureFile) {
        // If uploading a file, use FormData and DO NOT include profile_picture (string/null)
        const formData = new FormData();
        // ensure we don't append profile_picture (we append the file)
        if ('profile_picture' in data) delete data.profile_picture;

        Object.keys(data).forEach(key => {
          if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
          }
        });
        formData.append('profile_picture', pictureFile);

        res = await api.patch('/users/profile/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // JSON path: If user explicitly removed the picture earlier (profile_picture === null),
        // prepareProfileData kept data.profile_picture = null, so it will be sent and backend can remove the file.
        console.log('Sending profile data:', data);
        res = await api.patch('/users/profile/', data);
      }

      setProfile(res.data);
      setForm(res.data);
      setPicturePreview(res.data.profile_picture);
      setPictureFile(null);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      let msg = 'Update failed. Please check your input.';
      const newFieldErrors = {};

      if (err.response && err.response.data) {
        const errorData = err.response.data;

        if (typeof errorData === 'string') {
          msg = errorData;
        } else if (typeof errorData === 'object') {
          // Map field-specific errors back to form/social fields if possible
          Object.entries(errorData).forEach(([key, value]) => {
            const text = Array.isArray(value) ? value.join(' ') : String(value);
            if (form.hasOwnProperty(key) || socialLinks.hasOwnProperty(key)) {
              newFieldErrors[key] = text;
            } else {
              msg += ` ${key}: ${text}`;
            }
          });

          // Pretty debug output in console
          try {
            console.group('Profile update error');
            console.error('Status:', err.response.status);
            // console.table is helpful for objects with string/array values
            console.table(errorData);
            console.groupEnd();
          } catch (e) {
            console.log('Profile update error (fallback):', errorData);
          }
        }
      } else {
        console.error('Profile update error:', err.message);
      }

      setFieldErrors(newFieldErrors);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Profile completeness calculation (optional)
  const profileFields = [
    'first_name', 'last_name', 'email', 'phone', 'graduation_year', 'skills', 'job_title', 'company', 'bio', 'profile_picture', 'location', 'experience', 'education'
  ];
  const completedFields = profileFields.filter(f => form[f] && String(form[f]).trim() !== '');
  const completeness = Math.round((completedFields.length / profileFields.length) * 100);

  const skills = (form.skills || '').split(',').map(s => s.trim()).filter(Boolean);

  if (loading && !profile) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>;
  if (error && !profile) return <Container sx={{ mt: 4 }}><Alert severity="error">{error}</Alert></Container>;

  return (
    <Container component="main" maxWidth="lg" sx={{ my: 4 }}>
      <Paper sx={{ p: 0, borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
        {/* Professional Cover Section */}
        <Box sx={{ 
          height: 250, 
          background: form.role === 'alumni' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : form.role === 'student' 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            opacity: 0.3
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            opacity: 0.2
          }} />
          <Avatar 
            src={picturePreview} 
            sx={{ 
              width: 160, 
              height: 160, 
              position: 'absolute', 
              left: 40, 
              bottom: -80, 
              border: '6px solid white', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              bgcolor: form.role === 'alumni' ? 'primary.main' : form.role === 'student' ? 'secondary.main' : 'warning.main',
              zIndex: 2
            }} 
            alt="Profile picture" 
          />
          <Box sx={{ position: 'absolute', right: 40, top: 20 }}>
            <Button 
              variant="contained" 
              component="label" 
              startIcon={<AddIcon />}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                backdropFilter: 'blur(10px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              Change Photo
              <input type="file" accept="image/*" hidden onChange={handlePictureChange} />
            </Button>
          </Box>
        </Box>

        <Box sx={{ pt: 12, px: 4, pb: 4 }}>
          {/* Profile Header */}
          <Box sx={{ mb: 4, textAlign: 'left' }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
              {form.first_name} {form.last_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="h6" color="text.secondary">
                @{form.username}
              </Typography>
              <Chip 
                label={form.role === 'alumni' ? 'Alumni' : form.role === 'student' ? 'Student' : 'Admin'}
                color={form.role === 'alumni' ? 'primary' : form.role === 'student' ? 'secondary' : 'warning'}
                variant="filled"
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {form.job_title && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WorkIcon color="primary" fontSize="small" />
                  <Typography variant="body1" color="primary.main" sx={{ fontWeight: 500 }}>
                    {form.job_title} {form.company && `at ${form.company}`}
                  </Typography>
                </Box>
              )}
              {form.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {form.location}
                  </Typography>
                </Box>
              )}
              {form.graduation_year && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SchoolIcon color="action" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Class of {form.graduation_year}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Profile Completeness */}
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: 'none' }}>
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                    Profile Completeness
                  </Typography>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                    {completeness}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={completeness} 
                  sx={{ 
                    height: 10, 
                    borderRadius: 5,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      background: form.role === 'alumni' 
                        ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        : form.role === 'student' 
                        ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                    }
                  }} 
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Complete your profile to increase visibility and networking opportunities
                </Typography>
              </CardContent>
            </Card>
          </Box>

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
                   color: form.role === 'alumni' ? 'primary.main' : form.role === 'student' ? 'secondary.main' : 'warning.main'
                 },
                 '& .MuiTabs-indicator': {
                   height: 3,
                   borderRadius: '3px 3px 0 0',
                   background: form.role === 'alumni' 
                     ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                     : form.role === 'student' 
                     ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                     : 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)'
                 }
               }}
             >
               <Tab label="About" />
               <Tab label="Experience & Skills" />
               <Tab label="Contact & Social" />
               <Tab label="My Posts" />
             </Tabs>
          </Box>

          <form onSubmit={handleSubmit}>
            {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* About Tab */}
            {activeTab === 0 && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <CardHeader 
                      title="About Me" 
                      titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                    />
                    <CardContent>
                      <TextField 
                        name="bio" 
                        label="Tell us about yourself" 
                        multiline 
                        rows={6} 
                        value={form.bio || ''} 
                        onChange={handleChange} 
                        fullWidth 
                        error={!!fieldErrors.bio} 
                        helperText={fieldErrors.bio || "Share your story, interests, and what makes you unique"}
                        placeholder="I'm passionate about technology and love connecting with fellow alumni..."
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <CardHeader 
                      title="Contact Information" 
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    />
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <EmailIcon color="primary" fontSize="small" />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            wordBreak: 'break-all',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: { xs: '200px', sm: '250px', md: '300px' }
                          }}
                        >
                          {form.email}
                        </Typography>
                      </Box>
                      <TextField
                        name="phone"
                        label="Phone Number"
                        value={form.phone || ''}
                        onChange={handleChange}
                        fullWidth
                        error={!!fieldErrors.phone}
                        helperText={fieldErrors.phone}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        name="location"
                        label="Location"
                        value={form.location || ''}
                        onChange={handleChange}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Experience & Skills Tab */}
            {activeTab === 1 && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 3 }}>
                    <CardHeader 
                      title={form.role === 'student' ? 'Experience & Activities' : 'Professional Experience'} 
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    />
                    <CardContent>
                      <TextField
                        name="job_title"
                        label={form.role === 'student' ? 'Current Position or Internship' : 'Current Position'}
                        value={form.job_title || ''}
                        onChange={handleChange}
                        fullWidth
                        error={!!fieldErrors.job_title}
                        helperText={fieldErrors.job_title}
                        sx={{ mb: 2 }}
                      />
                      <TextField
                        name="company"
                        label={form.role === 'student' ? 'Institution/Company' : 'Company'}
                        value={form.company || ''}
                        onChange={handleChange}
                        fullWidth
                        error={!!fieldErrors.company}
                        helperText={fieldErrors.company}
                        sx={{ mb: 2 }}
                      />
                      <TextField 
                        name="experience" 
                        label={form.role === 'student' ? 'Experience & Activities Details' : 'Experience Details'} 
                        multiline 
                        rows={4} 
                        value={form.experience || ''} 
                        onChange={handleChange} 
                        fullWidth 
                        error={!!fieldErrors.experience} 
                        helperText={
                          fieldErrors.experience 
                            || (form.role === 'student' 
                                  ? 'Clubs, projects, internships, volunteer work, responsibilities and achievements' 
                                  : 'Describe your professional background and achievements')
                        }
                        placeholder={form.role === 'student' 
                          ? 'Project member, ACM club lead, Summer intern at XYZ...' 
                          : 'Previous roles, key achievements, responsibilities...'}
                      />
                    </CardContent>
                  </Card>
                  
                  <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <CardHeader 
                      title="Education" 
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    />
                    <CardContent>
                      <TextField
                        name="graduation_year"
                        label={form.role === 'student' ? 'Expected Graduation Year' : 'Graduation Year'}
                        type="number"
                        value={form.graduation_year || ''}
                        onChange={handleChange}
                        fullWidth
                        error={!!fieldErrors.graduation_year}
                        helperText={fieldErrors.graduation_year || (form.role === 'student' ? 'Enter your expected graduation year (e.g., 2026)' : '')}
                        sx={{ mb: 2 }}
                      />
                      <TextField 
                        name="education" 
                        label={form.role === 'student' ? 'Education Details & Coursework' : 'Education Details'} 
                        multiline 
                        rows={3} 
                        value={form.education || ''} 
                        onChange={handleChange} 
                        fullWidth 
                        error={!!fieldErrors.education} 
                        helperText={fieldErrors.education || (form.role === 'student' ? 'Degree, major, relevant coursework, academic achievements' : 'Degrees, certifications, academic achievements')}
                        placeholder={form.role === 'student' ? 'BSc Computer Science, Data Structures, Algorithms, GPA...' : 'Degree, major, honors, certifications...'}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <CardHeader 
                      title="Skills" 
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    />
                    <CardContent>
                      <TextField 
                        name="skills" 
                        label="Skills (comma-separated)" 
                        value={form.skills || ''} 
                        onChange={handleChange} 
                        fullWidth 
                        error={!!fieldErrors.skills} 
                        helperText={fieldErrors.skills || "List your technical and soft skills"}
                        placeholder="JavaScript, Python, Leadership, Project Management..."
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ mt: 2 }}>
                        {skills.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            No skills listed yet. Add some skills above!
                          </Typography>
                        ) : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {skills.map(skill => (
                              <Chip
                                key={skill}
                                label={skill}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Contact & Social Tab */}
            {activeTab === 2 && (
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <CardHeader 
                      title="Social Links" 
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                      subheader="Connect your professional profiles"
                    />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="LinkedIn Profile"
                            value={socialLinks.linkedin}
                            onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                            fullWidth
                            placeholder="https://linkedin.com/in/yourprofile"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LinkedInIcon color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="GitHub Profile"
                            value={socialLinks.github}
                            onChange={(e) => handleSocialLinkChange('github', e.target.value)}
                            fullWidth
                            placeholder="https://github.com/yourusername"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <GitHubIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="X (Twitter) Profile"
                            value={socialLinks.twitter}
                            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                            fullWidth
                            placeholder="https://x.com/yourusername"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <XIcon sx={{ color: '#000000' }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Personal Website"
                            value={socialLinks.website}
                            onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                            fullWidth
                            placeholder="https://yourwebsite.com"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <WebsiteIcon color="primary" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ boxShadow: 2, borderRadius: 2 }}>
                    <CardHeader 
                      title="Profile Actions" 
                      titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
                    />
                    <CardContent>
                      <Button 
                        variant="text" 
                        color="error" 
                        onClick={() => {
                          setPictureFile(null);
                          setPicturePreview('');
                          setForm(f => ({ ...f, profile_picture: null }));
                        }} 
                        disabled={!picturePreview}
                        startIcon={<DeleteIcon />}
                        fullWidth
                        sx={{ mb: 2 }}
                      >
                        Remove Photo
                      </Button>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Keep your profile updated to connect with more alumni
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
             )}

             {/* My Posts Tab */}
             {activeTab === 3 && (
               <Box>
                 <Card sx={{ boxShadow: 2, borderRadius: 2, mb: 3 }}>
                   <CardHeader 
                     title="My Posts" 
                     titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
                     subheader="Posts you've shared with the alumni community"
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
                           Share your thoughts, experiences, and updates with the alumni community!
                         </Typography>
                       </Box>
                     )}
                   </CardContent>
                 </Card>
               </Box>
             )}

             {/* Save Button */}
             <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
               <Button 
                 type="submit" 
                 variant="contained" 
                 size="large"
                 disabled={loading}
                 sx={{ 
                   px: 6, 
                   py: 1.5, 
                   fontSize: '1.1rem',
                   background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                   '&:hover': {
                     background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                   }
                 }}
               >
                 {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
               </Button>
             </Box>
          </form>
        </Box>
      </Paper>
    </Container>
  );
}

export default ProfilePage;
