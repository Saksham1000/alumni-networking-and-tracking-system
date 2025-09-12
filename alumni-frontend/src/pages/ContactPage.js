import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Paper,
  TextField,
  Button,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Send as SendIcon,
  Support as SupportIcon,
  Business as BusinessIcon,
  School as SchoolIcon
} from '@mui/icons-material';

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Email Us',
      details: ['alumni@newsummitcollege.edu.np', 'support@alumninetwork.edu.np'],
      description: 'Send us an email and we\'ll respond within 24 hours'
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 30, color: 'primary.main' }} />,
      title: 'Call Us',
      details: ['+977-1-XXXXXXX', '+977-98XXXXXXXX'],
      description: 'Available Monday to Friday, 9 AM to 5 PM'
    },
    {
      icon: <LocationIcon sx={{ fontSize: 30, color: 'info.main' }} />,
      title: 'Visit Us',
      details: ['New Summit College', 'Kathmandu, Nepal'],
      description: 'Come visit our campus office'
    },

  ];

  const faqs = [
    {
      question: 'How do I join the alumni network?',
      answer: 'Simply register with your college email and verify your alumni status. Our team will review and approve your membership within 24-48 hours.'
    },
    {
      question: 'Is there a membership fee?',
      answer: 'No, joining our alumni network is completely free. We believe in keeping our community accessible to all graduates.'
    },
    {
      question: 'How can I update my profile information?',
      answer: 'Log into your account and go to your profile page. You can update your information, add social links, and manage your preferences anytime.'
    },
    {
      question: 'Can I post job opportunities?',
      answer: 'Yes! Alumni can post job opportunities, internships, and career advice to help fellow graduates advance their careers.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Paper 
        elevation={0}
        sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h2" sx={{ fontWeight: 700, mb: 3 }}>
              Get in Touch
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, lineHeight: 1.6 }}>
              We're here to help you connect, grow, and succeed in your alumni journey
            </Typography>
            <Chip 
              label="24/7 Support Available" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontSize: '1rem',
                px: 2,
                py: 1
              }} 
            />
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="lg">
        {/* Contact Information Grid */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center', color: 'text.primary' }}>
            Contact Information
          </Typography>
          <Grid container spacing={4}>
            {contactInfo.map((info, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    boxShadow: 2,
                    borderRadius: 3,
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {info.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                      {info.title}
                    </Typography>
                    {info.details.map((detail, idx) => (
                      <Typography key={idx} variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {detail}
                      </Typography>
                    ))}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                      {info.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Contact Form and Additional Info */}
        <Grid container spacing={6} sx={{ mb: 8 }}>
          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SendIcon sx={{ fontSize: 30, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Send us a Message
                  </Typography>
                </Box>
                
                {submitted && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Thank you for your message! We'll get back to you soon.
                  </Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="name"
                        label="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        name="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="subject"
                        label="Subject"
                        value={formData.subject}
                        onChange={handleChange}
                        fullWidth
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="message"
                        label="Message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        fullWidth
                        required
                        variant="outlined"
                        placeholder="Tell us how we can help you..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<SendIcon />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                          }
                        }}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Links and Support */}
          <Grid item xs={12} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 3, mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SupportIcon sx={{ fontSize: 30, color: 'primary.main', mr: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Quick Support
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Account Issues
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Technical Support
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Event Registration
                  </Button>
                  <Button variant="outlined" fullWidth sx={{ justifyContent: 'flex-start' }}>
                    Job Posting Help
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* FAQ Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ fontWeight: 600, mb: 6, textAlign: 'center', color: 'text.primary' }}>
            Frequently Asked Questions
          </Typography>
          <Grid container spacing={4}>
            {faqs.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ boxShadow: 2, borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                      {faq.question}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {faq.answer}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Call to Action */}
        <Paper 
          elevation={3}
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
            Need Immediate Help?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Our support team is standing by to assist you
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              Live Chat Support
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              sx={{ 
                borderColor: 'white',
                color: 'white',
                '&:hover': { 
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Schedule a Call
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ContactPage; 